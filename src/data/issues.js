// Issue categories and subcategories, from the project's "categorie sito" doc.
// The Italian wording is the source of truth; en/el/es are translations of it.
//
// Note: every category in the doc ends with "altro ______". That option is NOT
// listed here — IssueSelector adds an "Other" choice with a free-text box to
// every category automatically, so adding it here would duplicate it.

export function getLabel(labelObj, lang) {
  return labelObj?.[lang] ?? labelObj?.en ?? '';
}

export const issueCategories = [
  {
    id: 'delay',
    label: {
      it: 'Ritardo / Cancellazione',
      en: 'Delay / Cancellation',
      el: 'Καθυστέρηση / Ακύρωση',
      es: 'Retraso / Cancelación',
    },
    subcategories: [
      {
        id: 'delay_major',
        label: {
          it: 'Mezzo in forte ritardo (>15 min)',
          en: 'Vehicle severely delayed (>15 min)',
          el: 'Μεγάλη καθυστέρηση οχήματος (>15 λεπτά)',
          es: 'Vehículo con gran retraso (>15 min)',
        },
      },
      {
        id: 'delay_skipped',
        label: {
          it: 'Corsa saltata / Mezzo non arrivato',
          en: 'Service skipped / Vehicle never arrived',
          el: 'Ακυρωμένο δρομολόγιο / Το όχημα δεν ήρθε',
          es: 'Servicio cancelado / El vehículo no llegó',
        },
      },
      {
        id: 'delay_early',
        label: {
          it: 'Passato in anticipo',
          en: 'Passed by early',
          el: 'Πέρασε νωρίτερα',
          es: 'Pasó antes de tiempo',
        },
      },
    ],
  },

  {
    id: 'onboard_faults',
    label: {
      it: 'Guasti e Strumentazione a bordo',
      en: 'Faults and Onboard Equipment',
      el: 'Βλάβες και Εξοπλισμός Οχήματος',
      es: 'Averías y Equipamiento a bordo',
    },
    subcategories: [
      {
        id: 'fault_validator',
        label: {
          it: 'Obliteratrice / Convalidatrice guasta',
          en: 'Ticket validator out of order',
          el: 'Ακυρωτικό εισιτηρίων εκτός λειτουργίας',
          es: 'Validadora de billetes averiada',
        },
      },
      {
        id: 'fault_ticket_machine',
        label: {
          it: 'Guasto alla macchinetta per biglietti / non funziona il POS',
          en: 'Ticket machine broken / card payment not working',
          el: 'Βλάβη στο μηχάνημα εισιτηρίων / δεν λειτουργεί το POS',
          es: 'Máquina de billetes averiada / el TPV no funciona',
        },
      },
      {
        id: 'fault_climate',
        label: {
          it: 'Aria condizionata / Riscaldamento spento o guasto',
          en: 'Air conditioning / heating off or broken',
          el: 'Κλιματισμός / θέρμανση κλειστά ή χαλασμένα',
          es: 'Aire acondicionado / calefacción apagados o averiados',
        },
      },
      {
        id: 'fault_stop_button',
        label: {
          it: 'Pulsante prenotazione fermata non funzionante',
          en: 'Stop request button not working',
          el: 'Το κουμπί στάσης δεν λειτουργεί',
          es: 'El botón de parada solicitada no funciona',
        },
      },
      {
        id: 'fault_display_announcements',
        label: {
          it: 'Display / Annunci vocali guasti',
          en: 'Display / voice announcements broken',
          el: 'Οθόνη / ηχητικές ανακοινώσεις εκτός λειτουργίας',
          es: 'Pantalla / anuncios de voz averiados',
        },
      },
    ],
  },

  {
    id: 'cleanliness',
    label: {
      it: 'Pulizia e Decoro',
      en: 'Cleanliness and Upkeep',
      el: 'Καθαριότητα και Ευπρέπεια',
      es: 'Limpieza y Mantenimiento',
    },
    subcategories: [
      {
        id: 'clean_litter',
        label: {
          it: 'Rifiuti / Sporcizia a bordo',
          en: 'Litter / dirt onboard',
          el: 'Σκουπίδια / ακαθαρσίες στο όχημα',
          es: 'Basura / suciedad a bordo',
        },
      },
      {
        id: 'clean_vandalism',
        label: {
          it: 'Vandalismo',
          en: 'Vandalism',
          el: 'Βανδαλισμός',
          es: 'Vandalismo',
        },
      },
      {
        id: 'clean_fluids_odours',
        label: {
          it: 'Presenza di fluidi o odori sgradevoli',
          en: 'Spilled fluids or unpleasant smells',
          el: 'Υγρά ή δυσάρεστες οσμές',
          es: 'Fluidos derramados u olores desagradables',
        },
      },
    ],
  },

  {
    id: 'safety',
    label: {
      it: 'Sicurezza',
      en: 'Safety',
      el: 'Ασφάλεια',
      es: 'Seguridad',
    },
    subcategories: [
      {
        id: 'safety_harassment',
        label: {
          it: 'Molestie / Aggressioni verbali o fisiche',
          en: 'Harassment / verbal or physical assault',
          el: 'Παρενόχληση / λεκτική ή σωματική επίθεση',
          es: 'Acoso / agresión verbal o física',
        },
      },
      {
        id: 'safety_pickpockets',
        label: {
          it: 'Presenza di borseggiatori',
          en: 'Pickpockets present',
          el: 'Παρουσία πορτοφολάδων',
          es: 'Presencia de carteristas',
        },
      },
      {
        id: 'safety_driving',
        label: {
          it: 'Guida pericolosa o uso dello smartphone da parte del conducente',
          en: 'Dangerous driving or driver using a phone',
          el: 'Επικίνδυνη οδήγηση ή χρήση κινητού από τον οδηγό',
          es: 'Conducción peligrosa o uso del móvil por el conductor',
        },
      },
    ],
  },

  {
    id: 'accessibility',
    label: {
      it: 'Accessibilità',
      en: 'Accessibility',
      el: 'Προσβασιμότητα',
      es: 'Accesibilidad',
    },
    subcategories: [
      {
        id: 'access_ramp',
        label: {
          it: 'Rampa disabili/passeggini guasta o non azionata',
          en: 'Wheelchair/pushchair ramp broken or not deployed',
          el: 'Ράμπα ΑμεΑ/καροτσιών χαλασμένη ή δεν χρησιμοποιήθηκε',
          es: 'Rampa para sillas de ruedas/carritos averiada o no desplegada',
        },
      },
      {
        id: 'access_space_occupied',
        label: {
          it: 'Spazio disabili occupato impropriamente',
          en: 'Wheelchair space improperly occupied',
          el: 'Ο χώρος ΑμεΑ καταλαμβάνεται αντικανονικά',
          es: 'Espacio para sillas de ruedas ocupado indebidamente',
        },
      },
    ],
  },

  {
    id: 'stops_infrastructure',
    label: {
      it: 'Fermate e Strutture',
      en: 'Stops and Infrastructure',
      el: 'Στάσεις και Υποδομές',
      es: 'Paradas e Infraestructura',
    },
    subcategories: [
      {
        id: 'stop_display',
        label: {
          it: 'Display della fermata spento/errato',
          en: 'Stop display off or showing wrong information',
          el: 'Η οθόνη της στάσης είναι κλειστή ή δείχνει λάθος πληροφορίες',
          es: 'Pantalla de la parada apagada o con información errónea',
        },
      },
      {
        id: 'stop_shelter',
        label: {
          it: 'Pensilina danneggiata o imbrattata',
          en: 'Shelter damaged or defaced',
          el: 'Το στέγαστρο είναι κατεστραμμένο ή λερωμένο',
          es: 'Marquesina dañada o pintarrajeada',
        },
      },
      {
        id: 'stop_lighting',
        label: {
          it: 'Illuminazione fermata assente/scarsa',
          en: 'Stop lighting missing or poor',
          el: 'Ανύπαρκτος ή ανεπαρκής φωτισμός στη στάση',
          es: 'Iluminación de la parada ausente o insuficiente',
        },
      },
    ],
  },
];