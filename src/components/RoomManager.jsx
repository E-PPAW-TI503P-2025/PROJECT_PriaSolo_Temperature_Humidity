import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';

const RoomManager = () => {
    const [rooms, setRooms] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentRoom, setCurrentRoom] = useState(null); // If set, we are editing
    const [formData, setFormData] = useState({
        room_name: '',
        location: '',
        description: ''
    });

    const fetchRooms = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/rooms');
            const data = await response.json();
            setRooms(data);
        } catch (error) {
            console.error('Error fetching rooms:', error);
        }
    };

    useEffect(() => {
        fetchRooms();
    }, []);

    const handleOpenModal = (room = null) => {
        if (room) {
            setCurrentRoom(room);
            setFormData({
                room_name: room.room_name,
                location: room.location,
                description: room.description
            });
        } else {
            setCurrentRoom(null);
            setFormData({
                room_name: '',
                location: '',
                description: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentRoom(null);
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
            const url = currentRoom
                ? `http://localhost:3000/api/rooms/${currentRoom.room_id}`
                : 'http://localhost:3000/api/rooms';

            const method = currentRoom ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                fetchRooms();
                handleCloseModal();
            }
        } catch (error) {
            console.error('Error saving room:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this room?')) {
            try {
                await fetch(`http://localhost:3000/api/rooms/${id}`, {
                    method: 'DELETE'
                });
                fetchRooms();
            } catch (error) {
                console.error('Error deleting room:', error);
            }
        }
    };

    return (
        <div className="room-manager">
            <div className="header">
                <div>
                    <h1>Room Management</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                        Manage locations and server rooms
                    </p>
                </div>
                <button className="btn-primary" onClick={() => handleOpenModal()}>
                    <Plus size={18} style={{ marginRight: '8px' }} />
                    Add Room
                </button>
            </div>

            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Room Name</th>
                            <th>Location</th>
                            <th>Description</th>
                            <th>Created At</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rooms.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                                    No rooms found
                                </td>
                            </tr>
                        ) : (
                            rooms.map((room) => (
                                <tr key={room.room_id}>
                                    <td>{room.room_id}</td>
                                    <td><b>{room.room_name}</b></td>
                                    <td>{room.location}</td>
                                    <td>{room.description}</td>
                                    <td>{new Date(room.created_at).toLocaleDateString()}</td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                            <button
                                                className="btn-outline"
                                                style={{ padding: '6px 10px' }}
                                                onClick={() => handleOpenModal(room)}
                                            >
                                                <Pencil size={14} />
                                            </button>
                                            <button
                                                className="btn-danger"
                                                onClick={() => handleDelete(room.room_id)}
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
                                {currentRoom ? 'Edit Room' : 'Add New Room'}
                            </h2>
                            <button className="close-btn" onClick={handleCloseModal}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group" style={{ marginBottom: '16px' }}>
                                <label className="form-label">Room Name</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    name="room_name"
                                    value={formData.room_name}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g. Server Room 1"
                                />
                            </div>

                            <div className="form-group" style={{ marginBottom: '16px' }}>
                                <label className="form-label">Location</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    placeholder="e.g. Floor 2, Building A"
                                />
                            </div>

                            <div className="form-group" style={{ marginBottom: '24px' }}>
                                <label className="form-label">Description</label>
                                <textarea
                                    className="form-input"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="3"
                                    style={{ resize: 'vertical' }}
                                    placeholder="Optional description..."
                                ></textarea>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn-secondary" onClick={handleCloseModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    {currentRoom ? 'Update Room' : 'Add Room'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoomManager;
