
import { useState } from 'react';
import api from '../api/axios';

export default function ChangePassword() {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [saving, setSaving] = useState(false);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentPassword || !newPassword) {
            alert('Please fill in both fields.');
            return;
        }
        setSaving(true);
        try {
            const res = await api.put('/auth/me/password', { currentPassword, newPassword });
            alert(res.data?.message ?? 'Password updated successfully');
            setCurrentPassword('');
            setNewPassword('');
        } catch (err: any) {
            alert(err.response?.data?.error ?? 'Failed to update password');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="container">
            <div className="card" style={{ maxWidth: '500px', margin: '0 auto' }}>
                <div className="page-header">
                    <h2>Change Password</h2>
                </div>

                <form onSubmit={handleSave} className="auth-form">
                    <div>
                        <label>Current Password</label>
                        <input
                            type="password"
                            placeholder="Enter current password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label>New Password</label>
                        <input
                            type="password"
                            placeholder="Min 6 characters"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button type="submit" disabled={saving} className="btn">
                            {saving ? 'Updating...' : 'Update Password'}
                        </button>
                        <button type="button" onClick={() => window.history.back()} className="btn-secondary">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
