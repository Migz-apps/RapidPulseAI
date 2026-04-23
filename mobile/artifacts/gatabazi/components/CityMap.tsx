import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

export type MapPin = {
  id: string;
  name: string;
  kind: "police" | "hospital" | "you";
  x: number;
  y: number;
};

const ROADS: { x1: number; y1: number; x2: number; y2: number; major?: boolean }[] = [
  { x1: 0, y1: 0.55, x2: 1, y2: 0.45, major: true },
  { x1: 0, y1: 0.78, x2: 1, y2: 0.7 },
  { x1: 0.45, y1: 0, x2: 0.55, y2: 1, major: true },
  { x1: 0.18, y1: 0, x2: 0.28, y2: 1 },
  { x1: 0.7, y1: 0, x2: 0.8, y2: 1 },
  { x1: 0, y1: 0.18, x2: 1, y2: 0.22 },
];

const STREET_LABELS: { x: number; y: number; label: string }[] = [
  { x: 0.32, y: 0.51, label: "KN 2 Ave" },
  { x: 0.55, y: 0.36, label: "KG 9 Ave" },
  { x: 0.74, y: 0.62, label: "KK 15 Rd" },
];

export function CityMap({
  pins,
  onPinPress,
  height = 240,
}: {
  pins: MapPin[];
  onPinPress?: (pin: MapPin) => void;
  height?: number;
}) {
  const c = useColors();
  return (
    <View
      style={[
        styles.map,
        {
          height,
          backgroundColor: c.muted,
          borderColor: c.border,
          borderRadius: 20,
        },
      ]}
    >
      <LinearGradient
        colors={["rgba(29,53,87,0.10)", "rgba(42,157,143,0.10)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {ROADS.map((r, i) => {
        const dx = (r.x2 - r.x1) * 100;
        const dy = (r.y2 - r.y1) * 100;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
        return (
          <View
            key={i}
            pointerEvents="none"
            style={{
              position: "absolute",
              left: `${r.x1 * 100}%`,
              top: `${r.y1 * 100}%`,
              width: `${length}%`,
              height: r.major ? 6 : 3,
              backgroundColor: r.major ? c.background : c.border,
              opacity: r.major ? 0.95 : 0.7,
              transform: [
                { translateX: -1 },
                { translateY: r.major ? -3 : -1.5 },
                { rotate: `${angle}deg` },
              ],
              transformOrigin: "left center" as any,
              borderRadius: 3,
            }}
          />
        );
      })}

      {STREET_LABELS.map((s, i) => (
        <Text
          key={i}
          pointerEvents="none"
          style={[
            styles.streetLabel,
            {
              left: `${s.x * 100}%`,
              top: `${s.y * 100}%`,
              color: c.mutedForeground,
            },
          ]}
        >
          {s.label}
        </Text>
      ))}

      {pins.map((pin) => (
        <Pressable
          key={pin.id}
          onPress={() => onPinPress?.(pin)}
          disabled={pin.kind === "you" || !onPinPress}
          style={({ pressed }) => [
            styles.pin,
            {
              left: `${pin.x * 100}%`,
              top: `${pin.y * 100}%`,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
          hitSlop={10}
        >
          <View
            style={[
              styles.pinDot,
              {
                backgroundColor:
                  pin.kind === "police"
                    ? c.secondary
                    : pin.kind === "hospital"
                      ? c.accent
                      : c.foreground,
              },
            ]}
          >
            <Feather
              name={
                pin.kind === "police" ? "shield" : pin.kind === "hospital" ? "plus" : "user"
              }
              size={12}
              color="#fff"
            />
          </View>
          <View
            style={[
              styles.pinLabel,
              { backgroundColor: c.background, borderColor: c.border },
            ]}
          >
            <Text
              numberOfLines={1}
              style={[styles.pinLabelText, { color: c.foreground }]}
            >
              {pin.name}
            </Text>
          </View>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    width: "100%",
    overflow: "hidden",
    borderWidth: 1,
    position: "relative",
  },
  streetLabel: {
    position: "absolute",
    fontFamily: "Inter_500Medium",
    fontSize: 10,
    transform: [{ translateX: -20 }, { translateY: -8 }],
  },
  pin: {
    position: "absolute",
    alignItems: "center",
    transform: [{ translateX: -14 }, { translateY: -28 }],
  },
  pinDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  pinLabel: {
    marginTop: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
    borderWidth: 1,
    maxWidth: 110,
  },
  pinLabelText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 9,
  },
});
