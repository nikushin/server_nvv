(async function () {
  const EventEmitter = require("events");
  //require('./function-bloks/telegram');
  global.emitter = new EventEmitter();
  global.socket = require('socket.io')(8080, {transports: ['polling', 'websocket']});

  global.memory = require('./memory/memory');
  //global.sql = await require('./memory/mysql.js')();
  //await require('./memory/memory_init')();
  await require('./memory/retain-init')();
  await require('./modbus/modbus-tcp');
  // if (process.platform === 'linux') {
    await require('./modbus/modbus-rtu');
  // }

  require('./logic/main'); require('./logic/emitters-logic');
  require('./function-bloks/ciclycalTimer')();
  const {hmi} = require ('./hmi/hmi');
  global.socket.on('connect', socket => {
    hmi(socket);
  });
})();

