/**
 * Devices Page JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadUserInfo();
    loadRoomDropdown();
    loadDevices();

    // Show add button for admin
    const user = api.getUser();
    if (user && user.role === 'admin') {
        document.getElementById('addDeviceBtn').style.display = 'flex';
    }

    // Form submit
    document.getElementById('deviceForm').addEventListener('submit', handleSubmit);
});

function loadUserInfo() {
    const user = api.getUser();
    if (user) {
        document.getElementById('userName').textContent = user.username.toUpperCase();
        document.getElementById('userRole').textContent = user.role === 'admin' ? 'ADMINISTRATOR' : 'TECHNICIAN';
        document.getElementById('userAvatar').textContent = user.username.charAt(0).toUpperCase();
    }
}

async function loadRoomDropdown() {
    try {
        const response = await api.getRooms();
        if (response.success) {
            const select = document.getElementById('roomId');
            response.data.forEach(room => {
                const option = document.createElement('option');
                option.value = room.room_id;
                option.textContent = room.room_name;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Failed to load rooms:', error);
    }
}

async function loadDevices() {
    try {
        const response = await api.getDevices();

        if (response.success) {
            renderDevices(response.data);
        }
    } catch (error) {
        console.error('Failed to load devices:', error);
    }
}

function renderDevices(devices) {
    const container = document.getElementById('deviceGrid');
    const user = api.getUser();
    const isAdmin = user && user.role === 'admin';

    if (!devices || devices.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1;">
                <p>NO DEVICES REGISTERED</p>
            </div>
        `;
        return;
    }

    container.innerHTML = devices.map(device => {
        const isOnline = device.last_reading &&
            (new Date() - new Date(device.last_reading)) < 5 * 60 * 1000;

        return `
            <div class="device-card">
                <div class="device-header">
                    <div class="device-info">
                        <h3>${device.device_name}</h3>
                        <p>${device.device_code}</p>
                    </div>
                    <span class="badge ${isOnline ? 'online' : 'offline'}">
                        ${isOnline ? 'ONLINE' : 'OFFLINE'}
                    </span>
                </div>
                
                <div class="device-meta">
                    <div><strong>LOC:</strong> ${device.room_name || 'Unassigned'}</div>
                    <div><strong>IP:</strong> ${device.ip_address || '-'}</div>
                    <div><strong>LOGS:</strong> ${device.log_count || 0} readings</div>
                </div>
                
                ${isAdmin ? `
                    <div class="device-actions">
                        <button class="btn btn-sm btn-secondary" onclick="editDevice(${device.device_id})">EDIT</button>
                        <button class="btn btn-sm btn-danger" onclick="deleteDevice(${device.device_id})">DELETE</button>
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
}

function showAddModal() {
    document.getElementById('modalTitle').textContent = 'ADD DEVICE';
    document.getElementById('deviceForm').reset();
    document.getElementById('deviceId').value = '';
    document.getElementById('deviceModal').style.display = 'flex';
}

async function editDevice(deviceId) {
    try {
        const response = await api.getDevice(deviceId);
        if (response.success) {
            const device = response.data;
            document.getElementById('modalTitle').textContent = 'EDIT DEVICE';
            document.getElementById('deviceId').value = device.device_id;
            document.getElementById('deviceCode').value = device.device_code;
            document.getElementById('deviceName').value = device.device_name;
            document.getElementById('ipAddress').value = device.ip_address || '';
            document.getElementById('roomId').value = device.room_id || '';
            document.getElementById('deviceModal').style.display = 'flex';
        }
    } catch (error) {
        showToast('FAILED TO LOAD DEVICE', 'error');
    }
}

function hideModal() {
    document.getElementById('deviceModal').style.display = 'none';
}

async function handleSubmit(e) {
    e.preventDefault();

    const deviceId = document.getElementById('deviceId').value;
    const data = {
        device_code: document.getElementById('deviceCode').value,
        device_name: document.getElementById('deviceName').value,
        ip_address: document.getElementById('ipAddress').value || null,
        room_id: document.getElementById('roomId').value || null
    };

    try {
        let response;
        if (deviceId) {
            response = await api.updateDevice(deviceId, data);
        } else {
            response = await api.createDevice(data);
        }

        if (response.success) {
            showToast(deviceId ? 'DEVICE UPDATED' : 'DEVICE CREATED', 'success');
            hideModal();
            loadDevices();
        }
    } catch (error) {
        showToast(error.message, 'error');
    }
}

async function deleteDevice(deviceId) {
    if (!confirm('DELETE THIS DEVICE? ALL SENSOR DATA WILL BE LOST.')) return;

    try {
        const response = await api.deleteDevice(deviceId);
        if (response.success) {
            showToast('DEVICE DELETED', 'success');
            loadDevices();
        }
    } catch (error) {
        showToast('FAILED TO DELETE DEVICE', 'error');
    }
}
