
import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Link } from 'react-router-dom';

interface Trip {
    id: number;
    departure_city: string;
    destination_city: string;
    departure_date: string;
    price: number;
    available_seats: number;
    status: string;
}

export default function MyTrips() {
    const [trips, setTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(true);

    const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
    const [editForm, setEditForm] = useState({
        departure_date: '',
        price: '',
        available_seats: ''
    });

    const loadMyTrips = async () => {
        setLoading(true);
        try {
            const res = await api.get('/trips/my');
            setTrips(res.data || []);
        } catch (err) {
            console.error(err);
            alert('Failed to load your trips');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTrip = async (tripId: number) => {
        if (!window.confirm('Are you sure you want to delete this trip? This action cannot be undone.')) {
            return;
        }

        try {
            await api.delete(`/trips/${tripId}`);
            alert('Trip deleted successfully');
            loadMyTrips(); // Reload the list
        } catch (err: any) {
            const errorMsg = err.response?.data?.error || 'Failed to delete trip';
            alert(errorMsg);
        }
    };

    const handleEditClick = (trip: Trip) => {
        setEditingTrip(trip);
        // Format date for datetime-local input (YYYY-MM-DDTHH:mm)
        const date = new Date(trip.departure_date);
        const formattedDate = date.toISOString().slice(0, 16);

        setEditForm({
            departure_date: formattedDate,
            price: trip.price.toString(),
            available_seats: trip.available_seats.toString()
        });
    };

    const handleUpdateTrip = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingTrip) return;

        try {
            await api.patch(`/trips/${editingTrip.id}`, {
                departure_date: editForm.departure_date,
                price: parseFloat(editForm.price),
                available_seats: parseInt(editForm.available_seats)
            });
            alert('Trip updated successfully');
            setEditingTrip(null);
            loadMyTrips();
        } catch (err: any) {
            alert(err.response?.data?.error || 'Failed to update trip');
        }
    };

    useEffect(() => {
        loadMyTrips();
    }, []);

    return (
        <div style={{ maxWidth: 900, margin: '20px auto' }}>
            <h2 style={{ marginBottom: 12 }}>My Trips</h2>

            {loading ? (
                <p>Loading…</p>
            ) : trips.length === 0 ? (
                <div>
                    <p>You haven't published any trips yet.</p>
                    <Link to="/publish-trip">
                        <button>Publish your first trip</button>
                    </Link>
                </div>
            ) : (
                <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 12 }}>
                    {trips.map((trip) => (
                        <li
                            key={trip.id}
                            style={{
                                background: 'var(--card-bg)',
                                border: '1px solid var(--border-color)',
                                borderRadius: 8,
                                padding: 12
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 8 }}>
                                <div>
                                    <strong>
                                        {trip.departure_city} → {trip.destination_city}
                                    </strong>
                                    <div style={{ marginTop: 4 }}>
                                        Date: {new Date(trip.departure_date).toLocaleString()}
                                    </div>
                                    <div>Price: {trip.price} TND</div>
                                    <div>Seats: {trip.available_seats}</div>
                                    <div>Status: {trip.status}</div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    <Link to={`/my-trips/${trip.id}/reservations`}>
                                        <button className="btn" style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>Manage Requests</button>
                                    </Link>
                                    <button
                                        onClick={() => handleEditClick(trip)}
                                        className="btn-secondary"
                                        style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                                    >
                                        Edit
                                    </button>
                                    <Link to={`/trips/${trip.id}`}>
                                        <button className="btn-secondary" style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>View</button>
                                    </Link>
                                    <button
                                        onClick={() => handleDeleteTrip(trip.id)}
                                        className="btn-danger"
                                        style={{
                                            fontSize: '0.875rem',
                                            padding: '0.5rem 1rem',
                                            borderRadius: '999px'
                                        }}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {/* Edit Modal */}
            {editingTrip && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'var(--card-bg)', padding: '20px', borderRadius: '8px',
                        width: '90%', maxWidth: '400px', border: '1px solid var(--border-color)'
                    }}>
                        <h3>Edit Trip</h3>
                        <form onSubmit={handleUpdateTrip} style={{ display: 'grid', gap: '12px', marginTop: '16px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '4px' }}>Date & Time</label>
                                <input
                                    type="datetime-local"
                                    value={editForm.departure_date}
                                    onChange={e => setEditForm({ ...editForm, departure_date: e.target.value })}
                                    required
                                    style={{ width: '100%', padding: '8px' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '4px' }}>Price (TND)</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={editForm.price}
                                    onChange={e => setEditForm({ ...editForm, price: e.target.value })}
                                    required
                                    style={{ width: '100%', padding: '8px' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '4px' }}>Available Seats</label>
                                <input
                                    type="number"
                                    min="1"
                                    step="1"
                                    value={editForm.available_seats}
                                    onChange={e => setEditForm({ ...editForm, available_seats: e.target.value })}
                                    required
                                    style={{ width: '100%', padding: '8px' }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                <button type="submit" className="btn">Save Changes</button>
                                <button
                                    type="button"
                                    onClick={() => setEditingTrip(null)}
                                    className="btn-secondary"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
