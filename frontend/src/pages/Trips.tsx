
import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight, Calendar, Users } from 'lucide-react';

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
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [minSeats, setMinSeats] = useState('');
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
        if (minPrice) params.minPrice = minPrice;
        if (maxPrice) params.maxPrice = maxPrice;
        if (minSeats) params.minSeats = minSeats;

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
        setMinPrice('');
        setMaxPrice('');
        setMinSeats('');
        fetchTrips();
    };

    useEffect(() => {
        fetchTrips();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        fetchTrips();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [departureCity, destinationCity, afterDate, minPrice, maxPrice, minSeats]);

    return (
        <div className="container">
            <div className="page-header">
                <h2>Find a Ride</h2>
            </div>

            <div className="card" style={{ marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Search size={20} /> Search Filters
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', alignItems: 'end' }}>
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
                    <div>
                        <label>Min Price (DT)</label>
                        <input
                            type="number"
                            placeholder="0"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                            min="0"
                            step="0.5"
                        />
                    </div>
                    <div>
                        <label>Max Price (DT)</label>
                        <input
                            type="number"
                            placeholder="Any"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                            min="0"
                            step="0.5"
                        />
                    </div>
                    <div>
                        <label>Min Seats</label>
                        <input
                            type="number"
                            placeholder="1"
                            value={minSeats}
                            onChange={(e) => setMinSeats(e.target.value)}
                            min="1"
                            step="1"
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
                                <ArrowRight size={16} className="text-secondary" />
                                <span>{trip.destination_city}</span>
                            </div>
                            <div className="card-subtitle" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Calendar size={14} />
                                {new Date(trip.departure_date).toLocaleDateString(undefined, {
                                    weekday: 'short',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
                                <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    {trip.price} TND
                                </span>
                                <span
                                    style={{
                                        fontSize: '0.875rem',
                                        fontWeight: 500,
                                        color: trip.available_seats > 0 ? 'var(--success-color)' : 'var(--error-color)',
                                        backgroundColor: trip.available_seats > 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: 'var(--radius-sm)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.25rem'
                                    }}
                                >
                                    <Users size={14} />
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
