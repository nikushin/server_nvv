const emitter = global.emitter;

const start_data = Date.now();
const interval = 1*1000;
let drift = 0;
let sum_time = 0;

const loop = () => {
  drift = (Date.now() - start_data) - sum_time;
  setTimeout(loop, (interval - drift));
  sum_time += interval;
  //console.log('loop ', Date.now() - start_data);
  emitter.emit('every_second');
};

module.exports = loop;

