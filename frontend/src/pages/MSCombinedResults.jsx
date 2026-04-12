import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, CheckCircle, Activity, Eye, RotateCcw, FileText } from 'lucide-react';
import { auth } from '../firebase';
import { saveScreeningResult } from '../utils/screeningService';

const MSCombinedResults = () => {
    const navigate = useNavigate();
    const [tappingResult, setTappingResult] = useState(null);
    const [visionResult, setVisionResult] = useState(null);
    const [hasSaved, setHasSaved] = useState(false);

    useEffect(() => {
        const tapping = localStorage.getItem('neuroscreen_ms_tapping');
        const vision = localStorage.getItem('neuroscreen_ms_vision');
        if (tapping) setTappingResult(JSON.parse(tapping));
        if (vision) setVisionResult(JSON.parse(vision));
    }, []);

    const getOverallRisk = () => {
        if (!tappingResult || !visionResult) return { level: 'Incomplete', color: 'var(--slate)', desc: 'Please complete both tests.' };

        const tappingFlagged = tappingResult.flagCount >= 2;
        const visionFlagged = visionResult.flag === 'severe' || visionResult.flag === 'ms-flag';

        if (tappingFlagged && visionFlagged) {
            return { 
                level: 'MS Flag Detected', 
                color: 'var(--error)', 
                bg: 'rgba(255,82,82,0.1)', 
                desc: 'Both motor and visual screening tests have flagged significant abnormalities. This combination is highly suggestive of a demyelinating condition. Urgent neurological consultation is strongly recommended.' 
            };
        }
        if (tappingFlagged || visionFlagged) {
            return { 
                level: 'Borderline', 
                color: 'var(--warning)', 
                bg: 'rgba(251,146,60,0.1)', 
                desc: 'One of the screening tests detected abnormalities. While not definitive, these findings warrant further investigation with a neurologist to evaluate potential neurological dysfunction.' 
            };
        }
        return { 
            level: 'Low Risk', 
            color: 'var(--success)', 
            bg: 'rgba(100,255,218,0.1)', 
            desc: 'All screening metrics are within normal reference ranges. No indicators of MS-related motor or visual dysfunction were detected.' 
        };
    };

    const overall = getOverallRisk();
    const hasBothTests = tappingResult && visionResult;

    const saveInitiated = React.useRef(false);
    useEffect(() => {
        if (hasBothTests && auth.currentUser && !hasSaved && !saveInitiated.current) {
            saveInitiated.current = true;
            saveScreeningResult(auth.currentUser.uid, {
                condition: "Multiple Sclerosis",
                result: overall.level,
                confidence: null,
                details: {
                    tappingResult: tappingResult,
                    visionResult: visionResult,
                    combinedRisk: overall.level
                }
            }).then(() => setHasSaved(true))
              .catch(err => {
                  console.error("Auto-save failed:", err);
                  saveInitiated.current = false; // Allow retry on failure
              });
        }
    }, [hasBothTests, auth.currentUser, hasSaved, overall.level]);

    return (
        <div style={{ padding: '6rem 2rem 10rem', minHeight: 'calc(100vh - 70px)' }}>
            <header style={{ marginBottom: '4rem', textAlign: 'center' }}>
                <h2 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-heading)', letterSpacing: '-1.5px' }}>
                    Integrative <span style={{ color: 'var(--primary)' }}>MS Profile</span>
                </h2>
                <p style={{ color: 'var(--text-body)', maxWidth: '650px', margin: '0 auto', fontSize: '1.2rem', fontWeight: 500, lineHeight: 1.6 }}>
                    Correlation of motor velocity and contrast sensitivity thresholding to establish 
                    a comprehensive neurological risk profile.
                </p>
            </header>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', maxWidth: '900px', margin: '0 auto' }}>

                {/* Overall Verdict */}
                <div className="glass-card" style={{
                    borderTop: `12px solid ${overall.color}`,
                    padding: '5rem 3rem', textAlign: 'center', position: 'relative'
                }}>
                    <div style={{ 
                        width: '100px', height: '100px', borderRadius: '50%',
                        background: `${overall.color}15`, border: `2px solid ${overall.color}25`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 2.5rem', boxShadow: `0 10px 30px ${overall.color}15`
                    }}>
                        {overall.level === 'Low Risk'
                            ? <Shield size={56} color={overall.color} />
                            : <AlertTriangle size={56} color={overall.color} />
                        }
                    </div>
                    <h3 style={{ fontSize: '3.5rem', fontWeight: 900, color: 'var(--text-heading)', letterSpacing: '-2px' }}>
                        {overall.level}
                    </h3>
                    <p style={{ color: 'var(--text-body)', marginTop: '1.5rem', fontSize: '1.25rem', fontWeight: 500, maxWidth: '700px', margin: '1.5rem auto 0', lineHeight: 1.8 }}>
                        {overall.desc}
                    </p>
                </div>

                {/* Individual Test Summary Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    {/* Tapping Test Card */}
                    <div className="glass-card" style={{
                        padding: '3rem', background: 'white',
                        borderLeft: `8px solid ${tappingResult ? (tappingResult.flagCount >= 2 ? '#ef4444' : tappingResult.flagCount === 1 ? '#f59e0b' : '#00C9A7') : '#cbd5e1'}`
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                            <div style={{ padding: '0.6rem', background: 'var(--primary-muted)', borderRadius: '12px' }}>
                                <Activity size={22} color="var(--primary)" />
                            </div>
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-heading)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 800 }}>
                                Motor Kinetics
                            </span>
                        </div>
                        {tappingResult ? (
                            <>
                                <div style={{
                                    display: 'inline-block', padding: '0.5rem 1.25rem', borderRadius: '12px',
                                    background: tappingResult.flagCount >= 2 ? '#fef2f2' : tappingResult.flagCount === 1 ? '#fffbeb' : '#f0fdf4',
                                    color: tappingResult.flagCount >= 2 ? '#dc2626' : tappingResult.flagCount === 1 ? '#b45309' : '#15803d',
                                    fontSize: '0.95rem', fontWeight: 800, marginBottom: '2rem'
                                }}>
                                    {tappingResult.flagCount >= 2 ? 'Metric Deviation' : tappingResult.flagCount === 1 ? 'Borderline' : 'Clinical Normal'}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ color: 'var(--text-body)', fontWeight: 600 }}>Dominant</span>
                                        <span style={{ color: tappingResult.domFlagged ? '#ef4444' : 'var(--text-heading)', fontWeight: 800, fontSize: '1.1rem' }}>
                                            {tappingResult.domTaps} <small style={{ fontSize: '0.7rem', fontWeight: 600, opacity: 0.6 }}>TAPS</small>
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ color: 'var(--text-body)', fontWeight: 600 }}>Non-Dominant</span>
                                        <span style={{ color: tappingResult.nonDomFlagged ? '#ef4444' : 'var(--text-heading)', fontWeight: 800, fontSize: '1.1rem' }}>
                                            {tappingResult.nonDomTaps} <small style={{ fontSize: '0.7rem', fontWeight: 600, opacity: 0.6 }}>TAPS</small>
                                        </span>
                                    </div>
                                    <div style={{ height: '1px', background: '#e2e8f0', margin: '0.5rem 0' }} />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ color: 'var(--text-body)', fontWeight: 600 }}>Lateral Ratio</span>
                                        <span style={{ color: tappingResult.ratioFlagged ? '#ef4444' : 'var(--primary)', fontWeight: 900, fontSize: '1.2rem' }}>
                                            {tappingResult.ratio.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div style={{ padding: '2rem', textAlign: 'center', background: '#f8fafc', borderRadius: '16px', color: 'var(--text-body)', fontStyle: 'italic', fontWeight: 500 }}>
                                Kinetic data not acquired
                            </div>
                        )}
                    </div>

                    {/* Vision Test Card */}
                    <div className="glass-card" style={{
                        padding: '3rem', background: 'white',
                        borderLeft: `8px solid ${visionResult ? (visionResult.flag === 'normal' ? '#00C9A7' : visionResult.flag === 'mild' ? '#f59e0b' : '#ef4444') : '#cbd5e1'}`
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                            <div style={{ padding: '0.6rem', background: 'var(--primary-muted)', borderRadius: '12px' }}>
                                <Eye size={22} color="var(--primary)" />
                            </div>
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-heading)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 800 }}>
                                Contrast Resolving
                            </span>
                        </div>
                        {visionResult ? (
                            <>
                                <div style={{
                                    display: 'inline-block', padding: '0.5rem 1.25rem', borderRadius: '12px',
                                    background: visionResult.flag === 'normal' ? '#f0fdf4' : visionResult.flag === 'mild' ? '#fffbeb' : '#fef2f2',
                                    color: visionResult.flag === 'normal' ? '#15803d' : visionResult.flag === 'mild' ? '#b45309' : '#dc2626',
                                    fontSize: '0.95rem', fontWeight: 800, marginBottom: '2rem'
                                }}>
                                    {visionResult.verdict}
                                </div>
                                <div style={{ marginTop: '1rem' }}>
                                    <div style={{ color: 'var(--text-body)', fontWeight: 600, marginBottom: '0.5rem' }}>Terminal Threshold</div>
                                    <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-heading)', letterSpacing: '-1.5px' }}>
                                        {visionResult.lowestSeen !== null ? `${visionResult.lowestSeen}%` : '0%'} 
                                        <span style={{ fontSize: '1rem', color: 'var(--text-body)', marginLeft: '0.5rem', fontWeight: 700 }}>CONTRAST</span>
                                    </div>
                                    <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--text-body)', lineHeight: 1.6, fontWeight: 500 }}>
                                        Final resolving power relative to Pelli-Robson clinical baseline.
                                    </p>
                                </div>
                            </>
                        ) : (
                            <div style={{ padding: '2rem', textAlign: 'center', background: '#f8fafc', borderRadius: '16px', color: 'var(--text-body)', fontStyle: 'italic', fontWeight: 500 }}>
                                Optical data not acquired
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', marginTop: '2rem' }}>
                    <button
                        className="btn-primary"
                        onClick={() => navigate('/report', { state: { condition: 'ms', overall, tappingResult, visionResult } })}
                        disabled={!hasBothTests}
                        style={{ padding: '1.25rem 3.5rem', fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '1rem', opacity: hasBothTests ? 1 : 0.5, cursor: hasBothTests ? 'pointer' : 'not-allowed', boxShadow: '0 10px 30px rgba(0, 201, 167, 0.2)' }}
                    >
                        <FileText size={24} /> Generate Integrative Report
                    </button>
                    <button 
                        onClick={() => navigate('/dashboard')}
                        style={{ 
                            background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px',
                            color: 'var(--text-heading)', padding: '1.25rem 2.5rem', fontSize: '1.1rem', fontWeight: 700,
                            boxShadow: '0 4px 15px rgba(0,0,0,0.03)', transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                        onMouseOut={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.transform = 'translateY(0)'; }}
                    >
                        Dashboard
                    </button>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
                    <button onClick={() => {
                        localStorage.removeItem('neuroscreen_ms_tapping');
                        localStorage.removeItem('neuroscreen_ms_vision');
                        setHasSaved(false);
                        navigate('/screening/ms/tapping');
                    }}
                        style={{
                            background: 'none', color: 'var(--text-body)',
                            border: 'none', textDecoration: 'underline',
                            fontSize: '1rem', fontWeight: 600,
                            display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', opacity: 0.7
                        }}
                        onMouseOver={(e) => e.currentTarget.style.opacity = 1}
                        onMouseOut={(e) => e.currentTarget.style.opacity = 0.7}
                    >
                        <RotateCcw size={18} /> Restart Diagnostic Sequence
                    </button>
                </div>

                <div style={{
                    marginTop: '4rem', padding: '3rem 2rem', borderTop: '1px solid #e2e8f0', 
                    textAlign: 'center', color: 'var(--text-body)', fontSize: '0.9rem', fontStyle: 'italic', opacity: 0.7
                }}>
                    <strong style={{ color: 'var(--text-heading)' }}>Diagnostic Disclaimer:</strong> Multiple Sclerosis screening represents a heuristic correlation 
                    of clinical symptoms and must be corroborated by high-resolution MRI and lumbar puncture administered by a neurologist.
                </div>
            </motion.div>
        </div>
    );
};

export default MSCombinedResults;
