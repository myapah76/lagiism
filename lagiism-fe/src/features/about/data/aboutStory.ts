export const ABOUT_STORY_COPY = {
  scene01: {
    label: 'SCENE 01 // THE GATHERING',
    headline: 'LA GI COASTAL GRIT MEETS SAIGON ASPHALT',
    subhead: 'LAGIISM — EST. 2026 | LA GI, BÌNH THUẬN & TP.HCM',
  },
  scene02: {
    label: 'SCENE 02 // THE MOVEMENT',
    paragraph:
      'Founded in 2026 between the salt-corroded concrete seawalls of La Gi, Bình Thuận and the dense midnight asphalt of Ho Chi Minh City, LAGIISM constructs stripped-back streetwear uniforms engineered for heat, monsoon, and abrasion.',
    materials: [
      { label: 'JERSEY', spec: '280–330 GSM' },
      { label: 'DENIM', spec: '14 OZ RAW' },
      { label: 'FLEECE', spec: '500 GSM TERRY' },
    ],
  },
  scene03: {
    label: 'SCENE 03 // THE KICKFLIP',
    headline: 'APEX ROTATION',
  },
  scene04: {
    label: 'SCENE 04 // CREW & IDENTITY',
    brandLine: 'LAGIISM — EST. 2026',
    locations: 'LA GI, BÌNH THUẬN & TP.HCM',
    paragraph:
      'Every garment rejects decorative excess. Cuts are architectural and boxy, calibrated from 280GSM sun-washed jersey, 500GSM French terry, and unwashed 14oz selvedge denim sourced and finished across Southern Vietnam.',
  },
  scene05: {
    label: 'SCENE 05 // ARCHIVE REVEAL',
    wordmark: 'LAGIISM',
    subhead: 'EST. 2026 // LA GI, BÌNH THUẬN & TP.HCM',
    paragraph:
      'Drop 01 documents the physical tension between coastal stillness and urban motion—delivered as modular tops, wide-silhouette trousers, and weather-sealed shells.',
    specs: [
      { label: 'COASTAL BASE', value: 'LA GI, BÌNH THUẬN' },
      { label: 'URBAN STUDIO', value: 'TP.HCM (QUẬN 1)' },
      { label: 'COORDINATES', value: '10°39\'40"N 107°46\'22"E' },
      { label: 'ATELIER CONTACT', value: 'STUDIO@LAGIISM.VN', href: 'mailto:STUDIO@LAGIISM.VN' },
    ],
  },
} as const;

export const ABOUT_MEDIA = {
  crewReference: '/images/about/crew-reference.jpg',
  bgGathering: '/images/about/scene01-skatepark-bg.jpg',
  bgMovement: '/images/about/scene02-street-panorama.jpg',
  bgKickflip: '/images/about/scene03-ground-asphalt.jpg',
  bgWide: '/images/about/scene04-seawall-pullback.jpg',
  protagonistPush: '/images/about/protagonist-push.png',
  protagonistRear: '/images/about/protagonist-rear.png',
  cruiseBgPair: '/images/about/cruise-bg-pair.png',
  cruiseMidPair: '/images/about/cruise-mid-pair.png',
  cruiseFgLead: '/images/about/cruise-fg-lead.png',
  detailShoesBoard: '/images/about/detail-shoes-board.png',
  detailWheelsStance: '/images/about/detail-wheels-stance.png',
  skaterLinh: '/images/about/skater-linh.png',
  skaterMinh: '/images/about/skater-minh.png',
  skaterTuan: '/images/about/skater-tuan.png',
  skaterHa: '/images/about/skater-ha.png',
} as const;

export const KICKFLIP_FRAMES: string[] = Array.from(
  { length: 12 },
  (_, i) => `/images/about/kickflip-underboard/frame-${String(i + 1).padStart(2, '0')}.png`
);

export interface CrewProfile {
  id: string;
  name: string;
  role: string;
  garments: string[];
  accent: string;
}

export const CREW_ROSTER: CrewProfile[] = [
  {
    id: 'khoa',
    name: 'KHOA',
    role: 'PROTAGONIST // REGULAR',
    garments: ['LAGIISM BOXY WASHED TEE', 'RAW WIDE-LEG SELVEDGE DENIM'],
    accent: '#9E3E24',
  },
  {
    id: 'linh',
    name: 'LINH',
    role: 'SEAWALL REGULAR // GOOFY',
    garments: ['TECHNICAL SEAWALL SHELL JACKET', 'ABRASION CARPENTER DENIM'],
    accent: '#0E0E0E',
  },
  {
    id: 'minh',
    name: 'MINH',
    role: 'FILMER & ARCHIVIST',
    garments: ['COASTAL RAW SEAM L/S', 'WAXED CANVAS UTILITY TOTE'],
    accent: '#EAE8E1',
  },
  {
    id: 'tuan',
    name: 'TUẤN',
    role: 'LEDGE & CURB TECH',
    garments: ['500GSM FADED ZIP HOODIE', 'RAW WIDE-LEG SELVEDGE DENIM'],
    accent: '#6E6D68',
  },
  {
    id: 'ha',
    name: 'HÀ',
    role: 'NIGHT TRANSIT CRUISER',
    garments: ['HULL WORK JACKET', 'ASPHALT MOCK-NECK TOP'],
    accent: '#1D2B44',
  },
];
