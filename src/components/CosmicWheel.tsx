import { useId } from 'react';

/**
 * CosmicWheel — animated SVG of a Vedic time wheel.
 * Concentric rings rotate at different speeds, blending with the page
 * via low opacity + screen blend, with glowing geometric overlays.
 */
const CosmicWheel = ({ className = '' }: { className?: string }) => {
  const gid = useId().replace(/:/g, '');

  // 27 nakshatras
  const nakshatras = Array.from({ length: 27 }, (_, i) => i);
  // 12 houses / rashis
  const houses = Array.from({ length: 12 }, (_, i) => i);
  // Sanskrit numerals (using Devanagari digits 0-9)
  const devNumerals = ['०','१','२','३','४','५','६','७','८','९'];

  return (
    <div className={`relative w-full aspect-square ${className}`}>
      {/* Outer radial glow */}
      <div
        className="absolute inset-0 rounded-full blur-3xl opacity-50 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, hsl(var(--violet)/0.5), hsl(var(--saffron)/0.25) 45%, transparent 70%)',
          animation: 'breathe 8s ease-in-out infinite',
        }}
      />

      <svg
        viewBox="0 0 600 600"
        className="relative w-full h-full"
        style={{ mixBlendMode: 'screen' }}
        aria-hidden="true"
      >
        <defs>
          <radialGradient id={`core-${gid}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsl(var(--saffron))" stopOpacity="0.9" />
            <stop offset="40%" stopColor="hsl(var(--violet))" stopOpacity="0.5" />
            <stop offset="100%" stopColor="hsl(var(--violet))" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`stroke-${gid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--saffron))" />
            <stop offset="100%" stopColor="hsl(var(--violet))" />
          </linearGradient>
        </defs>

        {/* Faint full disc */}
        <circle cx="300" cy="300" r="280" fill={`url(#core-${gid})`} opacity="0.25" />

        {/* Ring 1 — outermost, slow CCW, 27 nakshatra ticks + Devanagari numerals */}
        <g style={{ transformOrigin: '300px 300px', animation: 'wheel-spin-ccw 220s linear infinite' }}>
          <circle cx="300" cy="300" r="270" fill="none" stroke="hsl(var(--bone))" strokeOpacity="0.18" />
          <circle cx="300" cy="300" r="250" fill="none" stroke="hsl(var(--bone))" strokeOpacity="0.1" strokeDasharray="1 6" />
          {nakshatras.map((i) => {
            const a = (i / 27) * Math.PI * 2 - Math.PI / 2;
            const x1 = 300 + Math.cos(a) * 250;
            const y1 = 300 + Math.sin(a) * 250;
            const x2 = 300 + Math.cos(a) * 270;
            const y2 = 300 + Math.sin(a) * 270;
            const tx = 300 + Math.cos(a) * 285;
            const ty = 300 + Math.sin(a) * 285;
            return (
              <g key={i}>
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="hsl(var(--bone))" strokeOpacity="0.4" />
                <text
                  x={tx}
                  y={ty}
                  fill="hsl(var(--bone))"
                  fillOpacity="0.35"
                  fontSize="10"
                  fontFamily="'Space Grotesk', sans-serif"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  transform={`rotate(${(a * 180) / Math.PI + 90} ${tx} ${ty})`}
                >
                  {devNumerals[i % 10]}{i >= 10 ? devNumerals[Math.floor(i / 10)] : ''}
                </text>
              </g>
            );
          })}
        </g>

        {/* Ring 2 — 12 houses, CW slower */}
        <g style={{ transformOrigin: '300px 300px', animation: 'wheel-spin-cw 140s linear infinite' }}>
          <circle cx="300" cy="300" r="220" fill="none" stroke="hsl(var(--saffron))" strokeOpacity="0.25" />
          {houses.map((i) => {
            const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
            const x = 300 + Math.cos(a) * 220;
            const y = 300 + Math.sin(a) * 220;
            const tx = 300 + Math.cos(a) * 200;
            const ty = 300 + Math.sin(a) * 200;
            return (
              <g key={i}>
                <circle cx={x} cy={y} r="3" fill="hsl(var(--saffron))" fillOpacity="0.5" />
                <text
                  x={tx}
                  y={ty}
                  fill="hsl(var(--saffron))"
                  fillOpacity="0.45"
                  fontSize="11"
                  fontFamily="'Cormorant Garamond', serif"
                  fontStyle="italic"
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  {i + 1}
                </text>
              </g>
            );
          })}
        </g>

        {/* Ring 3 — geometric dodecagram, CCW */}
        <g style={{ transformOrigin: '300px 300px', animation: 'wheel-spin-ccw 90s linear infinite' }}>
          <polygon
            points={houses
              .map((i) => {
                const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
                return `${300 + Math.cos(a) * 170},${300 + Math.sin(a) * 170}`;
              })
              .join(' ')}
            fill="none"
            stroke={`url(#stroke-${gid})`}
            strokeOpacity="0.5"
            strokeWidth="0.8"
          />
          {/* star-of-12 chords */}
          {houses.map((i) => {
            const a1 = (i / 12) * Math.PI * 2 - Math.PI / 2;
            const a2 = ((i + 5) / 12) * Math.PI * 2 - Math.PI / 2;
            return (
              <line
                key={i}
                x1={300 + Math.cos(a1) * 170}
                y1={300 + Math.sin(a1) * 170}
                x2={300 + Math.cos(a2) * 170}
                y2={300 + Math.sin(a2) * 170}
                stroke="hsl(var(--violet))"
                strokeOpacity="0.3"
                strokeWidth="0.6"
              />
            );
          })}
        </g>

        {/* Ring 4 — inner hexagram, CW faster */}
        <g style={{ transformOrigin: '300px 300px', animation: 'wheel-spin-cw 60s linear infinite' }}>
          {[0, 1].map((t) => (
            <polygon
              key={t}
              points={[0, 1, 2].map((i) => {
                const a = ((i * 2 + t) / 6) * Math.PI * 2 - Math.PI / 2;
                return `${300 + Math.cos(a) * 120},${300 + Math.sin(a) * 120}`;
              }).join(' ')}
              fill="none"
              stroke="hsl(var(--saffron))"
              strokeOpacity="0.4"
              strokeWidth="0.9"
            />
          ))}
        </g>

        {/* Inner bindu / core */}
        <circle cx="300" cy="300" r="70" fill={`url(#core-${gid})`} />
        <circle cx="300" cy="300" r="6" fill="hsl(var(--bone))" opacity="0.9">
          <animate attributeName="opacity" values="0.4;1;0.4" dur="3s" repeatCount="indefinite" />
        </circle>

        {/* Floating ephemeral numbers */}
        <g opacity="0.5">
          {[
            { x: 130, y: 200, n: '९' },
            { x: 470, y: 180, n: '१२' },
            { x: 480, y: 420, n: '२७' },
            { x: 120, y: 430, n: '३६०' },
            { x: 300, y: 80, n: '१०८' },
          ].map((p, i) => (
            <text
              key={i}
              x={p.x}
              y={p.y}
              fill="hsl(var(--bone))"
              fillOpacity="0.4"
              fontSize="12"
              fontFamily="'Space Grotesk', sans-serif"
              textAnchor="middle"
              style={{ animation: `breathe ${6 + i}s ease-in-out infinite` }}
            >
              {p.n}
            </text>
          ))}
        </g>
      </svg>

      <style>{`
        @keyframes wheel-spin-cw {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes wheel-spin-ccw {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
      `}</style>
    </div>
  );
};

export default CosmicWheel;