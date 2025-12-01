import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

interface Reservation {
    id: number;
    trip_id: number;
    status: string;
    created_at: string;
    passenger_id: number;
    passenger_name: string;
    passenger_email: string;
}

export default function TripReservations() {
    const { tripId } = useParams();
    const navigate = useNavigate();
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!tripId) return;
        setLoading(true);
        api.get(`/reservations/trip/${tripId}`)
            .then(res => setReservations(res.data))
            .catch(err => {
                console.error(err);
                alert('Failed to load reservations');
                navigate('/my-trips');
            })
            .finally(() => setLoading(false));
    }, [tripId, navigate]);

    const handleAction = async (reservationId: number, action: 'confirm' | 'reject') => {
        if (!window.confirm(`Are you sure you want to ${action} this reservation?`)) return;

        try {
            const endpoint = action === 'confirm'
                ? `/reservations/${reservationId}/confirm`
                : `/reservations/${reservationId}/cancel`; // Rejecting is essentially cancelling

            await api.patch(endpoint);
            alert(`Reservation ${action}ed successfully`);

            // Refresh list
            const res = await api.get(`/reservations/trip/${tripId}`);
            setReservations(res.data);
        } catch (err: any) {
            const errorMsg = err.response?.data?.error || `Failed to ${action} reservation`;
            alert(errorMsg);
        }
    };

    return (
        <div className="container">
            <div className="page-header">
                <button onClick={() => navigate('/my-trips')} className="btn-secondary" style={{ marginRight: '1rem' }}>
                    ← Back
                </button>
                <h2>Manage Reservations</h2>
            </div>

            {loading ? (
                <p>Loading...</p>
            ) : reservations.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <p>No reservations found for this trip.</p>
                </div>
            ) : (
                <div className="grid-auto-fit">
                    {reservations.map(r => (
                        <div key={r.id} className="card">
                            <div className="card-title">
                                {r.passenger_name}
                            </div>
                            <div className="card-subtitle">
                                {r.passenger_email}
                            </div>
                            <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                Requested: {new Date(r.created_at).toLocaleString()}
                            </div>

                            <div style={{
                                marginTop: '1rem',
                                paddingTop: '1rem',
                                borderTop: '1px solid var(--border-color)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <span style={{
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '999px',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    backgroundColor: r.status === 'confirmed' ? 'rgba(16, 185, 129, 0.1)' : r.status === 'cancelled' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(251, 191, 36, 0.1)',
                                    color: r.status === 'confirmed' ? 'var(--success-color)' : r.status === 'cancelled' ? 'var(--error-color)' : 'var(--warning-color)'
                                }}>
                                    {r.status.toUpperCase()}
                                </span>

                                {r.status === 'pending' && (
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            onClick={() => handleAction(r.id, 'confirm')}
                                            className="btn"
                                            style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}
                                        >
                                            Confirm
                                        </button>
                                        <button
                                            onClick={() => handleAction(r.id, 'reject')}
                                            className="btn-danger"
                                            style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem', borderRadius: '999px' }}
                                        >
                                            Reject
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
