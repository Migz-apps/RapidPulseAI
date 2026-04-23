import { useColorScheme } from "react-native";

import colors from "@/constants/colors";
import { useApp } from "@/contexts/AppContext";

export function useColors() {
  const systemScheme = useColorScheme();
  let theme = colors.light;
  try {
    const { theme: themePref } = useApp();
    const effective =
      themePref === "system" ? systemScheme : themePref;
    theme = effective === "dark" ? colors.dark : colors.light;
  } catch {
    theme = systemScheme === "dark" ? colors.dark : colors.light;
  }
  return { ...theme, radius: colors.radius };
}
