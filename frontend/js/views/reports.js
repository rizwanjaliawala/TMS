window.renderReports = async function () {
    mainContent.innerHTML = `
        <h1>Reports</h1>
        <div class="flex-row" style="margin-bottom: 20px; flex-wrap: wrap;">
            <button class="btn-primary" onclick="renderDriverPerformance()">Driver Performance</button>
            <button class="btn-primary" onclick="renderVehiclePerformance()">Vehicle Performance</button>
            <button class="btn-primary" onclick="renderEmptyContainers()">Empty Containers</button>
            <button class="btn-danger" onclick="renderIncidentReport()">Incident Report</button>
            <button class="btn-primary" onclick="renderRepairReport()">Repair Report</button>
        </div>
        <div id="report-content" class="glass" style="padding: 20px;">Select a report to view.</div>
    `;
};

// Helper for PDF Download
window.downloadPDF = (title, tableId) => {
    if (!window.jspdf) {
        alert("PDF library not loaded. Please refresh the page.");
        return;
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.text(title, 14, 20);

    const table = document.getElementById(tableId);
    if (!table) {
        alert("No data to download.");
        return;
    }

    doc.autoTable({
        html: `#${tableId}`,
        startY: 30,
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [41, 128, 185] }
    });

    doc.save(`${title.replace(/\s+/g, '_')}.pdf`);
};

window.renderIncidentReport = async () => {
    const trucks = await API.get('/trucks/');
    let incidents = [];
    trucks.forEach(t => {
        if (t.incidents) {
            t.incidents.forEach(i => incidents.push({ ...i, vin: t.vin, make: t.make }));
        }
    });

    const content = document.getElementById('report-content');
    content.innerHTML = `
        <div class="flex-row" style="justify-content: space-between; align-items: center;">
            <h2>Incident Report</h2>
            <button class="btn-primary" onclick="downloadPDF('Incident Report', 'incident-table')">Download PDF</button>
        </div>
        <table id="incident-table">
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Truck</th>
                    <th>Details</th>
                    <th>Location</th>
                </tr>
            </thead>
            <tbody>
                ${incidents.map(i => `
                    <tr>
                        <td>${new Date(i.date).toLocaleDateString()}</td>
                        <td>${i.make} (${i.vin})</td>
                        <td>${i.details}</td>
                        <td>${i.location}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
};

window.renderRepairReport = async () => {
    const trucks = await API.get('/trucks/');
    let repairs = [];
    trucks.forEach(t => {
        if (t.repairs) {
            t.repairs.forEach(r => repairs.push({ ...r, vin: t.vin, make: t.make }));
        }
    });

    const content = document.getElementById('report-content');
    content.innerHTML = `
        <div class="flex-row" style="justify-content: space-between; align-items: center;">
            <h2>Repair Report</h2>
            <button class="btn-primary" onclick="downloadPDF('Repair Report', 'repair-table')">Download PDF</button>
        </div>
        <table id="repair-table">
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Truck</th>
                    <th>Reason</th>
                    <th>Amount</th>
                    <th>Mechanic</th>
                </tr>
            </thead>
            <tbody>
                ${repairs.map(r => `
                    <tr>
                        <td>${new Date(r.date).toLocaleDateString()}</td>
                        <td>${r.make} (${r.vin})</td>
                        <td>${r.reason}</td>
                        <td>$${r.amount}</td>
                        <td>${r.mechanic_name}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
};

window.renderDriverPerformance = async () => {
    const data = await API.get('/reports/driver-performance');
    const content = document.getElementById('report-content');
    content.innerHTML = `
        <div class="flex-row" style="justify-content: space-between; align-items: center;">
            <h2>Driver Performance</h2>
            <button class="btn-primary" onclick="downloadPDF('Driver Performance', 'driver-table')">Download PDF</button>
        </div>
        <table id="driver-table">
            <thead>
                <tr>
                    <th>Driver</th>
                    <th>Drayage</th>
                    <th>Amazon Del</th>
                    <th>Amazon Relay</th>
                    <th>Truck Incidents</th>
                    <th>Truck Repairs</th>
                </tr>
            </thead>
            <tbody>
                ${data.map(d => `
                    <tr>
                        <td>${d.driver_name}</td>
                        <td>${d.drayage_count}</td>
                        <td>${d.amazon_delivery_count}</td>
                        <td>${d.amazon_relay_count}</td>
                        <td>${d.truck_incidents}</td>
                        <td>${d.truck_repairs}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
};

window.renderVehiclePerformance = async () => {
    const data = await API.get('/reports/vehicle-performance');
    const content = document.getElementById('report-content');
    content.innerHTML = `
        <div class="flex-row" style="justify-content: space-between; align-items: center;">
            <h2>Vehicle Performance</h2>
            <button class="btn-primary" onclick="downloadPDF('Vehicle Performance', 'vehicle-table')">Download PDF</button>
        </div>
        <table id="vehicle-table">
            <thead>
                <tr>
                    <th>VIN</th>
                    <th>Mileage</th>
                    <th>Incidents</th>
                    <th>Repairs</th>
                </tr>
            </thead>
            <tbody>
                ${data.map(v => `
                    <tr>
                        <td>${v.vin}</td>
                        <td>${v.mileage}</td>
                        <td>${v.incident_count}</td>
                        <td>${v.repair_count}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
};

window.renderEmptyContainers = async () => {
    const data = await API.get('/reports/empty-containers');
    const content = document.getElementById('report-content');
    content.innerHTML = `
        <div class="flex-row" style="justify-content: space-between; align-items: center;">
            <h2>Empty Containers</h2>
            <button class="btn-primary" onclick="downloadPDF('Empty Containers', 'container-table')">Download PDF</button>
        </div>
        <table id="container-table">
            <thead>
                <tr>
                    <th>Container Number</th>
                    <th>SSL</th>
                </tr>
            </thead>
            <tbody>
                ${data.map(c => `
                    <tr>
                        <td>${c.container_number}</td>
                        <td>${c.ssl || '-'}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
};
