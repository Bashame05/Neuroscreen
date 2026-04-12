import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardList, Activity, Brain, Waves, Zap, Eye, ChevronRight, Calendar, Clock, FileText, Filter, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { getScreeningHistory } from '../utils/screeningService';

const CONDITION_METADATA = {
    "Parkinson's Disease": { color: 'var(--primary)', icon: <Activity size={24} /> },
    "Alzheimer's Disease": { color: '#8B5CF6', icon: <Brain size={24} /> },
    "Epilepsy": { color: '#F59E0B', icon: <Waves size={24} /> },
    "Multiple Sclerosis": { color: '#3B82F6', icon: <Zap size={24} /> }
};

const Screenings = () => {
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All Protocols');
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    useEffect(() => {
        const fetchHistory = async () => {
            const user = auth.currentUser;
            if (user) {
                const data = await getScreeningHistory(user.uid);
                setHistory(data);
            }
            setLoading(false);
        };
        fetchHistory();
    }, []);

    const getRiskLevel = (result) => {
        const r = result?.toLowerCase() || '';
        if (r.includes('high') || r.includes('flagged') || r.includes('moderate') || r.includes('decline') || r.includes('pre-clinical')) {
            if (r.includes('normal') || r.includes('healthy') || r.includes('cognitively normal')) return 'low';
            if (r.includes('mild') || r.includes('pre-clinical') || r.includes('borderline')) return 'medium';
            return 'high';
        }
        if (r.includes('mild') || r.includes('borderline') || r.includes('caution')) return 'medium';
        if (r.includes('low') || r.includes('normal') || r.includes('healthy') || r.includes('cognitively normal')) return 'low';
        return 'low';
    };

    const getStatusStyle = (level) => {
        switch (level) {
            case 'high': return { bg: 'var(--error)', text: '#fff', label: 'High Risk / Clinical' };
            case 'medium': return { bg: 'var(--warning)', text: '#000', label: 'Moderate / Borderline' };
            case 'low': return { bg: 'var(--success)', text: '#fff', label: 'Healthy / Low Risk' };
            default: return { bg: 'var(--slate-500)', text: '#fff', label: 'Indeterminate' };
        }
    };

    const handleViewDetails = (item) => {
        const conditionMap = {
            "Parkinson's Disease": "parkinsons",
            "Alzheimer's Disease": "alzheimers",
            "Multiple Sclerosis": "ms",
            "Epilepsy": "epilepsy"
        };

        navigate('/report', { 
            state: { 
                condition: conditionMap[item.condition] || 'parkinsons',
                ...item.details,
                result: item.result,
                confidence: item.confidence
            } 
        });
    };

    const filteredHistory = filter === 'All Protocols' 
        ? history 
        : history.filter(item => item.condition === filter);

    if (loading) {
        return (
            <div style={{ minHeight: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                <Activity className="animate-spin" size={32} />
                <span style={{ marginLeft: '1rem', fontWeight: 600 }}>Syncing Clinical History...</span>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: 'calc(100vh - 80px)',
            padding: '4rem 2rem'
        }}>
            <div className="container" style={{ maxWidth: '1200px', width: '80%' }}>
                <header style={{ marginBottom: '4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div style={{ textAlign: 'left' }}>
                        <h1 style={{ fontSize: '2.8rem', fontWeight: 800, marginBottom: '0.5rem', fontFamily: 'var(--font-heading)', color: 'var(--text-heading)' }}>
                            Screenings <span style={{ color: 'var(--primary)' }}>History</span>
                        </h1>
                        <p style={{ color: 'var(--text-body)', fontSize: '1.1rem', fontWeight: 500 }}>
                            Review and manage all historical diagnostic assessments.
                        </p>
                    </div>

                    {/* Filter Dropdown */}
                    <div style={{ position: 'relative' }}>
                        <button 
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '0.8rem 1.5rem',
                                background: 'white',
                                border: '1px solid #e2e8f0',
                                borderRadius: '12px',
                                color: 'var(--text-heading)',
                                fontWeight: 700,
                                fontSize: '0.95rem',
                                cursor: 'pointer',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                minWidth: '220px',
                                justifyContent: 'space-between'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <Filter size={18} color="var(--primary)" />
                                {filter}
                            </div>
                            <ChevronDown size={18} style={{ transform: isFilterOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                        </button>

                        <AnimatePresence>
                            {isFilterOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="glass-card"
                                    style={{
                                        position: 'absolute',
                                        top: '110%',
                                        right: 0,
                                        width: '100%',
                                        zIndex: 100,
                                        padding: '0.5rem',
                                        background: 'rgba(255,255,255,0.98)',
                                        border: '1px solid rgba(0,201,167,0.2)'
                                    }}
                                >
                                    {['All Protocols', "Parkinson's Disease", "Alzheimer's Disease", "Epilepsy", "Multiple Sclerosis"].map(opt => (
                                        <div 
                                            key={opt}
                                            onClick={() => { setFilter(opt); setIsFilterOpen(false); }}
                                            style={{
                                                padding: '0.8rem 1rem',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                fontSize: '0.9rem',
                                                fontWeight: 600,
                                                color: filter === opt ? 'var(--primary)' : 'var(--text-body)',
                                                background: filter === opt ? 'var(--primary-muted)' : 'transparent',
                                                transition: 'background 0.2s'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--primary-muted)'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = filter === opt ? 'var(--primary-muted)' : 'transparent'}
                                        >
                                            {opt}
                                        </div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </header>

                {filteredHistory.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '6rem 2rem', background: 'rgba(255,255,255,0.4)', borderRadius: '24px', border: '2px dashed #e2e8f0' }}>
                        <ClipboardList size={48} color="var(--slate-300)" style={{ marginBottom: '1.5rem' }} />
                        <h3 style={{ fontSize: '1.5rem', color: 'var(--text-heading)', marginBottom: '0.5rem' }}>No Screenings Found</h3>
                        <p style={{ color: 'var(--text-body)' }}>{filter === 'All Protocols' ? "You haven't completed any assessments yet." : `No historical data for ${filter}.`}</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <AnimatePresence mode='popLayout'>
                            {filteredHistory.map((item, index) => {
                                const meta = CONDITION_METADATA[item.condition] || { color: 'var(--primary)', icon: <ClipboardList size={24} /> };
                                const riskLevel = getRiskLevel(item.result);
                                const status = getStatusStyle(riskLevel);

                                return (
                                    <motion.div
                                        key={item.id}
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.2, delay: index * 0.05 }}
                                        className="glass-card"
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '1.75rem 2.5rem',
                                            borderLeft: `8px solid ${meta.color}`,
                                            background: 'linear-gradient(90deg, #fff 0%, rgba(255,255,255,0.6) 100%)'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flex: 1 }}>
                                            <div style={{
                                                width: '60px',
                                                height: '60px',
                                                borderRadius: '16px',
                                                background: `${meta.color}15`,
                                                color: meta.color,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                border: `1px solid ${meta.color}25`
                                            }}>
                                                {meta.icon}
                                            </div>
                                            <div>
                                                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-heading)' }}>{item.condition}</h3>
                                                <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-body)', fontSize: '0.95rem', fontWeight: 600 }}>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <Calendar size={16} color="var(--primary)" /> {item.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </span>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <Clock size={16} color="var(--primary)" /> {item.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '3rem' }}>
                                            {/* Status Badge */}
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{
                                                    padding: '0.4rem 1.2rem',
                                                    borderRadius: '20px',
                                                    background: status.bg,
                                                    color: status.text,
                                                    fontSize: '0.85rem',
                                                    fontWeight: 800,
                                                    textTransform: 'uppercase',
                                                    boxShadow: `0 4px 12px ${status.bg}40`,
                                                    marginBottom: '0.25rem',
                                                    display: 'inline-block'
                                                }}>
                                                    {item.result}
                                                </div>
                                                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-body)', opacity: 0.7 }}>
                                                    {status.label}
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => handleViewDetails(item)}
                                                className="btn-primary"
                                                style={{
                                                    padding: '0.8rem 1.5rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.75rem',
                                                    boxShadow: '0 4px 15px var(--primary-glow)'
                                                }}
                                            >
                                                <FileText size={18} /> Review <ChevronRight size={18} />
                                            </button>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Screenings;
