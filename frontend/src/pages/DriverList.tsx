import { useEffect, useState } from 'react';
import api from '../api/axios';

interface Driver {
    id: number;
    name: string;
    email: string;
    phone: string;
    profile_photo: string;
    created_at: string;
}

export default function DriverList() {
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchDrivers();
    }, []);

    const fetchDrivers = async () => {
        try {
            const res = await api.get('/admin/drivers');
            setDrivers(res.data);
        } catch (err) {
            setError('Failed to fetch drivers');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getFileUrl = (path: string) => {
        if (!path) return '';
        return `http://localhost:4000/${path.replace(/\\/g, '/')}`;
    };

    if (loading) return <div className="container" style={{ padding: '2rem', textAlign: 'center' }}>Loading drivers...</div>;
    if (error) return <div className="container" style={{ padding: '2rem', color: 'red' }}>{error}</div>;

    return (
        <div className="container" style={{ padding: '2rem 1rem', maxWidth: '1200px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem', color: 'var(--text-primary)' }}>
                Approved Drivers
            </h1>

            <div style={{
                backgroundColor: 'var(--card-bg)',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                overflow: 'hidden',
                boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
            }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: 'var(--bg-color)', borderBottom: '1px solid var(--border-color)' }}>
                            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)' }}>Driver</th>
                            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)' }}>Contact</th>
                            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)' }}>Joined</th>
                        </tr>
                    </thead>
                    <tbody>
                        {drivers.length === 0 ? (
                            <tr>
                                <td colSpan={3} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                    No approved drivers found.
                                </td>
                            </tr>
                        ) : (
                            drivers.map(d => (
                                <tr key={d.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            {d.profile_photo ? (
                                                <img
                                                    src={getFileUrl(d.profile_photo)}
                                                    alt={d.name}
                                                    style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                                                />
                                            ) : (
                                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#e5e7eb' }} />
                                            )}
                                            <div style={{ fontWeight: 500 }}>{d.name}</div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ fontSize: '0.9rem' }}>{d.email}</div>
                                        {d.phone && <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{d.phone}</div>}
                                    </td>
                                    <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                        {new Date(d.created_at).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
