// const {emitter} = require("../server");
// const emitter = global.e
// const {vds} = require('../equipment/ATV');
const ModbusRTU = require("modbus-serial");
const Modbusclient = new ModbusRTU();
Modbusclient.setTimeout(300);

module.exports = function modbusCreate() {
    modbusInit();
};

let timeoutAnalogInputModule = undefined;
let timeoutVdsInvertor = undefined;

let old_temp_beans = undefined;
let old_temp_beans_time = undefined;

const readStack = [
		async () => {
        Modbusclient.setID(1);
        await Modbusclient.readHoldingRegisters(3201, 2).then((data) => { //3201
			clearTimeout(timeoutVdsInvertor);
            //console.log(data.data[0], data.data[1]);
            //global.vds.statusFeedBack(data.data[0] * 5);
        })
        //.catch(err=>{}
            .catch(err => {
                console.log('1 ' + err.message)
            });
    }, 
    async () => {
        Modbusclient.setID(16);
        await Modbusclient.readHoldingRegisters(1, 7).then((data) => {
            clearTimeout(timeoutAnalogInputModule);
            if (global.memory.operative.alarms.analog_input_module === 2) {
                global.emitter.emit('alarms', {name:'analog_input_module', status: 1})
            }
            const temp_beans_time = data.data[2];
            if (old_temp_beans_time !== temp_beans_time) {
                const temp_beans = data.data[0]/100;
                const time = Date.now() - global.memory.history.date_start;
                const temp_beans_history = global.memory.history.temp_beans_history;
                temp_beans_history.push([temp_beans, temp_beans_time, time]);
                if (temp_beans_history.length > 50 && !global.steps.roast.status) {
                    for (let i = 0; i <= 20; i++) {
                        temp_beans_history.shift();
                    }
				}
                const number = 2;
                let temp_beans_filtered = 0;
                if (temp_beans_history.length > number) {
                    for (let i = 0; i <= number - 1;  i++) {
                        temp_beans_filtered += temp_beans_history[temp_beans_history.length-1-number][0];
                    }
                    temp_beans_filtered /= number;
                } else {
                    temp_beans_filtered = temp_beans
                }
                global.memory.operative.temp_beans = +temp_beans_filtered.toFixed(2);


                old_temp_beans_time = temp_beans_time;
                global.emitter.emit('temp_beans_new_value');
            }
            global.memory.operative.temp_air = +(data.data[6]/10).toFixed(2); 

        }).catch(err => {
            timeoutAnalogInputModule = setTimeout(
                () => global.emitter.emit('alarms', {name:'analog_input_module', status: 2}), 5000);
            console.log('err read temp ', err.message)
        });
    },
];

const writeStack = [];

let n = 0;
const readModbus = async () => {
    if (writeStack.length !== 0) {
        await writeStack[0]();
        writeStack.shift()
    } else {
        if (++n > readStack.length - 1) {
            n = 0
        }
        await readStack[n]();
    }
    setTimeout(readModbus, 100);
    // await readModbus()
};

function modbusInit() {
    //Modbusclient.connectRTUBuffered('/dev/ttyUSB0', {baudRate: 19200, parity: "even", dataBits: 8, stopBits: 1 }, (err) => {
    //Modbusclient.connectRTUBuffered('/dev/serial0', {baudRate: 9600, parity: "even", dataBits: 8, stopBits: 1 }, (err) => {
    // Modbusclient.connectRTUBuffered('COM30', {baudRate: 19200, parity: "even", dataBits: 8, stopBits: 1 }, (err) => {
    //Modbusclient.connectRTUBuffered('COM31', {baudRate: 9600, parity: "even", dataBits: 8, stopBits: 1 }, (err) => {
    //Modbusclient.connectRTUBuffered('/dev/ttyAMA1', {
	Modbusclient.connectRTUBuffered('/dev/ttyS0', {
        baudRate: 19200,
        parity: "even",
        dataBits: 8,
        stopBits: 1
    }, (err) => {
        if (err) {
            global.emitter.emit('alarms', {name:'rs485', status: 2});
            console.log(err);
            setTimeout(modbusInit, 4000);
            return
        }
        global.emitter.emit('alarms', {name:'rs485', status: 1});
        readModbus();
    })
}

global.emitter.on('vds_set_fr', (data) => {
    //console.log(data);
    while (writeStack.length > 3) {
        writeStack.pop();
    }
    writeStack.push(
        async () => {
            console.log('vds_set_fr ', data);
            Modbusclient.setID(1);
            await Modbusclient.writeRegisters(8502, [data*5])
                .then( () => {
                        global.emitter.emit('alarms', {name:'vds_invertor', status: 1})
                    }
                )
                .catch((err) => {
                timeoutVdsInvertor = setTimeout(
                    () => global.emitter.emit('alarms', {name:'vds_invertor', status: 2}), 5000);
                console.log(err.message)
            })
        })
});