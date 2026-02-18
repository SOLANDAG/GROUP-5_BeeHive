export type ThemeType =
  | "bee"
  | "dark"
  | "sunset"
  | "flower"
  | "ocean"
  | "accessible";

export type AppTheme = {
  name: string;
  colors: {
    bg: string;
    card: string;
    primary: string;
    primarySoft: string;
    text: string;
    border: string;
    iconInactive: string;
    iconActive: string;
  };
  greetingImage: any;
};

export const THEMES: Record<ThemeType, AppTheme> = {
  bee: {
    name: "Bee (Original)",
    colors: {
      bg: "#FFF8E8",
      card: "#FFFFFF",
      primary: "#F4B400",
      primarySoft: "#FFE082",
      text: "#2D2A26",
      border: "#F0D9A7",
      iconInactive: "#A89C85",
      iconActive: "#F4B400",
    },
    greetingImage: require("@/app/assets/images/pinksparkle.jpg"),
  },

  dark: {
    name: "Dark Mode",
    colors: {
      bg: "#121212",
      card: "#1E1E1E",
      primary: "#F4B400",
      primarySoft: "#3A2F1A",
      text: "#FFFFFF",
      border: "#333",
      iconInactive: "#777",
      iconActive: "#F4B400",
    },
    greetingImage: require("@/app/assets/images/pinksparkle.jpg"),
  },

  sunset: {
    name: "Sunset",
    colors: {
      bg: "#FFF1F0",
      card: "#FFFFFF",
      primary: "#FF6F61",
      primarySoft: "#FFC1B6",
      text: "#3A2A28",
      border: "#FFD3CD",
      iconInactive: "#B88",
      iconActive: "#FF6F61",
    },
    greetingImage: require("@/app/assets/images/pinksparkle.jpg"),
  },

  flower: {
    name: "Flower",
    colors: {
      bg: "#FFF6FB",
      card: "#FFFFFF",
      primary: "#E91E63",
      primarySoft: "#F8BBD0",
      text: "#4A2A3C",
      border: "#FADADD",
      iconInactive: "#C48",
      iconActive: "#E91E63",
    },
    greetingImage: require("@/app/assets/images/pinksparkle.jpg"),
  },

  ocean: {
    name: "Ocean",
    colors: {
      bg: "#EAF6F9",
      card: "#FFFFFF",
      primary: "#0288D1",
      primarySoft: "#81D4FA",
      text: "#013A4A",
      border: "#B3E5FC",
      iconInactive: "#4C7F8C",
      iconActive: "#0288D1",
    },
    greetingImage: require("@/app/assets/images/pinksparkle.jpg"),
  },

  accessible: {
    name: "Accessible",
    colors: {
      bg: "#F5F5F5",
      card: "#FFFFFF",
      primary: "#005BBB",
      primarySoft: "#BFD7FF",
      text: "#111111",
      border: "#DDD",
      iconInactive: "#777",
      iconActive: "#005BBB",
    },
    greetingImage: require("@/app/assets/images/pinksparkle.jpg"),
  },
};
