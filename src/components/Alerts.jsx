import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Clock, RefreshCw } from 'lucide-react';

const Alerts = () => {
    const [alerts, setAlerts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasCritical, setHasCritical] = useState(false);

    const fetchAlerts = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:3000/api/alerts');
            const data = await response.json();
            setAlerts(data);

            // Cek jika ada alert active
            const hasActive = data.some(a => a.alert_status === 'Active');
            setHasCritical(hasActive);
        } catch (error) {
            console.error('Error fetching alerts:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAlerts();
        const interval = setInterval(fetchAlerts, 5000); // Auto refresh every 5s
        return () => clearInterval(interval);
    }, []);

    const markAsResolved = async (id) => {
        try {
            await fetch(`http://localhost:3000/api/alerts/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'Resolved' })
            });
            fetchAlerts();
        } catch (error) {
            console.error('Error updating alert:', error);
        }
    };

    return (
        <div className="alerts-page">
            <div className="header">
                <div>
                    <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        Alerts History
                        {hasCritical && (
                            <span style={{
                                fontSize: '12px',
                                background: '#fee2e2',
                                color: '#ef4444',
                                padding: '4px 10px',
                                borderRadius: '20px',
                                border: '1px solid #fecaca',
                                display: 'flex', alignItems: 'center', gap: '4px'
                            }}>
                                <span className="online-dot" style={{ background: '#ef4444', animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite' }}></span>
                                CRITICAL: High Temp!
                            </span>
                        )}
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                        Monitor critical events and threshold violations
                    </p>
                </div>

                <button
                    className="btn-outline"
                    onClick={fetchAlerts}
                    disabled={isLoading}
                    title="Refresh Data"
                >
                    <RefreshCw
                        size={18}
                        className={isLoading ? 'spin' : ''}
                        style={{
                            color: hasCritical ? '#ef4444' : 'var(--text-secondary)',
                            transition: 'color 0.3s'
                        }}
                    />
                    Refresh
                </button>
            </div>

            <style>
                {`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes ping {
                    75%, 100% {
                        transform: scale(2);
                        opacity: 0;
                    }
                }
            `}
            </style>

            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Status</th>
                            <th>Threshold</th>
                            <th>Room / Location</th>
                            <th>Time</th>
                            <th style={{ textAlign: 'right' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {alerts.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                                    No alerts found
                                </td>
                            </tr>
                        ) : (
                            alerts.map((alert) => (
                                <tr key={alert.alert_id} style={alert.alert_status === 'Active' ? { backgroundColor: '#fef2f2' } : {}}>
                                    <td>#{alert.alert_id}</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            {alert.alert_status === 'Active' ? (
                                                <AlertTriangle size={16} color="var(--warning-orange)" />
                                            ) : (
                                                <CheckCircle size={16} color="var(--normal-green)" />
                                            )}
                                            <span
                                                className={`metric-status-badge ${alert.alert_status === 'Active' ? 'warning' : 'normal'}`}
                                            >
                                                {alert.alert_status}
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        <span style={{ fontWeight: '600', color: alert.alert_status === 'Active' ? '#ef4444' : 'inherit' }}>
                                            &gt; {alert.threshold_suhu}°C
                                        </span>
                                    </td>
                                    <td>
                                        <div>
                                            <b>{alert.room_name || 'Unknown Room'}</b>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '13px' }}>
                                            <Clock size={14} />
                                            {new Date(alert.alert_time).toLocaleString('id-ID', {
                                                day: 'numeric', month: 'short', year: 'numeric',
                                                hour: '2-digit', minute: '2-digit', second: '2-digit'
                                            })}
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        {alert.alert_status === 'Active' && (
                                            <button
                                                className="btn-outline"
                                                onClick={() => markAsResolved(alert.alert_id)}
                                                style={{
                                                    fontSize: '12px',
                                                    padding: '6px 12px',
                                                    backgroundColor: 'white',
                                                    borderColor: '#ef4444',
                                                    color: '#ef4444'
                                                }}
                                            >
                                                Mark Resolved
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Alerts;
