
import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

interface Trip {
    id: number;
    departure_city: string;
    destination_city: string;
    departure_date: string;
    price: number;
    available_seats: number;
}

export default function Trips() {
    const [trips, setTrips] = useState<Trip[]>([]);
    const [departureCity, setDepartureCity] = useState('');
    const [destinationCity, setDestinationCity] = useState('');
    const [afterDate, setAfterDate] = useState('');
    const navigate = useNavigate();

    const fetchTrips = () => {
        const params: any = {};
        if (departureCity) params.departure_city = departureCity;
        if (destinationCity) params.destination_city = destinationCity;
        if (afterDate) params.from_date = afterDate;

        api.get('/trips', { params })
            .then((res) => setTrips(res.data.results))
            .catch(console.error);
    };

    const resetFilters = () => {
        setDepartureCity('');
        setDestinationCity('');
        setAfterDate('');
        fetchTrips();
    };

    useEffect(() => {
        fetchTrips();
    }, []);

    useEffect(() => {
        fetchTrips();
    }, [departureCity, destinationCity, afterDate]);

    return (
        <div>
            <h2>Search Trips</h2>
            <div style={{ marginBottom: '20px' }}>
                <input
                    type="text"
                    placeholder="Departure City"
                    value={departureCity}
                    onChange={(e) => setDepartureCity(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Destination City"
                    value={destinationCity}
                    onChange={(e) => setDestinationCity(e.target.value)}
                />
                <input
                    type="date"
                    value={afterDate}
                    onChange={(e) => setAfterDate(e.target.value)}
                />
                <button type="button" onClick={resetFilters}>Reset</button>
            </div>

            <h2>Available Trips</h2>
            {trips.length === 0 ? (
                <p>No trips found.</p>
            ) : (
                <ul style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
                    {trips.map((trip) => (
                        <li
                            key={trip.id}
                            onClick={() => navigate(`/trips/${trip.id}`)}
                            style={{
                                background: 'white',
                                padding: '15px',
                                borderRadius: '8px',
                                boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                                cursor: 'pointer',
                                transition: 'transform 0.2s ease',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
                            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                        >
                            <strong>{trip.departure_city} → {trip.destination_city}</strong>
                            <p>{trip.price} TND | Seats: {trip.available_seats}</p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
