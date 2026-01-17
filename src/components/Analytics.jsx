import { useState, useEffect } from 'react';
import { Database, RefreshCw, Download, ChevronLeft, ChevronRight } from 'lucide-react';

const Analytics = () => {
    const [logs, setLogs] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalEntries, setTotalEntries] = useState(0);
    const [loading, setLoading] = useState(false);

    const fetchLogs = async (currentPage) => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:3000/api/sensor/logs?page=${currentPage}&limit=10`);
            const data = await response.json();

            setLogs(data.data);
            setTotalPages(data.totalPages);
            setTotalEntries(data.total);
            setPage(data.page);
        } catch (error) {
            console.error('Error fetching logs:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs(page);
    }, [page]);

    const handlePrev = () => {
        if (page > 1) setPage(page - 1);
    };

    const handleNext = () => {
        if (page < totalPages) setPage(page + 1);
    };

    // Fungsi Export Data ke CSV
    const handleExport = async () => {
        try {
            // 1. Ambil data banyak (misal 1000 terakhir) untuk report
            const response = await fetch('http://localhost:3000/api/sensor/logs?limit=1000');
            const result = await response.json();
            const dataToExport = result.data;

            // 2. Buat Header CSV
            const headers = ['Timestamp, Device, Temperature (C), Humidity (%), Light (Lux), Status'];

            // 3. Convert Data ke String CSV
            const csvContent = dataToExport.map(row => {
                return `${row.timestamp},"${row.device_name}",${row.temp},${row.humidity},${row.cahaya},${row.status}`;
            }).join('\n');

            const csvString = [headers, csvContent].join('\n');

            // 4. Trigger Download
            const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', `sensor_logs_${new Date().toISOString().slice(0, 10)}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Gagal export data:', error);
            alert('Gagal mendownload data.');
        }
    };

    return (
        <div className="analytics-page">
            <div className="table-container">
                {/* Table Header */}
                <div className="table-header">
                    <div className="table-title">
                        <Database size={20} />
                        Data Logs
                    </div>
                    <div className="table-actions">
                        <button className="btn-outline" onClick={() => fetchLogs(page)} disabled={loading}>
                            <RefreshCw size={14} className={loading ? "spin" : ""} />
                            Refresh
                        </button>
                        <button className="btn-outline" onClick={handleExport}>
                            <Download size={14} />
                            Export
                        </button>
                    </div>
                </div>

                {/* Data Table */}
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Timestamp</th>
                            <th>Device</th>
                            <th>Temperature (°C)</th>
                            <th>Humidity (%)</th>
                            <th>Light (Lux)</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>Loading data...</td>
                            </tr>
                        ) : logs.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>No data available</td>
                            </tr>
                        ) : (
                            logs.map((log) => (
                                <tr key={log.id}>
                                    <td>{log.timestamp}</td>
                                    <td>{log.device_name || 'Unknown'}</td>
                                    <td>{log.temp}</td>
                                    <td>{log.humidity}</td>
                                    <td>{log.cahaya}</td>
                                    <td>
                                        <span className={`status-text ${log.status.toLowerCase()}`}>
                                            {log.status}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {/* Pagination */}
                <div className="pagination-container">
                    <div className="showing-text">
                        Showing page {page} of {totalPages} ({totalEntries} entries)
                    </div>
                    <div className="pagination">
                        <button
                            className="page-btn"
                            onClick={handlePrev}
                            disabled={page === 1 || loading}
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button className="page-btn active">{page}</button>
                        <button
                            className="page-btn"
                            onClick={handleNext}
                            disabled={page === totalPages || loading}
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
