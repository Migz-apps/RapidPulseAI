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
};

const NEARBY_VICTIM = {
  name: "Aline U.",
  bloodType: "O-",
  allergies: "Penicillin",
  emergencyContact: "+250 788 555 990",
};

export default function Incident() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const { t, silentSos } = useApp();
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
          toValue: 0.35,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    const tick = setInterval(() => setElapsed((e) => e + 1), 1000);
    const handshakeTimer = setTimeout(() => setShowHandshake(true), 4500);
    return () => {
      clearInterval(tick);
      clearTimeout(handshakeTimer);
    };
  }, [blink, heroAnim]);

  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");

  const cancel = () => router.replace("/dashboard");
  const callHospital = () => {
    Linking.openURL(`tel:${HOSPITAL.phone}`).catch(() => {});
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
        <Animated.View style={{ opacity: blink, flexDirection: "row", alignItems: "center", gap: 8 }}>
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
          paddingBottom: Math.max(insets.bottom, isWeb ? 40 : 24) + 140,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.mapWrap, { backgroundColor: c.muted }]}>
          <LinearGradient
            colors={[
              "rgba(29,53,87,0.12)",
              "rgba(42,157,143,0.08)",
            ]}
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
                transform: [
                  { scale: heroAnim },
                ],
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
          <View
            style={[
              styles.mapPill,
              {
                backgroundColor: c.background,
                borderColor: c.border,
              },
            ]}
          >
            <Feather name="navigation" size={12} color={c.foreground} />
            <Text style={[styles.mapPillText, { color: c.foreground }]}>
              KN 2 Ave · Kigali
            </Text>
          </View>
        </View>

        {showHandshake ? (
          <Pressable
            onPress={() => {
              /* expand inline */
            }}
          >
            <View
              style={[
                styles.handshake,
                {
                  borderColor: c.accent,
                  backgroundColor: "rgba(42,157,143,0.10)",
                  borderRadius: c.radius,
                },
              ]}
            >
              <View style={[styles.handshakeIcon, { backgroundColor: c.accent }]}>
                <Feather name="users" size={16} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.handshakeTitle, { color: c.foreground }]}>
                  {t("victimProfile")}
                </Text>
                <Text style={[styles.handshakeMeta, { color: c.mutedForeground }]}>
                  {NEARBY_VICTIM.name} · {t("bloodType")} {NEARBY_VICTIM.bloodType}
                </Text>
                <View style={styles.handshakeRow}>
                  <Tag label={`${t("allergies")}: ${NEARBY_VICTIM.allergies}`} />
                  <Tag label={`${t("emergencyContact")}`} />
                </View>
              </View>
            </View>
          </Pressable>
        ) : null}

        <View style={[styles.hospitalCard, { backgroundColor: c.card, borderColor: c.border, borderRadius: c.radius }]}>
          <View style={[styles.hospitalIcon, { backgroundColor: c.secondary }]}>
            <Feather name="plus-square" size={18} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.hospitalName, { color: c.foreground }]}>
              {HOSPITAL.name}
            </Text>
            <Text style={[styles.hospitalMeta, { color: c.mutedForeground }]}>
              {HOSPITAL.distance} · ETA {HOSPITAL.eta}
            </Text>
          </View>
          <Pressable
            onPress={callHospital}
            style={[styles.callBtn, { backgroundColor: c.accent }]}
            accessibilityLabel={t("callHospital")}
          >
            <Feather name="phone" size={16} color="#fff" />
          </Pressable>
        </View>

        <View
          style={[
            styles.actionsRow,
          ]}
        >
          <ActionTile
            icon="phone-call"
            label={t("callHospital")}
            tone="secondary"
            onPress={callHospital}
          />
          <ActionTile
            icon="users"
            label="Family"
            tone="primary"
            onPress={() => Linking.openURL("tel:911").catch(() => {})}
          />
          <ActionTile
            icon="message-circle"
            label="Text"
            tone="accent"
            onPress={() => Linking.openURL(`sms:${HOSPITAL.phone}`).catch(() => {})}
          />
        </View>
      </ScrollView>

      <Pressable
        onPress={() => router.push("/triage")}
        style={[
          styles.fab,
          {
            backgroundColor: c.accent,
            bottom: Math.max(insets.bottom, isWeb ? 34 : 16) + 84,
          },
        ]}
        accessibilityLabel={t("triageAi")}
      >
        <Feather name="camera" size={22} color="#fff" />
      </Pressable>

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
          <Feather name="zap" size={16} color={c.background} />
          <Text style={[styles.triageText, { color: c.background }]}>
            {t("triageAi")}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function ActionTile({
  icon,
  label,
  tone,
  onPress,
}: {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  tone: "primary" | "secondary" | "accent";
  onPress: () => void;
}) {
  const c = useColors();
  const bg =
    tone === "primary" ? c.primary : tone === "secondary" ? c.secondary : c.accent;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.action,
        {
          backgroundColor: c.card,
          borderColor: c.border,
          borderRadius: c.radius,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <View style={[styles.actionIcon, { backgroundColor: bg }]}>
        <Feather name={icon} size={18} color="#fff" />
      </View>
      <Text style={[styles.actionLabel, { color: c.foreground }]}>{label}</Text>
    </Pressable>
  );
}

function Tag({ label }: { label: string }) {
  const c = useColors();
  return (
    <View
      style={[
        styles.tag,
        { backgroundColor: c.background, borderColor: c.border },
      ]}
    >
      <Text style={[styles.tagText, { color: c.foreground }]}>{label}</Text>
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
  markerInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 2,
  },
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
  mapPill: {
    position: "absolute",
    bottom: 12,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  mapPillText: { fontFamily: "Inter_500Medium", fontSize: 12 },
  handshake: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 14,
    flexDirection: "row",
    gap: 12,
    borderWidth: 1.5,
  },
  handshakeIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  handshakeTitle: { fontFamily: "Inter_700Bold", fontSize: 14 },
  handshakeMeta: { fontFamily: "Inter_500Medium", fontSize: 12, marginTop: 2 },
  handshakeRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 8 },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  tagText: { fontFamily: "Inter_500Medium", fontSize: 11 },
  hospitalCard: {
    marginHorizontal: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
  },
  hospitalIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  hospitalName: { fontFamily: "Inter_700Bold", fontSize: 15 },
  hospitalMeta: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },
  callBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  actionsRow: {
    flexDirection: "row",
    gap: 10,
    marginHorizontal: 16,
    marginTop: 12,
  },
  action: {
    flex: 1,
    padding: 12,
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  actionLabel: { fontFamily: "Inter_600SemiBold", fontSize: 12 },
  fab: {
    position: "absolute",
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
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
