const { readFileSync, writeFileSync, existsSync, statSync } = require('fs');
//const retain = require('../retain.json');
module.exports = function RetainInit() {
    try {
        statSync('retain.json', (err, stat) => console.log(err, stat));
        global.memory.retain = JSON.parse(readFileSync('retain.json'));
    } catch (e) {
        writeFileSync('retain.json', JSON.stringify(global.memory.retain, null, 2), 'utf8')
    }
};