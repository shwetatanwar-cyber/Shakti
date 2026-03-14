import { useState } from 'react';
import { motion } from 'framer-motion';
import RitualMode from '@/components/admin/RitualMode';
import ManifestMode from '@/components/admin/ManifestMode';

type Mode = 'ritual' | 'manifest';

const ShaktiAdmin = () => {
  const [mode, setMode] = useState<Mode>('ritual');

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-5 py-10 md:py-16">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6"
        >
          <p className="font-body text-[10px] tracking-[0.4em] uppercase text-muted-foreground mb-2">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <h1 className="font-display text-3xl md:text-4xl text-foreground">Shakti Switchboard</h1>
        </motion.header>

        {/* Sticky Segmented Control */}
        <div className="sticky top-0 z-50 py-3 bg-background/80 backdrop-blur-xl">
          <div className="flex rounded-xl border border-border bg-muted/40 backdrop-blur-sm p-1">
            {([
              { key: 'ritual' as Mode, label: 'Ritual' },
              { key: 'manifest' as Mode, label: 'Manifest' },
            ]).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setMode(key)}
                className={`flex-1 py-2.5 rounded-lg font-body text-xs tracking-[0.2em] uppercase transition-all duration-300 ${
                  mode === key
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Mode Content */}
        <div className="mt-8">
          {mode === 'ritual' ? <RitualMode /> : <ManifestMode />}
        </div>
      </div>
    </div>
  );
};

export default ShaktiAdmin;
