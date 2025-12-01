
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

interface RatingData {
    id: number;
    rating: number;
    comment: string;
    created_at: string;
    user_name: string;
}

interface RatingsResponse {
    tripId: number;
    averageRating: number;
    totalRatings: number;
    ratings: RatingData[];
}

interface TripTimeEstimate {
    distance_km: number;
    formatted_duration: string;
    estimated_duration: {
        hours: number;
        minutes: number;
    };
}

export default function TripDetails() {
    const { id } = useParams();
    const [trip, setTrip] = useState<TripDetail | null>(null);
    const [ratingsData, setRatingsData] = useState<RatingsResponse | null>(null);
    const [tripTime, setTripTime] = useState<TripTimeEstimate | null>(null);

    useEffect(() => {
        api.get(`/trips/${id}`)
            .then((res) => {
                setTrip(res.data);
                // Fetch trip time estimation
                return api.post('/trips/estimate-time', {
                    departure_city: res.data.departure_city,
                    destination_city: res.data.destination_city
                });
            })
            .then((res) => setTripTime(res.data))
            .catch(console.error);

        // Fetch ratings for this trip
        api.get(`/ratings/trip/${id}`)
            .then((res) => setRatingsData(res.data))
            .catch(console.error);
    }, [id]);

    const bookTrip = async () => {
        try {
            await api.post('/reservations', { trip_id: parseInt(id!) });
            alert('Reservation created!');
            window.location.reload(); // Auto-refresh to show updated seats
        } catch (err: any) {
            alert(err.response?.data?.error || 'Booking failed');
        }
    };

    const renderStars = (rating: number) => {
        return (
            <span style={{ color: 'var(--warning-color)', fontSize: '1.1rem', letterSpacing: '2px' }}>
                {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
            </span>
        );
    };

    if (!trip) return <div className="container"><p>Loading...</p></div>;

    return (
        <div className="container">
            <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div className="page-header" style={{ marginBottom: '2rem', borderBottom: 'none', paddingBottom: 0 }}>
                    <h2>Trip Details</h2>
                </div>

                <div style={{ marginBottom: '2.5rem' }}>
                    <h3 style={{ fontSize: '1.75rem', color: 'var(--text-primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {trip.departure_city}
                        <span style={{ color: 'var(--text-tertiary)', fontSize: '1.5rem' }}>→</span>
                        {trip.destination_city}
                    </h3>
                    <p style={{ fontSize: '1.125rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                        {new Date(trip.departure_date).toLocaleString(undefined, {
                            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                    </p>
                </div>

                <div className="grid-auto-fit" style={{ gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
                    <div style={{ padding: '1.5rem', backgroundColor: 'var(--bg-color)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                        <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Price per seat</p>
                        <p style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--text-primary)', lineHeight: 1 }}>{trip.price} TND</p>
                    </div>
                    <div style={{ padding: '1.5rem', backgroundColor: 'var(--bg-color)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                        <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Available Seats</p>
                        <p style={{ fontSize: '2rem', fontWeight: '700', color: trip.available_seats > 0 ? 'var(--success-color)' : 'var(--error-color)', lineHeight: 1 }}>
                            {trip.available_seats}
                        </p>
                    </div>
                    {tripTime && (
                        <div style={{ padding: '1.5rem', backgroundColor: 'var(--bg-color)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                            <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                                ⏱️ Estimated Duration
                            </p>
                            <p style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--primary-color)', lineHeight: 1 }}>
                                {tripTime.formatted_duration}
                            </p>
                            <p style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: 'var(--text-tertiary)' }}>
                                ~{tripTime.distance_km} km
                            </p>
                        </div>
                    )}
                </div>

                <div style={{ marginBottom: '2.5rem', padding: '1.5rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                    <h4 style={{ marginBottom: '1rem' }}>Driver Information</h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--primary-color)',
                            color: 'var(--bg-color)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold',
                            fontSize: '1.25rem'
                        }}>
                            {trip.driver_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p style={{ marginBottom: 0, fontWeight: 600, color: 'var(--text-primary)', fontSize: '1.1rem' }}>{trip.driver_name}</p>
                            <p style={{ marginBottom: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{trip.driver_phone}</p>
                        </div>
                    </div>
                </div>

                {/* Ratings Section */}
                {ratingsData && ratingsData.totalRatings > 0 && (
                    <div style={{ marginBottom: '2.5rem' }}>
                        <h4 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            Ratings
                            <span style={{
                                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                                color: 'var(--warning-color)',
                                padding: '0.25rem 0.75rem',
                                borderRadius: 'var(--radius-xl)',
                                fontSize: '0.9rem',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem'
                            }}>
                                {ratingsData.averageRating.toFixed(1)} ★
                            </span>
                            <span style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', fontWeight: 400 }}>
                                ({ratingsData.totalRatings} {ratingsData.totalRatings === 1 ? 'review' : 'reviews'})
                            </span>
                        </h4>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {ratingsData.ratings.map((rating) => (
                                <div key={rating.id} style={{ padding: '1.25rem', backgroundColor: 'var(--bg-color)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{rating.user_name}</span>
                                        {renderStars(rating.rating)}
                                    </div>
                                    {rating.comment && (
                                        <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                            {rating.comment}
                                        </p>
                                    )}
                                    <p style={{ margin: 0, marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                                        {new Date(rating.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <button
                    onClick={bookTrip}
                    className="btn"
                    style={{ width: '100%', padding: '1rem', fontSize: '1rem' }}
                    disabled={trip.available_seats === 0}
                >
                    {trip.available_seats > 0 ? 'Book This Trip' : 'Sold Out'}
                </button>
            </div>
        </div>
    );
}
