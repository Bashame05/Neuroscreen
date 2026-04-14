import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageSquare, Star, Send, CheckCircle, ThumbsUp, AlertCircle,
    History, EyeOff, ArrowRight, User, Globe, Activity,
    Clock, RefreshCcw, Brain, Palette, Bug, Sparkles, Accessibility
} from 'lucide-react';
import {
    collection, addDoc, serverTimestamp, query, where,
    orderBy, limit, getDocs, Timestamp
} from 'firebase/firestore';
import { auth, db } from '../firebase';

const Feedback = () => {
    // Form States
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [category, setCategory] = useState('');
    const [specificTest, setSpecificTest] = useState('');
    const [recommendation, setRecommendation] = useState('');
    const [message, setMessage] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);

    // UI & Logic States
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [recentFeedback, setRecentFeedback] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(true);
    const [cooldownRemaining, setCooldownRemaining] = useState(0);

    const categories = [
        { id: 'general', label: 'General', icon: <MessageSquare size={32} /> },
        { id: 'screening', label: 'Screening Tests', icon: <Brain size={32} /> },
        { id: 'ui', label: 'Design & UI', icon: <Palette size={32} /> },
        { id: 'bug', label: 'Bug Report', icon: <Bug size={32} /> },
        { id: 'feature', label: 'Feature Request', icon: <Sparkles size={32} /> },
        { id: 'accessibility', label: 'Accessibility', icon: <Accessibility size={32} /> }
    ];

    const tests = [
        "Parkinson's Screening",
        "Alzheimer's Screening",
        "Multiple Sclerosis (MS)",
        "Epilepsy Screening",
        "Reaction Time Test",
        "Finger Tapping Test",
        "Vision Contrast Test"
    ];

    const COOLDOWN_PERIOD = 5 * 60 * 1000; // 5 minutes in ms

    const fetchUserHistory = async () => {
        if (!auth.currentUser) {
            setLoadingHistory(false);
            return;
        }
        setLoadingHistory(true);
        try {
            const q = query(
                collection(db, 'feedback'),
                where('userId', '==', auth.currentUser.uid),
                orderBy('createdAt', 'desc'),
                limit(5)
            );
            const querySnapshot = await getDocs(q);
            const history = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate() || new Date()
            }));
            setRecentFeedback(history);

            // Check Cooldown
            if (history.length > 0) {
                const lastSub = history[0].createdAt.getTime();
                const now = Date.now();
                const diff = now - lastSub;
                if (diff < COOLDOWN_PERIOD) {
                    setCooldownRemaining(Math.ceil((COOLDOWN_PERIOD - diff) / 1000));
                }
            }
        } catch (err) {
            console.error('Error fetching history:', err);
        } finally {
            setLoadingHistory(false);
        }
    };

    useEffect(() => {
        // Run once on mount and every time the auth state resolves
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                fetchUserHistory();
            } else {
                setLoadingHistory(false);
            }
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        let timer;
        if (cooldownRemaining > 0) {
            timer = setInterval(() => {
                setCooldownRemaining(prev => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [cooldownRemaining]);

    const handleSubmit = async () => {
        if (!rating) { setError('Please select a rating'); return; }
        if (!category) { setError('Please select a category'); return; }
        if (category === 'screening' && !specificTest) { setError('Please select which screening you are referring to'); return; }
        if (!recommendation) { setError('Please let us know if you would recommend NeuroScreen'); return; }
        if (!message.trim()) { setError('Please write your feedback details'); return; }
        if (cooldownRemaining > 0) { setError(`Please wait ${Math.floor(cooldownRemaining / 60)}m ${cooldownRemaining % 60}s before submitting again`); return; }

        setError('');
        setSubmitting(true);

        try {
            const payload = {
                userId: auth.currentUser?.uid || 'anonymous',
                userEmail: isAnonymous ? 'anonymous' : (auth.currentUser?.email || 'unknown'),
                isAnonymous,
                rating,
                category,
                specificTest: category === 'screening' ? specificTest : null,
                recommendation,
                message: message.trim(),
                createdAt: serverTimestamp()
            };

            await addDoc(collection(db, 'feedback'), payload);
            setSubmitted(true);
            fetchUserHistory(); // Refresh history
        } catch (err) {
            console.error('Submission error:', err);
            setError('Failed to submit feedback. Please try again later.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleReset = () => {
        setRating(0);
        setHoverRating(0);
        setCategory('');
        setSpecificTest('');
        setRecommendation('');
        setMessage('');
        setIsAnonymous(false);
        setSubmitted(false);
        setError('');
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    if (submitted) {
        return (
            <div style={{ padding: '6rem 2rem', minHeight: 'calc(100vh - 70px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    style={{ textAlign: 'center', maxWidth: '500px' }}
                >
                    <div style={{
                        width: '100px', height: '100px', borderRadius: '50%',
                        background: 'var(--primary-muted)',
                        border: '2px solid var(--primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 2.5rem',
                        boxShadow: '0 10px 25px rgba(0, 201, 167, 0.2)'
                    }}>
                        <CheckCircle size={48} color="var(--primary)" />
                    </div>
                    <h2 style={{ fontSize: '2.5rem', color: 'var(--text-heading)', marginBottom: '1rem', fontWeight: 800 }}>Feedback Logged</h2>
                    <p style={{ color: 'var(--text-body)', fontSize: '1.2rem', marginBottom: '3rem', lineHeight: 1.8 }}>
                        Thank you for helping us clinical-standardize NeuroScreen. Your feedback is now part of our development cycle.
                    </p>
                    <button
                        onClick={handleReset}
                        className="btn-primary"
                        style={{ padding: '1.1rem 3rem' }}
                    >
                        New Submission
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div style={{ padding: '6rem 2rem 10rem', minHeight: 'calc(100vh - 70px)', overflowX: 'hidden' }}>
            <div className="container" style={{ maxWidth: '850px' }}>
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ textAlign: 'center', marginBottom: '5rem' }}
                >
                    <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 3.8rem)', color: 'var(--text-heading)', fontWeight: 800, marginBottom: '1.25rem', letterSpacing: '-1.5px' }}>
                        Clinical <span style={{ color: 'var(--primary)' }}>Insights</span>
                    </h1>
                    <p style={{ color: 'var(--text-body)', fontSize: '1.25rem', maxWidth: '650px', margin: '0 auto', lineHeight: 1.8 }}>
                        Your feedback drives our neurological research and application reliability. Tell us about your screening experience.
                    </p>
                </motion.div>

                {/* Form Body */}
                <div style={{ display: 'grid', gap: '4rem' }}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-card"
                        style={{ padding: '4rem 3.5rem' }}
                    >
                        {/* Rating Row */}
                        <div style={{ marginBottom: '4rem', textAlign: 'center' }}>
                            <label style={{ display: 'block', color: 'var(--text-heading)', fontSize: '1.1rem', fontWeight: 700, marginBottom: '2rem' }}>
                                Overall Experience Rating
                            </label>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.5rem' }}
                                    >
                                        <Star
                                            size={48}
                                            color="var(--primary)"
                                            fill={(hoverRating || rating) >= star ? 'var(--primary)' : 'transparent'}
                                            strokeWidth={1.5}
                                            style={{ transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)', transform: (hoverRating || rating) >= star ? 'scale(1.15)' : 'scale(1)' }}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Recommend Section */}
                        <div style={{ marginBottom: '4rem' }}>
                            <label style={{ display: 'block', color: 'var(--text-heading)', fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem', textAlign: 'center' }}>
                                Would you recommend NeuroScreen to others?
                            </label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
                                {['Yes', 'Maybe', 'No'].map((opt) => (
                                    <button
                                        key={opt}
                                        onClick={() => setRecommendation(opt)}
                                        style={{
                                            padding: '1.2rem',
                                            borderRadius: '16px',
                                            border: `2px solid ${recommendation === opt ? 'var(--primary)' : 'var(--input-border)'}`,
                                            background: recommendation === opt ? 'var(--primary-muted)' : 'var(--glass-bg)',
                                            color: recommendation === opt ? 'var(--primary)' : 'var(--text-body)',
                                            fontWeight: 700,
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            boxShadow: recommendation === opt ? '0 8px 20px rgba(0, 201, 167, 0.15)' : 'none'
                                        }}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Category Grid */}
                        <div style={{ marginBottom: '4rem' }}>
                            <label style={{ display: 'block', color: 'var(--text-heading)', fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem' }}>
                                Category
                            </label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                                {categories.map((cat) => (
                                    <motion.button
                                        key={cat.id}
                                        whileHover={{ y: -5, boxShadow: '0 12px 30px rgba(0, 201, 167, 0.12)' }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => { setCategory(cat.id); if (cat.id !== 'screening') setSpecificTest(''); }}
                                        style={{
                                            padding: '2.5rem 1.5rem',
                                            borderRadius: '24px',
                                            border: `2px solid ${category === cat.id ? 'var(--primary)' : 'var(--glass-border)'}`,
                                            background: category === cat.id ? 'var(--primary-muted)' : 'var(--glass-bg)',
                                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem',
                                            cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                            position: 'relative',
                                            overflow: 'hidden'
                                        }}
                                    >
                                        {/* Background Hint of Color */}
                                        <div style={{
                                            position: 'absolute',
                                            top: 0, left: 0, right: 0, height: '4px',
                                            background: category === cat.id ? 'var(--primary)' : 'transparent',
                                            transition: 'all 0.3s'
                                        }} />

                                        <div style={{
                                            padding: '1rem',
                                            borderRadius: '16px',
                                            background: category === cat.id ? 'var(--bg-3)' : 'var(--primary-muted)',
                                            color: 'var(--primary)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            boxShadow: category === cat.id ? '0 4px 12px rgba(0, 201, 167, 0.15)' : 'none',
                                            transition: 'all 0.3s'
                                        }}>
                                            {cat.icon}
                                        </div>
                                        <span style={{ color: category === cat.id ? 'var(--primary)' : 'var(--text-heading)', fontSize: '1rem', fontWeight: 800, textAlign: 'center' }}>
                                            {cat.label}
                                        </span>
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        {/* Conditional Test Selection */}
                        <AnimatePresence>
                            {category === 'screening' && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    style={{ marginBottom: '4rem', overflow: 'hidden' }}
                                >
                                    <label style={{ display: 'block', color: 'var(--text-heading)', fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' }}>
                                        Which test are you referring to?
                                    </label>
                                    <select
                                        value={specificTest}
                                        onChange={(e) => setSpecificTest(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '1.2rem',
                                            background: 'var(--input-bg)',
                                            border: '2px solid var(--input-border)',
                                            borderRadius: '16px',
                                            color: 'var(--text-heading)',
                                            fontSize: '1.05rem',
                                            fontWeight: 500,
                                            outline: 'none',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <option value="" disabled>Select a screening test...</option>
                                        {tests.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Feedback Area */}
                        <div style={{ marginBottom: '3.5rem' }}>
                            <label style={{ display: 'block', color: 'var(--text-heading)', fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' }}>
                                Detailed Feedback
                            </label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="What specifically could be improved? Be as clinical or descriptive as you like."
                                rows={6}
                                style={{
                                    width: '100%', padding: '1.75rem', background: 'var(--input-bg)',
                                    border: '2px solid var(--input-border)', borderRadius: '20px',
                                    color: 'var(--text-heading)', fontSize: '1.05rem', lineHeight: 1.8, outline: 'none',
                                    resize: 'vertical', fontFamily: 'inherit'
                                }}
                            />
                        </div>

                        {/* Privacy Toggle */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '4rem' }}>
                            <button
                                onClick={() => setIsAnonymous(!isAnonymous)}
                                style={{
                                    width: '50px', height: '28px', borderRadius: '15px',
                                    background: isAnonymous ? 'var(--primary)' : '#cbd5e1',
                                    position: 'relative', border: 'none', cursor: 'pointer', transition: 'all 0.3s'
                                }}
                            >
                                <div style={{
                                    width: '22px', height: '22px', borderRadius: '50%', background: 'white',
                                    position: 'absolute', top: '3px', left: isAnonymous ? '25px' : '3px',
                                    transition: 'all 0.3s',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }} />
                            </button>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                <EyeOff size={20} color={isAnonymous ? 'var(--primary)' : 'var(--text-body)'} />
                                <span style={{ color: isAnonymous ? 'var(--text-heading)' : 'var(--text-body)', fontSize: '1rem', fontWeight: 600 }}>
                                    Submit Anonymously
                                </span>
                            </div>
                        </div>

                        {/* Error Handling */}
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1.25rem 1.75rem', background: '#fff1f2', border: '1px solid #fda4af', borderRadius: '16px', marginBottom: '2.5rem' }}
                                >
                                    <AlertCircle size={22} color="#e11d48" />
                                    <span style={{ color: '#e11d48', fontSize: '0.95rem', fontWeight: 600 }}>{error}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Submit Button */}
                        <motion.button
                            whileHover={!(submitting || cooldownRemaining > 0) ? { scale: 1.02 } : {}}
                            whileTap={!(submitting || cooldownRemaining > 0) ? { scale: 0.98 } : {}}
                            onClick={handleSubmit}
                            disabled={submitting || cooldownRemaining > 0}
                            className="btn-primary"
                            style={{
                                width: '100%',
                                padding: '1.4rem',
                                fontSize: '1.2rem',
                                background: (submitting || cooldownRemaining > 0) ? '#e2e8f0' : 'var(--primary)',
                                color: (submitting || cooldownRemaining > 0) ? '#94a3b8' : '#0A1628',
                                opacity: 1
                            }}
                        >
                            {submitting ? (
                                <RefreshCcw className="animate-spin" size={24} />
                            ) : cooldownRemaining > 0 ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                    <Clock size={24} />
                                    <span>Rate Limited: {formatTime(cooldownRemaining)}</span>
                                </div>
                            ) : (
                                <>
                                    <Send size={24} />
                                    Dispatch Feedback
                                </>
                            )}
                        </motion.button>
                    </motion.div>

                    {/* History Section */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                <div style={{ padding: '0.9rem', background: 'var(--primary-muted)', borderRadius: '14px', border: '1px solid rgba(0, 201, 167, 0.1)' }}>
                                    <History size={26} color="var(--primary)" />
                                </div>
                                <h2 style={{ fontSize: '2rem', color: 'var(--text-heading)', fontWeight: 800 }}>Recent Activity</h2>
                            </div>
                            <button
                                onClick={fetchUserHistory}
                                disabled={loadingHistory}
                                style={{
                                    background: 'var(--glass-bg)',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: '12px',
                                    padding: '0.75rem 1.25rem',
                                    cursor: 'pointer',
                                    color: 'var(--primary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.6rem',
                                    fontSize: '0.95rem',
                                    fontWeight: 700,
                                    transition: 'all 0.2s',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                                }}
                            >
                                <RefreshCcw size={18} className={loadingHistory ? 'animate-spin' : ''} />
                                Refresh
                            </button>
                        </div>

                        {loadingHistory ? (
                            <div style={{ color: 'var(--text-body)', display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'center', padding: '4rem' }}>
                                <RefreshCcw size={20} className="animate-spin" />
                                <span style={{ fontWeight: 600 }}>Fetching secure history...</span>
                            </div>
                        ) : recentFeedback.length > 0 ? (
                            <div style={{ display: 'grid', gap: '1.5rem' }}>
                                {recentFeedback.map((item, idx) => (
                                    <div
                                        key={item.id}
                                        className="glass-card"
                                        style={{ padding: '2rem 2.5rem' }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem', alignItems: 'center' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--primary)', background: 'var(--primary-muted)', padding: '0.4rem 1rem', borderRadius: '100px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                    {item.category}
                                                </div>
                                                {item.isAnonymous && <EyeOff size={16} color="var(--text-body)" opacity={0.6} />}
                                            </div>
                                            <span style={{ fontSize: '0.85rem', color: 'var(--text-body)', fontWeight: 500 }}>
                                                {item.createdAt.toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
                                            <div style={{ display: 'flex', gap: '0.4rem', paddingTop: '0.4rem' }}>
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} size={16} color={i < item.rating ? 'var(--primary)' : '#e2e8f0'} fill={i < item.rating ? 'var(--primary)' : 'transparent'} />
                                                ))}
                                            </div>
                                            <p style={{ color: 'var(--text-heading)', fontSize: '1.05rem', margin: 0, lineHeight: 1.8, flex: 1, fontWeight: 500 }}>
                                                "{item.message}"
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ padding: '4rem', textAlign: 'center', background: 'var(--glass-bg)', border: '2px dashed var(--glass-border)', borderRadius: '24px' }}>
                                <MessageSquare size={40} color="var(--slate-300)" style={{ marginBottom: '1rem' }} />
                                <p style={{ color: 'var(--text-body)', margin: 0, fontWeight: 500 }}>No recent feedback detected in your clinical profile.</p>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                select::-ms-expand { display: none; }
                select {
                    -webkit-appearance: none;
                    -moz-appearance: none;
                    text-overflow: '';
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%234A5568' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
                    background-repeat: no-repeat;
                    background-position: right 1.25rem center;
                    background-size: 1.2rem;
                }
            `}} />
        </div>
    );
};

export default Feedback;
