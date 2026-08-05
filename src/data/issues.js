// Issue categories and subcategories
// Alessandro: fill these in with the agreed category list

export const issueCategories = [
  {
    id: 'delay',
    label: 'Delay / No show',
    subcategories: [
      { id: 'delay_long', label: 'Long wait at stop' },
      { id: 'delay_noshow', label: 'Vehicle did not arrive' },
      { id: 'delay_schedule', label: 'Does not match schedule' },
    ],
  },
  {
    id: 'crowding',
    label: 'Overcrowding',
    subcategories: [
      { id: 'crowd_full', label: 'Could not board — too full' },
      { id: 'crowd_uncomfortable', label: 'Uncomfortable conditions' },
    ],
  },
  {
    id: 'safety',
    label: 'Safety concern',
    subcategories: [
      { id: 'safety_driving', label: 'Dangerous driving' },
      { id: 'safety_harassment', label: 'Harassment or threat' },
      { id: 'safety_stop', label: 'Unsafe stop conditions' },
    ],
  },
  {
    id: 'accessibility',
    label: 'Accessibility',
    subcategories: [
      { id: 'access_ramp', label: 'Ramp / lift not working' },
      { id: 'access_info', label: 'Missing accessible information' },
    ],
  },
  {
    id: 'cleanliness',
    label: 'Cleanliness',
    subcategories: [
      { id: 'clean_vehicle', label: 'Dirty vehicle' },
      { id: 'clean_stop', label: 'Dirty stop / station' },
    ],
  },
  {
    id: 'info',
    label: 'Information / Signage',
    subcategories: [
      { id: 'info_display', label: 'Display not working' },
      { id: 'info_wrong', label: 'Wrong or missing information' },
    ],
  },
  {
    id: 'other',
    label: 'Other',
    subcategories: [],
  },
];
