import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Card } from "@/components/Brand";
import { CityMap, type MapPin } from "@/components/CityMap";
import { useApp } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";

const POLICE_PINS: MapPin[] = [
  { id: "you", name: "", kind: "you", x: 0.46, y: 0.55 },
  { id: "p1", name: "Remera Police", kind: "police", x: 0.74, y: 0.32 },
  { id: "p2", name: "Nyamirambo Police", kind: "police", x: 0.18, y: 0.72 },
  { id: "p3", name: "Kacyiru Police HQ", kind: "police", x: 0.55, y: 0.18 },
  { id: "p4", name: "Kicukiro Police", kind: "police", x: 0.62, y: 0.78 },
];

type Cat = "crime" | "threat" | "suspicious" | "missing";

export default function Other() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const { t, profile } = useApp();
  const topInset = isWeb ? Math.max(insets.top, 67) : insets.top + 8;
  const blink = useRef(new Animated.Value(0)).current;
  const [elapsed, setElapsed] = useState(0);
  const [selected, setSelected] = useState<Cat | null>(null);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(blink, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(blink, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ]),
    ).start();
    const tick = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(tick);
  }, [blink]);

  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");

  const callPolice = () => Linking.openURL("tel:112").catch(() => {});
  const cancel = () => router.replace("/");

  const cats: { id: Cat; icon: React.ComponentProps<typeof Feather>["name"]; title: string; desc: string }[] = [
    { id: "crime", icon: "alert-octagon", title: t("otherCrime"), desc: t("otherCrimeDesc") },
    { id: "threat", icon: "alert-triangle", title: t("otherThreat"), desc: t("otherThreatDesc") },
    { id: "suspicious", icon: "eye", title: t("otherSuspicious"), desc: t("otherSuspiciousDesc") },
    { id: "missing", icon: "user-x", title: t("otherMissing"), desc: t("otherMissingDesc") },
  ];

  const contactsCount = profile.emergencyContacts?.length || 0;

  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      <View
        style={[
          styles.statusBar,
          { backgroundColor: c.secondary, paddingTop: topInset, paddingBottom: 14 },
        ]}
      >
        <Animated.View style={{ opacity: blink, flexDirection: "row", alignItems: "center", gap: 8 }}>
          <View style={styles.liveDot} />
          <Text style={styles.statusTitle}>{t("otherResponseTitle")}</Text>
        </Animated.View>
        <Text style={styles.statusTimer}>
          {mm}:{ss}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: 16,
          paddingBottom: Math.max(insets.bottom, isWeb ? 40 : 24) + 200,
          gap: 14,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.lead, { color: c.foreground }]}>
          {t("otherResponseSub")}
        </Text>

        <CityMap pins={POLICE_PINS} height={220} />

        <View style={{ gap: 10 }}>
          {cats.map((cat) => {
            const active = selected === cat.id;
            return (
              <Pressable
                key={cat.id}
                onPress={() => setSelected(cat.id)}
                style={({ pressed }) => [
                  styles.catRow,
                  {
                    backgroundColor: active ? c.secondary : c.card,
                    borderColor: active ? c.secondary : c.border,
                    borderRadius: c.radius,
                    opacity: pressed ? 0.9 : 1,
                  },
                ]}
              >
                <View
                  style={[
                    styles.catIcon,
                    { backgroundColor: active ? "rgba(255,255,255,0.2)" : c.muted },
                  ]}
                >
                  <Feather
                    name={cat.icon}
                    size={18}
                    color={active ? "#fff" : c.foreground}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[styles.catTitle, { color: active ? "#fff" : c.foreground }]}
                  >
                    {cat.title}
                  </Text>
                  <Text
                    style={[
                      styles.catDesc,
                      { color: active ? "rgba(255,255,255,0.85)" : c.mutedForeground },
                    ]}
                  >
                    {cat.desc}
                  </Text>
                </View>
                {active ? <Feather name="check-circle" size={20} color="#fff" /> : null}
              </Pressable>
            );
          })}
        </View>

        {contactsCount > 0 ? (
          <Card style={{ borderColor: c.accent, borderWidth: 1.5 }}>
            <View style={styles.head}>
              <Feather name="users" size={16} color={c.accent} />
              <Text style={[styles.title, { color: c.foreground }]}>
                {t("notifiedContacts")}
              </Text>
            </View>
            <Text style={[styles.cardBody, { color: c.mutedForeground }]}>
              {contactsCount} · {profile.emergencyContacts.map((c) => c.name).join(", ")}
            </Text>
          </Card>
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
          onPress={callPolice}
          style={({ pressed }) => [
            styles.callBtn,
            { backgroundColor: c.primary, borderRadius: c.radius, opacity: pressed ? 0.9 : 1 },
          ]}
        >
          <Feather name="phone-call" size={18} color="#fff" />
          <Text style={styles.callBtnText}>{t("callPolice")}</Text>
        </Pressable>
        <Pressable
          onPress={cancel}
          style={[styles.cancelBtn, { borderColor: c.border, borderRadius: c.radius }]}
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

const styles = StyleSheet.create({
  root: { flex: 1 },
  statusBar: {
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#fff" },
  statusTitle: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 16 },
  statusTimer: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 16, letterSpacing: 1 },
  lead: { fontFamily: "Inter_500Medium", fontSize: 14, lineHeight: 20 },
  head: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
  title: { fontFamily: "Inter_700Bold", fontSize: 15 },
  cardBody: { fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 18 },
  catRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderWidth: 1,
  },
  catIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  catTitle: { fontFamily: "Inter_700Bold", fontSize: 15 },
  catDesc: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },
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
