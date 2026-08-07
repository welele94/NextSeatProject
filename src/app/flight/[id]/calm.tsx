import { Ionicons } from "@expo/vector-icons";
import { router, useGlobalSearchParams } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { buildFlightUiSnapshot } from "@/features/flightSnapshot/uiSnapshot";
import { useFlightSnapshot } from "@/features/flightSnapshot/useFlightSnapshot";
import { colors, radius, spacing, typography } from "@/theme";

type CalmMode = "breathe" | "focus" | "explain";
type BreathStep = "prepare" | "inhale" | "exhale";

const PREPARE_SECONDS = 3;
const INHALE_SECONDS = 4;
const EXHALE_SECONDS = 6;
const CONTROLS_HIDE_MS = 4500;

function BreathingExercise() {
  const [step, setStep] = useState<BreathStep>("prepare");
  const [countdown, setCountdown] = useState(PREPARE_SECONDS);
  const scale = useRef(new Animated.Value(0.82)).current;
  const glowOpacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    let active = true;
    let phaseTimer: ReturnType<typeof setTimeout> | undefined;
    let countdownTimer: ReturnType<typeof setInterval> | undefined;

    function clearPhaseTimers() {
      if (phaseTimer) clearTimeout(phaseTimer);
      if (countdownTimer) clearInterval(countdownTimer);
    }

    function runPhase(nextStep: BreathStep, seconds: number) {
      if (!active) return;
      clearPhaseTimers();
      setStep(nextStep);
      setCountdown(seconds);

      const durationMs = seconds * 1000;
      const startedAt = Date.now();

      if (nextStep === "inhale") {
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 1.08,
            duration: durationMs,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true
          }),
          Animated.timing(glowOpacity, {
            toValue: 0.72,
            duration: durationMs,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true
          })
        ]).start();
      } else if (nextStep === "exhale") {
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 0.82,
            duration: durationMs,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true
          }),
          Animated.timing(glowOpacity, {
            toValue: 0.3,
            duration: durationMs,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true
          })
        ]).start();
      } else {
        scale.setValue(0.82);
        glowOpacity.setValue(0.3);
      }

      countdownTimer = setInterval(() => {
        const elapsed = Date.now() - startedAt;
        const remaining = Math.max(1, Math.ceil((durationMs - elapsed) / 1000));
        setCountdown(remaining);
      }, 200);

      phaseTimer = setTimeout(() => {
        if (!active) return;
        if (nextStep === "prepare") runPhase("inhale", INHALE_SECONDS);
        else if (nextStep === "inhale") runPhase("exhale", EXHALE_SECONDS);
        else runPhase("inhale", INHALE_SECONDS);
      }, durationMs);
    }

    runPhase("prepare", PREPARE_SECONDS);

    return () => {
      active = false;
      clearPhaseTimers();
      scale.stopAnimation();
      glowOpacity.stopAnimation();
    };
  }, [glowOpacity, scale]);

  const instruction =
    step === "prepare" ? "Get ready" : step === "inhale" ? "Breathe in" : "Breathe out";

  return (
    <View style={styles.breatheContent}>
      <View style={styles.breathStage}>
        <Animated.View style={[styles.breathGlow, { opacity: glowOpacity, transform: [{ scale }] }]} />
        <Animated.View style={[styles.breathCircle, { transform: [{ scale }] }]}>
          <Text style={styles.countdown}>{countdown}</Text>
          <Text style={styles.breathWord}>{instruction}</Text>
        </Animated.View>
      </View>
      {step === "prepare" ? (
        <Text style={styles.singleInstruction}>Just follow the circle.</Text>
      ) : null}
    </View>
  );
}

function FocusExercise() {
  return (
    <View style={styles.toolContent}>
      <View style={styles.focusHalo}>
        <View style={styles.focusDot} />
      </View>
      <Text style={styles.toolTitle}>Let your eyes rest here.</Text>
      <Text style={styles.toolBody}>Notice the seat supporting you and one thing you can physically feel.</Text>
    </View>
  );
}

function ExplainExercise({
  phaseLabel,
  title,
  body
}: {
  phaseLabel: string;
  title: string;
  body: string;
}) {
  return (
    <View style={styles.toolCard}>
      <Text style={styles.toolEyebrow}>{phaseLabel}</Text>
      <Text style={styles.toolTitle}>{title}</Text>
      <Text style={styles.toolBody}>{body}</Text>
      <Text style={styles.savedNote}>Latest saved flight data · not live tracking</Text>
    </View>
  );
}

export default function CalmModeScreen() {
  const { id } = useGlobalSearchParams<{ id: string }>();
  const { snapshot } = useFlightSnapshot();
  const [selectedMode, setSelectedMode] = useState<CalmMode>("breathe");
  const [controlsVisible, setControlsVisible] = useState(false);
  const controlsTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const ui = useMemo(() => (snapshot ? buildFlightUiSnapshot(snapshot) : undefined), [snapshot]);

  useEffect(() => {
    if (!controlsVisible) return;

    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    controlsTimerRef.current = setTimeout(() => setControlsVisible(false), CONTROLS_HIDE_MS);

    return () => {
      if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    };
  }, [controlsVisible, selectedMode]);

  function revealControls() {
    setControlsVisible(true);
  }

  function goBackToOverview() {
    if (!id) {
      router.back();
      return;
    }

    router.replace({
      pathname: "/flight/[id]/overview" as never,
      params: { id } as never
    });
  }

  if (!snapshot || !ui) return <SafeAreaView style={styles.safeArea} />;

  return (
    <SafeAreaView style={styles.safeArea}>
      <Pressable accessibilityRole="button" onPress={revealControls} style={styles.immersiveArea}>
        <View pointerEvents="none" style={styles.softGlowTop} />
        <View pointerEvents="none" style={styles.softGlowBottom} />

        {selectedMode === "breathe" ? <BreathingExercise /> : null}
        {selectedMode === "focus" ? <FocusExercise /> : null}
        {selectedMode === "explain" ? (
          <ExplainExercise
            phaseLabel={ui.currentPhaseLabel}
            title={ui.reassuranceMessage.title}
            body={ui.reassuranceMessage.body}
          />
        ) : null}

        {controlsVisible ? (
          <View style={styles.controlsOverlay}>
            <Pressable
              accessibilityRole="button"
              onPress={(event) => {
                event.stopPropagation();
                goBackToOverview();
              }}
              style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
            >
              <Ionicons name="chevron-back" size={20} color={colors.primaryBlue} />
              <Text style={styles.backText}>Back</Text>
            </Pressable>

            <View style={styles.toolSwitcher}>
              <Pressable
                accessibilityRole="button"
                onPress={(event) => {
                  event.stopPropagation();
                  setSelectedMode("breathe");
                }}
                style={({ pressed }) => [
                  styles.toolButton,
                  selectedMode === "breathe" && styles.toolButtonActive,
                  pressed && styles.pressed
                ]}
              >
                <Ionicons
                  name="pulse-outline"
                  size={19}
                  color={selectedMode === "breathe" ? colors.white : colors.primaryBlue}
                />
                <Text style={[styles.toolButtonText, selectedMode === "breathe" && styles.toolButtonTextActive]}>
                  Breathe
                </Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                onPress={(event) => {
                  event.stopPropagation();
                  setSelectedMode("focus");
                }}
                style={({ pressed }) => [
                  styles.toolButton,
                  selectedMode === "focus" && styles.toolButtonActive,
                  pressed && styles.pressed
                ]}
              >
                <Ionicons
                  name="eye-outline"
                  size={19}
                  color={selectedMode === "focus" ? colors.white : colors.primaryBlue}
                />
                <Text style={[styles.toolButtonText, selectedMode === "focus" && styles.toolButtonTextActive]}>
                  Focus
                </Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                onPress={(event) => {
                  event.stopPropagation();
                  setSelectedMode("explain");
                }}
                style={({ pressed }) => [
                  styles.toolButton,
                  selectedMode === "explain" && styles.toolButtonActive,
                  pressed && styles.pressed
                ]}
              >
                <Ionicons
                  name="chatbubble-ellipses-outline"
                  size={19}
                  color={selectedMode === "explain" ? colors.white : colors.primaryBlue}
                />
                <Text style={[styles.toolButtonText, selectedMode === "explain" && styles.toolButtonTextActive]}>
                  Explain
                </Text>
              </Pressable>
            </View>
          </View>
        ) : null}
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#EEF7FF" },
  immersiveArea: {
    flex: 1,
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden"
  },
  softGlowTop: {
    position: "absolute",
    top: -130,
    right: -110,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: "rgba(255,255,255,0.72)"
  },
  softGlowBottom: {
    position: "absolute",
    bottom: -170,
    left: -120,
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: "rgba(221,235,255,0.55)"
  },
  breatheContent: { alignItems: "center", justifyContent: "center", gap: spacing.xl },
  breathStage: { width: 290, height: 290, alignItems: "center", justifyContent: "center" },
  breathGlow: {
    position: "absolute",
    width: 246,
    height: 246,
    borderRadius: 123,
    backgroundColor: "#DFEDFF"
  },
  breathCircle: {
    width: 214,
    height: 214,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 107,
    backgroundColor: "#D6E7FF",
    borderWidth: 8,
    borderColor: "rgba(255,255,255,0.72)"
  },
  countdown: {
    ...typography.hero,
    color: colors.primaryBlue,
    fontSize: 58,
    lineHeight: 64,
    fontWeight: "700",
    fontVariant: ["tabular-nums"]
  },
  breathWord: {
    ...typography.section,
    color: colors.primaryBlue,
    fontSize: 19,
    lineHeight: 24,
    fontWeight: "700",
    marginTop: spacing.xs
  },
  singleInstruction: {
    ...typography.section,
    color: colors.textPrimary,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "700"
  },
  toolContent: { alignItems: "center", gap: spacing.xl, paddingHorizontal: spacing.xl },
  focusHalo: {
    width: 210,
    height: 210,
    borderRadius: 105,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#DFEDFF",
    borderWidth: 8,
    borderColor: "rgba(255,255,255,0.72)"
  },
  focusDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.primaryBlue },
  toolCard: {
    width: "88%",
    gap: spacing.lg,
    padding: spacing.xl,
    borderRadius: radius.xl,
    backgroundColor: "rgba(255,255,255,0.86)",
    borderWidth: 1,
    borderColor: "rgba(13,59,140,0.10)"
  },
  toolEyebrow: { ...typography.eyebrow, color: colors.primaryBlue, fontWeight: "800" },
  toolTitle: { ...typography.section, color: colors.textPrimary, textAlign: "center", fontSize: 23, lineHeight: 29 },
  toolBody: { ...typography.body, color: colors.textSecondary, textAlign: "center", lineHeight: 24, maxWidth: 330 },
  savedNote: { ...typography.caption, color: colors.textSecondary, textAlign: "center", lineHeight: 18 },
  controlsOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    backgroundColor: "rgba(238,247,255,0.08)"
  },
  backButton: {
    alignSelf: "flex-start",
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: "rgba(255,255,255,0.86)"
  },
  backText: { ...typography.caption, color: colors.primaryBlue, fontWeight: "800" },
  toolSwitcher: {
    flexDirection: "row",
    gap: spacing.sm,
    alignSelf: "center",
    padding: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: "rgba(255,255,255,0.88)",
    borderWidth: 1,
    borderColor: "rgba(13,59,140,0.08)"
  },
  toolButton: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill
  },
  toolButtonActive: { backgroundColor: colors.primaryBlue },
  toolButtonText: { ...typography.caption, color: colors.primaryBlue, fontWeight: "800" },
  toolButtonTextActive: { color: colors.white },
  pressed: { opacity: 0.86, transform: [{ scale: 0.99 }] }
});