import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Hand, Timer, Activity, CheckCircle, AlertTriangle, ArrowRight, RotateCcw } from 'lucide-react';

const TEST_DURATION = 10; // seconds

const FingerTappingTest = () => {
    const navigate = useNavigate();

    // Step management: 'select' -> 'tap-1' -> 'tap-2' -> 'results'
    const [step, setStep] = useState('select');
    const [firstHand, setFirstHand] = useState(null);   // 'dominant' or 'non-dominant'
    const [secondHand, setSecondHand] = useState(null);

    // Tapping state
    const [countdown, setCountdown] = useState(TEST_DURATION);
    const [tapCount, setTapCount] = useState(0);
    const [tapTimestamps, setTapTimestamps] = useState([]);
    const [isRunning, setIsRunning] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);

    // Results
    const [hand1Result, setHand1Result] = useState(null);
    const [hand2Result, setHand2Result] = useState(null);

    // Keyboard/UI state
    const [isPressed, setIsPressed] = useState(false);

    const timerRef = useRef(null);
    const startTimeRef = useRef(null);

    // --- Timer logic ---
    const stopTest = useCallback(() => {
        setIsRunning(false);
        clearInterval(timerRef.current);
        timerRef.current = null;
    }, []);

    useEffect(() => {
        if (isRunning) {
            timerRef.current = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        stopTest();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timerRef.current);
    }, [isRunning, stopTest]);

    // When timer hits 0, save result for current hand
    useEffect(() => {
        if (countdown === 0 && hasStarted && !isRunning) {
            const result = { taps: tapCount, timestamps: [...tapTimestamps] };
            if (step === 'tap-1') {
                setHand1Result(result);
            } else if (step === 'tap-2') {
                setHand2Result(result);
            }
        }
    }, [countdown, hasStarted, isRunning, tapCount, tapTimestamps, step]);

    const handleTap = useCallback(() => {
        if (!isRunning && !hasStarted) {
            // First tap starts the timer
            setIsRunning(true);
            setHasStarted(true);
            startTimeRef.current = performance.now();
            setTapCount(1);
            setTapTimestamps([performance.now()]);
            return;
        }
        if (!isRunning) return; // Test ended

        setTapCount(prev => prev + 1);
        setTapTimestamps(prev => [...prev, performance.now()]);
    }, [isRunning, hasStarted]);

    // Handle spacebar input
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.code === 'Space' && (step === 'tap-1' || step === 'tap-2')) {
                e.preventDefault();
                if (!isPressed) {
                    setIsPressed(true);
                    handleTap();
                }
            }
        };

        const handleKeyUp = (e) => {
            if (e.code === 'Space') {
                setIsPressed(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [step, handleTap, isPressed]);

    const resetForNextHand = () => {
        setCountdown(TEST_DURATION);
        setTapCount(0);
        setTapTimestamps([]);
        setIsRunning(false);
        setHasStarted(false);
    };

    const handleHandSelect = (hand) => {
        setFirstHand(hand);
        setSecondHand(hand === 'dominant' ? 'non-dominant' : 'dominant');
        setStep('tap-1');
    };

    const proceedToSecondHand = () => {
        resetForNextHand();
        setStep('tap-2');
    };

    const proceedToResults = () => {
        // hand1Result is always set; hand2 data is in tapCount (current state)
        const hand2 = { taps: tapCount, timestamps: [...tapTimestamps] };
        const domRes = firstHand === 'dominant' ? hand1Result : hand2;
        const nonDomRes = firstHand === 'dominant' ? hand2 : hand1Result;
        const domTaps = domRes.taps;
        const nonDomTaps = nonDomRes.taps;
        const ratio = nonDomTaps > 0 ? (domTaps / nonDomTaps) : 0;
        const domFlagged = domTaps < 45;
        const nonDomFlagged = nonDomTaps < 40;
        const ratioFlagged = ratio > 1.7;
        const flagCount = [domFlagged, nonDomFlagged, ratioFlagged].filter(Boolean).length;
        const overallFlagged = flagCount >= 2;
        localStorage.setItem('neuroscreen_ms_tapping', JSON.stringify({
            domTaps, nonDomTaps, ratio, domFlagged, nonDomFlagged, ratioFlagged, overallFlagged, flagCount
        }));
        setStep('results');
    };

    const restartAll = () => {
        setStep('select');
        setFirstHand(null);
        setSecondHand(null);
        setHand1Result(null);
        setHand2Result(null);
        resetForNextHand();
    };


    const getMetrics = () => {
        if (!hand1Result || !hand2Result) return null;

        const domResult = firstHand === 'dominant' ? hand1Result : hand2Result;
        const nonDomResult = firstHand === 'non-dominant' ? hand1Result : hand2Result;

        const domTaps = domResult.taps;
        const nonDomTaps = nonDomResult.taps;
        const ratio = nonDomTaps > 0 ? (domTaps / nonDomTaps) : 0;

        const domFlagged = domTaps < 45;
        const nonDomFlagged = nonDomTaps < 40;
        const ratioFlagged = ratio > 1.7;
        const flagCount = [domFlagged, nonDomFlagged, ratioFlagged].filter(Boolean).length;
        const overallFlagged = flagCount >= 2;

        return {
            domTaps, nonDomTaps, ratio,
            domFlagged, nonDomFlagged, ratioFlagged,
            overallFlagged, flagCount
        };
    };

    const currentHandLabel = step === 'tap-1' ? firstHand : secondHand;
    const testDone = countdown === 0 && hasStarted && !isRunning;

    return (
        <div style={{ padding: '6rem 2rem 10rem', minHeight: 'calc(100vh - 70px)' }}>
            <header style={{ marginBottom: '4rem', textAlign: 'center' }}>
                <h2 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-heading)', letterSpacing: '-1.5px' }}>
                    Motor Velocity <span style={{ color: 'var(--primary)' }}>Assessment</span>
                </h2>
                <p style={{ color: 'var(--text-body)', maxWidth: '650px', margin: '0 auto', fontSize: '1.2rem', fontWeight: 500, lineHeight: 1.6 }}>
                    Measuring kinetic precision and lateral asymmetry to detect early signs of 
                    neurological demyelination within clinical reference ranges.
                </p>
            </header>

            <AnimatePresence mode="wait">
                {/* ========== STEP 1: Hand Selection ========== */}
                {step === 'select' && (
                    <motion.div key="select" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                        className="glass-card" style={{ padding: '5rem 3rem', textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
                        <div style={{ 
                            width: '80px', height: '80px', borderRadius: '50%', background: 'var(--primary-muted)', 
                            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2.5rem',
                            boxShadow: '0 10px 25px rgba(0, 193, 167, 0.1)'
                        }}>
                            <Hand size={40} color="var(--primary)" />
                        </div>
                        <h3 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-heading)', marginBottom: '1rem' }}>Initiation Protocol</h3>
                        <p style={{ color: 'var(--text-body)', marginBottom: '3.5rem', fontSize: '1.1rem', fontWeight: 500, maxWidth: '500px', margin: '0 auto 3.5rem' }}>
                            Sequentially evaluating both limbs. Select your initial testing hand to begin the diagnostic sequence.
                        </p>
                        <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center' }}>
                            <button className="btn-primary" onClick={() => handleHandSelect('dominant')}
                                style={{ padding: '1.25rem 3rem', fontSize: '1.1rem', fontWeight: 750 }}>
                                Dominant Hand
                            </button>
                            <button className="btn-primary" onClick={() => handleHandSelect('non-dominant')}
                                style={{ padding: '1.25rem 3rem', fontSize: '1.1rem', fontWeight: 750 }}>
                                Non-Dominant Hand
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* ========== STEP 2: Tapping Test (both hands) ========== */}
                {(step === 'tap-1' || step === 'tap-2') && (
                    <motion.div key={step} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                        style={{ maxWidth: '800px', margin: '0 auto' }}>
                        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                            <span style={{
                                padding: '0.6rem 1.5rem',
                                background: 'var(--bg-3)',
                                border: '1px solid var(--glass-border)',
                                borderRadius: '14px',
                                color: 'var(--primary)',
                                fontSize: '0.9rem',
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                            }}>
                                {step === 'tap-1' ? 'Phase 01' : 'Phase 02'} — {currentHandLabel} hand
                            </span>
                        </div>

                        <div className="glass-card" style={{ padding: '5rem 3rem', textAlign: 'center' }}>
                            {/* Timer Display */}
                            <div style={{ marginBottom: '3rem' }}>
                                <div style={{
                                    fontSize: '6.5rem',
                                    fontWeight: 900,
                                    color: countdown <= 3 && isRunning ? '#ef4444' : 'var(--text-heading)',
                                    lineHeight: 1,
                                    transition: 'color 0.3s',
                                    letterSpacing: '-4px'
                                }}>
                                    {countdown}<span style={{ fontSize: '2rem', letterSpacing: '0' }}>s</span>
                                </div>
                                <span style={{ color: 'var(--text-body)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 700, marginTop: '0.5rem', display: 'block' }}>
                                    Tapping Interval
                                </span>
                            </div>

                            {/* Tap Count Badge */}
                            <div style={{ marginBottom: '4rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{ 
                                    padding: '0.75rem 2rem', background: 'var(--bg-3)', borderRadius: '16px', border: '1px solid var(--glass-border)',
                                    display: 'flex', alignItems: 'center', gap: '1rem'
                                }}>
                                    <Activity size={20} color="var(--primary)" />
                                    <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-heading)' }}>{tapCount}</div>
                                    <span style={{ color: 'var(--text-body)', fontSize: '0.9rem', fontWeight: 600 }}>Total Taps</span>
                                </div>
                            </div>

                            {/* Instructions / Tap Button */}
                            {!testDone ? (
                                <div style={{ position: 'relative' }}>
                                    {!hasStarted && (
                                        <p style={{ color: 'var(--text-body)', marginBottom: '3rem', fontSize: '1.1rem', fontWeight: 500, maxWidth: '400px', margin: '0 auto 3rem' }}>
                                            Initiate tapping on the interface or use the <strong style={{ color: 'var(--text-heading)' }}>Spacebar</strong> at maximum velocity.
                                        </p>
                                    )}
                                    <button
                                        onClick={handleTap}
                                        onMouseDown={() => setIsPressed(true)}
                                        onMouseUp={() => setIsPressed(false)}
                                        onMouseLeave={() => setIsPressed(false)}
                                        style={{
                                            width: '240px',
                                            height: '240px',
                                            borderRadius: '50%',
                                            background: isRunning
                                                ? 'linear-gradient(135deg, var(--primary), #00e0ba)'
                                                : 'var(--bg-3)',
                                            border: isRunning ? 'none' : '4px dashed var(--glass-border)',
                                            color: isRunning ? 'white' : 'var(--text-body)',
                                            fontSize: '1.8rem',
                                            fontWeight: 900,
                                            cursor: 'pointer',
                                            transition: 'all 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                            userSelect: 'none',
                                            WebkitUserSelect: 'none',
                                            boxShadow: isRunning ? '0 20px 50px rgba(0, 201, 167, 0.3)' : 'none',
                                            transform: `scale(${isPressed ? 0.92 : 1})`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            margin: '0 auto'
                                        }}
                                    >
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                                            <Hand size={32} />
                                            {hasStarted ? 'TAP' : 'START'}
                                        </div>
                                    </button>
                                </div>
                            ) : (
                                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                                    <div style={{
                                        display: 'inline-flex', alignItems: 'center', gap: '1rem',
                                        padding: '1.25rem 2.5rem', borderRadius: '20px',
                                        background: '#ecfdf5', color: '#059669',
                                        fontSize: '1.4rem', fontWeight: 800, marginBottom: '3rem',
                                        border: '1px solid #10b98120'
                                    }}>
                                        <CheckCircle size={28} />
                                        Interval Complete
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                                        {step === 'tap-1' ? (
                                            <button className="btn-primary" onClick={proceedToSecondHand}
                                                style={{ padding: '1.25rem 3.5rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '1rem', fontWeight: 800 }}>
                                                Analyze {secondHand} hand <ArrowRight size={22} />
                                            </button>
                                        ) : (
                                            <button className="btn-primary" onClick={proceedToResults}
                                                style={{ padding: '1.25rem 3.5rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '1rem', fontWeight: 800 }}>
                                                Generate Results <ArrowRight size={22} />
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* ========== STEP 3: Results ========== */}
                {step === 'results' && (() => {
                    const m = getMetrics();
                    if (!m) return null;

                    const verdictColor = m.flagCount >= 2 ? '#ef4444' : m.flagCount === 1 ? '#f59e0b' : '#00C9A7';
                    const verdictIcon = m.flagCount >= 2 ? <AlertTriangle size={64} /> : m.flagCount === 1 ? <AlertTriangle size={64} /> : <CheckCircle size={64} />;

                    const metrics = [
                        {
                            label: 'Dominant Hand',
                            value: m.domTaps,
                            range: 'Ref: >45',
                            status: m.domFlagged ? 'Attention' : 'Optimal',
                            flagged: m.domFlagged,
                            icon: <Hand size={20} />
                        },
                        {
                            label: 'Non-Dominant',
                            value: m.nonDomTaps,
                            range: 'Ref: >40',
                            status: m.nonDomFlagged ? 'Attention' : 'Optimal',
                            flagged: m.nonDomFlagged,
                            icon: <Hand size={20} />
                        },
                        {
                            label: 'Lateral Ratio',
                            value: m.ratio.toFixed(2),
                            range: 'Limit: 1.70',
                            status: m.ratioFlagged ? 'Significant' : 'Normal',
                            flagged: m.ratioFlagged,
                            icon: <Activity size={20} />
                        }
                    ];

                    return (
                        <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                            style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', maxWidth: '950px', margin: '0 auto' }}>
                            
                            {/* Overall Verdict Banner */}
                            <div className="glass-card" style={{
                                borderTop: `12px solid ${verdictColor}`,
                                padding: '5rem 3rem', textAlign: 'center', position: 'relative'
                            }}>
                                <div style={{ 
                                    width: '120px', height: '120px', borderRadius: '50%',
                                    background: `${verdictColor}15`, color: verdictColor,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    margin: '0 auto 2.5rem', border: `2px solid ${verdictColor}25`
                                }}>
                                    {verdictIcon}
                                </div>
                                <h3 style={{ fontSize: '3.5rem', fontWeight: 900, color: 'var(--text-heading)', letterSpacing: '-2px' }}>
                                    {m.flagCount >= 2 ? 'Metric Deviation' : m.flagCount === 1 ? 'Borderline' : 'Clinical Normal'}
                                </h3>
                                <p style={{ color: 'var(--text-body)', marginTop: '1.5rem', fontSize: '1.25rem', fontWeight: 500, maxWidth: '750px', margin: '1.5rem auto 0', lineHeight: 1.8 }}>
                                    {m.flagCount >= 2
                                        ? 'Multiple motor kinetics deviate from established clinical baselines. A formal neurological evaluation for potential demyelination is recommended.'
                                        : m.flagCount === 1
                                            ? 'Minor kinetic variance detected in isolated hand trials. Retesting in a controlled environment is advised to establish stability.'
                                            : 'All kinetic motor metrics are within optimal clinical screening ranges for demyelination assessment.'}
                                </p>
                            </div>

                            {/* Metric Grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
                                {metrics.map((metric) => (
                                    <div key={metric.label} className="glass-card" style={{
                                        padding: '2.5rem 2rem', background: 'var(--bg-3)', textAlign: 'center',
                                        borderBottom: `6px solid ${metric.flagged ? '#ef4444' : '#00C9A7'}`
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                                            <div style={{ 
                                                padding: '0.6rem', borderRadius: '12px', background: metric.flagged ? '#fef2f2' : '#f0fdf4',
                                                color: metric.flagged ? '#ef4444' : '#00C9A7'
                                            }}>
                                                {metric.icon}
                                            </div>
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-body)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 800, marginBottom: '0.75rem' }}>
                                            {metric.label}
                                        </div>
                                        <div style={{ fontSize: '3.5rem', fontWeight: 900, color: 'var(--text-heading)', marginBottom: '1rem', letterSpacing: '-2px' }}>
                                            {metric.value}
                                        </div>
                                        <div style={{
                                            display: 'inline-flex', padding: '0.4rem 1rem', borderRadius: '10px',
                                            background: metric.flagged ? '#fee2e2' : '#dcfce7',
                                            color: metric.flagged ? '#b91c1c' : '#15803d',
                                            fontSize: '0.85rem', fontWeight: 800, marginBottom: '1rem'
                                        }}>
                                            {metric.status}
                                        </div>
                                        <div style={{ fontSize: '0.9rem', color: 'var(--text-body)', fontWeight: 600 }}>
                                            {metric.range}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Actions Footer */}
                            <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', marginTop: '1rem' }}>
                                <button className="btn-primary" onClick={() => navigate('/screening/ms/vision')}
                                    style={{ padding: '1.25rem 3rem', fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    Integrate Vision Test <ArrowRight size={22} />
                                </button>
                                <button onClick={restartAll}
                                    style={{
                                        background: 'var(--bg-3)', border: '1px solid var(--glass-border)', color: 'var(--text-heading)',
                                        padding: '1.25rem 2.5rem', borderRadius: '16px', fontSize: '1.1rem', fontWeight: 700,
                                        display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseOver={(e) => { e.currentTarget.style.background = 'var(--glass-bg)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                    onMouseOut={(e) => { e.currentTarget.style.background = 'var(--bg-3)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                                >
                                    <RotateCcw size={22} /> Repeat Diagnostic
                                </button>
                            </div>

                            <div style={{
                                marginTop: '3rem', padding: '3rem 2rem', borderTop: '1px solid var(--glass-border)', 
                                textAlign: 'center', color: 'var(--text-body)', fontSize: '0.9rem', fontStyle: 'italic', opacity: 0.7
                            }}>
                                <strong style={{ color: 'var(--text-heading)' }}>Clinical Note:</strong> Motor velocity assessments are sensitive to exhaustion and focus. 
                                Inconsistent results should be verified by multi-stage clinical demyelination screening protocol.
                            </div>
                        </motion.div>
                    );
                })()}
            </AnimatePresence>
        </div>
    );
};

export default FingerTappingTest;
