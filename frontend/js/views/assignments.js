window.renderAssignments = async function () {
    mainContent.innerHTML = `
        <div class="flex-row" style="justify-content: space-between; align-items: center;">
            <h1>Daily Assignments</h1>
            <button class="btn-primary" onclick="showAddAssignmentForm()">+ Add Assignment</button>
        </div>
        <div id="assignment-list" class="card-grid">Loading...</div>
    `;

    try {
        const assignments = await API.get('/assignments/');
        const drivers = await API.get('/drivers/');
        const driverMap = Object.fromEntries(drivers.map(d => [d.id, d.name]));

        const assignmentList = document.getElementById('assignment-list');
        if (assignments.length === 0) {
            assignmentList.innerHTML = '<p>No assignments found.</p>';
            return;
        }

        assignmentList.innerHTML = assignments.map(a => `
            <div class="card">
                <h3>${driverMap[a.driver_id] || 'Unknown Driver'}</h3>
                <p><strong>${a.type}</strong> - ${a.date}</p>
                ${renderAssignmentDetails(a)}
            </div>
        `).join('');
    } catch (error) {
        console.error("Error loading assignments:", error);
        document.getElementById('assignment-list').innerHTML = '<p>Error loading assignments.</p>';
    }
}

function renderAssignmentDetails(assignment) {
    const d = assignment.details;
    if (!d) return '';

    if (assignment.type === 'Drayage') {
        return `<p>Container: ${d.container_number || '-'}</p><p>Terminal: ${d.terminal || '-'}</p>`;
    } else if (assignment.type === 'Amazon Delivery') {
        return `<p>ISA: ${d.isa_id || '-'}</p><p>Appt: ${d.appt_date_time ? new Date(d.appt_date_time).toLocaleString() : '-'}</p>`;
    } else if (assignment.type === 'Amazon Relay') {
        return `<p>Origin: ${d.origin || '-'}</p><p>Dest: ${d.destination || '-'}</p>`;
    } else if (assignment.type === 'Yard Move') {
        return `<p>From: ${d.from_location || '-'}</p><p>To: ${d.to_location || '-'}</p>`;
    } else if (assignment.type === 'Day Off') {
        return `<p>Reason: ${d.reason || '-'}</p><p>Paid: ${d.is_paid ? 'Yes' : 'No'}</p>`;
    }
    return '';
}

window.showAddAssignmentForm = async function () {
    try {
        const drivers = await API.get('/drivers/');

        const driverOptions = (drivers && drivers.length > 0)
            ? drivers.map(d => `<option value="${d.id}">${d.name}</option>`).join('')
            : '<option value="" disabled selected>No drivers available</option>';

        mainContent.innerHTML = `
            <h1>Create Assignment</h1>
            <form id="add-assignment-form" class="glass" style="padding: 20px; max-width: 600px;">
                <label>Driver</label>
                <select id="driver_id" required ${(!drivers || drivers.length === 0) ? 'disabled' : ''}>
                    <option value="">Select Driver</option>
                    ${driverOptions}
                </select>
                
                <label>Date</label>
                <input type="date" id="date" required>
                
                <label>Type</label>
                <select id="type" onchange="toggleAssignmentFields()" required>
                    <option value="">Select Type</option>
                    <option value="Drayage">Drayage</option>
                    <option value="Amazon Delivery">Amazon Delivery</option>
                    <option value="Amazon Relay">Amazon Relay</option>
                    <option value="Yard Move">Yard Move</option>
                    <option value="Day Off">Day Off</option>
                </select>

                <!-- Dynamic Fields -->
                <div id="drayage-fields" class="hidden">
                    <h3>Drayage Details</h3>
                    <input type="text" id="d_container_number" placeholder="Container Number">
                    <input type="text" id="d_empty_return" placeholder="Empty Return Number">
                    <input type="text" id="d_bare_chassis" placeholder="Bare Chassis">
                    <input type="text" id="d_terminal" placeholder="Terminal">
                    <select id="d_category">
                        <option value="FBU">FBU</option>
                        <option value="Floor loaded">Floor loaded</option>
                    </select>
                </div>

                <div id="amazon-delivery-fields" class="hidden">
                    <h3>Amazon Delivery Details</h3>
                    <input type="text" id="ad_isa_id" placeholder="ISA ID">
                    <input type="text" id="ad_container_number" placeholder="Container Number">
                    <label>Appt Date & Time</label>
                    <input type="datetime-local" id="ad_appt_date_time">
                </div>

                <div id="amazon-relay-fields" class="hidden">
                    <h3>Amazon Relay Details</h3>
                    <input type="text" id="ar_load_ids" placeholder="Load IDs (comma separated)">
                    <input type="text" id="ar_origin" placeholder="Origin">
                    <input type="text" id="ar_destination" placeholder="Destination">
                    <input type="number" id="ar_payout" placeholder="Expected Pay Out">
                </div>

                <div id="yard-move-fields" class="hidden">
                    <h3>Yard Move Details</h3>
                    <input type="text" id="ym_from_location" placeholder="From Location">
                    <input type="text" id="ym_to_location" placeholder="To Location">
                </div>

                <div id="day-off-fields" class="hidden">
                    <h3>Day Off Details</h3>
                    <select id="do_is_paid">
                        <option value="false">Unpaid</option>
                        <option value="true">Paid</option>
                    </select>
                    <input type="text" id="do_reason" placeholder="Reason">
                </div>

                <button type="submit" class="btn-primary" style="margin-top: 20px;">Create Assignment</button>
                <button type="button" onclick="navigate('assignments')">Cancel</button>
            </form>
        `;

        // Expose toggle function globally
        window.toggleAssignmentFields = function () {
            const type = document.getElementById('type').value;
            const fields = ['drayage-fields', 'amazon-delivery-fields', 'amazon-relay-fields', 'yard-move-fields', 'day-off-fields'];
            fields.forEach(id => document.getElementById(id).classList.add('hidden'));

            if (type === 'Drayage') document.getElementById('drayage-fields').classList.remove('hidden');
            if (type === 'Amazon Delivery') document.getElementById('amazon-delivery-fields').classList.remove('hidden');
            if (type === 'Amazon Relay') document.getElementById('amazon-relay-fields').classList.remove('hidden');
            if (type === 'Yard Move') document.getElementById('yard-move-fields').classList.remove('hidden');
            if (type === 'Day Off') document.getElementById('day-off-fields').classList.remove('hidden');
        };

        document.getElementById('add-assignment-form').onsubmit = async (e) => {
            e.preventDefault();
            const type = document.getElementById('type').value;
            let details = {};

            if (type === 'Drayage') {
                details = {
                    container_number: document.getElementById('d_container_number').value,
                    empty_return_number: document.getElementById('d_empty_return').value,
                    bare_chassis: document.getElementById('d_bare_chassis').value,
                    terminal: document.getElementById('d_terminal').value,
                    container_category: document.getElementById('d_category').value
                };
            } else if (type === 'Amazon Delivery') {
                details = {
                    isa_id: document.getElementById('ad_isa_id').value,
                    container_number: document.getElementById('ad_container_number').value,
                    appt_date_time: document.getElementById('ad_appt_date_time').value
                };
            } else if (type === 'Amazon Relay') {
                details = {
                    load_ids: document.getElementById('ar_load_ids').value.split(','),
                    origin: document.getElementById('ar_origin').value,
                    destination: document.getElementById('ar_destination').value,
                    expected_payout: parseFloat(document.getElementById('ar_payout').value)
                };
            } else if (type === 'Yard Move') {
                details = {
                    from_location: document.getElementById('ym_from_location').value,
                    to_location: document.getElementById('ym_to_location').value
                };
            } else if (type === 'Day Off') {
                details = {
                    is_paid: document.getElementById('do_is_paid').value === 'true',
                    reason: document.getElementById('do_reason').value
                };
            }

            const data = {
                driver_id: document.getElementById('driver_id').value,
                date: document.getElementById('date').value,
                type: type,
                details: details
            };

            await API.post('/assignments/', data);
            navigate('assignments');
        };
    } catch (error) {
        console.error("Error showing assignment form:", error);
        alert("Failed to load assignment form. Check console for details.");
    }
}
