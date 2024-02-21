const express = require("express");
require('dotenv').config();
require('./db/conn');
const si = require("systeminformation");
const Process = require('./models/processSchema');
const path = require('path')
const axios = require('axios');
const app = new express();
const port = 4000;

app.use(express.json())
app.use(express.static(path.join(__dirname, "public")));


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
})

app.get('/cpuLoad', async(req, res)=>{
    try {
        const cpuLoad = await si.currentLoad();
        res.json(cpuLoad.currentLoad)
    } catch(error) {
        console.error("Error fetching CPU load:", error);
        res.status(500).json({ error: "Internal server error" });
    }
})

app.get('/cpuInfo', async (req, res) => {
    try {
        const cpuInfo = await si.cpu();
        res.json(cpuInfo)
    } catch(error) {
        console.error("Error fetching CPU info:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.get('/memoryInfo', async (req, res) => {
    try {
        const memoryInfo = await si.mem();
        res.json(memoryInfo);
    } catch(error) {
        console.error("Error fetching memory info:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.get('/processes', async (req, res) => {
    try {
      const processes = await si.processes()
      .then(data => {
            const safetokill = data.list.filter(process=>{
                return process.user !== 'root' && process.user !== 'SYSTEM' && process.cpu > 1;;
            })
            return safetokill
        });
      // Assuming `Process` model has fields: pid, name, pcpu, pmem
      const saved = await Promise.all(processes.map( async process=>{
        const newProcess = new Process({
            pid: process.pid,
            name: process.name,
            pcpu: process.cpu,
            pmem: process.mem
          });
          await newProcess.save();
          return newProcess;
      }))
      console.log(saved);
      res.json(saved);
    } catch (error) {
      console.error("Error fetching processes:", error);
      res.status(500).json({ error: "Internal server error" });
    }
});



app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
})