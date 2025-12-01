
import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

interface Trip {
    id: number;
    driver_id: number;
    departure_city: string;
    destination_city: string;
    departure_date: string;
    price: number;
    available_seats: number;
    status?: string;
}

export default function Trips() {
    const [trips, setTrips] = useState<Trip[]>([]);
    const [departureCity, setDepartureCity] = useState('');
    const [destinationCity, setDestinationCity] = useState('');
    const [afterDate, setAfterDate] = useState('');
    const navigate = useNavigate();

    const currentUser = (() => {
        try {
            return JSON.parse(localStorage.getItem('user') || '{}');
        } catch {
            return {};
        }
    })();

    const fetchTrips = () => {
        const params: Record<string, string> = {};
        if (departureCity) params.departure_city = departureCity;
        if (destinationCity) params.destination_city = destinationCity;
        if (afterDate) params.from_date = afterDate;

        api
            .get('/trips', { params })
            .then((res) => {
                let results: Trip[] = res.data?.results ?? [];

                if (currentUser?.role === 'driver' && typeof currentUser?.id === 'number') {
                    results = results.filter((t) => t.driver_id !== currentUser.id);
                }

                setTrips(results);
            })
            .catch((err) => {
                console.error(err);
                alert('Failed to load trips');
            });
    };

    const resetFilters = () => {
        setDepartureCity('');
        setDestinationCity('');
        setAfterDate('');
        fetchTrips();
    };

    useEffect(() => {
        fetchTrips();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        fetchTrips();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [departureCity, destinationCity, afterDate]);

    return (
        <div className="container">
            <div className="page-header">
                <h2>Find a Ride</h2>
            </div>

            <div className="card" style={{ marginBottom: '2rem' }}>
                <div className="grid-auto-fit" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'end' }}>
                    <div>
                        <label>From</label>
                        <input
                            type="text"
                            placeholder="Departure City"
                            value={departureCity}
                            onChange={(e) => setDepartureCity(e.target.value)}
                        />
                    </div>
                    <div>
                        <label>To</label>
                        <input
                            type="text"
                            placeholder="Destination City"
                            value={destinationCity}
                            onChange={(e) => setDestinationCity(e.target.value)}
                        />
                    </div>
                    <div>
                        <label>Date</label>
                        <input
                            type="date"
                            value={afterDate}
                            onChange={(e) => setAfterDate(e.target.value)}
                        />
                    </div>
                    <button type="button" onClick={resetFilters} className="btn-secondary">
                        Reset Filters
                    </button>
                </div>
            </div>

            <h3 style={{ marginBottom: '1.5rem' }}>Available Trips</h3>

            {trips.length === 0 ? (
                <p>No trips found matching your criteria.</p>
            ) : (
                <div className="grid-auto-fit">
                    {trips.map((trip) => (
                        <div
                            key={trip.id}
                            className="card"
                            onClick={() => navigate(`/trips/${trip.id}`)}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span>{trip.departure_city}</span>
                                <span style={{ color: 'var(--text-tertiary)' }}>→</span>
                                <span>{trip.destination_city}</span>
                            </div>
                            <div className="card-subtitle">
                                {new Date(trip.departure_date).toLocaleDateString(undefined, {
                                    weekday: 'short',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
                                <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                                    {trip.price} TND
                                </span>
                                <span
                                    style={{
                                        fontSize: '0.875rem',
                                        fontWeight: 500,
                                        color: trip.available_seats > 0 ? 'var(--success-color)' : 'var(--error-color)',
                                        backgroundColor: trip.available_seats > 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: 'var(--radius-sm)'
                                    }}
                                >
                                    {trip.available_seats} seats left
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
