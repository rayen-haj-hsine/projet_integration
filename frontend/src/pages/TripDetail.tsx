
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';

interface TripDetail {
    id: number;
    departure_city: string;
    destination_city: string;
    departure_date: string;
    price: number;
    available_seats: number;
    driver_name: string;
    driver_phone: string;
}

export default function TripDetails() {
    const { id } = useParams();
    const [trip, setTrip] = useState<TripDetail | null>(null);

    useEffect(() => {
        api.get(`/trips/${id}`)
            .then((res) => setTrip(res.data))
            .catch(console.error);
    }, [id]);

    const bookTrip = async () => {
        try {
            await api.post('/reservations', { trip_id: parseInt(id!) });
            alert('Reservation created!');
        } catch (err: any) {
            alert(err.response?.data?.error || 'Booking failed');
        }
    };

    if (!trip) return <p>Loading...</p>;

    return (
        <div className="container">
            <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
                <div className="page-header">
                    <h2>Trip Details</h2>
                </div>

                <div style={{ marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1.5rem', color: 'var(--primary-color)', marginBottom: '0.5rem' }}>
                        {trip.departure_city} <span style={{ color: 'var(--text-secondary)' }}>→</span> {trip.destination_city}
                    </h3>
                    <p style={{ fontSize: '1.125rem', fontWeight: 500 }}>
                        {new Date(trip.departure_date).toLocaleString(undefined, {
                            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                    <div style={{ padding: '1rem', backgroundColor: 'var(--bg-color)', borderRadius: 'var(--radius-md)' }}>
                        <p style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>Price per seat</p>
                        <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{trip.price} TND</p>
                    </div>
                    <div style={{ padding: '1rem', backgroundColor: 'var(--bg-color)', borderRadius: 'var(--radius-md)' }}>
                        <p style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>Available Seats</p>
                        <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: trip.available_seats > 0 ? 'var(--secondary-color)' : '#ef4444' }}>
                            {trip.available_seats}
                        </p>
                    </div>
                </div>

                <div style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                    <h4 style={{ marginBottom: '0.5rem' }}>Driver Information</h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--primary-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                            {trip.driver_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p style={{ marginBottom: 0, fontWeight: 500, color: 'var(--text-primary)' }}>{trip.driver_name}</p>
                            <p style={{ marginBottom: 0, fontSize: '0.875rem' }}>{trip.driver_phone}</p>
                        </div>
                    </div>
                </div>

                <button onClick={bookTrip} className="btn" style={{ width: '100%', padding: '1rem', fontSize: '1rem' }} disabled={trip.available_seats === 0}>
                    {trip.available_seats > 0 ? 'Book This Trip' : 'Sold Out'}
                </button>
            </div>
        </div>
    );
}
