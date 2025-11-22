window.renderRepairs = async function () {
    mainContent.innerHTML = `
        <div class="flex-row" style="justify-content: space-between; align-items: center;">
            <h1>Repairs</h1>
            <button class="btn-primary" onclick="showAddRepairForm()">+ Add Repair</button>
        </div>
        <div id="repair-list" class="card-grid">Loading...</div>
    `;

    const trucks = await API.get('/trucks/');
    let allRepairs = [];
    trucks.forEach(truck => {
        if (truck.repairs) {
            truck.repairs.forEach(rep => {
                allRepairs.push({
                    ...rep,
                    truck_vin: truck.vin,
                    truck_make: truck.make,
                    truck_id: truck._id
                });
            });
        }
    });

    allRepairs.sort((a, b) => new Date(b.date) - new Date(a.date));

    const list = document.getElementById('repair-list');
    if (allRepairs.length === 0) {
        list.innerHTML = '<p>No repairs recorded.</p>';
        return;
    }

    list.innerHTML = allRepairs.map(rep => `
        <div class="card">
            <h3>${rep.truck_make} (${rep.truck_vin})</h3>
            <p><strong>Date:</strong> ${new Date(rep.date).toLocaleString()}</p>
            <p><strong>Reason:</strong> ${rep.reason}</p>
            <p><strong>Amount:</strong> $${rep.amount}</p>
            <p><strong>Mechanic:</strong> ${rep.mechanic_name}</p>
        </div>
    `).join('');
};

window.showAddRepairForm = async function () {
    try {
        const trucks = await API.get('/trucks/');
        console.log("Fetched trucks for repairs:", trucks); // Debug log
        const options = trucks.length > 0
            ? trucks.map(t => {
                const id = t.id || t._id;
                if (!id) console.error("Truck missing ID:", t);
                return `<option value="${id}">${t.make} (${t.vin})</option>`;
            }).join('')
            : '<option value="" disabled selected>No trucks available - Add a truck first</option>';

        mainContent.innerHTML = `
            <h1>Add Repair Record</h1>
            <form id="add-repair-form" class="glass" style="padding: 20px; max-width: 600px;">
                <label>Select Truck</label>
                <select id="truck_id" required ${trucks.length === 0 ? 'disabled' : ''}>
                    ${options}
                </select>
                <input type="text" id="reason" placeholder="Reason/Description" required>
                <input type="number" id="amount" placeholder="Cost ($)" step="0.01" required>
                <input type="text" id="mechanic_name" placeholder="Mechanic Name" required>
                <input type="text" id="mechanic_contact" placeholder="Mechanic Contact" required>
                <input type="text" id="location" placeholder="Location" required>
                
                <button type="submit" class="btn-primary">Save Repair</button>
                <button type="button" onclick="navigate('repairs')">Cancel</button>
            </form>
        `;

        document.getElementById('add-repair-form').onsubmit = async (e) => {
            e.preventDefault();
            const truckId = document.getElementById('truck_id').value;
            const data = {
                reason: document.getElementById('reason').value,
                amount: parseFloat(document.getElementById('amount').value),
                mechanic_name: document.getElementById('mechanic_name').value,
                mechanic_contact: document.getElementById('mechanic_contact').value,
                location: document.getElementById('location').value
            };
            await API.post(`/trucks/${truckId}/repairs`, data);
            navigate('repairs');
        };
    } catch (error) {
        console.error("Error showing repair form:", error);
        alert("Failed to load form. See console.");
    }
}
