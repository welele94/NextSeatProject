import { useMemo, useState } from "react";
import {
  ActivityIndicator,
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
import { createFlightFromExternalSeed } from "@/features/flightLookup/createFlightFromExternalSeed";
import { savePreparedFlight } from "@/features/flightLookup/preparedFlightStorage";
import { requestFlightLookup } from "@/features/flightLookup/requestFlightLookup";
import {
  ExternalFlightSeed,
  FlightLookupFailureReason
} from "@/features/flightLookup/types";
import { colors, radius, spacing, typography } from "@/theme";

const nextSeatLogo = require("@/assets/logo/NextSeat_AppIcon_1024.png");

function normalizeFlightNumber(value: string): string {
  return value.trim().replace(/\s+/g, "").toUpperCase();
}

function todayIsoDate(): string {
  const now = new Date();
  const offsetMs = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offsetMs).toISOString().slice(0, 10);
}

function formatUtc(value?: string): string {
  if (!value) {
    return "Time not available";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function failureMessage(reason: FlightLookupFailureReason): string {
  switch (reason) {
    case "not_found":
      return "We couldn’t find this flight right now. You can still prepare your journey manually.";
    case "provider_unavailable":
    case "provider_not_configured":
    case "rate_limited":
      return "We couldn’t check this flight right now. You can still add it manually and Next Seat will prepare offline guidance.";
    case "invalid_flight_number":
      return "Please check the flight number and try again.";
    default:
      return "Some flight details are limited, but Next Seat can still prepare calm guidance for this journey.";
  }
}

export default function HomeScreen() {
  const [flightNumber, setFlightNumber] = useState("");
  const [date, setDate] = useState(todayIsoDate());
  const [isLoading, setIsLoading] = useState(false);
  const [lookupResult, setLookupResult] = useState<ExternalFlightSeed | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const normalizedFlightNumber = useMemo(
    () => normalizeFlightNumber(flightNumber),
    [flightNumber]
  );

  const hasFlightNumber = normalizedFlightNumber.length >= 3;

  async function handleLookup() {
    if (!hasFlightNumber || isLoading) {
      return;
    }

    setIsLoading(true);
    setLookupResult(null);
    setErrorMessage(null);

    const result = await requestFlightLookup({
      flightNumber: normalizedFlightNumber,
      date: date.trim() || undefined
    });

    if (result.ok) {
      setLookupResult(result.data);
    } else {
      setErrorMessage(failureMessage(result.reason));
    }

    setIsLoading(false);
  }

  async function handleConfirm() {
    if (lookupResult) {
      const preparedFlight = createFlightFromExternalSeed(lookupResult);
      await savePreparedFlight(preparedFlight);

      router.push({
        pathname: "/flight/[id]/overview",
        params: { id: preparedFlight.id }
      });
      return;
    }

    router.push({
      pathname: "/flight/[id]/overview",
      params: { id: mockFlights[0].id }
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
              <Image source={nextSeatLogo} resizeMode="contain" style={styles.logo} />
              <Text style={styles.brandName}>Next Seat</Text>
              <Text style={styles.brandTagline}>Your flight, explained calmly.</Text>
            </View>

            <View style={styles.card}>
              <View style={styles.header}>
                <Text style={styles.title}>Vamos começar!</Text>
                <Text style={styles.subtitle}>
                  Insira o número e a data do seu voo. Vamos procurar apenas os detalhes necessários para preparar a viagem.
                </Text>
              </View>

              <View style={styles.form}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Número do voo</Text>
                  <TextInput
                    value={flightNumber}
                    onChangeText={(value) => {
                      setFlightNumber(value);
                      setLookupResult(null);
                      setErrorMessage(null);
                    }}
                    placeholder="Ex: TP1025"
                    placeholderTextColor={colors.textSecondary}
                    autoCapitalize="characters"
                    autoCorrect={false}
                    returnKeyType="next"
                    style={styles.input}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Data do voo</Text>
                  <TextInput
                    value={date}
                    onChangeText={(value) => {
                      setDate(value);
                      setLookupResult(null);
                      setErrorMessage(null);
                    }}
                    placeholder="AAAA-MM-DD"
                    placeholderTextColor={colors.textSecondary}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="numbers-and-punctuation"
                    returnKeyType="search"
                    onSubmitEditing={handleLookup}
                    style={styles.input}
                  />
                </View>

                <Pressable
                  disabled={!hasFlightNumber || isLoading}
                  onPress={handleLookup}
                  style={({ pressed }) => [
                    styles.primaryButton,
                    (!hasFlightNumber || isLoading) && styles.primaryButtonDisabled,
                    pressed && styles.primaryButtonPressed
                  ]}
                >
                  {isLoading ? (
                    <ActivityIndicator color={colors.white} />
                  ) : (
                    <Text style={styles.primaryButtonText}>Procurar voo</Text>
                  )}
                </Pressable>
              </View>

              {lookupResult ? (
                <View style={styles.resultCard}>
                  <Text style={styles.resultEyebrow}>Flight found</Text>
                  <Text style={styles.resultTitle}>
                    {lookupResult.departureAirportCode ?? lookupResult.departureAirport}
                    {"  →  "}
                    {lookupResult.arrivalAirportCode ?? lookupResult.arrivalAirport}
                  </Text>
                  <Text style={styles.resultBody}>
                    {lookupResult.airlineName ?? lookupResult.airlineCode ?? "Airline"} · {lookupResult.flightNumber}
                  </Text>
                  <Text style={styles.resultBody}>
                    Departure: {formatUtc(lookupResult.estimatedDepartureUtc ?? lookupResult.scheduledDepartureUtc)}
                  </Text>
                  <Text style={styles.resultBody}>
                    Arrival: {formatUtc(lookupResult.estimatedArrivalUtc ?? lookupResult.scheduledArrivalUtc)}
                  </Text>
                  <Text style={styles.resultHint}>
                    Next Seat will save these details locally and prepare calm offline guidance.
                  </Text>
                  <Pressable onPress={handleConfirm} style={styles.confirmButton}>
                    <Text style={styles.primaryButtonText}>Confirmar este voo</Text>
                  </Pressable>
                  <Text style={styles.providerText}>
                    Source: {lookupResult.provider}
                  </Text>
                </View>
              ) : null}

              {errorMessage ? (
                <View style={styles.messageCard}>
                  <Text style={styles.messageText}>{errorMessage}</Text>
                  <Pressable onPress={handleConfirm} style={styles.manualButton}>
                    <Text style={styles.manualButtonText}>Continuar manualmente</Text>
                  </Pressable>
                </View>
              ) : null}

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
  safeArea: { flex: 1, backgroundColor: colors.background },
  keyboardView: { flex: 1 },
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
  brand: { alignItems: "center", gap: spacing.xs },
  logo: { width: 58, height: 58, marginBottom: spacing.md },
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
  header: { alignItems: "center", gap: spacing.md },
  title: {
    ...typography.title,
    color: colors.textPrimary,
    fontWeight: "700",
    textAlign: "center"
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center"
  },
  form: { gap: spacing.xl },
  inputGroup: { gap: spacing.sm },
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
  primaryButtonDisabled: { opacity: 0.45 },
  primaryButtonPressed: { opacity: 0.86 },
  primaryButtonText: {
    ...typography.body,
    color: colors.white,
    fontWeight: "700"
  },
  resultCard: {
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white
  },
  resultEyebrow: {
    ...typography.caption,
    color: colors.primaryBlue,
    fontWeight: "700"
  },
  resultTitle: {
    ...typography.title,
    color: colors.textPrimary,
    fontWeight: "800"
  },
  resultBody: { ...typography.body, color: colors.textPrimary },
  resultHint: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.sm
  },
  confirmButton: {
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.lg,
    backgroundColor: colors.primaryBlue,
    marginTop: spacing.md
  },
  providerText: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: "center"
  },
  messageCard: {
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border
  },
  messageText: { ...typography.body, color: colors.textSecondary },
  manualButton: { paddingVertical: spacing.sm, alignItems: "center" },
  manualButtonText: {
    ...typography.body,
    color: colors.primaryBlue,
    fontWeight: "700"
  },
  footerText: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: "center"
  }
});
