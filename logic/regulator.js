const emitter = global.emitter;
const memory = global.memory;
const socket = global.socket;
const _ = require('lodash');

class RegulatorClass {
    constructor(manual_mode_path, manual_sp_path, parameter_path, sp_path, out_path,
                emitter_name, hist = 0.1, mode='heater') {
        this.manual_sp_path = manual_sp_path;
        this.manual_mode_path = manual_mode_path;
        this.parameter_path = parameter_path;
        this.sp_path = sp_path;
        this.emitter_name = emitter_name;
        this.out_path = out_path;
        this.on = false;
        this.hist = hist;
        this.mode = mode;
        emitter.on(emitter_name, () => {
            this.Refresh()
        });
        this.Refresh()
    }

    Refresh = () => {
        const manual_mode = _.get(memory, this.manual_mode_path);
        const manual_sp = _.get(memory, this.manual_sp_path);
        const sp = _.get(memory, this.sp_path);
        const parameter = _.get(memory, this.parameter_path);
        let on = undefined;
        //console.log(this.out_path, parameter);
        if (manual_mode) {
            on = manual_sp
        }
        if (!manual_mode) {
            if (parameter !== undefined) {
                if (on === 'heater') {
                    if (parameter < sp - this.hist) {
                        on = true
                    }
                    if (parameter > sp + this.hist) {
                        on = false
                    }
                }
                if (this.mode === 'cooler') {
                    if (parameter < sp - this.hist) {
                        on = false
                    }
                    if (parameter > sp + this.hist) {
                        on = true
                    }
                }
            } else {
                on = false
            }
        }
        if (on !== this.on) {
            this.on = on;
            _.set(memory, this.out_path, on);
            socket.emit('memory_change', {path: this.out_path, value: on});
            emitter.emit(this.emitter_name, on)
        }
    }
}

module.exports = RegulatorClass;