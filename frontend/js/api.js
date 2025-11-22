const API_BASE_URL = '/api';

class API {
    static async get(endpoint) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`);
            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`GET ${endpoint} failed:`, error);
            throw error;
        }
    }

    static async post(endpoint, data) {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        return response.json();
    }

    static async put(endpoint, data) {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        return response.json();
    }

    static async upload(file) {
        const formData = new FormData();
        formData.append('file', file);
        const response = await fetch(`${API_BASE_URL}/drivers/upload`, { // Reusing driver upload for generic
            method: 'POST',
            body: formData
        });
        return response.json();
    }
}

window.API = API;
