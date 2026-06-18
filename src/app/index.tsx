import { useMemo, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { mockFlights } from "@/data/mockFlights";
import { colors, radius, spacing, typography } from "@/theme";

const nextSeatLogo = require("@/assets/logo/NextSeat_AppIcon_1024.png");

function normalizeFlightNumber(value: string): string {
  return value.trim().replace(/\s+/g, "").toUpperCase();
}

export default function HomeScreen() {
  const [flightNumber, setFlightNumber] = useState("");

  const normalizedFlightNumber = useMemo(
    () => normalizeFlightNumber(flightNumber),
    [flightNumber]
  );

  const hasFlightNumber = normalizedFlightNumber.length >= 3;

  function handleStart() {
    /**
     * MVP temporary behaviour:
     * If the user types a flight number, we try to match it.
     * If not, we still open the mock flight.
     *
     * Later this becomes:
     * const flight = await fetchFlightByNumber(normalizedFlightNumber)
     */
    const matchedFlight = hasFlightNumber
      ? mockFlights.find(
          (flight) =>
            normalizeFlightNumber(flight.flightNumber) === normalizedFlightNumber
        ) ?? mockFlights[0]
      : mockFlights[0];

    router.push({
      pathname: "/flight/[id]/overview",
      params: {
        id: matchedFlight.id
      }
    });
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <View style={styles.screenGroup}>
            <View style={styles.brand}>
              <Image
                source={nextSeatLogo}
                resizeMode="contain"
                style={styles.logo}
              />

              <Text style={styles.brandName}>Next Seat</Text>

              <Text style={styles.brandTagline}>
                Your flight, explained calmly.
              </Text>
            </View>

            <View style={styles.card}>
              <View style={styles.header}>
                <Text style={styles.title}>Vamos começar!</Text>

                <Text style={styles.subtitle}>
                  Insira o número do seu voo para continuarmos.
                </Text>
              </View>

              <View style={styles.form}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Número do voo</Text>

                  <TextInput
                    value={flightNumber}
                    onChangeText={setFlightNumber}
                    placeholder="Ex: TP1025"
                    placeholderTextColor={colors.textSecondary}
                    autoCapitalize="characters"
                    autoCorrect={false}
                    returnKeyType="done"
                    onSubmitEditing={handleStart}
                    style={styles.input}
                  />
                </View>

                <Pressable
                  onPress={handleStart}
                  style={({ pressed }) => [
                    styles.primaryButton,
                    pressed && styles.primaryButtonPressed
                  ]}
                >
                  <Text style={styles.primaryButtonText}>Começar</Text>
                </Pressable>
              </View>

              <Text style={styles.footerText}>
                Os dados ficam guardados apenas no seu dispositivo.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  },

  keyboardView: {
    flex: 1
  },

  content: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing["4xl"]
  },

  screenGroup: {
    width: "100%",
    maxWidth: 390,
    alignSelf: "center",
    gap: 48
  },

  brand: {
    alignItems: "center",
    gap: spacing.xs
  },

  logo: {
    width: 58,
    height: 58,
    marginBottom: spacing.md
  },

  brandName: {
    ...typography.title,
    color: colors.textPrimary,
    fontWeight: "800",
    textAlign: "center"
  },

  brandTagline: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: "center"
  },

  card: {
    width: "100%",
    gap: spacing["3xl"],
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing["4xl"],
    borderRadius: radius.hero,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border
  },

  header: {
    alignItems: "center",
    gap: spacing.md
  },

  title: {
    ...typography.title,
    color: colors.textPrimary,
    fontWeight: "700",
    textAlign: "center"
  },

  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
    maxWidth: 260
  },

  form: {
    gap: spacing.xl
  },

  inputGroup: {
    gap: spacing.sm
  },

  label: {
    ...typography.caption,
    color: colors.textPrimary,
    fontWeight: "700"
  },

  input: {
    minHeight: 56,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "600"
  },

  primaryButton: {
    minHeight: 56,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.lg,
    backgroundColor: colors.primaryBlue
  },

  primaryButtonPressed: {
    opacity: 0.86
  },

  primaryButtonText: {
    ...typography.body,
    color: colors.white,
    fontWeight: "700"
  },

  footerText: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: "center",
    maxWidth: 260,
    alignSelf: "center"
  }
});