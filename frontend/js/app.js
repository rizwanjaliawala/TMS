const mainContent = document.getElementById('main-content');

function navigate(view) {
    // Update active nav link
    document.querySelectorAll('.nav-links li').forEach(li => li.classList.remove('active'));
    const activeLink = document.querySelector(`[onclick="navigate('${view}')"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }

    // Render view
    mainContent.innerHTML = '';
    switch (view) {
        case 'dashboard':
            renderDashboard();
            break;
        case 'drivers':
            renderDrivers();
            break;
        case 'trucks':
            renderTrucks();
            break;
        case 'incidents':
            renderIncidents();
            break;
        case 'repairs':
            renderRepairs();
            break;
        case 'assignments':
            renderAssignments();
            break;
        case 'containers':
            renderContainers();
            break;
        case 'reports':
            renderReports();
            break;
        default:
            mainContent.innerHTML = '<h1>404 Not Found</h1>';
    }
}

function renderDashboard() {
    mainContent.innerHTML = `
        <h1>Dashboard</h1>
        <div class="card-grid">
            <div class="card">
                <h3>Welcome to TMS</h3>
                <p>Select a module from the sidebar to get started.</p>
            </div>
        </div>
    `;
}

// Initialize
window.navigate = navigate;
window.renderDashboard = renderDashboard;
navigate('dashboard');
