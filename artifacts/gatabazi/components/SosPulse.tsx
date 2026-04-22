import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  GestureResponderEvent,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useColors } from "@/hooks/useColors";

const HOLD_MS = 3000;
const SIZE = 220;

type Props = {
  onTrigger: () => void;
  silent?: boolean;
  labelHold: string;
  labelSending: string;
};

export function SosPulse({ onTrigger, silent, labelHold, labelSending }: Props) {
  const c = useColors();
  const ringA = useRef(new Animated.Value(0)).current;
  const ringB = useRef(new Animated.Value(0)).current;
  const ringC = useRef(new Animated.Value(0)).current;
  const progress = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const [pressing, setPressing] = useState(false);
  const [triggered, setTriggered] = useState(false);
  const triggerTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const loop = (val: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(val, {
            toValue: 1,
            duration: 2100,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(val, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      );
    const a = loop(ringA, 0);
    const b = loop(ringB, 700);
    const d = loop(ringC, 1400);
    a.start();
    b.start();
    d.start();
    return () => {
      a.stop();
      b.stop();
      d.stop();
    };
  }, [ringA, ringB, ringC]);

  const beginPress = (_e: GestureResponderEvent) => {
    if (triggered) return;
    setPressing(true);
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }
    Animated.parallel([
      Animated.timing(progress, {
        toValue: 1,
        duration: HOLD_MS,
        easing: Easing.linear,
        useNativeDriver: false,
      }),
      Animated.spring(scale, {
        toValue: 0.96,
        useNativeDriver: true,
      }),
    ]).start();
    triggerTimeout.current = setTimeout(() => {
      setTriggered(true);
      setPressing(false);
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success,
        ).catch(() => {});
      }
      onTrigger();
    }, HOLD_MS);
  };

  const cancelPress = () => {
    if (triggerTimeout.current) clearTimeout(triggerTimeout.current);
    triggerTimeout.current = null;
    setPressing(false);
    progress.stopAnimation();
    Animated.parallel([
      Animated.timing(progress, {
        toValue: 0,
        duration: 220,
        useNativeDriver: false,
      }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
    ]).start();
  };

  const ring = (val: Animated.Value, key: string) => (
    <Animated.View
      key={key}
      pointerEvents="none"
      style={[
        styles.ring,
        {
          width: SIZE,
          height: SIZE,
          borderRadius: SIZE / 2,
          backgroundColor: silent ? c.warning : c.primary,
          opacity: val.interpolate({
            inputRange: [0, 1],
            outputRange: [0.35, 0],
          }),
          transform: [
            {
              scale: val.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 1.6],
              }),
            },
          ],
        },
      ]}
    />
  );

  const dashOffset = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={styles.wrap} accessibilityLabel="Emergency SOS">
      <View style={styles.ringStack}>
        {ring(ringA, "a")}
        {ring(ringB, "b")}
        {ring(ringC, "c")}
      </View>
      <Animated.View style={{ transform: [{ scale }] }}>
        <Pressable
          onPressIn={beginPress}
          onPressOut={cancelPress}
          accessibilityRole="button"
          accessibilityLabel={labelHold}
          style={[
            styles.button,
            {
              width: SIZE,
              height: SIZE,
              borderRadius: SIZE / 2,
              backgroundColor: silent ? c.warning : c.primary,
              shadowColor: silent ? c.warning : c.primary,
            },
          ]}
        >
          <Animated.View
            pointerEvents="none"
            style={[
              styles.progressFill,
              {
                width: dashOffset,
                backgroundColor: "rgba(255,255,255,0.18)",
              },
            ]}
          />
          <Feather
            name={silent ? "shield" : "alert-triangle"}
            size={48}
            color="#fff"
          />
          <Text style={styles.label}>SOS</Text>
          <Text style={styles.sub}>
            {pressing ? labelSending : labelHold}
          </Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center" },
  ringStack: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  ring: { position: "absolute" },
  button: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    shadowOpacity: 0.45,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  progressFill: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
  },
  label: {
    color: "#fff",
    fontFamily: "Inter_700Bold",
    fontSize: 36,
    letterSpacing: 6,
    marginTop: 8,
  },
  sub: {
    color: "rgba(255,255,255,0.92)",
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    marginTop: 6,
    paddingHorizontal: 18,
    textAlign: "center",
  },
});
