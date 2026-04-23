import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { LANGUAGES, Language } from "@/constants/i18n";
import { useColors } from "@/hooks/useColors";

export function LanguageSheet({
  visible,
  current,
  onSelect,
  onClose,
}: {
  visible: boolean;
  current: Language;
  onSelect: (l: Language) => void;
  onClose: () => void;
}) {
  const c = useColors();
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={[styles.backdrop, { backgroundColor: c.overlay }]} onPress={onClose}>
        <Pressable
          onPress={() => {}}
          style={[
            styles.sheet,
            {
              backgroundColor: c.background,
              borderColor: c.border,
              borderRadius: c.radius,
            },
          ]}
        >
          <Text style={[styles.title, { color: c.foreground }]}>Language</Text>
          {LANGUAGES.map((l) => {
            const active = l.code === current;
            return (
              <Pressable
                key={l.code}
                onPress={() => {
                  onSelect(l.code);
                  onClose();
                }}
                style={({ pressed }) => [
                  styles.row,
                  {
                    backgroundColor: active ? c.muted : "transparent",
                    borderRadius: c.radius - 4,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <View
                  style={[
                    styles.flag,
                    { backgroundColor: c.secondary, borderRadius: 8 },
                  ]}
                >
                  <Text style={styles.flagText}>{l.flag}</Text>
                </View>
                <Text style={[styles.rowText, { color: c.foreground }]}>
                  {l.label}
                </Text>
                {active ? (
                  <Feather name="check" size={18} color={c.accent} />
                ) : null}
              </Pressable>
            );
          })}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, alignItems: "center", justifyContent: "flex-end" },
  sheet: {
    width: "100%",
    padding: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    gap: 6,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    marginBottom: 6,
    paddingHorizontal: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
  },
  flag: {
    width: 36,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  flagText: {
    color: "#fff",
    fontFamily: "Inter_700Bold",
    fontSize: 11,
    letterSpacing: 1,
  },
  rowText: { flex: 1, fontFamily: "Inter_500Medium", fontSize: 16 },
});
