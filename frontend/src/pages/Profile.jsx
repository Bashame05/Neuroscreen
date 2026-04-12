import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Mail, Calendar, Ruler, Weight, Brain, Activity, Clock, ShieldCheck, ChevronRight, Edit3, Save, X, CheckCircle } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { getScreeningHistory } from '../utils/screeningService';

const DIAGNOSIS_OPTIONS = ["None", "Parkinson's", "Alzheimer's", "Epilepsy", "MS", "Other"];

const Profile = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [history, setHistory] = useState([]);
    
    // Edit Mode states
    const [isEditing, setIsEditing] = useState(false);
    const [editedData, setEditedData] = useState(null);
    const [saving, setSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            const user = auth.currentUser;
            if (user) {
                try {
                    const profileSnap = await getDoc(doc(db, 'users', user.uid));
                    if (profileSnap.exists()) {
                        const data = profileSnap.data();
                        setProfile(data);
                        setEditedData(data);

                        // Check for edit mode trigger in URL
                        const queryParams = new URLSearchParams(location.search);
                        if (queryParams.get('edit') === 'true') {
                            setIsEditing(true);
                        }
                    }
                    // Fetch screening history
                    const historyData = await getScreeningHistory(user.uid);
                    setHistory(historyData.slice(0, 3)); // Only show last 3
                } catch (err) {
                    console.error("Error fetching profile:", err);
                }
            }
            setLoading(false);
        };
        fetchProfile();
    }, [location.search]);

    const handleEditToggle = () => {
        setEditedData({ ...profile });
        setIsEditing(true);
    };

    const handleCancel = () => {
        setEditedData({ ...profile });
        setIsEditing(false);
    };

    const handleInputChange = (field, value) => {
        setEditedData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const toggleDiagnosis = (d) => {
        let newDiagnoses = [...(editedData.diagnoses || [])];
        if (d === 'None') {
            newDiagnoses = newDiagnoses.includes('None') ? [] : ['None'];
        } else {
            newDiagnoses = newDiagnoses.filter(x => x !== 'None');
            if (newDiagnoses.includes(d)) {
                newDiagnoses = newDiagnoses.filter(x => x !== d);
            } else {
                newDiagnoses.push(d);
            }
        }
        handleInputChange('diagnoses', newDiagnoses);
    };

    // Auto-calculate BMI for editedData
    const currentBmi = editedData?.height && editedData?.weight
        ? (parseFloat(editedData.weight) / ((parseFloat(editedData.height) / 100) ** 2)).toFixed(1)
        : null;

    const handleSave = async () => {
        setSaving(true);
        const user = auth.currentUser;
        if (!user) return;

        try {
            const finalData = {
                ...editedData,
                bmi: currentBmi ? parseFloat(currentBmi) : null,
                updatedAt: new Date().toISOString()
            };
            
            await setDoc(doc(db, 'users', user.uid), finalData, { merge: true });
            setProfile(finalData);
            setIsEditing(false);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        } catch (err) {
            console.error("Error saving profile:", err);
            alert("Failed to save changes. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    const getBmiCategory = (val) => {
        if (!val) return { label: 'N/A', color: 'var(--slate)' };
        if (val < 18.5) return { label: 'Underweight', color: '#FB923C' };
        if (val < 25) return { label: 'Normal', color: 'var(--cyan)' };
        if (val < 30) return { label: 'Overweight', color: '#FB923C' };
        return { label: 'Obese', color: '#FF5252' };
    };

    if (loading) {
        return (
            <div style={{ minHeight: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                <div className="glass-card" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Activity className="animate-spin" size={24} />
                    <span>Loading Clinical Profile...</span>
                </div>
            </div>
        );
    }

    if (!profile) return (
        <div style={{ minHeight: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
                <Activity size={48} color="var(--error)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
                <h3 style={{ color: 'var(--text-heading)', marginBottom: '0.5rem' }}>Profile Not Found</h3>
                <p style={{ color: 'var(--text-body)' }}>Please complete the initial setup to view your profile.</p>
                <button className="btn-primary" onClick={() => navigate('/setup')} style={{ marginTop: '1.5rem' }}>Complete Setup</button>
            </div>
        </div>
    );

    const bmiCat = getBmiCategory(isEditing ? currentBmi : profile.bmi);

    return (
        <div style={{ minHeight: 'calc(100vh - 80px)', padding: '4rem 2rem' }}>
            <div className="container" style={{ maxWidth: '1000px' }}>
                
                {/* Success Message */}
                <AnimatePresence>
                    {showSuccess && (
                        <motion.div
                            initial={{ opacity: 0, y: -20, x: '-50%' }}
                            animate={{ opacity: 1, y: 0, x: '-50%' }}
                            exit={{ opacity: 0, y: -20, x: '-50%' }}
                            style={{
                                position: 'fixed',
                                top: '100px',
                                left: '50%',
                                background: 'white',
                                border: '1px solid var(--primary)',
                                borderRadius: '12px',
                                padding: '1rem 2rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                color: 'var(--primary)',
                                zIndex: 1000,
                                boxShadow: '0 10px 25px rgba(0, 201, 167, 0.2)',
                                backdropFilter: 'blur(10px)',
                                WebkitBackdropFilter: 'blur(10px)'
                            }}
                        >
                            <CheckCircle size={20} />
                            Profile updated successfully!
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Profile Header */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card"
                    style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '2rem', 
                        marginBottom: '3rem',
                        padding: '3rem',
                    }}
                >
                    <div style={{
                        width: '120px',
                        height: '120px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--primary), #4fd1c5)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '3rem',
                        fontWeight: 800,
                        fontFamily: 'var(--font-heading)',
                        boxShadow: '0 8px 24px var(--primary-glow)'
                    }}>
                        {getInitials(isEditing ? editedData.fullName : profile.fullName)}
                    </div>
                    
                    <div style={{ flex: 1 }}>
                        {isEditing ? (
                            <input 
                                value={editedData.fullName}
                                onChange={(e) => handleInputChange('fullName', e.target.value)}
                                style={{
                                    ...inputStyle,
                                    fontSize: '2.5rem',
                                    fontWeight: 700,
                                    fontFamily: 'var(--font-heading)',
                                    marginBottom: '0.5rem',
                                    color: 'var(--text-heading)',
                                    background: 'rgba(255,255,255,0.5)'
                                }}
                            />
                        ) : (
                            <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: 'var(--text-heading)' }}>{profile.fullName}</h1>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-body)' }}>
                            <Mail size={18} color="var(--primary)" />
                            <span style={{ fontSize: '1.1rem' }}>{auth.currentUser?.email}</span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        {isEditing ? (
                            <>
                                <button 
                                    onClick={handleCancel}
                                    style={{ 
                                        display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 1.5rem',
                                        background: 'rgba(255,255,255,0.5)', color: 'var(--text-body)', border: '1px solid #e2e8f0', borderRadius: '12px'
                                    }}
                                >
                                    <X size={18} />
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="btn-primary" 
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 1.5rem' }}
                                >
                                    {saving ? <Activity className="animate-spin" size={18} /> : <Save size={18} />}
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </>
                        ) : (
                            <button 
                                onClick={handleEditToggle}
                                className="btn-primary" 
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 1.5rem' }}
                            >
                                <Edit3 size={18} />
                                Edit Profile
                            </button>
                        )}
                    </div>
                </motion.div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }}>
                    
                    {/* Left Column: Personal and Medical Details */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        
                        {/* Body Metrics Card */}
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="glass-card"
                            style={{ padding: '2.5rem' }}
                        >
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', fontSize: '1.4rem', color: 'var(--text-heading)' }}>
                                <Activity size={24} color="var(--primary)" />
                                Physiological Profile
                            </h3>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
                                <div style={detailItemStyle}>
                                    <span style={detailLabelStyle}>Age</span>
                                    {isEditing ? (
                                        <input 
                                            type="number"
                                            value={editedData.age}
                                            onChange={(e) => handleInputChange('age', parseInt(e.target.value))}
                                            style={inputStyle}
                                        />
                                    ) : (
                                        <span style={detailValueStyle}>{profile.age} <span style={{fontSize: '0.9rem', fontWeight: 400, color: 'var(--text-body)'}}>yrs</span></span>
                                    )}
                                </div>
                                <div style={detailItemStyle}>
                                    <span style={detailLabelStyle}>Gender</span>
                                    {isEditing ? (
                                        <select 
                                            value={editedData.gender}
                                            onChange={(e) => handleInputChange('gender', e.target.value)}
                                            style={{ ...inputStyle, appearance: 'none' }}
                                        >
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Non-binary">Non-binary</option>
                                            <option value="Prefer not to say">Prefer not to say</option>
                                        </select>
                                    ) : (
                                        <span style={detailValueStyle}>{profile.gender}</span>
                                    )}
                                </div>
                                <div style={detailItemStyle}>
                                    <span style={detailLabelStyle}>Height</span>
                                    {isEditing ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <input 
                                                type="number"
                                                value={editedData.height}
                                                onChange={(e) => handleInputChange('height', parseFloat(e.target.value))}
                                                style={inputStyle}
                                            />
                                            <span style={{ fontSize: '0.9rem' }}>cm</span>
                                        </div>
                                    ) : (
                                        <span style={detailValueStyle}>{profile.height} <span style={{fontSize: '0.9rem', fontWeight: 400, color: 'var(--text-body)'}}>cm</span></span>
                                    )}
                                </div>
                                <div style={detailItemStyle}>
                                    <span style={detailLabelStyle}>Weight</span>
                                    {isEditing ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <input 
                                                type="number"
                                                value={editedData.weight}
                                                onChange={(e) => handleInputChange('weight', parseFloat(e.target.value))}
                                                style={inputStyle}
                                            />
                                            <span style={{ fontSize: '0.9rem' }}>kg</span>
                                        </div>
                                    ) : (
                                        <span style={detailValueStyle} >{profile.weight} <span style={{fontSize: '0.9rem', fontWeight: 400, color: 'var(--text-body)'}}>kg</span></span>
                                    )}
                                </div>
                                <div style={{ ...detailItemStyle, gridColumn: 'span 2', background: 'var(--primary-muted)', padding: '1.25rem', borderRadius: '16px', border: '1px solid rgba(0, 201, 167, 0.1)' }}>
                                    <span style={detailLabelStyle}>Body Mass Index (BMI)</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <span style={{ ...detailValueStyle, color: bmiCat.color }}>{isEditing ? currentBmi : profile.bmi}</span>
                                        <span style={{ 
                                            fontSize: '0.75rem', 
                                            padding: '0.3rem 0.8rem', 
                                            borderRadius: '20px', 
                                            background: 'white', 
                                            color: bmiCat.color,
                                            fontWeight: 700,
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                            textTransform: 'uppercase'
                                        }}>{bmiCat.label}</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Medical Info Card */}
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="glass-card"
                            style={{ padding: '2.5rem' }}
                        >
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', fontSize: '1.4rem', color: 'var(--text-heading)' }}>
                                <Brain size={24} color="var(--primary)" />
                                Clinical Information
                            </h3>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                <div>
                                    <span style={detailLabelStyle}>Existing Diagnoses</span>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '0.75rem' }}>
                                        {isEditing ? (
                                            DIAGNOSIS_OPTIONS.map(d => {
                                                const isSelected = editedData.diagnoses?.includes(d);
                                                return (
                                                    <button
                                                        key={d}
                                                        type="button"
                                                        onClick={() => toggleDiagnosis(d)}
                                                        style={{
                                                            padding: '0.5rem 1rem',
                                                            background: isSelected ? 'var(--primary)' : 'rgba(255,255,255,0.5)',
                                                            border: `1px solid ${isSelected ? 'var(--primary)' : '#e2e8f0'}`,
                                                            borderRadius: '20px',
                                                            fontSize: '0.85rem',
                                                            color: isSelected ? 'white' : 'var(--text-body)',
                                                            fontWeight: isSelected ? 600 : 400,
                                                            transition: 'all 0.2s ease',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        {d}
                                                    </button>
                                                );
                                            })
                                        ) : (
                                            profile.diagnoses?.map(d => (
                                                <span key={d} style={{ 
                                                    padding: '0.5rem 1rem', 
                                                    background: 'var(--primary-muted)', 
                                                    border: '1px solid rgba(0, 201, 167, 0.2)', 
                                                    borderRadius: '20px',
                                                    fontSize: '0.85rem',
                                                    color: 'var(--primary)',
                                                    fontWeight: 600
                                                }}>{d}</span>
                                            ))
                                        )}
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                    <div style={detailItemStyle}>
                                        <span style={detailLabelStyle}>Family History</span>
                                        {isEditing ? (
                                            <select 
                                                value={editedData.familyHistory ? 'Yes' : 'No'}
                                                onChange={(e) => handleInputChange('familyHistory', e.target.value === 'Yes')}
                                                style={{ ...inputStyle, appearance: 'none' }}
                                            >
                                                <option value="Yes">Positive</option>
                                                <option value="No">None Reported</option>
                                            </select>
                                        ) : (
                                            <span style={detailValueStyle}>{profile.familyHistory ? 'Positive' : 'None Reported'}</span>
                                        )}
                                    </div>
                                    <div style={detailItemStyle}>
                                        <span style={detailLabelStyle}>Verification Status</span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
                                            <ShieldCheck size={20} />
                                            <span style={{ fontWeight: 700, fontSize: '1rem' }}>Clinical Profile Verified</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <span style={detailLabelStyle}>Current Medications</span>
                                    {isEditing ? (
                                        <textarea 
                                            value={editedData.medications || ''}
                                            onChange={(e) => handleInputChange('medications', e.target.value)}
                                            style={{ 
                                                ...inputStyle, 
                                                marginTop: '0.75rem', 
                                                minHeight: '100px', 
                                                resize: 'vertical',
                                                fontFamily: 'inherit',
                                                background: 'rgba(255,255,255,0.5)'
                                            }}
                                            placeholder="List any ongoing medical treatments..."
                                        />
                                    ) : (
                                        <p style={{ 
                                            color: 'var(--text-body)', 
                                            fontSize: '1rem', 
                                            marginTop: '0.75rem',
                                            fontStyle: profile.medications ? 'normal' : 'italic',
                                            background: 'rgba(255,255,255,0.3)',
                                            padding: '1.25rem',
                                            borderRadius: '12px',
                                            border: '1px solid rgba(226, 232, 240, 0.5)',
                                            lineHeight: '1.6'
                                        }}>
                                            {profile.medications || "No medications listed in clinical record."}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column: Screening History */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="glass-card"
                            style={{ height: '100%', padding: '2.5rem', display: 'flex', flexDirection: 'column' }}
                        >
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', fontSize: '1.4rem', color: 'var(--text-heading)' }}>
                                <Clock size={24} color="var(--primary)" />
                                Recent Activity
                            </h3>
                            
                            {history.length === 0 ? (
                                <div style={{ 
                                    flex: 1, 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    gap: '1.5rem',
                                    border: '2px dashed #e2e8f0',
                                    borderRadius: '20px',
                                    padding: '3rem',
                                    textAlign: 'center'
                                }}>
                                    <div style={{ padding: '1.5rem', background: 'var(--primary-muted)', borderRadius: '50%' }}>
                                        <Activity size={40} color="var(--primary)" style={{ opacity: 0.5 }} />
                                    </div>
                                    <div>
                                        <p style={{ color: 'var(--text-heading)', fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem' }}>Empty Screening Log</p>
                                        <p style={{ color: 'var(--text-body)', fontSize: '0.95rem' }}>Your clinical screening events will appear here once you begin testing.</p>
                                    </div>
                                    <button 
                                        onClick={() => navigate('/dashboard')}
                                        disabled={isEditing}
                                        style={{ 
                                            marginTop: '1rem',
                                            background: 'none',
                                            color: isEditing ? '#cbd5e0' : 'var(--primary)',
                                            fontSize: '1rem',
                                            fontWeight: 600,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            border: 'none',
                                            cursor: isEditing ? 'default' : 'pointer'
                                        }}
                                    >
                                        Initiate Screening <ChevronRight size={18} />
                                    </button>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                    {history.map(item => (
                                        <div key={item.id} style={{ 
                                            padding: '1.25rem', 
                                            background: 'rgba(255, 255, 255, 0.4)', 
                                            borderRadius: '16px', 
                                            border: '1px solid rgba(226, 232, 240, 0.5)',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            transition: 'transform 0.2s ease'
                                        }}
                                        className="history-row"
                                        >
                                            <div>
                                                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-heading)' }}>{item.condition}</div>
                                                <div style={{ fontSize: '0.85rem', color: 'var(--text-body)', marginTop: '0.25rem' }}>{item.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                                            </div>
                                            <div style={{
                                                fontSize: '0.8rem',
                                                padding: '0.4rem 1rem',
                                                borderRadius: '20px',
                                                background: 'white',
                                                color: 'var(--primary)',
                                                border: '1px solid var(--primary-muted)',
                                                fontWeight: 700,
                                                boxShadow: '0 2px 8px rgba(0, 201, 167, 0.1)'
                                            }}>{item.result}</div>
                                        </div>
                                    ))}
                                    <button 
                                        onClick={() => navigate('/screenings')}
                                        style={{ 
                                            marginTop: '1.5rem',
                                            padding: '1rem',
                                            background: 'var(--primary)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '12px',
                                            fontSize: '1rem',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            transition: 'var(--transition-smooth)',
                                            boxShadow: '0 4px 12px var(--primary-glow)'
                                        }}
                                        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                    >
                                        View Full Screening History
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </div>

                </div>
            </div>
        </div>
    );
};

// Styles
const detailItemStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
};

const detailLabelStyle = {
    fontSize: '0.8rem',
    fontWeight: 700,
    color: 'var(--text-body)',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    opacity: 0.7
};

const detailValueStyle = {
    fontSize: '1.25rem',
    fontWeight: 800,
    color: 'var(--text-heading)',
    fontFamily: 'var(--font-heading)'
};

const inputStyle = {
    background: 'rgba(255, 255, 255, 0.8)',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    color: 'var(--text-heading)',
    fontSize: '1rem',
    padding: '0.6rem 0.8rem',
    outline: 'none',
    width: '100%',
    transition: 'all 0.2s',
    fontFamily: 'var(--font-primary)'
};

export default Profile;
