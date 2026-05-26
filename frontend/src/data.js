// VoyageVista — mock data (ES module)

export const destinations = [
  {
    id: 'shanghai', city: 'Shanghai', country: 'Chine', countryEn: 'China',
    type: 'ville', types: ['ville', 'culture'],
    rating: 4.8, reviews: 612, durationDays: 7, priceFrom: 1408,
    tag: 'Tendance', tagEn: 'Trending',
    blurb: "Néons du Bund, ruelles du Vieux Shanghai, gratte-ciel du Pudong : la ville qui ne s'arrête jamais.",
    blurbEn: "Bund neon, Old Shanghai lanes, Pudong skyline — the city that never pauses.",
    ph: 'SHANGHAI · PUDONG'
  },
  {
    id: 'bali', city: 'Bali', country: 'Indonésie', countryEn: 'Indonesia',
    type: 'aventure', types: ['aventure', 'plage'],
    rating: 4.7, reviews: 894, durationDays: 8, priceFrom: 1199, tag: 'Populaire', tagEn: 'Popular',
    blurb: "Rizières d'Ubud, plages de Canggu, temples de Tirta Empul.",
    blurbEn: "Ubud rice terraces, Canggu beaches, Tirta Empul temples.",
    ph: 'BALI · UBUD'
  },
  {
    id: 'santorini', city: 'Santorin', country: 'Grèce', countryEn: 'Greece',
    type: 'plage', types: ['plage', 'ville'],
    rating: 4.6, reviews: 1240, durationDays: 6, priceFrom: 1340, tag: '', tagEn: '',
    blurb: "Caldeira au crépuscule, dômes bleus d'Oia, vignobles d'assyrtiko.",
    blurbEn: "Caldera at dusk, blue domes of Oia, Assyrtiko vineyards.",
    ph: 'SANTORINI · OIA'
  },
  {
    id: 'marrakech', city: 'Marrakech', country: 'Maroc', countryEn: 'Morocco',
    type: 'culture', types: ['culture', 'ville'],
    rating: 4.5, reviews: 720, durationDays: 5, priceFrom: 749, tag: 'Nouveau', tagEn: 'New',
    blurb: "Souks de la médina, riads cachés, mosaïques du palais Bahia.",
    blurbEn: "Medina souks, hidden riads, Bahia palace mosaics.",
    ph: 'MARRAKECH · MEDINA'
  },
  {
    id: 'kyoto', city: 'Kyoto', country: 'Japon', countryEn: 'Japan',
    type: 'culture', types: ['culture', 'montagne'],
    rating: 4.9, reviews: 1080, durationDays: 9, priceFrom: 1620, tag: 'Saison', tagEn: 'In season',
    blurb: "Mille torii de Fushimi Inari, jardins zen, ryokans de Gion.",
    blurbEn: "Fushimi Inari's thousand torii, Zen gardens, Gion ryokans.",
    ph: 'KYOTO · FUSHIMI'
  },
  {
    id: 'lisbon', city: 'Lisbonne', country: 'Portugal', countryEn: 'Portugal',
    type: 'ville', types: ['ville', 'plage'],
    rating: 4.6, reviews: 540, durationDays: 5, priceFrom: 620, tag: '', tagEn: '',
    blurb: "Tramway 28, azulejos, pasteis de nata et fado dans l'Alfama.",
    blurbEn: "Tram 28, azulejos, pastéis de nata, Alfama fado.",
    ph: 'LISBOA · ALFAMA'
  },
  {
    id: 'tulum', city: 'Tulum', country: 'Mexique', countryEn: 'Mexico',
    type: 'plage', types: ['plage', 'aventure'],
    rating: 4.4, reviews: 432, durationDays: 7, priceFrom: 980, tag: '', tagEn: '',
    blurb: "Cenotes, ruines mayas en bord de mer, jungle yucatèque.",
    blurbEn: "Cenotes, Mayan ruins by the sea, Yucatán jungle.",
    ph: 'TULUM · CENOTE'
  },
  {
    id: 'patagonia', city: 'Patagonie', country: 'Argentine', countryEn: 'Argentina',
    type: 'montagne', types: ['montagne', 'aventure'],
    rating: 4.9, reviews: 312, durationDays: 12, priceFrom: 2240, tag: '', tagEn: '',
    blurb: "Glacier Perito Moreno, trek du Fitz Roy, estancias.",
    blurbEn: "Perito Moreno glacier, Fitz Roy trek, working estancias.",
    ph: 'PATAGONIA · FITZROY'
  },
  {
    id: 'reykjavik', city: 'Reykjavik', country: 'Islande', countryEn: 'Iceland',
    type: 'aventure', types: ['aventure', 'montagne'],
    rating: 4.7, reviews: 401, durationDays: 6, priceFrom: 1480, tag: '', tagEn: '',
    blurb: "Aurores boréales, cercle d'or, sources géothermales.",
    blurbEn: "Northern lights, Golden Circle, geothermal springs.",
    ph: 'REYKJAVIK · AURORA'
  },
  {
    id: 'capetown', city: 'Cape Town', country: 'Afrique du Sud', countryEn: 'South Africa',
    type: 'aventure', types: ['aventure', 'plage'],
    rating: 4.6, reviews: 520, durationDays: 10, priceFrom: 1920, tag: '', tagEn: '',
    blurb: "Table Mountain, Cap de Bonne-Espérance, vignobles de Stellenbosch.",
    blurbEn: "Table Mountain, Cape of Good Hope, Stellenbosch wineries.",
    ph: 'CAPE TOWN · TABLE MT'
  },
  {
    id: 'hanoi', city: 'Hanoï', country: 'Vietnam', countryEn: 'Vietnam',
    type: 'culture', types: ['culture', 'ville'],
    rating: 4.5, reviews: 380, durationDays: 9, priceFrom: 1140, tag: '', tagEn: '',
    blurb: "Vieux quartier, baie d'Halong, pho fumant à l'aube.",
    blurbEn: "Old Quarter, Halong Bay, steaming pho at dawn.",
    ph: 'HANOI · OLD QUARTER'
  },
  {
    id: 'lofoten', city: 'Lofoten', country: 'Norvège', countryEn: 'Norway',
    type: 'montagne', types: ['montagne', 'aventure'],
    rating: 4.8, reviews: 210, durationDays: 7, priceFrom: 1860, tag: '', tagEn: '',
    blurb: "Cabanes de pêcheurs rouges, randonnées de Reinebringen.",
    blurbEn: "Red fishermen's cabins, Reinebringen hikes.",
    ph: 'LOFOTEN · REINE'
  }
];

export const shanghaiDetail = {
  id: 'shanghai',
  title: { fr: "Shanghai · 7 jours d'horizon", en: "Shanghai · 7 days of skyline" },
  subtitle: { fr: "Du Bund au Pudong, des concessions aux jardins.", en: "From the Bund to Pudong, from concessions to gardens." },
  gallery: ['BUND · NIGHT', 'PUDONG · SKYLINE', 'YU GARDEN', 'XINTIANDI · LANE', 'M50 · ART', 'SHIKUMEN'],
  description: {
    fr: "Une semaine pour saisir Shanghai dans toute son amplitude. Côté Puxi, on flâne le long du Bund, on se perd dans les concessions française et anglaise, on goûte le xiaolongbao chez Jia Jia Tang Bao. De l'autre rive, Pudong et ses tours dressent l'horizon le plus photographié d'Asie. Vous logez à mi-chemin, dans une lilong rénovée — calme, mais à dix minutes de tout.",
    en: "A week to take in Shanghai at full breadth. On the Puxi side, stroll the Bund, get lost in the French and English concessions, taste xiaolongbao at Jia Jia Tang Bao. Across the river, Pudong and its towers form Asia's most photographed skyline. You stay halfway, in a renovated lilong — quiet, but ten minutes from everything."
  },
  flights: [
    { id: 'f1', from: 'Paris CDG', to: 'Shanghai PVG', airline: 'Air France', duration: '11h05', price: 612, time: '11:15 → 06:20+1' },
    { id: 'f2', from: 'Paris CDG', to: 'Shanghai PVG', airline: 'China Eastern', duration: '11h20', price: 548, time: '23:45 → 18:55+1' },
    { id: 'f3', from: 'Paris ORY', to: 'Shanghai PVG', airline: 'Lufthansa (Munich)', duration: '14h40', price: 489, time: '08:25 → 01:30+1' }
  ],
  hotels: [
    { id: 'h1', name: 'The Middle House', area: "Jing'an · Puxi", rating: 4.9, pricePerNight: 285, perk: { fr: 'Petit-déj inclus', en: 'Breakfast included' } },
    { id: 'h2', name: 'URBN Boutique', area: 'Ex-concession française', rating: 4.6, pricePerNight: 165, perk: { fr: 'Hôtel carbone-neutre', en: 'Carbon-neutral hotel' } },
    { id: 'h3', name: 'Capella Jian Ye Li', area: 'Xuhui · Shikumen', rating: 4.95, pricePerNight: 420, perk: { fr: 'Spa privatif', en: 'Private spa' } },
    { id: 'h4', name: 'Yangtze Boutique', area: "People's Square", rating: 4.3, pricePerNight: 112, perk: { fr: 'Annulation flexible', en: 'Flexible cancellation' } }
  ],
  activities: [
    { id: 'a1', name: { fr: 'Croisière nocturne sur le Huangpu', en: 'Huangpu river night cruise' }, duration: '1h30', price: 28 },
    { id: 'a2', name: { fr: 'Jardin Yuyuan & maison de thé', en: 'Yuyuan Garden & tea house' }, duration: '3h', price: 35 },
    { id: 'a3', name: { fr: "Atelier xiaolongbao chez l'habitant", en: 'Xiaolongbao workshop with a local' }, duration: '2h30', price: 62 },
    { id: 'a4', name: { fr: 'Visite guidée M50 (art contemporain)', en: 'M50 contemporary art tour' }, duration: '2h', price: 45 },
    { id: 'a5', name: { fr: "Excursion d'une journée à Zhujiajiao", en: 'Day trip to Zhujiajiao water town' }, duration: '8h', price: 89 },
    { id: 'a6', name: { fr: 'Vue panoramique Shanghai Tower (118e)', en: 'Shanghai Tower panoramic view (118th fl.)' }, duration: '1h', price: 32 }
  ],
  inclusions: {
    fr: ['Vols A/R Paris ↔ Shanghai', 'Hôtel 7 nuits', 'Petit-déjeuner', 'Carte de transport 7 jours', 'Assurance annulation', 'Conciergerie 24/7'],
    en: ['Round-trip flights Paris ↔ Shanghai', '7-night hotel', 'Breakfast', '7-day transit card', 'Cancellation insurance', '24/7 concierge']
  }
};

export const reservations = [
  { id: 'r1', dest: 'Bali, Indonésie', destEn: 'Bali, Indonesia', date: '15 juin 2026', dateEn: 'Jun 15, 2026', status: 'confirmed', travelers: 2, total: 2398, ref: 'VV-2H4N9K' },
  { id: 'r2', dest: 'Paris', destEn: 'Paris', date: '3 août 2026', dateEn: 'Aug 3, 2026', status: 'pending', travelers: 4, total: 1840, ref: 'VV-7P2X1M' },
  { id: 'r3', dest: 'Kyoto, Japon', destEn: 'Kyoto, Japan', date: '12 nov 2025', dateEn: 'Nov 12, 2025', status: 'completed', travelers: 2, total: 3240, ref: 'VV-9B5K3D' }
];

export const adminOffers = [
  { id: 'o1', dest: 'Bali, Indonésie', type: 'aventure', price: 1199, bookings: 42, status: 'active' },
  { id: 'o2', dest: 'Shanghai, Chine', type: 'ville', price: 1408, bookings: 28, status: 'active' },
  { id: 'o3', dest: 'Santorin, Grèce', type: 'plage', price: 1340, bookings: 67, status: 'active' },
  { id: 'o4', dest: 'Kyoto, Japon', type: 'culture', price: 1620, bookings: 19, status: 'active' },
  { id: 'o5', dest: 'Marrakech, Maroc', type: 'culture', price: 749, bookings: 35, status: 'active' },
  { id: 'o6', dest: 'Reykjavik, Islande', type: 'aventure', price: 1480, bookings: 8, status: 'paused' },
  { id: 'o7', dest: 'Patagonie, Argentine', type: 'montagne', price: 2240, bookings: 4, status: 'draft' }
];

export const VV_DATA = { destinations, shanghaiDetail, reservations, adminOffers };
