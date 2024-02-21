const mongoose = require('mongoose');

const processSchema = new mongoose.Schema({
    pid: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    pcpu: {
        type: Number,
        required: true
    },
    pmem: {
        type: Number,
        required: true
    }
});

const Process = mongoose.model('Process', processSchema);

module.exports = Process;