const {ReceiveData} =  require('./receive-data');
const memory = global.memory;
const emitter = global.emitter;
const sql = global.sql;

module.exports.hmi = async function hmi (socket) {

  socket.emit("memory_init", memory);

  socket.on('hmi_data_change', (data) => {
    //console.log(data);
    ReceiveData(data)
  });


  socket.on('logs', (data) => {
    console.log('log', data)
  });

  socket.emit("alarms", global.memory.operative.alarms);

};
