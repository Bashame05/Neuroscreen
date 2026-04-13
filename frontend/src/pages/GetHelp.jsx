import React from 'react';
import { motion } from 'framer-motion';
import { Phone, Globe, Heart, LifeBuoy, Brain, Shield, Info, ExternalLink, Flag, HelpCircle } from 'lucide-react';

const GetHelp = () => {
    const sections = [
        {
            title: "Parkinson's Disease",
            icon: <Brain className="text-cyan" size={40} />,
            international: [
                { name: "Parkinson's Foundation Helpline", contact: "1-800-4PD-INFO (473-4636)", type: "phone" },
                { name: "Michael J. Fox Foundation", contact: "michaeljfox.org", type: "web" },
                { name: "APDA Website", contact: "apdaparkinson.org", type: "web" }
            ],
            india: [
                { name: "PDMDS India", contact: "pdmds.org", type: "web" },
                { name: "iCare Helpline (Toll Free)", contact: "1800-120-1235", type: "phone" }
            ]
        },
        {
            title: "Alzheimer's Disease",
            icon: <Shield className="text-cyan" size={40} />,
            international: [
                { name: "Alzheimer's Association Helpline", contact: "1-800-272-3900", type: "phone" },
                { name: "Alzheimer's Foundation of America", contact: "alzfdn.org", type: "web" }
            ],
            india: [
                { name: "ARDSI India", contact: "ardsi.org", type: "web" },
                { name: "Dementia India Alliance", contact: "dementiaindia.org", type: "web" },
                { name: "Elderline (Service)", contact: "14567", type: "phone" }
            ]
        },
        {
            title: "Multiple Sclerosis (MS)",
            icon: <LifeBuoy className="text-cyan" size={40} />,
            international: [
                { name: "National MS Society Helpline", contact: "1-800-344-4867", type: "phone" },
                { name: "MS Foundation Helpline", contact: "1-888-MS-FOCUS", type: "phone" }
            ],
            india: [
                { name: "MSSI India", contact: "mssocietyindia.org", type: "web" },
                { name: "MSSI Helpline", contact: "044-24343451", type: "phone" }
            ]
        },
        {
            title: "Epilepsy",
            icon: <Info className="text-cyan" size={40} />,
            international: [
                { name: "Epilepsy Foundation Helpline", contact: "1-800-332-1000", type: "phone" },
                { name: "CURE Epilepsy", contact: "cureepilepsy.org", type: "web" }
            ],
            india: [
                { name: "Epilepsy India", contact: "epilepsyindia.org", type: "web" },
                { name: "NIMHANS Bangalore Helpline", contact: "080-46110007", type: "phone" }
            ]
        }
    ];

    const generalInternational = [
        { name: "988 Suicide & Crisis Lifeline", contact: "988 (Call or Text)", type: "phone", extra: "Available 24/7" },
        { name: "Crisis Text Line", contact: "Text HOME to 741741", type: "text", extra: "Free, 24/7 support" }
    ];

    const generalIndia = [
        { name: "iCall (TISS Helpline)", contact: "9152987821", type: "phone", extra: "Psychosocial support" },
        { name: "Vandrevala Foundation", contact: "1860-2662-345", type: "phone", extra: "24/7 Crisis support" },
        { name: "NIMHANS Helpline", contact: "080-46110007", type: "phone", extra: "Psychosocial support" }
    ];

    const ResourceList = ({ items, label }) => (
        <div style={{ padding: '0 1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--cyan)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', whiteSpace: 'nowrap' }}>{label}</span>
                <div style={{ height: '1px', flex: 1, background: 'linear-gradient(90deg, rgba(100, 255, 218, 0.2), transparent)' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {items.map((res, ridx) => (
                    <div key={ridx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', textAlign: 'left' }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ color: 'var(--light-slate)', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                                {res.name}
                            </div>
                            <div style={{ color: 'var(--cyan)', fontSize: '0.95rem', fontWeight: 500, fontFamily: 'monospace', opacity: 0.9 }}>
                                {res.contact}
                            </div>
                        </div>
                        <a
                            href={res.type === 'web' ? `https://${res.contact}` : `tel:${res.contact.replace(/[^\d+]/g, '')}`}
                            target={res.type === 'web' ? '_blank' : '_self'}
                            rel="noreferrer"
                            style={{
                                padding: '0.5rem',
                                borderRadius: '8px',
                                background: 'rgba(100, 255, 218, 0.05)',
                                color: 'var(--cyan)',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                border: '1px solid rgba(100, 255, 218, 0.1)',
                                marginLeft: '1rem'
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(100, 255, 218, 0.15)'; e.currentTarget.style.borderColor = 'var(--cyan)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(100, 255, 218, 0.05)'; e.currentTarget.style.borderColor = 'rgba(100, 255, 218, 0.1)'; }}
                        >
                            {res.type === 'web' ? <Globe size={18} /> : <Phone size={18} />}
                        </a>
                    </div>
                ))}
            </div>
        </div>
    );

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.2 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { 
            y: 0, 
            opacity: 1,
            transition: { duration: 0.5, ease: [0.25, 1, 0.5, 1] }
        }
    };

    return (
        <div style={{ padding: '6rem 2rem', minHeight: 'calc(100vh - 70px)', overflowX: 'hidden' }}>
            <div className="container" style={{ maxWidth: '1200px' }}>
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    style={{ textAlign: 'center', marginBottom: '6rem' }}
                >
                    <h1 style={{ 
                        fontSize: 'clamp(2.5rem, 5vw, 4rem)', 
                        marginBottom: '1.5rem', 
                        color: 'var(--text-heading)',
                        fontWeight: 800,
                        letterSpacing: '-1.5px'
                    }}>
                        Condition-<span style={{ color: 'var(--primary)' }}>Specific</span> Help
                    </h1>
                    <div style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '0.75rem', 
                        padding: '0.75rem 1.75rem', 
                        background: 'var(--primary-muted)', 
                        border: '1px solid rgba(0, 201, 167, 0.1)', 
                        borderRadius: '100px',
                        marginBottom: '2rem'
                    }}>
                        <Flag size={18} color="var(--primary)" />
                        <span style={{ color: 'var(--text-body)', fontSize: '0.9rem', fontWeight: 600, letterSpacing: '0.5px' }}>
                            India & International Support Networks
                        </span>
                    </div>
                    <p style={{ color: 'var(--text-body)', fontSize: '1.25rem', maxWidth: '850px', margin: '0 auto', lineHeight: 1.8 }}>
                        Access curated specialized support services and helplines for chronic neurological conditions. Resources are verified for both global and regional Indian contexts.
                    </p>
                </motion.div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '3rem',
                        marginBottom: '10rem'
                    }}
                    className="condition-grid"
                >
                    {sections.map((section, idx) => (
                        <motion.div
                            key={idx}
                            variants={itemVariants}
                            className="glass-card"
                            style={{ 
                                height: '100%', 
                                padding: '4rem 3rem',
                                textAlign: 'center'
                            }}
                        >
                            <div style={{ 
                                marginBottom: '3rem',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center'
                            }}>
                                <div style={{ 
                                    padding: '1.75rem', 
                                    background: 'var(--primary-muted)', 
                                    borderRadius: '50%',
                                    border: '1px solid rgba(0, 201, 167, 0.1)',
                                    marginBottom: '2rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 8px 32px rgba(0, 201, 167, 0.08)'
                                }}>
                                    {React.cloneElement(section.icon, { color: 'var(--primary)', size: 40 })}
                                </div>
                                <h2 style={{ 
                                    fontSize: '2.2rem', 
                                    color: 'var(--text-heading)',
                                    fontWeight: 800,
                                    letterSpacing: '-0.5px',
                                    marginBottom: '0.75rem'
                                }}>
                                    {section.title}
                                </h2>
                                <div style={{ width: '50px', height: '4px', background: 'var(--primary)', borderRadius: '2px', opacity: 0.3 }} />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '3.5rem', flex: 1 }}>
                                <ResourceList items={section.international} label="International" />
                                <ResourceList items={section.india} label="India Support" />
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Mental Health Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="glass-card"
                    style={{
                        padding: '6rem 4rem',
                        textAlign: 'center',
                        background: 'linear-gradient(180deg, var(--primary-muted) 0%, var(--glass-bg) 100%)',
                        borderColor: 'var(--glass-border)'
                    }}
                >
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2.5rem' }}>
                            <div style={{ 
                                padding: '1.5rem', 
                                background: 'var(--bg-3)', 
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px solid var(--primary)',
                                boxShadow: '0 10px 25px rgba(0, 201, 167, 0.2)'
                            }}>
                                <Heart size={44} color="var(--primary)" fill="var(--primary)" fillOpacity={0.1} />
                            </div>
                        </div>
                        <h2 style={{ fontSize: '3rem', marginBottom: '1.5rem', color: 'var(--text-heading)', fontWeight: 800, letterSpacing: '-1px' }}>Mental Health & Crisis Support</h2>
                        <p style={{ color: 'var(--text-body)', marginBottom: '5rem', fontSize: '1.25rem', maxWidth: '800px', margin: '0 auto 5rem', lineHeight: 1.8 }}>
                            If you are in immediate distress or need urgent talk-support, please reach out directly to these free, confidential crisis services. 
                        </p>

                        <div className="mental-health-grid" style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: '3rem',
                            textAlign: 'left'
                        }}>
                            <div style={{ background: 'var(--bg-3)', padding: '3rem', borderRadius: '24px', border: '1px solid var(--input-border)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                                <h3 style={{ fontSize: '0.85rem', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '2.5px', marginBottom: '2.5rem', fontWeight: 800 }}>Global Networks</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                    {generalInternational.map((res, idx) => (
                                        <div key={idx} style={{ paddingBottom: '2rem', borderBottom: '1px solid var(--glass-border)' }}>
                                            <div style={{ color: 'var(--text-heading)', fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>{res.contact}</div>
                                            <div style={{ color: 'var(--primary)', fontSize: '1rem', fontWeight: 700 }}>{res.name}</div>
                                            <div style={{ color: 'var(--text-body)', fontSize: '0.9rem', marginTop: '0.5rem' }}>{res.extra}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div style={{ background: 'var(--bg-3)', padding: '3rem', borderRadius: '24px', border: '1px solid var(--input-border)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                                <h3 style={{ fontSize: '0.85rem', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '2.5px', marginBottom: '2.5rem', fontWeight: 800 }}>India Helplines</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                    {generalIndia.map((res, idx) => (
                                        <div key={idx} style={{ paddingBottom: '2rem', borderBottom: '1px solid var(--glass-border)' }}>
                                            <div style={{ color: 'var(--text-heading)', fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.4rem' }}>{res.contact}</div>
                                            <div style={{ color: 'var(--primary)', fontSize: '1rem', fontWeight: 700 }}>{res.name}</div>
                                            <div style={{ color: 'var(--text-body)', fontSize: '0.9rem', marginTop: '0.4rem' }}>{res.extra}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                @media (max-width: 1024px) {
                    .condition-grid {
                        grid-template-columns: 1fr !important;
                        gap: 2rem !important;
                    }
                    .mental-health-grid {
                        grid-template-columns: 1fr !important;
                        gap: 2rem !important;
                    }
                }
                @media (max-width: 600px) {
                    h1 { font-size: 2.2rem !important; }
                    .glass-card { padding: 3rem 1.5rem !important; }
                    h2 { font-size: 1.6rem !important; }
                }
            `}} />
        </div>
    );
};

export default GetHelp;
