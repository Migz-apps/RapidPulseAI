import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Card, LangSwitcher } from "@/components/Brand";
import { CityMap, type MapPin } from "@/components/CityMap";
import { LanguageSheet } from "@/components/LanguageSheet";
import { SosPulse } from "@/components/SosPulse";
import { useApp } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";

const MAP_PINS: MapPin[] = [
  { id: "you", name: "", kind: "you", x: 0.46, y: 0.55 },
  { id: "p1", name: "Remera Police", kind: "police", x: 0.74, y: 0.32 },
  { id: "p2", name: "Nyamirambo Police", kind: "police", x: 0.18, y: 0.72 },
  { id: "p3", name: "Kacyiru Police", kind: "police", x: 0.55, y: 0.18 },
  { id: "h1", name: "King Faisal Hospital", kind: "hospital", x: 0.78, y: 0.6 },
  { id: "h2", name: "CHUK", kind: "hospital", x: 0.32, y: 0.32 },
  { id: "h3", name: "Kibagabaga Hospital", kind: "hospital", x: 0.62, y: 0.78 },
];

export default function Dashboard() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const { language, setLanguage, t, profile, silentSos, setSilentSos } = useApp();
  const [langOpen, setLangOpen] = useState(false);
  const topInset = isWeb ? Math.max(insets.top, 67) : insets.top + 8;

  const NEARBY_INCIDENTS = [
    { id: "i1", label: t("fireReported"), area: "Nyamirambo", mins: 4, color: "warning" as const },
    { id: "i2", label: t("accidentReported"), area: "Kicukiro", mins: 12, color: "primary" as const },
    { id: "i3", label: t("fireReported"), area: "Kimironko", mins: 27, color: "primary" as const },
  ];

  const TIPS = [t("tip1"), t("tip2"), t("tip3")];

  const goToPin = (pin: MapPin) => {
    if (pin.kind === "you") return;
    router.push({
      pathname: "/incident",
      params: { destName: pin.name, destKind: pin.kind },
    });
  };

  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      <View style={[styles.header, { paddingTop: topInset }]}>
        <View>
          <Text style={[styles.hi, { color: c.mutedForeground }]}>
            {t("hi")}{profile.name ? `, ${profile.name.split(" ")[0]}` : ""}
          </Text>
          <Text style={[styles.brand, { color: c.foreground }]}>
            {t("appName")}
          </Text>
        </View>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <Pressable
            onPress={() => router.push("/settings")}
            hitSlop={12}
            style={[
              styles.iconBtn,
              { backgroundColor: c.card, borderColor: c.border },
            ]}
            accessibilityLabel={t("settings")}
          >
            <Feather name="settings" size={16} color={c.foreground} />
          </Pressable>
          <LangSwitcher
            value={language.toUpperCase()}
            onPress={() => setLangOpen(true)}
          />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: Math.max(insets.bottom, isWeb ? 40 : 24) + 16,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sosWrap}>
          <SosPulse
            silent={silentSos}
            onTrigger={() => router.push("/emergency")}
            labelHold={t("holdSos")}
            labelSending={t("sending")}
          />
        </View>

        <Pressable
          onPress={() => setSilentSos(!silentSos)}
          style={[
            styles.silentRow,
            { backgroundColor: c.card, borderColor: c.border, borderRadius: 999 },
          ]}
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

        <Pressable onPress={() => router.push("/triage")}>
          <Card
            style={{
              marginBottom: 16,
              borderColor: c.accent,
              borderWidth: 1.5,
              backgroundColor: c.accent,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
              <View style={[styles.triageIcon]}>
                <Feather name="camera" size={22} color={c.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.triageTitle]}>
                  {t("aiTriageCard")}
                </Text>
                <Text style={[styles.triageBody]}>
                  {t("aiTriageCardBody")}
                </Text>
              </View>
              <Feather name="chevron-right" size={22} color="#fff" />
            </View>
          </Card>
        </Pressable>

        <Text style={[styles.section, { color: c.foreground }]}>
          {t("nearbyMap")}
        </Text>
        <Text style={[styles.sectionSub, { color: c.mutedForeground }]}>
          {t("nearbyMapHint")}
        </Text>

        <View style={{ height: 10 }} />
        <CityMap pins={MAP_PINS} onPinPress={goToPin} height={260} />

        <View style={{ height: 18 }} />
        <View style={styles.statsRow}>
          <Stat label={t("incidents24h")} value="9" tone="primary" icon="activity" />
        </View>

        <Card style={{ marginTop: 12 }}>
          <View style={styles.cardHead}>
            <Feather name="map-pin" size={16} color={c.foreground} />
            <Text style={[styles.cardTitle, { color: c.foreground }]}>
              {t("nearbyActivity")}
            </Text>
          </View>
          {NEARBY_INCIDENTS.map((i, idx) => (
            <View
              key={i.id}
              style={[
                styles.incidentRow,
                idx === NEARBY_INCIDENTS.length - 1
                  ? null
                  : { borderBottomColor: c.border, borderBottomWidth: 1 },
              ]}
            >
              <View
                style={[
                  styles.incidentDot,
                  { backgroundColor: i.color === "warning" ? c.warning : c.primary },
                ]}
              />
              <View style={{ flex: 1 }}>
                <Text style={[styles.incidentLabel, { color: c.foreground }]}>
                  {i.label}
                </Text>
                <Text style={[styles.incidentArea, { color: c.mutedForeground }]}>
                  {i.area}
                </Text>
              </View>
              <Text style={[styles.incidentMins, { color: c.mutedForeground }]}>
                {i.mins}m
              </Text>
            </View>
          ))}
        </Card>

        {profile.role === "lifesaver" ? (
          <Pressable onPress={() => router.push("/volunteer")}>
            <Card style={{ marginTop: 12, borderColor: c.accent, borderWidth: 1.5 }}>
              <View style={styles.cardHead}>
                <Feather name="radio" size={16} color={c.accent} />
                <Text style={[styles.cardTitle, { color: c.foreground }]}>
                  {t("volunteerBeacon")}
                </Text>
              </View>
              <Text style={[styles.bodyText, { color: c.mutedForeground }]}>
                {t("volunteerBeaconBody")}
              </Text>
            </Card>
          </Pressable>
        ) : null}

        <Card style={{ marginTop: 12 }}>
          <View style={styles.cardHead}>
            <Feather name="book-open" size={16} color={c.foreground} />
            <Text style={[styles.cardTitle, { color: c.foreground }]}>
              {t("tipsTitle")}
            </Text>
          </View>
          {TIPS.map((tip, idx) => (
            <View key={idx} style={styles.tipRow}>
              <View
                style={[
                  styles.tipBullet,
                  { backgroundColor: c.accent },
                ]}
              >
                <Text style={styles.tipBulletText}>{idx + 1}</Text>
              </View>
              <Text style={[styles.tipText, { color: c.foreground }]}>{tip}</Text>
            </View>
          ))}
        </Card>
      </ScrollView>

      <LanguageSheet
        visible={langOpen}
        current={language}
        onSelect={setLanguage}
        onClose={() => setLangOpen(false)}
      />
    </View>
  );
}

function Stat({
  label,
  value,
  tone,
  icon,
}: {
  label: string;
  value: string;
  tone: "primary" | "secondary" | "accent";
  icon: React.ComponentProps<typeof Feather>["name"];
}) {
  const c = useColors();
  const bg =
    tone === "primary" ? c.primary : tone === "secondary" ? c.secondary : c.accent;
  return (
    <View
      style={[
        styles.stat,
        {
          backgroundColor: c.card,
          borderColor: c.border,
          borderRadius: c.radius,
        },
      ]}
    >
      <View style={[styles.statIcon, { backgroundColor: bg }]}>
        <Feather name={icon} size={14} color="#fff" />
      </View>
      <Text style={[styles.statValue, { color: c.foreground }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: c.mutedForeground }]}>
        {label}
      </Text>
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
    paddingBottom: 8,
  },
  hi: { fontFamily: "Inter_400Regular", fontSize: 12 },
  brand: { fontFamily: "Inter_700Bold", fontSize: 22 },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  sosWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  silentRow: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    marginTop: 6,
    marginBottom: 18,
  },
  silentLabel: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  section: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
  },
  sectionSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 2,
  },
  statsRow: { flexDirection: "row", gap: 10 },
  stat: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    alignItems: "flex-start",
    gap: 8,
  },
  statIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: { fontFamily: "Inter_700Bold", fontSize: 22 },
  statLabel: { fontFamily: "Inter_400Regular", fontSize: 11 },
  cardHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  cardTitle: { fontFamily: "Inter_700Bold", fontSize: 15 },
  bodyText: { fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 18 },
  incidentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
  },
  incidentDot: { width: 10, height: 10, borderRadius: 5 },
  incidentLabel: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  incidentArea: { fontFamily: "Inter_400Regular", fontSize: 12 },
  incidentMins: { fontFamily: "Inter_500Medium", fontSize: 12 },
  tipRow: { flexDirection: "row", gap: 10, paddingVertical: 8 },
  tipBullet: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  tipBulletText: {
    color: "#fff",
    fontFamily: "Inter_700Bold",
    fontSize: 11,
  },
  tipText: { flex: 1, fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 18 },
  triageIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  triageTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 15,
    color: "#fff",
  },
  triageBody: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "rgba(255,255,255,0.9)",
    marginTop: 2,
    lineHeight: 16,
  },
});
