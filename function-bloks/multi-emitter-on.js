const emitter = global.emitter;

const MultiEmitterOn = (names, f) => {
    names.forEach( (cur, index) => {
        emitter.on(names[index], (data) => f(data))
    })
};

module.exports = MultiEmitterOn;
