const sql = global.sql;
const memory = global.memory;
module.exports = async function memoryInit() {
// mysql to memory
    await sql.query(`SELECT full_move_time,
             bathroom_inflow,
             bathroom_exhaust,
             out_inflow,
             out_exhaust,
             cabinet_inflow,
             cabinet_exhaust,
             room2_inflow,
             room2_exhaust,
             kitchen_inflow,
             kitchen_exhaust FROM flaps;`).then(
        result => {
            memory.retain.sp.flaps = result[0][0];
        });

};
