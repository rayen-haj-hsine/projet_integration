
import { useEffect, useState } from 'react';
import api from '../api/axios';
import { showToast } from '../components/Toast';
import { ArrowRight, Star, Calendar } from 'lucide-react';

interface TripHistoryItem {
    id: number;
    reservation_id?: number;
    departure_city: string;
    destination_city: string;
    departure_date: string;
    price: number;
    status?: string; // For drivers
    trip_status?: string; // For passengers
    reservation_status?: string; // For passengers
    reservation_date?: string; // For passengers
    rating?: number;
    rating_comment?: string;
}

export default function TripHistory() {
    const [trips, setTrips] = useState<TripHistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [selectedReservation, setSelectedReservation] = useState<number | null>(null);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        api.get('/trips/history')
            .then(res => setTrips(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const handleRateTrip = (reservationId: number) => {
        setSelectedReservation(reservationId);
        setRating(5);
        setComment('');
        setShowRatingModal(true);
    };

    const submitRating = async () => {
        if (!selectedReservation) return;

        setSubmitting(true);
        try {
            await api.post(`/reservations/${selectedReservation}/rate`, {
                rating,
                comment
            });
            showToast('Rating submitted successfully!', 'success');
            setShowRatingModal(false);

            // Refresh history
            const res = await api.get('/trips/history');
            setTrips(res.data);
        } catch (err: any) {
            showToast(err.response?.data?.error ?? 'Failed to submit rating', 'error');
        } finally {
            setSubmitting(false);
        }
    };

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
                        const isPastTrip = new Date(trip.departure_date) < new Date();
                        const canRate = trip.reservation_id && isPastTrip && !trip.rating;

                        return (
                            <div key={trip.id} className="card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                    <span style={{ fontWeight: 600, color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Calendar size={16} />
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
                                    <ArrowRight size={16} className="text-secondary" />
                                    <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>{trip.destination_city}</span>
                                </div>

                                {trip.rating && (
                                    <div style={{ margin: '0.75rem 0', padding: '0.75rem', backgroundColor: 'var(--bg-color)', borderRadius: '8px' }}>
                                        <div style={{ display: 'flex', gap: '2px', marginBottom: '0.5rem' }}>
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <Star
                                                    key={star}
                                                    size={16}
                                                    fill={star <= (trip.rating || 0) ? '#fbbf24' : 'none'}
                                                    color={star <= (trip.rating || 0) ? '#fbbf24' : '#d1d5db'}
                                                />
                                            ))}
                                        </div>
                                        {trip.rating_comment && (
                                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>
                                                "{trip.rating_comment}"
                                            </p>
                                        )}
                                    </div>
                                )}

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        {trip.price} DT
                                    </span>
                                    {trip.reservation_date && (
                                        <span>Booked: {new Date(trip.reservation_date).toLocaleDateString()}</span>
                                    )}
                                </div>

                                {canRate && (
                                    <button
                                        onClick={() => handleRateTrip(trip.reservation_id!)}
                                        className="btn"
                                        style={{ width: '100%', marginTop: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                                    >
                                        <Star size={18} /> Rate this trip
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Rating Modal */}
            {showRatingModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}
                    onClick={() => setShowRatingModal(false)}
                >
                    <div
                        className="card"
                        style={{ maxWidth: '400px', margin: '1rem' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="page-header">
                            <h3>Rate Your Trip</h3>
                        </div>
                        <div className="auth-form">
                            <div>
                                <label>Rating</label>
                                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', margin: '1rem 0' }}>
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <div
                                            key={star}
                                            onClick={() => setRating(star)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <Star
                                                size={32}
                                                fill={star <= rating ? '#fbbf24' : 'none'}
                                                color={star <= rating ? '#fbbf24' : '#d1d5db'}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label>Comment (optional)</label>
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Share your experience..."
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        borderRadius: '8px',
                                        border: '1px solid var(--border-color)',
                                        backgroundColor: 'var(--bg-color)',
                                        color: 'var(--text-primary)',
                                        minHeight: '100px',
                                        fontFamily: 'inherit'
                                    }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button onClick={submitRating} disabled={submitting} className="btn">
                                    {submitting ? 'Submitting...' : 'Submit Rating'}
                                </button>
                                <button
                                    onClick={() => setShowRatingModal(false)}
                                    className="btn btn-secondary"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
