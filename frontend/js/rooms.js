/**
 * Rooms Page JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadUserInfo();
    loadRooms();

    // Show add button for admin
    const user = api.getUser();
    if (user && user.role === 'admin') {
        document.getElementById('addRoomBtn').style.display = 'flex';
        document.getElementById('actionHeader').style.display = '';
    }

    // Form submit
    document.getElementById('roomForm').addEventListener('submit', handleSubmit);
});

function loadUserInfo() {
    const user = api.getUser();
    if (user) {
        document.getElementById('userName').textContent = user.username.toUpperCase();
        document.getElementById('userRole').textContent = user.role === 'admin' ? 'ADMINISTRATOR' : 'TECHNICIAN';
        document.getElementById('userAvatar').textContent = user.username.charAt(0).toUpperCase();
    }
}

async function loadRooms() {
    try {
        const response = await api.getRooms();

        if (response.success) {
            renderRooms(response.data);
        }
    } catch (error) {
        console.error('Failed to load rooms:', error);
    }
}

function renderRooms(rooms) {
    const tbody = document.getElementById('roomsTable');
    const user = api.getUser();
    const isAdmin = user && user.role === 'admin';

    if (!rooms || rooms.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state">NO ROOMS FOUND</td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = rooms.map(room => `
        <tr>
            <td>${room.room_id}</td>
            <td><strong>${room.room_name}</strong></td>
            <td>${room.location || '-'}</td>
            <td>${room.description || '-'}</td>
            <td>
                <span class="badge info">${room.device_count || 0} DEVICES</span>
            </td>
            ${isAdmin ? `
                <td>
                    <div style="display: flex; gap: 0.5rem;">
                        <button class="btn btn-sm btn-secondary" onclick="editRoom(${room.room_id})">EDIT</button>
                        <button class="btn btn-sm btn-danger" onclick="deleteRoom(${room.room_id})">DEL</button>
                    </div>
                </td>
            ` : ''}
        </tr>
    `).join('');
}

function showAddModal() {
    document.getElementById('modalTitle').textContent = 'ADD ROOM';
    document.getElementById('roomForm').reset();
    document.getElementById('roomId').value = '';
    document.getElementById('roomModal').style.display = 'flex';
}

async function editRoom(roomId) {
    try {
        const response = await api.getRoom(roomId);
        if (response.success) {
            const room = response.data;
            document.getElementById('modalTitle').textContent = 'EDIT ROOM';
            document.getElementById('roomId').value = room.room_id;
            document.getElementById('roomName').value = room.room_name;
            document.getElementById('location').value = room.location || '';
            document.getElementById('description').value = room.description || '';
            document.getElementById('roomModal').style.display = 'flex';
        }
    } catch (error) {
        showToast('FAILED TO LOAD ROOM', 'error');
    }
}

function hideModal() {
    document.getElementById('roomModal').style.display = 'none';
}

async function handleSubmit(e) {
    e.preventDefault();

    const roomId = document.getElementById('roomId').value;
    const data = {
        room_name: document.getElementById('roomName').value,
        location: document.getElementById('location').value || null,
        description: document.getElementById('description').value || null
    };

    try {
        let response;
        if (roomId) {
            response = await api.updateRoom(roomId, data);
        } else {
            response = await api.createRoom(data);
        }

        if (response.success) {
            showToast(roomId ? 'ROOM UPDATED' : 'ROOM CREATED', 'success');
            hideModal();
            loadRooms();
        }
    } catch (error) {
        showToast(error.message, 'error');
    }
}

async function deleteRoom(roomId) {
    if (!confirm('DELETE THIS ROOM?')) return;

    try {
        const response = await api.deleteRoom(roomId);
        if (response.success) {
            showToast('ROOM DELETED', 'success');
            loadRooms();
        }
    } catch (error) {
        showToast('FAILED TO DELETE ROOM', 'error');
    }
}
