
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';

type Message = {
    id: number;
    sender_id: number;
    receiver_id: number;
    message: string;
    created_at: string;
};

export default function Chat() {
    const { userId } = useParams();
    const [messages, setMessages] = useState<Message[]>([]);
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(true);
    const my = JSON.parse(localStorage.getItem('user') || '{}');
    const scrollRef = useRef<HTMLDivElement | null>(null);

    // Load conversation
    useEffect(() => {
        let mounted = true;
        const load = async () => {
            try {
                const res = await api.get(`/chats/${userId}`);
                if (mounted) setMessages(res.data);
            } catch (err: any) {
                alert(err.response?.data?.error ?? 'Failed to load chat');
            } finally {
                if (mounted) setLoading(false);
            }
        };
        load();
        // Optional: poll every 5 seconds (simple approach; replace with websockets later)
        const timer = setInterval(load, 5000);
        return () => { mounted = false; clearInterval(timer); };
    }, [userId]);

    // Auto scroll to bottom when messages change
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const sendMessage = async () => {
        if (!text.trim()) return;
        try {
            const res = await api.post('/chats', { receiver_id: parseInt(userId!, 10), message: text });
            setMessages(prev => [...prev, res.data]);
            setText('');
        } catch (err: any) {
            alert(err.response?.data?.error ?? 'Failed to send message');
        }
    };

    if (loading) return <p>Loading...</p>;

    return (
        <div className="container" style={{ height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column' }}>
            <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
                <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button onClick={() => window.history.back()} className="btn-secondary" style={{ padding: '0.25rem 0.5rem' }}>←</button>
                    <h3 style={{ margin: 0 }}>Chat</h3>
                </div>

                <div ref={scrollRef} className="chat-messages">
                    {messages.length === 0 ? (
                        <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '2rem' }}>
                            <p>No messages yet. Say hello 👋</p>
                        </div>
                    ) : messages.map(m => {
                        const isMine = m.sender_id === my?.id;
                        return (
                            <div key={m.id} className={`message-bubble ${isMine ? 'message-mine' : 'message-other'}`}>
                                <div style={{ whiteSpace: 'pre-wrap' }}>{m.message}</div>
                                <div style={{
                                    textAlign: 'right',
                                    marginTop: '0.25rem',
                                    fontSize: '0.7rem',
                                    opacity: 0.8
                                }}>
                                    {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="chat-input-area">
                    <input
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Type a message..."
                        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    />
                    <button onClick={sendMessage} disabled={!text.trim()}>Send</button>
                </div>
            </div>
        </div>
    );
}
