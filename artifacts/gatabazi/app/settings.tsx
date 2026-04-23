import { Feather } from "@expo/vector-icons";
import { Linking } from "react-native";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Card, PrimaryButton } from "@/components/Brand";
import { LanguageSheet } from "@/components/LanguageSheet";
import { LANGUAGES, Language } from "@/constants/i18n";
import { useApp, type ThemePref } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";

export default function Settings() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const {
    t,
    profile,
    language,
    theme,
    setTheme,
    setLanguage,
    isAuthed,
    permissions,
    setPermissions,
    addEmergencyContact,
    removeEmergencyContact,
    signOut,
  } = useApp();
  const [langOpen, setLangOpen] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [cName, setCName] = useState("");
  const [cPhone, setCPhone] = useState("");
  const [cRel, setCRel] = useState("");

  const saveContact = () => {
    if (!cName.trim() || !cPhone.trim()) return;
    addEmergencyContact({ name: cName.trim(), phone: cPhone.trim(), relation: cRel.trim() });
    setCName("");
    setCPhone("");
    setCRel("");
    setShowAdd(false);
  };

  const contacts = profile.emergencyContacts || [];
  const topInset = isWeb ? Math.max(insets.top, 67) : insets.top + 8;

  const langLabel =
    LANGUAGES.find((l) => l.code === language)?.label || "English";

  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      <View style={[styles.header, { paddingTop: topInset }]}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={14}
          style={[styles.iconBtn, { backgroundColor: c.card, borderColor: c.border }]}
        >
          <Feather name="arrow-left" size={18} color={c.foreground} />
        </Pressable>
        <Text style={[styles.title, { color: c.foreground }]}>{t("settings")}</Text>
        <View style={{ width: 34 }} />
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: 20,
          paddingBottom: Math.max(insets.bottom, isWeb ? 40 : 24) + 16,
          gap: 14,
        }}
      >
        <Card>
          <View style={styles.profileRow}>
            <View
              style={[
                styles.avatar,
                { backgroundColor: c.secondary },
              ]}
            >
              <Text style={styles.avatarText}>
                {(profile.name || "G").charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.name, { color: c.foreground }]}>
                {profile.name || (isAuthed ? t("defaultUser") : t("notSignedIn"))}
              </Text>
              <Text style={[styles.meta, { color: c.mutedForeground }]}>
                {profile.phone || "—"} · {profile.role === "lifesaver" ? t("lifeSaver") : t("citizen")}
              </Text>
            </View>
          </View>
          <View style={styles.badgeRow}>
            {isAuthed ? (
              <Badge label={t("signedIn")} icon="check-circle" tone="accent" />
            ) : null}
            {profile.role === "lifesaver" && profile.credentialUploaded ? (
              <Badge label={t("credentialVerified")} icon="award" tone="secondary" />
            ) : null}
            {profile.bloodType ? (
              <Badge label={`${t("bloodType")} ${profile.bloodType}`} icon="droplet" tone="primary" />
            ) : null}
          </View>
        </Card>

        <Card>
          <SectionTitle icon="globe" label={t("language")} />
          <Pressable
            onPress={() => setLangOpen(true)}
            style={({ pressed }) => [
              styles.row,
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Text style={[styles.rowLabel, { color: c.foreground }]}>
              {langLabel}
            </Text>
            <Feather name="chevron-right" size={18} color={c.mutedForeground} />
          </Pressable>
        </Card>

        <Card>
          <SectionTitle icon="moon" label={t("appearance")} />
          <View style={{ flexDirection: "row", gap: 8 }}>
            {(["system", "light", "dark"] as ThemePref[]).map((opt) => {
              const active = theme === opt;
              return (
                <Pressable
                  key={opt}
                  onPress={() => setTheme(opt)}
                  style={[
                    styles.themeChip,
                    {
                      backgroundColor: active ? c.foreground : c.background,
                      borderColor: active ? c.foreground : c.border,
                      borderRadius: c.radius,
                    },
                  ]}
                >
                  <Feather
                    name={
                      opt === "system" ? "smartphone" : opt === "light" ? "sun" : "moon"
                    }
                    size={14}
                    color={active ? c.background : c.foreground}
                  />
                  <Text
                    style={[
                      styles.themeChipText,
                      { color: active ? c.background : c.foreground },
                    ]}
                  >
                    {opt === "system" ? t("system") : opt === "light" ? t("light") : t("dark")}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Card>

        <Card>
          <SectionTitle icon="users" label={t("emergencyContacts")} />
          <Text style={[styles.hint, { color: c.mutedForeground }]}>
            {t("emergencyContactsHint")}
          </Text>
          <View style={{ height: 12 }} />
          {contacts.length === 0 && !showAdd ? (
            <Text style={[styles.empty, { color: c.mutedForeground }]}>
              {t("noContacts")}
            </Text>
          ) : null}
          {contacts.map((ec, idx) => (
            <View
              key={ec.id}
              style={[
                styles.contactRow,
                idx === contacts.length - 1
                  ? null
                  : { borderBottomColor: c.border, borderBottomWidth: 1 },
              ]}
            >
              <View style={[styles.contactAvatar, { backgroundColor: c.accent }]}>
                <Text style={styles.contactAvatarText}>
                  {ec.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.contactName, { color: c.foreground }]}>
                  {ec.name}
                </Text>
                <Text style={[styles.contactMeta, { color: c.mutedForeground }]}>
                  {ec.phone}
                  {ec.relation ? ` · ${ec.relation}` : ""}
                </Text>
              </View>
              <Pressable
                onPress={() => Linking.openURL(`tel:${ec.phone}`).catch(() => {})}
                hitSlop={10}
                style={[styles.smallBtn, { backgroundColor: c.accent }]}
              >
                <Feather name="phone" size={14} color="#fff" />
              </Pressable>
              <Pressable
                onPress={() => removeEmergencyContact(ec.id)}
                hitSlop={10}
                style={[styles.smallBtn, { backgroundColor: c.muted, marginLeft: 6 }]}
              >
                <Feather name="trash-2" size={14} color={c.foreground} />
              </Pressable>
            </View>
          ))}
          {showAdd ? (
            <View style={{ gap: 10, marginTop: 10 }}>
              <TextInput
                value={cName}
                onChangeText={setCName}
                placeholder={t("contactName")}
                placeholderTextColor={c.mutedForeground}
                style={[
                  styles.input,
                  { color: c.foreground, borderColor: c.border, backgroundColor: c.background },
                ]}
              />
              <TextInput
                value={cPhone}
                onChangeText={setCPhone}
                placeholder={t("contactPhone")}
                placeholderTextColor={c.mutedForeground}
                keyboardType="phone-pad"
                style={[
                  styles.input,
                  { color: c.foreground, borderColor: c.border, backgroundColor: c.background },
                ]}
              />
              <TextInput
                value={cRel}
                onChangeText={setCRel}
                placeholder={t("contactRelation")}
                placeholderTextColor={c.mutedForeground}
                style={[
                  styles.input,
                  { color: c.foreground, borderColor: c.border, backgroundColor: c.background },
                ]}
              />
              <View style={{ flexDirection: "row", gap: 8 }}>
                <Pressable
                  onPress={() => {
                    setShowAdd(false);
                    setCName("");
                    setCPhone("");
                    setCRel("");
                  }}
                  style={[
                    styles.ghostBtn,
                    { borderColor: c.border, borderRadius: c.radius, flex: 1 },
                  ]}
                >
                  <Text style={[styles.ghostBtnText, { color: c.foreground }]}>
                    {t("cancel")}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={saveContact}
                  disabled={!cName.trim() || !cPhone.trim()}
                  style={[
                    styles.solidBtn,
                    {
                      backgroundColor: c.accent,
                      borderRadius: c.radius,
                      flex: 1,
                      opacity: !cName.trim() || !cPhone.trim() ? 0.5 : 1,
                    },
                  ]}
                >
                  <Feather name="check" size={14} color="#fff" />
                  <Text style={styles.solidBtnText}>{t("saveContact")}</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <Pressable
              onPress={() => setShowAdd(true)}
              style={[
                styles.addBtn,
                {
                  borderColor: c.accent,
                  borderRadius: c.radius,
                  marginTop: contacts.length > 0 ? 12 : 0,
                },
              ]}
            >
              <Feather name="plus" size={16} color={c.accent} />
              <Text style={[styles.addBtnText, { color: c.accent }]}>
                {t("addContact")}
              </Text>
            </Pressable>
          )}
        </Card>

        <Card>
          <SectionTitle icon="lock" label={t("permissions")} />
          <PermLine
            icon="map-pin"
            label={t("location")}
            value={permissions.location}
            onChange={(v) => setPermissions({ location: v })}
          />
          <PermLine
            icon="camera"
            label={t("camera")}
            value={permissions.camera}
            onChange={(v) => setPermissions({ camera: v })}
          />
          <PermLine
            icon="zap"
            label={t("network")}
            value={permissions.network}
            onChange={(v) => setPermissions({ network: v })}
          />
          <PermLine
            icon="bell"
            label={t("notifications")}
            value={permissions.notifications}
            onChange={(v) => setPermissions({ notifications: v })}
            last
          />
        </Card>

        {isAuthed ? (
          <PrimaryButton
            variant="ghost"
            icon="log-out"
            label={t("signOut")}
            onPress={() => {
              signOut();
              router.replace("/");
            }}
          />
        ) : (
          <PrimaryButton
            icon="user-plus"
            label={t("createAccount")}
            onPress={() => router.replace("/register")}
          />
        )}
      </ScrollView>

      <LanguageSheet
        visible={langOpen}
        current={language}
        onSelect={(l: Language) => setLanguage(l)}
        onClose={() => setLangOpen(false)}
      />
    </View>
  );
}

function SectionTitle({
  icon,
  label,
}: {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
}) {
  const c = useColors();
  return (
    <View style={styles.sectionTitle}>
      <Feather name={icon} size={14} color={c.mutedForeground} />
      <Text style={[styles.sectionLabel, { color: c.mutedForeground }]}>
        {label.toUpperCase()}
      </Text>
    </View>
  );
}

function Badge({
  label,
  icon,
  tone,
}: {
  label: string;
  icon: React.ComponentProps<typeof Feather>["name"];
  tone: "primary" | "secondary" | "accent";
}) {
  const c = useColors();
  const bg =
    tone === "primary"
      ? "rgba(230,57,70,0.12)"
      : tone === "secondary"
        ? "rgba(29,53,87,0.12)"
        : "rgba(42,157,143,0.14)";
  const fg =
    tone === "primary" ? c.primary : tone === "secondary" ? c.secondary : c.accent;
  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: bg, borderColor: fg },
      ]}
    >
      <Feather name={icon} size={12} color={fg} />
      <Text style={[styles.badgeText, { color: fg }]}>{label}</Text>
    </View>
  );
}

function PermLine({
  icon,
  label,
  value,
  onChange,
  last,
}: {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  last?: boolean;
}) {
  const c = useColors();
  return (
    <View
      style={[
        styles.permLine,
        last ? null : { borderBottomColor: c.border, borderBottomWidth: 1 },
      ]}
    >
      <View style={[styles.permIcon, { backgroundColor: value ? c.accent : c.muted }]}>
        <Feather name={icon} size={14} color={value ? "#fff" : c.foreground} />
      </View>
      <Text style={[styles.rowLabel, { color: c.foreground, flex: 1 }]}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        thumbColor={value ? c.accent : c.background}
        trackColor={{ false: c.border, true: "rgba(42,157,143,0.45)" }}
      />
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
  title: { fontFamily: "Inter_700Bold", fontSize: 18 },
  profileRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#fff",
    fontFamily: "Inter_700Bold",
    fontSize: 22,
  },
  name: { fontFamily: "Inter_700Bold", fontSize: 17 },
  meta: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },
  badgeRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 14 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  badgeText: { fontFamily: "Inter_600SemiBold", fontSize: 11 },
  sectionTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  sectionLabel: { fontFamily: "Inter_700Bold", fontSize: 11, letterSpacing: 1 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  rowLabel: { fontFamily: "Inter_500Medium", fontSize: 15 },
  themeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
  },
  themeChipText: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  permLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
  },
  permIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  hint: { fontFamily: "Inter_400Regular", fontSize: 12, lineHeight: 17 },
  empty: { fontFamily: "Inter_400Regular", fontSize: 13, fontStyle: "italic" },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
  },
  contactAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  contactAvatarText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 14 },
  contactName: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  contactMeta: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 1 },
  smallBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    minHeight: 48,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderRadius: 12,
    fontFamily: "Inter_500Medium",
    fontSize: 15,
  },
  addBtn: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1.5,
    borderStyle: "dashed",
  },
  addBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  ghostBtn: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  ghostBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  solidBtn: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  solidBtnText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 14 },
});
