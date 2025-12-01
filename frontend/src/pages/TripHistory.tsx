import { useEffect, useState } from 'react';
import api from '../api/axios';

interface TripHistoryItem {
    id: number;
    departure_city: string;
    destination_city: string;
    departure_date: string;
    price: number;
    status?: string; // For drivers
    trip_status?: string; // For passengers
    reservation_status?: string; // For passengers
    reservation_date?: string; // For passengers
}

export default function TripHistory() {
    const [trips, setTrips] = useState<TripHistoryItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/trips/history')
            .then(res => setTrips(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const getStatusColor = (status?: string) => {
        switch (status) {
            case 'confirmed': return '#dcfce7'; // green-100
            case 'pending': return '#fef9c3'; // yellow-100
            case 'cancelled': return '#fee2e2'; // red-100
            case 'completed': return '#dbeafe'; // blue-100
            default: return '#f3f4f6'; // gray-100
        }
    };

    const getStatusTextColor = (status?: string) => {
        switch (status) {
            case 'confirmed': return '#166534'; // green-800
            case 'pending': return '#854d0e'; // yellow-800
            case 'cancelled': return '#991b1b'; // red-800
            case 'completed': return '#1e40af'; // blue-800
            default: return '#374151'; // gray-700
        }
    };

    if (loading) return <div className="container" style={{ marginTop: '2rem' }}>Loading history...</div>;

    return (
        <div className="container">
            <div className="page-header">
                <h2>Trip History</h2>
            </div>

            {trips.length === 0 ? (
                <div className="card">
                    <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                        No past trips found.
                    </p>
                </div>
            ) : (
                <div className="grid-auto-fit">
                    {trips.map(trip => {
                        const status = trip.reservation_status || trip.status;
                        return (
                            <div key={trip.id} className="card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                    <span style={{ fontWeight: 600, color: 'var(--primary-color)' }}>
                                        {new Date(trip.departure_date).toLocaleDateString()}
                                    </span>
                                    <span style={{
                                        backgroundColor: getStatusColor(status),
                                        color: getStatusTextColor(status),
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '999px',
                                        fontSize: '0.85rem',
                                        fontWeight: 500,
                                        textTransform: 'capitalize'
                                    }}>
                                        {status}
                                    </span>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                    <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>{trip.departure_city}</span>
                                    <span style={{ color: 'var(--text-secondary)' }}>→</span>
                                    <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>{trip.destination_city}</span>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                                    <span>{trip.price} DT</span>
                                    {trip.reservation_date && (
                                        <span>Booked: {new Date(trip.reservation_date).toLocaleDateString()}</span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
