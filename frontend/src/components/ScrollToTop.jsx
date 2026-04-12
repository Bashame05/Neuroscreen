import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

const ScrollToTop = () => {
    const [isVisible, setIsVisible] = useState(false);

    // Show button when page is scrolled down
    const toggleVisibility = () => {
        if (window.pageYOffset > 300) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    };

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    useEffect(() => {
        window.addEventListener('scroll', toggleVisibility, { passive: true });
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    const buttonElement = (
        <AnimatePresence>
            {isVisible && (
                <motion.button
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 20 }}
                    whileHover={{ scale: 1.1, y: -5 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={scrollToTop}
                    title="Go to Top"
                    style={{
                        position: 'fixed',
                        bottom: '30px',
                        right: '30px',
                        width: '56px',
                        height: '56px',
                        borderRadius: '16px',
                        background: 'rgba(10, 22, 40, 0.85)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(0, 201, 167, 0.4)',
                        color: 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        zIndex: 9999,
                        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3), 0 0 20px rgba(0, 201, 167, 0.2)',
                        outline: 'none',
                        transition: 'border-color 0.3s, background 0.3s'
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.borderColor = 'var(--primary)';
                        e.currentTarget.style.background = 'rgba(10, 22, 40, 0.95)';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(0, 201, 167, 0.4)';
                        e.currentTarget.style.background = 'rgba(10, 22, 40, 0.85)';
                    }}
                >
                    <ArrowUp size={28} strokeWidth={2.5} />
                </motion.button>
            )}
        </AnimatePresence>
    );

    return createPortal(buttonElement, document.body);
};

export default ScrollToTop;

