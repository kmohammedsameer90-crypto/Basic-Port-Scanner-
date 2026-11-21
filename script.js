
async function scanPorts() {
    const ip = document.getElementById("ip").value.trim();
    const results = document.getElementById("results");

    results.innerHTML = "Scanning...";

    try {
        const response = await fetch("/scan", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ip})
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Scan failed");
        }

        let html = `
            <h3>Target IP: ${data.ip}</h3>
            <p>Total Scanned: ${data.total}</p>
            <p>Open Ports: ${data.open}</p>
            <p>Closed Ports: ${data.closed}</p>
            <h3>PORT STATUS</h3>
        `;

        data.results.forEach(port => {
            html += `<p>${port.port} - ${port.service} - ${port.status}</p>`;
        });

        results.innerHTML = html;

    } catch (error) {
        results.textContent = "Error: " + error.message;
    }
}
