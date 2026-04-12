import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, Brain, Waves, Zap, ChevronRight, Clock, Calendar, Database } from 'lucide-react';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { getScreeningHistory } from '../utils/screeningService';

const conditions = [
    {
        id: 'parkinsons',
        name: "Parkinson's Disease",
        icon: <Activity size={32} />,
        desc: "A progressive disorder of the nervous system that affects movement. It develops gradually, sometimes starting with a barely noticeable tremor in just one hand.",
        path: '/screening/parkinsons',
        color: 'var(--primary)'
    },
    {
        id: 'alzheimers',
        name: "Alzheimer's Disease",
        icon: <Brain size={32} />,
        desc: "A progressive disease that destroys memory and other important mental functions. It is the most common cause of dementia, serious enough to interfere with daily life.",
        path: '/screening/alzheimers',
        color: '#8B5CF6'
    },
    {
        id: 'epilepsy',
        name: "Epilepsy",
        icon: <Waves size={32} />,
        desc: "A neurological disorder marked by sudden recurrent episodes of sensory disturbance or convulsions, associated with abnormal electrical activity in the brain.",
        path: '/screening/epilepsy',
        color: '#F59E0B'
    },
    {
        id: 'ms',
        name: "Multiple Sclerosis",
        icon: <Zap size={32} />,
        desc: "A chronic disease involving damage to the sheaths of nerve cells in the brain and spinal cord, mapping impairment of speech or coordination.",
        path: '/screening/ms/tapping',
        color: '#3B82F6'
    }
];

const Dashboard = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [stats, setStats] = useState({ total: 0, lastDate: 'No recent activity' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            const user = auth.currentUser;
            if (user) {
                try {
                    const profileSnap = await getDoc(doc(db, 'users', user.uid));
                    if (profileSnap.exists()) setProfile(profileSnap.data());
                    
                    const history = await getScreeningHistory(user.uid);
                    if (history.length > 0) {
                        setStats({
                            total: history.length,
                            lastDate: history[0].date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        });
                    }
                } catch (err) {
                    console.error("Dashboard fetch error:", err);
                }
            }
            setLoading(false);
        };
        fetchDashboardData();
    }, []);

    if (loading) return null;

    return (
        <div style={{ 
            height: 'calc(100vh - 80px)', 
            overflow: 'hidden',
            display: 'flex',
            padding: '2rem',
            gap: '2rem'
        }}>
            {/* Left Column: Welcome & Stats Panel */}
            <motion.div 
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass-card"
                style={{
                    flex: '0 0 35%',
                    padding: '4rem 3rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    borderLeft: '8px solid var(--primary)',
                    background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.6) 100%)'
                }}
            >
                <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                        width: '90px', 
                        height: '90px', 
                        borderRadius: '24px', 
                        background: 'var(--primary-muted)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: 'var(--primary)',
                        margin: '0 auto 2.5rem',
                        boxShadow: '0 10px 25px rgba(0, 201, 167, 0.2)'
                    }}>
                        <Brain size={48} fill="currentColor" opacity="0.8" />
                    </div>
                    
                    <h2 style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-heading)', letterSpacing: '-1px' }}>
                        Clinical <span style={{ color: 'var(--primary)' }}>Dashboard</span>
                    </h2>
                    
                    <h3 style={{ fontSize: '1.4rem', color: 'var(--text-heading)', marginBottom: '1rem' }}>
                        Welcome back, <span style={{ fontWeight: 800 }}>{profile?.fullName?.split(' ')[0] || 'Clinician'}</span>
                    </h3>
                    
                    <p style={{ color: 'var(--text-body)', fontSize: '1.05rem', lineHeight: 1.6, maxWidth: '280px', margin: '0 auto' }}>
                        Select a screening protocol to begin patient assessment.
                    </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '3rem' }}>
                    <div className="glass-card" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.4)', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                        <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                            <Database size={22} />
                        </div>
                        <div>
                            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Screenings</p>
                            <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-heading)' }}>{stats.total}</p>
                        </div>
                    </div>

                    <div className="glass-card" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.4)', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                        <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: 'var(--info)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                            <Clock size={22} />
                        </div>
                        <div>
                            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase', letterSpacing: '1px' }}>Last Activity</p>
                            <p style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-heading)' }}>{stats.lastDate}</p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Right Column: 2x2 Screenings Grid */}
            <div style={{
                flex: '1',
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gridTemplateRows: 'repeat(2, 1fr)',
                gap: '2rem'
            }}>
                {conditions.map((condition, index) => (
                    <motion.div
                        key={condition.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="glass-card"
                        style={{
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            borderTop: `6px solid ${condition.color}`,
                            padding: '2.5rem',
                            height: '100%',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        onClick={() => navigate(condition.path)}
                    >
                        <div>
                            <div style={{ 
                                color: condition.color, 
                                marginBottom: '1.5rem', 
                                width: '56px', 
                                height: '56px', 
                                borderRadius: '14px', 
                                background: 'rgba(255,255,255,0.8)', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
                            }}>
                                {condition.icon}
                            </div>
                            <h3 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--text-heading)', letterSpacing: '-0.5px' }}>{condition.name}</h3>
                            <p style={{ fontSize: '1.05rem', color: 'var(--text-body)', fontWeight: 500, lineHeight: 1.5 }}>
                                {condition.desc}
                            </p>
                        </div>

                        <div className="flex items-center justify-between" style={{ color: condition.color, fontWeight: '800', fontSize: '1.1rem', marginTop: '1rem' }}>
                            <span>Initiate Assessment</span>
                            <ChevronRight size={24} />
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default Dashboard;
