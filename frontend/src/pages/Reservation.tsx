
import { useEffect, useState } from 'react';
import api from '../api/axios';

interface Reservation {
    id: number;
    trip_id: number;
    status: string;
    departure_city: string;
    destination_city: string;
    departure_date: string;
    price: number;
    passenger_name?: string;
}

interface Rating {
    rating: number;
    comment: string;
}

export default function Reservations() {
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [showRatingModal, setShowRatingModal] = useState<number | null>(null);
    const [ratingData, setRatingData] = useState<Rating>({ rating: 5, comment: '' });
    const [userRole, setUserRole] = useState<string | null>(null);

    useEffect(() => {
        api.get('/reservations/me')
            .then((res) => setReservations(res.data))
            .catch(console.error);

        // Get user role from localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                setUserRole(user.role);
            } catch { }
        }
    }, []);

    const isTripCompleted = (departureDate: string) => {
        return new Date(departureDate) < new Date();
    };

    const handleRateTrip = (reservationId: number) => {
        setShowRatingModal(reservationId);
        setRatingData({ rating: 5, comment: '' });
    };

    const submitRating = async (reservationId: number) => {
        try {
            await api.post('/ratings', {
                reservation_id: reservationId,
                rating: ratingData.rating,
                comment: ratingData.comment
            });
            alert('Rating submitted successfully!');
            setShowRatingModal(null);
            window.location.reload(); // Refresh to show updated page
        } catch (err: any) {
            const errorMsg = err.response?.data?.error || 'Failed to submit rating';
            alert(errorMsg);
        }
    };

    const handleConfirmReservation = async (reservationId: number) => {
        try {
            await api.patch(`/reservations/${reservationId}/confirm`);
            alert('Reservation confirmed!');
            window.location.reload(); // Refresh to update reservation list
        } catch (err: any) {
            const errorMsg = err.response?.data?.error || 'Failed to confirm reservation';
            alert(errorMsg);
        }
    };

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
                            {r.passenger_name && userRole === 'driver' && (
                                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                                    Passenger: <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{r.passenger_name}</span>
                                </div>
                            )}
                            <div className="card-subtitle">
                                {new Date(r.departure_date).toLocaleString(undefined, {
                                    weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                })}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                                <span style={{ fontWeight: 600 }}>{r.price} TND</span>
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                    <span style={{
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '999px',
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        backgroundColor: r.status === 'confirmed' ? '#dcfce7' : r.status === 'cancelled' ? '#fee2e2' : '#fef9c3',
                                        color: r.status === 'confirmed' ? '#166534' : r.status === 'cancelled' ? '#991b1b' : '#854d0e'
                                    }}>
                                        {r.status.toUpperCase()}
                                    </span>

                                    {/* Driver: Confirm button for pending reservations */}
                                    {userRole === 'driver' && r.status === 'pending' && (
                                        <>
                                            <button
                                                onClick={() => handleConfirmReservation(r.id)}
                                                className="btn"
                                                style={{
                                                    padding: '0.25rem 0.75rem',
                                                    fontSize: '0.75rem',
                                                    borderRadius: '999px',
                                                    cursor: 'pointer',
                                                    backgroundColor: '#10b981',
                                                    borderColor: '#10b981'
                                                }}
                                            >
                                                ✓ Confirm
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (window.confirm('Are you sure you want to reject this reservation?')) {
                                                        api.patch(`/reservations/${r.id}/cancel`)
                                                            .then(() => {
                                                                alert('Reservation rejected');
                                                                window.location.reload();
                                                            })
                                                            .catch(err => alert(err.response?.data?.error ?? 'Failed to reject reservation'));
                                                    }
                                                }}
                                                className="btn-danger"
                                                style={{
                                                    padding: '0.25rem 0.75rem',
                                                    fontSize: '0.75rem',
                                                    borderRadius: '999px',
                                                    cursor: 'pointer',
                                                    border: 'none',
                                                    color: 'white'
                                                }}
                                            >
                                                ✗ Reject
                                            </button>
                                        </>
                                    )}

                                    {/* Passenger: Cancel button */}
                                    {userRole === 'passenger' && r.status !== 'cancelled' && (
                                        <button
                                            onClick={() => {
                                                if (window.confirm('Are you sure you want to cancel this reservation?')) {
                                                    api.patch(`/reservations/${r.id}/cancel`)
                                                        .then(() => {
                                                            alert('Reservation cancelled');
                                                            window.location.reload(); // Refresh list
                                                        })
                                                        .catch(err => alert(err.response?.data?.error ?? 'Failed to cancel reservation'));
                                                }
                                            }}
                                            className="btn-danger"
                                            style={{
                                                padding: '0.25rem 0.75rem',
                                                fontSize: '0.75rem',
                                                borderRadius: '999px',
                                                cursor: 'pointer',
                                                border: 'none',
                                                color: 'white'
                                            }}
                                        >
                                            Cancel
                                        </button>
                                    )}

                                    {/* Passenger: Rate button */}
                                    {userRole === 'passenger' && r.status === 'confirmed' && isTripCompleted(r.departure_date) && (
                                        <button
                                            onClick={() => handleRateTrip(r.id)}
                                            className="btn"
                                            style={{
                                                padding: '0.25rem 0.75rem',
                                                fontSize: '0.75rem',
                                                borderRadius: '999px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            ⭐ Rate Trip
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Rating Modal */}
            {showRatingModal !== null && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div className="card" style={{ maxWidth: '500px', width: '90%', padding: '2rem' }}>
                        <h3 style={{ marginBottom: '1.5rem' }}>Rate Your Trip</h3>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Rating</label>
                            <div style={{ display: 'flex', gap: '0.5rem', fontSize: '2rem' }}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <span
                                        key={star}
                                        onClick={() => setRatingData({ ...ratingData, rating: star })}
                                        style={{
                                            cursor: 'pointer',
                                            color: star <= ratingData.rating ? '#fbbf24' : '#d1d5db'
                                        }}
                                    >
                                        ★
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                                Comment (optional)
                            </label>
                            <textarea
                                value={ratingData.comment}
                                onChange={(e) => setRatingData({ ...ratingData, comment: e.target.value })}
                                placeholder="Share your experience..."
                                maxLength={1000}
                                style={{
                                    width: '100%',
                                    minHeight: '100px',
                                    padding: '0.75rem',
                                    borderRadius: '4px',
                                    border: '1px solid var(--border-color)',
                                    backgroundColor: 'var(--bg-color)',
                                    color: 'var(--text-primary)',
                                    resize: 'vertical'
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setShowRatingModal(null)}
                                className="btn-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => submitRating(showRatingModal)}
                                className="btn"
                            >
                                Submit Rating
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
