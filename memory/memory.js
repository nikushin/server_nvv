





module.exports = {
    retain: {
        sp: {
            flaps: {
                full_move_time: 10,
                bathroom_inflow: 0,
                bathroom_exhaust: 0,
                out_inflow: 0,
                out_exhaust: 0,
                cabinet_inflow: 0,
                cabinet_exhaust: 0,
                room2_inflow: 0,
                room2_exhaust: 0,
                kitchen_inflow: 0,
                kitchen_exhaust: 0,
            },

            fans : {
                cabinet_inflow_co2: {1: 800, 2: 1200, 3: 1600,},
                cabinet_exhaust_co2: {1: 800, 2: 1200, 3: 1600,},
                bathroom_inflow_hum: {1: 50, 2: 70, 3: 85,},
                bathroom_exhaust_hum: {1: 50, 2: 70, 3: 85,},
            },
            vlv_to_rooms_tob: 20,
            burner_for_boiler: 60, 
        },
        in_work: {
            flaps: {
                cabinet_inflow: true,
                cabinet_exhaust: true,
                room2_inflow: true,
                room2_exhaust: true,
                kitchen_inflow: true,
                kitchen_exhaust: true,
                bathroom_inflow: true,
                bathroom_exhaust: true,
                out_inflow: true,
                out_exhaust: true,
            }
        },
        pumps: {
            heating: false,
            collector: false,
            pool: false,
            floor: false,
        },
        manual: {
            fans: {
                mode: false,
                inflow_fan_speed: 0,
                exhaust_fan_speed: 0
            },
            vlv_to_rooms_tob: {
                mode: false,
                value: false,
            },
            burner: {
                mode: false,
                value: false,
            },
            vlv_collector: false,
        },
    },
    operative: {
        modbus: {
            te_bathroom: undefined,
            hum_bathroom: undefined,
            light_bathroom: undefined,
            move_bathroom: undefined,
            te_cabinet: undefined,
            hum_cabinet: undefined,
            co2_cabinet: undefined,
            move_cabinet: undefined,
            pde_in_to_out: undefined,
            pde_out_to_in: undefined,
            transformer_cur: undefined,
            te_garage: undefined,
            hum_garage: undefined,
        },
        discreteOutput: {
            pump_heating: false,
            pump_collector: false,
            pump_pool: false,
            pump_floor: false,
            fan_inflow_1: false,
            fan_inflow_2: false,
            fan_inflow_3: false,
            fan_exhaust_1: false,
            fan_exhaust_2: false,
            fan_exhaust_3: false,
            vlv_collector_open: false,
            vlv_collector_close: false,
            bathroom_inflow_open: false,
            bathroom_inflow_close: false,
            bathroom_exhaust_open: false,
            bathroom_exhaust_close: false,
            out_inflow_open: false,
            out_inflow_close: false,
            out_exhaust_open: false,
            out_exhaust_close: false,
        },
        transistorOutput: {
            vlv_to_rooms_tob_open: false,
            vlv_to_rooms_tob_close: false,
            cabinet_inflow_open: false,
            cabinet_inflow_close: false,
            cabinet_exhaust_open: false,
            cabinet_exhaust_close: false,
            room2_inflow_open: false,
            room2_inflow_close: false,
            room2_exhaust_open: false,
            room2_exhaust_close: false,
            kitchen_inflow_open: false,
            kitchen_inflow_close: false,
            kitchen_exhaust_open: false,
            kitchen_exhaust_close: false,
            burner: false,
        },
        discreteInput: {
            ls_cabinet_inflow_open: undefined,
            ls_cabinet_inflow_close: undefined,
            ls_cabinet_exhaust_open: undefined,
            ls_cabinet_exhaust_close: undefined,
            ls_room2_inflow_open: undefined,
            ls_room2_inflow_close: undefined,
            ls_room2_exhaust_open: undefined,
            ls_room2_exhaust_close: undefined,
            ls_kitchen_inflow_open: undefined,
            ls_kitchen_inflow_close: undefined,
            ls_kitchen_exhaust_open: undefined,
            ls_kitchen_exhaust_close: undefined,
            ls_bathroom_inflow_open: undefined,
            ls_bathroom_inflow_close: undefined,
            ls_bathroom_exhaust_open: undefined,
            ls_bathroom_exhaust_close: undefined,
            ls_out_inflow_open: undefined,
            ls_out_inflow_close: undefined,
            ls_out_exhaust_open: undefined,
            ls_out_exhaust_close: undefined,
            col_fs_back: undefined,
            fs_v1: undefined,
            voltage_control: undefined,
            water: undefined,
        },
        analog: {
            pe_out_rooms: undefined,
            te_outdoor: undefined,
            te_garret: undefined,
            hum_garret: undefined,
            rec_te_out: undefined,
            rec_te_from_rooms: undefined,
            rec_te_to_rooms: undefined,
            rec_te_to_rooms_tob: undefined,
            col_te_t1: undefined,
            col_te_t2: undefined,
            col_te_sk: undefined,
            col_pe_sk: undefined,
            te_boiler: undefined,
            fire: undefined,
        },
        alarms: {

            database: 0,
            analog_input_module: 0,
            discrete_input_module: 0,
            discrete_output_module: 0,
            rs485: 0,
        },
        flaps: {
            cur_position: {
            },
            alarm: {
            },
            ready: {
            }
        },
        fan: {
            inflow_fan_speed: 0,
            exhaust_fan_speed: 0,
        },
        status: {
            vlv_to_rooms_tob: false,
            burner: false,
        }
    }
};