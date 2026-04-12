import React from 'react';
import { motion } from 'framer-motion';

const ResultGauge = ({ percentage, isLowRisk, color: colorOverride }) => {
    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;
    const color = colorOverride || (isLowRisk ? 'var(--primary)' : 'var(--error)');

    return (
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '180px', height: '180px' }}>
            <svg width="180" height="180" style={{ transform: 'rotate(-90deg)' }}>
                {/* Background Circle */}
                <circle
                    cx="90"
                    cy="90"
                    r={radius}
                    fill="transparent"
                    stroke="rgba(10, 22, 40, 0.05)"
                    strokeWidth="12"
                />
                {/* Progress Circle */}
                <motion.circle
                    cx="90"
                    cy="90"
                    r={radius}
                    fill="transparent"
                    stroke={color}
                    strokeWidth="12"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    strokeLinecap="round"
                />
            </svg>
            <div style={{ position: 'absolute', textAlign: 'center' }}>
                <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-heading)', display: 'block', letterSpacing: '-1px' }}
                >
                    {percentage}%
                </motion.span>
                <span style={{ fontSize: '0.7rem', color: 'var(--slate-500)', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 700 }}>
                    Confidence
                </span>
            </div>
        </div>
    );
};

export default ResultGauge;
