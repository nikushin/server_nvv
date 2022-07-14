FlapClass = require('./flap');
RegulatorClass = require('./regulator');
FanRegulator = require('./fan-regulator');


global.flaps = {};
global.flaps.bathroom_inflow = new FlapClass('discreteOutput','bathroom_inflow');
global.flaps.bathroom_exhaust = new FlapClass('discreteOutput','bathroom_exhaust');
global.flaps.out_inflow = new FlapClass('discreteOutput','out_inflow');
global.flaps.out_exhaust = new FlapClass('discreteOutput','out_exhaust');
global.flaps.cabinet_inflow = new FlapClass('transistorOutput','cabinet_inflow');
global.flaps.cabinet_exhaust = new FlapClass('transistorOutput','cabinet_exhaust');
global.flaps.room2_inflow = new FlapClass('transistorOutput','room2_inflow');
global.flaps.room2_exhaust = new FlapClass('transistorOutput','room2_exhaust');
global.flaps.kitchen_inflow = new FlapClass('transistorOutput','kitchen_inflow');
global.flaps.kitchen_exhaust = new FlapClass('transistorOutput','kitchen_exhaust');

global.regulators = {};
global.regulators.vlv_to_rooms_tob = new RegulatorClass(
    'retain.manual.vlv_to_rooms_tob.mode',
    'retain.manual.vlv_to_rooms_tob.value',
    'operative.analog.rec_te_to_rooms_tob',
    'retain.sp.vlv_to_rooms_tob',
    'operative.status.vlv_to_rooms_tob',
    'vlv_to_rooms_tob_change_output',
    0.1,
    'cooler'
    );

global.regulators.boiler = new RegulatorClass(
    'retain.manual.burner.mode',
    'retain.manual.burner.value',
    'operative.analog.te_boiler',
    'retain.sp.burner_for_boiler',
    'operative.status.boiler',
    'burner_change_output',
    0.1,
    'heater'
);


global.regulators.fans = FanRegulator;
global.regulators.fans();