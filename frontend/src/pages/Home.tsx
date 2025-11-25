
import { Link } from 'react-router-dom';
import heroImage from '../assets/tripshare_hero_image.webp';

export default function Home() {
    const isLoggedIn = localStorage.getItem('token');

    return (
        <div style={{ minHeight: '100vh' }}>
            {/* Hero Section */}
            <section style={{
                background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)',
                padding: '4rem 2rem',
                textAlign: 'center'
            }}>
                <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <h1 style={{
                        fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                        fontWeight: 'bold',
                        marginBottom: '1.5rem',
                        background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        Share Your Journey, Save Together
                    </h1>
                    <p style={{
                        fontSize: '1.25rem',
                        color: 'var(--text-secondary)',
                        marginBottom: '2.5rem',
                        maxWidth: '600px',
                        margin: '0 auto 2.5rem'
                    }}>
                        Connect with travelers going your way. Split costs, reduce emissions, and make new friends on every trip.
                    </p>

                    {/* Hero Image */}
                    <div style={{
                        maxWidth: '800px',
                        margin: '0 auto 3rem',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
                    }}>
                        <img
                            src={heroImage}
                            alt="People carpooling together"
                            style={{ width: '100%', height: 'auto', display: 'block' }}
                        />
                    </div>

                    {/* CTA Buttons */}
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        {!isLoggedIn ? (
                            <>
                                <Link
                                    to="/register"
                                    style={{
                                        padding: '1rem 2.5rem',
                                        fontSize: '1.125rem',
                                        fontWeight: 600,
                                        borderRadius: '12px',
                                        textDecoration: 'none',
                                        color: 'white',
                                        background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%)',
                                        boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                                        display: 'inline-block'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(37, 99, 235, 0.4)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.3)';
                                    }}
                                >
                                    Get Started Free
                                </Link>
                                <Link
                                    to="/login"
                                    style={{
                                        padding: '1rem 2.5rem',
                                        fontSize: '1.125rem',
                                        fontWeight: 600,
                                        borderRadius: '12px',
                                        textDecoration: 'none',
                                        color: 'var(--text-primary)',
                                        border: '2px solid var(--border-color)',
                                        backgroundColor: 'var(--card-bg)',
                                        transition: 'all 0.2s ease',
                                        display: 'inline-block'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.borderColor = 'var(--primary-color)';
                                        e.currentTarget.style.color = 'var(--primary-color)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = 'var(--border-color)';
                                        e.currentTarget.style.color = 'var(--text-primary)';
                                    }}
                                >
                                    Sign In
                                </Link>
                            </>
                        ) : (
                            <Link
                                to="/trips"
                                style={{
                                    padding: '1rem 2.5rem',
                                    fontSize: '1.125rem',
                                    fontWeight: 600,
                                    borderRadius: '12px',
                                    textDecoration: 'none',
                                    color: 'white',
                                    background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%)',
                                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                                    display: 'inline-block'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(37, 99, 235, 0.4)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.3)';
                                }}
                            >
                                Browse Available Trips
                            </Link>
                        )}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section style={{ padding: '4rem 2rem', backgroundColor: 'var(--bg-color)' }}>
                <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <h2 style={{
                        textAlign: 'center',
                        fontSize: '2.5rem',
                        marginBottom: '3rem',
                        color: 'var(--text-primary)'
                    }}>
                        Why Choose TripShare?
                    </h2>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '2rem'
                    }}>
                        {/* Feature 1 */}
                        <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💰</div>
                            <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Save Money</h3>
                            <p style={{ color: 'var(--text-secondary)' }}>
                                Split fuel costs and reduce your travel expenses by carpooling with others.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌍</div>
                            <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Eco-Friendly</h3>
                            <p style={{ color: 'var(--text-secondary)' }}>
                                Reduce carbon emissions by sharing rides and helping the environment.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
                            <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Meet People</h3>
                            <p style={{ color: 'var(--text-secondary)' }}>
                                Connect with fellow travelers and make new friends on your journey.
                            </p>
                        </div>

                        {/* Feature 4 */}
                        <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⭐</div>
                            <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Rated Trips</h3>
                            <p style={{ color: 'var(--text-secondary)' }}>
                                Review and rate your experiences to build a trusted community.
                            </p>
                        </div>

                        {/* Feature 5 */}
                        <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💬</div>
                            <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Real-time Chat</h3>
                            <p style={{ color: 'var(--text-secondary)' }}>
                                Communicate directly with drivers and passengers before your trip.
                            </p>
                        </div>

                        {/* Feature 6 */}
                        <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔔</div>
                            <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Instant Updates</h3>
                            <p style={{ color: 'var(--text-secondary)' }}>
                                Get notified about booking confirmations and trip updates in real-time.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section style={{ padding: '4rem 2rem', background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.05) 0%, rgba(16, 185, 129, 0.05) 100%)' }}>
                <div className="container" style={{ maxWidth: '900px', margin: '0 auto' }}>
                    <h2 style={{
                        textAlign: 'center',
                        fontSize: '2.5rem',
                        marginBottom: '3rem',
                        color: 'var(--text-primary)'
                    }}>
                        How It Works
                    </h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                            <div style={{
                                minWidth: '60px',
                                height: '60px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%)',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.5rem',
                                fontWeight: 'bold'
                            }}>
                                1
                            </div>
                            <div>
                                <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Create an Account</h3>
                                <p style={{ color: 'var(--text-secondary)' }}>Sign up for free and set up your profile in seconds.</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                            <div style={{
                                minWidth: '60px',
                                height: '60px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%)',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.5rem',
                                fontWeight: 'bold'
                            }}>
                                2
                            </div>
                            <div>
                                <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Find or Publish a Trip</h3>
                                <p style={{ color: 'var(--text-secondary)' }}>Browse available trips or publish your own if you're driving.</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                            <div style={{
                                minWidth: '60px',
                                height: '60px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%)',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.5rem',
                                fontWeight: 'bold'
                            }}>
                                3
                            </div>
                            <div>
                                <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Book Your Seat</h3>
                                <p style={{ color: 'var(--text-secondary)' }}>Reserve your spot and wait for driver confirmation.</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                            <div style={{
                                minWidth: '60px',
                                height: '60px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%)',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.5rem',
                                fontWeight: 'bold'
                            }}>
                                4
                            </div>
                            <div>
                                <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Enjoy the Ride</h3>
                                <p style={{ color: 'var(--text-secondary)' }}>Travel together, share costs, and rate your experience!</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
