import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { LanguageSheet } from "@/components/LanguageSheet";
import { LangSwitcher, PrimaryButton } from "@/components/Brand";
import { SosPulse } from "@/components/SosPulse";
import { useApp } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";

export default function Launchpad() {
  const c = useColors();
  const { language, setLanguage, silentSos, setSilentSos, isAuthed, t } = useApp();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const [langOpen, setLangOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const sheetAnim = useRef(new Animated.Value(0)).current;

  const openSheet = () => {
    setSheetOpen(true);
    Animated.timing(sheetAnim, {
      toValue: 1,
      duration: 320,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };
  const closeSheet = () => {
    Animated.timing(sheetAnim, {
      toValue: 0,
      duration: 260,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(() => setSheetOpen(false));
  };

  const handleSos = () => {
    router.push("/emergency");
  };

  const goPrimary = () => {
    if (isAuthed) router.push("/dashboard");
    else router.push("/register");
  };

  const sheetTranslate = sheetAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [400, 0],
  });

  const topInset = isWeb ? Math.max(insets.top, 67) : insets.top + 8;

  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      <LinearGradient
        colors={[
          c.background,
          c.background,
          silentSos ? "rgba(255,183,3,0.08)" : "rgba(230,57,70,0.08)",
        ]}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.topBar, { paddingTop: topInset }]}>
        <View style={styles.brand}>
          <View style={[styles.logoDot, { backgroundColor: c.primary }]} />
          <Text style={[styles.brandText, { color: c.foreground }]}>
            {t("appName")}
          </Text>
        </View>
        <View style={{ flexDirection: "row", gap: 8 }}>
          {isAuthed ? (
            <Pressable
              onPress={() => router.push("/settings")}
              hitSlop={12}
              style={[
                styles.iconBtn,
                { backgroundColor: c.card, borderColor: c.border },
              ]}
              accessibilityLabel="Settings"
            >
              <Feather name="settings" size={16} color={c.foreground} />
            </Pressable>
          ) : null}
          <LangSwitcher
            value={language.toUpperCase()}
            onPress={() => setLangOpen(true)}
          />
        </View>
      </View>

      <View style={styles.center}>
        <Text style={[styles.tagline, { color: c.mutedForeground }]}>
          {t("tagline")}
        </Text>
        <View style={{ height: 28 }} />
        <SosPulse
          silent={silentSos}
          onTrigger={handleSos}
          labelHold={t("holdSos")}
          labelSending={t("sending")}
        />

        <View style={{ height: 28 }} />
        <Pressable
          onPress={() => setSilentSos(!silentSos)}
          style={[
            styles.silentRow,
            { backgroundColor: c.card, borderColor: c.border, borderRadius: 999 },
          ]}
          accessibilityRole="switch"
          accessibilityState={{ checked: silentSos }}
        >
          <Feather
            name="shield"
            size={16}
            color={silentSos ? c.warning : c.mutedForeground}
          />
          <Text
            style={[
              styles.silentLabel,
              { color: silentSos ? c.warning : c.foreground },
            ]}
          >
            {silentSos ? t("silentSosOn") : t("silentSos")}
          </Text>
          <Switch
            value={silentSos}
            onValueChange={setSilentSos}
            thumbColor={silentSos ? c.warning : c.background}
            trackColor={{ false: c.border, true: "rgba(255,183,3,0.45)" }}
          />
        </Pressable>
      </View>

      <Pressable
        onPress={openSheet}
        style={[
          styles.bottomTab,
          {
            backgroundColor: c.card,
            borderColor: c.border,
            paddingBottom: Math.max(insets.bottom, isWeb ? 34 : 12),
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel={t("joinCommunity")}
      >
        <View style={[styles.handle, { backgroundColor: c.border }]} />
        <View style={styles.bottomRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.bottomTitle, { color: c.foreground }]}>
              {t("joinCommunity")}
            </Text>
            <Text style={[styles.bottomSub, { color: c.mutedForeground }]}>
              {t("scrollUp")}
            </Text>
          </View>
          <Feather name="chevron-up" size={22} color={c.mutedForeground} />
        </View>
      </Pressable>

      {sheetOpen ? (
        <Pressable
          style={[StyleSheet.absoluteFillObject, { backgroundColor: c.overlay }]}
          onPress={closeSheet}
        >
          <Animated.View
            onStartShouldSetResponder={() => true}
            style={[
              styles.joinSheet,
              {
                transform: [{ translateY: sheetTranslate }],
                backgroundColor: c.background,
                borderColor: c.border,
                paddingBottom: Math.max(insets.bottom + 16, 24),
              },
            ]}
          >
            <View style={[styles.handle, { backgroundColor: c.border }]} />
            <Text style={[styles.joinTitle, { color: c.foreground }]}>
              {isAuthed ? t("appName") : t("joinCommunity")}
            </Text>
            <Text style={[styles.joinSub, { color: c.mutedForeground }]}>
              {isAuthed
                ? t("signedIn")
                : t("signInPitch")}
            </Text>
            <View style={{ height: 16 }} />
            <PrimaryButton
              label={isAuthed ? t("continue") : t("createAccount")}
              icon="arrow-right"
              onPress={() => {
                closeSheet();
                setTimeout(goPrimary, 220);
              }}
            />
            {!isAuthed ? (
              <View style={{ marginTop: 14 }}>
                <PrimaryButton
                  variant="ghost"
                  label={t("signIn")}
                  onPress={() => {
                    closeSheet();
                    setTimeout(() => router.push("/register"), 220);
                  }}
                />
              </View>
            ) : null}
          </Animated.View>
        </Pressable>
      ) : null}

      <LanguageSheet
        visible={langOpen}
        current={language}
        onSelect={setLanguage}
        onClose={() => setLangOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  brand: { flexDirection: "row", alignItems: "center", gap: 8 },
  logoDot: { width: 10, height: 10, borderRadius: 5 },
  brandText: { fontFamily: "Inter_700Bold", fontSize: 18, letterSpacing: 0.5 },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 20 },
  tagline: { fontFamily: "Inter_500Medium", fontSize: 15 },
  silentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
  },
  silentLabel: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  bottomTab: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  handle: {
    alignSelf: "center",
    width: 44,
    height: 4,
    borderRadius: 2,
    marginBottom: 10,
  },
  bottomRow: { flexDirection: "row", alignItems: "center" },
  bottomTitle: { fontFamily: "Inter_700Bold", fontSize: 16 },
  bottomSub: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },
  joinSheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingTop: 12,
  },
  joinTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 24,
    marginTop: 6,
  },
  joinSub: { fontFamily: "Inter_400Regular", fontSize: 14, marginTop: 6 },
  demoLink: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderWidth: 1,
  },
  demoText: { fontFamily: "Inter_500Medium", fontSize: 13 },
});
