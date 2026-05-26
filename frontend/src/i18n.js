// VoyageVista — bilingual strings (ES module)

export const VV_I18N = {
  fr: {
    nav: { destinations: 'Destinations', stays: 'Séjours', activities: 'Activités', transport: 'Transport' },
    cta: { signin: 'Connexion', signup: "S'inscrire", account: 'Mon compte', logout: 'Déconnexion' },
    search: {
      destination: 'Destination', destinationPh: 'Où voulez-vous aller ?',
      dates: 'Dates', datesPh: 'Quand ?',
      travelers: 'Voyageurs',
      travelersVal: (t) => {
        const total = t.student + t.adult + t.child;
        if (total === 0) return 'Ajouter';
        return `${total} voyageur${total > 1 ? 's' : ''}`;
      },
      travTypes: {
        adult: { label: 'Adulte', sub: '18 ans et plus' },
        student: { label: 'Étudiant', sub: 'Moins de 26 ans · justificatif' },
        child: { label: 'Enfant', sub: 'Moins de 17 ans' }
      },
      apply: 'Appliquer',
      type: 'Type de séjour',
      go: 'Rechercher',
      monthsShort: ['Janv.','Févr.','Mars','Avr.','Mai','Juin','Juil.','Août','Sept.','Oct.','Nov.','Déc.'],
      months: ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'],
      weekdays: ['L','M','M','J','V','S','D'],
      datesNone: 'Sélectionner'
    },
    hero: {
      eyebrow: 'PLATEFORME TOUT-EN-UN · ÉTÉ 2026',
      titleA: 'Composez', titleB: 'votre prochain', titleC: 'horizon.',
      sub: "Vols, hôtels, activités — un seul itinéraire, un seul devis, un seul paiement. La planification d'un voyage, en quelques minutes."
    },
    home: {
      catTitle: 'Explorer', catSub: 'par envie',
      categories: [
        { id: 'all', label: 'Tout' },
        { id: 'plage', label: 'Plage' },
        { id: 'montagne', label: 'Montagne' },
        { id: 'ville', label: 'Ville' },
        { id: 'aventure', label: 'Aventure' },
        { id: 'culture', label: 'Culture' }
      ],
      viewAll: 'Voir tout →',
      howTitle: 'Trois étapes,', howTitleEm: 'un seul séjour.',
      howSub: "VoyageVista réunit la recherche, la comparaison et la réservation dans un même flux.",
      steps: [
        { n: '01', t: 'Cherchez par envie', d: 'Choisissez une destination, des dates, un type de séjour. Notre moteur croise vols, hébergements et activités.' },
        { n: '02', t: "Composez l'itinéraire", d: 'Ajoutez des éléments au panier, ajustez les dates, remplacez un hôtel — le total se met à jour en direct.' },
        { n: '03', t: 'Réservez en un paiement', d: "Un seul checkout, une seule facture, une seule confirmation par email. Annulation flexible jusqu'à J-7." }
      ],
      featuredEyebrow: 'À LA UNE',
      featuredTitle: 'Sept jours à Shanghai',
      featuredSub: "Le séjour signature de l'été — quartiers, ruelles et tours sur les deux rives du Huangpu.",
      featuredCta: 'Voir le séjour →'
    },
    results: {
      crumb: ['Accueil', 'Destinations'],
      foundN: (n) => `${n} destinations`,
      sortBy: 'Trier par',
      sort: { popular: 'Populaires', priceAsc: 'Prix ↑', priceDesc: 'Prix ↓', rating: 'Mieux notés' },
      filters: 'Filtres',
      type: 'Type de séjour',
      budget: 'Budget / personne',
      duration: 'Durée',
      durations: ['1-3 jours', '4-7 jours', '8-14 jours', '15+ jours'],
      apply: 'Appliquer',
      reset: 'Réinitialiser',
      none: 'Aucune destination ne correspond. Élargissez vos filtres.'
    },
    detail: {
      crumb: ['Accueil', 'Destinations'],
      favorite: 'Favoris',
      share: 'Partager',
      reviews: (n) => `${n} avis`,
      tabs: ['Aperçu', 'Hébergements', 'Activités', 'Transport', 'Avis'],
      photos: '+12 photos',
      from: 'À partir de',
      perPerson: '/ personne',
      perNight: '/ nuit',
      total: 'Total estimé',
      addToCart: 'Ajouter à mon panier',
      addItem: 'Ajouter',
      added: 'Ajouté',
      includes: 'Ce qui est inclus',
      bookingCard: { title: 'Composer ce séjour', for2: 'Pour 2 adultes · 7 nuits' }
    },
    itinerary: {
      eyebrow: "COMPOSITION DE L'ITINÉRAIRE",
      title: 'Votre semaine,', titleEm: 'jour par jour.',
      sub: 'Cliquez sur une étape pour la modifier. Le total se recalcule en direct.',
      total: 'Coût total',
      checkout: 'Valider et payer'
    },
    cart: {
      eyebrow: 'PANIER',
      title: 'Récapitulatif', titleEm: 'de votre voyage.',
      empty: 'Votre panier est vide.',
      emptyCta: 'Explorer les destinations',
      remove: 'Retirer',
      edit: 'Modifier',
      summary: 'Récapitulatif',
      subtotal: 'Sous-total',
      taxes: 'Taxes & frais',
      total: 'Total',
      for: (n, d) => `Pour ${n} voyageur${n > 1 ? 's' : ''} · ${d} jours`,
      pay: 'Procéder au paiement',
      back: '← Continuer ma recherche'
    },
    pay: {
      eyebrow: 'PAIEMENT SIMULÉ',
      title: 'Dernier pas avant', titleEm: "l'embarquement.",
      method: 'Mode de paiement',
      card: 'Carte bancaire', paypal: 'PayPal', bank: 'Virement',
      cardNum: 'Numéro de carte',
      expiry: 'MM/AA',
      cvv: 'CVV',
      name: 'Nom du titulaire',
      pay: (amt) => `Payer ${amt} € (simulation)`,
      processing: 'Paiement en cours…',
      secured: 'Paiement 100% sécurisé · simulation pédagogique',
      success: 'Réservation confirmée',
      successSub: 'Une confirmation a été envoyée par email. Votre voyage commence ici.',
      home: "Retour à l'accueil",
      viewBook: 'Voir mes réservations'
    },
    account: {
      crumb: 'Mon compte',
      tabs: ['Mes réservations', 'Mes favoris', 'Mon profil', 'Notifications'],
      pending: 'En attente',
      confirmed: 'Confirmé',
      completed: 'Terminé',
      ref: 'Réf.',
      travelers: (n) => `${n} voyageur${n > 1 ? 's' : ''}`,
      modify: 'Modifier',
      cancel: 'Annuler',
      details: 'Détails',
      noBookings: "Aucune réservation pour l'instant."
    },
    admin: {
      eyebrow: 'ESPACE GESTIONNAIRE',
      title: 'Tableau de bord', titleEm: 'plateforme.',
      kpis: [
        { l: 'Réservations / mois', d: '+18% vs M-1' },
        { l: 'Utilisateurs actifs', d: '+6% vs M-1' },
        { l: 'CA généré', d: '+22% vs M-1' },
        { l: 'Taux conversion', d: '-0.4 pt vs M-1' }
      ],
      offersTitle: 'Offres en ligne',
      addOffer: '+ Nouvelle offre',
      cols: ['Destination', 'Type', 'Prix', 'Réserv.', 'Statut', '']
    },
    footer: {
      blurb: 'VoyageVista est une plateforme tout-en-un pour composer, réserver et vivre des voyages sur mesure.',
      cols: [
        { t: 'Produit', items: ['Destinations', 'Séjours signature', 'Cartes cadeaux', 'Application mobile'] },
        { t: 'Compagnie', items: ['À propos', 'Carrières', 'Presse', 'Partenaires'] },
        { t: 'Support', items: ["Centre d'aide", "Politique d'annulation", 'Nous contacter', 'Statut'] }
      ],
      legal: '© 2026 VoyageVista — Projet web ESGI · Maquette pédagogique'
    },
    auth: {
      signinTitle: 'Bon retour parmi nous.',
      signupTitle: 'Créer un compte VoyageVista.',
      email: 'Adresse e-mail',
      password: 'Mot de passe',
      name: 'Prénom & nom',
      forgot: 'Mot de passe oublié ?',
      noAccount: 'Pas encore de compte ?',
      hasAccount: 'Déjà un compte ?',
      signin: 'Se connecter',
      signup: "S'inscrire"
    }
  },
  en: {
    nav: { destinations: 'Destinations', stays: 'Stays', activities: 'Activities', transport: 'Transport' },
    cta: { signin: 'Sign in', signup: 'Sign up', account: 'Account', logout: 'Sign out' },
    search: {
      destination: 'Destination', destinationPh: 'Where would you like to go?',
      dates: 'Dates', datesPh: 'When?',
      travelers: 'Travelers',
      travelersVal: (t) => {
        const total = t.student + t.adult + t.child;
        if (total === 0) return 'Add';
        return `${total} traveler${total > 1 ? 's' : ''}`;
      },
      travTypes: {
        adult: { label: 'Adult', sub: '18 and over' },
        student: { label: 'Student', sub: 'Under 26 · proof required' },
        child: { label: 'Child', sub: 'Under 17' }
      },
      apply: 'Apply',
      type: 'Stay type',
      go: 'Search',
      monthsShort: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
      months: ['January','February','March','April','May','June','July','August','September','October','November','December'],
      weekdays: ['M','T','W','T','F','S','S'],
      datesNone: 'Select'
    },
    hero: {
      eyebrow: 'ALL-IN-ONE PLATFORM · SUMMER 2026',
      titleA: 'Compose', titleB: 'your next', titleC: 'horizon.',
      sub: 'Flights, hotels, activities — one itinerary, one quote, one payment. Trip planning, in minutes.'
    },
    home: {
      catTitle: 'Explore', catSub: 'by mood',
      categories: [
        { id: 'all', label: 'All' },
        { id: 'plage', label: 'Beach' },
        { id: 'montagne', label: 'Mountain' },
        { id: 'ville', label: 'City' },
        { id: 'aventure', label: 'Adventure' },
        { id: 'culture', label: 'Culture' }
      ],
      viewAll: 'View all →',
      howTitle: 'Three steps,', howTitleEm: 'one trip.',
      howSub: 'VoyageVista brings search, comparison and booking into a single flow.',
      steps: [
        { n: '01', t: 'Search by mood', d: 'Pick a destination, dates, a stay type. Our engine pairs flights, stays and activities.' },
        { n: '02', t: 'Compose the itinerary', d: 'Add items to the cart, swap a hotel, adjust dates — the total updates live.' },
        { n: '03', t: 'Book in one payment', d: 'One checkout, one invoice, one email confirmation. Flexible cancellation up to D-7.' }
      ],
      featuredEyebrow: 'FEATURED',
      featuredTitle: 'Seven days in Shanghai',
      featuredSub: "This summer's signature stay — neighborhoods, lanes and towers on both banks of the Huangpu.",
      featuredCta: 'View the stay →'
    },
    results: {
      crumb: ['Home', 'Destinations'],
      foundN: (n) => `${n} destinations`,
      sortBy: 'Sort by',
      sort: { popular: 'Popular', priceAsc: 'Price ↑', priceDesc: 'Price ↓', rating: 'Top rated' },
      filters: 'Filters',
      type: 'Stay type',
      budget: 'Budget / person',
      duration: 'Duration',
      durations: ['1-3 days', '4-7 days', '8-14 days', '15+ days'],
      apply: 'Apply',
      reset: 'Reset',
      none: 'No destination matches. Loosen your filters.'
    },
    detail: {
      crumb: ['Home', 'Destinations'],
      favorite: 'Favorite',
      share: 'Share',
      reviews: (n) => `${n} reviews`,
      tabs: ['Overview', 'Stays', 'Activities', 'Transport', 'Reviews'],
      photos: '+12 photos',
      from: 'From',
      perPerson: '/ person',
      perNight: '/ night',
      total: 'Estimated total',
      addToCart: 'Add to my trip',
      addItem: 'Add',
      added: 'Added',
      includes: "What's included",
      bookingCard: { title: 'Build this stay', for2: 'For 2 adults · 7 nights' }
    },
    itinerary: {
      eyebrow: 'ITINERARY BUILDER',
      title: 'Your week,', titleEm: 'day by day.',
      sub: 'Click a step to edit it. The total recalculates live.',
      total: 'Total cost',
      checkout: 'Validate & pay'
    },
    cart: {
      eyebrow: 'CART',
      title: 'Trip', titleEm: 'summary.',
      empty: 'Your cart is empty.',
      emptyCta: 'Browse destinations',
      remove: 'Remove',
      edit: 'Edit',
      summary: 'Summary',
      subtotal: 'Subtotal',
      taxes: 'Taxes & fees',
      total: 'Total',
      for: (n, d) => `For ${n} traveler${n > 1 ? 's' : ''} · ${d} days`,
      pay: 'Proceed to payment',
      back: '← Continue searching'
    },
    pay: {
      eyebrow: 'SIMULATED CHECKOUT',
      title: 'One last step', titleEm: 'before boarding.',
      method: 'Payment method',
      card: 'Card', paypal: 'PayPal', bank: 'Bank transfer',
      cardNum: 'Card number',
      expiry: 'MM/YY',
      cvv: 'CVV',
      name: 'Cardholder name',
      pay: (amt) => `Pay €${amt} (simulation)`,
      processing: 'Processing…',
      secured: '100% secure · academic simulation',
      success: 'Booking confirmed',
      successSub: 'A confirmation has been sent by email. Your trip starts here.',
      home: 'Back to home',
      viewBook: 'View my bookings'
    },
    account: {
      crumb: 'My account',
      tabs: ['My bookings', 'Favorites', 'Profile', 'Notifications'],
      pending: 'Pending',
      confirmed: 'Confirmed',
      completed: 'Completed',
      ref: 'Ref.',
      travelers: (n) => `${n} traveler${n > 1 ? 's' : ''}`,
      modify: 'Modify',
      cancel: 'Cancel',
      details: 'Details',
      noBookings: 'No bookings yet.'
    },
    admin: {
      eyebrow: 'MANAGER WORKSPACE',
      title: 'Platform', titleEm: 'dashboard.',
      kpis: [
        { l: 'Bookings / month', d: '+18% vs prev.' },
        { l: 'Active users', d: '+6% vs prev.' },
        { l: 'Revenue', d: '+22% vs prev.' },
        { l: 'Conversion rate', d: '-0.4 pt vs prev.' }
      ],
      offersTitle: 'Live offers',
      addOffer: '+ New offer',
      cols: ['Destination', 'Type', 'Price', 'Bookings', 'Status', '']
    },
    footer: {
      blurb: 'VoyageVista is an all-in-one platform to compose, book and live custom trips.',
      cols: [
        { t: 'Product', items: ['Destinations', 'Signature stays', 'Gift cards', 'Mobile app'] },
        { t: 'Company', items: ['About', 'Careers', 'Press', 'Partners'] },
        { t: 'Support', items: ['Help center', 'Cancellation policy', 'Contact us', 'Status'] }
      ],
      legal: '© 2026 VoyageVista — ESGI web project · Academic mockup'
    },
    auth: {
      signinTitle: 'Welcome back.',
      signupTitle: 'Create a VoyageVista account.',
      email: 'Email address',
      password: 'Password',
      name: 'Full name',
      forgot: 'Forgot password?',
      noAccount: 'No account yet?',
      hasAccount: 'Already have an account?',
      signin: 'Sign in',
      signup: 'Sign up'
    }
  }
};
