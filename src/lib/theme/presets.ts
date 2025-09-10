import type { ThemePreferences } from './types';

export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  primary: string; // base hex
  secondary: string; // base hex
  preferences?: Partial<ThemePreferences>;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'oceanic',
    name: 'Oceanic',
    description: 'Deep navy base with teal accents',
    primary: '#1e3a8a',
    secondary: '#0d9488',
    preferences: { colorScheme: 'blue' }
  },
  {
    id: 'forest',
    name: 'Forest',
    description: 'Earthy dark greens with soft moss surfaces',
    primary: '#064e3b',
    secondary: '#16a34a',
    preferences: { colorScheme: 'green' }
  },
  {
    id: 'sunset',
    name: 'Sunset',
    description: 'Warm orange gradients fading into purple',
    primary: '#c2410c',
    secondary: '#9333ea',
    preferences: { colorScheme: 'orange' }
  }
];

export const CUSTOM_THEME_KEY = 'antimony-custom-theme';

export interface GeneratedScale {
  scale: Record<number, string>; // 50..950
  contrastColor: string; // either #000 or #fff for readable text
}

function clamp(v: number, min: number, max: number) { return Math.min(max, Math.max(min, v)); }

// Simple HSL utility parser
function hexToHsl(hex: string): { h: number; s: number; l: number } {
  hex = hex.replace('#','');
  if (hex.length === 3) hex = hex.split('').map(c=>c+c).join('');
  const r = parseInt(hex.substring(0,2),16)/255;
  const g = parseInt(hex.substring(2,4),16)/255;
  const b = parseInt(hex.substring(4,6),16)/255;
  const max = Math.max(r,g,b), min = Math.min(r,g,b);
  let h = 0, s=0; const l = (max+min)/2;
  const d = max - min;
  if (d !== 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch(max){
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: h*360, s: s*100, l: l*100 };
}

function hslToHex(h: number, s: number, l: number): string {
  h = (h%360+360)%360; s = clamp(s,0,100); l = clamp(l,0,100);
  const C = (1 - Math.abs(2*l/100 -1)) * (s/100);
  const X = C * (1 - Math.abs(((h/60)%2)-1));
  const m = l/100 - C/2;
  let r=0,g=0,b=0;
  if(h<60){r=C;g=X;} else if(h<120){r=X;g=C;} else if(h<180){g=C;b=X;} else if(h<240){g=X;b=C;} else if(h<300){r=X;b=C;} else {r=C;b=X;}
  const toHex = (v:number)=>('0'+Math.round((v+m)*255).toString(16)).slice(-2);
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function generateScale(baseHex: string): GeneratedScale {
  const { h, s } = hexToHsl(baseHex); // removed unused l
  const stops = [50,100,200,300,400,500,600,700,800,900,950];
  const scale: Record<number,string> = {};
  stops.forEach((stop,i)=>{
    // Map stop to lightness adjustment curve
    const t = i/(stops.length-1); // 0..1
    const targetL = 95 - t*80; // from 95 to 15
    const adjusted = hslToHex(h, s* (0.85 + 0.15*(1-t)), targetL);
    scale[stop] = adjusted;
  });
  // Choose contrast text for 500
  const mid = scale[500] || baseHex;
  const { l: midL } = hexToHsl(mid);
  const contrastColor = midL > 55 ? '#000000' : '#ffffff';
  return { scale, contrastColor };
}

export function applyCustomTheme(root: HTMLElement, primary: string, secondary: string) {
  const primaryScale = generateScale(primary).scale;
  const secondaryScale = generateScale(secondary).scale;
  (Object.keys(primaryScale) as Array<string>).forEach((k) => {
    const v = primaryScale[Number(k) as keyof typeof primaryScale];
    if (v) root.style.setProperty(`--color-primary-${k}`, hexToRgbSpace(v));
  });
  (Object.keys(secondaryScale) as Array<string>).forEach((k) => {
    const v = secondaryScale[Number(k) as keyof typeof secondaryScale];
    if (v) root.style.setProperty(`--color-secondary-${k}`, hexToRgbSpace(v));
  });
}

function hexToRgbSpace(hex: string): string {
  hex = hex.replace('#','');
  if (hex.length === 3) hex = hex.split('').map(c=>c+c).join('');
  const r = parseInt(hex.substring(0,2),16);
  const g = parseInt(hex.substring(2,4),16);
  const b = parseInt(hex.substring(4,6),16);
  return `${r} ${g} ${b}`;
}
