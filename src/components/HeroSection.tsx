const HeroSection = () => {
  return (
    <div className="glass-tile col-span-12 md:col-span-8 row-span-2 p-8 md:p-12 relative overflow-hidden min-h-[400px] flex flex-col justify-end">
      {/* Inner gradient glow */}
      <div
        className="absolute inset-0 animate-breathe pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 30% 70%, hsl(30 100% 60% / 0.15), transparent 60%)',
        }}
      />
      
      <div className="relative z-10">
        <p className="font-body text-xs tracking-[0.3em] uppercase text-muted-foreground mb-6">
          Creative Energy · Embodied Practice
        </p>
        
        <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-light leading-[0.9] tracking-tight mb-6">
          <span className="italic">Shakti</span>
          <br />
          <span className="text-3xl md:text-4xl lg:text-5xl font-light opacity-70">
            flows through the silence
          </span>
        </h1>
        
        <p className="font-body text-sm md:text-base max-w-lg text-muted-foreground leading-relaxed">
          I am a vessel for creative energy — weaving movement, sound, and stillness 
          into a practice that bridges the ancient and the infinite. This is not a portfolio. 
          It is a living record.
        </p>
      </div>
    </div>
  );
};

export default HeroSection;
