const ModbusRTU = require("modbus-serial");
const emitter = global.emitter;
const memory = global.memory;
const socket = global.socket;

const wordToStringBit = (word) => {
    const innerWord = word.toString(2).split('');
    let innerString = '';
    while (innerWord.length < 16) {
        innerWord.unshift('0');
    }
    for (let i = 0; i <= 15; i++) {
        innerWord[i] === '1' ? innerString += '1' : innerString += '0';
    }
    return innerString
};
const wordToInt = (word) => {
    if (word >= 32768) {
        word -= 65536;
    }
    return word
};


const Modbusclient = new ModbusRTU();
Modbusclient.setTimeout(300);

const flags = {ready: false, tryCon : false};
const WB_bathroom_address = 2;
const WB_cabinet_address = 1;
const pde_in_to_out_address = 3;
const pde_out_to_in_address = 4;
const transformer_address = 5;

const modbusConnect = async () => {
    flags.ready = false; flags.tryCon = true;
    //Modbusclient.connectRTUBuffered('/dev/ttyUSB0', {baudRate: 19200, parity: "even", dataBits: 8, stopBits: 1 }, (err) => {
    //Modbusclient.connectRTUBuffered('/dev/serial0', {baudRate: 9600, parity: "even", dataBits: 8, stopBits: 1 }, (err) => {
    await Modbusclient.connectRTUBuffered('COM30', {baudRate: 9200, parity: "none", dataBits: 8, stopBits: 1 }
    //Modbusclient.connectRTUBuffered('/dev/ttyAMA1', {
    //await Modbusclient.connectRTUBuffered('/dev/ttyS0', {baudRate: 19200, parity: "even", dataBits: 8, stopBits: 1}
    ).then(() => {flags.ready = true; flags.tryCon = false;
    //console.log('порт открыт')
    }
    ).catch(() => {setTimeout(modbusConnect, 4000);
    console.log('порт не открыт')
    })
};
const WB_general_parameters = async ({te, hum, move, light, co2}) => {
    //te 4 hum 5
    await Modbusclient.readInputRegisters(4, 2).then((data) => {
        data.data[0] = wordToInt(data.data[0]);
        data.data[0]/=100;
        if (memory.operative.modbus[te] !== data.data[0]) {
            memory.operative.modbus[te] = data.data[0];
            socket.emit('memory_change', {path: 'operative.modbus.' + te, value: data.data[0]});
        }
        if (memory.operative.modbus[hum] !== data.data[1]) {
            memory.operative.modbus[hum] = data.data[1];
            socket.emit('memory_change', {path: 'operative.modbus.' + hum, value: data.data[1]});
        }
    })
        .catch(err => {
            console.log('te,hum', Modbusclient.getID() ,  err.message)
        });
    //light 9-10
    if (light) {
        await Modbusclient.readInputRegisters(9, 2).then((data) => {
            const string2word = wordToStringBit(data[0]) + wordToStringBit(data[1]);
            const new_val = parseInt(string2word, 2)/100;
            if (memory.operative.modbus[light] !== new_val) {
                memory.operative.modbus[light] = new_val;
                socket.emit('memory_change', {path: 'operative.modbus.' + light, value: memory.operative.modbus[light]});
            }
        }).catch(err => {
            console.log('light', Modbusclient.getID() , err.message)
        });
    }
    //move 283
    await Modbusclient.readInputRegisters(283, 1).then((data) => {
        if (memory.operative.modbus[move] !== data[0]) {
            memory.operative.modbus[move] = data[0];
            socket.emit('memory_change', {path: 'operative.modbus.' + move, value: data[0]});
        }
    }).catch(err => {
        console.log('move', Modbusclient.getID(), err.message)
    });
    //co2 8
    if (co2) {
        await Modbusclient.readInputRegisters(8, 1).then((data) => {
            const co2_value = data.data[0];
            if (memory.operative.modbus[co2] !== co2_value) {
                memory.operative.modbus[co2] = co2_value;
                emitter.emit(co2 + '_new_value', co2_value);
                socket.emit('memory_change', {path: 'operative.modbus.' + co2, value: co2_value});
            }

        }).catch(err => {
            console.log('co2', Modbusclient.getID(),  err.message)
        });
    }
};
const WB_bathroom_read = async () => {
    Modbusclient.setID(WB_bathroom_address);
    await WB_general_parameters({te:'te_bathroom', hum: 'hum_bathroom', light: 'light_bathroom', move: 'move_bathroom'})
};
const WB_cabinet_read = async () => {
    Modbusclient.setID(WB_cabinet_address);
    await WB_general_parameters({te:'te_cabinet', hum: 'hum_cabinet', co2: 'co2_cabinet', move: 'move_bathroom'})
};

const PDD_general_parameters = async ({address, parameter}) => {
    Modbusclient.setID(address);
    //pdd 1 // ok 3 (0 - ok)
    await Modbusclient.readInputRegisters(1, 3).then((data) => {
        if (data.data[2] === 1) {
            data.data[0] = wordToInt(data.data[0]);
            if (memory.operative.modbus[parameter] !== data.data[0]) {
                memory.operative.modbus[parameter] = data.data[0];
                socket.emit('memory_change', {path: 'operative.modbus.' + parameter, value: data.data[0]});
            }
        }
    })
        .catch(err => {
            console.log('PDD', err.message)
        });
};

const Transformer_read = async () => {
    Modbusclient.setID(transformer_address);
    await Modbusclient.readInputRegisters(256, 1).then((data) => {
        const str = data.data[0].toString();
        const exp = str[str.length-1];
        const mantissa = str.slice(0, -1);
        const cur = mantissa*Math.pow(10, exp-5);
        if (memory.operative.modbus.transformer_cur !== cur) {
            memory.operative.modbus.transformer_cur = cur;
            socket.emit('memory_change', {path: 'operative.modbus.transformer_cur', value: cur});
        }
    })
        .catch(err => {
            console.log('Transformer', err.message)
        });
};

const ModbusRTUloop = async () => {
    if (!flags.ready && !flags.tryCon) {await modbusConnect()}
    if (flags.ready) {
        //await WB_bathroom_read();
        //await WB_cabinet_read();
        //await PDD_general_parameters({address: pde_in_to_out_address, parameter: 'pde_in_to_out'});
        //await PDD_general_parameters({address: pde_out_to_in_address, parameter: 'pde_out_to_in'});
        //await Transformer_read();
    }
    setTimeout(() => ModbusRTUloop(), 2000);
};
ModbusRTUloop();