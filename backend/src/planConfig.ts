export const PLAN_PRICES = {
  'Sonho': 4.90,
  'Eterno': 29.90,
  'Infinito': 49.90,
};

export const PLAN_FEATURES = {
  'Gratis': {
    imageLimit: 1,
    allowYoutube: false,
    allowPasswordProtection: false,
    allowCustomButton: false,
  },
  'Sonho': {
    imageLimit: 1,
    allowYoutube: false,
    allowPasswordProtection: false,
    allowCustomButton: false,
  },
  'Eterno': {
    imageLimit: 10,
    allowYoutube: true,
    allowPasswordProtection: true,
    allowCustomButton: true,
  },
  'Infinito': {
    imageLimit: 20, // Assuming 20 is the max for now, can be 'unlimited'
    allowYoutube: true,
    allowPasswordProtection: true,
    allowCustomButton: true,
  }
};
