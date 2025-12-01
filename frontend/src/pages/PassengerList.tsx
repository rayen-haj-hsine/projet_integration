import { useEffect, useState } from 'react';
import api from '../api/axios';

interface Passenger {
    id: number;
    name: string;
    email: string;
    phone: string;
    created_at: string;
    last_reservation_date: string | null;
    departure_city: string | null;
    destination_city: string | null;
    trip_date: string | null;
}

export default function PassengerList() {
    const [passengers, setPassengers] = useState<Passenger[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchPassengers();
    }, []);

    const fetchPassengers = async () => {
        try {
            const res = await api.get('/admin/passengers');
            setPassengers(res.data);
        } catch (err) {
            setError('Failed to fetch passengers');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="container" style={{ padding: '2rem', textAlign: 'center' }}>Loading passengers...</div>;
    if (error) return <div className="container" style={{ padding: '2rem', color: 'red' }}>{error}</div>;

    return (
        <div className="container" style={{ padding: '2rem 1rem', maxWidth: '1200px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem', color: 'var(--text-primary)' }}>
                Passengers
            </h1>

            <div style={{
                backgroundColor: 'var(--card-bg)',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                overflow: 'hidden',
                boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
            }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: 'var(--bg-color)', borderBottom: '1px solid var(--border-color)' }}>
                            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)' }}>Name</th>
                            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)' }}>Contact</th>
                            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)' }}>Joined</th>
                            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)' }}>Last Reservation</th>
                        </tr>
                    </thead>
                    <tbody>
                        {passengers.length === 0 ? (
                            <tr>
                                <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                    No passengers found.
                                </td>
                            </tr>
                        ) : (
                            passengers.map(p => (
                                <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ fontWeight: 500 }}>{p.name}</div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ fontSize: '0.9rem' }}>{p.email}</div>
                                        {p.phone && <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{p.phone}</div>}
                                    </td>
                                    <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                        {new Date(p.created_at).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        {p.last_reservation_date ? (
                                            <div>
                                                <div style={{ fontWeight: 500 }}>
                                                    {p.departure_city} → {p.destination_city}
                                                </div>
                                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                                    Trip: {new Date(p.trip_date!).toLocaleDateString()}
                                                </div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                                    Booked: {new Date(p.last_reservation_date).toLocaleDateString()}
                                                </div>
                                            </div>
                                        ) : (
                                            <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>No reservations</span>
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
}
