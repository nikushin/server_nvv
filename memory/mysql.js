const mysql = require("mysql2/promise");
const emitter = global.emitter;
try {
module.exports = async function mysql_create_connect () {
    const connection = await mysql.createConnection({
    // const connection = await mysql.createPool({
    host: "127.0.0.1",
    // database: 'main',
    //user: process.platform === 'linux' ? "admin" : 'root',
    user: 'root',
    password: "83528352",
    //timezone: 'utc'
  });

    await connection.query("CREATE DATABASE IF NOT EXISTS nvv");

    await connection.query("USE nvv");

    const refresh_sql = () => {
        setTimeout(refresh_sql, 1000*60*60);
        connection.query("USE nvv");
    };
    refresh_sql();

        await connection.query(`CREATE TABLE IF NOT EXISTS flaps 
            (full_move_time TINYINT UNSIGNED,
             bathroom_inflow TINYINT UNSIGNED,
             bathroom_exhaust TINYINT UNSIGNED,
             out_inflow TINYINT UNSIGNED,
             out_exhaust TINYINT UNSIGNED,
             cabinet_inflow TINYINT UNSIGNED,
             cabinet_exhaust TINYINT UNSIGNED,
             room2_inflow TINYINT UNSIGNED,
             room2_exhaust TINYINT UNSIGNED,
             kitchen_inflow TINYINT UNSIGNED,
             kitchen_exhaust TINYINT UNSIGNED
             )`).then(
            async (result) => {if (result[0].warningStatus === 0) {
                await connection.query(`INSERT flaps
                (full_move_time, bathroom_inflow, bathroom_exhaust, out_inflow, out_exhaust, 
                cabinet_inflow, cabinet_exhaust, room2_inflow, room2_exhaust, kitchen_inflow, kitchen_exhaust) 
                   VALUES (90,0,0,0,0,0,0,0,0,0,0)`);
            }});

    await connection.query(`CREATE TABLE IF NOT EXISTS test 
            (
             memory JSON NOT NULL
             )`);


    return connection
};
}  catch (err) {
    emitter.emit('alarms', {name:'database', status: 2})
}

