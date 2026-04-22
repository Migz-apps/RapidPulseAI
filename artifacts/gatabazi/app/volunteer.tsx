import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";

const CALL = {
  emergency: "cardiac" as const,
  distance: "320 m",
  eta: "2 min",
  area: "Kimihurura · KG 11 Ave",
};

export default function Volunteer() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const { t } = useApp();
  const ring = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(ring, {
        toValue: 1,
        duration: 1600,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ).start();
  }, [ring]);

  const topInset = isWeb ? Math.max(insets.top, 67) : insets.top + 8;

  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      <LinearGradient
        colors={[c.background, "rgba(230,57,70,0.10)"]}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.header, { paddingTop: topInset }]}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={14}
          style={[styles.iconBtn, { backgroundColor: c.card, borderColor: c.border }]}
        >
          <Feather name="chevron-down" size={18} color={c.foreground} />
        </Pressable>
        <Text style={[styles.priority, { color: c.primary }]}>HIGH PRIORITY</Text>
        <View style={{ width: 34 }} />
      </View>

      <View style={styles.center}>
        <View style={styles.avatarStack}>
          <Animated.View
            style={[
              styles.avatarRing,
              {
                backgroundColor: c.primary,
                opacity: ring.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.3, 0],
                }),
                transform: [
                  {
                    scale: ring.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.7],
                    }),
                  },
                ],
              },
            ]}
          />
          <View style={[styles.avatar, { backgroundColor: c.primary }]}>
            <Feather name="alert-triangle" size={42} color="#fff" />
          </View>
        </View>

        <Text style={[styles.title, { color: c.foreground }]}>
          {t("volunteerCallTitle")}
        </Text>
        <Text style={[styles.subtitle, { color: c.mutedForeground }]}>
          {CALL.area}
        </Text>

        <View
          style={[
            styles.metaCard,
            {
              backgroundColor: c.card,
              borderColor: c.border,
              borderRadius: c.radius,
            },
          ]}
        >
          <Meta label={t("type")} value={t(CALL.emergency)} icon="activity" tone="primary" />
          <View style={[styles.divider, { backgroundColor: c.border }]} />
          <Meta label={t("distance")} value={CALL.distance} icon="map-pin" tone="secondary" />
          <View style={[styles.divider, { backgroundColor: c.border }]} />
          <Meta label="ETA" value={CALL.eta} icon="clock" tone="accent" />
        </View>
      </View>

      <View
        style={[
          styles.bottom,
          {
            paddingBottom: Math.max(insets.bottom, isWeb ? 34 : 16),
          },
        ]}
      >
        <Pressable
          onPress={() => router.back()}
          style={[
            styles.declineBtn,
            { borderColor: c.border, borderRadius: c.radius },
          ]}
        >
          <Feather name="x" size={18} color={c.foreground} />
          <Text style={[styles.btnText, { color: c.foreground }]}>
            {t("volunteerDecline")}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => router.replace("/incident")}
          style={[
            styles.acceptBtn,
            { backgroundColor: c.accent, borderRadius: c.radius },
          ]}
        >
          <Feather name="check" size={18} color="#fff" />
          <Text style={[styles.btnText, { color: "#fff" }]}>
            {t("volunteerAccept")}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function Meta({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string;
  icon: React.ComponentProps<typeof Feather>["name"];
  tone: "primary" | "secondary" | "accent";
}) {
  const c = useColors();
  const bg = tone === "primary" ? c.primary : tone === "secondary" ? c.secondary : c.accent;
  return (
    <View style={styles.metaCol}>
      <View style={[styles.metaIcon, { backgroundColor: bg }]}>
        <Feather name={icon} size={14} color="#fff" />
      </View>
      <Text style={[styles.metaValue, { color: c.foreground }]}>{value}</Text>
      <Text style={[styles.metaLabel, { color: c.mutedForeground }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  priority: {
    fontFamily: "Inter_700Bold",
    fontSize: 12,
    letterSpacing: 2,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  avatarStack: {
    width: 140,
    height: 140,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  avatarRing: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#E63946",
    shadowOpacity: 0.5,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  title: { fontFamily: "Inter_700Bold", fontSize: 26, textAlign: "center" },
  subtitle: { fontFamily: "Inter_400Regular", fontSize: 14, marginTop: 6 },
  metaCard: {
    marginTop: 26,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderWidth: 1,
    width: "100%",
  },
  metaCol: { flex: 1, alignItems: "center", gap: 4 },
  metaIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  metaValue: { fontFamily: "Inter_700Bold", fontSize: 16 },
  metaLabel: { fontFamily: "Inter_400Regular", fontSize: 11 },
  divider: { width: 1, height: 32 },
  bottom: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  declineBtn: {
    flex: 1,
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
  },
  acceptBtn: {
    flex: 1.4,
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  btnText: { fontFamily: "Inter_700Bold", fontSize: 15 },
});
