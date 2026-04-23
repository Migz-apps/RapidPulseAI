import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";

const DEFAULT_DEST = {
  name: "King Faisal Hospital",
  distance: "2.3 km",
  eta: "6 min",
  phone: "+250788123456",
  address: "KG 544 St, Kacyiru, Kigali",
};

const SAMU_NUMBER = "912";

const ROUTE_STEPS = [
  { dist: "350 m", instr: "Head north on KN 2 Ave" },
  { dist: "1.1 km", instr: "Turn right onto KG 9 Ave" },
  { dist: "850 m", instr: "Continue onto KG 11 Ave" },
  { dist: "Arrive", instr: "King Faisal Hospital on the right" },
];

const NEARBY_VICTIM = {
  name: "Aline U.",
  bloodType: "O-",
  allergies: "Penicillin",
};

export default function Incident() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const { t, silentSos } = useApp();
  const params = useLocalSearchParams<{ destName?: string; destKind?: string }>();
  const destName = (params.destName as string) || DEFAULT_DEST.name;
  const destKind = (params.destKind as string) || "hospital";
  const HOSPITAL = { ...DEFAULT_DEST, name: destName };

  const [showHandshake, setShowHandshake] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const blink = useRef(new Animated.Value(0)).current;
  const heroAnim = useRef(new Animated.Value(0)).current;
  const dash = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(heroAnim, {
      toValue: 1,
      duration: 600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(blink, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(blink, {
          toValue: 0.4,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    Animated.loop(
      Animated.timing(dash, {
        toValue: 1,
        duration: 1600,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();

    const tick = setInterval(() => setElapsed((e) => e + 1), 1000);
    const handshakeTimer = setTimeout(() => setShowHandshake(true), 2400);
    return () => {
      clearInterval(tick);
      clearTimeout(handshakeTimer);
    };
  }, [blink, heroAnim, dash]);

  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");

  const cancel = () => router.replace("/");

  const callHospital = () => {
    Linking.openURL(`tel:${HOSPITAL.phone}`).catch(() => {});
  };

  const callSamu = () => {
    Linking.openURL(`tel:${SAMU_NUMBER}`).catch(() => {});
  };

  const topInset = isWeb ? Math.max(insets.top, 67) : insets.top + 8;
  const accent = silentSos ? c.warning : c.primary;

  const dashTranslate = dash.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 12],
  });

  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      <View
        style={[
          styles.statusBar,
          { backgroundColor: accent, paddingTop: topInset, paddingBottom: 14 },
        ]}
      >
        <Animated.View
          style={{
            opacity: blink,
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
          }}
        >
          <View style={styles.liveDot} />
          <Text style={styles.statusTitle}>
            {silentSos ? t("silentSosOn") : t("helpComing")}
          </Text>
        </Animated.View>
        <Text style={styles.statusTimer}>
          {mm}:{ss}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingBottom: Math.max(insets.bottom, isWeb ? 40 : 24) + 200,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.mapWrap, { backgroundColor: c.muted }]}>
          <LinearGradient
            colors={["rgba(29,53,87,0.12)", "rgba(42,157,143,0.10)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <MapGrid color={c.border} />

          <View style={[styles.routeWrap]} pointerEvents="none">
            {Array.from({ length: 12 }).map((_, i) => (
              <Animated.View
                key={i}
                style={{
                  position: "absolute",
                  left: i * 22,
                  top: 0,
                  width: 14,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: accent,
                  opacity: 0.85,
                  transform: [{ translateX: dashTranslate }],
                }}
              />
            ))}
          </View>

          <Animated.View
            style={[
              styles.victimMarker,
              {
                backgroundColor: accent,
                transform: [{ scale: heroAnim }],
              },
            ]}
          >
            <View style={[styles.markerInner, { borderColor: "#fff" }]} />
          </Animated.View>

          <View
            style={[
              styles.hospitalMarker,
              { backgroundColor: destKind === "police" ? c.secondary : c.accent },
            ]}
          >
            <Feather
              name={destKind === "police" ? "shield" : "plus"}
              size={14}
              color="#fff"
            />
          </View>

          <View style={[styles.youPill, { backgroundColor: c.foreground }]}>
            <Text style={[styles.youPillText, { color: c.background }]}>
              {t("you")}
            </Text>
          </View>
          <View style={[styles.hospitalPill, { backgroundColor: c.accent }]}>
            <Text style={styles.hospitalPillText}>{HOSPITAL.name}</Text>
          </View>

          <View style={[styles.etaBadge, { backgroundColor: c.foreground }]}>
            <Feather name="navigation-2" size={12} color={c.background} />
            <Text style={[styles.etaBadgeText, { color: c.background }]}>
              {HOSPITAL.distance} · {HOSPITAL.eta}
            </Text>
          </View>
        </View>

        <View style={styles.hospitalSection}>
          <Text style={[styles.hospitalTitle, { color: c.foreground }]}>
            {HOSPITAL.name}
          </Text>
          <Text style={[styles.hospitalAddress, { color: c.mutedForeground }]}>
            {HOSPITAL.address}
          </Text>

          <View style={{ height: 14 }} />
          <Text style={[styles.routeHeader, { color: c.foreground }]}>
            {t("openInMaps")}
          </Text>
          <View style={{ height: 6 }} />
          {ROUTE_STEPS.map((s, i) => (
            <View key={i} style={styles.routeStep}>
              <View style={[styles.stepDot, { backgroundColor: accent }]} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.stepInstr, { color: c.foreground }]}>
                  {s.instr}
                </Text>
                <Text style={[styles.stepDist, { color: c.mutedForeground }]}>
                  {s.dist}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {showHandshake ? (
          <View style={styles.handshakeWrap}>
            <View style={[styles.handshakeBar, { backgroundColor: c.accent }]} />
            <View style={styles.handshakeInner}>
              <View style={styles.handshakeHead}>
                <Feather name="users" size={16} color={c.accent} />
                <Text style={[styles.handshakeTitle, { color: c.foreground }]}>
                  {t("victimProfile")}
                </Text>
              </View>
              <Text style={[styles.handshakeName, { color: c.foreground }]}>
                {NEARBY_VICTIM.name}
              </Text>
              <View style={styles.handshakeMetaRow}>
                <View style={styles.handshakeMetaCol}>
                  <Text style={[styles.handshakeLabel, { color: c.mutedForeground }]}>
                    {t("bloodType")}
                  </Text>
                  <Text style={[styles.handshakeValue, { color: c.primary }]}>
                    {NEARBY_VICTIM.bloodType}
                  </Text>
                </View>
                <View style={styles.handshakeMetaCol}>
                  <Text style={[styles.handshakeLabel, { color: c.mutedForeground }]}>
                    {t("allergies")}
                  </Text>
                  <Text style={[styles.handshakeValue, { color: c.foreground }]}>
                    {NEARBY_VICTIM.allergies}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        ) : null}
      </ScrollView>

      <View
        style={[
          styles.actionsBar,
          {
            backgroundColor: c.background,
            borderTopColor: c.border,
            paddingBottom: Math.max(insets.bottom, isWeb ? 34 : 16),
          },
        ]}
      >
        <Pressable
          onPress={callHospital}
          style={({ pressed }) => [
            styles.callBtn,
            {
              backgroundColor: c.primary,
              borderRadius: c.radius,
              opacity: pressed ? 0.9 : 1,
            },
          ]}
        >
          <Feather name="phone-call" size={18} color="#fff" />
          <Text style={styles.callBtnText}>
            {t("callButton")} {HOSPITAL.name}
          </Text>
        </Pressable>

        <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
          <Pressable
            onPress={callSamu}
            style={({ pressed }) => [
              styles.samuBtn,
              {
                backgroundColor: c.accent,
                borderRadius: c.radius,
                opacity: pressed ? 0.9 : 1,
              },
            ]}
          >
            <Feather name="truck" size={16} color="#fff" />
            <Text style={styles.samuBtnText}>{t("ambulanceNumber")}</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push("/triage")}
            style={[
              styles.triageBtn,
              { backgroundColor: c.foreground, borderRadius: c.radius },
            ]}
          >
            <Feather name="camera" size={16} color={c.background} />
            <Text style={[styles.triageText, { color: c.background }]}>
              {t("takePhoto")}
            </Text>
          </Pressable>
        </View>
        <Pressable
          onPress={cancel}
          style={[
            styles.cancelBtn,
            { borderColor: c.border, borderRadius: c.radius },
          ]}
        >
          <Feather name="x" size={14} color={c.mutedForeground} />
          <Text style={[styles.cancelText, { color: c.mutedForeground }]}>
            {t("cancelSos")}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function MapGrid({ color }: { color: string }) {
  const lines: React.ReactNode[] = [];
  for (let i = 1; i < 8; i++) {
    lines.push(
      <View
        key={`h${i}`}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: `${i * 12.5}%`,
          height: 1,
          backgroundColor: color,
          opacity: 0.5,
        }}
      />,
    );
    lines.push(
      <View
        key={`v${i}`}
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: `${i * 12.5}%`,
          width: 1,
          backgroundColor: color,
          opacity: 0.5,
        }}
      />,
    );
  }
  return <>{lines}</>;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  statusBar: {
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#fff" },
  statusTitle: {
    color: "#fff",
    fontFamily: "Inter_700Bold",
    fontSize: 16,
  },
  statusTimer: {
    color: "#fff",
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    letterSpacing: 1,
  },
  mapWrap: {
    height: 300,
    margin: 16,
    borderRadius: 24,
    overflow: "hidden",
    position: "relative",
  },
  routeWrap: {
    position: "absolute",
    top: "62%",
    left: "20%",
    width: 200,
    height: 4,
    transform: [{ rotate: "-28deg" }],
    overflow: "hidden",
  },
  victimMarker: {
    position: "absolute",
    top: "62%",
    left: "18%",
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  markerInner: { width: 10, height: 10, borderRadius: 5, borderWidth: 2 },
  hospitalMarker: {
    position: "absolute",
    top: "20%",
    right: "16%",
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  youPill: {
    position: "absolute",
    top: "62%",
    left: "8%",
    transform: [{ translateY: -28 }],
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  youPillText: {
    fontFamily: "Inter_700Bold",
    fontSize: 10,
    letterSpacing: 0.5,
  },
  hospitalPill: {
    position: "absolute",
    top: "20%",
    right: "10%",
    transform: [{ translateY: -22 }],
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    maxWidth: 140,
  },
  hospitalPillText: {
    color: "#fff",
    fontFamily: "Inter_700Bold",
    fontSize: 10,
    letterSpacing: 0.3,
  },
  etaBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  etaBadgeText: { fontFamily: "Inter_700Bold", fontSize: 12 },
  hospitalSection: { paddingHorizontal: 20, paddingTop: 4 },
  hospitalTitle: { fontFamily: "Inter_700Bold", fontSize: 22 },
  hospitalAddress: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    marginTop: 4,
  },
  routeHeader: {
    fontFamily: "Inter_700Bold",
    fontSize: 13,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  routeStep: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingVertical: 10,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 5,
  },
  stepInstr: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  stepDist: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },
  handshakeWrap: {
    marginTop: 10,
    marginHorizontal: 20,
    flexDirection: "row",
  },
  handshakeBar: { width: 4, borderRadius: 2 },
  handshakeInner: { flex: 1, paddingLeft: 14 },
  handshakeHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  handshakeTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 13,
    letterSpacing: 0.4,
  },
  handshakeName: { fontFamily: "Inter_700Bold", fontSize: 18 },
  handshakeMetaRow: { flexDirection: "row", gap: 28, marginTop: 10 },
  handshakeMetaCol: { gap: 4 },
  handshakeLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  handshakeValue: { fontFamily: "Inter_700Bold", fontSize: 16 },
  actionsBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  callBtn: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  callBtnText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 16 },
  samuBtn: {
    flex: 1,
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  samuBtnText: { color: "#fff", fontFamily: "Inter_600SemiBold", fontSize: 14 },
  triageBtn: {
    flex: 1,
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  triageText: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  cancelBtn: {
    marginTop: 10,
    minHeight: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
  },
  cancelText: { fontFamily: "Inter_500Medium", fontSize: 13 },
});
