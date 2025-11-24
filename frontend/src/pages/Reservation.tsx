
import { useEffect, useState } from 'react';
import api from '../api/axios';

interface Reservation {
    id: number;
    status: string;
    departure_city: string;
    destination_city: string;
    departure_date: string;
    price: number;
}

export default function Reservations() {
    const [reservations, setReservations] = useState<Reservation[]>([]);

    useEffect(() => {
        api.get('/reservations/me')
            .then((res) => setReservations(res.data))
            .catch(console.error);
    }, []);

    return (
        <div className="container">
            <div className="page-header">
                <h2>My Reservations</h2>
            </div>

            {reservations.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <p>You have no reservations yet.</p>
                    <a href="/" className="btn" style={{ marginTop: '1rem' }}>Find a Trip</a>
                </div>
            ) : (
                <div className="grid-auto-fit">
                    {reservations.map((r) => (
                        <div key={r.id} className="card">
                            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span>{r.departure_city}</span>
                                <span style={{ color: 'var(--text-secondary)' }}>→</span>
                                <span>{r.destination_city}</span>
                            </div>
                            <div className="card-subtitle">
                                {new Date(r.departure_date).toLocaleString(undefined, {
                                    weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                })}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                                <span style={{ fontWeight: 600 }}>{r.price} TND</span>
                                <span style={{
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '999px',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    backgroundColor: r.status === 'confirmed' ? '#dcfce7' : '#fef9c3',
                                    color: r.status === 'confirmed' ? '#166534' : '#854d0e'
                                }}>
                                    {r.status.toUpperCase()}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
