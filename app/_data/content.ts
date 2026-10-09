// Company content for the ArreyWaah site.
// Sourced from arreywaah.com and the founder's public LinkedIn post.
// Contact details below are the only ones published online; add an email or
// phone number here when you have one and it will show up in the Contact section.

export const COMPANY = {
  name: "Arrey Waah Entertainment",
  short: "Arrey Waah",
  tagline: "A 360° creative agency and production house.",
  intro:
    "Music, video, digital content and brand strategy under one roof. We make the thing, and then we make people say it out loud: Arrey waah!",
  nameMeaning:
    "\u201CArrey waah\u201D is a Hindi exclamation of delight, surprise and admiration. That reaction is the whole brief.",
  website: "https://arreywaah.com",
  instagram: {
    handle: "@arreywaah.com__",
    url: "https://www.instagram.com/arreywaah.com__/",
  },
  email: "" as string,
  phone: "" as string,
};

export const NAV = [
  { href: "#services", label: "Services" },
  { href: "#work", label: "Work" },
  { href: "#waah-art", label: "Waah Art" },
  { href: "#team", label: "Team" },
  { href: "#about", label: "About" },
  { href: "#contact", label: "Contact" },
] as const;

export const SERVICES = [
  {
    title: "Video & film",
    body: "Music videos, TVC ads, film trailers and brand films, from script to final grade.",
    tags: ["Music videos", "TVC ads", "Trailers", "Brand films"],
  },
  {
    title: "Music",
    body: "Music videos and promotional tracks, plus music hunts that put new voices in front of an audience.",
    tags: ["Music videos", "Promo tracks", "Music hunts"],
  },
  {
    title: "Digital content",
    body: "Social-first content for brands, channels and promotions, built to be watched and shared.",
    tags: ["Social video", "Reels", "Promotions"],
  },
  {
    title: "Brand strategy",
    body: "A clear idea of who you are and how you sound, before a single frame is shot.",
    tags: ["Brand strategy", "Brand films", "Launches"],
  },
  {
    title: "Production house",
    body: "We produce content across entertainment, arts and music, and back the talent behind it.",
    tags: ["Production", "Post-production", "Talent"],
  },
  {
    title: "Waah Art",
    body: "Artwork and portraits, made to be kept.",
    tags: ["Portraits", "Artwork", "Commissions"],
  },
] as const;

export const WORK = [
  {
    title: "Ganu",
    kind: "Promotional track",
    detail: "Promotional track for the Marathi film Ganu.",
  },
  {
    title: "Ganesha - The Vighnaharta",
    kind: "Music video",
    detail: "Music video for Shemaroo.",
  },
  {
    title: "A Winter Tale at Shimla",
    kind: "Film trailer",
    detail: "Trailer for the film A Winter Tale at Shimla.",
  },
  {
    title: "Sawan Laaye",
    kind: "Music video",
    detail: "Made for Pocket Films.",
  },
  {
    title: "G-Art Brand Launch Film",
    kind: "Brand film",
    detail: "Launch film for G Art, with a behind-the-scenes making-of.",
  },
  {
    title: "Garnet Diwali Meet",
    kind: "Event film",
    detail: "Coverage of the Diwali meet for Garnet Interiors.",
  },
] as const;

export const WAAH_ART = {
  title: "Waah Art",
  body: "Alongside the films, we make artwork and portraits. It sits next to the film work, and it is led by our in-house fine artist.",
};

export const TEAM = [
  { name: "Prasad Balan", role: "Founder / Business Head" },
  { name: "Sagar Parker", role: "Executive Producer" },
  { name: "Samar Singh", role: "Creative Director" },
  { name: "Uday Kamble", role: "Creative Producer" },
  { name: "Vithal Nerurkar", role: "Fine Artist" },
] as const;

export const ABOUT = {
  lead: "We started where pixels met endless possibility, and decided that making digital experiences should never feel ordinary.",
  paragraphs: [
    "Arrey Waah began as a bet on experience. A 360° creative agency and production house for people who want their story told properly: by directors who dream in pixels and storytellers who know how to hold a room.",
    "We make music videos and TVC ads for brands, channels and promotions. We back new talent through music hunts. We paint portraits. Under all of it is one rule: the work should earn the reaction in our name.",
  ],
};
