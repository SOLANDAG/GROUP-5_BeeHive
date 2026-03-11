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

    headerBg: string;
    headerText: string;

    tabActive: string;
    tabInactive: string;

    iconInactive: string;

    searchBg: string;
    placeholder: string;

    greetingQuestion: "#FFFFFF",

    greetingTitle: string;
    greetingName: string;

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

      headerBg: "#FFF8E8",
      headerText: "#2D2A26",

      tabActive: "#F4B400",
      tabInactive: "#A89C85",

      iconInactive: "#A89C85",

      searchBg: "rgba(255,255,255,0.95)",
      placeholder: "#999",
      
      greetingQuestion: "#FFFFFF",

      greetingTitle: "#FFFFFF",
      greetingName: "#FFFFFF",
      
    },

    greetingImage: require("@/app/assets/images/bee.jpg"),
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

      headerBg: "#1E1E1E",
      headerText: "#FFFFFF",

      tabActive: "#F4B400",
      tabInactive: "#777",

      iconInactive: "#777",

      searchBg: "#2A2A2A",
      placeholder: "#AAA",

      greetingQuestion: "#FFFFFF",

      greetingTitle: "#FFFFFF",
      greetingName: "#F4B400",
      
    },

    greetingImage: require("@/app/assets/images/greysparkle.jpg"),
  },

  flower: {
    name: "Flower",
    colors: {
      bg: "#FFF6FB",
      card: "#FFFFFF",
      primary: "rgb(230, 44, 137)",
      primarySoft: "#F8BBD0",
      text: "#4A2A3C",
      border: "#FADADD",

      headerBg: "#FFF6FB",
      headerText: "#4A2A3C",

      tabActive: "rgb(230, 44, 137)",
      tabInactive: "rgb(207, 121, 164)",

      iconInactive: "rgb(207, 121, 164)",

      searchBg: "#FFFFFF",
      placeholder: "rgb(207, 121, 164)",

      greetingQuestion: "#FFFFFF",

      greetingTitle: "#FFFFFF",
      greetingName: "#FFFFFF",

    },

    greetingImage: require("@/app/assets/images/flowersbloom.jpg"),
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

      headerBg: "#EAF6F9",
      headerText: "#013A4A",

      tabActive: "#0288D1",
      tabInactive: "#4C7F8C",

      iconInactive: "#4C7F8C",

      searchBg: "#FFFFFF",
      placeholder: "#4C7F8C",

      greetingQuestion: "#FFFFFF",

      greetingTitle: "#FFFFFF",
      greetingName: "#FFFFFF",

    },

    greetingImage: require("@/app/assets/images/bluesparkle.jpg"),
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

      headerBg: "#FFF1F0",
      headerText: "#3A2A28",

      tabActive: "#FF6F61",
      tabInactive: "#B88",

      iconInactive: "#B88",

      searchBg: "#FFFFFF",
      placeholder: "#B88",

      greetingQuestion: "#FFFFFF",

      greetingTitle: "#FFFFFF",
      greetingName: "#FFFFFF",

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

      headerBg: "#FFFFFF",
      headerText: "#111111",

      tabActive: "#005BBB",
      tabInactive: "#777",

      iconInactive: "#777",

      searchBg: "#FFFFFF",
      placeholder: "#555",

      greetingQuestion: "#FFFFFF",

      greetingTitle: "#FFFFFF",
      greetingName: "#FFFFFF",
      
    },

    greetingImage: require("@/app/assets/images/bricks.jpg"),
  },
};
