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

const FIRE_PINS: MapPin[] = [
  { id: "you", name: "", kind: "you", x: 0.46, y: 0.55 },
  { id: "f1", name: "Kacyiru Fire Brigade", kind: "police", x: 0.55, y: 0.18 },
  { id: "f2", name: "Remera Fire Station", kind: "police", x: 0.74, y: 0.32 },
  { id: "f3", name: "Nyamirambo Fire Post", kind: "police", x: 0.18, y: 0.72 },
  { id: "h1", name: "King Faisal Hospital", kind: "hospital", x: 0.78, y: 0.6 },
  { id: "h2", name: "CHUK", kind: "hospital", x: 0.32, y: 0.32 },
];

export default function Fire() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const { t, profile } = useApp();
  const topInset = isWeb ? Math.max(insets.top, 67) : insets.top + 8;
  const blink = useRef(new Animated.Value(0)).current;
  const [elapsed, setElapsed] = useState(0);

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

  const callFire = () => Linking.openURL("tel:111").catch(() => {});
  const cancel = () => router.replace("/");

  const steps = [t("fireStep1"), t("fireStep2"), t("fireStep3"), t("fireStep4"), t("fireStep5")];
  const contactsCount = profile.emergencyContacts?.length || 0;

  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      <View
        style={[
          styles.statusBar,
          { backgroundColor: c.warning, paddingTop: topInset, paddingBottom: 14 },
        ]}
      >
        <Animated.View style={{ opacity: blink, flexDirection: "row", alignItems: "center", gap: 8 }}>
          <View style={[styles.liveDot, { backgroundColor: c.warningForeground }]} />
          <Text style={[styles.statusTitle, { color: c.warningForeground }]}>
            {t("fireResponseTitle")}
          </Text>
        </Animated.View>
        <Text style={[styles.statusTimer, { color: c.warningForeground }]}>
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
          {t("fireResponseSub")}
        </Text>

        <CityMap pins={FIRE_PINS} height={240} />

        <Card>
          <View style={styles.head}>
            <View style={[styles.iconBubble, { backgroundColor: c.warning }]}>
              <Feather name="thermometer" size={14} color={c.warningForeground} />
            </View>
            <Text style={[styles.title, { color: c.foreground }]}>
              {t("evacuationTip")}
            </Text>
          </View>
          {steps.map((s, i) => (
            <View key={i} style={styles.step}>
              <View style={[styles.stepNum, { backgroundColor: c.warning }]}>
                <Text style={[styles.stepNumText, { color: c.warningForeground }]}>{i + 1}</Text>
              </View>
              <Text style={[styles.stepText, { color: c.foreground }]}>{s}</Text>
            </View>
          ))}
        </Card>

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
          onPress={callFire}
          style={({ pressed }) => [
            styles.callBtn,
            { backgroundColor: c.warning, borderRadius: c.radius, opacity: pressed ? 0.9 : 1 },
          ]}
        >
          <Feather name="phone-call" size={18} color={c.warningForeground} />
          <Text style={[styles.callBtnText, { color: c.warningForeground }]}>
            {t("callFireBrigade")}
          </Text>
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
  liveDot: { width: 8, height: 8, borderRadius: 4 },
  statusTitle: { fontFamily: "Inter_700Bold", fontSize: 16 },
  statusTimer: { fontFamily: "Inter_700Bold", fontSize: 16, letterSpacing: 1 },
  lead: { fontFamily: "Inter_500Medium", fontSize: 14, lineHeight: 20 },
  head: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  iconBubble: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontFamily: "Inter_700Bold", fontSize: 15 },
  cardBody: { fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 18 },
  step: { flexDirection: "row", gap: 10, paddingVertical: 8, alignItems: "flex-start" },
  stepNum: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  stepNumText: { fontFamily: "Inter_700Bold", fontSize: 11 },
  stepText: { flex: 1, fontFamily: "Inter_500Medium", fontSize: 14, lineHeight: 19 },
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
  callBtnText: { fontFamily: "Inter_700Bold", fontSize: 16 },
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
