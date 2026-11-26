export const EDITORIAL_PALETTE = {
  canvas: '#F4F3EF',
  surface: '#EAE8E1',
  void: '#0E0E0E',
  ink: '#111111',
  muted: '#6E6D68',
  border: '#D4D2CA',
  indigo: '#1D2B44',
  rust: '#9E3E24',
} as const;

export interface SceneChapter {
  id: string;
  triggerId?: string;
  timelineLabel?: string;
  index: string;
  title: string;
  location: string;
  coordinates: string;
}

export const SCENE_CHAPTERS: SceneChapter[] = [
  {
    id: 'stage-01-gathering',
    triggerId: 'st-master-story',
    timelineLabel: 'gathering',
    index: '01',
    title: 'THE GATHERING',
    location: 'LA GI BREAKWATER PLAZA, BÌNH THUẬN',
    coordinates: '10°39\'40"N 107°46\'22"E',
  },
  {
    id: 'stage-02-movement',
    triggerId: 'st-master-story',
    timelineLabel: 'movement',
    index: '02',
    title: 'THE MOVEMENT',
    location: 'QUẬN 1 BREEZE-BLOCK CORRIDOR, TP.HCM',
    coordinates: '10°46\'37"N 106°42\'03"E',
  },
  {
    id: 'stage-03-kickflip',
    triggerId: 'st-master-story',
    timelineLabel: 'slowMoKickflip',
    index: '03',
    title: 'THE KICKFLIP',
    location: 'UNDER-BOARD STAIR PERSPECTIVE',
    coordinates: '10°46\'37"N 106°42\'03"E',
  },
  {
    id: 'stage-04-identity',
    triggerId: 'st-master-story',
    timelineLabel: 'identity',
    index: '04',
    title: 'CREW & IDENTITY',
    location: 'LA GI — SAIGON HORIZON',
    coordinates: '10°39\'40"N 107°46\'22"E',
  },
  {
    id: 'stage-05-archive',
    index: '05',
    title: 'ARCHIVE',
    location: 'DROP 01 // ATELIER',
    coordinates: '10°39\'40"N 107°46\'22"E',
  },
];

export interface KickflipFrame {
  index: number;
  src: string;
  phase: string;
}

export const KICKFLIP_SEQUENCE: KickflipFrame[] = [
  { index: 0, src: '/images/about/kickflip-underboard/frame-01.png', phase: '03 // THE KICKFLIP — APPROACH' },
  { index: 1, src: '/images/about/kickflip-underboard/frame-02.png', phase: '03 // THE KICKFLIP — TAIL POP' },
  { index: 2, src: '/images/about/kickflip-underboard/frame-03.png', phase: '03 // THE KICKFLIP — NOSE FLICK' },
  { index: 3, src: '/images/about/kickflip-underboard/frame-04.png', phase: '03 // THE KICKFLIP — SLOW-MO FLIP' },
  { index: 4, src: '/images/about/kickflip-underboard/frame-05.png', phase: '03 // THE KICKFLIP — UNDERSIDE OVERHEAD' },
  { index: 5, src: '/images/about/kickflip-underboard/frame-06.png', phase: '03 // THE KICKFLIP — APEX ROTATION' },
  { index: 6, src: '/images/about/kickflip-underboard/frame-07.png', phase: '03 // THE KICKFLIP — TRUCKS & WHEELS' },
  { index: 7, src: '/images/about/kickflip-underboard/frame-08.png', phase: '03 // THE KICKFLIP — COMPLETING FLIP' },
  { index: 8, src: '/images/about/kickflip-underboard/frame-09.png', phase: '03 // THE KICKFLIP — GRIP RETURN' },
  { index: 9, src: '/images/about/kickflip-underboard/frame-10.png', phase: '03 // THE KICKFLIP — MID-AIR CATCH' },
  { index: 10, src: '/images/about/kickflip-underboard/frame-11.png', phase: '03 // THE KICKFLIP — BOLTS LANDING' },
  { index: 11, src: '/images/about/kickflip-underboard/frame-12.png', phase: '03 // THE KICKFLIP — STAIR ROLLOUT' },
];

export interface CrewMemberProfile {
  id: string;
  name: string;
  role: string;
  silhouette: string;
  garments: string[];
  accentHex: string;
}

export const CREW_PROFILES: CrewMemberProfile[] = [
  {
    id: 'khoa',
    name: 'KHOA',
    role: 'PROTAGONIST // REGULAR STANCE',
    silhouette: 'Oxidized rust fisherman beanie, boxy charcoal tee, cuffed 14oz indigo selvedge.',
    garments: ['LAGIISM BOXY WASHED TEE', 'RAW WIDE-LEG SELVEDGE DENIM'],
    accentHex: EDITORIAL_PALETTE.rust,
  },
  {
    id: 'linh',
    name: 'LINH',
    role: 'SEAWALL REGULAR // GOOFY',
    silhouette: 'Buzzcut, cropped matte black technical shell, wide concrete carpenter denim.',
    garments: ['TECHNICAL SEAWALL SHELL JACKET', 'ABRASION CARPENTER DENIM'],
    accentHex: EDITORIAL_PALETTE.void,
  },
  {
    id: 'minh',
    name: 'MINH',
    role: 'FILMER & ARCHIVIST',
    silhouette: 'Oversized bone-ash raw seam long-sleeve, baggy asphalt trousers, waxed tote.',
    garments: ['COASTAL RAW SEAM L/S', 'WAXED CANVAS UTILITY TOTE'],
    accentHex: EDITORIAL_PALETTE.surface,
  },
  {
    id: 'tuan',
    name: 'TUẤN',
    role: 'LEDGE & CURB TECH',
    silhouette: 'Backwards cap, 500GSM sun-faded slate zip hoodie, wide raw indigo denim.',
    garments: ['500GSM FADED ZIP HOODIE', 'RAW WIDE-LEG SELVEDGE DENIM'],
    accentHex: EDITORIAL_PALETTE.muted,
  },
  {
    id: 'ha',
    name: 'HÀ',
    role: 'NIGHT TRANSIT CRUISER',
    silhouette: 'Cropped deep indigo work jacket, off-white jersey base, washed sand trousers.',
    garments: ['HULL WORK JACKET', 'ASPHALT MOCK-NECK TOP'],
    accentHex: EDITORIAL_PALETTE.indigo,
  },
];

export const ABOUT_ASSETS = {
  crewReference: '/images/about/crew-reference.jpg',
  scene01Bg: '/images/about/scene01-skatepark-bg.jpg',
  scene02Bg: '/images/about/scene02-street-panorama.jpg',
  scene03Bg: '/images/about/scene03-ground-asphalt.jpg',
  scene04Bg: '/images/about/scene04-seawall-pullback.jpg',
  protagonistPush: '/images/about/protagonist-push.png',
  protagonistRear: '/images/about/protagonist-rear.png',
  crewCruising: '/images/about/crew-cruising.png',
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
