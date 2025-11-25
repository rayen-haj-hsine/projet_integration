
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
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <Link to={`/trips/${trip.id}`}>
                                        <button>View</button>
                                    </Link>
                                    <button
                                        onClick={() => handleDeleteTrip(trip.id)}
                                        style={{
                                            backgroundColor: '#dc2626',
                                            color: 'white',
                                            border: 'none',
                                            padding: '0.5rem 1rem',
                                            borderRadius: '4px',
                                            cursor: 'pointer'
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
        </div>
    );
}
