import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Activity, LogOut, User, ChevronDown, Menu, X, Sun, Moon } from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';

const Navbar = ({ theme, toggleTheme }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                try {
                    const profileSnap = await getDoc(doc(db, 'users', currentUser.uid));
                    if (profileSnap.exists()) {
                        setProfile(profileSnap.data());
                    }
                } catch (err) {
                    console.error("Error fetching navbar profile:", err);
                }
            } else {
                setProfile(null);
            }
        });

        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            unsubscribe();
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = async () => {
        setIsDropdownOpen(false);
        setIsMobileMenuOpen(false);
        await signOut(auth);
        navigate('/');
    };

    const getInitials = (name) => {
        if (!name) return '?';
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    const navLinks = [
        { name: 'Dashboard', path: '/dashboard' },
        { name: 'Screenings', path: '/screenings' },
        { name: 'About', path: '/about' },
        { name: 'Get Help', path: '/help' },
        { name: 'Feedback', path: '/feedback' }
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <nav style={{
            padding: '0.75rem 2rem',
            borderBottom: '1px solid var(--glass-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            backgroundColor: 'var(--navbar-bg)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            zIndex: 1000,
            height: '74px',
            transition: 'var(--transition-smooth)'
        }}>
            {/* Left Group: Logo + Desktop Links */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
                <Link to={user ? "/dashboard" : "/"} className="flex items-center" style={{ textDecoration: 'none', gap: '0.75rem' }}>
                    <Activity size={32} color="var(--primary)" />
                    <span style={{
                        fontFamily: 'var(--font-heading)',
                        fontSize: '1.4rem',
                        fontWeight: 800,
                        color: 'var(--text-heading)',
                        letterSpacing: '-0.5px'
                    }}>
                        Neuro<span style={{ color: 'var(--primary)' }}>Screen</span>
                    </span>
                </Link>

                {/* Links (Desktop) - Now on Left */}
                {user && (
                    <div className="desktop-menu" style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                        {navLinks.map((link) => (
                            <Link 
                                key={link.path} 
                                to={link.path} 
                                style={{ 
                                    color: isActive(link.path) ? 'var(--primary)' : 'var(--text-body)', 
                                    textDecoration: 'none', 
                                    fontSize: '0.95rem',
                                    fontWeight: isActive(link.path) ? 700 : 500,
                                    transition: 'all 0.2s ease',
                                    position: 'relative',
                                    display: 'block',
                                    borderBottom: isActive(link.path) ? '2.5px solid var(--primary)' : '2.5px solid transparent',
                                    paddingBottom: '4px'
                                }}
                                onMouseEnter={(e) => { if (!isActive(link.path)) e.target.style.color = 'var(--text-heading)'; }}
                                onMouseLeave={(e) => { if (!isActive(link.path)) e.target.style.color = 'var(--text-body)'; }}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* Right side: Laptop/Desktop Avatar Group */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {/* Global Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    style={{
                        background: 'var(--glass-bg)',
                        border: '1px solid var(--glass-border)',
                        width: '40px',
                        height: '40px',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--primary)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={theme}
                            initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
                            animate={{ opacity: 1, rotate: 0, scale: 1 }}
                            exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
                            transition={{ duration: 0.2 }}
                        >
                            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                        </motion.div>
                    </AnimatePresence>
                </button>

                {user ? (
                    <div className="flex items-center" style={{ gap: '1rem' }}>
                        {/* Desktop Avatar */}
                        <div style={{ position: 'relative' }} ref={dropdownRef} className="desktop-avatar">
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.6rem',
                                    background: 'rgba(0, 201, 167, 0.05)',
                                    border: `1px solid ${isDropdownOpen ? 'var(--primary)' : 'rgba(0, 201, 167, 0.1)'}`,
                                    padding: '0.35rem 0.5rem',
                                    borderRadius: '30px',
                                    color: 'var(--text-heading)',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    background: 'var(--primary)',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 700,
                                    fontSize: '0.85rem',
                                    fontFamily: 'var(--font-heading)'
                                }}>
                                    {getInitials(profile?.fullName)}
                                </div>
                                <ChevronDown size={16} style={{ 
                                    transform: isDropdownOpen ? 'rotate(180deg)' : 'none',
                                    transition: 'transform 0.3s',
                                    color: isDropdownOpen ? 'var(--primary)' : 'var(--text-body)'
                                }} />
                            </button>

                            <AnimatePresence>
                                {isDropdownOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        style={{
                                            position: 'absolute',
                                            top: '125%',
                                            right: 0,
                                            width: '240px',
                                            background: 'var(--glass-bg)',
                                            border: '1px solid var(--glass-border)',
                                            borderRadius: '16px',
                                            padding: '0.75rem',
                                            boxShadow: 'var(--glass-shadow)',
                                            backdropFilter: 'blur(20px)',
                                            zIndex: 1001
                                        }}
                                    >
                                        <div style={{ 
                                            padding: '0.75rem', 
                                            borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                                            marginBottom: '0.5rem'
                                        }}>
                                            <div style={{ color: 'var(--text-heading)', fontSize: '0.95rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {profile?.fullName || 'User'}
                                            </div>
                                            <div style={{ color: 'var(--text-body)', fontSize: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {user.email}
                                            </div>
                                        </div>

                                        <Link 
                                            to="/profile" 
                                            onClick={() => setIsDropdownOpen(false)}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.75rem',
                                                padding: '0.75rem',
                                                color: 'var(--text-body)',
                                                textDecoration: 'none',
                                                fontSize: '0.9rem',
                                                borderRadius: '10px',
                                                transition: 'all 0.2s ease',
                                                fontWeight: 500
                                            }}
                                            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0, 201, 167, 0.08)'; e.currentTarget.style.color = 'var(--primary)'; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-body)'; }}
                                        >
                                            <User size={16} />
                                            Profile
                                        </Link>

                                        <button
                                            onClick={handleLogout}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.75rem',
                                                padding: '0.7rem 0.75rem',
                                                color: '#ff5050',
                                                background: 'transparent',
                                                border: 'none',
                                                width: '100%',
                                                textAlign: 'left',
                                                fontSize: '0.85rem',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease',
                                                marginTop: '4px'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 80, 80, 0.05)'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <LogOut size={16} />
                                            Logout
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Mobile Hamburger */}
                        <button 
                            className="mobile-toggle"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            style={{
                                display: 'none',
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--primary)',
                                cursor: 'pointer',
                                padding: '0.5rem'
                            }}
                        >
                            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                        </button>
                    </div>
                ) : (
                    <Link 
                        to="/login"
                        className="btn-primary"
                        style={{
                            padding: '0.5rem 1.5rem',
                            textDecoration: 'none',
                            fontSize: '0.9rem',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >
                        Login
                    </Link>
                )}
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: '100%' }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: '100%' }}
                        transition={{ type: 'tween', duration: 0.3 }}
                        style={{
                            position: 'fixed',
                            top: '74px',
                            left: 0,
                            width: '100%',
                            height: 'calc(100vh - 74px)',
                            background: 'var(--navbar-bg)',
                            backdropFilter: 'blur(20px)',
                            WebkitBackdropFilter: 'blur(20px)',
                            zIndex: 999,
                            padding: '2rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1.5rem',
                            borderTop: '1px solid var(--glass-border)'
                        }}
                    >
                        {navLinks.map((link) => (
                            <Link 
                                key={link.path} 
                                to={link.path} 
                                onClick={() => setIsMobileMenuOpen(false)}
                                style={{ 
                                    color: isActive(link.path) ? 'var(--primary)' : 'var(--text-heading)', 
                                    textDecoration: 'none', 
                                    fontSize: '1.5rem',
                                    fontWeight: 700,
                                    borderLeft: isActive(link.path) ? '4px solid var(--primary)' : 'none',
                                    paddingLeft: isActive(link.path) ? '1rem' : '0'
                                }}
                            >
                                {link.name}
                            </Link>
                        ))}
                        <div style={{ height: '1px', background: 'rgba(100, 255, 218, 0.1)', margin: '1rem 0' }} />
                        <Link 
                            to="/profile" 
                            onClick={() => setIsMobileMenuOpen(false)}
                            style={{ color: 'var(--text-heading)', textDecoration: 'none', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
                        >
                            <User size={20} color="var(--primary)" /> Profile
                        </Link>
                        <button 
                            onClick={handleLogout}
                            style={{ 
                                color: '#ff5050', 
                                background: 'transparent', 
                                border: 'none', 
                                fontSize: '1.2rem', 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '0.75rem',
                                textAlign: 'left',
                                padding: 0,
                                cursor: 'pointer'
                            }}
                        >
                            <LogOut size={20} /> Logout
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <style dangerouslySetInnerHTML={{ __html: `
                @media (max-width: 768px) {
                    .desktop-menu, .desktop-avatar {
                        display: none !important;
                    }
                    .mobile-toggle {
                        display: block !important;
                    }
                }
            `}} />
        </nav>
    );
};

export default Navbar;
