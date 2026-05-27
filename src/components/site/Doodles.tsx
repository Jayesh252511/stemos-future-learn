import { motion } from "framer-motion";

const float = {
  animate: { y: [0, -12, 0] },
  transition: { duration: 4, repeat: Infinity, ease: "easeInOut" as const },
};
const floatSlow = {
  animate: { y: [0, -8, 0], rotate: [0, 3, -3, 0] },
  transition: { duration: 6, repeat: Infinity, ease: "easeInOut" as const },
};
const wiggle = {
  animate: { rotate: [0, 8, -8, 0] },
  transition: { duration: 3, repeat: Infinity, ease: "easeInOut" as const, delay: 0.5 },
};

type DoodleProps = { className?: string; size?: number; opacity?: number };

// ── Atom ─────────────────────────────────────────────────────────────────────
export function DoodleAtom({ className = "", size = 64, opacity = 0.18 }: DoodleProps) {
  return (
    <motion.svg {...float} width={size} height={size} viewBox="0 0 64 64" fill="none"
      className={`pointer-events-none select-none ${className}`} style={{ opacity }}>
      <ellipse cx="32" cy="32" rx="28" ry="11" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="4 3"/>
      <ellipse cx="32" cy="32" rx="28" ry="11" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="4 3" transform="rotate(60 32 32)"/>
      <ellipse cx="32" cy="32" rx="28" ry="11" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="4 3" transform="rotate(120 32 32)"/>
      <circle cx="32" cy="32" r="5" fill="currentColor" opacity="0.7"/>
    </motion.svg>
  );
}

// ── Rocket ────────────────────────────────────────────────────────────────────
export function DoodleRocket({ className = "", size = 64, opacity = 0.18 }: DoodleProps) {
  return (
    <motion.svg {...floatSlow} width={size} height={size} viewBox="0 0 64 64" fill="none"
      className={`pointer-events-none select-none ${className}`} style={{ opacity }}>
      <path d="M32 8 C32 8 44 14 44 30 L32 38 L20 30 C20 14 32 8 32 8Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" fill="none"/>
      <path d="M20 30 L14 42 L24 38" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M44 30 L50 42 L40 38" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="32" cy="26" r="4" stroke="currentColor" strokeWidth="2" fill="none"/>
      <path d="M28 48 Q32 52 36 48" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
    </motion.svg>
  );
}

// ── Star ──────────────────────────────────────────────────────────────────────
export function DoodleStar({ className = "", size = 48, opacity = 0.22 }: DoodleProps) {
  return (
    <motion.svg {...wiggle} width={size} height={size} viewBox="0 0 48 48" fill="none"
      className={`pointer-events-none select-none ${className}`} style={{ opacity }}>
      <path d="M24 4 L27.5 17.5 L41 14 L32 24 L41 34 L27.5 30.5 L24 44 L20.5 30.5 L7 34 L16 24 L7 14 L20.5 17.5 Z"
        stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" fill="none" strokeDasharray="3 2"/>
    </motion.svg>
  );
}

// ── Math formula squiggle / Writing ────────────────────────────────────────────────
export function DoodleFormula({ className = "", size = 120, opacity = 0.3 }: DoodleProps) {
  return (
    <motion.svg 
      width={size} height={size * 0.4} viewBox="0 0 120 40" fill="none"
      className={`pointer-events-none select-none ${className}`} style={{ opacity }}>
      <motion.path 
        d="M10,20 Q15,5 20,20 T30,20 Q35,5 40,20 T50,20 Q55,5 60,20 T70,20 Q80,10 90,20 T110,20" 
        stroke="currentColor" 
        strokeWidth="3" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, ease: "easeInOut", repeat: Infinity, repeatType: "loop", repeatDelay: 1 }}
      />
    </motion.svg>
  );
}

// ── Chemistry Flask ────────────────────────────────────────────────────────────
export function DoodleFlask({ className = "", size = 56, opacity = 0.18 }: DoodleProps) {
  return (
    <motion.svg {...float} transition={{ ...float.transition, duration: 5.5, delay: 0.7 }}
      width={size} height={size} viewBox="0 0 56 56" fill="none"
      className={`pointer-events-none select-none ${className}`} style={{ opacity }}>
      <path d="M20 8 L20 24 L10 44 C10 44 8 48 14 48 L42 48 C48 48 46 44 46 44 L36 24 L36 8"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <line x1="18" y1="8" x2="38" y2="8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="20" cy="38" r="3" fill="currentColor" opacity="0.5"/>
      <circle cx="34" cy="42" r="2" fill="currentColor" opacity="0.4"/>
      <circle cx="27" cy="36" r="2" fill="currentColor" opacity="0.45"/>
    </motion.svg>
  );
}

// ── Code brackets </> ──────────────────────────────────────────────────────────
export function DoodleCode({ className = "", size = 64, opacity = 0.18 }: DoodleProps) {
  return (
    <motion.svg {...wiggle} width={size} height={size * 0.6} viewBox="0 0 64 38" fill="none"
      className={`pointer-events-none select-none ${className}`} style={{ opacity }}>
      <path d="M20 8 L8 19 L20 30" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M44 8 L56 19 L44 30" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M38 4 L26 34" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="3 2"/>
    </motion.svg>
  );
}

// ── Lightbulb ──────────────────────────────────────────────────────────────────
export function DoodleLightbulb({ className = "", size = 56, opacity = 0.2 }: DoodleProps) {
  return (
    <motion.svg {...float} transition={{ ...float.transition, duration: 4.5, delay: 1.2 }}
      width={size} height={size} viewBox="0 0 56 56" fill="none"
      className={`pointer-events-none select-none ${className}`} style={{ opacity }}>
      <path d="M28 8 C18 8 12 16 12 24 C12 30 16 34 20 38 L20 42 L36 42 L36 38 C40 34 44 30 44 24 C44 16 38 8 28 8Z"
        stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" fill="none"/>
      <line x1="22" y1="46" x2="34" y2="46" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="24" y1="50" x2="32" y2="50" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M22 28 Q28 22 34 28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
    </motion.svg>
  );
}

// ── Neural Network ─────────────────────────────────────────────────────────────
export function DoodleNeural({ className = "", size = 72, opacity = 0.13 }: DoodleProps) {
  return (
    <motion.svg {...float} transition={{ ...float.transition, duration: 7, delay: 0.3 }}
      width={size} height={size} viewBox="0 0 72 72" fill="none"
      className={`pointer-events-none select-none ${className}`} style={{ opacity }}>
      {/* Input layer */}
      {[16,28,40].map((y,i) => (
        <circle key={`i${i}`} cx="14" cy={y} r="5" stroke="currentColor" strokeWidth="2" fill="none"/>
      ))}
      {/* Hidden layer */}
      {[10,22,34,46].map((y,i) => (
        <circle key={`h${i}`} cx="36" cy={y} r="5" stroke="currentColor" strokeWidth="2" fill="none"/>
      ))}
      {/* Output */}
      {[20,36].map((y,i) => (
        <circle key={`o${i}`} cx="58" cy={y} r="5" stroke="currentColor" strokeWidth="2" fill="none"/>
      ))}
      {/* Connections */}
      {[16,28,40].flatMap(y1 => [10,22,34,46].map(y2 =>
        <line key={`${y1}-${y2}`} x1="19" y1={y1} x2="31" y2={y2} stroke="currentColor" strokeWidth="1" opacity="0.4"/>
      ))}
      {[10,22,34,46].flatMap(y1 => [20,36].map(y2 =>
        <line key={`h${y1}-o${y2}`} x1="41" y1={y1} x2="53" y2={y2} stroke="currentColor" strokeWidth="1" opacity="0.4"/>
      ))}
    </motion.svg>
  );
}

// ── Sigma (maths) ──────────────────────────────────────────────────────────────
export function DoodleSigma({ className = "", size = 52, opacity = 0.18 }: DoodleProps) {
  return (
    <motion.svg {...wiggle} width={size} height={size} viewBox="0 0 52 52" fill="none"
      className={`pointer-events-none select-none ${className}`} style={{ opacity }}>
      <path d="M38 10 L14 10 L28 26 L14 42 L38 42" stroke="currentColor" strokeWidth="3"
        strokeLinecap="round" strokeLinejoin="round" fill="none" strokeDasharray="5 3"/>
    </motion.svg>
  );
}

// ── Planet ─────────────────────────────────────────────────────────────────────
export function DoodlePlanet({ className = "", size = 64, opacity = 0.16 }: DoodleProps) {
  return (
    <motion.svg {...floatSlow} transition={{ ...floatSlow.transition, duration: 8 }}
      width={size} height={size} viewBox="0 0 64 64" fill="none"
      className={`pointer-events-none select-none ${className}`} style={{ opacity }}>
      <circle cx="32" cy="32" r="16" stroke="currentColor" strokeWidth="2.5" fill="none"/>
      <ellipse cx="32" cy="32" rx="30" ry="10" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="5 3"/>
      <circle cx="22" cy="26" r="2" fill="currentColor" opacity="0.5"/>
    </motion.svg>
  );
}

// ── Arrow ──────────────────────────────────────────────────────────────────────
export function DoodleArrow({ className = "", size = 64, opacity = 0.4 }: DoodleProps) {
  return (
    <motion.svg 
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity }}
      transition={{ duration: 1.5, ease: "easeInOut", repeat: Infinity, repeatType: "loop", repeatDelay: 2 }}
      width={size} height={size} viewBox="0 0 100 100" fill="none"
      className={`pointer-events-none select-none ${className}`} style={{ opacity }}>
      <path d="M 20 80 Q 50 20 80 30" stroke="currentColor" strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d="M 65 25 L 82 29 L 75 45" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </motion.svg>
  );
}

// ── Underline ──────────────────────────────────────────────────────────────────
export function DoodleUnderline({ className = "", opacity = 0.6 }: DoodleProps & { size?: undefined }) {
  return (
    <motion.svg 
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity }}
      transition={{ duration: 1, ease: "easeInOut", repeat: Infinity, repeatType: "loop", repeatDelay: 3 }}
      preserveAspectRatio="none"
      width="100%" height="20" viewBox="0 0 200 20" fill="none"
      className={`pointer-events-none select-none ${className}`} style={{ opacity }}>
      <path d="M 5 15 Q 100 5 195 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" />
    </motion.svg>
  );
}

// ── Scribble ──────────────────────────────────────────────────────────────────
export function DoodleScribble({ className = "", size = 100, opacity = 0.15 }: DoodleProps) {
  return (
    <motion.svg width={size} height={size} viewBox="0 0 100 100" fill="none"
      className={`pointer-events-none select-none ${className}`} style={{ opacity }}>
      <motion.path 
        d="M 10 50 Q 25 10 40 40 T 60 40 T 90 20" 
        stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, ease: "easeInOut", repeat: Infinity, repeatType: "loop", repeatDelay: 1 }}
      />
    </motion.svg>
  );
}

// ── Zigzag ────────────────────────────────────────────────────────────────────
export function DoodleZigzag({ className = "", size = 80, opacity = 0.2 }: DoodleProps) {
  return (
    <motion.svg width={size} height={size * 0.5} viewBox="0 0 80 40" fill="none"
      className={`pointer-events-none select-none ${className}`} style={{ opacity }}>
      <motion.path 
        d="M 5 20 L 15 5 L 25 35 L 40 10 L 55 30 L 75 15" 
        stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, ease: "easeInOut", repeat: Infinity, repeatType: "loop", repeatDelay: 1.5 }}
      />
    </motion.svg>
  );
}
