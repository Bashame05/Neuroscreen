import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Calendar, Ruler, Weight, Brain, HeartPulse, Pill, ChevronRight, Check, AlertCircle } from 'lucide-react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const DIAGNOSIS_OPTIONS = ["None", "Parkinson's", "Alzheimer's", "Epilepsy", "MS", "Other"];

const ProfileSetup = ({ onComplete }) => {
    const navigate = useNavigate();
    const [saving, setSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isUpdate, setIsUpdate] = useState(false);

    const [fullName, setFullName] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('');
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');
    const [diagnoses, setDiagnoses] = useState([]);
    const [familyHistory, setFamilyHistory] = useState('');
    const [medications, setMedications] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            const user = auth.currentUser;
            if (user) {
                try {
                    const profileSnap = await getDoc(doc(db, 'users', user.uid));
                    if (profileSnap.exists()) {
                        const data = profileSnap.data();
                        setFullName(data.fullName || '');
                        setAge(data.age?.toString() || '');
                        setGender(data.gender || '');
                        setHeight(data.height?.toString() || '');
                        setWeight(data.weight?.toString() || '');
                        setDiagnoses(data.diagnoses || []);
                        setFamilyHistory(data.familyHistory ? 'Yes' : 'No');
                        setMedications(data.medications || '');
                        setIsUpdate(true);
                    }
                } catch (err) {
                    console.error("Error fetching profile:", err);
                }
            }
            setIsLoading(false);
        };
        fetchProfile();
    }, []);

    const bmi = height && weight
        ? (parseFloat(weight) / ((parseFloat(height) / 100) ** 2)).toFixed(1)
        : null;

    const getBmiCategory = (val) => {
        if (val < 18.5) return { label: 'Underweight', color: '#FB923C' };
        if (val < 25) return { label: 'Normal', color: 'var(--cyan)' };
        if (val < 30) return { label: 'Overweight', color: '#FB923C' };
        return { label: 'Obese', color: '#FF5252' };
    };

    const toggleDiagnosis = (d) => {
        if (d === 'None') {
            setDiagnoses(diagnoses.includes('None') ? [] : ['None']);
            return;
        }
        const without = diagnoses.filter(x => x !== 'None');
        if (without.includes(d)) {
            setDiagnoses(without.filter(x => x !== d));
        } else {
            setDiagnoses([...without, d]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSaving(true);

        const user = auth.currentUser;
        if (!user) {
            setError('Session expired. Please log in again.');
            setSaving(false);
            return;
        }

        try {
            await setDoc(doc(db, 'users', user.uid), {
                fullName,
                age: parseInt(age),
                gender,
                height: parseFloat(height),
                weight: parseFloat(weight),
                bmi: bmi ? parseFloat(bmi) : null,
                diagnoses,
                familyHistory: familyHistory === 'Yes',
                medications: medications.trim() || null,
                email: user.email,
                updatedAt: new Date().toISOString(),
                createdAt: isUpdate ? undefined : new Date().toISOString(),
            }, { merge: true });
            if (onComplete) onComplete();
            navigate('/dashboard');
        } catch (err) {
            setError('Failed to save profile. Please try again.');
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div style={{
                minHeight: 'calc(100vh - 74px)',
                background: 'var(--bg-3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary)',
                position: 'relative'
            }}>
                <div className="bg-orb orb-1"></div>
                <div className="bg-orb orb-2"></div>
                <div className="bg-grid"></div>
                Loading Profile...
            </div>
        );
    }

    return (
        <div style={{
            minHeight: 'calc(100vh - 74px)',
            display: 'flex',
            justifyContent: 'center',
            padding: '4rem 2rem',
        }}>
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{ width: '100%', maxWidth: '680px' }}
            >
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <div style={{
                        width: 72, height: 72, borderRadius: '20px',
                        background: 'var(--primary-muted)',
                        border: '1px solid var(--primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 1.5rem',
                        boxShadow: '0 8px 24px rgba(0, 201, 167, 0.15)'
                    }}>
                        <User size={32} color="var(--primary)" />
                    </div>
                    <h2 style={{ fontSize: '2.2rem', marginBottom: '0.75rem', color: 'var(--text-heading)' }}>
                        {isUpdate ? 'Update Your ' : 'Complete Your '} <span style={{ color: 'var(--primary)' }}>Profile</span>
                    </h2>
                    <p style={{ color: 'var(--text-body)', fontSize: '1rem', maxWidth: 480, margin: '0 auto', fontWeight: 500 }}>
                        {isUpdate 
                            ? 'Keep your clinical information up to date for precise tracking.'
                            : 'Help us personalize your clinical experience. This information aids in accurate neurological assessments.'
                        }
                    </p>
                </div>

                {error && (
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.75rem 1rem', marginBottom: '1.5rem',
                        background: 'rgba(255, 80, 80, 0.1)',
                        border: '1px solid rgba(255, 80, 80, 0.3)',
                        borderRadius: '8px', color: '#ff5050', fontSize: '0.85rem'
                    }}>
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* Personal Information */}
                    <div className="glass-card" style={{ marginBottom: '2rem', padding: '2.5rem' }}>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-heading)' }}>
                            <User size={20} color="var(--primary)" />
                            Personal Information
                        </h3>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                            {/* Full Name — full width */}
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={labelStyle}>Full Name *</label>
                                <input
                                    type="text" required
                                    placeholder="Dr. Jane Smith"
                                    value={fullName} onChange={e => setFullName(e.target.value)}
                                    style={inputStyle}
                                />
                            </div>

                            {/* Age */}
                            <div>
                                <label style={labelStyle}>Age *</label>
                                <div style={{ position: 'relative' }}>
                                    <Calendar size={16} style={iconStyle} />
                                    <input
                                        type="number" required min="1" max="120"
                                        placeholder="32"
                                        value={age} onChange={e => setAge(e.target.value)}
                                        style={{ ...inputStyle, paddingLeft: '2.5rem' }}
                                    />
                                </div>
                            </div>

                            {/* Gender */}
                            <div>
                                <label style={labelStyle}>Gender *</label>
                                <select
                                    required
                                    value={gender} onChange={e => setGender(e.target.value)}
                                    style={{ ...inputStyle, cursor: 'pointer', appearance: 'none' }}
                                >
                                    <option value="" disabled>Select</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Non-binary">Non-binary</option>
                                    <option value="Prefer not to say">Prefer not to say</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Body Metrics */}
                    <div className="glass-card" style={{ marginBottom: '2rem', padding: '2.5rem' }}>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-heading)' }}>
                            <Ruler size={20} color="var(--primary)" />
                            Body Metrics
                        </h3>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                            {/* Height */}
                            <div>
                                <label style={labelStyle}>Height (cm) *</label>
                                <div style={{ position: 'relative' }}>
                                    <Ruler size={16} style={iconStyle} />
                                    <input
                                        type="number" required min="50" max="250" step="0.1"
                                        placeholder="170"
                                        value={height} onChange={e => setHeight(e.target.value)}
                                        style={{ ...inputStyle, paddingLeft: '2.5rem' }}
                                    />
                                </div>
                            </div>

                            {/* Weight */}
                            <div>
                                <label style={labelStyle}>Weight (kg) *</label>
                                <div style={{ position: 'relative' }}>
                                    <Weight size={16} style={iconStyle} />
                                    <input
                                        type="number" required min="10" max="300" step="0.1"
                                        placeholder="70"
                                        value={weight} onChange={e => setWeight(e.target.value)}
                                        style={{ ...inputStyle, paddingLeft: '2.5rem' }}
                                    />
                                </div>
                            </div>

                            {/* BMI Display */}
                            <div style={{ gridColumn: '1 / -1' }}>
                                <AnimatePresence>
                                    {bmi && !isNaN(bmi) && isFinite(bmi) && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            style={{
                                                padding: '1rem 1.25rem',
                                                background: 'rgba(100, 255, 218, 0.05)',
                                                border: '1px solid rgba(100, 255, 218, 0.15)',
                                                borderRadius: '8px',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center'
                                            }}
                                        >
                                            <span style={{ color: 'var(--text-body)', fontSize: '0.9rem', fontWeight: 600 }}>
                                                Calculated BMI
                                            </span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <span style={{
                                                    fontSize: '1.4rem', fontWeight: 700,
                                                    fontFamily: 'var(--font-heading)',
                                                    color: getBmiCategory(parseFloat(bmi)).color
                                                }}>
                                                    {bmi}
                                                </span>
                                                <span style={{
                                                    fontSize: '0.75rem',
                                                    padding: '0.2rem 0.6rem',
                                                    borderRadius: '20px',
                                                    background: `${getBmiCategory(parseFloat(bmi)).color}18`,
                                                    color: getBmiCategory(parseFloat(bmi)).color,
                                                    fontWeight: 600,
                                                }}>
                                                    {getBmiCategory(parseFloat(bmi)).label}
                                                </span>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>

                    {/* Medical History */}
                    <div className="glass-card" style={{ marginBottom: '2.5rem', padding: '2.5rem' }}>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-heading)' }}>
                            <Brain size={20} color="var(--primary)" />
                            Medical History
                        </h3>

                        {/* Diagnoses multi-select */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={labelStyle}>Existing Neurological Diagnoses *</label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.25rem' }}>
                                {DIAGNOSIS_OPTIONS.map(d => {
                                    const selected = diagnoses.includes(d);
                                    return (
                                        <button
                                            key={d} type="button"
                                            onClick={() => toggleDiagnosis(d)}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                borderRadius: '20px',
                                                fontSize: '0.85rem',
                                                fontWeight: 500,
                                                border: `1.5px solid ${selected ? 'var(--primary)' : 'rgba(0, 0, 0, 0.1)'}`,
                                                background: selected ? 'var(--primary-muted)' : 'white',
                                                color: selected ? 'var(--primary)' : 'var(--text-body)',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease',
                                                display: 'flex', alignItems: 'center', gap: '0.35rem',
                                            }}
                                        >
                                            {selected && <Check size={14} />}
                                            {d}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Family History */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={labelStyle}>Family History of Neurological Conditions *</label>
                            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
                                {['Yes', 'No'].map(opt => {
                                    const selected = familyHistory === opt;
                                    return (
                                        <button
                                            key={opt} type="button"
                                            onClick={() => setFamilyHistory(opt)}
                                            style={{
                                                padding: '0.6rem 2rem',
                                                borderRadius: '8px',
                                                fontSize: '0.9rem',
                                                fontWeight: 500,
                                                border: `1.5px solid ${selected ? 'var(--primary)' : 'rgba(0, 0, 0, 0.1)'}`,
                                                background: selected ? 'var(--primary-muted)' : 'white',
                                                color: selected ? 'var(--primary)' : 'var(--text-body)',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease',
                                                display: 'flex', alignItems: 'center', gap: '0.35rem',
                                            }}
                                        >
                                            {selected && <HeartPulse size={14} />}
                                            {opt}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Medications */}
                        <div>
                            <label style={labelStyle}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                    <Pill size={14} />
                                    Current Medications
                                    <span style={{ color: 'var(--slate)', fontWeight: 400 }}>(optional)</span>
                                </span>
                            </label>
                            <textarea
                                placeholder="e.g. Levodopa 100mg, Donepezil 5mg..."
                                value={medications}
                                onChange={e => setMedications(e.target.value)}
                                rows={3}
                                style={{
                                    ...inputStyle,
                                    resize: 'vertical',
                                    minHeight: '80px',
                                    fontFamily: 'var(--font-primary)',
                                }}
                            />
                        </div>
                    </div>

                    {/* Submit */}
                    <motion.button
                        type="submit"
                        className="btn-primary"
                        disabled={saving || diagnoses.length === 0 || !familyHistory}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        style={{
                            width: '100%',
                            padding: '1.2rem',
                            fontSize: '1.1rem',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.75rem',
                            opacity: (saving || diagnoses.length === 0 || !familyHistory) ? 0.5 : 1,
                            marginBottom: '4rem',
                            borderRadius: '16px',
                            background: 'linear-gradient(135deg, var(--primary) 0%, #00B4D8 100%)',
                            boxShadow: '0 8px 30px rgba(0, 201, 167, 0.3)'
                        }}
                    >
                        {saving ? (isUpdate ? 'Updating...' : 'Saving...') : (isUpdate ? 'Update Clinical Profile' : 'Continue to Dashboard')}
                        {!saving && <ChevronRight size={20} />}
                    </motion.button>
                </form>
            </motion.div>
        </div>
    );
};

const labelStyle = {
    display: 'block',
    fontSize: '0.85rem',
    fontWeight: 700,
    color: 'var(--text-heading)',
    marginBottom: '0.6rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
};

const inputStyle = {
    width: '100%',
    padding: '1rem 1.25rem',
    background: 'white',
    border: '1.5px solid rgba(0, 0, 0, 0.08)',
    borderRadius: '12px',
    color: 'var(--text-heading)',
    fontSize: '1rem',
    outline: 'none',
    transition: 'all 0.3s ease',
};

const iconStyle = {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--text-body)',
};

export default ProfileSetup;
