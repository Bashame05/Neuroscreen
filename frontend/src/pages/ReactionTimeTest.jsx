import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Zap, ArrowRight, RotateCcw, Info, AlertTriangle, AlertCircle, ShieldCheck, Clock, Target, FileText, Activity } from 'lucide-react';

const TOTAL_ROUNDS = 8;
const MIN_DELAY = 2000;
const MAX_DELAY = 5000;

const getRiskLevel = (avgMs) => {
    if (avgMs < 350) return {
        level: 'Normal',
        color: 'var(--success)',
        colorHex: '#64FFDA',
        message: 'Neurological response speed within healthy range.',
        explanation: 'Your average reaction time falls within the expected range for healthy neurological function. The brain\'s motor cortex and peripheral nervous system are responding to visual stimuli at a normal speed.'
    };
    if (avgMs <= 450) return {
        level: 'Borderline',
        color: 'var(--caution)',
        colorHex: '#FACC15',
        message: 'Slightly delayed response — monitor closely.',
        explanation: 'Your reaction time is slightly above the typical range. This could be influenced by fatigue, medication, or mild neurological factors. Repeated testing and monitoring are recommended to establish a baseline.'
    };
    return {
        level: 'Flagged',
        color: 'var(--error)',
        colorHex: '#FF5252',
        message: 'Significantly delayed neurological response — consult a neurologist.',
        explanation: 'Your reaction time is significantly above the healthy range. Delayed reaction times can indicate disruptions in neural signal transmission, which may be associated with seizure-related cognitive effects or medication side effects. A comprehensive neurological evaluation is recommended.'
    };
};

const ReactionTimeTest = () => {
    const navigate = useNavigate();
    const [phase, setPhase] = useState('intro'); // intro | testing | results
    const [round, setRound] = useState(0);
    const [results, setResults] = useState([]);
    const [circleState, setCircleState] = useState('idle'); // idle | waiting | ready | clicked | tooEarly
    const [reactionTime, setReactionTime] = useState(null);
    const [showRoundResult, setShowRoundResult] = useState(false);

    const timerRef = useRef(null);
    const startTimeRef = useRef(null);

    const cleanup = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    useEffect(() => {
        return cleanup;
    }, [cleanup]);

    const startRound = useCallback(() => {
        cleanup();
        setCircleState('waiting');
        setReactionTime(null);
        setShowRoundResult(false);

        const delay = MIN_DELAY + Math.random() * (MAX_DELAY - MIN_DELAY);
        timerRef.current = setTimeout(() => {
            setCircleState('ready');
            startTimeRef.current = performance.now();
        }, delay);
    }, [cleanup]);

    const handleCircleClick = useCallback(() => {
        if (circleState === 'waiting') {
            // Clicked too early
            cleanup();
            setCircleState('tooEarly');
            setTimeout(() => startRound(), 1500);
            return;
        }

        if (circleState === 'ready') {
            const elapsed = Math.round(performance.now() - startTimeRef.current);
            setReactionTime(elapsed);
            setCircleState('clicked');
            setShowRoundResult(true);

            const newResults = [...results, elapsed];
            setResults(newResults);

            if (newResults.length >= TOTAL_ROUNDS) {
                // Save results for combined report using newResults directly to avoid stale state
                const stats = getStats(newResults);
                const risk = getRiskLevel(stats.avg);
                localStorage.setItem('neuroscreen_epilepsy_reaction', JSON.stringify({
                    avg: stats.avg,
                    fastest: stats.fastest,
                    slowest: stats.slowest,
                    results: newResults,
                    risk: risk.level,
                    completedAt: new Date().toISOString()
                }));
                setTimeout(() => setPhase('results'), 1200);
            } else {
                setTimeout(() => {
                    setRound(r => r + 1);
                    startRound();
                }, 1200);
            }
        }
    }, [circleState, cleanup, results, startRound]);

    // Spacebar listener
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === ' ' && phase === 'testing') {
                e.preventDefault();
                handleCircleClick();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleCircleClick, phase]);

    const handleStart = () => {
        setPhase('testing');
        setRound(0);
        setResults([]);
        setTimeout(() => startRound(), 500);
    };

    const handleRestart = () => {
        cleanup();
        setPhase('intro');
        setRound(0);
        setResults([]);
        setCircleState('idle');
        setReactionTime(null);
        setShowRoundResult(false);
    };

    // Calculate stats for results
    const getStats = (resultsArray = results) => {
        if (resultsArray.length < TOTAL_ROUNDS) return null;
        const sorted = [...resultsArray].sort((a, b) => a - b);
        const trimmed = sorted.slice(1, -1); // Remove fastest and slowest
        const avg = Math.round(trimmed.reduce((s, v) => s + v, 0) / trimmed.length);
        const fastest = sorted[0];
        const slowest = sorted[sorted.length - 1];
        return { avg, fastest, slowest, trimmed, sorted };
    };

    const getCircleColor = () => {
        switch (circleState) {
            case 'waiting': return { bg: '#1d3359', border: 'rgba(100, 255, 218, 0.15)', shadow: 'none' };
            case 'ready': return { bg: 'rgba(100, 255, 218, 0.2)', border: 'var(--cyan)', shadow: '0 0 60px rgba(100, 255, 218, 0.4), 0 0 120px rgba(100, 255, 218, 0.15)' };
            case 'clicked': return { bg: 'rgba(100, 255, 218, 0.1)', border: 'var(--cyan)', shadow: 'none' };
            case 'tooEarly': return { bg: 'rgba(255, 82, 82, 0.15)', border: 'var(--error)', shadow: '0 0 40px rgba(255, 82, 82, 0.2)' };
            default: return { bg: '#1d3359', border: 'rgba(100, 255, 218, 0.1)', shadow: 'none' };
        }
    };

    // ─── INTRO ───
    if (phase === 'intro') {
        return (
            <div style={{ padding: '6rem 2rem 10rem', minHeight: 'calc(100vh - 70px)' }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ maxWidth: '850px', margin: '0 auto', textAlign: 'center' }}
                >
                    <div style={{
                        width: '100px', height: '100px', borderRadius: '32px',
                        background: 'var(--bg-3)', border: '1px solid var(--glass-border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 2.5rem', boxShadow: '0 10px 25px rgba(0,0,0,0.05)'
                    }}>
                        <Zap size={48} color="var(--primary)" />
                    </div>

                    <h2 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--text-heading)', letterSpacing: '-1.5px' }}>
                        Reaction Time <span style={{ color: 'var(--primary)' }}>Assessment</span>
                    </h2>
                    <p style={{ color: 'var(--text-body)', fontSize: '1.2rem', maxWidth: '650px', margin: '0 auto 3.5rem', lineHeight: 1.8 }}>
                        When the circle turns green, click it as fast as you can. This test measures your
                        neurological response speed across {TOTAL_ROUNDS} validation rounds.
                    </p>

                    <div className="glass-card" style={{
                        textAlign: 'left', padding: '3.5rem', marginBottom: '3.5rem',
                        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2.5rem'
                    }}>
                        {[
                            { label: 'Evaluation Rounds', value: String(TOTAL_ROUNDS), icon: <Target size={20} color="var(--primary)" /> },
                            { label: 'Est. Duration', value: '1 min', icon: <Clock size={20} color="var(--primary)" /> },
                            { label: 'Test Category', value: 'Motor Speed', icon: <Zap size={20} color="var(--primary)" /> }
                        ].map((item) => (
                            <div key={item.label} style={{ textAlign: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                    {item.icon}
                                    <span style={{ color: 'var(--text-body)', fontSize: '0.95rem', fontWeight: 600 }}>{item.label}</span>
                                </div>
                                <div style={{ color: 'var(--text-heading)', fontSize: '1.8rem', fontWeight: '800' }}>{item.value}</div>
                            </div>
                        ))}
                    </div>

                    <div className="glass-card" style={{
                        background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
                        padding: '3rem', marginBottom: '3.5rem', textAlign: 'left'
                    }}>
                        <h4 style={{ fontSize: '1.1rem', color: 'var(--text-heading)', marginBottom: '2rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Testing Protocol</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                            {[
                                'A target circle will appear in the center of the viewport',
                                'Wait for the visual trigger (color transition to green)',
                                'Click the target or press Spacebar as fast as possible',
                                'Avoid early triggers to maintain data integrity'
                            ].map((step, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                    <div style={{
                                        width: '28px', height: '28px', borderRadius: '10px',
                                        background: 'var(--primary-muted)', border: '1px solid rgba(0, 201, 167, 0.2)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '0.9rem', color: 'var(--primary)', fontWeight: '800', flexShrink: 0
                                    }}>{i + 1}</div>
                                    <span style={{ color: 'var(--text-body)', fontSize: '1rem', fontWeight: 500 }}>{step}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button
                        className="btn-primary"
                        onClick={handleStart}
                        style={{
                            padding: '1.25rem 3.5rem', fontSize: '1.1rem',
                            display: 'inline-flex', alignItems: 'center', gap: '1rem', boxShadow: '0 15px 30px rgba(0, 201, 167, 0.2)'
                        }}
                    >
                        Begin Assessment <ArrowRight size={22} />
                    </button>
                </motion.div>
            </div>
        );
    }

    // ─── TESTING ───
    if (phase === 'testing') {
        return (
            <div style={{ padding: '6rem 2rem 10rem', minHeight: 'calc(100vh - 70px)' }}>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}
                >
                    {/* Progress */}
                    <div style={{ marginBottom: '4rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                            <span style={{ color: 'var(--text-heading)', fontWeight: '800', fontSize: '1.1rem', letterSpacing: '0.5px' }}>
                                ROUND <span style={{ color: 'var(--primary)' }}>{Math.min(round + 1, TOTAL_ROUNDS)}</span> OF {TOTAL_ROUNDS}
                            </span>
                            <span style={{ color: 'var(--primary)', fontSize: '1rem', fontWeight: '800' }}>
                                {Math.round(((round + 1) / TOTAL_ROUNDS) * 100)}%
                            </span>
                        </div>
                        <div style={{
                            width: '100%', height: '10px', background: 'var(--glass-bg)',
                            borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--glass-border)'
                        }}>
                            <motion.div
                                animate={{ width: `${((round + 1) / TOTAL_ROUNDS) * 100}%` }}
                                transition={{ duration: 0.4, ease: 'easeOut' }}
                                style={{ height: '100%', background: 'var(--primary)', borderRadius: '10px', boxShadow: '0 0 15px rgba(0, 201, 167, 0.2)' }}
                            />
                        </div>
                    </div>

                    {/* Instruction text */}
                    <AnimatePresence mode="wait">
                        <motion.p
                            key={circleState}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            style={{
                                color: circleState === 'tooEarly' ? 'var(--error)' : circleState === 'ready' ? 'var(--primary)' : 'var(--text-heading)',
                                fontSize: '1.5rem', marginBottom: '3.5rem', minHeight: '2.5rem',
                                fontWeight: 800, letterSpacing: '-0.5px'
                            }}
                        >
                            {circleState === 'waiting' && 'Wait for trigger...'}
                            {circleState === 'ready' && 'TRIGGER ACTIVATED!'}
                            {circleState === 'clicked' && `Response: ${reactionTime} ms`}
                            {circleState === 'tooEarly' && "False Start! Re-calibrating..."}
                            {circleState === 'idle' && 'Initializing...'}
                        </motion.p>
                    </AnimatePresence>

                    {/* Circle */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '4rem', gap: '2rem' }}>
                        <motion.div
                            onClick={handleCircleClick}
                            animate={{
                                scale: circleState === 'ready' ? [1, 1.05, 1] : 1,
                            }}
                            transition={{
                                scale: { duration: 0.8, repeat: Infinity, ease: 'easeInOut' }
                            }}
                            style={{
                                width: '320px', height: '320px', borderRadius: '50%',
                                background: circleState === 'ready' ? 'var(--primary)' : circleState === 'tooEarly' ? 'var(--error)' : 'var(--bg-3)',
                                border: `8px solid ${circleState === 'ready' ? 'rgba(0, 201, 167, 0.3)' : 'var(--glass-border)'}`,
                                boxShadow: circleState === 'ready' ? '0 0 80px rgba(0, 201, 167, 0.4), 0 0 150px rgba(0, 201, 167, 0.15)' : '0 10px 40px rgba(0,0,0,0.05)',
                                cursor: (circleState === 'waiting' || circleState === 'ready') ? 'pointer' : 'default',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                userSelect: 'none'
                            }}
                        >
                            {circleState === 'waiting' && <Clock size={80} color="#cbd5e1" />}
                            {circleState === 'ready' && <Target size={80} color="white" />}
                            {circleState === 'clicked' && (
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ color: 'white', fontSize: '3rem', fontWeight: '900', letterSpacing: '-2px' }}>
                                        {reactionTime}ms
                                    </div>
                                    <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase' }}>Recorded</div>
                                </div>
                            )}
                            {circleState === 'tooEarly' && <AlertTriangle size={80} color="white" />}
                            {circleState === 'idle' && <Zap size={80} color="#cbd5e1" />}
                        </motion.div>
                        
                        <p style={{ 
                            color: 'var(--text-body)', 
                            fontSize: '1rem', 
                            fontWeight: 600,
                            opacity: (circleState === 'waiting' || circleState === 'ready') ? 1 : 0,
                            transition: 'opacity 0.3s ease'
                        }}>
                            Use mouse click or press <span style={{ color: 'var(--primary)', fontWeight: '800' }}>Spacebar</span>
                        </p>
                    </div>

                    {/* Previous round results */}
                    <div className="glass-card" style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap', padding: '1.5rem', background: 'var(--glass-bg)' }}>
                        {results.length === 0 && <span style={{ color: 'var(--text-body)', opacity: 0.5, fontSize: '0.9rem' }}>Recent trials will appear here</span>}
                        {results.map((time, i) => (
                            <motion.div
                                key={i}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                style={{
                                    padding: '0.5rem 1rem', borderRadius: '12px',
                                    background: 'var(--bg-3)',
                                    border: `1px solid ${time < 350 ? 'rgba(0, 201, 167, 0.2)' : 'var(--glass-border)'}`,
                                    fontSize: '0.85rem', fontWeight: '700',
                                    color: time < 350 ? 'var(--primary)' : 'var(--text-heading)',
                                    boxShadow: '0 4px 10px rgba(0,0,0,0.02)'
                                }}
                            >
                                <span style={{ opacity: 0.5 }}>R{i + 1}:</span> {time}ms
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        );
    }

    // ─── RESULTS ───
    const stats = getStats();
    if (!stats) return null;
    const risk = getRiskLevel(stats.avg);
    const maxTime = Math.max(...results);

    return (
        <div style={{ padding: '6rem 2rem 10rem', minHeight: 'calc(100vh - 70px)' }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{ maxWidth: '900px', margin: '0 auto' }}
            >
                {/* Risk Banner */}
                <div className="glass-card" style={{
                    borderTop: `8px solid ${risk.colorHex}`,
                    padding: '5rem 3rem', textAlign: 'center',
                    marginBottom: '3rem', position: 'relative', overflow: 'hidden'
                }}>
                    <div style={{
                        width: '100px', height: '100px', borderRadius: '50%',
                        background: `${risk.colorHex}15`, border: `2px solid ${risk.colorHex}30`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 2rem', position: 'relative', boxShadow: `0 10px 30px ${risk.colorHex}20`
                    }}>
                        {stats.avg < 350 ? <ShieldCheck size={48} color={risk.colorHex} /> :
                            stats.avg <= 450 ? <AlertTriangle size={48} color={risk.colorHex} /> :
                                <AlertCircle size={48} color={risk.colorHex} />}
                    </div>

                    <h2 style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--text-heading)', marginBottom: '1rem', letterSpacing: '-1px' }}>
                        Performance: <span style={{ color: risk.color }}>{risk.level}</span>
                    </h2>
                    <p style={{ color: 'var(--text-body)', fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto', fontWeight: 500, lineHeight: 1.6 }}>
                        {risk.message}
                    </p>

                    <div style={{
                        marginTop: '2.5rem', display: 'inline-flex', alignItems: 'center', gap: '1rem',
                        background: 'var(--bg-3)', borderRadius: '16px', border: '1px solid var(--glass-border)',
                        padding: '0.75rem 2.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.03)'
                    }}>
                        <span style={{ color: 'var(--text-body)', fontWeight: 600 }}>Validation Average</span>
                        <div style={{ width: '1px', height: '20px', background: '#e2e8f0' }} />
                        <span style={{ color: risk.color, fontWeight: '800', fontSize: '1.8rem' }}>{stats.avg}</span>
                        <span style={{ color: '#94a3b8', fontSize: '1.1rem' }}>ms</span>
                    </div>
                </div>

                {/* Bar Chart */}
                <div className="glass-card" style={{ padding: '3.5rem', marginBottom: '3rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '3rem' }}>
                        <div style={{ padding: '0.75rem', background: 'var(--primary-muted)', borderRadius: '12px' }}>
                            <Activity size={24} color="var(--primary)" />
                        </div>
                        <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-heading)', margin: 0 }}>
                            RESPONSE VELOCITY PROFILE
                        </h4>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: '220px', padding: '0 1rem' }}>
                        {results.map((time, i) => {
                            const heightPct = Math.max((time / maxTime) * 100, 10);
                            const isTrimmed = time === stats.fastest || time === stats.slowest;
                            const barColor = time < 350 ? 'var(--primary)' : time <= 450 ? 'var(--caution)' : 'var(--error)';

                            return (
                                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                                    <span style={{
                                        fontSize: '0.8rem', fontWeight: '800', marginBottom: '8px',
                                        color: isTrimmed ? '#94a3b8' : barColor
                                    }}>
                                        {time}
                                    </span>
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${heightPct}%` }}
                                        transition={{ duration: 0.8, delay: i * 0.1, ease: [0.175, 0.885, 0.32, 1.1] }}
                                        style={{
                                            width: '100%', borderRadius: '10px 10px 4px 4px',
                                            background: isTrimmed
                                                ? '#f1f5f9'
                                                : `linear-gradient(180deg, ${barColor}, ${barColor}cc)`,
                                            border: isTrimmed
                                                ? '1px dashed #cbd5e1'
                                                : 'none',
                                            opacity: isTrimmed ? 0.4 : 1,
                                            boxShadow: isTrimmed ? 'none' : `0 4px 15px ${barColor}20`
                                        }}
                                    />
                                    <span style={{
                                        fontSize: '0.85rem', marginTop: '12px',
                                        color: 'var(--text-body)',
                                        fontWeight: 700
                                    }}>
                                        R{i + 1}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', marginTop: '3rem', fontSize: '0.9rem', color: 'var(--text-body)', fontWeight: 600 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: '12px', height: '12px', borderRadius: '4px', background: 'var(--primary)' }} />
                            <span>Clinical Average Range</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.5 }}>
                            <div style={{ width: '12px', height: '12px', borderRadius: '4px', border: '1px dashed #94a3b8' }} />
                            <span>Statistical Outliers</span>
                        </div>
                    </div>
                </div>

                {/* Stats Summary */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
                    {[
                        { label: 'Minimum Latency', value: `${stats.fastest}ms`, color: 'var(--primary)' },
                        { label: 'Trimmed Mean', value: `${stats.avg}ms`, color: risk.color },
                        { label: 'Maximum Latency', value: `${stats.slowest}ms`, color: 'var(--error)' }
                    ].map((stat) => (
                        <div key={stat.label} className="glass-card" style={{
                            padding: '2rem', textAlign: 'center', background: 'var(--bg-3)'
                        }}>
                            <div style={{ color: stat.color, fontSize: '2rem', fontWeight: '900', letterSpacing: '-1px' }}>{stat.value}</div>
                            <div style={{ color: 'var(--text-body)', fontSize: '0.9rem', marginTop: '0.5rem', fontWeight: 600 }}>{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* Clinical Explanation */}
                <div className="glass-card" style={{ padding: '3.5rem', marginBottom: '3rem' }}>
                    <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-heading)', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Neuro-Cognitive Impact
                    </h4>
                    <p style={{ color: 'var(--text-body)', fontSize: '1.1rem', lineHeight: '1.8', fontWeight: 500 }}>
                        {risk.explanation}
                    </p>
                    <div style={{
                        marginTop: '2.5rem', padding: '2rem', borderRadius: '24px',
                        background: 'var(--primary-muted)', borderLeft: '6px solid var(--primary)'
                    }}>
                        <p style={{ color: 'var(--text-body)', fontSize: '1rem', lineHeight: '1.8', margin: 0 }}>
                            <strong style={{ color: 'var(--text-heading)' }}>Clinical Correlation:</strong> Seizure
                            activity and medication protocols can significantly impact neural processing speed. Reaction time monitoring provides
                            a quantifiable longitudinal metric of cognitive efficiency and therapeutic response.
                        </p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
                    <button
                        className="btn-primary"
                        onClick={() => navigate('/dashboard')}
                        style={{ flex: 1, padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', fontSize: '1.1rem', fontWeight: 700, background: 'var(--bg-3)', border: '1px solid var(--glass-border)', color: 'var(--text-heading)' }}
                        onMouseOver={(e) => e.currentTarget.style.background = 'var(--glass-bg)'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'var(--bg-3)'}
                    >
                        Dashboard
                    </button>
                    <button
                        className="btn-primary"
                        onClick={() => navigate('/screening/epilepsy/results')}
                        style={{ flex: 1.5, padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', fontSize: '1.1rem', fontWeight: 700, boxShadow: '0 10px 30px rgba(0, 201, 167, 0.2)' }}
                    >
                        View Full Clinical Profile <ArrowRight size={24} />
                    </button>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <button
                        onClick={handleRestart}
                        style={{
                            padding: '1rem 2rem', borderRadius: '12px',
                            background: 'transparent', border: '1px solid #cbd5e1',
                            color: 'var(--text-body)', display: 'flex', alignItems: 'center', gap: '1rem',
                            fontSize: '1rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.02)'; e.currentTarget.style.borderColor = '#94a3b8'; }}
                        onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
                    >
                        <RotateCcw size={20} /> Retake Assessment
                    </button>
                </div>

                {/* Disclaimer */}
                <div style={{
                    fontSize: '0.9rem', color: 'var(--text-body)',
                    fontStyle: 'italic', textAlign: 'center', lineHeight: '1.8',
                    padding: '3rem 2rem', borderTop: '1px solid #e2e8f0', marginTop: '4rem', opacity: 0.7
                }}>
                    <strong style={{ color: 'var(--text-heading)' }}>Clinical Disclaimer:</strong> This test is a screening facilitator and does not replace diagnostic clinical evaluation.
                    Performance metrics can be modulated by non-neurological exogenous factors such as fatigue or secondary pharmacology.
                </div>
            </motion.div>
        </div>
    );
};

export default ReactionTimeTest;
