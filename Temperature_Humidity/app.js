// ===== TempHumid Pro - Professional IoT Monitoring Dashboard =====
// ESP32 + DHT11 Temperature & Humidity Monitoring System

// ===== Configuration =====
const CONFIG = {
    updateInterval: 5000, // 5 seconds
    dataRetention: 100, // Keep last 100 readings
    thresholds: {
        temp: { low: 18, high: 30, critical: 35 },
        humid: { low: 40, high: 70, critical: 85 }
    },
    apiEndpoint: null, // Set this if using real API
    mockMode: true // Use mock data for demo
};

// ===== State Management =====
let state = {
    sensorData: [],
    currentPage: 1,
    itemsPerPage: 10,
    activePageId: 'dashboard',
    theme: localStorage.getItem('theme') || 'light',
    updateInterval: null,
    chart: null,
    dailyChart: null,
    statusChart: null,
    weeklyChart: null,
    alerts: []
};

// ===== Mock Data Generator =====
const generateMockData = () => {
    const now = new Date();
    const data = [];

    for (let i = 49; i >= 0; i--) {
        const timestamp = new Date(now - i * 30 * 60 * 1000);
        const hour = timestamp.getHours();

        // Simulate realistic temperature patterns
        const baseTemp = 24 + Math.sin(hour / 24 * Math.PI * 2) * 3;
        const baseHumid = 55 + Math.cos(hour / 24 * Math.PI * 2) * 10;

        const tempVariation = (Math.random() - 0.5) * 2;
        const humidVariation = (Math.random() - 0.5) * 5;

        data.push({
            timestamp: timestamp,
            temperature: Math.round((baseTemp + tempVariation) * 10) / 10,
            humidity: Math.round((baseHumid + humidVariation) * 10) / 10
        });
    }

    return data;
};

// ===== DOM Elements Cache =====
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// ===== Initialize Application =====
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    // Initialize Lucide icons
    lucide.createIcons();

    // Apply saved theme
    applyTheme(state.theme);

    // Generate initial mock data
    state.sensorData = generateMockData();

    // Setup all event listeners
    setupEventListeners();

    // Initialize charts
    initializeMainChart();

    // Update all dashboard elements
    updateDashboard();
    updateTable();
    updateStatistics();

    // Start real-time clock
    updateClock();
    setInterval(updateClock, 1000);

    // Start real-time data updates
    startRealTimeUpdates();

    // Generate sample alerts
    generateSampleAlerts();
}

// ===== Theme Management =====
function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    state.theme = theme;
    localStorage.setItem('theme', theme);

    // Update checkbox if exists
    const darkModeCheckbox = $('#darkModeCheckbox');
    if (darkModeCheckbox) {
        darkModeCheckbox.checked = theme === 'dark';
    }
}

function toggleTheme() {
    const newTheme = state.theme === 'light' ? 'dark' : 'light';
    applyTheme(newTheme);

    // Reinitialize chart with new theme
    if (state.chart) {
        state.chart.updateOptions({
            theme: { mode: newTheme }
        });
    }
}

// ===== Event Listeners =====
function setupEventListeners() {
    // Mobile menu toggle
    $('#mobileMenuBtn')?.addEventListener('click', () => {
        $('#sidebar').classList.toggle('open');
        $('#sidebarOverlay').classList.toggle('active');
    });

    // Sidebar overlay click
    $('#sidebarOverlay')?.addEventListener('click', () => {
        $('#sidebar').classList.remove('open');
        $('#sidebarOverlay').classList.remove('active');
    });

    // Theme toggle
    $('#themeToggle')?.addEventListener('click', toggleTheme);

    // Dark mode checkbox in settings
    $('#darkModeCheckbox')?.addEventListener('change', (e) => {
        applyTheme(e.target.checked ? 'dark' : 'light');
    });

    // Navigation items
    $$('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.dataset.page;
            if (page) navigateToPage(page);
        });
    });

    // Chart filter buttons
    $$('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            $$('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            updateChartRange(e.target.dataset.range);
        });
    });

    // Refresh button
    $('#refreshBtn')?.addEventListener('click', refreshData);
    $('#refreshChart')?.addEventListener('click', refreshData);

    // Export button
    $('#exportBtn')?.addEventListener('click', exportData);

    // Pagination
    $('#prevPage')?.addEventListener('click', () => {
        if (state.currentPage > 1) {
            state.currentPage--;
            updateTable();
        }
    });

    $('#nextPage')?.addEventListener('click', () => {
        const totalPages = Math.ceil(state.sensorData.length / state.itemsPerPage);
        if (state.currentPage < totalPages) {
            state.currentPage++;
            updateTable();
        }
    });

    // Settings save button
    $('#saveSettings')?.addEventListener('click', saveSettings);
    $('#resetSettings')?.addEventListener('click', resetSettings);
}

// ===== Navigation =====
function navigateToPage(pageId) {
    // Update nav items
    $$('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.page === pageId);
    });

    // Hide all pages
    $$('.page').forEach(page => page.classList.add('hidden'));

    // Show target page
    const targetPage = $(`#${pageId}Page`);
    if (targetPage) {
        targetPage.classList.remove('hidden');
    }

    // Update breadcrumb
    const breadcrumb = $('#currentPageTitle');
    if (breadcrumb) {
        breadcrumb.textContent = pageId.charAt(0).toUpperCase() + pageId.slice(1);
    }

    // Close mobile sidebar
    if (window.innerWidth <= 768) {
        $('#sidebar').classList.remove('open');
        $('#sidebarOverlay').classList.remove('active');
    }

    // Initialize page-specific charts
    state.activePageId = pageId;
    if (pageId === 'analytics') {
        setTimeout(() => initializeAnalyticsCharts(), 100);
    }

    // Reinitialize icons
    lucide.createIcons();
}

// ===== Clock Update =====
function updateClock() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    $('#currentTime').textContent = timeString;
}

// ===== Dashboard Updates =====
function updateDashboard() {
    if (state.sensorData.length === 0) return;

    const latestData = state.sensorData[state.sensorData.length - 1];
    const previousData = state.sensorData.length > 1 ?
        state.sensorData[state.sensorData.length - 2] : latestData;

    // Update temperature
    updateGauge('temp', latestData.temperature, 0, 50);
    updateGaugeStatus('tempStatus', latestData.temperature, CONFIG.thresholds.temp);
    updateTrend('tempTrend', latestData.temperature - previousData.temperature, '°C');

    // Update humidity
    updateGauge('humid', latestData.humidity, 0, 100);
    updateGaugeStatus('humidStatus', latestData.humidity, CONFIG.thresholds.humid);
    updateTrend('humidTrend', latestData.humidity - previousData.humidity, '%');

    // Update values display
    $('#currentTemp').textContent = latestData.temperature.toFixed(1);
    $('#currentHumid').textContent = latestData.humidity.toFixed(1);

    // Update last reading time
    $('#lastUpdate').textContent = latestData.timestamp.toLocaleTimeString('en-GB');

    // Reinitialize icons
    lucide.createIcons();
}

function updateGauge(type, value, min, max) {
    const progress = $(`#${type}Progress`);
    if (!progress) return;

    const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
    const circumference = 2 * Math.PI * 42; // radius = 42
    const offset = circumference - (percentage / 100) * circumference;

    progress.style.strokeDasharray = circumference;
    progress.style.strokeDashoffset = offset;
}

function updateGaugeStatus(elementId, value, thresholds) {
    const statusEl = $(`#${elementId}`);
    if (!statusEl) return;

    let status = 'Normal';
    let statusClass = '';

    if (value < thresholds.low) {
        status = 'Low';
        statusClass = 'warning';
    } else if (value > thresholds.critical) {
        status = 'Critical';
        statusClass = 'danger';
    } else if (value > thresholds.high) {
        status = 'High';
        statusClass = 'warning';
    }

    statusEl.innerHTML = `<span class="status-dot ${statusClass ? statusClass : 'normal'}"></span><span>${status}</span>`;
    statusEl.className = `gauge-status ${statusClass}`;
}

function updateTrend(elementId, change, unit) {
    const trendEl = $(`#${elementId}`);
    if (!trendEl) return;

    const isUp = change >= 0;
    const icon = isUp ? 'trending-up' : 'trending-down';
    const trendClass = isUp ? 'up' : 'down';
    const sign = isUp ? '+' : '';

    trendEl.innerHTML = `
        <i data-lucide="${icon}"></i>
        <span>${sign}${change.toFixed(1)}${unit} from 1h ago</span>
    `;
    trendEl.className = `gauge-trend ${trendClass}`;
}

function updateStatistics() {
    if (state.sensorData.length === 0) return;

    const temps = state.sensorData.map(d => d.temperature);
    const humids = state.sensorData.map(d => d.humidity);

    $('#maxTemp').textContent = `${Math.max(...temps).toFixed(1)}°C`;
    $('#minTemp').textContent = `${Math.min(...temps).toFixed(1)}°C`;
    $('#maxHumid').textContent = `${Math.max(...humids).toFixed(1)}%`;
    $('#minHumid').textContent = `${Math.min(...humids).toFixed(1)}%`;

    const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length;
    const avgHumid = humids.reduce((a, b) => a + b, 0) / humids.length;

    $('#avgTemp').textContent = `Avg: ${avgTemp.toFixed(1)}°C`;
    $('#avgHumid').textContent = `Avg: ${avgHumid.toFixed(1)}%`;
}

// ===== Chart Initialization =====
function initializeMainChart() {
    const isDark = state.theme === 'dark';

    const options = {
        series: [
            {
                name: 'Temperature (°C)',
                data: state.sensorData.map(d => ({
                    x: d.timestamp.getTime(),
                    y: d.temperature
                }))
            },
            {
                name: 'Humidity (%)',
                data: state.sensorData.map(d => ({
                    x: d.timestamp.getTime(),
                    y: d.humidity
                }))
            }
        ],
        chart: {
            type: 'area',
            height: 320,
            fontFamily: 'Inter, sans-serif',
            background: 'transparent',
            toolbar: { show: false },
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
        colors: ['#ff6b6b', '#4facfe'],
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.4,
                opacityTo: 0.05,
                stops: [0, 90, 100]
            }
        },
        stroke: {
            curve: 'smooth',
            width: 3
        },
        dataLabels: { enabled: false },
        xaxis: {
            type: 'datetime',
            labels: {
                style: {
                    colors: isDark ? '#94a3b8' : '#64748b',
                    fontSize: '11px'
                },
                datetimeFormatter: {
                    year: 'yyyy',
                    month: "MMM 'yy",
                    day: 'dd MMM',
                    hour: 'HH:mm'
                }
            },
            axisBorder: { show: false },
            axisTicks: { show: false }
        },
        yaxis: [
            {
                title: {
                    text: 'Temperature (°C)',
                    style: {
                        color: '#ff6b6b',
                        fontWeight: 600,
                        fontSize: '12px'
                    }
                },
                labels: {
                    style: {
                        colors: isDark ? '#94a3b8' : '#64748b',
                        fontSize: '11px'
                    },
                    formatter: (value) => value.toFixed(1)
                },
                min: 15,
                max: 40
            },
            {
                opposite: true,
                title: {
                    text: 'Humidity (%)',
                    style: {
                        color: '#4facfe',
                        fontWeight: 600,
                        fontSize: '12px'
                    }
                },
                labels: {
                    style: {
                        colors: isDark ? '#94a3b8' : '#64748b',
                        fontSize: '11px'
                    },
                    formatter: (value) => value.toFixed(1)
                },
                min: 20,
                max: 100
            }
        ],
        grid: {
            borderColor: isDark ? '#334155' : '#e2e8f0',
            strokeDashArray: 0,
            xaxis: { lines: { show: false } },
            yaxis: { lines: { show: true } }
        },
        legend: { show: false },
        tooltip: {
            theme: isDark ? 'dark' : 'light',
            x: { format: 'dd MMM HH:mm' },
            y: {
                formatter: (value, { seriesIndex }) => {
                    return seriesIndex === 0 ? `${value.toFixed(1)}°C` : `${value.toFixed(1)}%`;
                }
            }
        }
    };

    state.chart = new ApexCharts($('#mainChart'), options);
    state.chart.render();
}

function initializeAnalyticsCharts() {
    // Daily Average Chart
    if (!state.dailyChart && $('#dailyChart')) {
        const dailyData = calculateDailyAverages();

        state.dailyChart = new ApexCharts($('#dailyChart'), {
            series: [{
                name: 'Avg Temperature',
                data: dailyData.temps
            }, {
                name: 'Avg Humidity',
                data: dailyData.humids
            }],
            chart: {
                type: 'bar',
                height: 280,
                fontFamily: 'Inter, sans-serif',
                background: 'transparent',
                toolbar: { show: false }
            },
            colors: ['#ff6b6b', '#4facfe'],
            plotOptions: {
                bar: {
                    horizontal: false,
                    columnWidth: '55%',
                    borderRadius: 6
                }
            },
            dataLabels: { enabled: false },
            xaxis: {
                categories: dailyData.labels,
                labels: {
                    style: { colors: '#64748b' }
                }
            },
            yaxis: {
                labels: {
                    style: { colors: '#64748b' }
                }
            },
            grid: {
                borderColor: '#e2e8f0'
            },
            legend: {
                position: 'bottom'
            }
        });
        state.dailyChart.render();
    }

    // Status Distribution Chart
    if (!state.statusChart && $('#statusChart')) {
        const statusData = calculateStatusDistribution();

        state.statusChart = new ApexCharts($('#statusChart'), {
            series: statusData.values,
            chart: {
                type: 'donut',
                height: 280,
                fontFamily: 'Inter, sans-serif'
            },
            labels: statusData.labels,
            colors: ['#10b981', '#f59e0b', '#ef4444'],
            plotOptions: {
                pie: {
                    donut: {
                        size: '65%',
                        labels: {
                            show: true,
                            name: { fontSize: '14px' },
                            value: { fontSize: '18px', fontWeight: 700 }
                        }
                    }
                }
            },
            legend: {
                position: 'bottom'
            }
        });
        state.statusChart.render();
    }

    // Weekly Trend Chart
    if (!state.weeklyChart && $('#weeklyChart')) {
        state.weeklyChart = new ApexCharts($('#weeklyChart'), {
            series: [{
                name: 'Temperature',
                data: state.sensorData.slice(-24).map(d => ({
                    x: d.timestamp.getTime(),
                    y: d.temperature
                }))
            }, {
                name: 'Humidity',
                data: state.sensorData.slice(-24).map(d => ({
                    x: d.timestamp.getTime(),
                    y: d.humidity
                }))
            }],
            chart: {
                type: 'line',
                height: 320,
                fontFamily: 'Inter, sans-serif',
                background: 'transparent',
                toolbar: { show: false }
            },
            colors: ['#ff6b6b', '#4facfe'],
            stroke: {
                curve: 'smooth',
                width: 2
            },
            xaxis: {
                type: 'datetime',
                labels: {
                    style: { colors: '#64748b' }
                }
            },
            yaxis: {
                labels: {
                    style: { colors: '#64748b' }
                }
            },
            grid: {
                borderColor: '#e2e8f0'
            },
            legend: {
                position: 'bottom'
            }
        });
        state.weeklyChart.render();
    }
}

function calculateDailyAverages() {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date().getDay();
    const labels = [];
    const temps = [];
    const humids = [];

    for (let i = 6; i >= 0; i--) {
        const dayIndex = (today - i + 7) % 7;
        labels.push(days[dayIndex]);

        // Generate realistic mock averages
        temps.push(Math.round((23 + Math.random() * 5) * 10) / 10);
        humids.push(Math.round((55 + Math.random() * 15) * 10) / 10);
    }

    return { labels, temps, humids };
}

function calculateStatusDistribution() {
    let normal = 0, warning = 0, danger = 0;

    state.sensorData.forEach(d => {
        const status = getStatus(d.temperature, d.humidity);
        if (status.class === 'normal') normal++;
        else if (status.class === 'warning') warning++;
        else danger++;
    });

    return {
        labels: ['Normal', 'Warning', 'Critical'],
        values: [normal, warning, danger]
    };
}

// ===== Chart Range Filter =====
function updateChartRange(range) {
    const now = new Date();
    let filteredData;

    switch (range) {
        case '1h':
            const hourAgo = new Date(now - 60 * 60 * 1000);
            filteredData = state.sensorData.filter(d => d.timestamp >= hourAgo);
            break;
        case '6h':
            const sixHoursAgo = new Date(now - 6 * 60 * 60 * 1000);
            filteredData = state.sensorData.filter(d => d.timestamp >= sixHoursAgo);
            break;
        case '24h':
            const dayAgo = new Date(now - 24 * 60 * 60 * 1000);
            filteredData = state.sensorData.filter(d => d.timestamp >= dayAgo);
            break;
        case '7d':
        default:
            filteredData = state.sensorData;
    }

    if (filteredData.length === 0) filteredData = state.sensorData;

    state.chart?.updateSeries([
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
    state.updateInterval = setInterval(() => {
        if (!CONFIG.mockMode) {
            // Fetch from real API
            fetchSensorData();
        } else {
            // Generate mock data
            generateNewDataPoint();
        }
    }, CONFIG.updateInterval);
}

function generateNewDataPoint() {
    const lastData = state.sensorData[state.sensorData.length - 1];
    const hour = new Date().getHours();

    // Add some realistic variation
    const tempChange = (Math.random() - 0.5) * 0.8;
    const humidChange = (Math.random() - 0.5) * 1.5;

    const newData = {
        timestamp: new Date(),
        temperature: Math.max(15, Math.min(40,
            Math.round((lastData.temperature + tempChange) * 10) / 10
        )),
        humidity: Math.max(20, Math.min(95,
            Math.round((lastData.humidity + humidChange) * 10) / 10
        ))
    };

    // Add to data array
    state.sensorData.push(newData);

    // Keep data within retention limit
    if (state.sensorData.length > CONFIG.dataRetention) {
        state.sensorData.shift();
    }

    // Update all displays
    updateDashboard();
    updateStatistics();

    // Update chart
    state.chart?.updateSeries([
        {
            name: 'Temperature (°C)',
            data: state.sensorData.map(d => ({
                x: d.timestamp.getTime(),
                y: d.temperature
            }))
        },
        {
            name: 'Humidity (%)',
            data: state.sensorData.map(d => ({
                x: d.timestamp.getTime(),
                y: d.humidity
            }))
        }
    ]);

    // Update table if on first page
    if (state.currentPage === 1) {
        updateTable();
    }

    // Check for alerts
    checkAlerts(newData);
}

async function fetchSensorData() {
    if (!CONFIG.apiEndpoint) return;

    try {
        const response = await fetch(CONFIG.apiEndpoint);
        const data = await response.json();

        const newData = {
            timestamp: new Date(),
            temperature: data.temperature,
            humidity: data.humidity
        };

        state.sensorData.push(newData);

        if (state.sensorData.length > CONFIG.dataRetention) {
            state.sensorData.shift();
        }

        updateDashboard();
        updateStatistics();
        updateChart();

        if (state.currentPage === 1) {
            updateTable();
        }

        checkAlerts(newData);

    } catch (error) {
        console.error('Failed to fetch sensor data:', error);
        updateConnectionStatus(false);
    }
}

function updateConnectionStatus(isOnline) {
    const badge = $('#connectionBadge');
    const dot = badge?.querySelector('.connection-dot');

    if (badge && dot) {
        if (isOnline) {
            dot.classList.remove('offline');
            dot.classList.add('online');
            badge.innerHTML = '<span class="connection-dot online"></span><span>Connected</span>';
        } else {
            dot.classList.remove('online');
            dot.classList.add('offline');
            badge.innerHTML = '<span class="connection-dot offline"></span><span>Disconnected</span>';
        }
    }
}

// ===== Table Management =====
function updateTable() {
    const tbody = $('#dataTableBody');
    if (!tbody) return;

    const totalPages = Math.ceil(state.sensorData.length / state.itemsPerPage);
    const reversedData = [...state.sensorData].reverse();
    const startIdx = (state.currentPage - 1) * state.itemsPerPage;
    const endIdx = startIdx + state.itemsPerPage;
    const pageData = reversedData.slice(startIdx, endIdx);

    tbody.innerHTML = pageData.map(item => {
        const status = getStatus(item.temperature, item.humidity);
        return `
            <tr>
                <td>${formatTimestamp(item.timestamp)}</td>
                <td><strong>${item.temperature.toFixed(1)}°C</strong></td>
                <td><strong>${item.humidity.toFixed(1)}%</strong></td>
                <td><span class="status-badge ${status.class}">${status.text}</span></td>
            </tr>
        `;
    }).join('');

    // Update pagination info
    $('#showingStart').textContent = startIdx + 1;
    $('#showingEnd').textContent = Math.min(endIdx, state.sensorData.length);
    $('#totalEntries').textContent = state.sensorData.length;

    // Update pagination buttons
    const prevBtn = $('#prevPage');
    const nextBtn = $('#nextPage');
    if (prevBtn) prevBtn.disabled = state.currentPage === 1;
    if (nextBtn) nextBtn.disabled = state.currentPage === totalPages;

    updatePageNumbers(totalPages);
}

function updatePageNumbers(totalPages) {
    const container = $('#pageNumbers');
    if (!container) return;

    container.innerHTML = '';

    const maxVisible = 5;
    let startPage = Math.max(1, state.currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage + 1 < maxVisible) {
        startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        btn.className = i === state.currentPage ? 'active' : '';
        btn.addEventListener('click', () => {
            state.currentPage = i;
            updateTable();
        });
        container.appendChild(btn);
    }
}

function getStatus(temp, humid) {
    if (temp > CONFIG.thresholds.temp.critical || humid > CONFIG.thresholds.humid.critical) {
        return { class: 'danger', text: 'Critical' };
    } else if (temp > CONFIG.thresholds.temp.high || humid > CONFIG.thresholds.humid.high ||
        temp < CONFIG.thresholds.temp.low || humid < CONFIG.thresholds.humid.low) {
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

// ===== Refresh Data =====
function refreshData() {
    const refreshBtn = $('#refreshBtn');
    const refreshIcon = refreshBtn?.querySelector('i');

    if (refreshIcon) {
        refreshIcon.style.animation = 'spin 1s linear infinite';
    }

    setTimeout(() => {
        state.sensorData = generateMockData();
        state.currentPage = 1;

        updateDashboard();
        updateTable();
        updateStatistics();

        state.chart?.updateSeries([
            {
                name: 'Temperature (°C)',
                data: state.sensorData.map(d => ({
                    x: d.timestamp.getTime(),
                    y: d.temperature
                }))
            },
            {
                name: 'Humidity (%)',
                data: state.sensorData.map(d => ({
                    x: d.timestamp.getTime(),
                    y: d.humidity
                }))
            }
        ]);

        if (refreshIcon) {
            refreshIcon.style.animation = '';
        }

        showToast('Data refreshed successfully', 'success');
    }, 1000);
}

// ===== Export Data =====
function exportData() {
    const csvContent = [
        ['Timestamp', 'Temperature (°C)', 'Humidity (%)', 'Status'],
        ...state.sensorData.map(item => {
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
    link.href = URL.createObjectURL(blob);
    link.download = `sensor_data_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    showToast('Data exported successfully', 'success');
}

// ===== Alerts System =====
function generateSampleAlerts() {
    state.alerts = [
        {
            id: 1,
            type: 'warning',
            title: 'High Temperature Warning',
            message: 'Temperature exceeded 28°C at 14:30',
            time: '2 hours ago'
        },
        {
            id: 2,
            type: 'danger',
            title: 'Critical Humidity Level',
            message: 'Humidity dropped below 40% at 10:15',
            time: '5 hours ago'
        },
        {
            id: 3,
            type: 'success',
            title: 'System Connected',
            message: 'ESP32 device reconnected successfully',
            time: '6 hours ago'
        }
    ];

    renderAlerts();
}

function checkAlerts(data) {
    const { temperature, humidity } = data;

    if (temperature > CONFIG.thresholds.temp.critical) {
        addAlert('danger', 'Critical Temperature!',
            `Temperature reached ${temperature.toFixed(1)}°C`);
    } else if (temperature > CONFIG.thresholds.temp.high) {
        addAlert('warning', 'High Temperature Warning',
            `Temperature is ${temperature.toFixed(1)}°C`);
    }

    if (humidity > CONFIG.thresholds.humid.critical) {
        addAlert('danger', 'Critical Humidity!',
            `Humidity reached ${humidity.toFixed(1)}%`);
    } else if (humidity < CONFIG.thresholds.humid.low) {
        addAlert('warning', 'Low Humidity Warning',
            `Humidity dropped to ${humidity.toFixed(1)}%`);
    }
}

function addAlert(type, title, message) {
    const alert = {
        id: Date.now(),
        type,
        title,
        message,
        time: 'Just now'
    };

    state.alerts.unshift(alert);

    // Update badge count
    const badge = $('.nav-badge');
    if (badge) {
        badge.textContent = Math.min(state.alerts.length, 99);
    }

    renderAlerts();
    showToast(message, type === 'danger' ? 'error' : type);
}

function renderAlerts() {
    const container = $('#alertsList');
    if (!container) return;

    container.innerHTML = state.alerts.map(alert => `
        <div class="alert-item ${alert.type}">
            <div class="alert-icon">
                <i data-lucide="${alert.type === 'danger' ? 'alert-triangle' :
            alert.type === 'warning' ? 'alert-circle' : 'check-circle'}"></i>
            </div>
            <div class="alert-content">
                <div class="alert-title">${alert.title}</div>
                <div class="alert-message">${alert.message}</div>
            </div>
            <div class="alert-time">${alert.time}</div>
        </div>
    `).join('');

    lucide.createIcons();
}

// ===== Settings Management =====
function saveSettings() {
    const settings = {
        highTempThreshold: Number($('#highTempThreshold')?.value) || 30,
        lowTempThreshold: Number($('#lowTempThreshold')?.value) || 18,
        highHumidThreshold: Number($('#highHumidThreshold')?.value) || 80,
        lowHumidThreshold: Number($('#lowHumidThreshold')?.value) || 40,
        updateInterval: Number($('#updateInterval')?.value) || 5,
        dataRetention: Number($('#dataRetention')?.value) || 30
    };

    // Update config
    CONFIG.thresholds.temp.high = settings.highTempThreshold;
    CONFIG.thresholds.temp.low = settings.lowTempThreshold;
    CONFIG.thresholds.humid.high = settings.highHumidThreshold;
    CONFIG.thresholds.humid.low = settings.lowHumidThreshold;

    // Save to localStorage
    localStorage.setItem('settings', JSON.stringify(settings));

    showToast('Settings saved successfully', 'success');
}

function resetSettings() {
    const defaults = {
        highTempThreshold: 30,
        lowTempThreshold: 18,
        highHumidThreshold: 80,
        lowHumidThreshold: 40,
        updateInterval: 5,
        dataRetention: 30
    };

    if ($('#highTempThreshold')) $('#highTempThreshold').value = defaults.highTempThreshold;
    if ($('#lowTempThreshold')) $('#lowTempThreshold').value = defaults.lowTempThreshold;
    if ($('#highHumidThreshold')) $('#highHumidThreshold').value = defaults.highHumidThreshold;
    if ($('#lowHumidThreshold')) $('#lowHumidThreshold').value = defaults.lowHumidThreshold;
    if ($('#updateInterval')) $('#updateInterval').value = defaults.updateInterval;
    if ($('#dataRetention')) $('#dataRetention').value = defaults.dataRetention;

    localStorage.removeItem('settings');

    showToast('Settings reset to default', 'success');
}

// ===== Toast Notifications =====
function showToast(message, type = 'success') {
    const container = $('#toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i data-lucide="${type === 'success' ? 'check-circle' :
            type === 'error' ? 'x-circle' : 'alert-circle'}"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);
    lucide.createIcons();

    // Auto remove after 4 seconds
    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// ===== Utility Functions =====
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ===== Window Resize Handler =====
window.addEventListener('resize', debounce(() => {
    state.chart?.updateOptions({});
}, 250));

// ===== Cleanup on Page Unload =====
window.addEventListener('beforeunload', () => {
    if (state.updateInterval) {
        clearInterval(state.updateInterval);
    }
});
