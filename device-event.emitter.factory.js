const NewDeviceEventEmitter = require('./new.device-event.emitter');
const OldDeviceEventEmitter = require('./old.device-event.emitter');
const config = require('./config');

module.exports.getDeviceEventEmitter = (deviceConfig) => {
    return deviceConfig.type === config.DEVICE_TYPES.newDevice ? new NewDeviceEventEmitter(deviceConfig.deviceId):
        new OldDeviceEventEmitter(deviceConfig.deviceId);
};
