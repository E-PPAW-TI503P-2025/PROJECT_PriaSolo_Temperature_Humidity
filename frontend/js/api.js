/**
 * API Client
 * Handles all API communication with JWT token management
 */

const API_BASE_URL = '/api';

class ApiClient {
    constructor() {
        this.token = localStorage.getItem('token');
    }

    /**
     * Set authentication token
     */
    setToken(token) {
        this.token = token;
        localStorage.setItem('token', token);
    }

    /**
     * Clear authentication token (logout)
     */
    clearToken() {
        this.token = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }

    /**
     * Get stored user info
     */
    getUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }

    /**
     * Set user info
     */
    setUser(user) {
        localStorage.setItem('user', JSON.stringify(user));
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return !!this.token;
    }

    /**
     * Make API request
     */
    async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;

        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers
            });

            const data = await response.json();

            if (!response.ok) {
                // Handle 401 - Unauthorized
                if (response.status === 401) {
                    this.clearToken();
                    window.location.href = '/login.html';
                    throw new Error('Session expired. Please login again.');
                }
                throw new Error(data.message || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // ==================
    // Auth Endpoints
    // ==================

    async login(username, password) {
        const response = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });

        if (response.success) {
            this.setToken(response.data.token);
            this.setUser(response.data.user);
        }

        return response;
    }

    async getProfile() {
        return this.request('/auth/profile');
    }

    async register(userData) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    async getUsers() {
        return this.request('/auth/users');
    }

    // ==================
    // Dashboard Endpoints
    // ==================

    async getDashboard() {
        return this.request('/dashboard');
    }

    async getLatestReadings() {
        return this.request('/dashboard/latest');
    }

    async getStats(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.request(`/dashboard/stats${query ? '?' + query : ''}`);
    }

    async getChartData(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.request(`/dashboard/chart${query ? '?' + query : ''}`);
    }

    // ==================
    // Sensor Log Endpoints
    // ==================

    async getSensorLogs(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.request(`/iot/logs${query ? '?' + query : ''}`);
    }

    // ==================
    // Alert Endpoints
    // ==================

    async getAlerts(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.request(`/alerts${query ? '?' + query : ''}`);
    }

    async getRecentAlerts(limit = 10) {
        return this.request(`/alerts/recent?limit=${limit}`);
    }

    async updateAlertStatus(alertId, status) {
        return this.request(`/alerts/${alertId}`, {
            method: 'PUT',
            body: JSON.stringify({ alert_status: status })
        });
    }

    async deleteAlert(alertId) {
        return this.request(`/alerts/${alertId}`, {
            method: 'DELETE'
        });
    }

    // ==================
    // Device Endpoints
    // ==================

    async getDevices() {
        return this.request('/devices');
    }

    async getDevice(deviceId) {
        return this.request(`/devices/${deviceId}`);
    }

    async createDevice(deviceData) {
        return this.request('/devices', {
            method: 'POST',
            body: JSON.stringify(deviceData)
        });
    }

    async updateDevice(deviceId, deviceData) {
        return this.request(`/devices/${deviceId}`, {
            method: 'PUT',
            body: JSON.stringify(deviceData)
        });
    }

    async deleteDevice(deviceId) {
        return this.request(`/devices/${deviceId}`, {
            method: 'DELETE'
        });
    }

    // ==================
    // Room Endpoints
    // ==================

    async getRooms() {
        return this.request('/rooms');
    }

    async getRoom(roomId) {
        return this.request(`/rooms/${roomId}`);
    }

    async createRoom(roomData) {
        return this.request('/rooms', {
            method: 'POST',
            body: JSON.stringify(roomData)
        });
    }

    async updateRoom(roomId, roomData) {
        return this.request(`/rooms/${roomId}`, {
            method: 'PUT',
            body: JSON.stringify(roomData)
        });
    }

    async deleteRoom(roomId) {
        return this.request(`/rooms/${roomId}`, {
            method: 'DELETE'
        });
    }
}

// Create global API instance
const api = new ApiClient();

// Utility Functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
}

function formatTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
}

function showToast(message, type = 'info') {
    // Simple toast notification
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message.toUpperCase();
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 0.75rem 1.5rem;
        background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#3b82f6'};
        color: white;
        border-radius: 2px;
        font-family: 'Inter', sans-serif;
        font-weight: 500;
        letter-spacing: 0.05em;
        z-index: 9999;
        box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3);
        animation: fadeIn 0.3s ease;
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Check authentication on page load
function checkAuth() {
    if (!api.isAuthenticated() && !window.location.pathname.includes('login.html') && !window.location.pathname.includes('register.html')) {
        window.location.href = '/login.html';
    }
}

// Logout function
function logout() {
    api.clearToken();
    window.location.href = '/login.html';
}
