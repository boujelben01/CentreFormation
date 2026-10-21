/**
 * Définitions SVG partagées de la maquette : dégradés des visuels de cours (cg1 à cg6), motif de points et
 * motifs par thème (motif-1 à motif-6), référencés par <use href="#motif-N"> dans CourseVisual.
 * Rendu une seule fois à la racine de l'application ; invisible et masqué des lecteurs d'écran.
 */
const DEFS = `<linearGradient id="cg1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color:var(--course-1-a)"/><stop offset="1" style="stop-color:var(--course-1-b)"/></linearGradient>
    <linearGradient id="cg2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color:var(--course-2-a)"/><stop offset="1" style="stop-color:var(--course-2-b)"/></linearGradient>
    <linearGradient id="cg3" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color:var(--course-3-a)"/><stop offset="1" style="stop-color:var(--course-3-b)"/></linearGradient>
    <linearGradient id="cg4" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color:var(--course-4-a)"/><stop offset="1" style="stop-color:var(--course-4-b)"/></linearGradient>
    <linearGradient id="cg5" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color:var(--course-5-a)"/><stop offset="1" style="stop-color:var(--course-5-b)"/></linearGradient>
    <linearGradient id="cg6" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color:var(--course-6-a)"/><stop offset="1" style="stop-color:var(--course-6-b)"/></linearGradient>
    <pattern id="dots" width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.2" fill="var(--course-ink)" opacity="0.22"/></pattern>
    <pattern id="hero-dots" width="18" height="18" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.4" fill="var(--border-strong)" opacity="0.5"/></pattern>
    <symbol id="motif-1" viewBox="0 0 320 180">
      <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
        <path d="M118 62 82 90l36 28M202 62l36 28-36 28M178 52l-36 76" stroke-width="9" opacity="0.95"/>
        <path d="M24 24h56M24 40h38M240 150h56M258 134h38" stroke-width="5" opacity="0.4"/>
      </g></symbol>
    <symbol id="motif-2" viewBox="0 0 320 180">
      <g fill="currentColor"><rect x="70" y="100" width="28" height="50" rx="4" opacity="0.5"/><rect x="110" y="80" width="28" height="70" rx="4" opacity="0.6"/>
        <rect x="150" y="104" width="28" height="46" rx="4" opacity="0.5"/><rect x="190" y="60" width="28" height="90" rx="4" opacity="0.7"/><rect x="230" y="40" width="28" height="110" rx="4" opacity="0.85"/></g>
      <g fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><path d="M60 90 124 62l40 24 54-40 44-14"/></g>
      <g fill="currentColor"><circle cx="124" cy="62" r="6"/><circle cx="164" cy="86" r="6"/><circle cx="218" cy="46" r="6"/></g></symbol>
    <symbol id="motif-3" viewBox="0 0 320 180">
      <g fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
        <path d="M70 52h104a14 14 0 0 1 14 14v34a14 14 0 0 1-14 14H110l-26 20v-20H70a14 14 0 0 1-14-14V66a14 14 0 0 1 14-14z" opacity="0.95"/>
        <path d="M150 128v10a14 14 0 0 0 14 14h46l26 20v-20h10a14 14 0 0 0 14-14V98a14 14 0 0 0-14-14h-30" opacity="0.55"/>
        <path d="M86 78h72M86 94h44" stroke-width="5" opacity="0.7"/></g></symbol>
    <symbol id="motif-4" viewBox="0 0 320 180">
      <g fill="currentColor"><rect x="50" y="44" width="110" height="18" rx="9" opacity="0.9"/><rect x="100" y="76" width="130" height="18" rx="9" opacity="0.65"/>
        <rect x="150" y="108" width="100" height="18" rx="9" opacity="0.8"/><rect x="60" y="140" width="80" height="18" rx="9" opacity="0.5"/></g>
      <g fill="none" stroke="currentColor" stroke-width="3" opacity="0.5"><path d="M50 30v135M160 30v135M270 30v135"/></g>
      <path d="M270 48l12 12-12 12-12-12z" fill="currentColor"/></symbol>
    <symbol id="motif-5" viewBox="0 0 320 180">
      <g fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round"><path d="M50 130C90 40 150 40 180 90s70 40 90-10" opacity="0.95"/></g>
      <g fill="none" stroke="currentColor" stroke-width="3" opacity="0.55"><path d="M50 130 90 60M270 80l-16 54"/></g>
      <g fill="currentColor"><rect x="42" y="122" width="16" height="16" rx="3"/><rect x="262" y="72" width="16" height="16" rx="3"/><circle cx="90" cy="60" r="6" opacity="0.7"/><circle cx="254" cy="134" r="6" opacity="0.7"/></g></symbol>
    <symbol id="motif-6" viewBox="0 0 320 180">
      <g fill="none" stroke="currentColor" stroke-width="4" opacity="0.6" stroke-linecap="round"><path d="M160 90 80 50M160 90l80-40M160 90l-70 60M160 90l70 60M80 50 90 150M240 50l-10 100"/></g>
      <g fill="currentColor"><circle cx="160" cy="90" r="16"/><circle cx="80" cy="50" r="10" opacity="0.85"/><circle cx="240" cy="50" r="10" opacity="0.85"/><circle cx="90" cy="150" r="10" opacity="0.7"/><circle cx="230" cy="150" r="10" opacity="0.7"/></g></symbol>`;

export function SvgSprite() {
  return (
    <svg
      width="0"
      height="0"
      style={{ position: 'absolute' }}
      aria-hidden="true"
      focusable="false"
      dangerouslySetInnerHTML={{ __html: `<defs>${DEFS}</defs>` }}
    />
  );
}
