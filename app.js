const _ = require('lodash');
const fs = require('fs');
const config = require('./config');
const deviceEventEmitterFactory = require('./device-event.emitter.factory');

module.exports.startProcessing = () => {
    if (!fs.existsSync(config.path)) {
        fs.appendFile(config.path, config.fields.join(";"), encoding = 'utf8', function (err) {
            if (err) throw err;
        });
    };

    return _.map(config.devices, deviceEventEmitterFactory.getDeviceEventEmitter);

};

this.startProcessing();
