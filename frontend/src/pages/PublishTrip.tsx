
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
    const [form, setForm] = useState<FormState & { is_recurring: boolean; recurrence_pattern: string; recurrence_end_date: string }>({
        departure_city: '',
        destination_city: '',
        departure_date: '',
        price: '',
        available_seats: '',
        is_recurring: false,
        recurrence_pattern: 'daily',
        recurrence_end_date: ''
    });

    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [role, setRole] = useState<string | null>(null);
    const [calculatingPrice, setCalculatingPrice] = useState(false);
    const [distanceInfo, setDistanceInfo] = useState<string | null>(null);

    // ... (keep handleCalculatePrice and useEffects same)

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
        setForm(prev => ({ ...prev, [e.target.name]: value }));
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

        if (form.is_recurring) {
            if (!form.recurrence_end_date) newErrors.recurrence_end_date = 'End date is required for recurring trips';
            else {
                const endDt = new Date(form.recurrence_end_date);
                const startDt = new Date(form.departure_date);
                if (endDt <= startDt) newErrors.recurrence_end_date = 'End date must be after start date';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setSubmitting(true);
        try {
            const payload: any = {
                departure_city: form.departure_city.trim(),
                destination_city: form.destination_city.trim(),
                departure_date: form.departure_date,
                price: Number(form.price),
                available_seats: Number(form.available_seats),
                is_recurring: form.is_recurring
            };

            if (form.is_recurring) {
                payload.recurrence_pattern = form.recurrence_pattern;
                payload.recurrence_end_date = form.recurrence_end_date;
            }

            const res = await api.post('/trips', payload);

            let msg = 'Trip published successfully ✅';
            if (res.data.generated_trips > 0) {
                msg += `\nCreated ${res.data.generated_trips + 1} recurring trips!`;
            }
            alert(msg);
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

                {/* Recurrence Section */}
                <div style={{ padding: '1rem', backgroundColor: 'var(--bg-color)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <input
                            type="checkbox"
                            id="is_recurring"
                            name="is_recurring"
                            checked={form.is_recurring}
                            onChange={handleChange}
                            style={{ width: 'auto', margin: 0 }}
                        />
                        <label htmlFor="is_recurring" style={{ margin: 0, fontWeight: 600 }}>Repeat this trip</label>
                    </div>

                    {form.is_recurring && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: 6 }}>Frequency</label>
                                <select
                                    name="recurrence_pattern"
                                    value={form.recurrence_pattern}
                                    onChange={handleChange}
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                                >
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="weekdays">Weekdays (Mon-Fri)</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: 6 }}>End Date</label>
                                <input
                                    type="date"
                                    name="recurrence_end_date"
                                    value={form.recurrence_end_date}
                                    onChange={handleChange}
                                />
                                {errors.recurrence_end_date && <small style={{ color: 'crimson' }}>{errors.recurrence_end_date}</small>}
                            </div>
                        </div>
                    )}
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
                                available_seats: '',
                                is_recurring: false,
                                recurrence_pattern: 'daily',
                                recurrence_end_date: ''
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
