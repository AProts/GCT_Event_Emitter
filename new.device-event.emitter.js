const moment = require("moment");
const fs = require('fs');
const chance = require('chance').Chance();
const config = require('./config');
const Json2csvParser = require('json2csv').Parser;
const json2csvParser = new Json2csvParser({ fields: config.fields, header: false, quote: "", delimiter: ";" });

function NewDeviceEventEmitter(deviceId) {

    const events = [];

    let cw_count = 0;
    let hw_count = 0;

    const device_key = deviceId;

    const writeToCSV = (line) => {
        fs.appendFile(config.path, line, encoding = 'utf8', function (err) {
            if (err) throw err;
        });
    };

    const getSRJson = (cycle_id) => {
        return { id: ++config.event_id, cycle_id, device_key, name : "SENSOR_2", ds : 1 };
    };

    const getPJson = (cycle_id) => {
        return { id: ++config.event_id, cycle_id, device_key, name : "SENSOR_3", ds : "PT3.0S" };
    };

    const getRJson = (cycle_id) => {
        return { id: ++config.event_id, cycle_id, device_key, name : "SENSOR_5", ds : "PT7.0S" };
    };

    const getTJson = (cycle_id) => {
        return { id: ++config.event_id, cycle_id, device_key, name : "SENSOR_4", ds : "PT3.0S" };
    };

    const getWCJson = (cycle_id) => {
        cw_count += chance.integer({ min: 1, max: 20 });
        hw_count += chance.integer({ min: 1, max: 20 });
        return { id: ++config.event_id, cycle_id, device_key, name : "WATER_COUNT", ds : `${cw_count}, ${hw_count}` };
    };

    const getSPJson = (cycle_id) => {
        return { id: ++config.event_id, cycle_id, device_key, name : "SENSOR_2", ds : 0 };
    };

    const prepareCycleEvents = (callback) => {
        const cycle_id_internal = config.cycle_id;
        events.push({ event: getSRJson(cycle_id_internal), delay: 3000},
            { event: getPJson(cycle_id_internal), delay: 4000},
            { event: getRJson(cycle_id_internal), delay: 2000});
        for (let i = 0; i <= chance.integer({ min: 1, max: 4 }); i++) {
            if (chance.bool({likelihood: 70})) {
                events.push({ event: getTJson(cycle_id_internal), delay: chance.integer({ min: 3000, max: 10000 })});
            };

            events.push({ event: getWCJson(cycle_id_internal), delay: chance.integer({ min: 100000, max: 200000 })});

            for (let j = 0; j <= chance.integer({ min: 1, max: 3 }); j++) {
                if (chance.bool({likelihood: 10})) {
                    events.push({ event: getRJson(cycle_id_internal), delay: chance.integer({ min: 10000, max: 10000 })});
                };

                events.push({ event: getWCJson(cycle_id_internal), delay: chance.integer({ min: 200000, max: 300000 })});
            };
        };
        events.push({ event: getSPJson(cycle_id_internal), delay: chance.integer({ min: 10000, max: 100000 })});
        config.cycle_id++;
        callback && callback ();
    };

    const sendCycleEvent = () => {
        let eventData = events.shift();

        if (!eventData) {
            return setTimeout(prepareCycleEvents,chance.integer({ min: 1200000, max: 3600000 }), sendCycleEvent);
        }

        setTimeout((event) => {
            event["timestamp"] = moment.utc().toISOString();
            const csv = json2csvParser.parse(event);
            writeToCSV('\n' + csv);
            console.log(csv);
            sendCycleEvent();
        }, eventData.delay, eventData.event);
    };

    prepareCycleEvents(sendCycleEvent);

};

module.exports = NewDeviceEventEmitter;
