export const TEXT_TEMPLATES = [
  {
    id: 'sticky',
    label: 'Sticky Note',
    bg: 'rgba(254,252,203,0.95)',
    border: '#bdbb92',
    icon: 'sticky_note_2',
    accent: '#be7d2d',
    extraStyle: {
      boxShadow: '3px 3px 8px rgba(189,187,146,0.4), inset 0 -6px 0 rgba(189,155,80,0.12)',
    },
    pinColor: '#be7d2d',
  },
  {
    id: 'torn',
    label: 'Torn Paper',
    bg: '#ffffff',
    border: '#815a5b',
    icon: 'description',
    accent: '#815a5b',
    clipPath: "polygon(0% 2%, 4% 0%, 8% 2%, 12% 0%, 17% 2%, 22% 0%, 27% 2%, 32% 0%, 37% 2%, 43% 0%, 48% 2%, 54% 0%, 59% 2%, 65% 0%, 70% 2%, 75% 0%, 80% 2%, 85% 0%, 90% 2%, 94% 0%, 98% 2%, 100% 0%, 100% 98%, 97% 100%, 92% 97%, 87% 100%, 82% 97%, 77% 100%, 72% 97%, 67% 100%, 62% 97%, 57% 100%, 52% 97%, 47% 100%, 42% 97%, 37% 100%, 32% 97%, 27% 100%, 22% 97%, 17% 100%, 12% 97%, 7% 100%, 2% 97%, 0% 100%)",
    pinColor: '#815a5b',
    extraStyle: {
      boxShadow: '0 4px 16px rgba(129,90,91,0.12)',
      paddingTop: '2rem',
      paddingBottom: '1.75rem',
      backgroundImage: 'linear-gradient(90deg, transparent 20px, rgba(190, 45, 6, 0.2) 20px, rgba(190, 45, 6, 0.2) 21px, transparent 21px), repeating-linear-gradient(transparent, transparent 27px, rgba(140, 160, 190, 0.4) 27px, rgba(140, 160, 190, 0.4) 28px)',
      backgroundSize: '100% 100%, 100% 28px',
      backgroundPositionY: '0, 1rem'
    },
  },
  {
    id: 'corkboard',
    label: 'Cork Pin',
    bg: '#f5e6c8',
    border: '#a0763a',
    icon: 'push_pin',
    accent: '#a0763a',
    extraStyle: {
      backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'4\' height=\'4\' viewBox=\'0 0 4 4\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Ccircle cx=\'2\' cy=\'2\' r=\'1\' fill=\'rgba(160,118,58,0.15)\'/%3E%3C/svg%3E")',
      backgroundSize: '10px 10px',
      boxShadow: '2px 2px 12px rgba(160,118,58,0.2)',
    },
    pinColor: '#a0763a',
  },
  {
    id: 'washi',
    label: 'Washi Border',
    bg: 'rgba(250,211,253,0.2)',
    border: '#785a7e',
    icon: 'format_color_fill',
    accent: '#785a7e',
    extraStyle: {
      backdropFilter: 'blur(4px)',
      boxShadow: '0 4px 20px rgba(120,90,126,0.15)',
    },
    washiStrips: true,
    pinColor: '#785a7e',
  },
  {
    id: 'kraft',
    label: 'Kraft Paper',
    bg: '#d2b48c',
    border: '#8b5a2b',
    icon: 'box',
    accent: '#5c3a21',
    extraStyle: {
      backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100\' height=\'100\' fill=\'none\'/%3E%3Crect width=\'100\' height=\'100\' filter=\'url(%23noise)\' opacity=\'0.08\'/%3E%3C/svg%3E")',
      boxShadow: '2px 2px 8px rgba(92,58,33,0.2), inset 0 0 10px rgba(139,90,43,0.1)',
    },
    pinColor: '#5c3a21',
  },
  {
    id: 'grid',
    label: 'Grid Note',
    bg: '#ffffff',
    border: '#bcc6cc',
    icon: 'grid_on',
    accent: '#536872',
    extraStyle: {
      backgroundImage: 'linear-gradient(transparent 19px, #e9ecef 20px), linear-gradient(90deg, transparent 19px, #e9ecef 20px)',
      backgroundSize: '20px 20px',
      boxShadow: '0 4px 12px rgba(83,104,114,0.1)',
    },
    pinColor: '#536872',
  },
  {
    id: 'postcard',
    label: 'Postcard',
    bg: '#fdfbf7',
    border: '#3c6d5e',
    icon: 'local_post_office',
    accent: '#3c6d5e',
    extraStyle: {
      border: '4px double rgba(60,109,94,0.5)',
      boxShadow: '2px 4px 12px rgba(60,109,94,0.12)',
    },
    pinColor: '#815a5b',
  },
  {
    id: 'receipt',
    label: 'Receipt',
    bg: '#f4f4f4',
    border: '#9e9e9e',
    icon: 'receipt_long',
    accent: '#616161',
    clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 95% 98%, 90% 100%, 85% 98%, 80% 100%, 75% 98%, 70% 100%, 65% 98%, 60% 100%, 55% 98%, 50% 100%, 45% 98%, 40% 100%, 35% 98%, 30% 100%, 25% 98%, 20% 100%, 15% 98%, 10% 100%, 5% 98%, 0% 100%)",
    extraStyle: {
      paddingBottom: '2.5rem',
      boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
      fontFamily: "'Courier New', Courier, monospace"
    },
    pinColor: '#9e9e9e',
  }
];

export const PHOTO_FRAMES = [
  { id: 'polaroid', label: 'Polaroid', bg: '#ffffff', padding: '0.75rem 0.75rem 3.5rem', shadow: '0 14px 40px rgba(57,57,27,0.15)' },
  { id: 'classic', label: 'Classic Mat', bg: '#ffffff', padding: '0.4rem', border: '1px solid #e0e0e0', shadow: '0 8px 24px rgba(57,57,27,0.12)' },
  { id: 'round', label: 'Circle Crop', bg: '#ffffff', borderRadius: '50%', padding: '0.4rem', shadow: '0 8px 24px rgba(57,57,27,0.12)' },
  { id: 'filmstrip', label: 'Film Strip', bg: '#1a1a1a', padding: '0.25rem', border: '5px solid #1a1a1a', shadow: '0 8px 24px rgba(0,0,0,0.25)', sprockets: true },
  { id: 'taped', label: 'Taped', bg: 'transparent', padding: '0', shadow: '0 6px 16px rgba(0,0,0,0.12)', taped: true },
  { id: 'gallery', label: 'Gallery Frame', bg: '#ffffff', padding: '0.6rem', border: '12px solid #2a2a2a', shadow: '0 12px 30px rgba(0,0,0,0.3)', borderRadius: '2px' },
  { id: 'stamp', label: 'Postage Stamp', bg: '#ffffff', padding: '0.5rem', 
    clipPath: "polygon(0% 2%, 2% 0%, 5% 2%, 8% 0%, 11% 2%, 14% 0%, 17% 2%, 20% 0%, 23% 2%, 26% 0%, 29% 2%, 32% 0%, 35% 2%, 38% 0%, 41% 2%, 44% 0%, 47% 2%, 50% 0%, 53% 2%, 56% 0%, 59% 2%, 62% 0%, 65% 2%, 68% 0%, 71% 2%, 74% 0%, 77% 2%, 80% 0%, 83% 2%, 86% 0%, 89% 2%, 92% 0%, 95% 2%, 98% 0%, 100% 2%, 100% 98%, 98% 100%, 95% 98%, 92% 100%, 89% 98%, 86% 100%, 83% 98%, 80% 100%, 77% 98%, 74% 100%, 71% 98%, 68% 100%, 65% 98%, 62% 100%, 59% 98%, 56% 100%, 53% 98%, 50% 100%, 47% 98%, 44% 100%, 41% 98%, 38% 100%, 35% 98%, 32% 100%, 29% 98%, 26% 100%, 23% 98%, 20% 100%, 17% 98%, 14% 100%, 11% 98%, 8% 100%, 5% 98%, 2% 100%, 0% 98%)",
    shadow: '0 4px 10px rgba(0,0,0,0.1)' 
  },
  { id: 'polaroid-dark', label: 'Dark Polaroid', bg: '#1c1c1c', padding: '0.75rem 0.75rem 3.5rem', shadow: '0 14px 40px rgba(0,0,0,0.3)', darkText: true },
];
