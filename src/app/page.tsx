'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import LandingPage from '@/components/LandingPage';
import { Dashboard } from '@/components/Dashboard';

// ═══════════════════════════════════════════════
// ROOT PAGE — Landing ↔ Dashboard State Manager
// ═══════════════════════════════════════════════
export default function AegisPage() {
  const [view, setView] = useState<'landing' | 'dashboard'>('landing');

  return (
    <AnimatePresence mode="wait">
      {view === 'landing' ? (
        <motion.div
          key="landing"
          initial={{ opacity: 0, filter: 'blur(8px)', x: -20 }}
          animate={{ opacity: 1, filter: 'blur(0px)', x: 0 }}
          exit={{ opacity: 0, filter: 'blur(8px)', x: -20 }}
          transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
        >
          <LandingPage onEnterDashboard={() => setView('dashboard')} />
        </motion.div>
      ) : (
        <motion.div
          key="dashboard"
          initial={{ opacity: 0, filter: 'blur(8px)', x: 20 }}
          animate={{ opacity: 1, filter: 'blur(0px)', x: 0 }}
          exit={{ opacity: 0, filter: 'blur(8px)', x: 20 }}
          transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
        >
          <Dashboard onBack={() => setView('landing')} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
