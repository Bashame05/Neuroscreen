import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, CheckCircle, AlertCircle, RefreshCcw, Info, ArrowRight, FileImage, FileText, Activity } from 'lucide-react';
import ResultGauge from '../components/ResultGauge';
import { auth } from '../firebase';
import { saveScreeningResult } from '../utils/screeningService';

const ScreeningAlzheimers = () => {
    const navigate = useNavigate();
    const [selectedImage, setSelectedImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [hasSaved, setHasSaved] = useState(false);

    const saveInitiated = React.useRef(false);
    React.useEffect(() => {
        if (result && auth.currentUser && !hasSaved && !saveInitiated.current) {
            saveInitiated.current = true;
            saveScreeningResult(auth.currentUser.uid, {
                condition: "Alzheimer's Disease",
                result: result.result,
                confidence: result.confidence,
                details: {
                    result: result.result,
                    confidence: result.confidence,
                    allStages: result.all_stages
                }
            }).then(() => setHasSaved(true))
              .catch(err => {
                  console.error("Auto-save failed:", err);
                  saveInitiated.current = false; // Allow retry on failure
              });
        }
    }, [result, auth.currentUser, hasSaved]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(file);
            setPreviewUrl(URL.createObjectURL(file));
            setResult(null);
        }
    };

    const handleAnalyze = async () => {
        if (!selectedImage) return;

        setLoading(true);
        const formData = new FormData();
        formData.append('image', selectedImage);

        try {
            const response = await fetch('http://127.0.0.1:5000/predict-alzheimer', {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            setResult(data);
        } catch (error) {
            console.error("Analysis failed:", error);
            alert("Backend connection failed. Please ensure the Flask server is running and dependencies are installed.");
        } finally {
            setLoading(false);
        }
    };

    const getStageColor = (stage) => {
        const s = stage?.toLowerCase() || '';
        if (s.includes('healthy') || s.includes('normal')) return "var(--success)";
        if (s.includes('pre-clinical') || s.includes('very early')) return "var(--caution)";
        if (s.includes('early stage')) return "var(--warning)";
        if (s.includes('middle stage') || s.includes('moderate')) return "var(--error)";
        return "var(--slate-500)";
    };

    const resultColor = result ? getStageColor(result.result) : "var(--slate)";
    const isHealthy = result?.result?.toLowerCase().includes('healthy') || result?.result?.toLowerCase().includes('normal');

    return (
        <div style={{ padding: '6rem 2rem 10rem', minHeight: 'calc(100vh - 70px)' }}>
            <div className="container" style={{ maxWidth: '1200px' }}>
                <header style={{ marginBottom: '5rem', textAlign: 'center' }}>
                    <h2 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--text-heading)', letterSpacing: '-1.5px' }}>
                        Alzheimer's <span style={{ color: 'var(--primary)' }}>Classification</span>
                    </h2>
                    <p style={{ color: 'var(--text-body)', fontSize: '1.2rem', maxWidth: '750px', margin: '0 auto', lineHeight: 1.8 }}>
                        Upload a brain MRI or relevant neural imaging sample for stage-based cognitive assessment and neurodegenerative analysis.
                    </p>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: result ? '1fr 1.25fr' : '1fr 380px', gap: '4rem', alignItems: 'start', transition: 'all 0.5s ease' }}>
                    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4rem 3rem', minHeight: '450px' }}>
                        <div style={{ 
                            width: '100%', 
                            padding: '1.25rem 1.75rem', 
                            background: '#fff7ed', 
                            border: '1px solid #FED7AA', 
                            borderRadius: '16px', 
                            marginBottom: '2.5rem',
                            display: 'flex',
                            gap: '1rem',
                            alignItems: 'center',
                            textAlign: 'left'
                        }}>
                            <AlertCircle size={24} color="#f97316" style={{ flexShrink: 0 }} />
                            <p style={{ margin: 0, color: '#9a3412', fontSize: '0.9rem', fontWeight: 500, lineHeight: 1.5 }}>
                                <strong style={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>Clinical Notice:</strong> Please upload a valid brain MRI scan only. Uploading unrelated images will produce inaccurate results. NeuroScreen is not responsible for results generated from invalid inputs.
                            </p>
                        </div>

                        {!previewUrl ? (
                            <label style={{
                                width: '100%',
                                height: '350px',
                                border: '2px dashed #cbd5e1',
                                borderRadius: '24px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                gap: '1.5rem',
                                transition: 'all 0.3s ease',
                                background: 'white'
                            }}
                                onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.background = 'var(--primary-muted)'; }}
                                onMouseOut={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.background = 'white'; }}
                            >
                                <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '50%' }}>
                                    <FileImage size={56} color="var(--primary)" />
                                </div>
                                <span style={{ color: 'var(--text-heading)', fontWeight: 700, fontSize: '1.1rem' }}>Upload imaging sample</span>
                                <input type="file" hidden onChange={handleImageChange} accept="image/*" />
                            </label>
                        ) : (
                            <div style={{ position: 'relative', width: '100%', textAlign: 'center' }}>
                                <img src={previewUrl} alt="Preview" style={{ maxWidth: '100%', maxHeight: '350px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                                <button
                                    onClick={() => { setSelectedImage(null); setPreviewUrl(null); setResult(null); }}
                                    style={{ position: 'absolute', top: '-12px', right: '-12px', background: 'var(--error)', color: 'white', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', boxShadow: '0 4px 12px rgba(255, 82, 82, 0.3)' }}
                                >
                                    ×
                                </button>
                            </div>
                        )}

                        {!result && previewUrl && (
                            <div style={{ marginTop: '3rem', width: '100%', maxWidth: '450px' }}>
                                <button
                                    className="btn-primary"
                                    onClick={handleAnalyze}
                                    disabled={loading}
                                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', padding: '1.25rem' }}
                                >
                                    {loading ? <RefreshCcw className="animate-spin" size={24} /> : 'Run Clinical Analysis'}
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
                                borderTop: `6px solid ${resultColor}`,
                                padding: '4rem 3rem',
                                textAlign: 'center',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center'
                            }}>
                                <ResultGauge 
                                    percentage={result.confidence} 
                                    isLowRisk={isHealthy} 
                                    color={resultColor} 
                                />

                                <h3 style={{ fontSize: '2.8rem', fontWeight: 800, marginTop: '2rem', color: resultColor, letterSpacing: '-1px' }}>
                                    {result.result}
                                </h3>
                                <p style={{ color: 'var(--text-heading)', marginTop: '0.75rem', fontSize: '1.2rem', fontWeight: 600 }}>
                                    {isHealthy ? "No Significant Neurological Deviation" : "Neural Pattern Deviation Identified"}
                                </p>

                                <div style={{ marginTop: '3.5rem', textAlign: 'left', width: '100%', padding: '2.5rem', background: 'white', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                                    <div className="flex items-center" style={{ gap: '0.75rem', color: 'var(--text-heading)', marginBottom: '2rem' }}>
                                        <Info size={22} color="var(--primary)" />
                                        <span style={{ fontWeight: 800, fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Probability Breakdown</span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                                        {[
                                            "Cognitively Normal (Healthy)", 
                                            "Very Early Decline (Pre-Clinical)", 
                                            "Early Stage (Mild Cognitive Decline)", 
                                            "Middle Stage (Moderate Decline)"
                                        ].map((stage) => {
                                            // Get probability and ensure it is a valid number
                                            const probRaw = result.all_stages?.[stage] || 0;
                                            const prob = parseFloat(probRaw);
                                            const isSelected = stage === result.result;
                                            const hasValue = prob > 0;
                                            
                                            // Fallback hex colors mapped to new clinical categories
                                            const colorMap = {
                                                "Cognitively Normal (Healthy)": "#10B981",      // Success Green
                                                "Very Early Decline (Pre-Clinical)": "#FBBF24",  // Caution Yellow
                                                "Early Stage (Mild Cognitive Decline)": "#F59E0B", // Warning Orange
                                                "Middle Stage (Moderate Decline)": "#EF4444"     // Error Red
                                            };
                                            const stageColor = colorMap[stage] || "#64748B";
                                            
                                            return (
                                                <div key={stage} style={{ opacity: hasValue ? 1 : 0.4 }}>
                                                    <div className="flex justify-between" style={{ fontSize: '0.95rem', marginBottom: '10px', fontWeight: isSelected ? 800 : 600 }}>
                                                        <span style={{ color: isSelected ? 'var(--text-heading)' : 'var(--text-body)' }}>{stage}</span>
                                                        <span style={{ color: hasValue ? stageColor : 'var(--text-body)', fontWeight: 800 }}>{prob}%</span>
                                                    </div>
                                                    <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                                                        <div 
                                                            style={{
                                                                width: hasValue ? `${prob}%` : '0%',
                                                                height: '100%',
                                                                background: stageColor,
                                                                borderRadius: '4px',
                                                                transition: 'width 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                                                boxShadow: hasValue ? `0 0 10px ${stageColor}44` : 'none'
                                                            }} 
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div style={{ marginTop: '2.5rem', textAlign: 'left', width: '100%' }}>
                                    <h4 style={{ color: 'var(--text-heading)', marginBottom: '1.25rem', fontSize: '1.1rem', fontWeight: 800 }}>Clinical Recommendation</h4>
                                    <div style={{
                                        padding: '2rem',
                                        borderRadius: '20px',
                                        border: `2px solid ${resultColor}44`,
                                        background: `${resultColor}08`, 
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1.5rem'
                                    }}>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ color: resultColor, fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.4rem' }}>
                                                {isHealthy ? 'Routine Observation' : 'Specialized Neurology Review'}
                                            </p>
                                            <p style={{ fontSize: '0.95rem', color: 'var(--text-body)', lineHeight: 1.6 }}>
                                                {isHealthy ? 'The scan shows no immediate markers of cortical atrophy. Annual follow-up recommended.' : 'Analysis suggests structural patterns consistent with neurodegeneration. Schedule comprehensive diagnostic testing.'}
                                            </p>
                                        </div>
                                        <ArrowRight size={28} color={resultColor} />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '1.5rem', width: '100%', marginTop: '3.5rem' }}>
                                    <button
                                        className="btn-primary"
                                        onClick={() => navigate('/report', { state: { condition: 'alzheimers', result: result.result, confidence: result.confidence, allStages: result.all_stages } })}
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
                                        Reset
                                    </button>
                                </div>
                            </div>

                            <div style={{ fontSize: '0.9rem', color: 'var(--text-body)', fontStyle: 'italic', textAlign: 'center', opacity: 0.7, padding: '0 2rem' }}>
                                Disclaimer: This AI-powered stage classification is for informational purposes only. Results must be interpreted by a board-certified radiologist.
                            </div>
                        </motion.div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                            <div className="glass-card" style={{ padding: '3rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                                    <div style={{ padding: '0.75rem', background: 'var(--primary-muted)', borderRadius: '12px' }}>
                                        <CheckCircle size={24} color="var(--primary)" />
                                    </div>
                                    <h4 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-heading)' }}>Diagnostic Parameters</h4>
                                </div>
                                <p style={{ fontSize: '1.05rem', color: 'var(--text-body)', lineHeight: 1.8 }}>
                                    This model analyzes structural brain patterns to classify Alzheimer's progression into four clinical stages. Centered, high-resolution scans yield highest fidelity.
                                </p>
                            </div>

                            <div className="glass-card" style={{ padding: '3rem', background: 'linear-gradient(rgba(0, 201, 167, 0.05), transparent)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                                    <div style={{ padding: '0.75rem', background: 'white', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                                        <Activity size={24} color="var(--primary)" />
                                    </div>
                                    <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-heading)' }}>Neural Mapping</h4>
                                </div>
                                <p style={{ fontSize: '0.95rem', color: 'var(--text-body)', lineHeight: 1.7 }}>
                                    Stage detection is based on volumetric analysis of cortical structures and presence of hippocampal atrophy markers.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

};

export default ScreeningAlzheimers;
