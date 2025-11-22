window.renderDrivers = async function () {
    mainContent.innerHTML = `
        <div class="flex-row" style="justify-content: space-between; align-items: center;">
            <h1>Drivers</h1>
            <button class="btn-primary" onclick="showAddDriverForm()">+ Add Driver</button>
        </div>
        <div id="driver-list" class="card-grid">Loading...</div>
    `;

    try {
        const drivers = await API.get('/drivers/');
        const driverList = document.getElementById('driver-list');

        if (drivers.length === 0) {
            driverList.innerHTML = '<p>No drivers found.</p>';
            return;
        }

        driverList.innerHTML = drivers.map(driver => `
            <div class="card">
                <img src="${driver.driver_picture ? 'http://localhost:8000' + driver.driver_picture : 'https://via.placeholder.com/150'}" alt="${driver.name}">
                <h3>${driver.name}</h3>
                <p>CDL: ${driver.cdl_number}</p>
                <p>Exp: ${new Date(driver.cdl_expire_date).toLocaleDateString()}</p>
                <p>Truck: ${driver.assigned_truck_id || 'Unassigned'}</p>
            </div>
        `).join('');
    } catch (error) {
        console.error("Error loading drivers:", error);
        document.getElementById('driver-list').innerHTML = '<p>Error loading drivers.</p>';
    }
}

window.showAddDriverForm = async function () {
    mainContent.innerHTML = `
        <h1>Add New Driver</h1>
        <form id="add-driver-form" class="glass" style="padding: 20px; max-width: 600px;">
            <input type="text" id="name" placeholder="Driver Name" required>
            <input type="text" id="cdl_number" placeholder="CDL Number" required>
            <label>CDL Expiration Date</label>
            <input type="date" id="cdl_expire_date" required>
            <label>Date of Birth</label>
            <input type="date" id="dob" required>
            
            <label>Driver Picture</label>
            <input type="file" id="driver_picture_file">
            
            <label>CDL Picture</label>
            <input type="file" id="cdl_picture_file">

            <button type="submit" class="btn-primary">Save Driver</button>
            <button type="button" onclick="navigate('drivers')">Cancel</button>
        </form>
    `;

    document.getElementById('add-driver-form').onsubmit = async (e) => {
        e.preventDefault();
        try {
            let driverPicUrl = null;
            let cdlPicUrl = null;

            const driverFile = document.getElementById('driver_picture_file').files[0];
            if (driverFile) {
                const res = await API.upload(driverFile);
                driverPicUrl = res.url;
            }

            const cdlFile = document.getElementById('cdl_picture_file').files[0];
            if (cdlFile) {
                const res = await API.upload(cdlFile);
                cdlPicUrl = res.url;
            }

            const driverData = {
                name: document.getElementById('name').value,
                cdl_number: document.getElementById('cdl_number').value,
                cdl_expire_date: document.getElementById('cdl_expire_date').value,
                dob: document.getElementById('dob').value,
                driver_picture: driverPicUrl,
                cdl_picture: cdlPicUrl
            };

            await API.post('/drivers/', driverData);
            navigate('drivers');
        } catch (error) {
            console.error("Error adding driver:", error);
            alert("Failed to add driver. See console.");
        }
    };
}
