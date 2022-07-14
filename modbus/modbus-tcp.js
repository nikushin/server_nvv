const ModbusRTU = require("modbus-serial");
const emitter = global.emitter;
const memory = global.memory;
const socket = global.socket;

const clientTransistor = new ModbusRTU();
clientTransistor.setTimeout(100);
const clientDiscreteOutput = new ModbusRTU();
clientDiscreteOutput.setTimeout(100);
const clientDiscreteInput = new ModbusRTU();
clientDiscreteInput.setTimeout(100);
const clientAnalog1 = new ModbusRTU();
clientAnalog1.setTimeout(100);
const clientAnalog2 = new ModbusRTU();
clientAnalog2.setTimeout(100);

const analog1ModuleAddress = '127.0.0.95'; // 192.168.10.95
const analog2ModuleAddress = '127.0.0.96'; //192.168.10.96
const discreteInputModuleAddress = '127.0.0.97'; //192.168.10.97
const transistorModuleAddress = '127.0.0.98'; // 192.168.10.98
const discreteOutputModuleAddress = '127.0.0.99'; //192.168.10.99

const transistorData = ['vlv_to_rooms_tob_open', 'vlv_to_rooms_tob_close', 'cabinet_inflow_open', 'cabinet_inflow_close',
                        'cabinet_exhaust_open', 'cabinet_exhaust_close', 'room2_inflow_open', 'room2_inflow_close',
                        'room2_exhaust_open', 'room2_exhaust_close', 'kitchen_inflow_open', 'kitchen_inflow_close',
                        'kitchen_exhaust_open', 'kitchen_exhaust_close', 'burner', undefined,
                        ];
const discreteOutputData1 = ['pump_heating', 'pump_col', 'pump_pool', 'pump_floor',
    'fan_inflow_1', 'fan_inflow_2', 'fan_inflow_3', 'fan_exhaust_1',
    'fan_exhaust_2', 'fan_exhaust_3', 'vlv_collector_open', 'vlv_collector_close',
    'bathroom_inflow_open', 'bathroom_inflow_close', 'bathroom_exhaust_open', 'bathroom_exhaust_close'
];
const discreteOutputData2 = ['out_inflow_open', 'out_inflow_close', 'out_exhaust_open', 'out_exhaust_close'];
const discreteInputData1 = ['ls_cabinet_inflow_open', 'ls_cabinet_inflow_close',
                            'ls_cabinet_exhaust_open', 'ls_cabinet_exhaust_close',
                            'ls_room2_inflow_open', 'ls_room2_inflow_close',
                            'ls_room2_exhaust_open', 'ls_room2_exhaust_close',
                            'ls_kitchen_inflow_open', 'ls_kitchen_inflow_close',
                            'ls_kitchen_exhaust_open', 'ls_kitchen_exhaust_close',
                            'ls_bathroom_inflow_open', 'ls_bathroom_inflow_close',
                            'ls_bathroom_exhaust_open', 'ls_bathroom_exhaust_close',
];
const discreteInputData2 = ['ls_out_inflow_open', 'ls_out_inflow_close',
                            'ls_out_exhaust_open', 'ls_out_exhaust_close',
                            'col_fs_back',  'fs_v1',
                            'voltage_control', 'water'
];

const flagsAnalog1 = {ready: false, tryCon : false};
const flagsAnalog2 = {ready: false, tryCon : false};
const flagsDiscreteInput = {ready: false, tryCon : false};
const flagsDiscreteOutput = {ready: false, tryCon : false, needWrite: false};
const flagsTransistor = {ready: false, tryCon : false, needWrite: false };

//всмогательные функции
const connectAnyModule = async (name, client, flags, address) => {
    flags.ready = false;
    flags.tryCon = true;
    await client.close(() => {
        //console.log('close')
    });

    await client.connectTCP(address, { port: 502 }).then(
        () => {
            emitter.emit('alarms', {name:name, status: 1});
            console.log(`connection successful ${name}`);
            flags.ready = true;
            flags.tryCon = false;
        }
    ).catch(
        (e) => {
            emitter.emit('alarms', {name:name, status: 2});
            //console.log(`connection fail ${name} ` + e);
            setTimeout(() => connectAnyModule(name, client, flags, address), 5000);
        }
    );
};
const wordTobit = (word) => {
    const innerWord = word.toString(2).split('');
    while (innerWord.length < 16) {
        innerWord.unshift(false);
    }
    for (let i = 0; i <= 15; i++) {
        innerWord[i] = (innerWord[i] === "1");
    }
    // console.log(innerInt);
    return innerWord
};

//проверка связи модулей вывода
// let timeOut = undefined;
// const checkConnection = async () => {
//     await clientOutput.readHoldingRegisters(340, 1).then(
//         (data) =>  {
//             //console.log('Проверка модуля вывода прошла успешно');
//             timeOut = setTimeout(checkConnection,5000)
//         }
//     ).catch(
//         (err) => {
//
//             console.log('какая-то ошибка модуля вывода ' + err.err);
//             connectTCPoutput();
//         }
//     )
// };

//эммитеры
emitter.on( 'transistorOutput_need_write' , () => {
    flagsTransistor.needWrite = true
});

emitter.on( 'discreteOutput_need_write' , () => {
    flagsDiscreteOutput.needWrite = true
});

//функции запросов
const readAnalog =  async ({name, client, connect, params}) => {
    await client.readHoldingRegisters(4064, 8).then(
        (data) =>  {
            for (let i = 0; i <= 8; i++) {
                if (params[i] !== undefined) {
                    if (data.data[i] >= 32768) {data.data[i] -= 65536;}
                    data.data[i]/=10;
                    if (memory.operative.analog[params[i]] !== data.data[i]) {
                        memory.operative.analog[params[i]] = data.data[i];
                        //console.log(params[i] , data.data[i]);
                        socket.emit('memory_change', {path: 'operative.analog.' + params[i], value: data.data[i]});
                        emitter.emit('new_value_' + params[i], data.data[i])
                    }
                }
            }
        }
    ).catch(
        (err) => {
            if (client.isOpen) {
                console.log(`соединение не установленно c ${name}, пробуем подключиться, порт открыт + ${err.err}`);
            }
            else {
                console.log(`соединение не установленно c ${name}, пробуем подключиться, порт закрыт + ${err.err}`);
            }
            connect();
        }
    )
};
const readDiscreteInput = async () => {
    await clientDiscreteInput.readHoldingRegisters(51, 2).then(
        (data) =>  {
            const read = (data, word) => {
                for (let i = 0; i <= 15; i++) {
                    if (data[i] !== undefined) {
                        if (memory.operative.discreteInput[data[i]] !== word[15-i]) {
                            memory.operative.discreteInput[data[i]] = word[15-i];
                            emitter.emit(data[i], word[15-i]);
                            //console.log(data[i], word[15-i]);
                        }
                    }
                }
            };
            read(discreteInputData1, wordTobit(data.data[0]));
            read(discreteInputData2, wordTobit(data.data[1]));
        }).catch(
        (err) => {
            if (clientDiscreteInput.isOpen) {
                console.log(`соединение не установленно c DiscreteInput, пробуем подключиться, порт открыт + ${err.err}`);
            }
            else {
                console.log(`соединение не установленно c DiscreteInput, пробуем подключиться, порт закрыт + ${err.err}`);
            }
            connectAnyModule('discreteInputModule', clientDiscreteInput, flagsDiscreteInput, discreteInputModuleAddress)
        }
    )
};
const writeTransistor = async () => {
    console.log('test');
    let data1 = '';
    for (let i = 0; i <= 15; i++) {
        if (memory.operative.transistorOutput[transistorData[i]]) {
            data1 = '1' + data1;
        } else {
            data1 = '0' + data1;
        }
    }
    await clientTransistor.writeRegisters (470, [parseInt(data1, 2)]).then(
        () => flagsTransistor.needWrite = false
    )
};
const writeDiscreteOutput = async () => {
    let data1 = '';
    for (let i = 0; i <= 15; i++) {
        if (memory.operative.discreteOutput[discreteOutputData1[i]]) {
            data1 = '1' + data1;
        } else {
            data1 = '0' + data1;
        }
    }
    let data2 = '';
    for (let i = 0; i <= 15; i++) {
        if (memory.operative.discreteOutput[discreteOutputData2[i]]) {
            data2 = '1' + data2;
        } else {
            data2 = '0' + data2;
        }
    }
    await clientDiscreteOutput.writeRegisters (470, [parseInt(data1, 2), parseInt(data2, 2)]).then(
        () => flagsDiscreteOutput.needWrite = false
    )
};
//функции подключений
const connectAnalog1 = async () => {
    await connectAnyModule(
        'analog1Module', clientAnalog1, flagsAnalog1, analog1ModuleAddress
    )
};
const connectAnalog2 = async () => {
    await connectAnyModule(
        'analog2Module', clientAnalog2, flagsAnalog2, analog2ModuleAddress
    )
};
const connectDiscreteInput = async () => {
    await connectAnyModule(
        'discreteInputModule', clientDiscreteInput, flagsDiscreteInput, discreteInputModuleAddress
    )
};
const connectDiscreteOutput = async () => {
    await connectAnyModule(
        'discreteOutputModule', clientDiscreteOutput, flagsDiscreteOutput, discreteOutputModuleAddress
    )
};
const connectTransistor = async () => {
    await connectAnyModule(
        'transistorModule', clientTransistor, flagsTransistor, transistorModuleAddress
    )
};
//основной цикл
const ModbusTCPloop = async () => {
    //подключение
    if (!flagsTransistor.ready && !flagsTransistor.tryCon) {await connectTransistor()}
    if (!flagsDiscreteOutput.ready && !flagsDiscreteOutput.tryCon) {await connectDiscreteOutput()}
    if (!flagsDiscreteInput.ready && !flagsDiscreteInput.tryCon) {await connectDiscreteInput()}
    if (!flagsAnalog1.ready && !flagsAnalog1.tryCon) {await connectAnalog1()}
    if (!flagsAnalog2.ready && !flagsAnalog2.tryCon) {await connectAnalog2()}
    //чтение/запись
    if (flagsTransistor.needWrite && flagsTransistor.ready) {await writeTransistor()}
    if (flagsDiscreteOutput.needWrite && flagsDiscreteOutput.ready) {await writeDiscreteOutput()}
    if (flagsAnalog1.ready) {await readAnalog(
        {name: 'analog1Module', client: clientAnalog1, connect: connectAnalog1,
            params : ['pe_out_rooms', 'te_outdoor', 'te_garret', 'hum_garret',
                'rec_te_out', 'rec_te_from_rooms', 'rec_te_to_rooms', 'rec_te_to_rooms_tob']}
        );
    }
    if (flagsAnalog2.ready) {await readAnalog(
        {name: 'analog2Module', client: clientAnalog2, connect: connectAnalog2,
            params : ['col_te_t1', 'col_te_t2', 'col_te_sk', 'col_pe_sk',
                'te_boiler', 'fire']}
        );
    }
    if (flagsDiscreteInput.ready) {
        await readDiscreteInput()
    }

    if (!flagsTransistor.ready && !flagsAnalog1.ready && !flagsAnalog2.ready &&
        !flagsDiscreteInput.ready && !flagsDiscreteOutput.ready) {
        setTimeout(() => ModbusTCPloop(), 1000);
    } else {
        setTimeout(() => ModbusTCPloop(), 50);
    }
};

ModbusTCPloop();

module.exports = wordTobit;