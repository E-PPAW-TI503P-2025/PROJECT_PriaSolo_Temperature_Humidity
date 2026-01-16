/**
 * Dashboard Page JavaScript
 * Real-time monitoring with auto-refresh
 */

// Chart instances
let temperatureChart = null;
let humidityChart = null;

// Auto-refresh interval (2 seconds - same as simulator)
const REFRESH_INTERVAL = 2000;

document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    checkAuth();

    // Load user info
    loadUserInfo();

    // Load dashboard data
    loadDashboard();

    // Load charts
    loadCharts();

    // Load device dropdown
    loadDeviceDropdown();

    // Setup auto-refresh
    setInterval(() => {
        loadDashboard();
        loadCharts();
    }, REFRESH_INTERVAL);

    // Device filter change
    document.getElementById('chartDevice').addEventListener('change', loadCharts);
});

/**
 * Load user info to sidebar
 */
function loadUserInfo() {
    const user = api.getUser();
    if (user) {
        document.getElementById('userName').textContent = user.username.toUpperCase();
        document.getElementById('userRole').textContent = user.role === 'admin' ? 'ADMINISTRATOR' : 'TECHNICIAN';
        document.getElementById('userAvatar').textContent = user.username.charAt(0).toUpperCase();
    }
}

/**
 * Load dashboard data
 */
async function loadDashboard() {
    try {
        const response = await api.getDashboard();

        if (response.success) {
            const data = response.data;

            // Update stats
            updateStats(data.statistics, data.summary);

            // Update latest readings table
            updateLatestReadings(data.latestReadings);

            // Update recent alerts
            updateRecentAlerts(data.recentAlerts);

            // Update last update time
            document.getElementById('lastUpdate').textContent = new Date().toLocaleTimeString('en-US', { hour12: false });
        }
    } catch (error) {
        console.error('Failed to load dashboard:', error);
    }
}

/**
 * Update stat cards
 */
function updateStats(stats, summary) {
    // Temperature
    document.getElementById('avgTemp').textContent = `${stats.avg_suhu || 0}°C`;
    document.getElementById('tempRange').textContent =
        `R: ${stats.min_suhu || 0} - ${stats.max_suhu || 0}°C`;

    // Humidity
    document.getElementById('avgHumidity').textContent = `${stats.avg_kelembaban || 0}%`;
    document.getElementById('humidityRange').textContent =
        `R: ${stats.min_kelembaban || 0} - ${stats.max_kelembaban || 0}%`;

    // Devices
    document.getElementById('activeDevices').textContent = summary.activeDevices || 0;
    document.getElementById('totalReadings').textContent = `${stats.total_readings || 0} REC`;

    // Alerts
    document.getElementById('totalAlerts').textContent = summary.totalAlerts || 0;

    // Highlight if there are warnings
    const alertCard = document.querySelector('.stat-card.light');
    if (summary.totalAlerts > 0) {
        alertCard.style.borderLeftColor = '#ef4444';
        document.getElementById('alertStatus').textContent = 'WARNING';
        document.getElementById('alertStatus').className = 'stat-change down';
    } else {
        alertCard.style.borderLeftColor = '#10b981';
        document.getElementById('alertStatus').textContent = 'OK';
        document.getElementById('alertStatus').className = 'stat-change up';
    }
}

/**
 * Update latest readings table
 */
function updateLatestReadings(readings) {
    const tbody = document.getElementById('latestReadingsTable');

    if (!readings || readings.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="empty-state">NO DATA AVAILABLE</td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = readings.map(reading => {
        const tempClass = reading.suhu > 30 ? 'danger' : reading.suhu > 28 ? 'warning' : 'normal';

        return `
            <tr>
                <td>
                    <strong>${reading.device_name || reading.device_code}</strong>
                    <br><small style="color: var(--text-muted)">${reading.device_code}</small>
                </td>
                <td>${reading.room_name || '-'}</td>
                <td>
                    <span class="badge ${tempClass}">${reading.suhu}°C</span>
                </td>
                <td>${reading.kelembaban}%</td>
                <td>${formatTime(reading.recorded_at)}</td>
            </tr>
        `;
    }).join('');
}

/**
 * Update recent alerts
 */
function updateRecentAlerts(alerts) {
    const container = document.getElementById('recentAlerts');

    if (!alerts || alerts.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>NO ACTIVE ALERTS</p>
            </div>
        `;
        return;
    }

    container.innerHTML = alerts.map(alert => `
        <div class="alert-item">
            <div class="alert-content">
                <div class="alert-title">HIGH TEMP: ${alert.threshold_suhu}°C</div>
                <div class="alert-meta">
                    LOC: ${alert.room_name} • ${formatDate(alert.alert_time)}
                </div>
            </div>
            <span class="badge ${alert.alert_status === 'WARNING' ? 'warning' : 'danger'}">
                ${alert.alert_status}
            </span>
        </div>
    `).join('');
}

/**
 * Load device dropdown
 */
async function loadDeviceDropdown() {
    try {
        const response = await api.getDevices();

        if (response.success) {
            const select = document.getElementById('chartDevice');
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

/**
 * Load charts
 */
async function loadCharts() {
    try {
        const deviceId = document.getElementById('chartDevice').value;
        const response = await api.getChartData({
            device_id: deviceId || undefined,
            hours: 24
        });

        if (response.success) {
            const data = response.data;

            // Temperature Chart
            updateTemperatureChart(data.labels, data.datasets.suhu);

            // Humidity Chart
            updateHumidityChart(data.labels, data.datasets.kelembaban);
        }
    } catch (error) {
        console.error('Failed to load charts:', error);
    }
}

/**
 * Update temperature chart
 */
function updateTemperatureChart(labels, data) {
    const ctx = document.getElementById('temperatureChart').getContext('2d');

    if (temperatureChart) {
        temperatureChart.data.labels = labels;
        temperatureChart.data.datasets[0].data = data;
        temperatureChart.update('none');
        return;
    }

    temperatureChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'TEMP (°C)',
                data: data,
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.1, // Less rounded
                pointRadius: 0,
                pointHoverRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(148, 163, 184, 0.1)'
                    },
                    ticks: {
                        color: '#94a3b8',
                        maxTicksLimit: 8,
                        font: { family: 'monospace' }
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(148, 163, 184, 0.1)'
                    },
                    ticks: {
                        color: '#94a3b8',
                        callback: value => value + '°C',
                        font: { family: 'monospace' }
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
}

/**
 * Update humidity chart
 */
function updateHumidityChart(labels, data) {
    const ctx = document.getElementById('humidityChart').getContext('2d');

    if (humidityChart) {
        humidityChart.data.labels = labels;
        humidityChart.data.datasets[0].data = data;
        humidityChart.update('none');
        return;
    }

    humidityChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'HUMIDITY (%)',
                data: data,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.1, // Less rounded
                pointRadius: 0,
                pointHoverRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(148, 163, 184, 0.1)'
                    },
                    ticks: {
                        color: '#94a3b8',
                        maxTicksLimit: 8,
                        font: { family: 'monospace' }
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(148, 163, 184, 0.1)'
                    },
                    ticks: {
                        color: '#94a3b8',
                        callback: value => value + '%',
                        font: { family: 'monospace' }
                    },
                    min: 0,
                    max: 100
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
}
