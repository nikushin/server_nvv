const memory = global.memory;
const emitter = global.emitter;
const _ = require('lodash');
const { writeFileSync } = require('fs');

module.exports.ReceiveData = async ({path, value}) => {
    console.log(path, value);
    path = path.slice(7);
    const is_retain = (path.substr(0, 6) === 'retain');


    _.set(memory, path, value);

    //pumps
    if (path.includes('retain.pumps')) {
        emitter.emit('discreteOutput_need_write')
    }

    //boiler
    if (path === 'retain.manual.burner.value' ||
        path === 'retain.manual.burner.mode' ||
        path === 'retain.sp.burner_for_boiler') {
        global.regulators.boiler.Refresh()
    }

    //valves
    if (path === 'retain.manual.vlv_to_rooms_tob.value' ||
        path === 'retain.manual.vlv_to_rooms_tob.mode' ||
        path === 'retain.sp.burner_for_boiler') {
        global.regulators.vlv_to_rooms_tob.Refresh()
    }

    if (path === 'retain.manual.vlv_collector') {
        if (memory.retain.manual.vlv_collector) {
            memory.operative.discreteOutput.vlv_collector_open = true;
            memory.operative.discreteOutput.vlv_collector_close = false;
        } else {
            memory.operative.discreteOutput.vlv_collector_close = true;
            memory.operative.discreteOutput.vlv_collector_open = false;
        }
        emitter.emit('discreteOutput_need_write')
    }

    //fans
    if (path.includes('retain.manual.fans') ||
        path.includes('retain.sp.fans')) {
        global.regulators.fans()
    }

    //flaps
    if (path.includes('retain.sp.flaps')) {
        const path_arr = _.split(path, '.');
        const name = path_arr[path_arr.length-1];
        if (name === 'full_move_time') {
            emitter.emit(name + 'new_full_move_time', value);
        } else {
            emitter.emit(name + '_flap_new_target', value);
        }

    }
    if (path.includes('retain.in_work.flaps')) {
        const path_arr = _.split(path, '.');
        const name = path_arr[path_arr.length-1];
        emitter.emit(name + '_in_work', value)
    }



    //
    if (is_retain) {
        writeFileSync('retain.json', JSON.stringify(memory.retain, null, 2), 'utf8')
    }

};