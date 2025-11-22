async function renderTrucks() {
    mainContent.innerHTML = `
        <div class="flex-row" style="justify-content: space-between; align-items: center;">
            <h1>Trucks</h1>
            <button class="btn-primary" onclick="showAddTruckForm()">+ Add Truck</button>
        </div>
        <div id="truck-list" class="card-grid">Loading...</div>
    `;

    const trucks = await API.get('/trucks/');
    const truckList = document.getElementById('truck-list');
    truckList.innerHTML = trucks.map(truck => `
        <div class="card">
            <img src="${truck.picture ? 'http://localhost:8000' + truck.picture : 'https://via.placeholder.com/150'}" alt="${truck.make}">
            <h3>${truck.make} (${truck.year})</h3>
            <p>VIN: ${truck.vin}</p>
            <p>Type: ${truck.type}</p>
            <p>Mileage: ${truck.mileage}</p>
            <div class="flex-row" style="margin-top: 10px;">
                <button class="btn-primary" onclick="updateMileage('${truck.id}')" style="padding: 5px 10px; font-size: 12px;">Update Mileage</button>
                <button class="btn-danger" onclick="reportIncident('${truck.id}')" style="padding: 5px 10px; font-size: 12px;">Incident</button>
                <button class="btn-primary" onclick="addRepair('${truck.id}')" style="padding: 5px 10px; font-size: 12px;">Repair</button>
            </div>
        </div>
    `).join('');
}

async function showAddTruckForm() {
    mainContent.innerHTML = `
        <h1>Add New Truck</h1>
        <form id="add-truck-form" class="glass" style="padding: 20px; max-width: 600px;">
            <input type="text" id="vin" placeholder="VIN Number" required>
            <input type="text" id="make" placeholder="Make" required>
            <input type="text" id="color" placeholder="Color" required>
            <input type="number" id="year" placeholder="Year" required>
            <select id="type" required>
                <option value="Sleeper">Sleeper</option>
                <option value="Day Cab">Day Cab</option>
            </select>
            <input type="text" id="license_plate" placeholder="License Plate" required>
            <input type="number" id="mileage" placeholder="Current Mileage" required>
            
            <label>Truck Picture</label>
            <input type="file" id="truck_picture_file">
            
            <label>Insurance Card</label>
            <input type="file" id="insurance_file">

            <button type="submit" class="btn-primary">Save Truck</button>
            <button type="button" onclick="navigate('trucks')">Cancel</button>
        </form>
    `;

    document.getElementById('add-truck-form').onsubmit = async (e) => {
        e.preventDefault();

        let truckPicUrl = null;
        let insPicUrl = null;

        const truckFile = document.getElementById('truck_picture_file').files[0];
        if (truckFile) {
            const res = await API.upload(truckFile);
            truckPicUrl = res.url;
        }

        const insFile = document.getElementById('insurance_file').files[0];
        if (insFile) {
            const res = await API.upload(insFile);
            insPicUrl = res.url;
        }

        const truckData = {
            vin: document.getElementById('vin').value,
            make: document.getElementById('make').value,
            color: document.getElementById('color').value,
            year: parseInt(document.getElementById('year').value),
            type: document.getElementById('type').value,
            license_plate: document.getElementById('license_plate').value,
            mileage: parseFloat(document.getElementById('mileage').value),
            picture: truckPicUrl,
            insurance_card_picture: insPicUrl
        };

        await API.post('/trucks/', truckData);
        navigate('trucks');
    };
}

async function updateMileage(truckId) {
    const newMileage = prompt("Enter new mileage:");
    if (newMileage) {
        await API.put(`/trucks/${truckId}/mileage?mileage=${newMileage}`, {});
        renderTrucks();
    }
}

async function reportIncident(truckId) {
    // Simplified for demo: using prompt/alert. In real app, use a modal.
    const details = prompt("Incident Details:");
    const location = prompt("Location:");
    if (details && location) {
        await API.post(`/trucks/${truckId}/incidents`, {
            details: details,
            location: location,
            media_urls: [] // Simplified
        });
        alert("Incident reported");
    }
}

async function addRepair(truckId) {
    // Simplified modal replacement
    mainContent.innerHTML = `
        <h1>Add Repair Record</h1>
        <form id="add-repair-form" class="glass" style="padding: 20px; max-width: 600px;">
            <input type="text" id="reason" placeholder="Reason for Repair" required>
            <input type="number" id="amount" placeholder="Amount" required>
            <input type="text" id="mechanic_name" placeholder="Mechanic Name" required>
            <input type="text" id="mechanic_contact" placeholder="Mechanic Contact" required>
            <input type="text" id="location" placeholder="Location" required>
            
            <button type="submit" class="btn-primary">Save Repair</button>
            <button type="button" onclick="navigate('trucks')">Cancel</button>
        </form>
    `;

    document.getElementById('add-repair-form').onsubmit = async (e) => {
        e.preventDefault();
        const repairData = {
            reason: document.getElementById('reason').value,
            amount: parseFloat(document.getElementById('amount').value),
            mechanic_name: document.getElementById('mechanic_name').value,
            mechanic_contact: document.getElementById('mechanic_contact').value,
            location: document.getElementById('location').value
        };
        await API.post(`/trucks/${truckId}/repairs`, repairData);
        navigate('trucks');
    };
}
