// frameStyles.js
import zoomWalnut from "../assets/zoom_walnut.png";
import zoomNatural from "../assets/zoom_natural.png";

export const FRAME_STYLES = {
  "Stretched": {
    border: "0px",
    background: "#ffffff",
  },
  "Black Wood": {
    border: "18px",
    background: "#0B0A0A",
  },
  "White Wood": {
    border: "18px",
    background: "#F3F3F3",
  },
  "Natural Wood": {
    border: "18px",
    background: `url(${zoomNatural})`,
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

export const MINI_FRAME_MAT_PADDING = {
  Classic: "24px",
  Modern: "0px",
};
