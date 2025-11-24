
import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Link } from 'react-router-dom';

type Contact = {
    contact_id: number;
    name: string;
    email: string;
    phone: string | null;
};

export default function ChatList() {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/chats/contacts')
            .then(res => setContacts(res.data))
            .catch(err => alert(err.response?.data?.error ?? 'Failed to load contacts'))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <p>Loading...</p>;

    return (
        <div className="container">
            <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
                <div className="page-header">
                    <h2>Messages</h2>
                </div>

                {contacts.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                        <p>No contacts yet.</p>
                        <p style={{ fontSize: '0.875rem' }}>You can chat with drivers or passengers once you have a confirmed reservation.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {contacts.map(c => (
                            <Link
                                key={c.contact_id}
                                to={`/chats/${c.contact_id}`}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '1rem',
                                    borderBottom: '1px solid var(--border-color)',
                                    textDecoration: 'none',
                                    color: 'inherit',
                                    transition: 'background-color 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-color)'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        backgroundColor: 'var(--primary-color)',
                                        color: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: 'bold'
                                    }}>
                                        {c.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.name}</div>
                                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{c.email}</div>
                                    </div>
                                </div>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '1.5rem' }}>›</span>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
