import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { buildFlightUiSnapshot } from "@/features/flightSnapshot/uiSnapshot";
import { useFlightSnapshot } from "@/features/flightSnapshot/useFlightSnapshot";
import { colors, radius, spacing, typography } from "@/theme";

type CalmMode = "breathe" | "focus" | "explain";
type IoniconName = ComponentProps<typeof Ionicons>["name"];

type BreathStep = "inhale" | "exhale";

const INHALE_MS = 4000;
const EXHALE_MS = 6000;

const modes: Array<{
  id: CalmMode;
  title: string;
  body: string;
  icon: IoniconName;
}> = [
  {
    id: "breathe",
    title: "Help me breathe",
    body: "Use a simple, gentle breathing rhythm. No need to force a deep breath.",
    icon: "pulse-outline"
  },
  {
    id: "focus",
    title: "Help me focus",
    body: "Give your attention one calm visual point and notice what is around you.",
    icon: "eye-outline"
  },
  {
    id: "explain",
    title: "Tell me what’s happening",
    body: "Get a short explanation based on the latest flight information saved on this device.",
    icon: "chatbubble-ellipses-outline"
  }
];

function BreathingExercise() {
  const [step, setStep] = useState<BreathStep>("inhale");
  const scale = useRef(new Animated.Value(0.82)).current;
  const glowOpacity = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    let active = true;

    function runInhale() {
      if (!active) return;
      setStep("inhale");

      Animated.parallel([
        Animated.timing(scale, {
          toValue: 1.08,
          duration: INHALE_MS,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true
        }),
        Animated.timing(glowOpacity, {
          toValue: 0.78,
          duration: INHALE_MS,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true
        })
      ]).start(({ finished }) => {
        if (finished && active) runExhale();
      });
    }

    function runExhale() {
      if (!active) return;
      setStep("exhale");

      Animated.parallel([
        Animated.timing(scale, {
          toValue: 0.82,
          duration: EXHALE_MS,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true
        }),
        Animated.timing(glowOpacity, {
          toValue: 0.35,
          duration: EXHALE_MS,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true
        })
      ]).start(({ finished }) => {
        if (finished && active) runInhale();
      });
    }

    runInhale();

    return () => {
      active = false;
      scale.stopAnimation();
      glowOpacity.stopAnimation();
    };
  }, [glowOpacity, scale]);

  return (
    <View style={styles.exerciseCard}>
      <View style={styles.breathStage}>
        <Animated.View style={[styles.breathGlow, { opacity: glowOpacity, transform: [{ scale }] }]} />
        <Animated.View style={[styles.breathCircle, { transform: [{ scale }] }]}>
          <Text style={styles.breathWord}>{step === "inhale" ? "Breathe in" : "Breathe out"}</Text>
          <Text style={styles.breathTiming}>{step === "inhale" ? "4 seconds" : "6 seconds"}</Text>
        </Animated.View>
      </View>

      <Text style={styles.exerciseTitle}>Follow the circle</Text>
      <Text style={styles.exerciseBody}>
        Let the circle guide you. Breathe in as it expands, then breathe out slowly as it becomes smaller. You do not need to force a deep breath.
      </Text>
      <Text style={styles.smallNote}>The rhythm continues automatically. Just follow it for as long as it feels useful.</Text>
    </View>
  );
}

function FocusExercise() {
  return (
    <View style={styles.exerciseCard}>
      <Text style={styles.exerciseEyebrow}>Visual grounding</Text>
      <View style={styles.focusArea}>
        <View style={styles.focusHalo}>
          <View style={styles.focusDot} />
        </View>
      </View>
      <Text style={styles.exerciseTitle}>Let your eyes rest here</Text>
      <Text style={styles.exerciseBody}>
        Keep your gaze on the point if it feels comfortable. Notice the seat supporting you, one sound around you, and one thing you can physically feel.
      </Text>
      <Text style={styles.smallNote}>You can look away at any time. The goal is simply to give your attention somewhere steady.</Text>
    </View>
  );
}

function ExplainExercise({
  phaseLabel,
  title,
  body,
  guidanceCopy
}: {
  phaseLabel: string;
  title: string;
  body: string;
  guidanceCopy: string;
}) {
  return (
    <View style={styles.exerciseCard}>
      <Text style={styles.exerciseEyebrow}>{phaseLabel}</Text>
      <Text style={styles.exerciseTitle}>{title}</Text>
      <Text style={styles.exerciseBody}>{body}</Text>
      <View style={styles.reassuranceStrip}>
        <Ionicons name="shield-checkmark-outline" size={20} color={colors.primaryBlue} />
        <Text style={styles.reassuranceText}>{guidanceCopy}</Text>
      </View>
      <Text style={styles.smallNote}>Based on the latest flight data saved on this device. This is not live tracking.</Text>
    </View>
  );
}

export default function CalmModeScreen() {
  const { snapshot } = useFlightSnapshot();
  const [selectedMode, setSelectedMode] = useState<CalmMode>("breathe");

  const ui = useMemo(() => (snapshot ? buildFlightUiSnapshot(snapshot) : undefined), [snapshot]);

  if (!snapshot || !ui) return <SafeAreaView style={styles.safeArea} />;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.intro}>
          <Text style={styles.eyebrow}>Calm mode</Text>
          <Text style={styles.title}>You only need to handle this moment.</Text>
          <Text style={styles.subtitle}>Choose what feels easiest right now. There is no correct option.</Text>
        </View>

        <View style={styles.modeRow}>
          {modes.map((mode) => {
            const isActive = selectedMode === mode.id;
            return (
              <Pressable
                key={mode.id}
                accessibilityRole="button"
                onPress={() => setSelectedMode(mode.id)}
                style={({ pressed }) => [
                  styles.modeButton,
                  isActive && styles.modeButtonActive,
                  pressed && styles.pressed
                ]}
              >
                <Ionicons name={mode.icon} size={22} color={isActive ? colors.white : colors.primaryBlue} />
                <Text style={[styles.modeButtonText, isActive && styles.modeButtonTextActive]}>{mode.title}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.modeDescription}>{modes.find((mode) => mode.id === selectedMode)?.body}</Text>

        {selectedMode === "breathe" ? <BreathingExercise /> : null}
        {selectedMode === "focus" ? <FocusExercise /> : null}
        {selectedMode === "explain" ? (
          <ExplainExercise
            phaseLabel={ui.currentPhaseLabel}
            title={ui.reassuranceMessage.title}
            body={ui.reassuranceMessage.body}
            guidanceCopy={ui.guidanceCopy}
          />
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#EAF5FF" },
  content: {
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: 120
  },
  intro: { gap: spacing.sm },
  eyebrow: { ...typography.eyebrow, color: colors.primaryBlue, fontWeight: "800" },
  title: { ...typography.hero, color: colors.textPrimary, fontSize: 30, lineHeight: 36 },
  subtitle: { ...typography.body, color: colors.textSecondary, lineHeight: 24 },
  modeRow: { gap: spacing.sm },
  modeButton: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: "rgba(13, 59, 140, 0.14)",
    backgroundColor: "rgba(255,255,255,0.72)"
  },
  modeButtonActive: { backgroundColor: colors.primaryBlue, borderColor: colors.primaryBlue },
  modeButtonText: { ...typography.body, color: colors.textPrimary, fontWeight: "800" },
  modeButtonTextActive: { color: colors.white },
  modeDescription: { ...typography.caption, color: colors.textSecondary, lineHeight: 20, paddingHorizontal: spacing.sm },
  exerciseCard: {
    gap: spacing.lg,
    padding: spacing.xl,
    borderRadius: radius.xl,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: "rgba(13, 59, 140, 0.10)"
  },
  exerciseEyebrow: { ...typography.eyebrow, color: colors.primaryBlue, fontWeight: "800" },
  exerciseTitle: { ...typography.section, color: colors.textPrimary, fontSize: 22, lineHeight: 28 },
  exerciseBody: { ...typography.body, color: colors.textPrimary, lineHeight: 25 },
  breathStage: {
    height: 238,
    alignItems: "center",
    justifyContent: "center"
  },
  breathGlow: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "#EAF3FF"
  },
  breathCircle: {
    width: 190,
    height: 190,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 95,
    backgroundColor: "#DDEBFF",
    borderWidth: 8,
    borderColor: "#F4F8FF"
  },
  breathWord: { ...typography.section, color: colors.primaryBlue, fontWeight: "800" },
  breathTiming: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.xs },
  focusArea: { height: 210, alignItems: "center", justifyContent: "center" },
  focusHalo: {
    width: 148,
    height: 148,
    borderRadius: 74,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EDF5FF"
  },
  focusDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.primaryBlue },
  reassuranceStrip: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: "#F2F7FF"
  },
  reassuranceText: { ...typography.caption, color: colors.textPrimary, lineHeight: 20, flex: 1 },
  smallNote: { ...typography.caption, color: colors.textSecondary, lineHeight: 19 },
  pressed: { opacity: 0.88, transform: [{ scale: 0.996 }] }
});