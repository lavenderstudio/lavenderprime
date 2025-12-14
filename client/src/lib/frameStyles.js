// frameStyles.js
import zoomWalnut from "../assets/zoom_walnut.png";
import zoomNatural from "../assets/zoom_natural.png";

export const FRAME_STYLES = {
  "Black Wood": {
    border: "18px",
    background: "#0B0A0A",
  },
  "White Wood": {
    border: "18px",
    background: "#F3F3F3",
  },
  "Walnut Wood": {
    border: "18px",
    background: `url(${zoomWalnut})`,
  },
  "Natural Wood": {
    border: "18px",
    background: `url(${zoomNatural})`,
  },
  "Black Metal": {
    border: "8px",
    background: "#0B0A0A",
  },
  "Gold Metal": {
    border: "8px",
    background: "#DAA520",
  },
  "Print Frame": {
    border: "7px",
    background: "#F3F3F3",
  },
};

export const MAT_PADDING = {
  None: "0px",
  Thin: "24px",
  Classic: "48px",
  Gallery: "96px",
};
