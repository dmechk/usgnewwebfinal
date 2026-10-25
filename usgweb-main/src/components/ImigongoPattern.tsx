import React, { useEffect, useRef, useState } from 'react';

interface ImigongoRibbonProps {
  className?: string;
  height?: number;
  variant?: 'light' | 'dark' | 'emerald' | 'gold' | 'black';
  bordered?: boolean;
  animated?: boolean;
}

/**
 * Authentic Rwandan Imigongo geometric pattern ribbon based on traditional art.
 * Matches the user-provided chevron zigzag relief with top and bottom geometric triangles.
 */
export const ImigongoRibbon: React.FC<ImigongoRibbonProps> = ({
  className = '',
  height = 20,
  variant = 'light',
  bordered = true,
  animated = false,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(!animated);

  useEffect(() => {
    if (!animated) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [animated]);

  // Color tokens matching the uploaded Imigongo image
  let bgFill = '#ffffff';
  let triangleFill = '#cbd5e1'; // Slate-300 / subtle grey as in image.png
  let strokeColor = '#94a3b8';

  if (variant === 'dark') {
    bgFill = '#0f172a'; // Deep slate-900
    triangleFill = '#1e293b'; // Slate-800
    strokeColor = '#334155';
  } else if (variant === 'black') {
    bgFill = '#09090b';
    triangleFill = '#27272a';
    strokeColor = '#3f3f46';
  } else if (variant === 'emerald') {
    bgFill = '#064e3b'; // Emerald-900
    triangleFill = '#047857'; // Emerald-700
    strokeColor = '#059669';
  } else if (variant === 'gold') {
    bgFill = '#78350f';
    triangleFill = '#d97706';
    strokeColor = '#f59e0b';
  }

  const patternId = `imigongo-${variant}-${height}`;

  return (
    <div
      ref={ref}
      className={`w-full overflow-hidden select-none pointer-events-none transition-all duration-700 ${animated ? (visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2') : ''} ${className}`}
      style={{ height: `${height}px` }}
      aria-hidden="true"
    >
      <svg
        className="w-full h-full block"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="repeat-x"
      >
        <defs>
          <pattern
            id={patternId}
            width="40"
            height={height}
            patternUnits="userSpaceOnUse"
          >
            {/* Background base */}
            <rect width="40" height={height} fill={bgFill} />

            {/* Top downward triangles */}
            <polygon
              points={`0,0 20,${height * 0.4} 40,0`}
              fill={triangleFill}
            />

            {/* Bottom upward triangles */}
            <polygon
              points={`0,${height} 20,${height * 0.6} 40,${height}`}
              fill={triangleFill}
            />

            {/* Optional subtle hairline boundary borders as in image.png */}
            {bordered && (
              <>
                <line
                  x1="0"
                  y1="0"
                  x2="40"
                  y2="0"
                  stroke={strokeColor}
                  strokeWidth="0.8"
                />
                <line
                  x1="0"
                  y1={height}
                  x2="40"
                  y2={height}
                  stroke={strokeColor}
                  strokeWidth="0.8"
                />
              </>
            )}
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>
    </div>
  );
};

/**
 * Imigongo Brand Banner — "Made in Rwanda" heritage branding strip.
 * Displayed once, in one place (under the header), with a scroll-triggered fade transition.
 */
export const ImigongoBrand: React.FC<{
  currentTheme?: string;
  className?: string;
}> = ({ currentTheme = 'emerald', className = '' }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger on mount with a tiny delay for a smooth entrance
    const t = setTimeout(() => setVisible(true), 120);
    return () => clearTimeout(t);
  }, []);

  const isDark = currentTheme === 'black';

  const ribbonVariant: 'black' | 'dark' | 'emerald' = isDark
    ? 'black'
    : 'emerald';

  return (
    <div
      ref={ref}
      className={`relative w-full overflow-hidden transition-all duration-700 ${visible ? 'opacity-100' : 'opacity-0'} ${className}`}
      aria-label="Imigongo Heritage Pattern — Made in Rwanda"
    >
      {/* Top Imigongo zigzag */}
      <ImigongoRibbon
        height={18}
        variant={ribbonVariant}
        bordered={true}
      />

      {/* Centre brand label strip */}
      <div
        className={`flex items-center justify-center gap-3 py-1.5 px-4 text-[10px] sm:text-[11px] font-bold tracking-widest uppercase transition-colors duration-300 ${
          isDark
            ? 'bg-zinc-950 text-zinc-400 border-y border-zinc-800'
            : 'bg-emerald-950 text-emerald-300 border-y border-emerald-800'
        }`}
      >
        {/* Tiny geometric accent left */}
        <span aria-hidden="true" className="opacity-60">◆</span>
        <span className="flex items-center gap-1.5 select-none">
          <span className={isDark ? 'text-zinc-300' : 'text-emerald-200'}>Imigongo</span>
          <span className="opacity-40 mx-1">·</span>
          <span className={isDark ? 'text-amber-400' : 'text-amber-300'}>Made in Rwanda</span>
          <span className="opacity-40 mx-1">·</span>
          <span className={isDark ? 'text-zinc-300' : 'text-emerald-200'}>ইমিগোনগো</span>
        </span>
        {/* Tiny geometric accent right */}
        <span aria-hidden="true" className="opacity-60">◆</span>
      </div>

      {/* Bottom Imigongo zigzag */}
      <ImigongoRibbon
        height={18}
        variant={ribbonVariant}
        bordered={true}
      />
    </div>
  );
};

/**
 * Vertical Imigongo pillar/edge border for framing the structural skeleton
 */
export const ImigongoPillar: React.FC<{
  className?: string;
  width?: number;
  variant?: 'light' | 'dark';
}> = ({ className = '', width = 16, variant = 'light' }) => {
  const bgFill = variant === 'dark' ? '#0f172a' : '#ffffff';
  const triangleFill = variant === 'dark' ? '#1e293b' : '#e2e8f0';
  const patternId = `imigongo-vert-${variant}-${width}`;

  return (
    <div
      className={`h-full overflow-hidden select-none pointer-events-none ${className}`}
      style={{ width: `${width}px` }}
      aria-hidden="true"
    >
      <svg
        className="w-full h-full block"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="repeat-y"
      >
        <defs>
          <pattern
            id={patternId}
            width={width}
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <rect width={width} height="40" fill={bgFill} />
            <polygon points={`0,0 ${width * 0.4},20 0,40`} fill={triangleFill} />
            <polygon points={`${width},0 ${width * 0.6},20 ${width},40`} fill={triangleFill} />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>
    </div>
  );
};
