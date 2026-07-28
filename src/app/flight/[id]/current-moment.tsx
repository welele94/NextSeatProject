import { Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { GuidanceModeBadge } from "@/components/flight/Sprint10Cards";
import { buildCurrentMomentExplanation } from "@/features/flightSnapshot/currentMomentExplanation";
import { buildFlightUiSnapshot } from "@/features/flightSnapshot/uiSnapshot";
import { useFlightSnapshot } from "@/features/flightSnapshot/useFlightSnapshot";
import { colors, radius, spacing, typography } from "@/theme";

export default function CurrentMomentScreen() {
  const { snapshot } = useFlightSnapshot();

  if (!snapshot) {
    return <SafeAreaView style={styles.safeArea} />;
  }

  const ui = buildFlightUiSnapshot(snapshot);
  const explanation = buildCurrentMomentExplanation(snapshot);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: ui.phaseTheme.pageBackground }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <GuidanceModeBadge confidenceLevel={ui.confidenceLevel} predictionMode={ui.predictionMode} />

        <View style={styles.header}>
          <Text style={[styles.eyebrow, { color: ui.phaseTheme.accent }]}>{explanation.eyebrow}</Text>
          <Text style={styles.title}>{explanation.title}</Text>
          <Text style={styles.body}>{explanation.body}</Text>
        </View>

        <View style={styles.cardsGroup}>
          {explanation.cards.map((card) => (
            <View
              key={card.title}
              style={[
                styles.explanationCard,
                {
                  backgroundColor: ui.phaseTheme.accentSurface,
                  borderColor: ui.phaseTheme.accentBorder
                }
              ]}
            >
              <View style={styles.cardHeaderRow}>
                <View style={[styles.cardIcon, { backgroundColor: ui.phaseTheme.accentSoft }]}>
                  <Text style={styles.cardEmoji}>{card.emoji}</Text>
                </View>
                <Text style={styles.cardTitle}>{card.title}</Text>
              </View>
              <Text style={styles.cardBody}>{card.body}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.reassuranceBox, { borderColor: ui.phaseTheme.accentBorder }]}>
          <Ionicons name="checkmark-circle-outline" size={22} color={ui.phaseTheme.accent} />
          <Text style={[styles.reassuranceText, { color: ui.phaseTheme.accent }]}> 
            {explanation.closingReassurance}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
    gap: spacing.xl,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing["3xl"],
    paddingBottom: 132
  },
  header: {
    gap: spacing.md
  },
  eyebrow: {
    ...typography.caption,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.8
  },
  title: {
    ...typography.hero,
    color: colors.textPrimary
  },
  body: {
    ...typography.body,
    color: colors.textSecondary
  },
  cardsGroup: {
    gap: spacing.lg
  },
  explanationCard: {
    gap: spacing.md,
    padding: spacing.xl,
    borderRadius: radius.xl,
    borderWidth: 1
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  cardIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center"
  },
  cardEmoji: {
    fontSize: 19,
    lineHeight: 24
  },
  cardTitle: {
    ...typography.section,
    color: colors.textPrimary,
    flex: 1
  },
  cardBody: {
    ...typography.body,
    color: colors.textSecondary
  },
  reassuranceBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: radius.xl,
    borderWidth: 1,
    backgroundColor: colors.white
  },
  reassuranceText: {
    ...typography.body,
    flex: 1,
    fontWeight: "700"
  }
});
