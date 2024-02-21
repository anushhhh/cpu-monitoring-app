document.addEventListener("DOMContentLoaded", function () {
    fetchData();
});

// Function to fetch CPU load
function getCpuLoad() {
    async function fetchCPULoad() {
        try {
            const response = await fetch("/cpuLoad");
            const data = await response.json();
            const cpuLoadValue = parseInt(data);
            document.getElementById("cpuLoadValue").textContent = `${cpuLoadValue}%`;
            const progressBar = document.getElementById("cpuLoadProgressBar");
            progressBar.style.width = `${cpuLoadValue}%`;
            progressBar.setAttribute("aria-valuenow", cpuLoadValue);
        } catch (error) {
            console.error("Error fetching CPU load:", error);
        }
    }
    fetchCPULoad();
    setInterval(()=>{
        fetchCPULoad()
    }, 3000)
}


// Function to fetch CPU information
function getCpuInfo() {
    async function fetchCPUInfo() {
        try {
            const response = await fetch("/cpuInfo");
            const data = await response.json();
            document.getElementById("manufacturer").textContent = data.manufacturer || "N/A";
            document.getElementById("brand").textContent = data.brand || "N/A";
            document.getElementById("cores").textContent = data.cores || "N/A";
            document.getElementById("physicalCores").textContent = data.physicalCores || "N/A";
            document.getElementById("vendor").textContent = data.vendor || "N/A";
            document.getElementById("speed").textContent = data.speed || "N/A";
            document.getElementById("virtualization").textContent = data.virtualization ? "Enabled" : "Disabled";
        } catch (error) {
            console.error("Error fetching CPU information:", error);
        }
    }
    fetchCPUInfo();
}


// Function to fetch memory information
function getMemoryInfo() {
    async function fetchMemoryInfoChart() {
        try {
            const response = await fetch("/memoryInfo")
            .then(response => response.json())
            .then(data => {
                renderMemoryChart(data);
            })
            .catch(error => console.error("Error fetching memory information:", error));
        } catch (error) {
            console.error("Error fetching memory information:", error);
        }
    }

    async function fetchMemoryInfo() {
        try {
            const response = await fetch("/memoryInfo")
            const data = await response.json();
            document.getElementById("totalMemory").textContent = (data.total / 1024 / 1024 / 1024).toFixed(2) + " GB" || "N/A";
            document.getElementById("freeMemory").textContent = (data.free / 1024 / 1024 / 1024).toFixed(2) + " GB" || "N/A";
            document.getElementById("usedMemory").textContent = (data.used / 1024 / 1024 / 1024).toFixed(2) + " GB" || "N/A";
            document.getElementById("activeMemory").textContent = (data.active / 1024 / 1024 / 1024).toFixed(2) + " GB" || "N/A";
            document.getElementById("buffersMemory").textContent = (data.buffers / 1024 / 1024 / 1024).toFixed(2) + " GB" || "N/A";
            document.getElementById("cachedMemory").textContent = (data.cached / 1024 / 1024 / 1024).toFixed(2) + " GB" || "N/A";
        } catch (error) {
            console.error("Error fetching memory information:", error);
        }
    }
    fetchMemoryInfoChart();
    fetchMemoryInfo();
    
    setInterval(()=>{
        fetchMemoryInfo()
    }, 3000)
}


// Function to fetch processes
function getProcesses(){
    async function fetchProcesses() {
        try {
            const response = await fetch("/processes");
            const data = await response.json();
            const processesTableBody = document.getElementById("processesTableBody");
            processesTableBody.innerHTML = ""; // Clear previous content
    
            data.forEach(process => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${process.pid}</td>
                    <td>${process.name}</td>
                    <td>${process.pcpu.toFixed(2)}</td>
                    <td>${(process.pmem / 1024).toFixed(2)}</td>
                `;
                processesTableBody.appendChild(row);
            });
        } catch (error) {
            console.error("Error fetching processes:", error);
        }
    }
    fetchProcesses();
    setInterval(()=>{
        fetchProcesses()
    }, 100000)
}

function renderMemoryChart(memoryInfo) {
    const ctx = document.getElementById('memoryChart').getContext('2d');
    const labels = ['Used', 'Free', 'Active', 'Buffers', 'Cached'];
    const colors = ['#E493B3', '#BFEA7C', '#8E7AB5', '#4CAF50', '#FF9800'];
    const data = [memoryInfo.used, memoryInfo.free, memoryInfo.active, memoryInfo.buffers, memoryInfo.cached];

    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors
            }]
        },
        options: {
            plugins: {
                legend: {
                  position: 'left',
                }
            },
            responsive: true,
            title: {
                display: true,
                text: 'Memory Information'
            },
            maintainAspectRatio: false,
        }
    });
}

// Fetch all data in parallel
async function fetchData() {
    await Promise.all([getCpuLoad(), getCpuInfo(), getMemoryInfo(), getProcesses()]);
}
