// Stock photography (Unsplash licence: free for commercial use, no attribution required).
// Swap these for the spa's own photos when they're available.

export type Photo = { src: string; alt: string; position?: string };

const u = (id: string) => `https://images.unsplash.com/photo-${id}`;

export const photos = {
  hero: {
    src: u("1632765866070-3fadf25d3d5b"),
    alt: "Woman with glowing skin and a natural afro",
    position: "50% 30%",
  },
  heroDetail: { src: u("1683719312734-e31de63957ab"), alt: "Close-up of full, fluffy lash extensions" },
  lashes: { src: u("1683719312734-e31de63957ab"), alt: "Close-up of volume lash extensions" },
  lashApplication: { src: u("1589710751893-f9a6770ad71b"), alt: "Lash technician applying extensions" },
  brows: { src: u("1564278692313-b2d65996fc93"), alt: "Brown eye with a defined, shaped brow" },
  semiPermanentBrows: {
    src: u("1783110782727-b1b79df0c06f"),
    alt: "Brow mapping before microblading",
    position: "50% 40%",
  },
  massages: { src: u("1696841212541-449ca29397cc"), alt: "Hot stone massage in a candle-lit room" },
  hotStones: { src: u("1600334129128-685c5582fd35"), alt: "Therapist placing hot stones along a client's back" },
  reflexology: { src: u("1675159364615-38e1f6b62282"), alt: "Reflexology foot massage" },
  backMassage: { src: u("1741522509438-a120c0bb5e88"), alt: "Therapist massaging a client's shoulders" },
  robe: {
    src: u("1609535895148-cf9f5c446290"),
    alt: "Smiling woman in a white robe holding a cup of coffee",
    position: "50% 30%",
  },
  glow: { src: u("1716827173458-8bde30d6c78f"), alt: "Woman with eyes closed, relaxed and glowing" },
  portrait: { src: u("1632765854612-9b02b6ec2b15"), alt: "Portrait of a woman with a natural afro" },
  portrait2: { src: u("1519699047748-de8e457a634e"), alt: "Portrait of a young woman with curly hair" },
  skincare: { src: u("1693004925174-d9e06209d0ee"), alt: "Woman applying cream to her cheek" },
  satin: { src: u("1617055407123-3d7130c1f940"), alt: "" },
} satisfies Record<string, Photo>;

/** Cover image per service category (falls back to the hero detail shot). */
export const categoryPhotos: Record<string, Photo> = {
  "Semi-Permanent Brows": photos.semiPermanentBrows,
  Brows: photos.brows,
  Lashes: photos.lashes,
  Massages: photos.massages,
};

// Six images: the 1st and 4th span two rows, which tiles a 4×2 grid (and 2×4 on mobile).
export const galleryPhotos: Photo[] = [
  photos.glow,
  photos.lashApplication,
  photos.hotStones,
  photos.portrait,
  photos.skincare,
  photos.robe,
];
