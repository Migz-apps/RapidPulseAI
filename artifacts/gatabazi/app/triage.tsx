import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PrimaryButton } from "@/components/Brand";
import { FIRST_AID_STEPS } from "@/constants/i18n";
import { useApp } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";

type Phase = "capture" | "analyzing" | "instructions";

export default function Triage() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const { t, language } = useApp();
  const [phase, setPhase] = useState<Phase>("capture");
  const scan = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (phase === "analyzing") {
      Animated.loop(
        Animated.timing(scan, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ).start();
      const id = setTimeout(() => setPhase("instructions"), 2400);
      return () => clearTimeout(id);
    }
    return undefined;
  }, [phase, scan]);

  const topInset = isWeb ? Math.max(insets.top, 67) : insets.top + 8;
  const steps = FIRST_AID_STEPS[language] || FIRST_AID_STEPS.en;
  const scanY = scan.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 260],
  });

  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      <View style={[styles.header, { paddingTop: topInset }]}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={14}
          style={[styles.iconBtn, { backgroundColor: c.card, borderColor: c.border }]}
          accessibilityLabel={t("back")}
        >
          <Feather name="x" size={18} color={c.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: c.foreground }]}>
          {t("triageAi")}
        </Text>
        <View style={{ width: 34 }} />
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: 20,
          paddingBottom: Math.max(insets.bottom, isWeb ? 40 : 24) + 100,
        }}
      >
        <View
          style={[
            styles.viewfinder,
            {
              backgroundColor: "#0B1120",
              borderRadius: c.radius + 4,
            },
          ]}
        >
          <LinearGradient
            colors={["#1D3557", "#0B1120"]}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.crosshair}>
            {[0, 1, 2, 3].map((i) => (
              <View key={i} style={[styles.corner, cornerStyle(i)]} />
            ))}
          </View>
          {phase === "analyzing" ? (
            <Animated.View
              style={[
                styles.scanLine,
                { transform: [{ translateY: scanY }] },
              ]}
            />
          ) : null}
          <View style={styles.viewfinderLabel}>
            <Feather
              name={phase === "instructions" ? "check-circle" : "camera"}
              size={14}
              color="#fff"
            />
            <Text style={styles.viewfinderText}>
              {phase === "capture"
                ? "Center the scene"
                : phase === "analyzing"
                  ? t("analyzing")
                  : "Scene assessed"}
            </Text>
          </View>
        </View>

        {phase !== "instructions" ? (
          <View style={{ marginTop: 24 }}>
            <PrimaryButton
              icon="camera"
              label={t("takePhoto")}
              onPress={() => setPhase("analyzing")}
              loading={phase === "analyzing"}
              disabled={phase === "analyzing"}
            />
            {phase === "analyzing" ? (
              <View style={styles.analyzeRow}>
                <ActivityIndicator color={c.accent} />
                <Text style={[styles.analyzeText, { color: c.mutedForeground }]}>
                  {t("analyzing")}
                </Text>
              </View>
            ) : null}
          </View>
        ) : (
          <View style={{ marginTop: 20 }}>
            <Text style={[styles.sectionTitle, { color: c.foreground }]}>
              {t("aiInstructions")}
            </Text>
            <Text style={[styles.sectionSub, { color: c.mutedForeground }]}>
              Translated for you in {language.toUpperCase()}.
            </Text>
            <View style={{ height: 12 }} />
            {steps.map((s, idx) => (
              <View
                key={idx}
                style={[
                  styles.stepRow,
                  {
                    backgroundColor: c.card,
                    borderColor: c.border,
                    borderRadius: c.radius,
                  },
                ]}
              >
                <View style={[styles.stepIndex, { backgroundColor: c.accent }]}>
                  <Text style={styles.stepIndexText}>{idx + 1}</Text>
                </View>
                <Text style={[styles.stepText, { color: c.foreground }]}>{s}</Text>
              </View>
            ))}
            <View style={{ height: 16 }} />
            <PrimaryButton
              variant="ghost"
              icon="rotate-ccw"
              label="Re-analyze"
              onPress={() => setPhase("capture")}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function cornerStyle(i: number) {
  const base = {
    width: 26,
    height: 26,
    borderColor: "#fff",
    position: "absolute" as const,
  };
  switch (i) {
    case 0:
      return { ...base, top: 12, left: 12, borderTopWidth: 3, borderLeftWidth: 3 };
    case 1:
      return { ...base, top: 12, right: 12, borderTopWidth: 3, borderRightWidth: 3 };
    case 2:
      return { ...base, bottom: 12, left: 12, borderBottomWidth: 3, borderLeftWidth: 3 };
    default:
      return { ...base, bottom: 12, right: 12, borderBottomWidth: 3, borderRightWidth: 3 };
  }
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
  headerTitle: { fontFamily: "Inter_700Bold", fontSize: 16 },
  viewfinder: {
    height: 320,
    overflow: "hidden",
    position: "relative",
  },
  crosshair: { ...StyleSheet.absoluteFillObject },
  corner: {},
  scanLine: {
    position: "absolute",
    top: 20,
    left: 20,
    right: 20,
    height: 2,
    backgroundColor: "rgba(42,157,143,0.85)",
    shadowColor: "#2A9D8F",
    shadowOpacity: 0.8,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  viewfinderLabel: {
    position: "absolute",
    bottom: 16,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(11,17,32,0.6)",
  },
  viewfinderText: { color: "#fff", fontFamily: "Inter_500Medium", fontSize: 12 },
  analyzeRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  analyzeText: { fontFamily: "Inter_400Regular", fontSize: 13 },
  sectionTitle: { fontFamily: "Inter_700Bold", fontSize: 20 },
  sectionSub: { fontFamily: "Inter_400Regular", fontSize: 13, marginTop: 4 },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
  },
  stepIndex: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  stepIndexText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 13 },
  stepText: { flex: 1, fontFamily: "Inter_500Medium", fontSize: 14, lineHeight: 19 },
});
