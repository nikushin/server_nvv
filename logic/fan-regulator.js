const memory =  global.memory;
const socket = global.socket;

const GetSpeed = (cur_param, sp, cur_fan , hist, cons) => {
    //if (cons) {console.log(cur_param, sp , cur_fan)}
    let result = undefined;
    let isCorrect = true;
    for (let i = 1; i <= Object.keys(sp).length-1; i++) {
        if (sp[i] > sp[i+1]) {isCorrect = false}
    }
    if (cur_param === undefined || !isCorrect) { //если параметр не считан или уставки не верны
        // if (cur_fan !== undefined) {
        //     result = cur_fan
        // } else {
            result = 0
        // }
    } else { //если уставки заданы верно и параметр считан
        //если в зоне гистерезиса

        for (let i = 1; i <= Object.keys(sp).length; i++) {
            if (cur_param > sp[i] - hist && cur_param < sp[i] + hist && (cur_fan < i-1 || cur_fan > i)) {
                result = i
            } else {
                result = cur_fan
            }
        }
        //если вне зоны гистерезиса
        for (let i = 1; i <= Object.keys(sp).length; i++) {
            //if (cons) {console.log(i, sp[i], cur_param, hist)}
            if (i === 1) {
                //if (cons) {console.log(i, cur_param, sp[i], sp[i+1])}
                if (cur_param <= sp[i] - hist) {
                    if (cons) {console.log('0')}
                    result = 0
                }
                if (cur_param >= sp[i] + hist && cur_param <= sp[i+1] - hist) {
                    if (cons) {console.log('1')}
                    result = i
                }
            } else if (i === Object.keys(sp).length) {
                if (cur_param >= sp[i] + hist) {
                    if (cons) {console.log('2')}
                    result = i
                }
            } else {
                if (cur_param >= sp[i] + hist && cur_param <= sp[i+1] - hist) {
                    if (cons) {console.log('3')}
                    result = i
                }
            }
        }
        //if (cons) {console.log('result', result, sp)}
    }
    return result
};

const FanRegulator = () => {
    const manual = memory.retain.manual.fans.mode;
    let new_inflow_speed = undefined;
    let new_exhaust_speed = undefined;
    const cur_inflow_speed =  memory.operative.fan.inflow_fan_speed;
    const cur_exhaust_speed =  memory.operative.fan.exhaust_fan_speed;
    if (manual) {
        const inflow_speed_manual = memory.retain.manual.fans.inflow_fan_speed;
        const exhaust_fan_speed = memory.retain.manual.fans.exhaust_fan_speed;
        new_inflow_speed = inflow_speed_manual;
        new_exhaust_speed = exhaust_fan_speed;
    }
    let cabinet_inflow_request = undefined;
    let cabinet_exhaust_request = undefined;
    let bathroom_inflow_request = undefined;
    let bathroom_exhaust_request = undefined;
    if (!manual) {
        const cur_co2_cabinet = memory.operative.modbus.co2_cabinet;
        const cabinet_inflow_co2_sp = memory.retain.sp.fans.cabinet_inflow_co2;
        const cabinet_exhaust_co2_sp = memory.retain.sp.fans.cabinet_exhaust_co2;
        cabinet_inflow_request = GetSpeed(cur_co2_cabinet, cabinet_inflow_co2_sp, cur_inflow_speed ,10);
        cabinet_exhaust_request = GetSpeed(cur_co2_cabinet, cabinet_exhaust_co2_sp, cur_exhaust_speed ,10);

        const cur_hum_bathroom = memory.operative.modbus.hum_bathroom;
        const bathroom_inflow_hum_sp = memory.retain.sp.fans.bathroom_inflow_hum;
        const bathroom_exhaust_hum_sp = memory.retain.sp.fans.bathroom_exhaust_hum;
        bathroom_inflow_request = GetSpeed(cur_hum_bathroom, bathroom_inflow_hum_sp, cur_inflow_speed ,3);
        bathroom_exhaust_request = GetSpeed(cur_hum_bathroom, bathroom_exhaust_hum_sp, cur_exhaust_speed ,3);
        //console.log(cabinet_inflow_request, bathroom_inflow_request);
        new_inflow_speed = Math.max(cabinet_inflow_request, bathroom_inflow_request);
        new_exhaust_speed = Math.max(cabinet_exhaust_request, bathroom_exhaust_request);
    }
    memory.operative.fan.inflow_fan_speed = new_inflow_speed;
    memory.operative.fan.exhaust_fan_speed = new_exhaust_speed;
    socket.emit('memory_change', {path: 'operative.fan.inflow_fan_speed', value: new_inflow_speed});
    socket.emit('memory_change', {path: 'operative.fan.exhaust_fan_speed', value: new_exhaust_speed});
};

module.exports = FanRegulator;