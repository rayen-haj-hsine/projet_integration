
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { showToast } from '../components/Toast';
import { User as UserIcon, Mail, Phone, Calendar, FileText, Music, Cigarette, PawPrint, ShieldCheck, Edit2, Lock } from 'lucide-react';

type User = {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    role: 'driver' | 'passenger';
    created_at?: string;
    bio?: string;
    preferences?: {
        music: boolean;
        smoking: boolean;
        pets: boolean;
    };
    is_phone_verified?: boolean;
};

export default function Profile() {
    const [user, setUser] = useState<User | null>(null);
    const [form, setForm] = useState<{
        name: string;
        email: string;
        phone: string;
        bio: string;
        preferences: { music: boolean; smoking: boolean; pets: boolean };
    }>({
        name: '',
        email: '',
        phone: '',
        bio: '',
        preferences: { music: false, smoking: false, pets: false }
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showVerifyModal, setShowVerifyModal] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [verifying, setVerifying] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const load = async () => {
            try {
                const res = await api.get('/auth/me');
                setUser(res.data);

                // Parse preferences if string, or use object
                let prefs = { music: false, smoking: false, pets: false };
                if (res.data.preferences) {
                    try {
                        prefs = typeof res.data.preferences === 'string'
                            ? JSON.parse(res.data.preferences)
                            : res.data.preferences;
                    } catch (e) { }
                }

                setForm({
                    name: res.data.name ?? '',
                    email: res.data.email ?? '',
                    phone: res.data.phone ?? '',
                    bio: res.data.bio ?? '',
                    preferences: prefs
                });
            } catch (err: any) {
                showToast(err.response?.data?.error ?? 'Failed to load profile', 'error');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handlePreferenceChange = (key: keyof typeof form.preferences) => {
        setForm({
            ...form,
            preferences: { ...form.preferences, [key]: !form.preferences[key] }
        });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await api.put('/auth/me', {
                name: form.name,
                email: form.email,
                phone: form.phone,
                bio: form.bio,
                preferences: form.preferences
            });

            setUser({
                id: res.data.id,
                name: res.data.name,
                email: res.data.email,
                phone: res.data.phone,
                role: res.data.role,
                bio: res.data.bio,
                preferences: res.data.preferences
            });

            localStorage.setItem('token', res.data.token);
            localStorage.setItem(
                'user',
                JSON.stringify({
                    id: res.data.id,
                    name: res.data.name,
                    email: res.data.email,
                    role: res.data.role,
                    bio: res.data.bio,
                    preferences: res.data.preferences
                })
            );

            showToast('Profile updated ✅', 'success');
            setIsEditing(false);
        } catch (err: any) {
            showToast(err.response?.data?.error ?? 'Update failed', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleVerifyPhone = async () => {
        if (!verificationCode) {
            showToast('Please enter a verification code', 'error');
            return;
        }

        setVerifying(true);
        try {
            const res = await api.post('/auth/me/verify-phone', { code: verificationCode });
            showToast(res.data.message, 'success');

            // Update user state
            if (user) {
                setUser({ ...user, is_phone_verified: true });
            }

            setShowVerifyModal(false);
            setVerificationCode('');
        } catch (err: any) {
            showToast(err.response?.data?.error ?? 'Verification failed', 'error');
        } finally {
            setVerifying(false);
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
                            <span style={{ color: 'var(--text-secondary)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <UserIcon size={16} /> Name:
                            </span>
                            <span style={{ fontWeight: 600 }}>{user.name}</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '1rem', alignItems: 'center' }}>
                            <span style={{ color: 'var(--text-secondary)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Mail size={16} /> Email:
                            </span>
                            <span>{user.email}</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '1rem', alignItems: 'center' }}>
                            <span style={{ color: 'var(--text-secondary)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Phone size={16} /> Phone:
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span>{user.phone ?? '-'}</span>
                                {user.phone && (
                                    user.is_phone_verified ? (
                                        <span style={{
                                            backgroundColor: '#dcfce7',
                                            color: '#166534',
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '12px',
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.25rem'
                                        }}>
                                            <ShieldCheck size={12} /> Verified
                                        </span>
                                    ) : (
                                        <button
                                            onClick={() => setShowVerifyModal(true)}
                                            style={{
                                                backgroundColor: '#fef3c7',
                                                color: '#92400e',
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '12px',
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                                border: 'none',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Verify Phone
                                        </button>
                                    )
                                )}
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '1rem', alignItems: 'center' }}>
                            <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Role:</span>
                            <span style={{ textTransform: 'capitalize' }}>{user.role}</span>
                        </div>
                        {user.created_at && (
                            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '1rem', alignItems: 'center' }}>
                                <span style={{ color: 'var(--text-secondary)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Calendar size={16} /> Joined:
                                </span>
                                <span>{new Date(user.created_at).toLocaleDateString()}</span>
                            </div>
                        )}
                        {user.bio && (
                            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '1rem', alignItems: 'start' }}>
                                <span style={{ color: 'var(--text-secondary)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <FileText size={16} /> Bio:
                                </span>
                                <span style={{ whiteSpace: 'pre-wrap' }}>{user.bio}</span>
                            </div>
                        )}
                        {user.preferences && (
                            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '1rem', alignItems: 'center' }}>
                                <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Preferences:</span>
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    {(() => {
                                        const prefs = typeof user.preferences === 'string' ? JSON.parse(user.preferences) : user.preferences;
                                        return (
                                            <>
                                                {prefs.music && <span style={{ backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', padding: '0.25rem 0.75rem', borderRadius: '15px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Music size={14} /> Music</span>}
                                                {prefs.smoking && <span style={{ backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', padding: '0.25rem 0.75rem', borderRadius: '15px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Cigarette size={14} /> Smoking</span>}
                                                {prefs.pets && <span style={{ backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', padding: '0.25rem 0.75rem', borderRadius: '15px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><PawPrint size={14} /> Pets</span>}
                                                {!prefs.music && !prefs.smoking && !prefs.pets && <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>None selected</span>}
                                            </>
                                        );
                                    })()}
                                </div>
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                            <button onClick={() => setIsEditing(true)} className="btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Edit2 size={16} /> Edit Profile
                            </button>
                            <button onClick={() => navigate('/profile/password')} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Lock size={16} /> Change Password
                            </button>
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
                            <label>Bio</label>
                            <textarea
                                name="bio"
                                value={form.bio}
                                onChange={handleChange}
                                placeholder="Tell us about yourself..."
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

                        <div>
                            <label>Preferences</label>
                            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                <button
                                    type="button"
                                    onClick={() => handlePreferenceChange('music')}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        borderRadius: '20px',
                                        border: `1px solid ${form.preferences.music ? 'var(--primary-color)' : 'var(--border-color)'}`,
                                        backgroundColor: form.preferences.music ? 'var(--primary-color)' : 'transparent',
                                        color: form.preferences.music ? 'white' : 'var(--text-primary)',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    <Music size={16} /> Music
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handlePreferenceChange('smoking')}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        borderRadius: '20px',
                                        border: `1px solid ${form.preferences.smoking ? 'var(--primary-color)' : 'var(--border-color)'}`,
                                        backgroundColor: form.preferences.smoking ? 'var(--primary-color)' : 'transparent',
                                        color: form.preferences.smoking ? 'white' : 'var(--text-primary)',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    <Cigarette size={16} /> Smoking
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handlePreferenceChange('pets')}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        borderRadius: '20px',
                                        border: `1px solid ${form.preferences.pets ? 'var(--primary-color)' : 'var(--border-color)'}`,
                                        backgroundColor: form.preferences.pets ? 'var(--primary-color)' : 'transparent',
                                        color: form.preferences.pets ? 'white' : 'var(--text-primary)',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    <PawPrint size={16} /> Pets
                                </button>
                            </div>
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
                                    let prefs = { music: false, smoking: false, pets: false };
                                    if (user.preferences) {
                                        try {
                                            prefs = typeof user.preferences === 'string'
                                                ? JSON.parse(user.preferences)
                                                : user.preferences;
                                        } catch (e) { }
                                    }
                                    setForm({
                                        name: user.name ?? '',
                                        email: user.email ?? '',
                                        phone: user.phone ?? '',
                                        bio: user.bio ?? '',
                                        preferences: prefs
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

            {/* Phone Verification Modal */}
            {showVerifyModal && (
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
                    onClick={() => setShowVerifyModal(false)}
                >
                    <div
                        className="card"
                        style={{ maxWidth: '400px', margin: '1rem' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="page-header">
                            <h3>Verify Phone Number</h3>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                            Enter the 6-digit verification code sent to your phone.
                            <br /><span style={{ fontSize: '0.85rem', fontStyle: 'italic' }}>(For demo: enter any 6-digit code)</span>
                        </p>
                        <div className="auth-form">
                            <div>
                                <label>Verification Code</label>
                                <input
                                    type="text"
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value)}
                                    placeholder="123456"
                                    maxLength={6}
                                    style={{ textAlign: 'center', fontSize: '1.25rem', letterSpacing: '0.25rem' }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button onClick={handleVerifyPhone} disabled={verifying} className="btn">
                                    {verifying ? 'Verifying...' : 'Verify'}
                                </button>
                                <button
                                    onClick={() => {
                                        setShowVerifyModal(false);
                                        setVerificationCode('');
                                    }}
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
