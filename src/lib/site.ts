// Central place for spa details. Update these once the client confirms them.
export const site = {
  name: "All Eyez On You Beauty Spa",
  shortName: "All Eyez On You",
  tagline: "Beauty, hair and confidence — all eyez on you.",
  description:
    "Book your next beauty or hair appointment online and shop spa-quality products from All Eyez On You Beauty Spa.",
  phone: "000 000 0000",
  whatsapp: "27000000000", // international format, no +, used for wa.me links
  email: "hello@alleyezonyou.co.za",
  address: {
    line1: "Street address",
    suburb: "Suburb",
    city: "Johannesburg",
    postalCode: "0000",
  },
  // Used for the embedded Google Map on the contact page.
  mapQuery: "Johannesburg, South Africa",
  hours: [
    { days: "Tuesday – Friday", time: "08:00 – 18:00" },
    { days: "Saturday", time: "08:00 – 16:00" },
    { days: "Sunday – Monday", time: "Closed" },
  ],
  social: {
    instagram: "https://instagram.com/",
    facebook: "https://facebook.com/",
    tiktok: "https://tiktok.com/",
  },
  timeZone: "Africa/Johannesburg",
  // Booking rules
  slotIntervalMins: 30,
  minLeadMins: 60, // earliest bookable slot is this far from "now"
  maxAdvanceDays: 60,
  // Shop rules
  deliveryFeeCents: 10000,
  freeDeliveryFromCents: 75000,
};
