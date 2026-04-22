import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
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

type EmergencyType = "medical" | "fire" | "other";

export default function EmergencyPicker() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const { t } = useApp();
  const topInset = isWeb ? Math.max(insets.top, 67) : insets.top + 8;

  const dial = (number: string) => {
    Linking.openURL(`tel:${number}`).catch(() => {});
  };

  const onSelect = (type: EmergencyType) => {
    if (type === "medical") {
      router.replace("/incident");
    } else if (type === "fire") {
      dial("111");
      setTimeout(() => router.replace("/"), 400);
    } else {
      dial("112");
      setTimeout(() => router.replace("/"), 400);
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      <View style={[styles.header, { paddingTop: topInset }]}>
        <Pressable
          onPress={() => router.replace("/")}
          hitSlop={14}
          style={[styles.iconBtn, { backgroundColor: c.card, borderColor: c.border }]}
          accessibilityLabel={t("back")}
        >
          <Feather name="x" size={18} color={c.foreground} />
        </Pressable>
        <View style={styles.live}>
          <View style={[styles.liveDot, { backgroundColor: c.primary }]} />
          <Text style={[styles.liveText, { color: c.primary }]}>SOS ACTIVE</Text>
        </View>
        <View style={{ width: 34 }} />
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: 20,
          paddingBottom: Math.max(insets.bottom, isWeb ? 40 : 24) + 24,
          gap: 14,
        }}
      >
        <Text style={[styles.title, { color: c.foreground }]}>
          {t("whatsHappening")}
        </Text>
        <Text style={[styles.subtitle, { color: c.mutedForeground }]}>
          {t("emergencyHint")}
        </Text>

        <View style={{ height: 6 }} />

        <TypeButton
          icon="heart"
          tone="primary"
          title={t("medicalEmergency")}
          desc={t("medicalEmergencyDesc")}
          onPress={() => onSelect("medical")}
        />
        <TypeButton
          icon="thermometer"
          tone="warning"
          title={t("fireEmergency")}
          desc={t("fireEmergencyDesc")}
          rightLabel={t("policeNumber")}
          onPress={() => onSelect("fire")}
        />
        <TypeButton
          icon="alert-circle"
          tone="secondary"
          title={t("otherEmergency")}
          desc={t("otherEmergencyDesc")}
          rightLabel={t("generalEmergencyNumber")}
          onPress={() => onSelect("other")}
        />
      </ScrollView>
    </View>
  );
}

function TypeButton({
  icon,
  tone,
  title,
  desc,
  rightLabel,
  onPress,
}: {
  icon: React.ComponentProps<typeof Feather>["name"];
  tone: "primary" | "secondary" | "warning";
  title: string;
  desc: string;
  rightLabel?: string;
  onPress: () => void;
}) {
  const c = useColors();
  const bg = tone === "primary" ? c.primary : tone === "warning" ? c.warning : c.secondary;
  const fg = tone === "warning" ? c.warningForeground : "#fff";
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.typeBtn,
        {
          backgroundColor: bg,
          borderRadius: c.radius + 4,
          opacity: pressed ? 0.9 : 1,
          shadowColor: bg,
        },
      ]}
    >
      <View style={[styles.typeIcon, { backgroundColor: "rgba(255,255,255,0.18)" }]}>
        <Feather name={icon} size={26} color={fg} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.typeTitle, { color: fg }]}>{title}</Text>
        <Text style={[styles.typeDesc, { color: fg, opacity: 0.85 }]}>
          {desc}
        </Text>
        {rightLabel ? (
          <View style={styles.rightLabelRow}>
            <Feather name="phone-call" size={11} color={fg} />
            <Text style={[styles.rightLabel, { color: fg }]}>{rightLabel}</Text>
          </View>
        ) : null}
      </View>
      <Feather name="chevron-right" size={22} color={fg} />
    </Pressable>
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
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  live: { flexDirection: "row", alignItems: "center", gap: 6 },
  liveDot: { width: 8, height: 8, borderRadius: 4 },
  liveText: { fontFamily: "Inter_700Bold", fontSize: 12, letterSpacing: 2 },
  title: { fontFamily: "Inter_700Bold", fontSize: 28, marginTop: 6 },
  subtitle: { fontFamily: "Inter_400Regular", fontSize: 14, marginTop: 6 },
  typeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 18,
    minHeight: 96,
    shadowOpacity: 0.25,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  typeIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  typeTitle: { fontFamily: "Inter_700Bold", fontSize: 18 },
  typeDesc: { fontFamily: "Inter_400Regular", fontSize: 13, marginTop: 4 },
  rightLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },
  rightLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    letterSpacing: 1,
  },
});
