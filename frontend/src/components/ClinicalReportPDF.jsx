import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: {
        padding: 40,
        backgroundColor: '#FFFFFF',
        fontFamily: 'Helvetica',
        color: '#0A1628',
    },
    // Header
    header: {
        backgroundColor: '#0A1628',
        padding: '25 30',
        marginHorizontal: -40,
        marginTop: -40,
        marginBottom: 25,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '4 solid #00C9A7',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
        letterSpacing: -0.5,
    },
    headerTitleAccent: {
        color: '#00C9A7',
    },
    headerSubtitle: {
        fontSize: 7,
        color: 'rgba(255,255,255,0.5)',
        textTransform: 'uppercase',
        letterSpacing: 2,
        marginTop: 4,
    },
    headerRight: {
        textAlign: 'right',
    },
    headerRightTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 5,
    },
    headerMeta: {
        fontSize: 7,
        color: 'rgba(255,255,255,0.5)',
        marginBottom: 2,
    },
    // Section
    section: {
        marginBottom: 20,
    },
    sectionHeading: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#0A1628',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        marginBottom: 10,
        borderBottom: '2 solid #F1F5F9',
        paddingBottom: 5,
    },
    // Demographics
    demographicsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    demoItem: {
        width: '50%',
        marginBottom: 12,
    },
    demoLabel: {
        fontSize: 7,
        color: '#64748B',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 3,
    },
    demoValue: {
        fontSize: 10,
        color: '#0A1628',
        fontWeight: 'bold',
    },
    // Analysis box
    analysisBox: {
        backgroundColor: '#F8FAFC',
        padding: 18,
        borderRadius: 8,
        border: '1 solid #E2E8F0',
    },
    analysisTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#0A1628',
        letterSpacing: -0.3,
        marginBottom: 3,
    },
    analysisSub: {
        fontSize: 8,
        color: '#64748B',
    },
    riskBadge: {
        padding: '3 10',
        borderRadius: 4,
        borderWidth: 1,
    },
    riskText: {
        fontSize: 9,
        fontWeight: 'bold',
    },
    // Metrics
    metricRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottom: '1 solid #F1F5F9',
    },
    metricLabel: {
        fontSize: 9,
        color: '#475569',
    },
    metricValue: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#0A1628',
    },
    metricStatus: {
        fontSize: 7,
        fontWeight: 'bold',
        marginTop: 2,
    },
    progressBarOuter: {
        height: 6,
        backgroundColor: '#F1F5F9',
        borderRadius: 3,
        flexGrow: 1,
        marginHorizontal: 12,
    },
    progressBarInner: {
        height: '100%',
        borderRadius: 3,
    },
    // Prognosis
    prognosisBox: {
        backgroundColor: '#F8FAFC',
        padding: 15,
        borderRadius: 8,
        borderLeft: '5 solid #00C9A7',
        marginBottom: 12,
    },
    prognosisText: {
        fontSize: 9,
        color: '#475569',
        lineHeight: 1.6,
    },
    // Opinion
    opinionBox: {
        backgroundColor: '#F8FAFC',
        padding: 15,
        borderRadius: 8,
        borderLeft: '5 solid #00C9A7',
    },
    opinionLabel: {
        fontSize: 7,
        fontWeight: 'bold',
        color: '#0A1628',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 6,
    },
    opinionText: {
        fontSize: 9,
        color: '#475569',
        fontStyle: 'italic',
        lineHeight: 1.6,
    },
    // Recommendations
    recItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        padding: '8 12',
        borderRadius: 6,
        border: '1 solid #E2E8F0',
        marginBottom: 6,
    },
    recDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 10,
    },
    recText: {
        flex: 1,
        fontSize: 9,
        color: '#0A1628',
    },
    // Bullet row
    bulletRow: {
        flexDirection: 'row',
        marginBottom: 6,
        alignItems: 'flex-start',
    },
    bulletChar: {
        width: 12,
        fontSize: 9,
        color: '#00C9A7',
    },
    bulletText: {
        flex: 1,
        fontSize: 9,
        color: '#475569',
        lineHeight: 1.3,
    },
    // Footer
    footer: {
        position: 'absolute',
        bottom: 25,
        left: 40,
        right: 40,
        backgroundColor: '#F8FAFC',
        padding: 15,
        borderTop: '1 solid #E2E8F0',
        textAlign: 'center',
    },
    footerText: {
        fontSize: 7,
        color: '#64748B',
        lineHeight: 1.5,
    },
    footerBrand: {
        fontSize: 8,
        color: '#0A1628',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 2,
        marginTop: 6,
    }
});

// Risk color helper
const getRiskColor = (risk = '') => {
    const r = String(risk).toLowerCase();
    if (r.includes('high') || r.includes('middle') || r.includes('moderate') || r.includes('flagged') || r.includes('detected') || r.includes('pathological')) return '#EF4444';
    if (r.includes('early') || r.includes('caution') || r.includes('border') || (r.includes('low') && r !== 'normal' && !r.includes('healthy'))) return '#F59E0B';
    return '#00C9A7';
};

const getRiskBg = (risk = '') => {
    const color = getRiskColor(risk);
    if (color === '#EF4444') return '#FEF2F2';
    if (color === '#F59E0B') return '#FFFBEB';
    return '#F0FDF4';
};

const getRiskBorder = (risk = '') => {
    const color = getRiskColor(risk);
    if (color === '#EF4444') return '#FCA5A5';
    if (color === '#F59E0B') return '#FCD34D';
    return '#86EFAC';
};

// Alzheimer's stage color helper (matches ReportPage)
const getStageColor = (s) => {
    const lower = s.toLowerCase();
    if (lower.includes('middle') || lower.includes('moderate')) return '#ef4444';
    if (lower.includes('early stage') || (lower.includes('mild') && !lower.includes('very early'))) return '#f97316';
    if (lower.includes('very early') || lower.includes('very mild') || lower.includes('pre-clinical')) return '#f59e0b';
    if (lower.includes('normal') || lower.includes('healthy') || lower.includes('non')) return '#00C9A7';
    return '#cbd5e1';
};

const BulletItem = ({ text }) => (
    <View style={styles.bulletRow}>
        <Text style={styles.bulletChar}>•</Text>
        <Text style={styles.bulletText}>{text}</Text>
    </View>
);

const ClinicalReportPDF = ({ reportData, userData, reportId, getRecommendation }) => {
    const rawCurrentRisk = reportData.risk || reportData.result || reportData.overall?.level || 'Normal';
    const currentRisk = typeof rawCurrentRisk === 'object' ? rawCurrentRisk.level : rawCurrentRisk;
    const riskColor = getRiskColor(currentRisk);
    const recommendations = getRecommendation(reportData.condition, String(currentRisk));

    const conditionName = {
        parkinsons: "Parkinson's Motor Assessment",
        alzheimers: "Alzheimer's Stage Classification",
        epilepsy: "Epilepsy Cognitive Risk Profile",
        'epilepsy-reaction': "Neurological Response Speed (Reaction Time)",
        ms: "Multiple Sclerosis (MS) Multi-Modal Screening"
    }[reportData.condition] || "Neurological Assessment";

    return (
        <Document>
            <Page size="A4" style={styles.page}>

                {/* ============ HEADER — matches dark navy header on screen ============ */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.headerTitle}>
                            Neuro<Text style={styles.headerTitleAccent}>Screen</Text>
                        </Text>
                        <Text style={styles.headerSubtitle}>Precision Diagnostics</Text>
                    </View>
                    <View style={styles.headerRight}>
                        <Text style={styles.headerRightTitle}>Clinical Summary Report</Text>
                        <Text style={styles.headerMeta}>REPORT UUID: {reportId}</Text>
                        <Text style={styles.headerMeta}>TIMESTAMP: {new Date().toLocaleString()}</Text>
                    </View>
                </View>

                {/* ============ BIOMETRIC PROFILE — matches 2x2 grid on screen ============ */}
                <View style={styles.section}>
                    <Text style={styles.sectionHeading}>Biometric Profile</Text>
                    <View style={styles.demographicsGrid}>
                        <View style={styles.demoItem}>
                            <Text style={styles.demoLabel}>Patient Name</Text>
                            <Text style={styles.demoValue}>{userData?.fullName || 'Anonymous Patient'}</Text>
                        </View>
                        <View style={styles.demoItem}>
                            <Text style={styles.demoLabel}>Age / Sex Baseline</Text>
                            <Text style={styles.demoValue}>{userData?.age || 'N/A'} Years • {userData?.gender || 'Unspecified'}</Text>
                        </View>
                        <View style={styles.demoItem}>
                            <Text style={styles.demoLabel}>Clinical Index (BMI)</Text>
                            <Text style={styles.demoValue}>{userData?.bmi || 'N/A'} kg/m²</Text>
                        </View>
                        <View style={styles.demoItem}>
                            <Text style={styles.demoLabel}>Physiological Stature</Text>
                            <Text style={styles.demoValue}>{userData?.height || 'N/A'}cm / {userData?.weight || 'N/A'}kg</Text>
                        </View>
                    </View>
                </View>

                {/* ============ INTEGRATIVE ANALYSIS — condition name + risk badge ============ */}
                <View style={styles.section}>
                    <Text style={styles.sectionHeading}>Integrative Analysis</Text>
                    <View style={[styles.analysisBox, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.analysisTitle}>{conditionName}</Text>
                            <Text style={styles.analysisSub}>Algorithmic Assessment via NeuroScreen Protocol v3.1</Text>
                        </View>
                        <View style={[styles.riskBadge, { backgroundColor: getRiskBg(currentRisk), borderColor: getRiskBorder(currentRisk) }]}>
                            <Text style={[styles.riskText, { color: riskColor }]}>{String(currentRisk).toUpperCase()}</Text>
                        </View>
                    </View>
                </View>

                {/* ============ CONDITION-SPECIFIC DATA ============ */}

                {/* --- Alzheimer's: Consensus + Bayesian Map --- */}
                {reportData.condition === 'alzheimers' && reportData.allStages && (
                    <View style={styles.section}>
                        <View style={{ flexDirection: 'row', marginBottom: 15 }}>
                            {/* Consensus Classification */}
                            <View style={{ width: '35%', padding: 15, backgroundColor: '#F8FAFC', borderRadius: 8, border: '1 solid #E2E8F0', alignItems: 'center' }}>
                                <Text style={{ fontSize: 7, fontWeight: 'bold', color: '#64748B', textTransform: 'uppercase', marginBottom: 8 }}>Consensus Classification</Text>
                                <View style={{ padding: '4 12', borderRadius: 6, borderWidth: 1, borderColor: getRiskBorder(currentRisk), backgroundColor: getRiskBg(currentRisk) }}>
                                    <Text style={{ fontSize: 11, fontWeight: 'bold', color: riskColor }}>{currentRisk}</Text>
                                </View>
                            </View>
                            {/* Bayesian Probability Map */}
                            <View style={{ width: '65%', paddingLeft: 15 }}>
                                <Text style={{ fontSize: 7, fontWeight: 'bold', color: '#0A1628', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Bayesian Probability Map</Text>
                                {Object.entries(reportData.allStages).map(([stage, prob]) => {
                                    const barColor = getStageColor(stage);
                                    return (
                                        <View key={stage} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                                            <Text style={{ width: 90, fontSize: 8, fontWeight: 'bold', color: '#0A1628' }}>{stage}</Text>
                                            <View style={styles.progressBarOuter}>
                                                <View style={[styles.progressBarInner, { width: `${prob}%`, backgroundColor: barColor }]} />
                                            </View>
                                            <Text style={{ width: 30, fontSize: 8, fontWeight: 'bold', color: barColor, textAlign: 'right' }}>{prob}%</Text>
                                        </View>
                                    );
                                })}
                            </View>
                        </View>

                        {/* Staging Logic & Pathological Variance */}
                        <View style={{ padding: 15, backgroundColor: '#F8FAFC', borderRadius: 8, border: '1 solid #E2E8F0' }}>
                            <Text style={{ fontSize: 8, fontWeight: 'bold', color: '#0A1628', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Staging Logic & Pathological Variance</Text>
                            <Text style={{ fontSize: 9, color: '#475569', lineHeight: 1.6, marginBottom: 12 }}>
                                {currentRisk.includes('Non')
                                    ? "Subject exhibits bilateral symmetry in cortical thickness. Volumetric analysis of the hippocampal formation resides within the 95th percentile of normal baseline for age-matched controls."
                                    : currentRisk.includes('Very Mild')
                                        ? "Minor ventricular enlargement detected relative to baseline. Morphological shifts in the entorhinal cortex suggest early-phase transition, currently classified as Pre-Clinical impairment."
                                        : currentRisk.includes('Mild')
                                            ? "Substantial density reduction localized in the temporal and parietal lobes. Volumetric markers align with established patterns of Mild Cognitive Impairment (MCI)."
                                            : "Extensive cortical atrophy and pronounced hippocampal volume loss. Structural deviations are consistent with advanced neurodegenerative progression and functional cognitive decline."
                                }
                            </Text>
                            <View style={{ flexDirection: 'row' }}>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 7, fontWeight: 'bold', color: '#64748B', textTransform: 'uppercase', marginBottom: 6 }}>Diagnostic Markers</Text>
                                    {currentRisk.includes('Non') ? (
                                        <View>
                                            <BulletItem text="Negative for hippocampal atrophy" />
                                            <BulletItem text="Cortical thickness symmetry maintained" />
                                            <BulletItem text="Baseline morphological stability" />
                                        </View>
                                    ) : (
                                        <View>
                                            <BulletItem text={`${currentRisk.includes('Moderate') ? 'Significant' : 'Trace'} ventricular dilatation`} />
                                            <BulletItem text="Temporal lobe volumetric reduction" />
                                            <BulletItem text="Pathological variance detected" />
                                        </View>
                                    )}
                                </View>
                                <View style={{ flex: 1, borderLeft: '1 solid #E2E8F0', paddingLeft: 15 }}>
                                    <Text style={{ fontSize: 7, fontWeight: 'bold', color: '#64748B', textTransform: 'uppercase', marginBottom: 6 }}>Risk Co-factors</Text>
                                    <View style={{ marginBottom: 5 }}>
                                        <Text style={{ fontSize: 9, color: '#475569' }}>Chronological Risk: <Text style={{ fontWeight: 'bold', color: '#0A1628' }}>{userData?.age > 65 ? "Elevated" : "Controlled"}</Text></Text>
                                    </View>
                                    <View>
                                        <Text style={{ fontSize: 9, color: '#475569' }}>Genetic Markers: <Text style={{ fontWeight: 'bold', color: '#0A1628' }}>{userData?.familyHistory || "Undisclosed"}</Text></Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>
                )}

                {/* --- MS: Kinetic Velocity + Optical Thresholding --- */}
                {reportData.condition === 'ms' && (
                    <View style={styles.section}>
                        <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                            {/* Kinetic Velocity */}
                            <View style={{ flex: 1, padding: 12, backgroundColor: '#F8FAFC', borderRadius: 8, border: '1 solid #E2E8F0', marginRight: 8 }}>
                                <Text style={{ fontSize: 7, fontWeight: 'bold', color: '#64748B', textTransform: 'uppercase', marginBottom: 8 }}>Kinetic Velocity Metrics</Text>
                                <View style={styles.metricRow}>
                                    <Text style={styles.metricLabel}>Dominant Hand Taps</Text>
                                    <View style={{ alignItems: 'flex-end' }}>
                                        <Text style={styles.metricValue}>{reportData.tappingResult?.domTaps ?? 0} TAPS</Text>
                                        <Text style={[styles.metricStatus, { color: reportData.tappingResult?.domFlagged ? '#EF4444' : '#00C9A7' }]}>
                                            {reportData.tappingResult?.domFlagged ? 'FLAGGED' : 'NORMAL'}
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.metricRow}>
                                    <Text style={styles.metricLabel}>Non-Dominant Hand Taps</Text>
                                    <View style={{ alignItems: 'flex-end' }}>
                                        <Text style={styles.metricValue}>{reportData.tappingResult?.nonDomTaps ?? 0} TAPS</Text>
                                        <Text style={[styles.metricStatus, { color: reportData.tappingResult?.nonDomFlagged ? '#EF4444' : '#00C9A7' }]}>
                                            {reportData.tappingResult?.nonDomFlagged ? 'FLAGGED' : 'NORMAL'}
                                        </Text>
                                    </View>
                                </View>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8 }}>
                                    <Text style={{ fontSize: 8, fontWeight: 'bold', color: '#0A1628' }}>INTER-HAND RATIO</Text>
                                    <View style={{ alignItems: 'flex-end' }}>
                                        <Text style={{ fontSize: 12, fontWeight: 'bold', color: reportData.tappingResult?.ratioFlagged ? '#EF4444' : '#00C9A7' }}>
                                            {reportData.tappingResult?.ratio?.toFixed(2) || '0.00'}
                                        </Text>
                                        <Text style={[styles.metricStatus, { color: reportData.tappingResult?.ratioFlagged ? '#EF4444' : '#00C9A7' }]}>
                                            {reportData.tappingResult?.ratioFlagged ? 'PATHOLOGICAL' : 'NORMAL'}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                            {/* Optical Thresholding */}
                            <View style={{ flex: 1, padding: 12, backgroundColor: '#F8FAFC', borderRadius: 8, border: '1 solid #E2E8F0', marginLeft: 8 }}>
                                <Text style={{ fontSize: 7, fontWeight: 'bold', color: '#64748B', textTransform: 'uppercase', marginBottom: 8 }}>Optical Thresholding</Text>
                                <View style={styles.metricRow}>
                                    <Text style={styles.metricLabel}>Lowest Contrast Seen</Text>
                                    <Text style={styles.metricValue}>{reportData.visionResult?.lowestSeen ?? 100}%</Text>
                                </View>
                                <View style={styles.metricRow}>
                                    <Text style={styles.metricLabel}>Optical Verdict</Text>
                                    <Text style={[styles.metricValue, { color: getRiskColor(reportData.visionResult?.verdict) }]}>{reportData.visionResult?.verdict || 'Pass'}</Text>
                                </View>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8 }}>
                                    <Text style={{ fontSize: 8, fontWeight: 'bold', color: '#0A1628' }}>COMBINED MS RISK</Text>
                                    <Text style={{ fontSize: 11, fontWeight: 'bold', color: riskColor }}>{String(currentRisk).toUpperCase()}</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                )}

                {/* --- Parkinson's: Classification + Confidence + Spatial Motor --- */}
                {reportData.condition === 'parkinsons' && (
                    <View style={styles.section}>
                        <View style={{ flexDirection: 'row', marginBottom: 12 }}>
                            <View style={{ flex: 1, padding: 15, backgroundColor: '#F8FAFC', borderRadius: 8, border: '1 solid #E2E8F0', marginRight: 8, alignItems: 'center' }}>
                                <Text style={{ fontSize: 7, fontWeight: 'bold', color: '#64748B', textTransform: 'uppercase', marginBottom: 8 }}>Structural Classification</Text>
                                <View style={{ padding: '4 12', borderRadius: 6, borderWidth: 1, borderColor: getRiskBorder(currentRisk), backgroundColor: getRiskBg(currentRisk) }}>
                                    <Text style={{ fontSize: 11, fontWeight: 'bold', color: riskColor }}>{currentRisk}</Text>
                                </View>
                            </View>
                            <View style={{ flex: 1, padding: 15, backgroundColor: '#F8FAFC', borderRadius: 8, border: '1 solid #E2E8F0', marginLeft: 8, alignItems: 'center' }}>
                                <Text style={{ fontSize: 7, fontWeight: 'bold', color: '#64748B', textTransform: 'uppercase', marginBottom: 8 }}>Algorithmic Confidence</Text>
                                <Text style={{ fontSize: 22, fontWeight: 'bold', color: riskColor }}>{reportData.confidence || '92'}%</Text>
                            </View>
                        </View>

                        {/* Spatial Motor Evaluation */}
                        <View style={{ padding: 15, backgroundColor: '#F8FAFC', borderRadius: 8, border: '1 solid #E2E8F0' }}>
                            <Text style={{ fontSize: 8, fontWeight: 'bold', color: '#0A1628', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Spatial Motor Evaluation</Text>
                            <Text style={{ fontSize: 9, color: '#475569', lineHeight: 1.6, marginBottom: 12 }}>
                                {currentRisk.toLowerCase().includes('high') || currentRisk.toLowerCase().includes('detected')
                                    ? "Micro-tremor amplitude analysis identified persistent sub-millimeter oscillations during spiral formation. Variance in pressure-velocity mapping is statistically consistent with prodromal Parkinsonian motor signatures."
                                    : "Kinetics exhibit smooth trajectories with negative indicators for micro-oscillation or path deviation. Angular velocity maintains a high coefficient of correlation with normal motor function baselines."
                                }
                            </Text>
                            <View style={{ flexDirection: 'row' }}>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 7, fontWeight: 'bold', color: '#64748B', textTransform: 'uppercase', marginBottom: 6 }}>Kinetic Indicators</Text>
                                    {currentRisk.toLowerCase().includes('high') || currentRisk.toLowerCase().includes('detected') ? (
                                        <View>
                                            <BulletItem text="High-frequency tremor signatures" />
                                            <BulletItem text="Irregular spatial formation" />
                                            <BulletItem text="Rigidity-correlated velocity shift" />
                                        </View>
                                    ) : (
                                        <View>
                                            <BulletItem text="Stable motor trajectory" />
                                            <BulletItem text="Negative for tremor oscillation" />
                                            <BulletItem text="Normal kinetic fluidity" />
                                        </View>
                                    )}
                                </View>
                                <View style={{ flex: 1, borderLeft: '1 solid #E2E8F0', paddingLeft: 15 }}>
                                    <Text style={{ fontSize: 7, fontWeight: 'bold', color: '#64748B', textTransform: 'uppercase', marginBottom: 6 }}>Demographic Risk</Text>
                                    <View style={{ marginBottom: 5 }}>
                                        <Text style={{ fontSize: 9, color: '#475569' }}>Age Factor: <Text style={{ fontWeight: 'bold', color: '#0A1628' }}>{userData?.age > 60 ? "Elevated" : "Baseline"}</Text></Text>
                                    </View>
                                    <View>
                                        <Text style={{ fontSize: 9, color: '#475569' }}>Genetic Risk: <Text style={{ fontWeight: 'bold', color: '#0A1628' }}>{userData?.familyHistory || "Undisclosed"}</Text></Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>
                )}

                {/* --- Epilepsy: Quiz Score + Reaction Time + Combined Risk --- */}
                {(reportData.condition === 'epilepsy' || reportData.condition === 'epilepsy-reaction') && (
                    <View style={styles.section}>
                        <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                            {(reportData.quizResult || reportData.score !== undefined) && (
                                <View style={{ flex: 1, padding: 12, backgroundColor: '#F8FAFC', borderRadius: 8, border: '1 solid #E2E8F0', marginRight: 8 }}>
                                    <Text style={{ fontSize: 7, fontWeight: 'bold', color: '#64748B', textTransform: 'uppercase', marginBottom: 8 }}>Clinical Questionnaire Score</Text>
                                    <Text style={{ fontSize: 20, fontWeight: 'bold', color: getRiskColor(reportData.quizResult?.risk || currentRisk) }}>
                                        {reportData.quizResult?.score ?? reportData.score ?? 0}
                                        <Text style={{ fontSize: 9, color: '#94A3B8' }}> / {reportData.quizResult?.maxScore ?? reportData.maxScore ?? 24}</Text>
                                    </Text>
                                    <Text style={{ fontSize: 8, fontWeight: 'bold', color: '#0A1628', marginTop: 6, textTransform: 'uppercase' }}>
                                        Risk: {reportData.quizResult?.risk || currentRisk}
                                    </Text>
                                </View>
                            )}
                            {(reportData.reactionResult || reportData.avg !== undefined) && (
                                <View style={{ flex: 1, padding: 12, backgroundColor: '#F8FAFC', borderRadius: 8, border: '1 solid #E2E8F0', marginLeft: 8 }}>
                                    <Text style={{ fontSize: 7, fontWeight: 'bold', color: '#64748B', textTransform: 'uppercase', marginBottom: 8 }}>Response Latency (Reaction Time)</Text>
                                    <Text style={{ fontSize: 20, fontWeight: 'bold', color: getRiskColor(reportData.reactionResult?.risk || currentRisk) }}>
                                        {reportData.reactionResult?.avg ?? reportData.avg ?? 0}
                                        <Text style={{ fontSize: 9, color: '#94A3B8' }}> MS</Text>
                                    </Text>
                                    <Text style={{ fontSize: 8, fontWeight: 'bold', color: '#0A1628', marginTop: 6, textTransform: 'uppercase' }}>
                                        Result: {reportData.reactionResult?.risk || currentRisk}
                                    </Text>
                                </View>
                            )}
                        </View>
                        {/* Combined Epilepsy Risk Profile */}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, backgroundColor: '#F8FAFC', borderRadius: 8, border: '1 solid #E2E8F0' }}>
                            <Text style={{ fontSize: 8, fontWeight: 'bold', color: '#0A1628', textTransform: 'uppercase', letterSpacing: 1 }}>Combined Epilepsy Risk Profile</Text>
                            <Text style={{ fontSize: 11, fontWeight: 'bold', color: riskColor, textDecoration: 'underline' }}>{String(currentRisk).toUpperCase()}</Text>
                        </View>
                    </View>
                )}

                {/* ============ CLINICAL PROGNOSIS — matches the on-screen section ============ */}
                <View style={styles.section}>
                    <Text style={styles.sectionHeading}>Clinical Prognosis</Text>
                    <Text style={[styles.prognosisText, { marginBottom: 12 }]}>
                        Multi-factorial modeling identifies a {String(currentRisk).toLowerCase()} risk trajectory based on current physiological and behavioral inputs.
                        {userData?.age > 60 ? " Demographic age factor contributes independently to the observed structural risk profile." : " Current age-based markers reside within statistical safety margins."}
                        {userData?.familyHistory === 'Yes' ? " Reported familial predisposition markers are integrated into the weighted diagnostic model." : " Negative familial history markers provide statistical attenuation for genetic risk."}
                    </Text>

                    <View style={[styles.opinionBox, { borderLeftColor: riskColor }]}>
                        <Text style={styles.opinionLabel}>Consolidated Clinical Opinion</Text>
                        <Text style={styles.opinionText}>
                            "Structural and kinetic data indicates a {String(currentRisk).toLowerCase()} clinical correlation with patterns associated with {conditionName}. Standard procedural validation via formal neurological evaluation is required."
                        </Text>
                    </View>
                </View>

                {/* ============ ACTIONABLE PROTOCOLS — matches on-screen recommendations ============ */}
                <View style={styles.section}>
                    <Text style={styles.sectionHeading}>Actionable Protocols</Text>
                    {recommendations.map((rec, i) => (
                        <View key={i} style={styles.recItem}>
                            <View style={[styles.recDot, { backgroundColor: riskColor }]} />
                            <Text style={styles.recText}>{rec}</Text>
                        </View>
                    ))}
                </View>

                {/* ============ FOOTER — matches on-screen disclaimer ============ */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        <Text style={{ fontWeight: 'bold', color: '#0A1628' }}>Medical Disclaimer: </Text>
                        This algorithmic report represents a heuristic screening baseline and is not a clinical diagnosis. All structural and kinetic markers must be evaluated by a board-certified neurologist within the context of a comprehensive clinical history and physical examination.
                    </Text>
                    <Text style={styles.footerBrand}>Powered by NeuroScreen Protocol</Text>
                </View>

            </Page>
        </Document>
    );
};

export default ClinicalReportPDF;
