import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Waves, ArrowRight, ArrowLeft, CheckCircle, AlertTriangle, AlertCircle, ShieldCheck, Info, RotateCcw, FileText } from 'lucide-react';

const questions = [
    {
        id: 1,
        text: "Have you ever had a sudden unexplained loss of consciousness?",
        weight: 3,
        significance: "Sudden loss of consciousness is a primary indicator of generalized seizure activity."
    },
    {
        id: 2,
        text: "Have you ever experienced uncontrollable shaking or convulsions?",
        weight: 3,
        significance: "Involuntary motor convulsions are hallmark symptoms of tonic-clonic seizures."
    },
    {
        id: 3,
        text: "Have you ever woken up confused with no memory of what happened?",
        weight: 3,
        significance: "Post-ictal confusion and amnesia are classic indicators of nocturnal seizure episodes."
    },
    {
        id: 4,
        text: "Have you ever bitten your tongue during one of these episodes?",
        weight: 2,
        significance: "Tongue biting during episodes strongly correlates with seizure-related muscle contractions."
    },
    {
        id: 5,
        text: "Have you ever been incontinent during an episode?",
        weight: 2,
        significance: "Loss of bladder or bowel control during episodes is a common seizure-associated symptom."
    },
    {
        id: 6,
        text: "Do you experience sudden unexplained fear or intense déjà vu?",
        weight: 2,
        significance: "Sudden emotional surges and déjà vu are associated with temporal lobe seizure activity."
    },
    {
        id: 7,
        text: "Do you see flashing lights or strange smells before losing awareness?",
        weight: 2,
        significance: "Visual and olfactory auras are well-documented precursors to focal seizures."
    },
    {
        id: 8,
        text: "Do you experience extreme tiredness or confusion after these episodes?",
        weight: 2,
        significance: "Post-ictal fatigue and disorientation indicate significant neurological recovery periods."
    },
    {
        id: 9,
        text: "Do flashing lights or patterns trigger any unusual symptoms?",
        weight: 1,
        significance: "Photosensitivity is a known trigger for photosensitive epilepsy syndromes."
    },
    {
        id: 10,
        text: "Does sleep deprivation worsen any of these symptoms?",
        weight: 1,
        significance: "Sleep deprivation is a recognized trigger that lowers the seizure threshold."
    },
    {
        id: 11,
        text: "Has anyone in your family been diagnosed with epilepsy?",
        weight: 1,
        significance: "Genetic predisposition plays a significant role in many epilepsy syndromes."
    },
    {
        id: 12,
        text: "Have you ever been prescribed anti-epileptic medication?",
        weight: 2,
        significance: "Prior AED prescription indicates previous clinical suspicion of seizure disorder."
    }
];

const getRiskLevel = (score) => {
    if (score <= 3) return {
        level: 'Low Risk',
        color: 'var(--success)',
        colorHex: '#64FFDA',
        message: 'No significant epilepsy indicators detected.',
        recommendation: 'Your responses do not suggest significant epilepsy risk factors. Continue to monitor your health and consult a physician if new symptoms develop.',
        nextSteps: [
            'No immediate neurological referral required',
            'Maintain regular health check-ups',
            'Monitor for any new or recurring symptoms',
            'Maintain healthy sleep patterns and stress management'
        ]
    };
    if (score <= 8) return {
        level: 'Moderate Risk',
        color: 'var(--caution)',
        colorHex: '#FACC15',
        message: 'Some indicators present — further evaluation recommended.',
        recommendation: 'Your responses indicate some potential epilepsy-related symptoms. A professional evaluation is recommended to rule out or confirm any seizure-related conditions.',
        nextSteps: [
            'Schedule an appointment with a neurologist',
            'Consider an EEG (electroencephalogram) evaluation',
            'Keep a detailed symptom diary with dates and triggers',
            'Avoid known triggers like sleep deprivation and excessive alcohol',
            'Proceed with the reaction time test for additional screening data'
        ]
    };
    return {
        level: 'High Risk',
        color: 'var(--error)',
        colorHex: '#FF5252',
        message: 'Multiple epilepsy indicators detected — consult a neurologist urgently.',
        recommendation: 'Multiple significant epilepsy indicators have been identified. Urgent consultation with a neurologist is strongly advised for comprehensive diagnostic evaluation.',
        nextSteps: [
            'Seek urgent consultation with a neurologist',
            'Request an EEG and brain MRI imaging',
            'Do not drive or operate heavy machinery until cleared',
            'Avoid swimming alone or working at heights',
            'Keep a detailed log of all episodes for your neurologist',
            'Proceed with the reaction time test for additional screening data'
        ]
    };
};

const ScreeningEpilepsy = () => {
    const navigate = useNavigate();
    const [phase, setPhase] = useState('intro'); // intro | quiz | results
    const [currentQ, setCurrentQ] = useState(0);
    const [answers, setAnswers] = useState({});
    const [direction, setDirection] = useState(1);

    const totalScore = Object.entries(answers).reduce((sum, [qId, ans]) => {
        if (ans) {
            const q = questions.find(q => q.id === parseInt(qId));
            return sum + (q ? q.weight : 0);
        }
        return sum;
    }, 0);

    const risk = getRiskLevel(totalScore);
    const flaggedQuestions = questions.filter(q => answers[q.id] === true);

    const handleAnswer = (answer) => {
        const newAnswers = { ...answers, [questions[currentQ].id]: answer };
        setAnswers(newAnswers);

        if (currentQ < questions.length - 1) {
            setDirection(1);
            setTimeout(() => setCurrentQ(currentQ + 1), 350);
        } else {
            // Save quiz results for combined report
            const finalScore = Object.entries(newAnswers).reduce((sum, [qId, ans]) => {
                if (ans) {
                    const q = questions.find(q => q.id === parseInt(qId));
                    return sum + (q ? q.weight : 0);
                }
                return sum;
            }, 0);
            const finalFlags = questions.filter(q => newAnswers[q.id] === true);
            const finalRisk = getRiskLevel(finalScore);
            
            localStorage.setItem('neuroscreen_epilepsy_quiz', JSON.stringify({
                score: finalScore,
                risk: finalRisk.level,
                flaggedQuestions: finalFlags,
                completedAt: new Date().toISOString()
            }));

            setTimeout(() => setPhase('results'), 400);
        }
    };

    const handleBack = () => {
        if (currentQ > 0) {
            setDirection(-1);
            setCurrentQ(currentQ - 1);
        }
    };

    const handleRestart = () => {
        setPhase('intro');
        setCurrentQ(0);
        setAnswers({});
        setDirection(1);
    };

    const slideVariants = {
        enter: (dir) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit: (dir) => ({ x: dir > 0 ? -60 : 60, opacity: 0 })
    };

    // ─── INTRO PHASE ───
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
                        <Waves size={48} color="var(--primary)" />
                    </div>

                    <h2 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--text-heading)', letterSpacing: '-1.5px' }}>
                        Epilepsy <span style={{ color: 'var(--primary)' }}>Screening</span>
                    </h2>
                    <p style={{ color: 'var(--text-body)', fontSize: '1.2rem', maxWidth: '650px', margin: '0 auto 3.5rem', lineHeight: 1.8 }}>
                        This clinical questionnaire assesses your risk profile for epilepsy through a series of
                        12 targeted questions. Each question evaluates key indicators associated with seizure disorders.
                    </p>

                    <div className="glass-card" style={{
                        textAlign: 'left', padding: '3.5rem', marginBottom: '3.5rem',
                        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2.5rem'
                    }}>
                        {[
                            { label: 'Questions', value: '12', icon: <FileText size={20} color="var(--primary)" /> },
                            { label: 'Est. Duration', value: '2 min', icon: <RotateCcw size={20} color="var(--primary)" /> },
                            { label: 'Input Type', value: 'Yes / No', icon: <CheckCircle size={20} color="var(--primary)" /> }
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

                    <button
                        className="btn-primary"
                        onClick={() => setPhase('quiz')}
                        style={{
                            padding: '1.25rem 3.5rem', fontSize: '1.1rem',
                            display: 'inline-flex', alignItems: 'center', gap: '1rem', boxShadow: '0 15px 30px rgba(0, 201, 167, 0.2)'
                        }}
                    >
                        Begin Screening <ArrowRight size={22} />
                    </button>

                    <p style={{ color: 'var(--text-body)', fontSize: '0.95rem', marginTop: '3rem', fontStyle: 'italic', opacity: 0.7 }}>
                        This questionnaire is for clinical screening purposes only and does not constitute a definitive medical diagnosis.
                    </p>
                </motion.div>
            </div>
        );
    }

    // ─── QUIZ PHASE ───
    if (phase === 'quiz') {
        const progress = ((currentQ + 1) / questions.length) * 100;
        const q = questions[currentQ];

        return (
            <div style={{ padding: '6rem 2rem 10rem', minHeight: 'calc(100vh - 70px)' }}>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{ maxWidth: '800px', margin: '0 auto' }}
                >
                    {/* Progress Header */}
                    <div style={{ marginBottom: '4rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                            <span style={{ color: 'var(--text-heading)', fontWeight: '800', fontSize: '1.1rem', letterSpacing: '0.5px' }}>
                                QUESTION <span style={{ color: 'var(--primary)' }}>{currentQ + 1}</span> OF {questions.length}
                            </span>
                            <span style={{ color: 'var(--primary)', fontSize: '1rem', fontWeight: '800' }}>
                                {Math.round(progress)}%
                            </span>
                        </div>
                        <div style={{
                            width: '100%', height: '10px', background: 'var(--glass-bg)',
                            borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--glass-border)'
                        }}>
                            <motion.div
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.4, ease: 'easeOut' }}
                                style={{
                                    height: '100%', background: 'var(--primary)',
                                    borderRadius: '10px', boxShadow: '0 0 15px rgba(0, 201, 167, 0.2)'
                                }}
                            />
                        </div>
                    </div>

                    {/* Question Card */}
                    <div style={{ minHeight: '400px', position: 'relative' }}>
                        <AnimatePresence mode="wait" custom={direction}>
                            <motion.div
                                key={currentQ}
                                custom={direction}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                                style={{
                                    background: 'var(--glass-bg)',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: '32px',
                                    backdropFilter: 'blur(16px)',
                                    WebkitBackdropFilter: 'blur(16px)',
                                    padding: '5rem 4rem', textAlign: 'center',
                                    display: 'flex', flexDirection: 'column',
                                    alignItems: 'center', justifyContent: 'center',
                                    minHeight: '350px',
                                    boxShadow: '0 20px 50px rgba(0,0,0,0.06)'
                                }}
                            >
                                {/* Weight badge */}
                                <div style={{
                                    background: 'var(--primary-muted)',
                                    border: '1px solid rgba(0, 201, 167, 0.2)',
                                    borderRadius: '12px', padding: '0.5rem 1.25rem',
                                    fontSize: '0.85rem', color: 'var(--primary)',
                                    marginBottom: '3rem', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase'
                                }}>
                                    Impact Weight: {q.weight}
                                </div>

                                <h3 style={{
                                    fontSize: '2rem', lineHeight: '1.5', color: 'var(--text-heading)',
                                    maxWidth: '650px', fontWeight: '800', letterSpacing: '-0.5px'
                                }}>
                                    {q.text}
                                </h3>

                                {/* Yes / No Buttons */}
                                <div style={{ display: 'flex', gap: '2rem', marginTop: '4rem' }}>
                                    <button
                                        onClick={() => handleAnswer(true)}
                                        style={{
                                            padding: '1.25rem 4rem', borderRadius: '16px',
                                            background: 'var(--primary)',
                                            border: 'none', color: 'white',
                                            fontSize: '1.1rem', fontWeight: '700', cursor: 'pointer',
                                            boxShadow: '0 8px 20px rgba(0, 201, 167, 0.2)',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 25px rgba(0, 201, 167, 0.3)'; }}
                                        onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 201, 167, 0.2)'; }}
                                    >
                                        Yes
                                    </button>
                                    <button
                                        onClick={() => handleAnswer(false)}
                                        style={{
                                            padding: '1.25rem 4rem', borderRadius: '16px',
                                            background: 'var(--bg-3)',
                                            border: '1px solid var(--glass-border)', color: 'var(--text-heading)',
                                            fontSize: '1.1rem', fontWeight: '700', cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseOver={(e) => { e.currentTarget.style.background = 'var(--glass-bg)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                        onMouseOut={(e) => { e.currentTarget.style.background = 'var(--bg-3)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                                    >
                                        No
                                    </button>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Navigation */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2.5rem', padding: '0 1rem' }}>
                        <button
                            onClick={handleBack}
                            disabled={currentQ === 0}
                            style={{
                                background: 'var(--bg-3)', color: currentQ === 0 ? 'var(--slate)' : 'var(--text-body)',
                                border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '0.75rem 1.25rem',
                                display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem', fontWeight: 700,
                                cursor: currentQ === 0 ? 'not-allowed' : 'pointer', transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => { if(currentQ !== 0) e.currentTarget.style.background = 'var(--glass-bg)'; }}
                            onMouseOut={(e) => { e.currentTarget.style.background = 'var(--bg-3)'; }}
                        >
                            <ArrowLeft size={18} /> Previous
                        </button>

                        {/* Question dots */}
                        <div style={{ display: 'flex', gap: '8px' }}>
                            {questions.map((_, i) => (
                                <div
                                    key={i}
                                    style={{
                                        width: i === currentQ ? '32px' : '10px', height: '10px',
                                        borderRadius: '5px',
                                        background: answers[questions[i].id] !== undefined
                                            ? 'var(--primary)'
                                            : i === currentQ
                                                ? 'rgba(0, 201, 167, 0.4)'
                                                : 'var(--glass-border)',
                                        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                                    }}
                                />
                            ))}
                        </div>

                        <div style={{ width: '120px' }} /> {/* Spacer */}
                    </div>
                </motion.div>
            </div>
        );
    }

    // ─── RESULTS PHASE ───
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
                        {totalScore <= 3 ? <ShieldCheck size={48} color={risk.colorHex} /> :
                            totalScore <= 8 ? <AlertTriangle size={48} color={risk.colorHex} /> :
                                <AlertCircle size={48} color={risk.colorHex} />}
                    </div>

                    <h2 style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--text-heading)', marginBottom: '1rem', letterSpacing: '-1px' }}>
                        Clinical Risk: <span style={{ color: risk.color }}>{risk.level}</span>
                    </h2>
                    <p style={{ color: 'var(--text-body)', fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto', fontWeight: 500, lineHeight: 1.6 }}>
                        {risk.message}
                    </p>
                    <div style={{
                        background: 'var(--bg-3)', borderRadius: '16px', border: '1px solid var(--glass-border)',
                        padding: '0.75rem 2.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.03)'
                    }}>
                        <span style={{ color: 'var(--text-body)', fontWeight: 600 }}>Diagnostic Score</span>
                        <div style={{ width: '1px', height: '20px', background: 'var(--glass-border)' }} />
                        <span style={{ color: risk.color, fontWeight: '800', fontSize: '1.5rem' }}>{totalScore}</span>
                        <span style={{ color: '#94a3b8', fontSize: '1.1rem' }}>/ 24</span>
                    </div>
                </div>

                {/* Flagged Questions */}
                {flaggedQuestions.length > 0 && (
                    <div className="glass-card" style={{ padding: '3.5rem', marginBottom: '3rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
                            <div style={{ padding: '0.75rem', background: 'var(--primary-muted)', borderRadius: '12px' }}>
                                <Info size={24} color="var(--primary)" />
                            </div>
                            <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-heading)', margin: 0 }}>
                                CLINICAL OBSERVATIONS
                            </h4>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {flaggedQuestions.map((q) => (
                                <div key={q.id} style={{
                                    padding: '2rem', borderRadius: '24px',
                                    background: 'var(--bg-3)',
                                    border: '1px solid var(--glass-border)',
                                    transition: 'all 0.3s ease'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem' }}>
                                        <div style={{ marginTop: '5px', padding: '0.5rem', background: `${risk.colorHex}15`, borderRadius: '50%' }}>
                                            <AlertTriangle size={18} color={risk.colorHex} />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                                <p style={{ color: 'var(--text-heading)', fontSize: '1.15rem', fontWeight: '800', margin: 0, lineHeight: 1.4 }}>
                                                    {q.text}
                                                </p>
                                                <span style={{
                                                    background: `${risk.colorHex}10`, border: `1px solid ${risk.colorHex}20`,
                                                    borderRadius: '8px', padding: '0.4rem 0.8rem',
                                                    fontSize: '0.85rem', color: risk.color, fontWeight: '800', whiteSpace: 'nowrap'
                                                }}>
                                                    +{q.weight} PTS
                                                </span>
                                            </div>
                                            <p style={{ color: 'var(--text-body)', fontSize: '1rem', lineHeight: '1.7', margin: 0, opacity: 0.8 }}>
                                                <span style={{ fontWeight: 800, color: 'var(--text-heading)', opacity: 1 }}>Clinical Significance:</span> {q.significance}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Next Steps */}
                <div className="glass-card" style={{ padding: '3.5rem', marginBottom: '4rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                        <div style={{ padding: '0.75rem', background: 'var(--primary-muted)', borderRadius: '12px' }}>
                            <ArrowRight size={24} color="var(--primary)" />
                        </div>
                        <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-heading)', margin: 0 }}>
                            RECOMMENDED PROTOCOLS
                        </h4>
                    </div>
                    <p style={{ color: 'var(--text-body)', fontSize: '1.1rem', marginBottom: '2.5rem', lineHeight: '1.8', fontWeight: 500 }}>
                        {risk.recommendation}
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        {risk.nextSteps.map((step, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem', background: 'var(--bg-3)', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                                <div style={{
                                    width: '10px', height: '10px', borderRadius: '50%',
                                    background: risk.color, flexShrink: 0, boxShadow: `0 0 10px ${risk.color}40`
                                }} />
                                <span style={{ color: 'var(--text-heading)', fontSize: '1rem', fontWeight: 600 }}>{step}</span>
                            </div>
                        ))}
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
                        Back to Dashboard
                    </button>
                    <button
                        className="btn-primary"
                        onClick={() => navigate('/screening/epilepsy/reaction')}
                        style={{ flex: 1.5, padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', fontSize: '1.1rem', fontWeight: 700, boxShadow: '0 10px 30px rgba(0, 201, 167, 0.2)' }}
                    >
                        Continue to Reaction test <ArrowRight size={24} />
                    </button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <button
                        onClick={handleRestart}
                        style={{
                            padding: '1rem 2rem', borderRadius: '12px',
                            background: 'transparent', border: '1px solid var(--glass-border)',
                            color: 'var(--text-body)', display: 'flex', alignItems: 'center', gap: '0.75rem',
                            fontSize: '1rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.02)'; e.currentTarget.style.borderColor = 'var(--slate)'; }}
                        onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--glass-border)'; }}
                    >
                        <RotateCcw size={20} /> Retake Screening
                    </button>
                </div>

                {/* Disclaimer */}
                <div style={{
                    fontSize: '0.9rem', color: 'var(--text-body)',
                    fontStyle: 'italic', textAlign: 'center', lineHeight: '1.8',
                    padding: '3rem 2rem', borderTop: '1px solid var(--glass-border)', marginTop: '4rem', opacity: 0.7
                }}>
                    <strong style={{ color: 'var(--text-heading)' }}>Disclaimer:</strong> This screening tool is for informational purposes only and does not constitute a medical diagnosis.
                    Results should be interpreted by a qualified neurologist. If you are experiencing a medical emergency, please call your local emergency services immediately.
                </div>
            </motion.div>
        </div>
    );
};

export default ScreeningEpilepsy;
