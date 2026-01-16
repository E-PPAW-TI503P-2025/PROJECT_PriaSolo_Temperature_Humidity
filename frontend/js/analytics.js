/**
 * Analytics Page JavaScript
 * Data logs with filtering, pagination, and export
 */

let currentPage = 1;
let totalPages = 1;
const ITEMS_PER_PAGE = 20;

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadUserInfo();
    loadDeviceDropdown();
    loadSensorLogs();
});

function loadUserInfo() {
    const user = api.getUser();
    if (user) {
        document.getElementById('userName').textContent = user.username;
        document.getElementById('userRole').textContent = user.role === 'admin' ? 'Administrator' : 'Teknisi';
        document.getElementById('userAvatar').textContent = user.username.charAt(0).toUpperCase();
    }
}

async function loadDeviceDropdown() {
    try {
        const response = await api.getDevices();
        if (response.success) {
            const select = document.getElementById('filterDevice');
            response.data.forEach(device => {
                const option = document.createElement('option');
                option.value = device.device_id;
                option.textContent = device.device_name;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Failed to load devices:', error);
    }
}

async function loadSensorLogs(page = 1) {
    currentPage = page;

    const params = {
        page: page,
        limit: ITEMS_PER_PAGE
    };

    const deviceId = document.getElementById('filterDevice').value;
    const startDate = document.getElementById('filterStartDate').value;
    const endDate = document.getElementById('filterEndDate').value;

    if (deviceId) params.device_id = deviceId;
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate + ' 23:59:59';

    try {
        const response = await api.getSensorLogs(params);

        if (response.success) {
            renderTable(response.data);
            renderPagination(response.pagination);
            document.getElementById('totalRecords').textContent = `${response.pagination.total} records`;
        }
    } catch (error) {
        console.error('Failed to load sensor logs:', error);
        document.getElementById('sensorLogsTable').innerHTML = `
            <tr><td colspan="7" class="empty-state">Gagal memuat data</td></tr>
        `;
    }
}

function renderTable(logs) {
    const tbody = document.getElementById('sensorLogsTable');

    if (!logs || logs.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="empty-state">Tidak ada data</td></tr>`;
        return;
    }

    tbody.innerHTML = logs.map(log => {
        const tempClass = log.suhu > 30 ? 'danger' : log.suhu > 28 ? 'warning' : 'normal';

        return `
            <tr>
                <td>${log.log_id}</td>
                <td>${log.device_name || log.device_code}</td>
                <td>${log.room_name || '-'}</td>
                <td><span class="badge ${tempClass}">${log.suhu}</span></td>
                <td>${log.kelembaban}</td>
                <td>${log.cahaya || '-'}</td>
                <td>${formatDate(log.recorded_at)}</td>
            </tr>
        `;
    }).join('');
}

function renderPagination(pagination) {
    totalPages = pagination.totalPages;
    const container = document.getElementById('pagination');

    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }

    let html = '';

    // Previous button
    html += `<button class="pagination-btn" onclick="loadSensorLogs(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>← Prev</button>`;

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
            html += `<button class="pagination-btn ${i === currentPage ? 'active' : ''}" onclick="loadSensorLogs(${i})">${i}</button>`;
        } else if (i === currentPage - 3 || i === currentPage + 3) {
            html += `<span style="padding: 0.5rem;">...</span>`;
        }
    }

    // Next button
    html += `<button class="pagination-btn" onclick="loadSensorLogs(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>Next →</button>`;

    container.innerHTML = html;
}

function applyFilters() {
    loadSensorLogs(1);
}

async function exportCSV() {
    try {
        // Get all data for export
        const params = { page: 1, limit: 10000 };

        const deviceId = document.getElementById('filterDevice').value;
        const startDate = document.getElementById('filterStartDate').value;
        const endDate = document.getElementById('filterEndDate').value;

        if (deviceId) params.device_id = deviceId;
        if (startDate) params.start_date = startDate;
        if (endDate) params.end_date = endDate + ' 23:59:59';

        const response = await api.getSensorLogs(params);

        if (response.success && response.data.length > 0) {
            const headers = ['ID', 'Device Code', 'Device Name', 'Room', 'Suhu (°C)', 'Kelembapan (%)', 'Cahaya', 'Waktu'];
            const rows = response.data.map(log => [
                log.log_id,
                log.device_code,
                log.device_name,
                log.room_name || '',
                log.suhu,
                log.kelembaban,
                log.cahaya || '',
                log.recorded_at
            ]);

            let csv = headers.join(',') + '\n';
            csv += rows.map(row => row.join(',')).join('\n');

            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `sensor_logs_${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            URL.revokeObjectURL(url);

            showToast('CSV berhasil di-export!', 'success');
        } else {
            showToast('Tidak ada data untuk di-export', 'error');
        }
    } catch (error) {
        console.error('Export failed:', error);
        showToast('Gagal export CSV', 'error');
    }
}
