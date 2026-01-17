import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Server } from 'lucide-react';

const DeviceManager = () => {
    const [devices, setDevices] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentDevice, setCurrentDevice] = useState(null);

    const [formData, setFormData] = useState({
        device_code: '',
        device_name: '',
        ip_address: '',
        room_id: ''
    });

    const fetchData = async () => {
        try {
            const [devRes, roomRes] = await Promise.all([
                fetch('http://localhost:3000/api/devices'),
                fetch('http://localhost:3000/api/rooms')
            ]);
            const devData = await devRes.json();
            const roomData = await roomRes.json();

            setDevices(devData);
            setRooms(roomData);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleOpenModal = (device = null) => {
        if (device) {
            setCurrentDevice(device);
            setFormData({
                device_code: device.device_code,
                device_name: device.device_name,
                ip_address: device.ip_address || '',
                room_id: device.room_id || ''
            });
        } else {
            setCurrentDevice(null);
            setFormData({
                device_code: '',
                device_name: '',
                ip_address: '',
                room_id: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentDevice(null);
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = currentDevice
                ? `http://localhost:3000/api/devices/${currentDevice.device_id}`
                : 'http://localhost:3000/api/devices';

            const method = currentDevice ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                fetchData();
                handleCloseModal();
            } else {
                alert('Failed to save device');
            }
        } catch (error) {
            console.error('Error saving device:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this device? Tags and logs will be lost.')) {
            try {
                await fetch(`http://localhost:3000/api/devices/${id}`, {
                    method: 'DELETE'
                });
                fetchData();
            } catch (error) {
                console.error('Error deleting device:', error);
            }
        }
    };

    return (
        <div className="device-manager">
            <div className="header">
                <div>
                    <h1>Device Management</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                        Register and manage IoT controllers (ESP32)
                    </p>
                </div>
                <button className="btn-primary" onClick={() => handleOpenModal()}>
                    <Plus size={18} style={{ marginRight: '8px' }} />
                    Add Device
                </button>
            </div>

            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Device Code</th>
                            <th>Name</th>
                            <th>IP Address</th>
                            <th>Room</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {devices.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                                    No devices found
                                </td>
                            </tr>
                        ) : (
                            devices.map((device) => (
                                <tr key={device.device_id}>
                                    <td>{device.device_id}</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Server size={14} color="var(--primary-blue)" />
                                            <b>{device.device_code}</b>
                                        </div>
                                    </td>
                                    <td>{device.device_name}</td>
                                    <td>{device.ip_address || '-'}</td>
                                    <td>
                                        {device.room_name ? (
                                            <span className="metric-status-badge normal">
                                                {device.room_name}
                                            </span>
                                        ) : (
                                            <span className="metric-status-badge warning" style={{ color: 'grey', background: '#f1f1f1' }}>
                                                Unassigned
                                            </span>
                                        )}
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                            <button
                                                className="btn-outline"
                                                style={{ padding: '6px 10px' }}
                                                onClick={() => handleOpenModal(device)}
                                            >
                                                <Pencil size={14} />
                                            </button>
                                            <button
                                                className="btn-danger"
                                                onClick={() => handleDelete(device.device_id)}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">
                                {currentDevice ? 'Edit Device' : 'Add New Device'}
                            </h2>
                            <button className="close-btn" onClick={handleCloseModal}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group" style={{ marginBottom: '16px' }}>
                                <label className="form-label">Device Code (Unique)</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    name="device_code"
                                    value={formData.device_code}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g. ESP32-001"
                                />
                            </div>

                            <div className="form-group" style={{ marginBottom: '16px' }}>
                                <label className="form-label">Device Name</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    name="device_name"
                                    value={formData.device_name}
                                    onChange={handleChange}
                                    placeholder="e.g. Main Sensor Lab"
                                />
                            </div>

                            <div className="form-group" style={{ marginBottom: '16px' }}>
                                <label className="form-label">IP Address</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    name="ip_address"
                                    value={formData.ip_address}
                                    onChange={handleChange}
                                    placeholder="192.168.1.10"
                                />
                            </div>

                            <div className="form-group" style={{ marginBottom: '24px' }}>
                                <label className="form-label">Room</label>
                                <select
                                    className="form-input"
                                    name="room_id"
                                    value={formData.room_id}
                                    onChange={handleChange}
                                >
                                    <option value="">-- Select Room --</option>
                                    {rooms.map(r => (
                                        <option key={r.room_id} value={r.room_id}>
                                            {r.room_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn-secondary" onClick={handleCloseModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    {currentDevice ? 'Update Device' : 'Add Device'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DeviceManager;
