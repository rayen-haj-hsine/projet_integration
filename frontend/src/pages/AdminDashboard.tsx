import { useEffect, useState } from 'react';
import api from '../api/axios';

interface Driver {
    id: number;
    name: string;
    email: string;
    phone: string;
    profile_photo: string;
    license_document: string;
    created_at: string;
}

export default function AdminDashboard() {
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchDrivers = () => {
        setLoading(true);
        // Add timestamp to prevent caching
        api.get(`/admin/pending-drivers?t=${new Date().getTime()}`)
            .then(res => {
                setDrivers(res.data);
            })
            .catch(err => {
                console.error('Error fetching drivers:', err);
                alert('Failed to fetch drivers');
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchDrivers();
    }, []);

    const handleApprove = async (id: number) => {
        if (!window.confirm('Approve this driver?')) return;
        try {
            await api.patch(`/admin/approve-driver/${id}`);
            alert('Driver approved');
            fetchDrivers();
        } catch (err) {
            alert('Failed to approve driver');
        }
    };

    const handleReject = async (id: number) => {
        if (!window.confirm('Reject and delete this driver?')) return;
        try {
            await api.patch(`/admin/reject-driver/${id}`);
            alert('Driver rejected');
            fetchDrivers();
        } catch (err) {
            alert('Failed to reject driver');
        }
    };

    const getFileUrl = (path: string) => {
        if (!path) return '#';
        // Assuming backend serves uploads at /uploads and path is relative like 'uploads/file.jpg'
        // We need to construct the full URL.
        // If path already contains 'uploads/', just prepend base URL.
        return `http://localhost:4000/${path.replace(/\\/g, '/')}`;
    };

    return (
        <div className="container">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2>Admin Dashboard</h2>
                    <p>Pending Driver Verifications</p>
                </div>
                <button onClick={fetchDrivers} className="btn-secondary">
                    Refresh List
                </button>
            </div>

            {loading ? (
                <p>Loading...</p>
            ) : drivers.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <p>No pending drivers.</p>
                </div>
            ) : (
                <div className="grid-auto-fit">
                    {drivers.map(d => (
                        <div key={d.id} className="card">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                {d.profile_photo ? (
                                    <img
                                        src={getFileUrl(d.profile_photo)}
                                        alt={d.name}
                                        style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }}
                                    />
                                ) : (
                                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#e5e7eb' }} />
                                )}
                                <div>
                                    <h3 style={{ margin: 0 }}>{d.name}</h3>
                                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{d.email}</p>
                                </div>
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <p><strong>Phone:</strong> {d.phone || 'N/A'}</p>
                                <p><strong>Registered:</strong> {new Date(d.created_at).toLocaleDateString()}</p>
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <a
                                    href={getFileUrl(d.license_document)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="btn-secondary"
                                    style={{ display: 'block', textAlign: 'center', fontSize: '0.875rem' }}
                                >
                                    View License Document
                                </a>
                            </div>

                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                    onClick={() => handleApprove(d.id)}
                                    className="btn"
                                    style={{ flex: 1, backgroundColor: 'var(--success-color)' }}
                                >
                                    Approve
                                </button>
                                <button
                                    onClick={() => handleReject(d.id)}
                                    className="btn-danger"
                                    style={{ flex: 1 }}
                                >
                                    Reject
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
