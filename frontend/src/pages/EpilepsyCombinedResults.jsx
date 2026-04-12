import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, AlertCircle, Waves, Zap, RotateCcw, FileText, ArrowLeft } from 'lucide-react';
import { auth } from '../firebase';
import { saveScreeningResult } from '../utils/screeningService';

const EpilepsyCombinedResults = () => {
    const navigate = useNavigate();
    const [quizResult, setQuizResult] = useState(null);
    const [reactionResult, setReactionResult] = useState(null);
    const [hasSaved, setHasSaved] = useState(false);

    useEffect(() => {
        const quiz = localStorage.getItem('neuroscreen_epilepsy_quiz');
        const reaction = localStorage.getItem('neuroscreen_epilepsy_reaction');
        if (quiz) setQuizResult(JSON.parse(quiz));
        if (reaction) setReactionResult(JSON.parse(reaction));
    }, []);

    const getCombinedRisk = () => {
        if (!quizResult || !reactionResult) return null;

        const quizFlagged = quizResult.risk !== 'Low Risk';
        const reactionFlagged = reactionResult.risk !== 'Normal';

        if (quizFlagged && reactionFlagged) {
            return { 
                level: 'High Risk', 
                color: 'var(--error)', 
                bg: 'rgba(255,82,82,0.1)', 
                desc: 'Both the clinical questionnaire and reaction time test have flagged significant indicators. This combination strongly suggests an elevated risk of seizure-related cognitive or neurological dysfunction. Urgent neurological consultation is recommended.' 
            };
        }
        if (quizFlagged || reactionFlagged) {
            return { 
                level: 'Moderate Risk', 
                color: 'var(--warning)', 
                bg: 'rgba(251,146,60,0.1)', 
                desc: 'Abnormalities were detected in one of the screening tests. While not conclusive, these findings warrant further evaluation by a healthcare professional to rule out underlying neurological conditions.' 
            };
        }
        return { 
            level: 'Low Risk', 
            color: 'var(--success)', 
            bg: 'rgba(100,255,218,0.1)', 
            desc: 'All screening metrics across both tests are within normal reference ranges. No significant indicators of epilepsy or related cognitive delay were detected at this time.' 
        };
    };

    const overall = getCombinedRisk();
    const hasBothTests = quizResult && reactionResult;

    const saveInitiated = React.useRef(false);
    useEffect(() => {
        if (hasBothTests && auth.currentUser && !hasSaved && !saveInitiated.current) {
            saveInitiated.current = true;
            saveScreeningResult(auth.currentUser.uid, {
                condition: "Epilepsy",
                result: overall.level,
                confidence: null,
                details: {
                    quizResult: quizResult,
                    reactionResult: reactionResult,
                    combinedRisk: overall.level
                }
            }).then(() => setHasSaved(true))
              .catch(err => {
                  console.error("Auto-save failed:", err);
                  saveInitiated.current = false; // Allow retry on failure
              });
        }
    }, [hasBothTests, auth.currentUser, hasSaved, overall?.level]);

    return (
        <div style={{ padding: '6rem 2rem 10rem', minHeight: 'calc(100vh - 70px)' }}>
            <header style={{ marginBottom: '4rem', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
                    <button 
                        onClick={() => navigate('/dashboard')} 
                        style={{ 
                            background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px',
                            color: 'var(--text-body)', display: 'flex', alignItems: 'center', gap: '0.5rem', 
                            padding: '0.6rem 1.25rem', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.03)', transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'white'}
                    >
                        <ArrowLeft size={16} /> Back to Dashboard
                    </button>
                </div>
                <h2 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-heading)', letterSpacing: '-1.5px' }}>
                    Clinical <span style={{ color: 'var(--primary)' }}>Integrative Profile</span>
                </h2>
                <p style={{ color: 'var(--text-body)', maxWidth: '650px', margin: '0 auto', fontSize: '1.2rem', fontWeight: 500, lineHeight: 1.6 }}>
                    Comprehensive risk assessment integrating longitudinal clinical questionnaire data 
                    and neuromuscular reaction performance.
                </p>
            </header>

            {!hasBothTests ? (
                <div className="glass-card" style={{ padding: '5rem 3rem', textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
                    <div style={{ 
                        width: '80px', height: '80px', borderRadius: '50%', background: '#fffbeb', 
                        border: '1px solid #fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 2rem'
                    }}>
                        <AlertCircle size={40} color="#f59e0b" />
                    </div>
                    <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-heading)', marginBottom: '1.25rem' }}>Integrative Gap Detected</h3>
                    <p style={{ color: 'var(--text-body)', marginBottom: '3rem', fontSize: '1.1rem', lineHeight: 1.7, maxWidth: '500px', margin: '0 auto 3rem' }}>
                        To generate an integrative clinical profile, both the diagnostic questionnaire and 
                        neuromuscular assessment must be verified.
                    </p>
                    <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
                        {!quizResult && (
                            <button className="btn-primary" onClick={() => navigate('/screening/epilepsy')} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 2rem' }}>
                                <FileText size={20} /> Complete Questionnaire
                            </button>
                        )}
                        {!reactionResult && (
                            <button className="btn-primary" onClick={() => navigate('/screening/epilepsy/reaction')} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 2rem' }}>
                                <Zap size={20} /> Complete Reaction Test
                            </button>
                        )}
                    </div>
                </div>
            ) : (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', maxWidth: '900px', margin: '0 auto' }}>

                    {/* Overall Verdict */}
                    <div className="glass-card" style={{
                        borderTop: `10px solid ${overall.color}`,
                        padding: '5rem 3rem', textAlign: 'center',
                        position: 'relative', overflow: 'hidden'
                    }}>
                        <div style={{ 
                            width: '100px', height: '100px', borderRadius: '50%',
                            background: `${overall.color}15`, border: `2px solid ${overall.color}30`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 2.5rem', boxShadow: `0 10px 30px ${overall.color}20`
                        }}>
                            {overall.level === 'Low Risk'
                                ? <Shield size={56} color={overall.color} />
                                : <AlertTriangle size={56} color={overall.color} />
                            }
                        </div>
                        <h3 style={{ fontSize: '3.5rem', fontWeight: 900, color: 'var(--text-heading)', letterSpacing: '-2px' }}>
                            Overall: <span style={{ color: overall.color }}>{overall.level}</span>
                        </h3>
                        <p style={{ color: 'var(--text-body)', marginTop: '1.5rem', fontSize: '1.25rem', maxWidth: '700px', margin: '1.5rem auto 0', lineHeight: '1.8', fontWeight: 500 }}>
                            {overall.desc}
                        </p>
                    </div>

                    {/* Individual Test Summary Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                        {/* Questionnaire Card */}
                        <div className="glass-card" style={{
                            padding: '3rem', background: 'white',
                            borderLeft: `8px solid ${quizResult.risk === 'Low Risk' ? '#00C9A7' : (quizResult.risk === 'Moderate Risk' ? '#f59e0b' : '#ef4444')}`
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                                <div style={{ padding: '0.5rem', background: 'var(--primary-muted)', borderRadius: '10px' }}>
                                    <Waves size={22} color="var(--primary)" />
                                </div>
                                <span style={{ fontSize: '0.9rem', color: 'var(--text-heading)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 800 }}>
                                    Clinical Diagnostic
                                </span>
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <div style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--text-heading)', letterSpacing: '-0.5px' }}>
                                    {quizResult.risk}
                                </div>
                                <div style={{ fontSize: '1.1rem', color: 'var(--text-body)', marginTop: '0.5rem', fontWeight: 600 }}>
                                    Score: <span style={{ color: 'var(--text-heading)', fontWeight: 800 }}>{quizResult.score}</span> / 24
                                </div>
                            </div>
                            <div style={{ fontSize: '0.95rem', color: 'var(--text-body)', background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '10px', fontWeight: 500 }}>
                                <span style={{ color: '#ef4444', fontWeight: 800 }}>{quizResult.flaggedQuestions?.length || 0}</span> risk indicators detected.
                            </div>
                        </div>

                        {/* Reaction Time Card */}
                        <div className="glass-card" style={{
                            padding: '3rem', background: 'white',
                            borderLeft: `8px solid ${reactionResult.risk === 'Normal' ? '#00C9A7' : (reactionResult.risk === 'Borderline' ? '#f59e0b' : '#ef4444')}`
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                                <div style={{ padding: '0.5rem', background: 'var(--primary-muted)', borderRadius: '10px' }}>
                                    <Zap size={22} color="var(--primary)" />
                                </div>
                                <span style={{ fontSize: '0.9rem', color: 'var(--text-heading)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 800 }}>
                                    Motor Velocity
                                </span>
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <div style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--text-heading)', letterSpacing: '-0.5px' }}>
                                    {reactionResult.risk}
                                </div>
                                <div style={{ fontSize: '1.1rem', color: 'var(--text-body)', marginTop: '0.5rem', fontWeight: 600 }}>
                                    Trial Average: <span style={{ color: 'var(--text-heading)', fontWeight: 800 }}>{reactionResult.avg}</span>ms
                                </div>
                            </div>
                            <div style={{ fontSize: '0.95rem', color: 'var(--text-body)', background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '10px', fontWeight: 500 }}>
                                Variance: <span style={{ color: 'var(--text-heading)', fontWeight: 700 }}>{reactionResult.fastest}ms</span> – <span style={{ color: 'var(--text-heading)', fontWeight: 700 }}>{reactionResult.slowest}ms</span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', marginTop: '2rem' }}>
                        <button
                            className="btn-primary"
                            onClick={() => navigate('/report', { 
                                state: { 
                                    condition: 'epilepsy', 
                                    overall, 
                                    quizResult, 
                                    reactionResult 
                                } 
                            })}
                            style={{ padding: '1.25rem 3rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '1rem', fontWeight: 700, boxShadow: '0 10px 30px rgba(0, 201, 167, 0.2)' }}
                        >
                            <FileText size={24} /> Generate Clinical Report
                        </button>
                        <button
                            onClick={() => {
                                localStorage.removeItem('neuroscreen_epilepsy_quiz');
                                localStorage.removeItem('neuroscreen_epilepsy_reaction');
                                setHasSaved(false);
                                navigate('/screening/epilepsy');
                            }}
                            style={{
                                background: 'white', border: '1px solid #e2e8f0',
                                color: 'var(--text-heading)', padding: '1.25rem 2.5rem', borderRadius: '16px',
                                display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '1.1rem', fontWeight: 700,
                                boxShadow: '0 4px 15px rgba(0,0,0,0.03)', transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                            onMouseOut={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.transform = 'translateY(0)'; }}
                        >
                            <RotateCcw size={22} /> Retake Assessment
                        </button>
                    </div>

                    <div style={{
                        marginTop: '4rem', padding: '3rem 2rem', borderTop: '1px solid #e2e8f0', 
                        textAlign: 'center', color: 'var(--text-body)', fontSize: '0.9rem', fontStyle: 'italic', opacity: 0.7
                    }}>
                        <strong style={{ color: 'var(--text-heading)' }}>Clinical Disclaimer:</strong> The integrative risk profile is an automated heuristic and must be validated 
                        by a certified neurologist. Clinical decisions should be based on comprehensive medical examinations.
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default EpilepsyCombinedResults;
