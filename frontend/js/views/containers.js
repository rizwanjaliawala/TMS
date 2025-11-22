async function renderContainers() {
    mainContent.innerHTML = `
        <div class="flex-row" style="justify-content: space-between; align-items: center;">
            <h1>Containers</h1>
            <button class="btn-primary" onclick="showAddContainerForm()">+ Add Container</button>
        </div>
        <div id="container-list" class="card-grid">Loading...</div>
    `;

    const containers = await API.get('/containers/');
    const containerList = document.getElementById('container-list');
    containerList.innerHTML = containers.map(c => `
        <div class="card">
            <h3>${c.container_number}</h3>
            <p>Status: <span class="status-badge status-${c.status.toLowerCase()}">${c.status}</span></p>
            <p>Terminal: ${c.terminal}</p>
            <p>SSL: ${c.ssl || 'N/A'}</p>
            <div style="margin-top: 10px;">
                <select onchange="updateContainerStatus('${c.id}', this.value)" style="padding: 5px;">
                    <option value="" disabled selected>Change Status</option>
                    <option value="Planned">Planned</option>
                    <option value="Picked">Picked</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Empty">Empty</option>
                    <option value="Returned">Returned</option>
                </select>
            </div>
        </div>
    `).join('');

    // Expose globally
    window.updateContainerStatus = async (id, status) => {
        await API.put(`/containers/${id}/status?status=${status}`, {});
        renderContainers();
    };
}

async function showAddContainerForm() {
    mainContent.innerHTML = `
        <h1>Add New Container</h1>
        <form id="add-container-form" class="glass" style="padding: 20px; max-width: 600px;">
            <input type="text" id="container_number" placeholder="Container Number" required>
            <input type="text" id="mbl" placeholder="MBL">
            <input type="text" id="terminal" placeholder="Terminal" required>
            <select id="category" required>
                <option value="FBU">FBU</option>
                <option value="Floor loaded">Floor loaded</option>
            </select>
            <input type="text" id="etas" placeholder="ETAs">
            <input type="text" id="ssl" placeholder="SSL">
            
            <button type="submit" class="btn-primary">Save Container</button>
            <button type="button" onclick="navigate('containers')">Cancel</button>
        </form>
    `;

    document.getElementById('add-container-form').onsubmit = async (e) => {
        e.preventDefault();
        const data = {
            container_number: document.getElementById('container_number').value,
            mbl: document.getElementById('mbl').value,
            terminal: document.getElementById('terminal').value,
            category: document.getElementById('category').value,
            etas: document.getElementById('etas').value,
            ssl: document.getElementById('ssl').value
        };
        await API.post('/containers/', data);
        navigate('containers');
    };
}
