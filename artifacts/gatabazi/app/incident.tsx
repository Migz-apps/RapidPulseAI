import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
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

const HOSPITAL = {
  name: "King Faisal Hospital",
  distance: "2.3 km",
  eta: "6 min",
  phone: "+250788123456",
  lat: -1.9536,
  lng: 30.0922,
};

const SAMU_NUMBER = "912";

const NEARBY_VICTIM = {
  name: "Aline U.",
  bloodType: "O-",
  allergies: "Penicillin",
};

type Stage = "responder" | "hospital";

export default function Incident() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const { t, silentSos } = useApp();

  const [stage, setStage] = useState<Stage>("responder");
  const [showHandshake, setShowHandshake] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const blink = useRef(new Animated.Value(0)).current;
  const heroAnim = useRef(new Animated.Value(0)).current;

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

    const tick = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(tick);
  }, [blink, heroAnim]);

  useEffect(() => {
    if (stage === "hospital") {
      const handshakeTimer = setTimeout(() => setShowHandshake(true), 2400);
      return () => clearTimeout(handshakeTimer);
    }
    return undefined;
  }, [stage]);

  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");

  const cancel = () => router.replace("/");

  const callHospital = () => {
    Linking.openURL(`tel:${HOSPITAL.phone}`).catch(() => {});
  };

  const openMaps = () => {
    const url = Platform.select({
      ios: `https://maps.apple.com/?daddr=${HOSPITAL.lat},${HOSPITAL.lng}&dirflg=d`,
      default: `https://www.google.com/maps/dir/?api=1&destination=${HOSPITAL.lat},${HOSPITAL.lng}&travelmode=driving`,
    })!;
    Linking.openURL(url).catch(() => {});
  };

  const callSamu = () => {
    Linking.openURL(`tel:${SAMU_NUMBER}`).catch(() => {});
    setTimeout(() => router.replace("/"), 400);
  };

  const topInset = isWeb ? Math.max(insets.top, 67) : insets.top + 8;
  const accent = silentSos ? c.warning : c.primary;

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

      {stage === "responder" ? (
        <ScrollView
          contentContainerStyle={{
            padding: 20,
            paddingBottom: Math.max(insets.bottom, isWeb ? 40 : 24) + 110,
            gap: 14,
          }}
        >
          <Text style={[styles.bigTitle, { color: c.foreground }]}>
            {t("chooseResponder")}
          </Text>
          <Text style={[styles.bigSub, { color: c.mutedForeground }]}>
            {t("emergencyHint")}
          </Text>

          <View style={{ height: 6 }} />

          <Pressable
            onPress={() => setStage("hospital")}
            style={({ pressed }) => [
              styles.responderBtn,
              {
                backgroundColor: c.secondary,
                borderRadius: c.radius + 4,
                opacity: pressed ? 0.9 : 1,
              },
            ]}
          >
            <View
              style={[
                styles.responderIcon,
                { backgroundColor: "rgba(255,255,255,0.18)" },
              ]}
            >
              <Feather name="plus-square" size={24} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.responderTitle}>{t("hospitalResponder")}</Text>
              <Text style={styles.responderDesc}>
                {HOSPITAL.name} · {HOSPITAL.distance} · ETA {HOSPITAL.eta}
              </Text>
            </View>
            <Feather name="chevron-right" size={22} color="#fff" />
          </Pressable>

          <Pressable
            onPress={callSamu}
            style={({ pressed }) => [
              styles.responderBtn,
              {
                backgroundColor: c.accent,
                borderRadius: c.radius + 4,
                opacity: pressed ? 0.9 : 1,
              },
            ]}
          >
            <View
              style={[
                styles.responderIcon,
                { backgroundColor: "rgba(255,255,255,0.18)" },
              ]}
            >
              <Feather name="truck" size={24} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.responderTitle}>{t("samuResponder")}</Text>
              <Text style={styles.responderDesc}>{t("samuResponderDesc")}</Text>
            </View>
            <Feather name="phone-call" size={22} color="#fff" />
          </Pressable>
        </ScrollView>
      ) : (
        <ScrollView
          contentContainerStyle={{
            paddingBottom: Math.max(insets.bottom, isWeb ? 40 : 24) + 110,
          }}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.mapWrap, { backgroundColor: c.muted }]}>
            <LinearGradient
              colors={["rgba(29,53,87,0.12)", "rgba(42,157,143,0.08)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <MapGrid color={c.border} />
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
            <View style={[styles.hospitalMarker, { backgroundColor: c.accent }]}>
              <Feather name="plus" size={14} color="#fff" />
            </View>
            <View
              style={[
                styles.routeLine,
                { backgroundColor: accent },
              ]}
            />
            <Pressable
              onPress={openMaps}
              style={[styles.mapsBtn, { backgroundColor: c.foreground }]}
              accessibilityLabel={t("openInMaps")}
            >
              <Feather name="navigation" size={14} color={c.background} />
              <Text style={[styles.mapsBtnText, { color: c.background }]}>
                {t("openInMaps")}
              </Text>
            </Pressable>
          </View>

          <View style={styles.hospitalSection}>
            <Text style={[styles.hospitalTitle, { color: c.foreground }]}>
              {HOSPITAL.name}
            </Text>
            <Text style={[styles.hospitalDistance, { color: c.mutedForeground }]}>
              {HOSPITAL.distance} · ETA {HOSPITAL.eta}
            </Text>

            <Pressable
              onPress={callHospital}
              style={({ pressed }) => [
                styles.callHospitalBtn,
                {
                  backgroundColor: c.primary,
                  borderRadius: c.radius,
                  opacity: pressed ? 0.9 : 1,
                },
              ]}
            >
              <Feather name="phone-call" size={18} color="#fff" />
              <Text style={styles.callHospitalText}>
                {t("callButton")} {HOSPITAL.name}
              </Text>
            </Pressable>

            <Pressable
              onPress={openMaps}
              style={({ pressed }) => [
                styles.directionsBtn,
                {
                  borderColor: c.border,
                  borderRadius: c.radius,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Feather name="map" size={16} color={c.foreground} />
              <Text style={[styles.directionsText, { color: c.foreground }]}>
                {t("openInMaps")}
              </Text>
            </Pressable>
          </View>

          {showHandshake ? (
            <View style={styles.handshakeWrap}>
              <View
                style={[
                  styles.handshakeBar,
                  { backgroundColor: c.accent },
                ]}
              />
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
      )}

      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: c.background,
            borderTopColor: c.border,
            paddingBottom: Math.max(insets.bottom, isWeb ? 34 : 16),
          },
        ]}
      >
        <Pressable
          onPress={cancel}
          style={[
            styles.cancelBtn,
            { borderColor: c.border, borderRadius: c.radius },
          ]}
        >
          <Feather name="x" size={16} color={c.foreground} />
          <Text style={[styles.cancelText, { color: c.foreground }]}>
            {t("cancelSos")}
          </Text>
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
  bigTitle: { fontFamily: "Inter_700Bold", fontSize: 26, marginTop: 6 },
  bigSub: { fontFamily: "Inter_400Regular", fontSize: 14, marginTop: 4 },
  responderBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 18,
    minHeight: 96,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  responderIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  responderTitle: {
    color: "#fff",
    fontFamily: "Inter_700Bold",
    fontSize: 17,
  },
  responderDesc: {
    color: "#fff",
    opacity: 0.9,
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    marginTop: 3,
  },
  mapWrap: {
    height: 280,
    margin: 16,
    borderRadius: 24,
    overflow: "hidden",
    position: "relative",
  },
  victimMarker: {
    position: "absolute",
    top: "55%",
    left: "32%",
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  markerInner: { width: 8, height: 8, borderRadius: 4, borderWidth: 2 },
  hospitalMarker: {
    position: "absolute",
    top: "22%",
    right: "20%",
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  routeLine: {
    position: "absolute",
    top: "30%",
    left: "38%",
    width: 130,
    height: 2,
    transform: [{ rotate: "-32deg" }],
    opacity: 0.7,
  },
  mapsBtn: {
    position: "absolute",
    bottom: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  mapsBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 12 },
  hospitalSection: {
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  hospitalTitle: { fontFamily: "Inter_700Bold", fontSize: 22 },
  hospitalDistance: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    marginTop: 4,
  },
  callHospitalBtn: {
    marginTop: 16,
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  callHospitalText: {
    color: "#fff",
    fontFamily: "Inter_700Bold",
    fontSize: 16,
  },
  directionsBtn: {
    marginTop: 10,
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
  },
  directionsText: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  handshakeWrap: {
    marginTop: 18,
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
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    flexDirection: "row",
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
  },
  cancelText: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  triageBtn: {
    flex: 1,
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  triageText: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
});
