import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing, typography } from "@/theme";
import type {
  ConfidenceLevel,
  OfflineGuidanceStatus,
  PredictionMode,
  RoutePatternSummary
} from "@/features/flightSnapshot/uiSnapshot";
import type { NextExpectedMoment } from "@/types/nextExpectedMoment";

type StatusHeroCardProps = {
  title: string;
  body: string;
  phaseLabel: string;
  guidanceCopy: string;
};

type NextExpectedMomentCardProps = {
  moment: NextExpectedMoment;
  onPress?: () => void;
  expanded?: boolean;
};

type JourneyProgressProps = {
  routeLabel: string;
  phaseLabel: string;
  progressPercent: number;
};

type GuidanceModeBadgeProps = {
  confidenceLevel: ConfidenceLevel;
  predictionMode: PredictionMode;
};

type ConfirmationPromptProps = {
  onConfirm?: (answer: "yes" | "not_sure" | "changed") => void;
};

export function GuidanceModeBadge({
  confidenceLevel,
  predictionMode
}: GuidanceModeBadgeProps) {
  const label =
    predictionMode === "offline-estimated"
      ? "Ready offline"
      : predictionMode === "user-adjusted"
        ? "Adjusted calmly"
        : confidenceLevel === "low"
          ? "General guidance"
          : "Looks normal";

  return (
    <View style={styles.badge}>
      <Ionicons name="checkmark-circle-outline" size={16} color="#2F8066" />
      <Text style={styles.badgeText}>{label}</Text>
    </View>
  );
}

export function StatusHeroCard({
  title,
  body,
  phaseLabel,
  guidanceCopy
}: StatusHeroCardProps) {
  return (
    <View style={styles.hero}>
      <View style={styles.iconCircle}>
        <Ionicons name="happy-outline" size={34} color={colors.primaryBlue} />
      </View>

      <Text style={styles.heroTitle}>{title}</Text>
      <Text style={styles.heroBody}>{body}</Text>

      <View style={styles.phasePill}>
        <Text style={styles.phasePillText}>{phaseLabel}</Text>
      </View>

      <Text style={styles.guidanceCopy}>{guidanceCopy}</Text>
    </View>
  );
}

export function JourneyProgress({
  routeLabel,
  phaseLabel,
  progressPercent
}: JourneyProgressProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardLabel}>Current journey</Text>
      <Text style={styles.cardTitle}>{routeLabel}</Text>
      <Text style={styles.cardBody}>{phaseLabel}</Text>

      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { width: `${Math.max(progressPercent, 4)}%` }
          ]}
        />
      </View>
    </View>
  );
}

export function NextExpectedMomentCard({
  moment,
  onPress,
  expanded = false
}: NextExpectedMomentCardProps) {
  const content = (
    <>
      <View style={styles.cardHeaderRow}>
        <View style={styles.nextIcon}>
          <Ionicons name="pulse-outline" size={22} color="#2F8066" />
        </View>
        <Text style={styles.cardLabel}>Next expected moment</Text>
      </View>

      <Text style={styles.cardTitle}>{moment.title}</Text>
      <Text style={styles.cardBody}>{moment.body}</Text>

      {expanded ? (
        <View style={styles.noticeBox}>
          <Text style={styles.noticeTitle}>What you may notice</Text>
          <Text style={styles.noticeText}>
            Small sound changes, cabin preparation, or a gradual change in the
            rhythm of the flight can be completely normal.
          </Text>
          <Text style={styles.normalText}>This is a normal part of the flight.</Text>
        </View>
      ) : null}
    </>
  );

  if (!onPress) {
    return <View style={styles.card}>{content}</View>;
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      {content}
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

export function OfflineReadyCard({
  status,
  compact = false
}: {
  status: OfflineGuidanceStatus;
  compact?: boolean;
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Next Seat is ready to guide you offline</Text>
      {!compact ? (
        <Text style={styles.cardBody}>
          The app has saved the calm guidance it needs for this flight.
        </Text>
      ) : null}

      <View style={styles.checkList}>
        {status.items.map((item) => (
          <View key={item.label} style={styles.checkRow}>
            <Ionicons
              name={item.isReady ? "checkmark-circle" : "ellipse-outline"}
              size={18}
              color={item.isReady ? "#2F8066" : colors.textSecondary}
            />
            <Text style={styles.checkText}>{item.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export function RoutePatternCard({
  summary
}: {
  summary?: RoutePatternSummary;
}) {
  if (!summary) {
    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Recent route pattern</Text>
        <Text style={styles.cardBody}>
          Recent route data is not available yet. Next Seat can still guide you
          with calm general flight explanations.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{summary.title}</Text>
      <Text style={styles.cardBody}>{summary.body}</Text>
      {summary.typicalDurationLabel ? (
        <Text style={styles.detailLine}>
          Typical duration: {summary.typicalDurationLabel}
        </Text>
      ) : null}
      {summary.typicalDescentLabel ? (
        <Text style={styles.detailLine}>
          Descent preparation: {summary.typicalDescentLabel}
        </Text>
      ) : null}
      <Text style={styles.normalText}>{summary.reassurance}</Text>
    </View>
  );
}

export function FlightDetailsCard({
  routeLabel,
  phaseLabel
}: {
  routeLabel: string;
  phaseLabel: string;
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Current flight</Text>
      <Text style={styles.detailLine}>{routeLabel}</Text>
      <Text style={styles.detailLine}>Likely phase: {phaseLabel}</Text>
    </View>
  );
}

export function ConfirmationPrompt({ onConfirm }: ConfirmationPromptProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Does this still feel accurate?</Text>
      <Text style={styles.cardBody}>
        You do not need to track the flight. This only helps Next Seat keep the
        guidance comfortable.
      </Text>

      <View style={styles.promptActions}>
        <Pressable style={styles.promptButton} onPress={() => onConfirm?.("yes")}>
          <Text style={styles.promptButtonText}>Yes</Text>
        </Pressable>
        <Pressable
          style={styles.promptButton}
          onPress={() => onConfirm?.("not_sure")}
        >
          <Text style={styles.promptButtonText}>Not sure</Text>
        </Pressable>
        <Pressable
          style={styles.promptButton}
          onPress={() => onConfirm?.("changed")}
        >
          <Text style={styles.promptButtonText}>Something changed</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: "center",
    gap: spacing.md,
    paddingTop: spacing.xl,
    paddingBottom: spacing["2xl"]
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#DDF0FF"
  },
  heroTitle: {
    ...typography.title,
    color: colors.textPrimary,
    textAlign: "center"
  },
  heroBody: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center"
  },
  guidanceCopy: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: "center"
  },
  phasePill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.white
  },
  phasePillText: {
    ...typography.caption,
    color: colors.primaryBlue,
    fontWeight: "700"
  },
  card: {
    gap: spacing.md,
    padding: spacing.xl,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: "rgba(13, 59, 140, 0.10)",
    backgroundColor: "rgba(255, 255, 255, 0.72)"
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  nextIcon: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#DDF4E8"
  },
  cardLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: "700"
  },
  cardTitle: {
    ...typography.section,
    color: colors.textPrimary
  },
  cardBody: {
    ...typography.body,
    color: colors.textSecondary
  },
  progressTrack: {
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: "#DCEAF7",
    overflow: "hidden"
  },
  progressFill: {
    height: "100%",
    borderRadius: radius.pill,
    backgroundColor: colors.primaryBlue
  },
  badge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: "#EEF9F3"
  },
  badgeText: {
    ...typography.caption,
    color: "#2F8066",
    fontWeight: "700"
  },
  noticeBox: {
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: "#EEF9F3"
  },
  noticeTitle: {
    ...typography.caption,
    color: "#2F8066",
    fontWeight: "700"
  },
  noticeText: {
    ...typography.body,
    color: colors.textPrimary
  },
  normalText: {
    ...typography.body,
    color: "#2F8066",
    fontWeight: "700"
  },
  detailLine: {
    ...typography.body,
    color: colors.textPrimary
  },
  checkList: {
    gap: spacing.sm
  },
  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  checkText: {
    ...typography.body,
    color: colors.textPrimary
  },
  promptActions: {
    gap: spacing.sm
  },
  promptButton: {
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.cruiseBlue
  },
  promptButtonText: {
    ...typography.body,
    color: colors.primaryBlue,
    fontWeight: "700"
  },
  pressed: {
    opacity: 0.86,
    transform: [{ scale: 0.995 }]
  },
  chevron: {
    position: "absolute",
    right: spacing.xl,
    bottom: spacing.lg,
    color: colors.primaryBlue,
    fontSize: 32
  }
});