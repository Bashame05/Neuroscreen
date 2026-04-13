import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, ArrowRight, Eye, Activity } from 'lucide-react';

const LEVELS = [
    { percent: 100, label: '100%' },
    { percent: 50, label: '50%' },
    { percent: 25, label: '25%' },
    { percent: 10, label: '10%' },
    { percent: 5, label: '5%' },
    { percent: 2.5, label: '2.5%' },
    { percent: 1, label: '1%' },
];

const ALL_LETTERS = 'ABCDEFGHJKLMNPRSTUVWXYZ'.split(''); // excluded ambiguous I,O,Q
const BG_GREY = 128;
const LETTERS_PER_LEVEL = 2;
const CHOICES_COUNT = 6;
const PASS_THRESHOLD = 2; // need 2/2 correct to pass

// Pick n unique random items from arr
function pickRandom(arr, n) {
    const copy = [...arr];
    const result = [];
    for (let i = 0; i < n && copy.length > 0; i++) {
        const idx = Math.floor(Math.random() * copy.length);
        result.push(copy.splice(idx, 1)[0]);
    }
    return result;
}

// Pre-generate test data: for each level, 3 letters + 6 choices per letter
function generateTestData() {
    return LEVELS.map(() => {
        const letters = pickRandom(ALL_LETTERS, LETTERS_PER_LEVEL);
        const trials = letters.map(correct => {
            const distractors = pickRandom(
                ALL_LETTERS.filter(l => l !== correct),
                CHOICES_COUNT - 1
            );
            const options = [...distractors, correct];
            // Shuffle options
            for (let i = options.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [options[i], options[j]] = [options[j], options[i]];
            }
            return { correct, options };
        });
        return { letters, trials };
    });
}

function getLetterColor(contrastPercent) {
    const value = Math.round(BG_GREY * (1 - contrastPercent / 100));
    return `rgb(${value}, ${value}, ${value})`;
}

function getVerdict(lastPassedIndex) {
    // Failed at 100% — couldn't pass the first level
    if (lastPassedIndex === -1) {
        return { label: 'Severe MS Flag', flag: 'severe', color: 'var(--error)', colorBg: 'rgba(255,82,82,0.1)' };
    }
    const lastPassedPercent = LEVELS[lastPassedIndex].percent;
    // Passed all 7 levels including 1%
    if (lastPassedIndex === LEVELS.length - 1) {
        return { label: 'Perfect Vision', flag: 'normal', color: 'var(--cyan)', colorBg: 'rgba(100,255,218,0.1)' };
    }
    // Only passed 100% or 50% — failed early, poor contrast sensitivity
    if (lastPassedPercent >= 50) {
        return { label: 'MS Flag — Optic Neuritis Indicator', flag: 'ms-flag', color: 'var(--error)', colorBg: 'rgba(255,82,82,0.1)' };
    }
    // Passed down to 25% or 10% — mild reduction
    if (lastPassedPercent >= 10) {
        return { label: 'Mild Flag — Monitor Closely', flag: 'mild', color: 'var(--caution)', colorBg: 'rgba(250,204,21,0.1)' };
    }
    // Passed down to 5% or 2.5% — good contrast sensitivity
    return { label: 'Normal', flag: 'normal', color: 'var(--cyan)', colorBg: 'rgba(100,255,218,0.1)' };
}

const VisionContrastTest = () => {
    const navigate = useNavigate();
    const testData = useMemo(() => generateTestData(), []);

    // State
    const [levelIndex, setLevelIndex] = useState(0);
    const [trialIndex, setTrialIndex] = useState(0);       // 0-2 within a level
    const [correctCount, setCorrectCount] = useState(0);    // correct answers in current level
    const [wrongCount, setWrongCount] = useState(0);        // wrong answers in current level
    const [selected, setSelected] = useState(null);         // letter user clicked (for feedback)
    const [showFeedback, setShowFeedback] = useState(false);
    const [levelResults, setLevelResults] = useState([]);    // { percent, passed, score }
    const [testComplete, setTestComplete] = useState(false);
    const [lastPassedIndex, setLastPassedIndex] = useState(-1);

    const currentLevel = LEVELS[levelIndex];
    const currentTrial = testData[levelIndex]?.trials[trialIndex];

    const handleChoice = (letter) => {
        if (showFeedback) return;
        const isCorrect = letter === currentTrial.correct;
        setSelected(letter);
        setShowFeedback(true);

        const newCorrect = correctCount + (isCorrect ? 1 : 0);
        const newWrong = wrongCount + (isCorrect ? 0 : 1);

        setTimeout(() => {
            // Check if level outcome is determined
            const trialsRemaining = LETTERS_PER_LEVEL - (trialIndex + 1);
            const passed = newCorrect >= PASS_THRESHOLD;
            const failed = newWrong >= 1; // fail if any wrong in 2/2 mode

            if (passed || failed || trialsRemaining === 0) {
                // Level complete
                const levelPassed = newCorrect >= PASS_THRESHOLD;
                const newResults = [...levelResults, {
                    percent: currentLevel.percent,
                    label: currentLevel.label,
                    passed: levelPassed,
                    score: `${newCorrect}/${LETTERS_PER_LEVEL}`
                }];
                setLevelResults(newResults);

                if (levelPassed) {
                    setLastPassedIndex(levelIndex);
                }

                if (failed || levelIndex >= LEVELS.length - 1) {
                    // Test over: failed a level or completed all levels
                    const finalPassedIdx = levelPassed ? levelIndex : lastPassedIndex;
                    const verdict = getVerdict(finalPassedIdx);
                    localStorage.setItem('neuroscreen_ms_vision', JSON.stringify({
                        lowestSeen: finalPassedIdx >= 0 ? LEVELS[finalPassedIdx].percent : null,
                        verdict: verdict.label,
                        flag: verdict.flag,
                        levelResults: newResults,
                    }));
                    setLastPassedIndex(finalPassedIdx);
                    setTestComplete(true);
                } else {
                    // Move to next level
                    setLevelIndex(levelIndex + 1);
                    setTrialIndex(0);
                    setCorrectCount(0);
                    setWrongCount(0);
                }
            } else {
                // Continue to next trial in same level
                setTrialIndex(trialIndex + 1);
                setCorrectCount(newCorrect);
                setWrongCount(newWrong);
            }

            setSelected(null);
            setShowFeedback(false);
        }, 800);
    };

    const verdict = testComplete ? getVerdict(lastPassedIndex) : null;

    const getClinicalExplanation = () => {
        if (!verdict) return '';
        switch (verdict.flag) {
            case 'severe':
                return 'Failure to identify letters at full contrast indicates severe contrast sensitivity loss, potentially due to optic nerve damage or extensive demyelination. Urgent ophthalmologic and neurological evaluation is recommended.';
            case 'ms-flag':
                return 'Reduced contrast sensitivity at lower levels is a hallmark indicator of optic neuritis, commonly associated with MS. Ophthalmologic evaluation is strongly recommended.';
            case 'mild':
                return 'Mild reduction in contrast sensitivity detected. While not always clinically significant, this should be monitored over time as it may indicate early visual pathway involvement.';
            case 'normal':
                return 'Contrast sensitivity is within the normal clinical range. No abnormalities detected in visual pathway screening.';
            default:
                return '';
        }
    };

    return (
        <div style={{ padding: '6rem 2rem 10rem', minHeight: 'calc(100vh - 70px)' }}>
            <header style={{ marginBottom: '4rem', textAlign: 'center' }}>
                <h2 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-heading)', letterSpacing: '-1.5px' }}>
                    Contrast <span style={{ color: 'var(--primary)' }}>Sensitivity Protocol</span>
                </h2>
                <p style={{ color: 'var(--text-body)', maxWidth: '650px', margin: '0 auto', fontSize: '1.2rem', fontWeight: 500, lineHeight: 1.6 }}>
                    Identifying structural visual pathway integrity through high-precision 
                    Pelli-Robson contrast thresholding.
                </p>
            </header>

            <AnimatePresence mode="wait">
                {!testComplete ? (
                    <motion.div
                        key={`l${levelIndex}-t${trialIndex}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.25 }}
                        style={{ maxWidth: '800px', margin: '0 auto' }}
                    >
                        {/* Progress pill */}
                        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
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
                                Level {levelIndex + 1} of {LEVELS.length} — Stimulus {trialIndex + 1} of {LETTERS_PER_LEVEL}
                            </span>
                        </div>

                        {/* Progress bar */}
                        <div style={{ width: '100%', height: '6px', background: 'var(--glass-border)', borderRadius: '3px', marginBottom: '1.5rem', overflow: 'hidden' }}>
                            <div style={{
                                width: `${((levelIndex * LETTERS_PER_LEVEL + trialIndex + 1) / (LEVELS.length * LETTERS_PER_LEVEL)) * 100}%`,
                                height: '100%', background: 'var(--primary)', borderRadius: '3px',
                                transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                boxShadow: '0 0 15px rgba(0, 201, 167, 0.4)'
                            }} />
                        </div>
                        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                            <span style={{ fontSize: '1rem', color: 'var(--text-body)', fontWeight: 600 }}>
                                Contrast: <strong style={{ color: 'var(--text-heading)', fontWeight: 800 }}>{currentLevel.label}</strong> · Score: <strong style={{ color: 'var(--primary)', fontWeight: 800 }}>{correctCount}/{trialIndex}</strong>
                            </span>
                        </div>

                        <div className="glass-card" style={{ padding: '5rem 3rem', textAlign: 'center' }}>
                            {/* Letter display */}
                            <div style={{
                                display: 'flex', justifyContent: 'center', alignItems: 'center',
                                width: '320px', height: '320px', margin: '0 auto 3.5rem',
                                backgroundColor: `rgb(${BG_GREY}, ${BG_GREY}, ${BG_GREY})`,
                                borderRadius: '24px',
                                border: '8px solid var(--bg-3)',
                                boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                            }}>
                                <span style={{
                                    fontSize: '180px',
                                    fontWeight: 900,
                                    fontFamily: 'serif',
                                    color: showFeedback ? 'rgb(0,0,0)' : getLetterColor(currentLevel.percent),
                                    lineHeight: 1,
                                    userSelect: 'none',
                                    transition: 'color 0.3s ease'
                                }}>
                                    {currentTrial.correct}
                                </span>
                            </div>

                            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '2.5rem', color: 'var(--text-heading)' }}>
                                Identify the visual stimulus below:
                            </h3>

                            {/* Choice buttons */}
                                <div style={{
                                display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
                                gap: '1.25rem', maxWidth: '400px', margin: '0 auto'
                            }}>
                                {currentTrial.options.map((letter) => {
                                    let bg = 'var(--bg-3)';
                                    let border = '1px solid var(--glass-border)';
                                    let textColor = 'var(--text-heading)';
                                    let shadow = '0 4px 10px rgba(0,0,0,0.02)';

                                    if (showFeedback) {
                                        if (letter === currentTrial.correct) {
                                            bg = '#ecfdf5';
                                            border = '2px solid #10b981';
                                            textColor = '#059669';
                                            shadow = '0 0 20px rgba(16, 185, 129, 0.2)';
                                        } else if (letter === selected && letter !== currentTrial.correct) {
                                            bg = '#fef2f2';
                                            border = '2px solid #ef4444';
                                            textColor = '#dc2626';
                                            shadow = '0 0 20px rgba(239, 68, 68, 0.2)';
                                        }
                                    }

                                    return (
                                        <button
                                            key={letter}
                                            onClick={() => handleChoice(letter)}
                                            disabled={showFeedback}
                                            style={{
                                                padding: '1.25rem', fontSize: '1.8rem', fontWeight: 900,
                                                fontFamily: 'serif', background: bg, border,
                                                borderRadius: '16px', color: textColor,
                                                cursor: showFeedback ? 'default' : 'pointer',
                                                transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                                boxShadow: shadow,
                                                opacity: showFeedback && letter !== selected && letter !== currentTrial.correct ? 0.3 : 1,
                                                transform: !showFeedback ? 'scale(1)' : (letter === selected ? 'scale(1.05)' : 'scale(1)')
                                            }}
                                            onMouseOver={(e) => { if(!showFeedback) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = 'var(--primary)'; } }}
                                            onMouseOut={(e) => { if(!showFeedback) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--glass-border)'; } }}
                                        >
                                            {letter}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="results"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', maxWidth: '850px', margin: '0 auto' }}
                    >
                        {/* Overall Result Banner */}
                        <div className="glass-card" style={{
                            borderTop: `12px solid ${verdict.color}`,
                            padding: '5rem 3rem', textAlign: 'center'
                        }}>
                            <div style={{ 
                                width: '100px', height: '100px', borderRadius: '50%',
                                background: `${verdict.color}15`, border: `2px solid ${verdict.color}25`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 2.5rem', boxShadow: `0 10px 30px ${verdict.color}15`
                            }}>
                                {verdict.flag === 'normal'
                                    ? <Eye size={56} color={verdict.color} />
                                    : <AlertTriangle size={56} color={verdict.color} />
                                }
                            </div>
                            <h3 style={{ fontSize: '3.5rem', fontWeight: 900, color: 'var(--text-heading)', marginBottom: '0.75rem', letterSpacing: '-2px' }}>
                                {verdict.label}
                            </h3>
                            <p style={{ color: 'var(--text-body)', fontSize: '1.25rem', fontWeight: 600 }}>
                                Terminal Threshold: <span style={{ color: 'var(--text-heading)', fontWeight: 800 }}>
                                    {lastPassedIndex >= 0 ? LEVELS[lastPassedIndex].label : 'None'} Contrast
                                </span>
                            </p>
                        </div>

                        {/* Level breakdown */}
                        <div className="glass-card" style={{ padding: '3rem' }}>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-heading)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 800, marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <Activity size={18} color="var(--primary)" /> Phase-Specific Resolution
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {levelResults.map((r) => (
                                    <div key={r.percent} style={{
                                        display: 'flex', alignItems: 'center', gap: '1.5rem',
                                        padding: '1.25rem 1.5rem', borderRadius: '16px',
                                        background: 'var(--bg-3)', border: '1px solid var(--glass-border)',
                                        boxShadow: '0 4px 10px rgba(0,0,0,0.02)'
                                    }}>
                                        <span style={{ width: '60px', textAlign: 'right', fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-heading)' }}>
                                            {r.label}
                                        </span>
                                        <div style={{ flex: 1, height: '8px', background: 'var(--glass-border)', borderRadius: '4px', overflow: 'hidden' }}>
                                            <div style={{
                                                width: '100%', height: '100%', borderRadius: '4px',
                                                background: r.passed ? 'var(--primary)' : '#ef4444',
                                                opacity: r.passed ? 1 : 0.6
                                            }} />
                                        </div>
                                        <span style={{ fontSize: '1rem', color: 'var(--text-body)', width: '40px', textAlign: 'center', fontWeight: 700 }}>
                                            {r.score}
                                        </span>
                                        <div style={{ 
                                            display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.8rem',
                                            borderRadius: '8px', background: r.passed ? '#ecfdf5' : '#fef2f2',
                                            color: r.passed ? '#059669' : '#dc2626', fontWeight: 800, fontSize: '0.85rem'
                                        }}>
                                            {r.passed ? <CheckCircle size={16} /> : <XCircle size={16} />}
                                            {r.passed ? 'PASS' : 'FAIL'}
                                        </div>
                                    </div>
                                ))}
                                {/* Show untested levels */}
                                {LEVELS.slice(levelResults.length).map((level) => (
                                    <div key={level.percent} style={{
                                        display: 'flex', alignItems: 'center', gap: '1.5rem',
                                        padding: '1.25rem 1.5rem', borderRadius: '16px',
                                        background: 'var(--glass-bg)', opacity: 0.5, border: '1px solid var(--glass-border)'
                                    }}>
                                        <span style={{ width: '60px', textAlign: 'right', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-body)' }}>
                                            {level.label}
                                        </span>
                                        <div style={{ flex: 1, height: '8px', background: 'var(--glass-border)', borderRadius: '4px' }} />
                                        <span style={{ fontSize: '1rem', color: 'var(--text-body)', width: '40px', textAlign: 'center' }}>—</span>
                                        <div style={{ 
                                            padding: '0.4rem 0.8rem', borderRadius: '8px', background: 'var(--glass-border)',
                                            color: 'var(--text-body)', fontWeight: 700, fontSize: '0.85rem'
                                        }}>
                                            SKIP
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Clinical Explanation */}
                        <div className="glass-card" style={{
                            padding: '3rem',
                            borderLeft: `10px solid ${verdict.color}`,
                            background: 'var(--bg-3)'
                        }}>
                            <h4 style={{ color: verdict.color, fontWeight: 900, marginBottom: '1rem', fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                Clinical Interpretation
                            </h4>
                            <p style={{ fontSize: '1.15rem', color: 'var(--text-body)', lineHeight: 1.8, fontWeight: 500 }}>
                                {getClinicalExplanation()}
                            </p>
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', marginTop: '1rem' }}>
                            <button className="btn-primary" onClick={() => navigate('/screening/ms/results')}
                                style={{ padding: '1.25rem 3.5rem', fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                Finalize Integrative Report <ArrowRight size={22} />
                            </button>
                        </div>

                        <div style={{
                            marginTop: '2rem', padding: '3rem 2rem', borderTop: '1px solid var(--glass-border)', 
                            textAlign: 'center', color: 'var(--text-body)', fontSize: '0.9rem', fontStyle: 'italic', opacity: 0.7
                        }}>
                            <strong style={{ color: 'var(--text-heading)' }}>Diagnostic Disclaimer:</strong> This metric represents longitudinal contrast sensitivity and must be 
                            interpreted by a clinical ophthalmologist or neurologist in the context of a full medical history.
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default VisionContrastTest;
