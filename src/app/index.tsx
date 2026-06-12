import { useMemo, useState } from "react";
import {
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

function normalizeFlightNumber(value: string): string {
  return value.trim().replace(/\s+/g, "").toUpperCase();
}

export default function HomeScreen() {
  const [flightNumber, setFlightNumber] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const normalizedFlightNumber = useMemo(
    () => normalizeFlightNumber(flightNumber),
    [flightNumber]
  );

  const canSubmit = normalizedFlightNumber.length >= 3;

  function handleStart() {
    setHasSubmitted(true);

    if (!canSubmit) {
      return;
    }

    /**
     * MVP temporary behaviour:
     * Later this becomes:
     *
     * const flight = await fetchFlightByNumber(normalizedFlightNumber)
     *
     * For now we route to the available mock flight so the product flow works.
     */
    const matchedFlight =
      mockFlights.find(
        (flight) =>
          normalizeFlightNumber(flight.flightNumber) === normalizedFlightNumber
      ) ?? mockFlights[0];

    router.push({
      pathname: "/flight/[id]/overview",
      params: {
        id: matchedFlight.id
      }
    });
  }

  const shouldShowError = hasSubmitted && !canSubmit;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding", default: undefined })}
        style={styles.keyboardView}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
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
                  style={[
                    styles.input,
                    shouldShowError && styles.inputError
                  ]}
                />

                {shouldShowError ? (
                  <Text style={styles.errorText}>
                    Insira um número de voo válido.
                  </Text>
                ) : null}
              </View>

              <Pressable
                onPress={handleStart}
                style={({ pressed }) => [
                  styles.primaryButton,
                  !canSubmit && styles.primaryButtonDisabled,
                  pressed && canSubmit && styles.primaryButtonPressed
                ]}
              >
                <Text style={styles.primaryButtonText}>Começar</Text>
              </Pressable>
            </View>

            <Text style={styles.footerText}>
              Os dados ficam guardados apenas no seu dispositivo.
            </Text>
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
    padding: spacing.xl
  },

  card: {
    minHeight: 560,
    justifyContent: "center",
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

  inputError: {
    borderColor: colors.transitionAmber
  },

  errorText: {
    ...typography.caption,
    color: colors.textSecondary
  },

  primaryButton: {
    minHeight: 56,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.lg,
    backgroundColor: colors.primaryBlue
  },

  primaryButtonDisabled: {
    opacity: 0.55
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