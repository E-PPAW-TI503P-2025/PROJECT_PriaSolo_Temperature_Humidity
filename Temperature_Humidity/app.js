// ===== Mock Data Generator =====
const generateMockData = () => {
    const now = new Date();
    const data = [];

    // Generate 50 data points for the last 24 hours
    for (let i = 49; i >= 0; i--) {
        const timestamp = new Date(now - i * 30 * 60 * 1000); // Every 30 minutes
        const baseTemp = 25;
        const baseHumid = 60;

        // Add some realistic variation
        const tempVariation = Math.sin(i / 5) * 3 + (Math.random() - 0.5) * 2;
        const humidVariation = Math.cos(i / 4) * 8 + (Math.random() - 0.5) * 5;

        data.push({
            timestamp: timestamp,
            temperature: Math.round((baseTemp + tempVariation) * 10) / 10,
            humidity: Math.round((baseHumid + humidVariation) * 10) / 10
        });
    }

    return data;
};

// ===== State Management =====
let sensorData = generateMockData();
let currentPage = 1;
const itemsPerPage = 10;
let chart = null;
let updateInterval = null;

// ===== DOM Elements =====
const elements = {
    sidebar: document.getElementById('sidebar'),
    sidebarToggle: document.getElementById('sidebarToggle'),
    mobileMenuBtn: document.getElementById('mobileMenuBtn'),
    currentTemp: document.getElementById('currentTemp'),
    currentHumid: document.getElementById('currentHumid'),
    tempBadge: document.getElementById('tempBadge'),
    humidBadge: document.getElementById('humidBadge'),
    lastUpdate: document.getElementById('lastUpdate'),
    connectionStatus: document.getElementById('connectionStatus'),
    dataTableBody: document.getElementById('dataTableBody'),
    refreshBtn: document.getElementById('refreshBtn'),
    exportBtn: document.getElementById('exportBtn'),
    prevPage: document.getElementById('prevPage'),
    nextPage: document.getElementById('nextPage'),
    pageNumbers: document.getElementById('pageNumbers'),
    showingStart: document.getElementById('showingStart'),
    showingEnd: document.getElementById('showingEnd'),
    totalEntries: document.getElementById('totalEntries')
};

// ===== Initialize Application =====
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    // Initialize Lucide icons
    lucide.createIcons();

    // Setup event listeners
    setupEventListeners();

    // Initialize chart
    initializeChart();

    // Update dashboard with initial data
    updateDashboard();

    // Populate table
    updateTable();

    // Start real-time updates (every 5 seconds)
    startRealTimeUpdates();
}

// ===== Event Listeners =====
function setupEventListeners() {
    // Sidebar toggle (desktop)
    elements.sidebarToggle?.addEventListener('click', () => {
        elements.sidebar.classList.toggle('collapsed');
    });

    // Mobile menu toggle
    elements.mobileMenuBtn?.addEventListener('click', () => {
        elements.sidebar.classList.toggle('open');
        toggleOverlay(true);
    });

    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            updateChartRange(e.target.dataset.range);
        });
    });

    // Refresh button
    elements.refreshBtn?.addEventListener('click', () => {
        refreshData();
    });

    // Export button
    elements.exportBtn?.addEventListener('click', () => {
        exportData();
    });

    // Pagination
    elements.prevPage?.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            updateTable();
        }
    });

    elements.nextPage?.addEventListener('click', () => {
        const totalPages = Math.ceil(sensorData.length / itemsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            updateTable();
        }
    });

    // Navigation items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            // Close mobile sidebar
            if (window.innerWidth <= 992) {
                elements.sidebar.classList.remove('open');
                toggleOverlay(false);
            }
        });
    });
}

// ===== Overlay Management =====
function toggleOverlay(show) {
    let overlay = document.querySelector('.sidebar-overlay');

    if (show && !overlay) {
        overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        document.body.appendChild(overlay);

        overlay.addEventListener('click', () => {
            elements.sidebar.classList.remove('open');
            toggleOverlay(false);
        });

        setTimeout(() => overlay.classList.add('active'), 10);
    } else if (!show && overlay) {
        overlay.classList.remove('active');
        setTimeout(() => overlay.remove(), 300);
    }
}

// ===== Chart Initialization =====
function initializeChart() {
    const options = {
        series: [
            {
                name: 'Temperature (°C)',
                data: sensorData.map(d => ({
                    x: d.timestamp.getTime(),
                    y: d.temperature
                }))
            },
            {
                name: 'Humidity (%)',
                data: sensorData.map(d => ({
                    x: d.timestamp.getTime(),
                    y: d.humidity
                }))
            }
        ],
        chart: {
            type: 'area',
            height: 300,
            fontFamily: 'Inter, sans-serif',
            background: 'transparent',
            toolbar: {
                show: false
            },
            animations: {
                enabled: true,
                easing: 'easeinout',
                speed: 800,
                dynamicAnimation: {
                    enabled: true,
                    speed: 350
                }
            }
        },
        colors: ['#f97316', '#0ea5e9'],
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.3,
                opacityTo: 0.02,
                stops: [0, 90, 100]
            }
        },
        stroke: {
            curve: 'smooth',
            width: 2.5
        },
        dataLabels: {
            enabled: false
        },
        xaxis: {
            type: 'datetime',
            labels: {
                style: {
                    colors: '#94a3b8',
                    fontSize: '11px'
                },
                datetimeFormatter: {
                    year: 'yyyy',
                    month: 'MMM \'yy',
                    day: 'dd MMM',
                    hour: 'HH:mm'
                }
            },
            axisBorder: {
                show: false
            },
            axisTicks: {
                show: false
            }
        },
        yaxis: [
            {
                title: {
                    text: 'Temperature (°C)',
                    style: {
                        color: '#f97316',
                        fontWeight: 500,
                        fontSize: '12px'
                    }
                },
                labels: {
                    style: {
                        colors: '#94a3b8',
                        fontSize: '11px'
                    },
                    formatter: (value) => value.toFixed(1)
                },
                min: 15,
                max: 35
            },
            {
                opposite: true,
                title: {
                    text: 'Humidity (%)',
                    style: {
                        color: '#0ea5e9',
                        fontWeight: 500,
                        fontSize: '12px'
                    }
                },
                labels: {
                    style: {
                        colors: '#94a3b8',
                        fontSize: '11px'
                    },
                    formatter: (value) => value.toFixed(1)
                },
                min: 30,
                max: 90
            }
        ],
        grid: {
            borderColor: '#e2e8f0',
            strokeDashArray: 0,
            xaxis: {
                lines: {
                    show: false
                }
            },
            yaxis: {
                lines: {
                    show: true
                }
            }
        },
        legend: {
            position: 'bottom',
            horizontalAlign: 'center',
            labels: {
                colors: '#475569'
            },
            markers: {
                radius: 3,
                width: 10,
                height: 10
            },
            fontSize: '13px',
            fontWeight: 500,
            itemMargin: {
                horizontal: 16,
                vertical: 8
            }
        },
        tooltip: {
            theme: 'light',
            x: {
                format: 'dd MMM HH:mm'
            },
            y: {
                formatter: (value, { seriesIndex }) => {
                    return seriesIndex === 0 ? `${value.toFixed(1)}°C` : `${value.toFixed(1)}%`;
                }
            }
        }
    };

    chart = new ApexCharts(document.querySelector('#mainChart'), options);
    chart.render();
}

// ===== Update Dashboard =====
function updateDashboard() {
    const latestData = sensorData[sensorData.length - 1];

    // Update temperature
    elements.currentTemp.textContent = latestData.temperature.toFixed(1);
    updateTempBadge(latestData.temperature);

    // Update humidity
    elements.currentHumid.textContent = latestData.humidity.toFixed(1);
    updateHumidBadge(latestData.humidity);

    // Update last update time
    const now = new Date();
    elements.lastUpdate.textContent = `Last update: ${now.toLocaleTimeString()}`;

    // Reinitialize icons (for dynamic content)
    lucide.createIcons();
}

function updateTempBadge(temp) {
    const badge = elements.tempBadge;
    badge.classList.remove('warning', 'danger');

    if (temp < 18) {
        badge.textContent = 'Cold';
        badge.classList.add('warning');
    } else if (temp > 30) {
        badge.textContent = 'Hot';
        badge.classList.add('danger');
    } else if (temp > 26) {
        badge.textContent = 'Warm';
        badge.classList.add('warning');
    } else {
        badge.textContent = 'Normal';
    }
}

function updateHumidBadge(humid) {
    const badge = elements.humidBadge;
    badge.classList.remove('warning', 'danger');

    if (humid < 40) {
        badge.textContent = 'Low';
        badge.classList.add('warning');
    } else if (humid > 70) {
        badge.textContent = 'High';
        badge.classList.add('danger');
    } else {
        badge.textContent = 'Normal';
    }
}

// ===== Update Table =====
function updateTable() {
    const tbody = elements.dataTableBody;
    const totalPages = Math.ceil(sensorData.length / itemsPerPage);

    // Get data for current page (newest first)
    const reversedData = [...sensorData].reverse();
    const startIdx = (currentPage - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    const pageData = reversedData.slice(startIdx, endIdx);

    // Clear and populate table
    tbody.innerHTML = pageData.map(item => {
        const status = getStatus(item.temperature, item.humidity);
        return `
            <tr>
                <td>${formatTimestamp(item.timestamp)}</td>
                <td>${item.temperature.toFixed(1)}</td>
                <td>${item.humidity.toFixed(1)}</td>
                <td><span class="status-badge ${status.class}">${status.text}</span></td>
            </tr>
        `;
    }).join('');

    // Update pagination info
    elements.showingStart.textContent = startIdx + 1;
    elements.showingEnd.textContent = Math.min(endIdx, sensorData.length);
    elements.totalEntries.textContent = sensorData.length;

    // Update pagination buttons
    elements.prevPage.disabled = currentPage === 1;
    elements.nextPage.disabled = currentPage === totalPages;

    // Update page numbers
    updatePageNumbers(totalPages);
}

function updatePageNumbers(totalPages) {
    const container = elements.pageNumbers;
    container.innerHTML = '';

    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage + 1 < maxVisible) {
        startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        btn.className = i === currentPage ? 'active' : '';
        btn.addEventListener('click', () => {
            currentPage = i;
            updateTable();
        });
        container.appendChild(btn);
    }
}

function getStatus(temp, humid) {
    if (temp > 30 || humid > 80) {
        return { class: 'danger', text: 'Alert' };
    } else if (temp > 26 || temp < 18 || humid > 70 || humid < 40) {
        return { class: 'warning', text: 'Warning' };
    }
    return { class: 'normal', text: 'Normal' };
}

function formatTimestamp(date) {
    return date.toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

// ===== Chart Range Filter =====
function updateChartRange(range) {
    let filteredData;
    const now = new Date();

    switch (range) {
        case 'today':
            const todayStart = new Date(now.setHours(0, 0, 0, 0));
            filteredData = sensorData.filter(d => d.timestamp >= todayStart);
            break;
        case 'week':
            const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
            filteredData = sensorData.filter(d => d.timestamp >= weekAgo);
            break;
        case 'month':
            const monthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
            filteredData = sensorData.filter(d => d.timestamp >= monthAgo);
            break;
        default:
            filteredData = sensorData;
    }

    if (filteredData.length === 0) filteredData = sensorData;

    chart.updateSeries([
        {
            name: 'Temperature (°C)',
            data: filteredData.map(d => ({
                x: d.timestamp.getTime(),
                y: d.temperature
            }))
        },
        {
            name: 'Humidity (%)',
            data: filteredData.map(d => ({
                x: d.timestamp.getTime(),
                y: d.humidity
            }))
        }
    ]);
}

// ===== Real-time Updates =====
function startRealTimeUpdates() {
    updateInterval = setInterval(() => {
        // Generate new data point
        const lastData = sensorData[sensorData.length - 1];
        const newData = {
            timestamp: new Date(),
            temperature: Math.round((lastData.temperature + (Math.random() - 0.5) * 1) * 10) / 10,
            humidity: Math.round((lastData.humidity + (Math.random() - 0.5) * 2) * 10) / 10
        };

        // Keep temperature in realistic range
        newData.temperature = Math.max(18, Math.min(32, newData.temperature));
        newData.humidity = Math.max(35, Math.min(85, newData.humidity));

        // Add new data and remove oldest if too many
        sensorData.push(newData);
        if (sensorData.length > 100) {
            sensorData.shift();
        }

        // Update dashboard
        updateDashboard();

        // Update chart with animation
        chart.updateSeries([
            {
                name: 'Temperature (°C)',
                data: sensorData.map(d => ({
                    x: d.timestamp.getTime(),
                    y: d.temperature
                }))
            },
            {
                name: 'Humidity (%)',
                data: sensorData.map(d => ({
                    x: d.timestamp.getTime(),
                    y: d.humidity
                }))
            }
        ]);

        // Update table if on first page
        if (currentPage === 1) {
            updateTable();
        }
    }, 5000);
}

// ===== Refresh Data =====
function refreshData() {
    const btn = elements.refreshBtn;
    const icon = btn.querySelector('i');

    // Add spinning animation
    icon.style.animation = 'spin 1s linear infinite';

    setTimeout(() => {
        // Generate completely new mock data
        sensorData = generateMockData();
        currentPage = 1;

        updateDashboard();
        updateTable();

        chart.updateSeries([
            {
                name: 'Temperature (°C)',
                data: sensorData.map(d => ({
                    x: d.timestamp.getTime(),
                    y: d.temperature
                }))
            },
            {
                name: 'Humidity (%)',
                data: sensorData.map(d => ({
                    x: d.timestamp.getTime(),
                    y: d.humidity
                }))
            }
        ]);

        icon.style.animation = '';
    }, 1000);
}

// ===== Export Data =====
function exportData() {
    const csvContent = [
        ['Timestamp', 'Temperature (°C)', 'Humidity (%)', 'Status'],
        ...sensorData.map(item => {
            const status = getStatus(item.temperature, item.humidity);
            return [
                formatTimestamp(item.timestamp),
                item.temperature.toFixed(1),
                item.humidity.toFixed(1),
                status.text
            ];
        })
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `sensor_data_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ===== Add CSS Animation for Refresh =====
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);
