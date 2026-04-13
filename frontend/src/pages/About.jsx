import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Brain, Activity, Zap } from 'lucide-react';

const conditions = [
  {
    title: 'Parkinson\'s',
    description: 'A progressive disorder of the nervous system that affects movement. It develops gradually, sometimes starting with a barely noticeable tremor in just one hand. The disorder also commonly causes stiffness or slowing of movement.',
    icon: <Activity size={24} />,
    color: '#00C9A7',
    bg: 'rgba(0, 201, 167, 0.08)',
    borderBg: 'rgba(0, 201, 167, 0.15)'
  },
  {
    title: 'Alzheimer\'s',
    description: 'A progressive disease that destroys memory and other important mental functions. It is the most common cause of dementia, a general term for memory loss and other cognitive abilities serious enough to interfere with daily life.',
    icon: <Brain size={24} />,
    color: '#A855F7',
    bg: 'rgba(168, 85, 247, 0.08)',
    borderBg: 'rgba(168, 85, 247, 0.15)'
  },
  {
    title: 'Epilepsy',
    description: 'A neurological disorder marked by sudden recurrent episodes of sensory disturbance, loss of consciousness, or convulsions, associated with abnormal electrical activity in the brain.',
    icon: <Zap size={24} />,
    color: '#F59E0B',
    bg: 'rgba(245, 158, 11, 0.08)',
    borderBg: 'rgba(245, 158, 11, 0.15)'
  },
  {
    title: 'Multiple Sclerosis',
    description: 'A chronic disease involving damage to the sheaths of nerve cells in the brain and spinal cord, whose symptoms may include numbness, impairment of speech and of muscular coordination, blurred vision, and severe fatigue.',
    icon: <Shield size={24} />,
    color: '#3B82F6',
    bg: 'rgba(59, 130, 246, 0.08)',
    borderBg: 'rgba(59, 130, 246, 0.15)'
  }
];

const About = () => {

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 80px)',
      padding: '6rem 2rem'
    }}>
      <div className="container" style={{ maxWidth: '1000px' }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', marginBottom: '5rem' }}
        >
          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '3.5rem',
            fontWeight: 800,
            marginBottom: '1.5rem',
            letterSpacing: '-1.5px',
            color: 'var(--text-heading)'
          }}>
            About <span style={{ color: 'var(--primary)' }}>NeuroScreen</span>
          </h1>
          <p style={{
            fontSize: '1.25rem',
            color: 'var(--text-body)',
            lineHeight: 1.8,
            maxWidth: '750px',
            margin: '0 auto'
          }}>
            NeuroScreen is a cutting-edge clinical assessment platform designed to provide early screening and monitoring for major neurological conditions through interactive diagnostic tests.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '2.5rem'
          }}
        >
          {conditions.map((item, index) => (
            <motion.div
              key={item.title}
              variants={itemVariants}
              className="glass-card"
              style={{
                padding: '0',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                borderTop: `4px solid ${item.color}`
              }}
            >
              <div style={{ padding: '2.5rem 3rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '14px',
                  background: item.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '0.5rem',
                  border: `1px solid ${item.borderBg}`
                }}>
                  {React.cloneElement(item.icon, { color: item.color, size: 26 })}
                </div>
                <h3 style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.75rem',
                  fontWeight: 700,
                  color: 'var(--text-heading)'
                }}>
                  {item.title}
                </h3>
                <p style={{
                  color: 'var(--text-body)',
                  lineHeight: 1.8,
                  fontSize: '1.05rem'
                }}>
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="glass-card"
          style={{
            marginTop: '6rem',
            textAlign: 'center',
            padding: '4rem',
            background: 'var(--glass-bg)',
            borderColor: 'var(--glass-border)'
          }}
        >
          <div style={{
            width: '80px',
            height: '80px',
            background: 'var(--bg-3)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 2rem',
            boxShadow: '0 10px 25px rgba(0, 201, 167, 0.15)'
          }}>
            <Shield size={40} color="var(--primary)" />
          </div>
          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '2.2rem',
            fontWeight: 800,
            marginBottom: '1.5rem',
            color: 'var(--text-heading)'
          }}>
            Clinical Grade Assessments
          </h2>
          <p style={{
            color: 'var(--text-body)',
            maxWidth: '650px',
            margin: '0 auto',
            lineHeight: 1.8,
            fontSize: '1.1rem'
          }}>
            Our screening modules are built on established clinical protocols to ensure high-fidelity data collection and reporting for healthcare professionals.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default About;
