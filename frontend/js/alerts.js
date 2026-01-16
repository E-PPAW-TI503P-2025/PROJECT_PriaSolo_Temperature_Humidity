/**
 * Alerts Page JavaScript
 */

let currentPage = 1;
const ITEMS_PER_PAGE = 20;

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadUserInfo();
    loadRoomDropdown();
    loadAlerts();
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
            const select = document.getElementById('filterRoom');
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

async function loadAlerts(page = 1) {
    currentPage = page;

    const params = { page, limit: ITEMS_PER_PAGE };

    const status = document.getElementById('filterStatus').value;
    const roomId = document.getElementById('filterRoom').value;

    if (status) params.status = status;
    if (roomId) params.room_id = roomId;

    try {
        const response = await api.getAlerts(params);

        if (response.success) {
            renderAlerts(response.data);
            renderPagination(response.pagination);
            document.getElementById('totalAlerts').textContent = `${response.pagination.total} RECORDS`;

            // Count stats from full data (approximation)
            const warnings = response.data.filter(a => a.alert_status === 'WARNING').length;
            const normals = response.data.filter(a => a.alert_status === 'NORMAL').length;
            document.getElementById('warningCount').textContent = warnings;
            document.getElementById('normalCount').textContent = normals;
        }
    } catch (error) {
        console.error('Failed to load alerts:', error);
    }
}

function renderAlerts(alerts) {
    const container = document.getElementById('alertsList');

    if (!alerts || alerts.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>NO ALERTS IN SYSTEM</p>
            </div>
        `;
        return;
    }

    container.innerHTML = alerts.map(alert => `
        <div class="alert-item" id="alert-${alert.alert_id}">
            <div class="alert-content">
                <div class="alert-title">
                    TEMPERATURE EXCEEDED: ${alert.threshold_suhu}°C
                </div>
                <div class="alert-meta">
                    ${alert.room_name} (${alert.location || '-'}) &bull; ${formatDate(alert.alert_time)}
                </div>
            </div>
            <div class="alert-actions">
                <span class="badge ${alert.alert_status === 'WARNING' ? 'warning' : 'normal'}">
                    ${alert.alert_status}
                </span>
                ${alert.alert_status === 'WARNING' ? `
                    <button class="btn btn-sm btn-secondary" onclick="resolveAlert(${alert.alert_id})">
                        RESOLVE
                    </button>
                ` : ''}
                <button class="btn btn-sm btn-danger" onclick="deleteAlert(${alert.alert_id})">
                    DEL
                </button>
            </div>
        </div>
    `).join('');
}

function renderPagination(pagination) {
    const container = document.getElementById('pagination');

    if (pagination.totalPages <= 1) {
        container.innerHTML = '';
        return;
    }

    let html = '';
    html += `<button class="pagination-btn" onclick="loadAlerts(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>PREV</button>`;

    for (let i = 1; i <= pagination.totalPages; i++) {
        if (i === 1 || i === pagination.totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
            html += `<button class="pagination-btn ${i === currentPage ? 'active' : ''}" onclick="loadAlerts(${i})">${i}</button>`;
        } else if (i === currentPage - 3 || i === currentPage + 3) {
            html += `<span style="padding: 0.5rem; color: var(--text-muted);">...</span>`;
        }
    }

    html += `<button class="pagination-btn" onclick="loadAlerts(${currentPage + 1})" ${currentPage === pagination.totalPages ? 'disabled' : ''}>NEXT</button>`;

    container.innerHTML = html;
}

async function resolveAlert(alertId) {
    try {
        const response = await api.updateAlertStatus(alertId, 'NORMAL');
        if (response.success) {
            showToast('ALERT RESOLVED', 'success');
            loadAlerts(currentPage);
        }
    } catch (error) {
        showToast('FAILED TO RESOLVE', 'error');
    }
}

async function deleteAlert(alertId) {
    if (!confirm('DELETE THIS ALERT RECORD?')) return;

    try {
        const response = await api.deleteAlert(alertId);
        if (response.success) {
            showToast('ALERT DELETED', 'success');
            loadAlerts(currentPage);
        }
    } catch (error) {
        showToast('FAILED TO DELETE', 'error');
    }
}
