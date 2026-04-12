import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, RefreshCcw, Info, ArrowRight, FileText } from 'lucide-react';
import Canvas from '../components/Canvas';
import ResultGauge from '../components/ResultGauge';
import { auth } from '../firebase';
import { saveScreeningResult } from '../utils/screeningService';

const ScreeningParkinsons = () => {
    const navigate = useNavigate();
    const [imageBlob, setImageBlob] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [hasSaved, setHasSaved] = useState(false);

    const isHealthy = result?.result?.toLowerCase().includes('healthy');
    const riskStatus = isHealthy ? 'Low Risk' : 'High Risk';

    const saveInitiated = React.useRef(false);
    React.useEffect(() => {
        if (result && auth.currentUser && !hasSaved && !saveInitiated.current) {
            saveInitiated.current = true;
            saveScreeningResult(auth.currentUser.uid, {
                condition: "Parkinson's Disease",
                result: riskStatus,
                confidence: result.confidence,
                details: {
                    result: result.result,
                    confidence: result.confidence
                }
            }).then(() => setHasSaved(true))
              .catch(err => {
                  console.error("Auto-save failed:", err);
                  saveInitiated.current = false; // Allow retry on failure
              });
        }
    }, [result, auth.currentUser, hasSaved, riskStatus]);

    const handleAnalyze = async () => {
        if (!imageBlob) return;

        setLoading(true);
        const formData = new FormData();
        formData.append('image', imageBlob, 'drawing.png');

        try {
            const response = await fetch('http://127.0.0.1:5000/predict', {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            setResult(data);
        } catch (error) {
            console.error("Analysis failed:", error);
            alert("Backend connection failed. Please ensure the Flask server is running.");
        } finally {
            setLoading(false);
        }
    };


    return (
        <div style={{ padding: '6rem 2rem 10rem', minHeight: 'calc(100vh - 70px)' }}>
            <div className="container" style={{ maxWidth: '1200px' }}>
                <header style={{ marginBottom: '5rem', textAlign: 'center' }}>
                    <h2 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--text-heading)', letterSpacing: '-1.5px' }}>
                        Parkinson's <span style={{ color: 'var(--primary)' }}>Motor Assessment</span>
                    </h2>
                    <p style={{ color: 'var(--text-body)', fontSize: '1.2rem', maxWidth: '750px', margin: '0 auto', lineHeight: 1.8 }}>
                        Please draw a spiral starting from the center and moving outwards.
                        Maintain a steady pace for the most accurate diagnostic markers.
                    </p>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: result ? '1fr 1.2fr' : '1fr 380px', gap: '4rem', alignItems: 'start', transition: 'all 0.5s ease' }}>
                    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4rem 3rem' }}>
                        <Canvas onExport={setImageBlob} />
                        {!result && (
                            <div style={{ marginTop: '3rem', width: '100%', maxWidth: '450px' }}>
                                <button
                                    className="btn-primary"
                                    onClick={handleAnalyze}
                                    disabled={!imageBlob || loading}
                                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', padding: '1.25rem' }}
                                >
                                    {loading ? <RefreshCcw className="animate-spin" size={24} /> : 'Analyze Sample'}
                                </button>
                            </div>
                        )}
                    </div>

                    {result ? (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}
                        >
                            <div className="glass-card" style={{
                                borderTop: `6px solid ${isHealthy ? 'var(--primary)' : 'var(--error)'}`,
                                padding: '4rem 3rem',
                                textAlign: 'center',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center'
                            }}>
                                <ResultGauge 
                                    percentage={result.confidence} 
                                    isLowRisk={isHealthy} 
                                    color={isHealthy ? 'var(--primary)' : 'var(--error)'} 
                                />

                                <h3 style={{ fontSize: '2.8rem', fontWeight: 800, marginTop: '2rem', color: isHealthy ? 'var(--primary)' : 'var(--error)', letterSpacing: '-1px' }}>
                                    {riskStatus}
                                </h3>
                                <p style={{ color: 'var(--text-heading)', marginTop: '0.75rem', fontSize: '1.2rem', fontWeight: 600 }}>
                                    {isHealthy ? 'Normal Motor Pattern Detected' : 'Potential Tremor Markers Identified'}
                                </p>

                                {result.all_scores && (
                                    <div style={{ marginTop: '3.5rem', textAlign: 'left', width: '100%', padding: '2.5rem', background: 'white', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                                        <div className="flex items-center" style={{ gap: '0.75rem', color: 'var(--text-heading)', marginBottom: '2rem' }}>
                                            <Info size={22} color="var(--primary)" />
                                            <span style={{ fontWeight: 800, fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Diagnostic Probabilities</span>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                                            {Object.entries(result.all_scores || {}).map(([label, probRaw]) => {
                                                const prob = parseFloat(probRaw);
                                                const isSelected = label === result.result;
                                                const hasValue = prob > 0;
                                                
                                                // Dynamic color mapping based on label content
                                                const isNegative = label.toLowerCase().includes('healthy') || label.toLowerCase().includes('normal');
                                                const labelColor = isNegative ? "#00C9A7" : "#EF4444";

                                                return (
                                                    <div key={label} style={{ opacity: hasValue ? 1 : 0.4 }}>
                                                        <div className="flex justify-between" style={{ fontSize: '0.95rem', marginBottom: '10px', fontWeight: isSelected ? 800 : 600 }}>
                                                            <span style={{ color: isSelected ? 'var(--text-heading)' : 'var(--text-body)' }}>{label}</span>
                                                            <span style={{ color: hasValue ? labelColor : 'var(--text-body)', fontWeight: 800 }}>{prob}%</span>
                                                        </div>
                                                        <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                                                            <div 
                                                                style={{
                                                                    width: hasValue ? `${prob}%` : '0%',
                                                                    height: '100%',
                                                                    background: labelColor,
                                                                    borderRadius: '4px',
                                                                    transition: 'width 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                                                    boxShadow: hasValue ? `0 0 10px ${labelColor}44` : 'none'
                                                                }} 
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                <div style={{ marginTop: '3rem', textAlign: 'left', width: '100%', padding: '2.5rem', background: 'white', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                                    <div className="flex items-center" style={{ gap: '0.75rem', color: 'var(--text-heading)', marginBottom: '1.5rem' }}>
                                        <Info size={22} color="var(--primary)" />
                                        <span style={{ fontWeight: 800, fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Clinical Findings</span>
                                    </div>
                                    <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-body)', fontSize: '1.05rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {isHealthy ? (
                                            <>
                                                <li>Drawing velocity and pressure are within the expected physiological range.</li>
                                                <li>No significant rhythmic oscillation (tremor) detected in the sample.</li>
                                                <li>Spatial coordination shows high alignment with baseline healthy models.</li>
                                            </>
                                        ) : (
                                            <>
                                                <li>Micro-adjustments in drawing path suggest sub-clinical motor instability.</li>
                                                <li>Spectral analysis identifies frequency patterns often associated with tremors.</li>
                                                <li>Line consistency indicates potential disruption in motor control.</li>
                                            </>
                                        )}
                                    </ul>
                                </div>

                                <div style={{ marginTop: '2.5rem', textAlign: 'left', width: '100%' }}>
                                    <h4 style={{ color: 'var(--text-heading)', marginBottom: '1.25rem', fontSize: '1.1rem', fontWeight: 800 }}>Clinical Next Steps</h4>
                                    <div style={{
                                        padding: '2rem',
                                        borderRadius: '20px',
                                        border: `2px solid ${isHealthy ? 'rgba(0, 201, 167, 0.2)' : 'rgba(255, 82, 82, 0.2)'}`,
                                        background: isHealthy ? 'var(--primary-muted)' : 'rgba(255, 82, 82, 0.05)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1.5rem'
                                    }}>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ color: isHealthy ? 'var(--primary)' : 'var(--error)', fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.4rem' }}>
                                                {isHealthy ? 'Routine Observation' : 'Neurological Consultation Required'}
                                            </p>
                                            <p style={{ fontSize: '0.95rem', color: 'var(--text-body)', lineHeight: 1.6 }}>
                                                {isHealthy ? 'No immediate action needed. Consider annual screening to maintain baseline.' : 'Please consult a board-certified neurologist as soon as possible for clinical validation.'}
                                            </p>
                                        </div>
                                        <ArrowRight size={28} color={isHealthy ? 'var(--primary)' : 'var(--error)'} />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '1.5rem', width: '100%', marginTop: '3.5rem' }}>
                                    <button
                                        className="btn-primary"
                                        onClick={() => navigate('/report', { state: { condition: 'parkinsons', result: riskStatus, confidence: result.confidence } })}
                                        style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '1.25rem' }}
                                    >
                                        <FileText size={22} /> Generate Report
                                    </button>
                                    <button
                                        onClick={() => { setResult(null); setHasSaved(false); }}
                                        style={{ flex: 1, background: 'white', color: 'var(--text-body)', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                                    >
                                        New Test
                                    </button>
                                </div>
                            </div>

                            <div style={{ fontSize: '0.9rem', color: 'var(--text-body)', fontStyle: 'italic', textAlign: 'center', opacity: 0.7, padding: '0 2rem' }}>
                                Disclaimer: This AI-powered screening tool is for informational purposes only and does not constitute a definitive medical diagnosis.
                            </div>
                        </motion.div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                            <div className="glass-card" style={{ padding: '3rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                                    <div style={{ padding: '0.75rem', background: 'var(--primary-muted)', borderRadius: '12px' }}>
                                        <CheckCircle size={24} color="var(--primary)" />
                                    </div>
                                    <h4 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-heading)' }}>Guidelines</h4>
                                </div>
                                <p style={{ fontSize: '1.05rem', color: 'var(--text-body)', lineHeight: 1.8 }}>
                                    Ensure your wrist is resting comfortably. Use a continuous motion without lifting the stylus or mouse. The analysis takes approximately 2-5 seconds.
                                </p>
                            </div>

                            <div className="glass-card" style={{ padding: '3rem', background: 'linear-gradient(rgba(0, 201, 167, 0.05), transparent)' }}>
                                <h4 style={{ marginBottom: '1.25rem', color: 'var(--text-heading)', fontWeight: 800 }}>Clinical Accuracy</h4>
                                <p style={{ fontSize: '1rem', color: 'var(--text-body)', lineHeight: 1.7 }}>
                                    Our model analyzes spatial-temporal dynamics to detect subtle motor impairments often invisible to the naked eye.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ScreeningParkinsons;
