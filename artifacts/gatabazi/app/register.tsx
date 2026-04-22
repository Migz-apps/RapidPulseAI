import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
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
import { useApp } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";

type Step = "phone" | "role" | "permissions" | "profile";

export default function Register() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const { t, profile, setProfile, permissions, setPermissions, setAuthed } = useApp();

  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState(profile.phone || "+250 ");
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [name, setName] = useState(profile.name);
  const [bloodType, setBloodType] = useState(profile.bloodType || "O+");
  const [allergies, setAllergies] = useState(profile.allergies);
  const [contact, setContact] = useState(profile.emergencyContact);
  const [credUploaded, setCredUploaded] = useState(profile.credentialUploaded);

  useEffect(() => {
    if (step === "phone" && phone.replace(/\D/g, "").length >= 10 && !verifying && !verified) {
      setVerifying(true);
      const id = setTimeout(() => {
        setVerifying(false);
        setVerified(true);
        setStep("role");
      }, 3000);
      return () => clearTimeout(id);
    }
  }, [step, phone, verifying, verified]);

  const finish = () => {
    setProfile({
      name,
      phone,
      bloodType,
      allergies,
      emergencyContact: contact,
      credentialUploaded: credUploaded,
    });
    setAuthed(true);
    router.replace("/dashboard");
  };

  const back = () => {
    if (step === "phone") router.back();
    else if (step === "role") setStep("phone");
    else if (step === "permissions") setStep("role");
    else if (step === "profile") setStep("permissions");
  };

  const stepIndex = ["phone", "role", "permissions", "profile"].indexOf(step);
  const topInset = isWeb ? Math.max(insets.top, 67) : insets.top + 8;

  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      <View style={[styles.header, { paddingTop: topInset }]}>
        <Pressable
          onPress={back}
          hitSlop={14}
          style={[styles.iconBtn, { backgroundColor: c.card, borderColor: c.border }]}
        >
          <Feather name="arrow-left" size={18} color={c.foreground} />
        </Pressable>
        <View style={styles.progress}>
          {[0, 1, 2, 3].map((i) => (
            <View
              key={i}
              style={[
                styles.progressDot,
                {
                  backgroundColor: i <= stepIndex ? c.primary : c.border,
                  width: i === stepIndex ? 24 : 8,
                },
              ]}
            />
          ))}
        </View>
        <View style={{ width: 34 }} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: Math.max(insets.bottom, isWeb ? 40 : 24) + 100 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {step === "phone" ? (
          <View>
            <Text style={[styles.title, { color: c.foreground }]}>
              {t("phoneNumber")}
            </Text>
            <Text style={[styles.subtitle, { color: c.mutedForeground }]}>
              We verify silently using your SIM. No codes to type.
            </Text>
            <Card style={{ marginTop: 16 }}>
              <View style={styles.phoneRow}>
                <Feather name="phone" size={18} color={c.mutedForeground} />
                <TextInput
                  value={phone}
                  onChangeText={(v) => {
                    setPhone(v);
                    setVerified(false);
                  }}
                  placeholder="+250 7XX XXX XXX"
                  placeholderTextColor={c.mutedForeground}
                  keyboardType="phone-pad"
                  style={[styles.phoneInput, { color: c.foreground }]}
                />
                {verifying ? (
                  <ActivityIndicator color={c.primary} />
                ) : verified ? (
                  <Feather name="check-circle" size={18} color={c.accent} />
                ) : null}
              </View>
              <Text style={[styles.helper, { color: c.mutedForeground }]}>
                {verifying
                  ? t("verifyingNumber")
                  : verified
                    ? t("numberVerified")
                    : "Enter your phone number to continue."}
              </Text>
            </Card>
          </View>
        ) : null}

        {step === "role" ? (
          <View>
            <Text style={[styles.title, { color: c.foreground }]}>
              {t("chooseRole")}
            </Text>
            <Text style={[styles.subtitle, { color: c.mutedForeground }]}>
              You can switch your role later in Settings.
            </Text>
            <View style={{ height: 16 }} />
            <RoleCard
              icon="user"
              title={t("citizen")}
              desc={t("citizenDesc")}
              active={profile.role === "citizen"}
              onPress={() => setProfile({ role: "citizen" })}
            />
            <View style={{ height: 12 }} />
            <RoleCard
              icon="activity"
              title={t("lifeSaver")}
              desc={t("lifeSaverDesc")}
              active={profile.role === "lifesaver"}
              onPress={() => setProfile({ role: "lifesaver" })}
            />
            {profile.role === "lifesaver" ? (
              <Card style={{ marginTop: 16 }}>
                <Text style={[styles.label, { color: c.foreground }]}>
                  {t("uploadCredential")}
                </Text>
                <Pressable
                  onPress={() => setCredUploaded(true)}
                  style={[
                    styles.upload,
                    {
                      borderColor: credUploaded ? c.accent : c.border,
                      backgroundColor: credUploaded
                        ? "rgba(42,157,143,0.10)"
                        : "transparent",
                      borderRadius: c.radius,
                    },
                  ]}
                >
                  <Feather
                    name={credUploaded ? "check-circle" : "upload-cloud"}
                    size={22}
                    color={credUploaded ? c.accent : c.mutedForeground}
                  />
                  <Text
                    style={[
                      styles.uploadText,
                      { color: credUploaded ? c.accent : c.foreground },
                    ]}
                  >
                    {credUploaded
                      ? t("credentialUploaded")
                      : "Tap to upload medical license"}
                  </Text>
                </Pressable>
              </Card>
            ) : null}
          </View>
        ) : null}

        {step === "permissions" ? (
          <View>
            <Text style={[styles.title, { color: c.foreground }]}>
              {t("permissions")}
            </Text>
            <Text style={[styles.subtitle, { color: c.mutedForeground }]}>
              {t("permissionsSubtitle")}
            </Text>
            <View style={{ height: 16 }} />
            <PermRow
              icon="map-pin"
              title={t("location")}
              desc={t("locationWhy")}
              value={permissions.location}
              onChange={(v) => setPermissions({ location: v })}
            />
            <PermRow
              icon="camera"
              title={t("camera")}
              desc={t("cameraWhy")}
              value={permissions.camera}
              onChange={(v) => setPermissions({ camera: v })}
            />
            <PermRow
              icon="zap"
              title={t("network")}
              desc={t("networkWhy")}
              value={permissions.network}
              onChange={(v) => setPermissions({ network: v })}
            />
            <PermRow
              icon="bell"
              title={t("notifications")}
              desc={t("notificationsWhy")}
              value={permissions.notifications}
              onChange={(v) => setPermissions({ notifications: v })}
            />
          </View>
        ) : null}

        {step === "profile" ? (
          <View>
            <Text style={[styles.title, { color: c.foreground }]}>
              {t("profile")}
            </Text>
            <Text style={[styles.subtitle, { color: c.mutedForeground }]}>
              Shared via the Blood-Type Handshake to nearby responders.
            </Text>
            <View style={{ height: 16 }} />
            <FieldInput
              label={t("yourName")}
              value={name}
              onChangeText={setName}
              placeholder="Full name"
            />
            <Text style={[styles.label, { color: c.foreground, marginTop: 16 }]}>
              {t("bloodType")}
            </Text>
            <View style={styles.chipRow}>
              {["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"].map((b) => {
                const active = b === bloodType;
                return (
                  <Pressable
                    key={b}
                    onPress={() => setBloodType(b)}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: active ? c.primary : c.card,
                        borderColor: active ? c.primary : c.border,
                        borderRadius: c.radius,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { color: active ? c.primaryForeground : c.foreground },
                      ]}
                    >
                      {b}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <FieldInput
              label={`${t("allergies")} (${t("optional")})`}
              value={allergies}
              onChangeText={setAllergies}
              placeholder="Penicillin, peanuts, …"
              style={{ marginTop: 16 }}
            />
            <FieldInput
              label={t("emergencyContact")}
              value={contact}
              onChangeText={setContact}
              placeholder="+250 7XX XXX XXX"
              style={{ marginTop: 16 }}
            />
          </View>
        ) : null}
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            backgroundColor: c.background,
            borderTopColor: c.border,
            paddingBottom: Math.max(insets.bottom, isWeb ? 34 : 16),
          },
        ]}
      >
        {step === "phone" ? (
          <PrimaryButton
            label={t("continue")}
            icon="arrow-right"
            disabled={!verified}
            onPress={() => setStep("role")}
          />
        ) : null}
        {step === "role" ? (
          <PrimaryButton
            label={t("continue")}
            icon="arrow-right"
            disabled={profile.role === "lifesaver" && !credUploaded}
            onPress={() => setStep("permissions")}
          />
        ) : null}
        {step === "permissions" ? (
          <PrimaryButton
            label={t("continue")}
            icon="arrow-right"
            onPress={() => setStep("profile")}
          />
        ) : null}
        {step === "profile" ? (
          <PrimaryButton label={t("finish")} icon="check" onPress={finish} />
        ) : null}
      </View>
    </View>
  );
}

function RoleCard({
  icon,
  title,
  desc,
  active,
  onPress,
}: {
  icon: React.ComponentProps<typeof Feather>["name"];
  title: string;
  desc: string;
  active: boolean;
  onPress: () => void;
}) {
  const c = useColors();
  return (
    <Pressable onPress={onPress}>
      <View
        style={[
          styles.roleCard,
          {
            backgroundColor: active ? "rgba(29,53,87,0.06)" : c.card,
            borderColor: active ? c.secondary : c.border,
            borderRadius: c.radius,
          },
        ]}
      >
        <View
          style={[
            styles.roleIcon,
            { backgroundColor: active ? c.secondary : c.muted },
          ]}
        >
          <Feather name={icon} size={20} color={active ? "#fff" : c.foreground} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.roleTitle, { color: c.foreground }]}>{title}</Text>
          <Text style={[styles.roleDesc, { color: c.mutedForeground }]}>{desc}</Text>
        </View>
        <View
          style={[
            styles.radio,
            {
              borderColor: active ? c.primary : c.border,
              backgroundColor: active ? c.primary : "transparent",
            },
          ]}
        >
          {active ? <Feather name="check" size={12} color="#fff" /> : null}
        </View>
      </View>
    </Pressable>
  );
}

function PermRow({
  icon,
  title,
  desc,
  value,
  onChange,
}: {
  icon: React.ComponentProps<typeof Feather>["name"];
  title: string;
  desc: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  const c = useColors();
  return (
    <View
      style={[
        styles.permRow,
        {
          backgroundColor: c.card,
          borderColor: c.border,
          borderRadius: c.radius,
        },
      ]}
    >
      <View
        style={[
          styles.permIcon,
          {
            backgroundColor: value ? c.accent : c.muted,
          },
        ]}
      >
        <Feather name={icon} size={18} color={value ? "#fff" : c.foreground} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.roleTitle, { color: c.foreground }]}>{title}</Text>
        <Text style={[styles.roleDesc, { color: c.mutedForeground }]}>{desc}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        thumbColor={value ? c.accent : c.background}
        trackColor={{ false: c.border, true: "rgba(42,157,143,0.45)" }}
      />
    </View>
  );
}

function FieldInput({
  label,
  style,
  ...rest
}: React.ComponentProps<typeof TextInput> & { label: string; style?: any }) {
  const c = useColors();
  return (
    <View style={style}>
      <Text style={[styles.label, { color: c.foreground }]}>{label}</Text>
      <TextInput
        placeholderTextColor={c.mutedForeground}
        {...rest}
        style={[
          styles.input,
          {
            color: c.foreground,
            backgroundColor: c.card,
            borderColor: c.border,
            borderRadius: c.radius,
          },
        ]}
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
  progress: { flexDirection: "row", gap: 6, alignItems: "center" },
  progressDot: { height: 8, borderRadius: 4 },
  scroll: { padding: 20, paddingTop: 8 },
  title: { fontFamily: "Inter_700Bold", fontSize: 26 },
  subtitle: { fontFamily: "Inter_400Regular", fontSize: 14, marginTop: 6 },
  label: { fontFamily: "Inter_600SemiBold", fontSize: 14, marginBottom: 6 },
  helper: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 8 },
  phoneRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  phoneInput: {
    flex: 1,
    fontFamily: "Inter_500Medium",
    fontSize: 18,
    paddingVertical: 8,
  },
  roleCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderWidth: 1,
  },
  roleIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  roleTitle: { fontFamily: "Inter_700Bold", fontSize: 16 },
  roleDesc: { fontFamily: "Inter_400Regular", fontSize: 13, marginTop: 2 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  permRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
  },
  permIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  upload: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderWidth: 1.5,
    borderStyle: "dashed",
  },
  uploadText: { fontFamily: "Inter_500Medium", fontSize: 14 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 6 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    minWidth: 56,
    alignItems: "center",
  },
  chipText: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  input: {
    fontFamily: "Inter_500Medium",
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
  },
});
