const emitter = global.emitter;
const memory = global.memory;
const socket = global.socket;
const _ = require('lodash');

class FlapClass {
    constructor(name_module, name) {
        //console.log(name_module, name);
        this.name = name;
        this.name_module = name_module;  //TransistorOutput //DiscreteOutput

        emitter.on( 'ls_'+this.name+'_open' , (value) => {this.Ls_open(value)});
        emitter.on( 'ls_'+this.name+'_close' , (value) => {this.Ls_close(value)});
        emitter.on( this.name + '_flap_new_target', (target) => {
            this.Change(target)
        });
        emitter.on( this.name + '_alarm_reset', () => {
            this.Alarm(false)
        });

        emitter.on( this.name + '_in_work', (value) => {
            this.InWork(value)
        });

        emitter.on( 'new_full_move_time', (value) => {
           this.full_move_time = value
        });

        emitter.on( 'every_second', () => this.CheckPosition());

        this.busy = false;
        this.dout_open = memory.operative[this.name_module][this.name +'_open'];
        this.dout_close = memory.operative[this.name_module][this.name+ '_close'];
        this.in_work = memory.retain.in_work.flaps[this.name];
        this.full_move_time = memory.retain.sp.flaps.full_move_time;
        this.time_start_move = undefined;
        this.time_move = undefined;
        this.cur_position = undefined;
        this.start_move_position = undefined;
        this.target_position = memory.retain.sp.flaps[this.name];
        this.ready = false;
        this.alarm = false;
        this.alarm_timer  = undefined;
        this.timer  = undefined;
        this.ls_open = memory.operative[this.name_module]['ls_' + this.name + '_open'];
        this.ls_close = memory.operative[this.name_module]['ls_' + this.name + '_close'];

        this.Init();
    }

    Change = (target) => {
        if (target !== undefined) {this.target_position = target}
        if (this.cur_position !== target && this.ready && !this.alarm && this.in_work) {
            if (this.busy) {
                clearTimeout(this.timer);
                this.CheckPosition();
            }
            clearTimeout(this.alarm_timer);
            this.busy = true;
            this.time_start_move = new Date();
            this.start_move_position = this.cur_position;
            this.time_move = this.full_move_time*(Math.abs(this.target_position-this.cur_position))/100;
            if (this.cur_position < target) {this.Command({open:true, close:false})}
            if (this.cur_position > target) {this.Command({open:false, close:true})}
            this.alarm_timer = setTimeout(() => this.Alarm(true), (this.full_move_time + 10)*1000);
            if (target === 0 || target === 100) {
                this.timer = setTimeout(() => this.Move_complete(), (this.full_move_time+10)*1000)
            } else {
                this.timer = setTimeout(() => this.Move_complete(), this.time_move*1000)
            }
        }
        if (!this.ready && !this.alarm && this.in_work) {
            this.Command({open:false, close:true});
            this.alarm_timer = setTimeout(() => this.Alarm(true), (this.full_move_time + 10)*1000);
        }
    };

    CheckPosition = () => {
        if (this.ready && !this.alarm && this.in_work) {
            if (this.dout_open) {
                this.cur_position = this.start_move_position + (new Date() - this.time_start_move)/1000/this.full_move_time*100;
            }
            if (this.dout_close) {
                this.cur_position = this.start_move_position - (new Date() - this.time_start_move)/1000/this.full_move_time*100;
            }
            this.cur_position = _.clamp(this.cur_position, 0, 100);
            if (this.dout_open || this.dout_close) {
                memory.operative.flaps.cur_position[this.name] = this.cur_position;
                socket.emit("memory_change", {path : 'operative.flaps.cur_position.'+ this.name, value: this.cur_position});
            }
        }
    };

    Move_complete = (ls) => {
        this.Command({open:false, close:false});
        if (!ls) {this.cur_position = this.target_position;}
        this.busy = false;
        clearTimeout(this.alarm_timer);
        memory.operative.flaps.cur_position[this.name] = this.cur_position;
        socket.emit("memory_change", {path : 'operative.flaps.cur_position.'+ this.name, value: this.cur_position});
    };

    Init = () => {
        if (this.ls_open) {
            this.cur_position = 100;
            memory.operative.flaps.cur_position[this.name] = 100;
            socket.emit("memory_change", {path : 'operative.flaps.cur_position.'+ this.name, value: this.cur_position});
            this.InitFinish()
        } else if (this.ls_close) {
            this.cur_position = 0;
            memory.operative.flaps.cur_position[this.name] = 0;
            socket.emit("memory_change", {path : 'operative.flaps.cur_position.'+ this.name, value: this.cur_position});
            this.InitFinish()
        } else {
            memory.operative.flaps.ready[this.name] = false;
            socket.emit("memory_change", {path : 'operative.flaps.ready.' + this.name, value: false});
            this.Change();
        }
    };

    InitFinish = () => {
        this.ready = true;
        memory.operative.flaps.ready[this.name] = this.ready;
        socket.emit("memory_change", {path : 'operative.flaps.ready.' + this.name, value: true});
        this.Change(this.target_position);
    };

    Ls_open = (value) => {
        this.ls_open = value;
        if (value && !this.alarm && this.in_work) {
            this.cur_position = 100;
            this.Move_complete(true);
            if (this.cur_position !== this.target_position) {
                this.Change(this.target_position)
            }
        }
        socket.emit("memory_change", {path : `operative.discreteInput.ls_${this.name}_open`, value: value});
    };

    Ls_close = (value) => {
        this.ls_close = value;
        if (value && !this.alarm && this.in_work) {
            this.cur_position = 0;
            this.Move_complete(true);
            if (!this.ready && !this.alarm) {this.InitFinish()}
            if (this.cur_position !== this.target_position) {
                this.Change(this.target_position)
            }
        }
        socket.emit("memory_change", {path : `operative.discreteInput.ls_${this.name}_close`, value: value});
    };

    Command = ({open, close}) => {
        this.dout_open = open;
        this.dout_close = close;
        memory.operative[this.name_module][this.name + 'open'] = this.dout_open;
        memory.operative[this.name_module][this.name + 'close'] = this.dout_close;
        emitter.emit(this.name_module + '_need_write', {open, close});
    };

    Alarm = (value) => {
        memory.operative.flaps.alarm[this.name] = value;
        if (value) {
            clearTimeout(this.timer);
            socket.emit("memory_change", {path : 'operative.flaps.alarm.' + this.name, value: value});
            this.Command({open:false, close:false});
        }
        if (this.alarm && !value) {
            this.alarm = value;
            this.ready = false;
            this.Init();
        }
        this.alarm = value;
    };

    InWork = (value) => {
        this.in_work = value;
        if (!value) {
            clearTimeout(this.timer);
            clearTimeout(this.alarm_timer);
            socket.emit("memory_change", {path : 'operative.flaps.cur_position.'+ this.name, value: undefined});
            this.Command({open:false, close:false});
            memory.operative.flaps.ready[this.name] = false;
            socket.emit("memory_change", {path : 'operative.flaps.ready.' + this.name, value: false});
            memory.operative.flaps.alarm[this.name] = false;
            socket.emit("memory_change", {path : 'operative.flaps.alarm.' + this.name, value: false});
        }

        if (value) {
            this.Init();
        }
    };


}

module.exports = FlapClass;