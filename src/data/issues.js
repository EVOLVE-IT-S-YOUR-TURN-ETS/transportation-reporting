// Issue categories and subcategories.
// `label` is now an object keyed by language code (en, it, el, es).
// Use getLabel(obj, lang) to read the right one with an English fallback.

export function getLabel(labelObj, lang) {
  return labelObj?.[lang] ?? labelObj?.en ?? '';
}

export const issueCategories = [
  {
    id: 'delay',
    label: {
      en: 'Delay / No show',
      it: 'Ritardo / Mezzo non arrivato',
      el: 'Καθυστέρηση / Δεν ήρθε',
      es: 'Retraso / No llegó',
    },
    subcategories: [
      {
        id: 'delay_long',
        label: {
          en: 'Long wait at stop',
          it: 'Lunga attesa alla fermata',
          el: 'Μεγάλη αναμονή στη στάση',
          es: 'Espera larga en la parada',
        },
      },
      {
        id: 'delay_noshow',
        label: {
          en: 'Vehicle did not arrive',
          it: 'Il mezzo non è arrivato',
          el: 'Το όχημα δεν ήρθε',
          es: 'El vehículo no llegó',
        },
      },
      {
        id: 'delay_schedule',
        label: {
          en: 'Does not match schedule',
          it: "Non rispetta l'orario",
          el: 'Δεν ταιριάζει με το πρόγραμμα',
          es: 'No coincide con el horario',
        },
      },
    ],
  },
  {
    id: 'crowding',
    label: {
      en: 'Overcrowding',
      it: 'Sovraffollamento',
      el: 'Υπερπλήρωση',
      es: 'Sobrecupo',
    },
    subcategories: [
      {
        id: 'crowd_full',
        label: {
          en: 'Could not board — too full',
          it: 'Impossibile salire — troppo pieno',
          el: 'Δεν μπόρεσα να επιβιβαστώ — ήταν γεμάτο',
          es: 'No pude subir — estaba muy lleno',
        },
      },
      {
        id: 'crowd_uncomfortable',
        label: {
          en: 'Uncomfortable conditions',
          it: 'Condizioni scomode',
          el: 'Άβολες συνθήκες',
          es: 'Condiciones incómodas',
        },
      },
    ],
  },
  {
    id: 'safety',
    label: {
      en: 'Safety concern',
      it: 'Problema di sicurezza',
      el: 'Θέμα ασφάλειας',
      es: 'Problema de seguridad',
    },
    subcategories: [
      {
        id: 'safety_driving',
        label: {
          en: 'Dangerous driving',
          it: 'Guida pericolosa',
          el: 'Επικίνδυνη οδήγηση',
          es: 'Conducción peligrosa',
        },
      },
      {
        id: 'safety_harassment',
        label: {
          en: 'Harassment or threat',
          it: 'Molestie o minacce',
          el: 'Παρενόχληση ή απειλή',
          es: 'Acoso o amenaza',
        },
      },
      {
        id: 'safety_stop',
        label: {
          en: 'Unsafe stop conditions',
          it: 'Fermata non sicura',
          el: 'Μη ασφαλής στάση',
          es: 'Parada insegura',
        },
      },
    ],
  },
  {
    id: 'accessibility',
    label: {
      en: 'Accessibility',
      it: 'Accessibilità',
      el: 'Προσβασιμότητα',
      es: 'Accesibilidad',
    },
    subcategories: [
      {
        id: 'access_ramp',
        label: {
          en: 'Ramp / lift not working',
          it: 'Rampa / pedana non funzionante',
          el: 'Ράμπα / ανελκυστήρας εκτός λειτουργίας',
          es: 'Rampa / elevador no funciona',
        },
      },
      {
        id: 'access_info',
        label: {
          en: 'Missing accessible information',
          it: 'Informazioni accessibili mancanti',
          el: 'Λείπουν προσβάσιμες πληροφορίες',
          es: 'Falta información accesible',
        },
      },
    ],
  },
  {
    id: 'cleanliness',
    label: {
      en: 'Cleanliness',
      it: 'Pulizia',
      el: 'Καθαριότητα',
      es: 'Limpieza',
    },
    subcategories: [
      {
        id: 'clean_vehicle',
        label: {
          en: 'Dirty vehicle',
          it: 'Mezzo sporco',
          el: 'Βρώμικο όχημα',
          es: 'Vehículo sucio',
        },
      },
      {
        id: 'clean_stop',
        label: {
          en: 'Dirty stop / station',
          it: 'Fermata / stazione sporca',
          el: 'Βρώμικη στάση / σταθμός',
          es: 'Parada / estación sucia',
        },
      },
    ],
  },
  {
    id: 'info',
    label: {
      en: 'Information / Signage',
      it: 'Informazioni / Segnaletica',
      el: 'Πληροφορίες / Σήμανση',
      es: 'Información / Señalización',
    },
    subcategories: [
      {
        id: 'info_display',
        label: {
          en: 'Display not working',
          it: 'Display non funzionante',
          el: 'Η οθόνη δεν λειτουργεί',
          es: 'Pantalla no funciona',
        },
      },
      {
        id: 'info_wrong',
        label: {
          en: 'Wrong or missing information',
          it: 'Informazioni errate o mancanti',
          el: 'Λανθασμένες ή ελλιπείς πληροφορίες',
          es: 'Información incorrecta o faltante',
        },
      },
    ],
  },
  {
    id: 'other',
    label: {
      en: 'Other',
      it: 'Altro',
      el: 'Άλλο',
      es: 'Otro',
    },
    subcategories: [],
  },
];
