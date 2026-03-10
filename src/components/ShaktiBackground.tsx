const ShaktiBackground = () => {
  return (
    <>
      <div className="noise-overlay" />
      
      {/* Primary saffron glow - top left */}
      <div
        className="fixed top-[-20%] left-[-10%] w-[70vw] h-[70vh] rounded-full animate-breathe pointer-events-none z-0"
        style={{
          background: 'radial-gradient(ellipse at center, hsl(30 100% 60% / 0.3), hsl(12 60% 34% / 0.15), transparent 70%)',
        }}
      />
      
      {/* Secondary umber glow - bottom right */}
      <div
        className="fixed bottom-[-20%] right-[-10%] w-[60vw] h-[60vh] rounded-full animate-breathe pointer-events-none z-0"
        style={{
          background: 'radial-gradient(ellipse at center, hsl(12 60% 34% / 0.25), hsl(30 100% 60% / 0.1), transparent 70%)',
          animationDelay: '4s',
        }}
      />
      
      {/* Violet accent glow - center bottom */}
      <div
        className="fixed bottom-[10%] left-[40%] w-[30vw] h-[30vh] rounded-full animate-breathe pointer-events-none z-0"
        style={{
          background: 'radial-gradient(ellipse at center, hsl(270 76% 53% / 0.1), transparent 70%)',
          animationDelay: '2s',
        }}
      />
    </>
  );
};

export default ShaktiBackground;
