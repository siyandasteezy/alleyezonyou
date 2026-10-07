// Central place for spa details. Update these once the client confirms them.
export const site = {
  name: "All Eyez On You Beauty Spa",
  shortName: "All Eyez On You",
  tagline: "Beauty intensifi-eye-d. Lashes, brows and massages — all eyez on you.",
  description: "Book lashes, brows and massages online and shop spa-quality products from All Eyez On You Beauty Spa.",
  phone: "079 590 9009",
  altPhone: "065 367 5871",
  whatsapp: "27795909009", // international format, no +, used for wa.me links
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
    instagram: "https://www.instagram.com/all_eyez_on_you_spa/",
    facebook: "https://www.facebook.com/search/top?q=All%20Eyez%20On%20You%20Spa", // TODO: replace with page URL
    tiktok: "https://www.tiktok.com/@mpho_ditse",
  },
  // Courses are enquiry-only (not bookable time slots).
  training: [
    { name: "Eyelash course", priceCents: 370000 },
    { name: "5-in-1 course (microblading)", priceCents: 1000000 },
  ],
  timeZone: "Africa/Johannesburg",
  // Booking rules
  slotIntervalMins: 30,
  minLeadMins: 60, // earliest bookable slot is this far from "now"
  maxAdvanceDays: 60,
  // Shop rules
  deliveryFeeCents: 10000,
  freeDeliveryFromCents: 75000,
};
