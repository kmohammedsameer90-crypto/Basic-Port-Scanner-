
const express = require("express");
const net = require("net");
const app = express();

app.use(express.json());
app.use(express.static(__dirname));

const ports = [
    {port: 20, service: "FTP Data"},
    {port: 21, service: "FTP"},
    {port: 22, service: "SSH"},
    {port: 80, service: "HTTP"},
    {port: 443, service: "HTTPS"}
];

function checkPort(host, port) {
    return new Promise(resolve => {
        const socket = new net.Socket();
        let finished = false;

        function finish(status) {
            if (finished) return;
            finished = true;
            socket.destroy();
            resolve(status);
        }

        socket.setTimeout(1500);
        socket.once("connect", () => finish("OPEN"));
        socket.once("error", () => finish("CLOSED"));
        socket.once("timeout", () => finish("CLOSED"));

        socket.connect(port, host);
    });
}

app.post("/scan", async (req, res) => {
    const ip = req.body.ip;

    const validIP = /^(127\.0\.0\.1|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})$/;

    if (typeof ip !== "string" || !validIP.test(ip)) {
        return res.status(400).json({
            error: "Enter an allowed private network IP"
        });
    }

    const results = [];

    for (const item of ports) {
        const status = await checkPort(ip, item.port);
        results.push({
            port: item.port,
            service: item.service,
            status
        });
    }

    const open = results.filter(r => r.status === "OPEN").length;

    res.json({
        ip,
        total: results.length,
        open,
        closed: results.length - open,
        results
    });
});

app.listen(3000, () => {
    console.log("Port Scanner running on port 3000");
});
