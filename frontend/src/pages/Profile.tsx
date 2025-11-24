
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

type User = {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    role: 'driver' | 'passenger';
    created_at?: string;
};

export default function Profile() {
    const [user, setUser] = useState<User | null>(null);
    const [form, setForm] = useState<{ name: string; email: string; phone: string }>({
        name: '',
        email: '',
        phone: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const load = async () => {
            try {
                const res = await api.get('/auth/me');
                setUser(res.data);
                setForm({
                    name: res.data.name ?? '',
                    email: res.data.email ?? '',
                    phone: res.data.phone ?? ''
                });
            } catch (err: any) {
                alert(err.response?.data?.error ?? 'Failed to load profile');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await api.put('/auth/me', {
                name: form.name,
                email: form.email,
                phone: form.phone
            });

            setUser({
                id: res.data.id,
                name: res.data.name,
                email: res.data.email,
                phone: res.data.phone,
                role: res.data.role
            });

            localStorage.setItem('token', res.data.token);
            localStorage.setItem(
                'user',
                JSON.stringify({
                    id: res.data.id,
                    name: res.data.name,
                    email: res.data.email,
                    role: res.data.role
                })
            );

            alert('Profile updated ✅');
            setIsEditing(false);
        } catch (err: any) {
            alert(err.response?.data?.error ?? 'Update failed');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <p>Loading...</p>;
    if (!user) return <p>No profile found.</p>;

    return (
        <div className="container">
            <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
                <div className="page-header">
                    <h2>My Profile</h2>
                </div>

                {!isEditing ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '1rem', alignItems: 'center' }}>
                            <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Name:</span>
                            <span style={{ fontWeight: 600 }}>{user.name}</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '1rem', alignItems: 'center' }}>
                            <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Email:</span>
                            <span>{user.email}</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '1rem', alignItems: 'center' }}>
                            <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Phone:</span>
                            <span>{user.phone ?? '-'}</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '1rem', alignItems: 'center' }}>
                            <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Role:</span>
                            <span style={{ textTransform: 'capitalize' }}>{user.role}</span>
                        </div>
                        {user.created_at && (
                            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '1rem', alignItems: 'center' }}>
                                <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Joined:</span>
                                <span>{new Date(user.created_at).toLocaleDateString()}</span>
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                            <button onClick={() => setIsEditing(true)} className="btn">Edit Profile</button>
                            <button onClick={() => navigate('/profile/password')} className="btn btn-secondary">Change Password</button>
                        </div>
                    </div>
                ) : (
                    <div className="auth-form">
                        <div>
                            <label>Full Name</label>
                            <input
                                name="name"
                                type="text"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="Your full name"
                            />
                        </div>
                        <div>
                            <label>Email Address</label>
                            <input
                                name="email"
                                type="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="your@email.com"
                            />
                        </div>
                        <div>
                            <label>Phone Number</label>
                            <input
                                name="phone"
                                type="text"
                                value={form.phone}
                                onChange={handleChange}
                                placeholder="+216 ..."
                            />
                        </div>
                        <div>
                            <label>Role</label>
                            <input type="text" value={user.role} disabled style={{ opacity: 0.7, cursor: 'not-allowed' }} />
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <button onClick={handleSave} disabled={saving} className="btn">
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                            <button
                                onClick={() => {
                                    setForm({
                                        name: user.name ?? '',
                                        email: user.email ?? '',
                                        phone: user.phone ?? ''
                                    });
                                    setIsEditing(false);
                                }}
                                className="btn btn-secondary"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
