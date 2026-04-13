import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, Shield, Clock, Zap } from 'lucide-react';

const Landing = () => {
    const navigate = useNavigate();

    return (
        <div className="container" style={{ 
            minHeight: 'calc(100vh - 74px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '4rem 2rem' 
        }}>
            {/* Hero Section */}
            <motion.section 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="glass-card"
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    padding: '5rem 3rem',
                    maxWidth: '900px',
                    margin: '0 auto',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                {/* Background Accent */}
                <div style={{
                    position: 'absolute',
                    top: '-50px',
                    right: '-50px',
                    width: '150px',
                    height: '150px',
                    background: 'var(--primary-muted)',
                    borderRadius: '50%',
                    filter: 'blur(40px)',
                    zIndex: 0
                }}></div>

                <div style={{ position: 'relative', zIndex: 1 }}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        style={{
                            background: 'var(--glass-bg)',
                            width: '100px',
                            height: '100px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '50%',
                            marginBottom: '2.5rem',
                            boxShadow: 'var(--glass-shadow)',
                            border: '1px solid var(--primary-muted)',
                            margin: '0 auto 2.5rem'
                        }}
                    >
                        <Brain size={48} color="var(--primary)" />
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        style={{ 
                            fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', 
                            marginBottom: '1.5rem', 
                            lineHeight: 1.1,
                            color: 'var(--text-heading)'
                        }}
                    >
                        Early detection, <br />
                        <span style={{ 
                            background: 'linear-gradient(90deg, var(--primary), #00F2FE)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>better outcomes.</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        style={{ 
                            fontSize: '1.2rem', 
                            maxWidth: '650px', 
                            marginBottom: '3.5rem', 
                            color: 'var(--text-body)',
                            fontWeight: 500
                        }}
                    >
                        NeuroScreen leverages advanced neural imaging analysis and motor function
                        assessment to identify neurological markers before symptoms manifest.
                    </motion.p>

                    <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9 }}
                        className="btn-primary"
                        onClick={() => navigate('/login')}
                        style={{ 
                            fontSize: '1.1rem', 
                            padding: '1.2rem 3.5rem',
                            background: 'linear-gradient(135deg, var(--primary) 0%, #00B4D8 100%)',
                            boxShadow: '0 8px 30px rgba(0, 201, 167, 0.4)',
                            border: 'none',
                            borderRadius: '16px'
                        }}
                    >
                        Get Started
                    </motion.button>
                </div>
            </motion.section>

            {/* Features Section */}
            <section style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '2.5rem',
                marginTop: '6rem'
            }}>
                <FeatureCard
                    icon={<Shield size={32} />}
                    title="Clinical Grade"
                    desc="Precision-engineered algorithms validated against medical benchmarks."
                />
                <FeatureCard
                    icon={<Clock size={32} />}
                    title="Rapid Assessment"
                    desc="Complete comprehensive screenings in under 5 minutes."
                />
                <FeatureCard
                    icon={<Zap size={32} />}
                    title="Real-time Analysis"
                    desc="Instant feedback and predictive scoring for specialized care."
                />
            </section>
        </div>
    );
};

const FeatureCard = ({ icon, title, desc }) => (
    <div className="glass-card" style={{ 
        padding: '2.5rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start'
    }}>
        <div style={{ 
            color: 'var(--primary)', 
            marginBottom: '1.5rem',
            background: 'var(--primary-muted)',
            padding: '0.75rem',
            borderRadius: '12px'
        }}>{icon}</div>
        <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>{title}</h3>
        <p style={{ fontSize: '0.95rem', color: 'var(--text-body)' }}>{desc}</p>
    </div>
);

export default Landing;
