
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
        <div>
            <h2>{trip.departure_city} → {trip.destination_city}</h2>
            <p>Date: {new Date(trip.departure_date).toLocaleString()}</p>
            <p>Price: {trip.price} TND</p>
            <p>Seats: {trip.available_seats}</p>
            <p>Driver: {trip.driver_name} ({trip.driver_phone})</p>
            <button onClick={bookTrip}>Book Trip</button>
        </div>
    );
}
