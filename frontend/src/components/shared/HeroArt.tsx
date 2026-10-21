/** Illustration du héros : formes SVG décoratives, couleurs issues des jetons uniquement. */
export function HeroArt({ className = 'hero__art' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 520 440" aria-hidden="true" focusable="false">
      <rect x="0" y="0" width="520" height="440" rx="32" fill="url(#hero-dots)" />
      <rect x="52" y="44" width="400" height="352" rx="28" fill="var(--primary-soft)" stroke="var(--primary-border)" />
      <g>
        <rect x="92" y="84" width="300" height="236" rx="18" fill="var(--surface)" stroke="var(--border)" />
        <svg x="92" y="84" width="300" height="130" viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice" style={{ color: 'var(--course-ink)' }}>
          <rect width="320" height="180" fill="url(#cg1)" />
          <rect width="320" height="180" fill="url(#dots)" />
          <use href="#motif-1" />
        </svg>
        <rect x="92" y="196" width="300" height="18" fill="var(--surface)" />
        <rect x="112" y="232" width="180" height="12" rx="6" fill="var(--text)" opacity="0.85" />
        <rect x="112" y="256" width="120" height="10" rx="5" fill="var(--surface-sunken)" />
        <rect x="112" y="288" width="260" height="8" rx="4" fill="var(--surface-sunken)" />
        <rect x="112" y="288" width="187" height="8" rx="4" fill="var(--primary)" />
      </g>
      <g>
        <circle cx="400" cy="130" r="48" fill="var(--surface)" stroke="var(--border)" />
        <circle cx="400" cy="130" r="32" fill="none" stroke="var(--surface-sunken)" strokeWidth="8" />
        <circle
          cx="400"
          cy="130"
          r="32"
          fill="none"
          stroke="var(--primary)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray="145 201"
          transform="rotate(-90 400 130)"
        />
        <path d="M388 130l9 9 16-18" fill="none" stroke="var(--success-text)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <g>
        <rect x="64" y="318" width="190" height="72" rx="16" fill="var(--surface)" stroke="var(--border)" />
        <circle cx="102" cy="354" r="20" fill="var(--accent-soft)" />
        <circle cx="102" cy="352" r="9" fill="none" stroke="var(--accent-text)" strokeWidth="3" />
        <path d="M97 360l-2 10 7-4 7 4-2-10" fill="none" stroke="var(--accent-text)" strokeWidth="3" strokeLinejoin="round" />
        <rect x="136" y="338" width="96" height="10" rx="5" fill="var(--text)" opacity="0.85" />
        <rect x="136" y="358" width="64" height="8" rx="4" fill="var(--surface-sunken)" />
      </g>
      <circle cx="470" cy="60" r="10" fill="var(--accent)" />
      <circle cx="40" cy="250" r="6" fill="var(--primary)" />
    </svg>
  );
}
