import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppTheme, ThemeType, THEMES } from "./theme";

type ThemeContextValue = {
  theme: AppTheme;
  themeName: ThemeType;
  setThemeName: (name: ThemeType) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [themeName, setThemeNameState] =
    useState<ThemeType>("bee");

  useEffect(() => {
    const loadTheme = async () => {
      const saved = await AsyncStorage.getItem("appTheme");
      if (saved && THEMES[saved as ThemeType]) {
        setThemeNameState(saved as ThemeType);
      }
    };
    loadTheme();
  }, []);

  const setThemeName = async (name: ThemeType) => {
    setThemeNameState(name);
    await AsyncStorage.setItem("appTheme", name);
  };

  const value = useMemo<ThemeContextValue>(() => {
    return {
      theme: THEMES[themeName],
      themeName,
      setThemeName,
    };
  }, [themeName]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx)
    throw new Error(
      "useTheme must be used within ThemeProvider"
    );
  return ctx;
}
