import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { Language, t as translate } from "@/constants/i18n";

export type Role = "citizen" | "lifesaver";
export type ThemePref = "system" | "light" | "dark";

export type Permissions = {
  location: boolean;
  camera: boolean;
  network: boolean;
  notifications: boolean;
};

export type UserProfile = {
  name: string;
  phone: string;
  role: Role;
  bloodType: string;
  allergies: string;
  emergencyContact: string;
  credentialUploaded: boolean;
};

type State = {
  ready: boolean;
  language: Language;
  theme: ThemePref;
  silentSos: boolean;
  isAuthed: boolean;
  permissions: Permissions;
  profile: UserProfile;
};

type Ctx = State & {
  setLanguage: (l: Language) => void;
  setTheme: (t: ThemePref) => void;
  setSilentSos: (v: boolean) => void;
  setAuthed: (v: boolean) => void;
  setPermissions: (p: Partial<Permissions>) => void;
  setProfile: (p: Partial<UserProfile>) => void;
  t: (key: Parameters<typeof translate>[1]) => string;
  signOut: () => void;
};

const DEFAULT_PROFILE: UserProfile = {
  name: "",
  phone: "",
  role: "citizen",
  bloodType: "O+",
  allergies: "",
  emergencyContact: "",
  credentialUploaded: false,
};

const DEFAULT_PERMS: Permissions = {
  location: false,
  camera: false,
  network: false,
  notifications: false,
};

const STORAGE_KEY = "gatabazi:state:v1";

const AppContext = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [theme, setThemeState] = useState<ThemePref>("system");
  const [silentSos, setSilentSosState] = useState(false);
  const [isAuthed, setAuthedState] = useState(false);
  const [permissions, setPermissionsState] =
    useState<Permissions>(DEFAULT_PERMS);
  const [profile, setProfileState] = useState<UserProfile>(DEFAULT_PROFILE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.language) setLanguageState(parsed.language);
          if (parsed.theme) setThemeState(parsed.theme);
          if (typeof parsed.silentSos === "boolean")
            setSilentSosState(parsed.silentSos);
          if (typeof parsed.isAuthed === "boolean")
            setAuthedState(parsed.isAuthed);
          if (parsed.permissions)
            setPermissionsState({ ...DEFAULT_PERMS, ...parsed.permissions });
          if (parsed.profile)
            setProfileState({ ...DEFAULT_PROFILE, ...parsed.profile });
        }
      } catch {}
      setReady(true);
    })();
  }, []);

  const persist = useCallback(
    (next: Partial<State>) => {
      const snapshot = {
        language,
        theme,
        silentSos,
        isAuthed,
        permissions,
        profile,
        ...next,
      };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot)).catch(
        () => {},
      );
    },
    [language, theme, silentSos, isAuthed, permissions, profile],
  );

  const setLanguage = useCallback(
    (l: Language) => {
      setLanguageState(l);
      persist({ language: l });
    },
    [persist],
  );
  const setTheme = useCallback(
    (v: ThemePref) => {
      setThemeState(v);
      persist({ theme: v });
    },
    [persist],
  );
  const setSilentSos = useCallback(
    (v: boolean) => {
      setSilentSosState(v);
      persist({ silentSos: v });
    },
    [persist],
  );
  const setAuthed = useCallback(
    (v: boolean) => {
      setAuthedState(v);
      persist({ isAuthed: v });
    },
    [persist],
  );
  const setPermissions = useCallback(
    (p: Partial<Permissions>) => {
      setPermissionsState((prev) => {
        const next = { ...prev, ...p };
        persist({ permissions: next });
        return next;
      });
    },
    [persist],
  );
  const setProfile = useCallback(
    (p: Partial<UserProfile>) => {
      setProfileState((prev) => {
        const next = { ...prev, ...p };
        persist({ profile: next });
        return next;
      });
    },
    [persist],
  );
  const signOut = useCallback(() => {
    setAuthedState(false);
    setProfileState(DEFAULT_PROFILE);
    setPermissionsState(DEFAULT_PERMS);
    AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
  }, []);

  const t = useCallback(
    (key: Parameters<typeof translate>[1]) => translate(language, key),
    [language],
  );

  const value = useMemo<Ctx>(
    () => ({
      ready,
      language,
      theme,
      silentSos,
      isAuthed,
      permissions,
      profile,
      setLanguage,
      setTheme,
      setSilentSos,
      setAuthed,
      setPermissions,
      setProfile,
      signOut,
      t,
    }),
    [
      ready,
      language,
      theme,
      silentSos,
      isAuthed,
      permissions,
      profile,
      setLanguage,
      setTheme,
      setSilentSos,
      setAuthed,
      setPermissions,
      setProfile,
      signOut,
      t,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): Ctx {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
