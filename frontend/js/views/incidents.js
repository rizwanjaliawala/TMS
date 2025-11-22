window.renderIncidents = async function () {
    mainContent.innerHTML = `
        <div class="flex-row" style="justify-content: space-between; align-items: center;">
            <h1>Incidents</h1>
            <button class="btn-danger" onclick="showAddIncidentForm()">+ Report Incident</button>
        </div>
        <div id="incident-list" class="card-grid">Loading...</div>
    `;

    const trucks = await API.get('/trucks/');
    let allIncidents = [];
    trucks.forEach(truck => {
        if (truck.incidents) {
            truck.incidents.forEach(inc => {
                allIncidents.push({
                    ...inc,
                    truck_vin: truck.vin,
                    truck_make: truck.make,
                    truck_id: truck._id
                });
            });
        }
    });

    // Sort by date desc
    allIncidents.sort((a, b) => new Date(b.date) - new Date(a.date));

    const list = document.getElementById('incident-list');
    if (allIncidents.length === 0) {
        list.innerHTML = '<p>No incidents reported.</p>';
        return;
    }

    list.innerHTML = allIncidents.map(inc => `
        <div class="card">
            <h3>${inc.truck_make} (${inc.truck_vin})</h3>
            <p><strong>Date:</strong> ${new Date(inc.date).toLocaleString()}</p>
            <p><strong>Location:</strong> ${inc.location}</p>
            <p><strong>Details:</strong> ${inc.details}</p>
        </div>
    `).join('');
};

window.showAddIncidentForm = async function () {
    try {
        const trucks = await API.get('/trucks/');
        const options = trucks.length > 0
            ? trucks.map(t => `<option value="${t.id}">${t.make} (${t.vin})</option>`).join('')
            : '<option value="" disabled selected>No trucks available - Add a truck first</option>';

        mainContent.innerHTML = `
            <h1>Report Incident</h1>
            <form id="add-incident-form" class="glass" style="padding: 20px; max-width: 600px;">
                <label>Select Truck</label>
                <select id="truck_id" required ${trucks.length === 0 ? 'disabled' : ''}>
                    ${options}
                </select>
                <input type="text" id="details" placeholder="Incident Details" required>
                <input type="text" id="location" placeholder="Location" required>
                
                <button type="submit" class="btn-danger">Submit Report</button>
                <button type="button" onclick="navigate('incidents')">Cancel</button>
            </form>
        `;

        document.getElementById('add-incident-form').onsubmit = async (e) => {
            e.preventDefault();
            const truckId = document.getElementById('truck_id').value;
            const data = {
                details: document.getElementById('details').value,
                location: document.getElementById('location').value,
                media_urls: []
            };
            await API.post(`/trucks/${truckId}/incidents`, data);
            navigate('incidents');
        };
    } catch (error) {
        console.error("Error showing incident form:", error);
        alert("Failed to load form. See console.");
    }
}
