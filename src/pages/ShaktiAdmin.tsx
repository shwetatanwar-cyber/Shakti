import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LogOut } from 'lucide-react';
import { Session } from '@supabase/supabase-js';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import RitualMode from '@/components/admin/RitualMode';
import ManifestMode from '@/components/admin/ManifestMode';

type Mode = 'ritual' | 'manifest';

const ShaktiAdmin = () => {
  const [mode, setMode] = useState<Mode>('ritual');
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="font-body text-xs tracking-[0.3em] uppercase text-muted-foreground"
        >
          Loading...
        </motion.div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-sm"
        >
          <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <p className="font-body text-[10px] tracking-[0.4em] uppercase text-muted-foreground mb-3">
                Private Access
              </p>
              <h1 className="font-display text-2xl text-foreground">Shakti Switchboard</h1>
            </div>
            <Auth
              supabaseClient={supabase}
              appearance={{
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: 'hsl(30, 100%, 60%)',
                      brandAccent: 'hsl(270, 76%, 53%)',
                      inputBackground: 'hsl(0, 0%, 8%)',
                      inputText: 'hsl(38, 30%, 90%)',
                      inputBorder: 'hsla(0, 0%, 100%, 0.1)',
                      inputBorderFocus: 'hsl(270, 76%, 53%)',
                      inputBorderHover: 'hsla(0, 0%, 100%, 0.2)',
                      inputPlaceholder: 'hsl(38, 15%, 55%)',
                      messageText: 'hsl(38, 30%, 90%)',
                      anchorTextColor: 'hsl(30, 100%, 60%)',
                      anchorTextHoverColor: 'hsl(270, 76%, 53%)',
                    },
                    borderWidths: { buttonBorderWidth: '0px', inputBorderWidth: '1px' },
                    radii: { borderRadiusButton: '0.75rem', inputBorderRadius: '0.75rem' },
                    fonts: { bodyFontFamily: 'Space Grotesk, sans-serif', inputFontFamily: 'Space Grotesk, sans-serif' },
                  },
                },
                className: {
                  button: '!bg-primary !text-primary-foreground hover:!opacity-90 !font-body !text-xs !tracking-[0.15em] !uppercase !py-3',
                  input: '!bg-card !text-foreground !font-body !text-sm',
                  label: '!font-body !text-xs !tracking-[0.15em] !uppercase !text-muted-foreground',
                  anchor: '!font-body !text-xs',
                  message: '!font-body !text-xs',
                },
              }}
              providers={[]}
              redirectTo={window.location.origin + '/shakti-admin'}
            />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-5 py-10 md:py-16">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6 relative"
        >
          <button
            onClick={handleLogout}
            className="absolute right-0 top-0 p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-all duration-300"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
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
