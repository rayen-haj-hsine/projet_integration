
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

type FormState = {
    departure_city: string;
    destination_city: string;
    departure_date: string; // HTML datetime-local
    price: string;
    available_seats: string;
};

export default function PublishTrip() {
    const navigate = useNavigate();
    const [form, setForm] = useState<FormState>({
        departure_city: '',
        destination_city: '',
        departure_date: '',
        price: '',
        available_seats: ''
    });

    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [role, setRole] = useState<string | null>(null);
    const [calculatingPrice, setCalculatingPrice] = useState(false);
    const [distanceInfo, setDistanceInfo] = useState<string | null>(null);

    const handleCalculatePrice = async () => {
        if (!form.departure_city || !form.destination_city) {
            alert('Please enter departure and destination cities first.');
            return;
        }

        setCalculatingPrice(true);
        try {
            const res = await api.post('/trips/estimate-price', {
                departure_city: form.departure_city,
                destination_city: form.destination_city
            });
            setForm(prev => ({ ...prev, price: res.data.estimated_price.toString() }));
            setDistanceInfo(`${res.data.distance_km} km`);
        } catch (err: any) {
            alert(err.response?.data?.error || 'Failed to calculate price');
        } finally {
            setCalculatingPrice(false);
        }
    };

    // Ensure only drivers can access this page
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const parsed = JSON.parse(storedUser);
                setRole(parsed?.role ?? null);
            } catch { }
        }
        if (!role) {
            api.get('/auth/me')
                .then(res => setRole(res.data.role))
                .catch(() => { });
        }
    }, []);

    useEffect(() => {
        if (role && role !== 'driver') {
            alert('Only drivers can publish trips.');
            navigate('/');
        }
    }, [role, navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setErrors(prev => ({ ...prev, [e.target.name]: '' }));
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};
        if (!form.departure_city.trim()) newErrors.departure_city = 'Departure city is required';
        if (!form.destination_city.trim()) newErrors.destination_city = 'Destination city is required';
        if (!form.departure_date.trim()) newErrors.departure_date = 'Departure date/time is required';

        if (form.departure_date) {
            const dt = new Date(form.departure_date);
            const now = new Date();
            if (dt <= now) newErrors.departure_date = 'Departure date must be in the future';
        }

        const priceNum = Number(form.price);
        if (!form.price.trim()) newErrors.price = 'Price is required';
        else if (isNaN(priceNum) || priceNum < 0) newErrors.price = 'Price must be a non-negative number';

        const seatsNum = Number(form.available_seats);
        if (!form.available_seats.trim()) newErrors.available_seats = 'Available seats is required';
        else if (!Number.isInteger(seatsNum) || seatsNum < 1) newErrors.available_seats = 'Seats must be an integer ≥ 1';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setSubmitting(true);
        try {
            await api.post('/trips', {
                departure_city: form.departure_city.trim(),
                destination_city: form.destination_city.trim(),
                departure_date: form.departure_date, // HTML datetime-local format works for MySQL DATETIME
                price: Number(form.price),
                available_seats: Number(form.available_seats)
            });

            alert('Trip published successfully ✅');
            navigate('/my-trips');
        } catch (err: any) {
            alert(err?.response?.data?.error ?? 'Failed to publish trip');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={{
            maxWidth: 640,
            margin: '20px auto',
            background: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: 8,
            padding: 16
        }}>
            <h2 style={{ marginBottom: 16 }}>Publish a Trip</h2>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '12px' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: 6 }}>Departure City</label>
                    <input
                        type="text"
                        name="departure_city"
                        placeholder="e.g., Mahdia"
                        value={form.departure_city}
                        onChange={handleChange}
                    />
                    {errors.departure_city && <small style={{ color: 'crimson' }}>{errors.departure_city}</small>}
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: 6 }}>Destination City</label>
                    <input
                        type="text"
                        name="destination_city"
                        placeholder="e.g., Tunis"
                        value={form.destination_city}
                        onChange={handleChange}
                    />
                    {errors.destination_city && <small style={{ color: 'crimson' }}>{errors.destination_city}</small>}
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: 6 }}>Departure Date & Time</label>
                    <input
                        type="datetime-local"
                        name="departure_date"
                        value={form.departure_date}
                        onChange={handleChange}
                    />
                    {errors.departure_date && <small style={{ color: 'crimson' }}>{errors.departure_date}</small>}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: 6 }}>Price (TND)</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <input
                                type="number"
                                name="price"
                                min="0"
                                step="0.01"
                                placeholder="e.g., 15"
                                value={form.price}
                                onChange={handleChange}
                                style={{ flex: 1 }}
                            />
                            <button
                                type="button"
                                onClick={handleCalculatePrice}
                                disabled={calculatingPrice}
                                style={{
                                    padding: '0 12px',
                                    fontSize: '0.8rem',
                                    whiteSpace: 'nowrap',
                                    backgroundColor: 'var(--secondary-color)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                                title="Calculate based on distance"
                            >
                                {calculatingPrice ? '...' : 'Auto Calc'}
                            </button>
                        </div>
                        {distanceInfo && <small style={{ color: 'var(--primary-color)', display: 'block', marginTop: '4px' }}>Distance: {distanceInfo}</small>}
                        {errors.price && <small style={{ color: 'crimson' }}>{errors.price}</small>}
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: 6 }}>Available Seats</label>
                        <input
                            type="number"
                            name="available_seats"
                            min="1"
                            step="1"
                            placeholder="e.g., 3"
                            value={form.available_seats}
                            onChange={handleChange}
                        />
                        {errors.available_seats && <small style={{ color: 'crimson' }}>{errors.available_seats}</small>}
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: 8 }}>
                    <button type="submit" disabled={submitting}>
                        {submitting ? 'Publishing…' : 'Publish Trip'}
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setForm({
                                departure_city: '',
                                destination_city: '',
                                departure_date: '',
                                price: '',
                                available_seats: ''
                            });
                            setErrors({});
                        }}
                        style={{ background: 'var(--input-bg)', color: 'var(--text-color)', border: '1px solid var(--border-color)' }}
                    >
                        Clear
                    </button>
                </div>
            </form>
        </div>
    );
}
