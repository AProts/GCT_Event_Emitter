const moment = require("moment");
const fs = require('fs');
const chance = require('chance').Chance();
const Json2csvParser = require('json2csv').Parser;
const config = require('./config');
const json2csvParser = new Json2csvParser({ fields: config.fields, header: false, quote: "", delimiter: ";" });

function OldDeviceEventEmitter(deviceId) {

    const events = [];

    let cw_count = 0;
    let hw_count = 0;

    const device_key = deviceId;

    const writeToCSV = (line) => {
        fs.appendFile(config.path, line, encoding = 'utf8', function (err) {
            if (err) throw err;
        });
    };

    const get_STATE_DOORLOCK_CLOSED_Json = (cycle_id) => {
        return { id: ++config.event_id, cycle_id, device_key, name : "STATE_DOORLOCK_CLOSED", ds : "CLOSED", data: {"door_state": "CLOSED"} };
    };

    const get_STATE_DOORLOCK_OPEN_Json = (cycle_id) => {
        return { id: ++config.event_id, cycle_id, device_key, name : "STATE_DOORLOCK_OPEN", ds : "OPEN", data: {"door_state": "OPEN"} };
    };

    const get_CYCLE_START_Json = (cycle_id) => {
        const program_name = chance.pickone(["TOWELS", "TOWELS REWASH", "PILLOW CASES REWASH", "SHEETS", "BLANKETS"]);
        const program_number = chance.integer({ min: 1, max: 5 });
        return { id: ++config.event_id, cycle_id, device_key, name : "CYCLE_START",
            ds : `${program_number},${program_name}`, data: { program_name, program_number } };
    };

    const get_CYCLE_STOP_Json = (cycle_id) => {
        return { id: ++config.event_id, cycle_id, device_key, name : "CYCLE_STOP", ds : 0, data: { termination: 0 } };
    };

    const get_BW_RESET_REQ_Json = (cycle_id) => {
        return { id: ++config.event_id, cycle_id, device_key, name : "BW_RESET_REQ" };
    };

    const get_SEQ_STEP_START_Json = (cycle_id, seq_step_number) => {
        return { id: ++config.event_id, cycle_id, device_key, name : "SEQ_STEP_START", ds: seq_step_number, data: { seq_step_number } };
    };

    const get_SEQ_STEP_END_Json = (cycle_id, seq_step_number) => {
        return { id: ++config.event_id, cycle_id, device_key, name : "SEQ_STEP_END", ds: seq_step_number, data: { seq_step_number } };
    };

    const get_BW_DOSE_START_Json = (cycle_id, step_number, program_number) => {
        return { id: ++config.event_id, cycle_id, device_key, name : "BW_DOSE_START",
            ds : `${program_number},${step_number}`, data: { step_number, program_number } };
    };

    const get_BW_DOSE_DONE_Json = (cycle_id) => {
        return { id: ++config.event_id, cycle_id, device_key, name : "BW_DOSE_DONE" };
    };

    const get_WATER_COUNT_Json = (cycle_id) => {
        cw_count += chance.integer({ min: 1, max: 20 });
        hw_count += chance.integer({ min: 1, max: 20 });
        return { id: ++config.event_id, cycle_id, device_key, name : "WATER_COUNT", ds : `${cw_count}, ${hw_count}`, data: { cw_count, hw_count } };
    };

    const prepareCycleEvents = (callback) => {
        const cycle_id_internal = config.cycle_id;
        let step_number = 0;
        let seq_step_number = 0;
        const program_number = chance.integer({ min: 1, max: 5 });

        events.push(
            { event: get_STATE_DOORLOCK_CLOSED_Json(cycle_id_internal), delay: 3000 },
            { event: get_CYCLE_START_Json(cycle_id_internal), delay: 3000 },
            { event: get_SEQ_STEP_START_Json(cycle_id_internal, ++seq_step_number), delay: chance.integer({ min: 1000, max: 10000 })});

        const waterCountSignalChance = chance.bool({likelihood: 15});

        if (waterCountSignalChance) events.push({ event: get_WATER_COUNT_Json(cycle_id_internal), delay: chance.integer({ min: 3000, max: 10000 })});

        events.push({ event: get_BW_RESET_REQ_Json(cycle_id_internal), delay: chance.integer({ min: 3000, max: 10000 })});

        if (!waterCountSignalChance) events.push({ event: get_WATER_COUNT_Json(cycle_id_internal), delay: chance.integer({ min: 3000, max: 10000 })});

        if (chance.bool({likelihood: 70})) {
            events.push({ event: get_BW_DOSE_START_Json(cycle_id_internal, ++step_number, program_number),
                delay: chance.integer({ min: 3000, max: 10000 })});
            if (chance.bool({likelihood: 30})) events.push({ event: get_WATER_COUNT_Json(cycle_id_internal), delay: chance.integer({ min: 3000, max: 10000 })});
            events.push({ event: get_BW_DOSE_DONE_Json(cycle_id_internal), delay: chance.integer({ min: 3000, max: 10000 })});
        };

        events.push({ event: get_SEQ_STEP_END_Json(cycle_id_internal, seq_step_number), delay: chance.integer({ min: 3000, max: 10000 })});

        for (let i = 0; i <= chance.integer({ min: 2, max: 6 }); i++) {
            events.push({ event: get_SEQ_STEP_START_Json(cycle_id_internal, ++seq_step_number), delay: chance.integer({ min: 1000, max: 10000 })});

            if (chance.bool({likelihood: 85})) {

                if (chance.bool({likelihood: 50})) {
                    if (chance.bool({likelihood: 10})) events.push({ event: get_BW_RESET_REQ_Json(cycle_id_internal), delay: chance.integer({ min: 3000, max: 10000 })});

                    events.push({ event: get_BW_DOSE_START_Json(cycle_id_internal, ++step_number, program_number),
                        delay: chance.integer({ min: 30000, max: 100000 })});

                    if (chance.bool({likelihood: 50})) events.push({ event: get_WATER_COUNT_Json(cycle_id_internal), delay: chance.integer({ min: 200000, max: 300000 })});

                    events.push({ event: get_BW_DOSE_DONE_Json(cycle_id_internal), delay: chance.integer({ min: 30000, max: 100000 })});
                } else {

                    for (let j = 0; j <= chance.integer({ min: 1, max: 4 }); j++) {

                        events.push({ event: get_WATER_COUNT_Json(cycle_id_internal), delay: chance.integer({ min: 200000, max: 300000 })});
                    };
                }
            };

            events.push({ event: get_SEQ_STEP_END_Json(cycle_id_internal, seq_step_number), delay: chance.integer({ min: 3000, max: 10000 })});
        };

        events.push({ event: get_CYCLE_STOP_Json(cycle_id_internal), delay: chance.integer({ min: 3000, max: 10000 })});
        events.push({ event: get_STATE_DOORLOCK_OPEN_Json(cycle_id_internal), delay: chance.integer({ min: 1000, max: 10000 })});

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

module.exports = OldDeviceEventEmitter;
