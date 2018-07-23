let cycle_id =0;
let event_id = 0;
const DEVICE_TYPES = {
    oldDevice: "OLD",
    newDevice: "NEW"
};
const fields = ['id', 'cycle_id', 'device_key', 'timestamp', 'name', 'ds', 'data'];

module.exports = {
    path: "/home/aprots/WebstormProjects/notifications/log.csv",
    cycle_id,
    event_id,
    DEVICE_TYPES,
    fields,
    devices: [
        {
            type: DEVICE_TYPES.newDevice,
            deviceId: "293:345:6547"
        },
        {
            type: DEVICE_TYPES.newDevice,
            deviceId: "293:330:6060"
        },
        {
            type: DEVICE_TYPES.oldDevice,
            deviceId: "293:445:8888"
        },
        {
            type: DEVICE_TYPES.oldDevice,
            deviceId: "293:445:9999"
        }
        ]
};
