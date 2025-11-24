
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
        <div>
            <h2>My Reservations</h2>
            {reservations.length === 0 ? (
                <p>You have no reservations yet.</p>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '20px',
                    padding: '20px'
                }}>
                    {reservations.map((r) => (
                        <div
                            key={r.id}
                            style={{
                                background: 'white',
                                padding: '20px',
                                borderRadius: '10px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            }}
                        >
                            <h3>{r.departure_city} → {r.destination_city}</h3>
                            <p>Date: {new Date(r.departure_date).toLocaleString()}</p>
                            <p>Price: {r.price} TND</p>
                            <p>Status: <strong>{r.status}</strong></p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
