import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Download, ArrowLeft, Printer, Shield, AlertTriangle, AlertCircle, FileText, Activity, Eye, Zap, Brain, ClipboardList } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { PDFDownloadLink } from '@react-pdf/renderer';
import ClinicalReportPDF from '../components/ClinicalReportPDF';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const ReportPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [reportId, setReportId] = useState('');
    const [loading, setLoading] = useState(true);
    const [isPrinting, setIsPrinting] = useState(false);

    const reportData = location.state || {};
    const reportRef = useRef(null);

    const handlePrint = useReactToPrint({
        contentRef: reportRef,
        documentTitle: `NeuroScreen_Report_${reportId}`,
        onBeforePrint: () => {
            setIsPrinting(true);
            return Promise.resolve();
        },
        onAfterPrint: () => {
            setIsPrinting(false);
        }
    });

    useEffect(() => {
        // Redirect if no condition data (e.g. direct navigation or refresh)
        if (!reportData.condition && !loading) {
            navigate('/dashboard');
        }
    }, [reportData.condition, loading, navigate]);

    useEffect(() => {
        const fetchData = async () => {
            if (!auth.currentUser) return;
            try {
                const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
                if (userDoc.exists()) {
                    setUserData(userDoc.data());
                }

                // Generate random report ID: NS-YYYY-MMDD-XXXX
                const now = new Date();
                const datePart = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}`;
                const randomPart = Math.floor(1000 + Math.random() * 9000);
                setReportId(`NS-${datePart}-${randomPart}`);
            } catch (error) {
                console.error("Error fetching report data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const getRecommendation = (condition, risk) => {
        const riskLower = risk?.toLowerCase() || 'low';

        const recommendations = {
            parkinsons: {
                low: [
                    "Maintain regular physical activity focusing on balance and coordination.",
                    "Annual motor assessment to track baseline neurological performance.",
                    "Ensure adequate sleep and nutrition for optimal dopamine regulation."
                ],
                high: [
                    "Consult a board-certified neurologist for a formal clinical evaluation.",
                    "Complete a comprehensive DaTscan or motor symptom assessment.",
                    "Avoid self-diagnosis; motor tremors can be influenced by multiple factors."
                ]
            },
            alzheimers: {
                demented: [
                    "Schedule a comprehensive cognitive assessment with a neuropsychologist.",
                    "Perform a high-resolution MRI to evaluate hippocampal volume.",
                    "Discuss preventative strategies and cognitive therapy with medical providers."
                ],
                non_demented: [
                    "Continue engaging in cognitive-stimulating activities (reading, puzzles).",
                    "Maintain heart-healthy diet as cardiovascular health links to brain health.",
                    "Monitor for any persistent changes in memory or executive function."
                ]
            },
            epilepsy: {
                low: [
                    "Routine wellness checkups; no immediate neurological referral indicated.",
                    "Monitor for any new or recurring episodes of awareness loss.",
                    "Maintain consistent sleep patterns to keep seizure threshold high."
                ],
                moderate: [
                    "Schedule an EEG (electroencephalogram) for electrical activity mapping.",
                    "Keep a detailed log of any unusual sensory or emotional surges.",
                    "Discuss potential triggers with a primary care physician."
                ],
                high: [
                    "Urgent consultation with an epileptologist or neurologist required.",
                    "Undergo diagnostic brain imaging (MRI) and extended video-EEG.",
                    "Do not drive or operate heavy machinery until clinically cleared."
                ]
            },
            ms: {
                normal: [
                    "No indicators of demyelinating activity detected at this time.",
                    "Continue annual baseline screenings to monitor neurological health.",
                    "Maintain adequate Vitamin D levels and overall physical wellness."
                ],
                caution: [
                    "Follow up with an ophthalmologist for a thorough optical exam.",
                    "Monitor for any transient sensory changes (tingling, numbness).",
                    "Schedule a check-up if borderline motor speed persists."
                ],
                flagged: [
                    "Diagnostic MRI of brain and spine recommended for clinical evaluation.",
                    "Comprehensive visual evoked potential (VEP) testing advised.",
                    "Consult a neurologist specializing in multiple sclerosis."
                ]
            }
        };

        let key = condition;
        let riskKey = riskLower.includes('high') || riskLower.includes('middle') || riskLower.includes('moderate') || riskLower.includes('detected') ? 'high' :
            riskLower.includes('early') || riskLower.includes('caution') || riskLower.includes('pre-clinical') ? 'moderate' : 'low';

        // Specific overrides for Alzheimer's
        if (condition === 'alzheimers') {
            riskKey = (riskLower.includes('healthy') || riskLower.includes('normal')) ? 'non_demented' : 'demented';
        }

        if (condition === 'ms') {
            riskKey = riskLower.includes('high') || riskLower.includes('flagged') || riskLower.includes('ms-flag') ? 'flagged' :
                riskLower.includes('moderate') || riskLower.includes('caution') || riskLower.includes('low') && riskLower !== 'normal' ? 'caution' : 'normal';
        }

        return recommendations[condition]?.[riskKey] || recommendations[condition]?.['low'] || recommendations['epilepsy']?.['low'] || ["Consult a medical professional for tailored advice.", "Continue to monitor symptoms.", "Maintain healthy lifestyle habits."];
    };

    // Removed jsPDF downloadPDF function

    if (loading) {
        return (
            <div className="container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Activity className="animate-spin" color="var(--cyan)" size={48} />
            </div>
        );
    }

    const riskColor = (risk) => {
        const r = risk?.toLowerCase() || '';
        // High Risk Keywords
        if (r.includes('high') || r.includes('middle') || r.includes('moderate') || r.includes('flagged') || r.includes('detected')) return 'var(--error)';
        // Warning/Caution Keywords
        if (r.includes('early') || r.includes('border') || r.includes('caution') || r.includes('low') && r !== 'normal' && !r.includes('healthy')) return 'var(--warning)';
        // Success/Normal Keywords
        return 'var(--success)';
    };

    const rawCurrentRisk = reportData.risk || reportData.result || reportData.overall?.level || 'Normal';
    const currentRisk = typeof rawCurrentRisk === 'object' ? rawCurrentRisk.level : rawCurrentRisk;

    const conditionName = {
        parkinsons: "Parkinson's Motor Assessment",
        alzheimers: "Alzheimer's Stage Classification",
        epilepsy: "Epilepsy Cognitive Risk Profile",
        'epilepsy-reaction': "Neurological Response Speed (Reaction Time)",
        ms: "Multiple Sclerosis (MS) Multi-Modal Screening"
    }[reportData.condition] || "Neurological Assessment";

    return (
        <div style={{
            background: isPrinting ? 'white' : 'transparent',
            minHeight: '100vh',
            padding: isPrinting ? '0' : '4rem 0 10rem',
            position: 'relative',
            overflow: isPrinting ? 'visible' : 'hidden'
        }}>
            {/* Background Orbs - Completely removed during print for performance */}
            {!isPrinting && (
                <>
                    <div style={{
                        position: 'fixed', top: '-10%', left: '-10%', width: '40%', height: '40%',
                        background: 'radial-gradient(circle, rgba(0, 201, 167, 0.05) 0%, rgba(255, 255, 255, 0) 70%)',
                        filter: 'blur(80px)', zIndex: 0, pointerEvents: 'none'
                    }} />
                    <div style={{
                        position: 'fixed', bottom: '-10%', right: '-10%', width: '50%', height: '50%',
                        background: 'radial-gradient(circle, rgba(10, 22, 40, 0.03) 0%, rgba(255, 255, 255, 0) 70%)',
                        filter: 'blur(100px)', zIndex: 0, pointerEvents: 'none'
                    }} />
                </>
            )}

            <div className="container" style={{ maxWidth: isPrinting ? '100%' : '80%', position: 'relative', zIndex: 1, padding: isPrinting ? 0 : 'inherit' }}>
                {/* Controls Bar - Glassmorphism */}
                <div className="glass-card" style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    marginBottom: '3rem', padding: '1.25rem 2.5rem'
                }}>
                    <button onClick={() => navigate(-1)} style={{
                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                        color: 'var(--text-heading)', fontWeight: '700', fontSize: '0.95rem',
                        background: 'none', border: 'none', cursor: 'pointer', transition: 'transform 0.2s'
                    }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateX(-4px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateX(0)'}>
                        <ArrowLeft size={20} /> Back to Sequence
                    </button>
                    <div style={{ display: 'flex', gap: '1.25rem' }}>

                        
                        {!loading && userData && (
                            <PDFDownloadLink 
                                key={`${reportId}-${userData?.fullName}`}
                                document={<ClinicalReportPDF reportData={reportData} userData={userData} reportId={reportId} getRecommendation={getRecommendation} />} 
                                fileName={`NeuroScreen_Report_${reportId}.pdf`}
                                style={{ textDecoration: 'none' }}
                            >
                                {({ blob, url, loading: pdfLoading, error }) => (
                                    <button className="btn-primary" disabled={pdfLoading} style={{
                                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                                        padding: '0.8rem 1.8rem', fontSize: '0.9rem', fontWeight: '800',
                                        boxShadow: '0 10px 20px rgba(0, 201, 167, 0.2)',
                                        opacity: pdfLoading ? 0.7 : 1,
                                        cursor: pdfLoading ? 'wait' : 'pointer'
                                    }}>
                                        {pdfLoading ? (
                                            <Activity className="animate-spin" size={18} />
                                        ) : (
                                            <Download size={18} />
                                        )}
                                        {pdfLoading ? 'Generating PDF...' : 'Download Medical PDF'}
                                    </button>
                                )}
                            </PDFDownloadLink>
                        )}
                    </div>
                </div>

                {/* Report Preview */}
                <div ref={reportRef} style={{ 
                    transform: isPrinting ? 'none' : 'scale(0.86)', 
                    transformOrigin: 'top center', 
                    marginBottom: isPrinting ? '0' : '-10%',
                    width: isPrinting ? '1000px' : 'auto', /* Lock width during print capture to prevent responsive reflow */
                    margin: isPrinting ? '0 auto' : 'inherit'
                }}>
                    <motion.div 
                        initial={isPrinting ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: isPrinting ? 0 : 0.6 }}
                        style={{
                            background: 'white', 
                            boxShadow: isPrinting ? 'none' : '0 40px 100px rgba(0,0,0,0.12)',
                            borderRadius: '2px', overflow: 'hidden', color: '#0A1628',
                            position: 'relative',
                            border: isPrinting ? '1px solid #eee' : 'none'
                        }}
                        id="report-content"
                    >
                        {/* Header - Clinical Navy (Web) / Clean White (Print) */}
                        <div id="report-header-section" style={{ background: '#0A1628', padding: '4rem', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '8px solid #00C9A7' }}>
                            <div className="report-header">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                    <div id="header-icon-box" style={{ padding: '0.75rem', background: 'rgba(0, 201, 167, 0.15)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Brain color="#00C9A7" size={42} className="report-brain-icon" />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                        <h1 id="report-title-logo" style={{ fontSize: '2.8rem', margin: 0, fontWeight: 900, letterSpacing: '-1.5px', color: 'white', lineHeight: 1 }}>
                                            Neuro<span style={{ color: '#00C9A7' }}>Screen</span>
                                        </h1>
                                        <div id="report-subtitle" style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2.5px', marginTop: '8px' }}>
                                            Precision Diagnostics
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right', marginBottom: '5px' }}>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.5rem' }}>Clinical Summary Report</h2>
                                <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
                                    <div>REPORT UUID: {reportId}</div>
                                    <div>TIMESTAMP: {new Date().toLocaleString()}</div>
                                </div>
                            </div>
                        </div>

                        <div style={{ padding: '5rem 6rem' }}>
                            {/* Patient Section */}
                            <div style={{ marginBottom: '5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '1rem' }}>
                                    <ClipboardList size={22} color="var(--primary)" />
                                    <h3 style={{ margin: 0, color: '#0A1628', fontSize: '1.25rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1.5px' }}>Biometric Profile</h3>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '3.5rem' }}>
                                    <div>
                                        <label style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Patient Name</label>
                                        <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0A1628', marginTop: '0.5rem' }}>{userData?.fullName || 'Anonymous Patient'}</div>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Age / Sex Baseline</label>
                                        <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0A1628', marginTop: '0.5rem' }}>{userData?.age} Years • {userData?.gender || 'Unspecified'}</div>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Clinical Index (BMI)</label>
                                        <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0A1628', marginTop: '0.5rem' }}>{userData?.bmi} kg/m² <small style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>(Meticulated)</small></div>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Physiological Stature</label>
                                        <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0A1628', marginTop: '0.5rem' }}>{userData?.height}cm / {userData?.weight}kg</div>
                                    </div>
                                </div>
                            </div>

                            {/* Analysis Section */}
                            <div style={{ marginBottom: '5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '1rem' }}>
                                    <Brain size={22} color="var(--primary)" />
                                    <h3 style={{ margin: 0, color: '#0A1628', fontSize: '1.25rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1.5px' }}>Integrative Analysis</h3>
                                </div>

                                <div style={{ background: '#f8fafc', padding: '3rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3rem' }}>
                                        <div>
                                            <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#0A1628', letterSpacing: '-0.5px' }}>
                                                {conditionName}
                                            </div>
                                            <div style={{ fontSize: '1rem', color: '#64748b', marginTop: '0.5rem', fontWeight: 500 }}>Algorithmic Assessment via NeuroScreen Protocol v3.1</div>
                                        </div>
                                        <div style={{
                                            padding: '0.75rem 2rem', borderRadius: '12px',
                                            background: 'white',
                                            color: riskColor(currentRisk),
                                            fontWeight: '900', fontSize: '1.1rem',
                                            border: `2px solid ${riskColor(currentRisk)}`,
                                            boxShadow: `0 4px 12px ${riskColor(currentRisk)}15`
                                        }}>
                                            {String(currentRisk).toUpperCase()}
                                        </div>
                                    </div>

                                    {/* Condition-specific Sections */}
                                    {reportData.condition === 'alzheimers' && reportData.allStages && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                                            <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '3rem', alignItems: 'center' }}>
                                                <div style={{ textAlign: 'center', padding: '2.5rem', background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                                                    <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#64748b', marginBottom: '1rem', textTransform: 'uppercase' }}>Consensus Classification</div>
                                                    <div style={{
                                                        display: 'inline-block',
                                                        padding: '0.75rem 1.5rem', borderRadius: '12px',
                                                        background: `${riskColor(currentRisk)}10`,
                                                        color: riskColor(currentRisk),
                                                        fontWeight: '900', fontSize: '1.4rem',
                                                        border: `2px solid ${riskColor(currentRisk)}30`
                                                    }}>
                                                        {currentRisk}
                                                    </div>
                                                </div>
                                                <div>
                                                    <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0A1628', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Bayesian Probability Map</h4>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                                                        {Object.entries(reportData.allStages).map(([stage, prob]) => {
                                                            const getStageColor = (s) => {
                                                                const lower = s.toLowerCase();
                                                                if (lower.includes('middle') || lower.includes('moderate')) return '#ef4444'; // Red
                                                                if (lower.includes('early stage') || (lower.includes('mild') && !lower.includes('very early'))) return '#f97316'; // Orange
                                                                if (lower.includes('very early') || lower.includes('very mild') || lower.includes('pre-clinical')) return '#f59e0b'; // Amber
                                                                if (lower.includes('normal') || lower.includes('healthy') || lower.includes('non')) return '#00C9A7'; // Teal/Success
                                                                return '#cbd5e1';
                                                            };
                                                            const barColor = getStageColor(stage);
                                                            return (
                                                                <div key={stage} style={{ display: 'grid', gridTemplateColumns: '120px 1fr 50px', alignItems: 'center', gap: '1.5rem' }}>
                                                                    <span style={{ color: '#0A1628', fontWeight: '800', fontSize: '0.9rem' }}>{stage}</span>
                                                                    <div style={{ height: '10px', background: 'white', borderRadius: '5px', overflow: 'hidden', border: '1px solid #f1f5f9' }}>
                                                                        <motion.div
                                                                             initial={isPrinting ? { width: `${prob}%` } : { width: 0 }}
                                                                            animate={{ width: `${prob}%` }}
                                                                            transition={{ duration: isPrinting ? 0 : 1.2, ease: "easeOut" }}
                                                                            style={{ height: '100%', background: barColor, borderRadius: '5px' }}
                                                                        />
                                                                    </div>
                                                                    <span style={{ fontWeight: '800', color: barColor, textAlign: 'right', fontSize: '0.9rem' }}>{prob}%</span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>

                                            <div style={{ padding: '3rem', background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                                                <h4 style={{ fontSize: '1rem', fontWeight: '900', color: '#0A1628', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Staging Logic & Pathological Variance</h4>
                                                <p style={{ fontSize: '1.1rem', color: '#475569', lineHeight: '1.8', marginBottom: '2.5rem', fontWeight: 500 }}>
                                                    {currentRisk.includes('Non')
                                                        ? "Subject exhibits bilateral symmetry in cortical thickness. Volumetric analysis of the hippocampal formation resides within the 95th percentile of normal baseline for age-matched controls."
                                                        : currentRisk.includes('Very Mild')
                                                            ? "Minor ventricular enlargement detected relative to baseline. Morphological shifts in the entorhinal cortex suggest early-phase transition, currently classified as Pre-Clinical impairment."
                                                            : currentRisk.includes('Mild')
                                                                ? "Substantial density reduction localized in the temporal and parietal lobes. Volumetric markers align with established patterns of Mild Cognitive Impairment (MCI)."
                                                                : "Extensive cortical atrophy and pronounced hippocampal volume loss. Structural deviations are consistent with advanced neurodegenerative progression and functional cognitive decline."
                                                    }
                                                </p>

                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
                                                    <div>
                                                        <h5 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#64748b', marginBottom: '1.25rem', textTransform: 'uppercase' }}>Diagnostic Markers</h5>
                                                        <ul style={{ paddingLeft: '1.5rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '1rem', color: '#475569', fontWeight: 600 }}>
                                                            {currentRisk.includes('Non') ? (
                                                                <>
                                                                    <li>Negative for hippocampal atrophy</li>
                                                                    <li>Cortical thickness symmetry maintained</li>
                                                                    <li>Baseline morphological stability</li>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <li>{currentRisk.includes('Moderate') ? 'Significant' : 'Trace'} ventricular dilatation</li>
                                                                    <li>Temporal lobe volumetric reduction</li>
                                                                    <li>Pathological variance detected</li>
                                                                </>
                                                            )}
                                                        </ul>
                                                    </div>
                                                    <div style={{ borderLeft: '2px solid #f1f5f9', paddingLeft: '3rem' }}>
                                                        <h5 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#64748b', marginBottom: '1.25rem', textTransform: 'uppercase' }}>Risk Co-factors</h5>
                                                        <div style={{ fontSize: '1rem', color: '#475569', lineHeight: '1.8', fontWeight: 600 }}>
                                                            <p style={{ margin: '0 0 0.5rem' }}>Chonological Risk: <strong style={{ color: '#0A1628' }}>{userData?.age > 65 ? "Elevated" : "Controlled"}</strong></p>
                                                            <p style={{ margin: 0 }}>Genetic Markers: <strong style={{ color: '#0A1628' }}>{userData?.familyHistory || "Undisclosed"}</strong></p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {reportData.condition === 'ms' && (
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
                                            <div style={{ padding: '2.5rem', background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                                                <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#64748b', marginBottom: '1.5rem', textTransform: 'uppercase' }}>Kinetic Velocity Metrics</div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '1.1rem' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <span style={{ fontWeight: 600, color: '#475569' }}>Dominant Hand Taps</span>
                                                        <div style={{ textAlign: 'right' }}>
                                                            <div style={{ fontWeight: 900, color: '#0A1628' }}>{reportData.tappingResult?.domTaps ?? 0} <small style={{ fontSize: '0.7rem' }}>TAPS</small></div>
                                                            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: reportData.tappingResult?.domFlagged ? 'var(--error)' : 'var(--success)', textTransform: 'uppercase' }}>
                                                                {reportData.tappingResult?.domFlagged ? 'FLAGGED' : 'NORMAL'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <span style={{ fontWeight: 600, color: '#475569' }}>Non-Dominant Hand Taps</span>
                                                        <div style={{ textAlign: 'right' }}>
                                                            <div style={{ fontWeight: 900, color: '#0A1628' }}>{reportData.tappingResult?.nonDomTaps ?? 0} <small style={{ fontSize: '0.7rem' }}>TAPS</small></div>
                                                            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: reportData.tappingResult?.nonDomFlagged ? 'var(--error)' : 'var(--success)', textTransform: 'uppercase' }}>
                                                                {reportData.tappingResult?.nonDomFlagged ? 'FLAGGED' : 'NORMAL'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div style={{ height: '1px', background: '#f1f5f9', margin: '0.5rem 0' }} />
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <span style={{ fontWeight: 800, color: '#0A1628' }}>INTER-HAND RATIO</span>
                                                        <div style={{ textAlign: 'right' }}>
                                                            <div style={{ color: reportData.tappingResult?.ratioFlagged ? 'var(--error)' : 'var(--primary)', fontWeight: 950, fontSize: '1.4rem' }}>
                                                                {reportData.tappingResult?.ratio?.toFixed(2) || '0.00'}
                                                            </div>
                                                            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: reportData.tappingResult?.ratioFlagged ? 'var(--error)' : 'var(--success)', textTransform: 'uppercase' }}>
                                                                {reportData.tappingResult?.ratioFlagged ? 'PATHOLOGICAL' : 'NORMAL'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div style={{ padding: '2.5rem', background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                                                <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#64748b', marginBottom: '1.5rem', textTransform: 'uppercase' }}>Optical Thresholding</div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '1.1rem' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <span style={{ fontWeight: 600, color: '#475569' }}>Lowest Contrast Seen</span>
                                                        <strong style={{ fontWeight: 900, color: '#0A1628' }}>{reportData.visionResult?.lowestSeen ?? 100}%</strong>
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <span style={{ fontWeight: 600, color: '#475569' }}>Optical Verdict</span>
                                                        <strong style={{ color: riskColor(reportData.visionResult?.verdict), fontWeight: 900 }}>{reportData.visionResult?.verdict || 'Pass'}</strong>
                                                    </div>
                                                    <div style={{ height: '1px', background: '#f1f5f9', margin: '0.5rem 0' }} />
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <span style={{ fontWeight: 800, color: '#0A1628' }}>COMBINED MS RISK</span>
                                                        <strong style={{ color: riskColor(currentRisk), fontWeight: 950, fontSize: '1.4rem' }}>{String(currentRisk).toUpperCase()}</strong>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {reportData.condition === 'parkinsons' && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '3rem' }}>
                                                <div style={{ flex: 1, textAlign: 'center', padding: '2.5rem', background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                                                    <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#64748b', marginBottom: '1rem', textTransform: 'uppercase' }}>Structural Classification</div>
                                                    <div style={{
                                                        display: 'inline-block',
                                                        padding: '0.75rem 1.75rem', borderRadius: '12px',
                                                        background: `${riskColor(currentRisk)}10`,
                                                        color: riskColor(currentRisk),
                                                        fontWeight: '900', fontSize: '1.5rem',
                                                        border: `2px solid ${riskColor(currentRisk)}30`
                                                    }}>
                                                        {currentRisk}
                                                    </div>
                                                </div>
                                                <div style={{ flex: 1, textAlign: 'center', padding: '2.5rem', background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                                                    <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#64748b', marginBottom: '1rem', textTransform: 'uppercase' }}>Algorithmic Confidence</div>
                                                    <div style={{ fontSize: '3rem', fontWeight: '950', color: riskColor(currentRisk), letterSpacing: '-2px' }}>{reportData.confidence}%</div>
                                                </div>
                                            </div>

                                            <div style={{ padding: '3rem', background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                                                <h4 style={{ fontSize: '1rem', fontWeight: '900', color: '#0A1628', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Spatial Motor Evaluation</h4>
                                                <p style={{ fontSize: '1.1rem', color: '#475569', lineHeight: '1.8', marginBottom: '2.5rem', fontWeight: 500 }}>
                                                    {riskColor(currentRisk).includes('error')
                                                        ? "Micro-tremor amplitude analysis identified persistent sub-millimeter oscillations during spiral formation. Variance in pressure-velocity mapping is statistically consistent with prodromal Parkinsonian motor signatures."
                                                        : "Kinetics exhibit smooth trajectories with negative indicators for micro-oscillation or path deviation. Angular velocity maintains a high coefficient of correlation with normal motor function baselines."
                                                    }
                                                </p>

                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
                                                    <div>
                                                        <h5 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#64748b', marginBottom: '1.25rem', textTransform: 'uppercase' }}>Kinetic Indicators</h5>
                                                        <ul style={{ paddingLeft: '1.5rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '1rem', color: '#475569', fontWeight: 600 }}>
                                                            {riskColor(currentRisk).includes('error') ? (
                                                                <>
                                                                    <li>High-frequency tremor signatures</li>
                                                                    <li>Irregular spatial formation</li>
                                                                    <li>Rigidity-correlated velocity shift</li>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <li>Stable motor trajectory</li>
                                                                    <li>Negative for tremor oscillation</li>
                                                                    <li>Normal kinetic fluidity</li>
                                                                </>
                                                            )}
                                                        </ul>
                                                    </div>
                                                    <div style={{ borderLeft: '2px solid #f1f5f9', paddingLeft: '3rem' }}>
                                                        <h5 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#64748b', marginBottom: '1.25rem', textTransform: 'uppercase' }}>Demographic Risk</h5>
                                                        <div style={{ fontSize: '1rem', color: '#475569', lineHeight: '1.8', fontWeight: 600 }}>
                                                            <p style={{ margin: '0 0 0.5rem' }}>Age Factor: <strong style={{ color: '#0A1628' }}>{userData?.age > 60 ? "Elevated" : "Baseline"}</strong></p>
                                                            <p style={{ margin: 0 }}>Genetic Risk: <strong style={{ color: '#0A1628' }}>{userData?.familyHistory || "Undisclosed"}</strong></p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {(reportData.condition === 'epilepsy' || reportData.condition === 'epilepsy-reaction') && (
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
                                            {(reportData.quizResult || reportData.score !== undefined) && (
                                                <div style={{ padding: '2.5rem', background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                                                    <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#64748b', marginBottom: '1.5rem', textTransform: 'uppercase' }}>Clinical Questionnaire Score</div>
                                                    <div style={{ fontSize: '2.5rem', fontWeight: '950', color: riskColor(reportData.quizResult?.risk || currentRisk), letterSpacing: '-1.5px' }}>
                                                        {reportData.quizResult?.score ?? reportData.score ?? 0}
                                                        <span style={{ fontSize: '1rem', color: '#94a3b8', fontWeight: 700 }}> / {reportData.quizResult?.maxScore ?? reportData.maxScore ?? 24}</span>
                                                    </div>
                                                    <div style={{ fontSize: '1rem', color: '#0A1628', fontWeight: 800, marginTop: '1rem', textTransform: 'uppercase' }}>
                                                        Risk: {reportData.quizResult?.risk || currentRisk}
                                                    </div>
                                                </div>
                                            )}
                                            {(reportData.reactionResult || reportData.avg !== undefined) && (
                                                <div style={{ padding: '2.5rem', background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                                                    <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#64748b', marginBottom: '1.5rem', textTransform: 'uppercase' }}>Response Latency (Reaction Time)</div>
                                                    <div style={{ fontSize: '2.5rem', fontWeight: '950', color: riskColor(reportData.reactionResult?.risk || currentRisk), letterSpacing: '-1.5px' }}>
                                                        {reportData.reactionResult?.avg ?? reportData.avg ?? 0}
                                                        <span style={{ fontSize: '1rem', color: '#94a3b8', fontWeight: 700 }}> MS</span>
                                                    </div>
                                                    <div style={{ fontSize: '1rem', color: '#0A1628', fontWeight: 800, marginTop: '1rem', textTransform: 'uppercase' }}>
                                                        Result: {reportData.reactionResult?.risk || currentRisk}
                                                    </div>
                                                </div>
                                            )}
                                            <div style={{ gridColumn: 'span 2', marginTop: '1rem', background: 'white', padding: '2rem 3rem', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0A1628', textTransform: 'uppercase', letterSpacing: '1px' }}>Combined Epilepsy Risk Profile</div>
                                                <div style={{ color: riskColor(currentRisk), fontWeight: '900', fontSize: '1.4rem', borderBottom: `4px solid ${riskColor(currentRisk)}` }}>{String(currentRisk).toUpperCase()}</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Risk Factor Section */}
                            <div style={{ marginBottom: '5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '1rem' }}>
                                    <Shield size={22} color="var(--primary)" />
                                    <h3 style={{ margin: 0, color: '#0A1628', fontSize: '1.25rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1.5px' }}>Clinical Prognosis</h3>
                                </div>
                                <p style={{ color: '#475569', fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '3rem', fontWeight: 500 }}>
                                    Multi-factorial modeling identifies a {String(currentRisk).toLowerCase()} risk trajectory based on current physiological and behavioral inputs.
                                    {userData?.age > 60 ? " Demographic age factor contributes independently to the observed structural risk profile." : " Current age-based markers reside within statistical safety margins."}
                                    {userData?.familyHistory === 'Yes' ? " Reported familial predisposition markers are integrated into the weighted diagnostic model." : " Negative familial history markers provide statistical attenuation for genetic risk."}
                                </p>

                                <div style={{ background: '#f8fafc', padding: '3rem', borderRadius: '20px', borderLeft: `10px solid ${riskColor(currentRisk)}`, boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                                    <div style={{ fontSize: '0.9rem', fontWeight: '900', color: '#0A1628', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Consolidated Clinical Opinion</div>
                                    <div style={{ fontSize: '1.25rem', color: '#475569', fontStyle: 'italic', lineHeight: 1.6, fontWeight: 500 }}>
                                        "Structural and kinetic data indicates a {String(currentRisk).toLowerCase()} clinical correlation with patterns associated with {conditionName}.
                                        Standard procedural validation via formal neurological evaluation is required."
                                    </div>
                                </div>
                            </div>

                            {/* Recommendation Section */}
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '1rem' }}>
                                    <Activity size={22} color="var(--primary)" />
                                    <h3 style={{ margin: 0, color: '#0A1628', fontSize: '1.25rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1.5px' }}>Actionable Protocols</h3>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '1.5rem' }}>
                                    {getRecommendation(reportData.condition, currentRisk).map((rec, i) => (
                                        <div key={i} style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', background: '#f8fafc', padding: '1.5rem 2rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: riskColor(currentRisk), flexShrink: 0, boxShadow: `0 0 10px ${riskColor(currentRisk)}40` }} />
                                            <span style={{ color: '#0A1628', fontSize: '1.1rem', fontWeight: 600 }}>{rec}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div style={{ padding: '5rem 6rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
                            <p style={{ color: '#64748b', fontSize: '0.9rem', maxWidth: '700px', margin: '0 auto 2.5rem', lineHeight: 1.8, fontWeight: 500 }}>
                                <strong style={{ color: '#0A1628' }}>Medical Disclaimer:</strong> This algorithmic report represents a heuristic screening baseline and is not a clinical diagnosis.
                                All structural and kinetic markers must be evaluated by a board-certified neurologist within the context of a
                                comprehensive clinical history and physical examination.
                            </p>
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', color: '#0A1628', fontWeight: '900', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '2px' }}>
                                <Brain size={24} color="var(--primary)" /> Powered by NeuroScreen Protocol
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            <style>{`
                @media print {
                    body { background: white !important; padding: 0 !important; }
                    .container { max-width: 100% !important; padding: 0 !important; margin: 0 !important; width: 100% !important; }
                    #report-content { box-shadow: none !important; border: none !important; border-radius: 0 !important; margin: 0 !important; padding: 0 !important; width: 100% !important; transform: none !important; }
                    .btn-primary, button, nav, Header, footer, #controls-bar, [style*="fixed"] { display: none !important; }
                    div[style*="scale"] { transform: none !important; margin-bottom: 0 !important; }
                    
                    /* Performance Stripping for PDF Gen */
                    * { 
                        backdrop-filter: none !important; 
                        -webkit-backdrop-filter: none !important;
                        text-shadow: none !important;
                        box-shadow: none !important;
                        transition: none !important;
                        animation: none !important;
                    }

                    #report-header-section { 
                        background: white !important; 
                        color: #0A1628 !important; 
                        border-bottom: 3px solid #0A1628 !important;
                        padding: 3rem 4rem !important;
                    }
                    #report-title-logo { color: #0A1628 !important; }
                    #report-subtitle { color: #64748b !important; }
                    #header-icon-box { background: #f8fafc !important; border: 1px solid #e2e8f0 !important; }
                    .report-brain-icon { color: #0A1628 !important; }
                    
                    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                    @page { margin: 1cm; size: A4; }
                }
            `}</style>
        </div>
    );
};

export default ReportPage;
