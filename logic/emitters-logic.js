const emitter = global.emitter;
const memory = global.memory;
const socket = global.socket;
const MultiEmitterOn = require('../function-bloks/multi-emitter-on');


//fans
MultiEmitterOn(['co2_cabinet_new_value', 'hum_bathroom_new_value'], () => {
    global.regulators.fans()
});

//vlv_to_rooms_tob
emitter.on( 'new_value_rec_te_to_rooms_tob' , () => {
    global.regulators.vlv_to_rooms_tob.Refresh()
});
emitter.on( 'vlv_to_rooms_tob_change_output' , () => {
    if (memory.operative.status.vlv_to_rooms_tob) {
        memory.operative.transistorOutput.vlv_to_rooms_tob_open = true;
        memory.operative.transistorOutput.vlv_to_rooms_tob_close = false;
    } else {
        memory.operative.transistorOutput.vlv_to_rooms_tob_open = false;
        memory.operative.transistorOutput.vlv_to_rooms_tob_close = true;
    }
    emitter.emit('transistorOutput_need_write');
});

//burner
emitter.on( 'burner_change_output' , () => {
    emitter.emit('transistorOutput_need_write');
});
emitter.on( 'new_value_te_boiler' , () => {
    global.regulators.boiler.Refresh()
});

//

// emitter.on( 'vlv_to_rooms_tob' , (value) => {
//     global.socket.emit('c02_cabinet_new_value',)
// });