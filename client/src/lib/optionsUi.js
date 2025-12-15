// client/src/lib/optionsUi.js
// UI metadata for selectors (labels + icons/images)

import woodBlack from "../assets/wood_black.webp";
import woodWhite from "../assets/wood_white.webp";
import woodWalnut from "../assets/wood_walnut.jpg";
import woodNatural from "../assets/wood_natural.jpg";
import metalBlack from "../assets/metal_black.webp";
import metalGold from "../assets/metal_gold.webp";
import streched from "../assets/streched.webp";
import { MatNone, MatThin, MatClassic, MatGallery } from "../components/MatIcon.jsx";

export const FRAME_OPTIONS = [
  { id: "Black Wood", img: woodBlack },
  { id: "White Wood", img: woodWhite },
  { id: "Walnut Wood", img: woodWalnut },
  { id: "Natural Wood", img: woodNatural },
  { id: "Black Metal", img: metalBlack },
  { id: "Gold Metal", img: metalGold },
];

export const CANVAS_OPTIONS = [
  { id: "Stretched", img: streched },
  { id: "Black Wood", img: woodBlack },
  { id: "White Wood", img: woodWhite },
  { id: "Natural Wood", img: woodNatural },
]

export const MAT_OPTIONS = [
  { id: "None", Icon: MatNone },
  { id: "Thin", Icon: MatThin },
  { id: "Classic", Icon: MatClassic },
  { id: "Gallery", Icon: MatGallery },
];
