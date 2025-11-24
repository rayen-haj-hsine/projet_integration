
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
        <div style={{ maxWidth: 500 }}>
            <h2>My Profile</h2>

            {!isEditing ? (
                <>
                    <p><strong>Name:</strong> {user.name}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Phone:</strong> {user.phone ?? '-'}</p>
                    <p><strong>Role:</strong> {user.role}</p>
                    {user.created_at && <p><strong>Joined:</strong> {new Date(user.created_at).toLocaleString()}</p>}
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => setIsEditing(true)}>Edit</button>
                        <button onClick={() => navigate('/profile/password')}>Change Password</button>
                    </div>
                </>
            ) : (
                <>
                    <div style={{ display: 'grid', gap: '8px' }}>
                        <label>
                            Name
                            <input
                                name="name"
                                type="text"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="Your full name"
                            />
                        </label>
                        <label>
                            Email
                            <input
                                name="email"
                                type="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="your@email.com"
                            />
                        </label>
                        <label>
                            Phone
                            <input
                                name="phone"
                                type="text"
                                value={form.phone}
                                onChange={handleChange}
                                placeholder="+216 ..."
                            />
                        </label>
                        <label>
                            Role
                            <input type="text" value={user.role} disabled />
                        </label>
                    </div>

                    <div style={{ marginTop: 12 }}>
                        <button onClick={handleSave} disabled={saving}>
                            {saving ? 'Saving...' : 'Save'}
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
                            style={{ marginLeft: 8 }}
                        >
                            Cancel
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
