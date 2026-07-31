import colBracelets from "@/assets/col-bracelets.jpg";
import colAnklets from "@/assets/col-anklets.jpg";
import colWishingCards from "@/assets/col-wishing-cards.jpg";
import colNeckpieces from "@/assets/col-neckpieces.jpg";
import colNails from "@/assets/col-nails.jpg";
import colWaistChain from "@/assets/col-waist-chain.jpg";
import colScrunchies from "@/assets/col-scrunchies.jpg";
import colChocolates from "@/assets/col-chocolates.jpg";
import colClaw from "@/assets/col-claw.jpg";
import colEarrings from "@/assets/col-earrings.jpg";
import colRings from "@/assets/col-rings.jpg";
import colKeychains from "@/assets/col-keychains.jpg";
import colBouquet from "@/assets/col-bouquet.jpg";
import colCards from "@/assets/col-cards.jpg";
import colAlbums from "@/assets/col-albums.jpg";
import colPhoneCases from "@/assets/col-phone-cases.jpg";
import colHampers from "@/assets/col-hampers.jpg";

export type Collection = {
  slug: string;
  name: string;
  tagline: string;
  image: string;
};

/** The curated Suii Kala collections shown across Home, Shop and Collections. */
export const collections: Collection[] = [
  { slug: "bracelets", name: "Bracelets", tagline: "Wrist poetry", image: colBracelets },
  { slug: "anklets", name: "Anklets", tagline: "Soft chimes of gold", image: colAnklets },
  { slug: "wishing-cards", name: "Wishing Cards", tagline: "Words in gold foil", image: colWishingCards },
  { slug: "neckpieces", name: "Neckpieces", tagline: "Layered luxury", image: colNeckpieces },
  { slug: "nails", name: "Nails", tagline: "Hand-painted artistry", image: colNails },
  { slug: "waist-chain", name: "Waist Chain", tagline: "Heritage at the waist", image: colWaistChain },
  { slug: "scrunchies", name: "Scrunchies", tagline: "Everyday softness", image: colScrunchies },
  { slug: "chocolates", name: "Chocolates", tagline: "Sweet indulgence", image: colChocolates },
  { slug: "claw", name: "Claw", tagline: "Elegance, clipped", image: colClaw },
  { slug: "earrings", name: "Earrings", tagline: "Framed in light", image: colEarrings },
  { slug: "rings", name: "Rings", tagline: "Quiet statements", image: colRings },
  { slug: "keychains", name: "Keychains", tagline: "Little keepsakes", image: colKeychains },
  { slug: "bouquet", name: "Bouquet", tagline: "Blooms that stay", image: colBouquet },
  
  { slug: "cards-albums", name: "Cards & Albums", tagline: "Handwritten warmth & memories, bound", image: colAlbums }, // 👈 Yahan dono ko merge kar diya! (Aap colCards ya colAlbums dono mein se koi bhi image variable rakh sakte ho)
  
  { slug: "phone-cases", name: "Phone Cases", tagline: "Art in your palm", image: colPhoneCases },
];

/**
 * Gift Hampers is a standalone category (not one of the collections above).
 * Products belong to it via `products.category = 'gift-hampers'`.
 */
export const GIFT_HAMPERS = {
  slug: "gift-hampers",
  name: "Gift Hampers",
  tagline: "Curated with love",
  image: colHampers,
} as const;

/** Virtual listings that are not collection cards but still have their own page. */
const VIRTUAL: Collection[] = [
  { ...GIFT_HAMPERS },
  { slug: "new-launches", name: "New Launches", tagline: "Fresh off the studio table", image: colHampers },
];

export const findCollection = (slug: string): Collection | undefined =>
  collections.find((c) => c.slug === slug) ?? VIRTUAL.find((c) => c.slug === slug);

/** Signature edits that get their own dedicated sections rather than a card. */
export const SIGNATURE_COLLECTIONS = {
  hisFavourite: "his-favourites",
  desiDiva: "desi-diva",
} as const;