import { useState, useEffect, useRef } from 'react';

const oracleResponses = [
  "The answer you seek is already moving through you. Be still enough to hear it.",
  "What you call resistance is simply energy that has not yet found its form.",
  "The pattern will reveal itself when you stop trying to see the whole — focus on the single thread.",
  "You are not lost. You are in the space between maps. Trust the terrain of your body.",
  "The fire you are looking for is the fire you are made of.",
  "Release the question. The universe responds to states of being, not interrogations.",
];

const DigitalOracle = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSend = () => {
    if (!input.trim() || isTyping) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);
    setDisplayedText('');

    const response = oracleResponses[Math.floor(Math.random() * oracleResponses.length)];

    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(response.slice(0, i + 1));
      i++;
      if (i >= response.length) {
        clearInterval(interval);
        setMessages(prev => [...prev, { role: 'oracle', text: response }]);
        setIsTyping(false);
        setDisplayedText('');
      }
    }, 30);
  };

  return (
    <>
      {/* Floating sphere */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-8 right-8 w-16 h-16 rounded-full z-50 cursor-pointer animate-float"
          style={{
            background: 'radial-gradient(circle at 30% 30%, hsl(270 76% 65%), hsl(270 76% 40%), hsl(270 76% 25%))',
            animation: 'float 6s ease-in-out infinite, pulse-glow 3s ease-in-out infinite',
          }}
          aria-label="Open Digital Oracle"
        >
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.3), transparent 60%)',
            }}
          />
        </button>
      )}

      {/* Fullscreen Oracle */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center"
          style={{
            background: 'rgba(10, 10, 10, 0.95)',
            backdropFilter: 'blur(40px)',
          }}
        >
          {/* Close */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-8 right-8 font-body text-xs tracking-[0.3em] uppercase text-muted-foreground hover:text-foreground transition-colors"
          >
            Close
          </button>

          <div className="w-full max-w-2xl px-6 flex flex-col items-center">
            <p className="font-body text-[10px] tracking-[0.4em] uppercase text-accent mb-4">
              Digital Oracle
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-light italic mb-12 text-center">
              Ask, and the energy responds
            </h2>

            {/* Messages */}
            <div className="w-full max-h-[40vh] overflow-y-auto mb-8 space-y-6">
              {messages.map((msg, i) => (
                <div key={i} className={msg.role === 'user' ? 'text-right' : 'text-left'}>
                  <p
                    className={`font-body text-sm inline-block max-w-[80%] ${
                      msg.role === 'user'
                        ? 'text-muted-foreground'
                        : 'text-foreground italic'
                    }`}
                  >
                    {msg.text}
                  </p>
                </div>
              ))}

              {isTyping && (
                <div className="text-left">
                  <p className="font-body text-sm text-foreground italic">
                    {displayedText}
                    <span className="inline-block w-px h-4 bg-accent ml-1 animate-pulse" />
                  </p>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="w-full relative">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Speak your question into the void..."
                className="w-full bg-transparent border-b border-muted-foreground/30 pb-3 font-body text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-accent transition-colors"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DigitalOracle;
