import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing, typography } from "@/theme";
import type { FlightSummary } from "@/features/flightSnapshot/types";
import type {
  AirportInfo,
  ConfidenceLevel,
  CurrentMomentSummary,
  OfflineGuidanceStatus,
  PredictionMode,
  RoutePatternSummary
} from "@/features/flightSnapshot/uiSnapshot";
import type { NextExpectedMoment } from "@/types/nextExpectedMoment";

type IoniconName = ComponentProps<typeof Ionicons>["name"];

function isArrivedPhase(phaseLabel: string): boolean {
  return phaseLabel.toLowerCase().includes("arriv");
}

function getHeroIcon(phaseLabel: string): IoniconName {
  const normalized = phaseLabel.toLowerCase();
  if (normalized.includes("arriv")) return "checkmark";
  if (normalized.includes("takeoff") || normalized.includes("departure")) return "airplane";
  if (normalized.includes("cruise")) return "cloud-outline";
  if (normalized.includes("descent") || normalized.includes("approach")) return "navigate-outline";
  return "time-outline";
}

function getAirportIcon(title: string, info: AirportInfo): IoniconName {
  const key = `${title} ${info.primary}`.toLowerCase();
  if (key.includes("baggage") || key.includes("belt")) return "briefcase-outline";
  return "business-outline";
}

function getCurrentJourneyPercent(phaseLabel: string, progressPercent: number): number {
  const normalized = phaseLabel.toLowerCase();
  if (normalized.includes("arriv")) return 100;
  if (normalized.includes("pre")) return Math.max(Math.round(progressPercent), 6);
  if (normalized.includes("takeoff")) return Math.max(Math.round(progressPercent), 18);
  if (normalized.includes("cruise")) return Math.max(Math.round(progressPercent), 56);
  if (normalized.includes("descent") || normalized.includes("approach")) return Math.max(Math.round(progressPercent), 82);
  return Math.max(Math.round(progressPercent), 4);
}

function phaseBadgeIcon(phaseLabel: string): IoniconName {
  if (isArrivedPhase(phaseLabel)) return "checkmark-circle";
  const normalized = phaseLabel.toLowerCase();
  if (normalized.includes("pre")) return "time-outline";
  return "airplane";
}

export function GuidanceModeBadge({ confidenceLevel, predictionMode }: {
  confidenceLevel: ConfidenceLevel;
  predictionMode: PredictionMode;
}) {
  const label = predictionMode === "offline-estimated"
    ? "Ready offline"
    : predictionMode === "user-adjusted"
      ? "Adjusted calmly"
      : confidenceLevel === "low"
        ? "General guidance"
        : "Looks normal";

  return (
    <View style={styles.badge}>
      <Ionicons name="cloud-done-outline" size={16} color={colors.primaryBlue} />
      <Text style={styles.badgeText}>{label}</Text>
    </View>
  );
}

export function StatusHeroCard({ title, body, phaseLabel, guidanceCopy, onPress }: {
  title: string;
  body: string;
  phaseLabel: string;
  guidanceCopy: string;
  onPress?: () => void;
}) {
  const isSuccess = isArrivedPhase(phaseLabel);
  const content = (
    <>
      <View style={[styles.iconCircle, isSuccess && styles.iconCircleSuccess]}>
        <Ionicons
          name={getHeroIcon(phaseLabel)}
          size={34}
          color={isSuccess ? colors.white : colors.primaryBlue}
        />
      </View>
      <Text style={styles.heroTitle}>{title}</Text>
      <Text style={styles.heroBody}>{body}</Text>
      <View style={[styles.phasePill, isSuccess && styles.phasePillSuccess]}>
        <Ionicons
          name={phaseBadgeIcon(phaseLabel)}
          size={15}
          color={isSuccess ? colors.white : colors.skyBlueStrong}
        />
        <Text style={[styles.phasePillText, isSuccess && styles.phasePillTextSuccess]}>{phaseLabel}</Text>
      </View>
      <Text style={styles.guidanceCopy}>{guidanceCopy}</Text>
      {onPress ? <Text style={styles.tapHint}>Tap to see what is happening now</Text> : null}
    </>
  );

  if (!onPress) {
    return <View style={styles.hero}>{content}</View>;
  }

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.hero, pressed && styles.pressed]}
    >
      {content}
    </Pressable>
  );
}

export function JourneyProgress({ routeLabel, phaseLabel, progressPercent, onPress }: {
  routeLabel: string;
  phaseLabel: string;
  progressPercent: number;
  onPress?: () => void;
}) {
  const displayPercent = Math.min(Math.max(getCurrentJourneyPercent(phaseLabel, progressPercent), 0), 100);
  const planeLeft = Math.min(Math.max(displayPercent, 6), 94);
  const isSuccess = isArrivedPhase(phaseLabel);
  const progressColor = isSuccess ? colors.successGreen : colors.skyBlueStrong;
  const stepLabels = ["Pre-flight", "Takeoff", "Cruise", "Descent", "Arrival"];
  const content = (
    <>
      <View style={styles.journeyHeader}>
        <View style={styles.journeyTitleGroup}>
          <Text style={styles.cardLabel}>Current journey</Text>
          <Text style={styles.cardTitle}>{routeLabel}</Text>
          <View style={[styles.inlinePhasePill, isSuccess && styles.inlinePhasePillSuccess]}>
            <Ionicons name={phaseBadgeIcon(phaseLabel)} size={13} color={isSuccess ? colors.successGreen : colors.skyBlueStrong} />
            <Text style={[styles.inlinePhaseText, isSuccess && styles.inlinePhaseTextSuccess]}>{phaseLabel}</Text>
          </View>
        </View>
        <View style={styles.percentBox}>
          <Text style={[styles.percentText, { color: progressColor }]}>{displayPercent}%</Text>
          <Text style={styles.percentLabel}>of journey</Text>
        </View>
      </View>

      <View style={styles.visualTracker}>
        <View style={styles.routeTrack}>
          <View style={[styles.routeTrackFill, { width: `${displayPercent}%`, backgroundColor: progressColor }]} />
          {stepLabels.map((label, index) => {
            const left = `${(index / (stepLabels.length - 1)) * 100}%`;
            const isPast = (index / (stepLabels.length - 1)) * 100 <= displayPercent;
            return (
              <View
                key={label}
                style={[
                  styles.routeNode,
                  { left },
                  isPast && { borderColor: progressColor, backgroundColor: colors.white }
                ]}
              />
            );
          })}
          <View style={[styles.planeMarker, { left: `${planeLeft}%`, backgroundColor: progressColor }]}> 
            <Ionicons name="airplane" size={20} color={colors.white} />
          </View>
        </View>
        <View style={styles.stepLabelRow}>
          {stepLabels.map((label) => (
            <Text key={label} style={styles.stepLabel}>{label}</Text>
          ))}
        </View>
      </View>
    </>
  );

  if (!onPress) return <View style={styles.card}>{content}</View>;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, styles.pressableCard, pressed && styles.pressed]}>
      {content}
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

export function AirportInfoCard({ title, info }: { title: string; info?: AirportInfo }) {
  if (!info) return null;
  const isBaggage = `${title} ${info.primary}`.toLowerCase().includes("baggage") || info.primary.toLowerCase().includes("belt");
  return (
    <View style={styles.card}>
      <View style={styles.cardContentRow}>
        <View style={[styles.largeIconCircle, isBaggage && styles.largeIconCircleSuccess]}>
          <Ionicons
            name={getAirportIcon(title, info)}
            size={28}
            color={isBaggage ? colors.successGreen : colors.primaryBlue}
          />
        </View>
        <View style={styles.cardTextGroup}>
          <Text style={[styles.cardLabel, isBaggage && styles.successLabel]}>{title}</Text>
          <Text style={styles.cardTitle}>{info.primary}</Text>
          <Text style={styles.cardBody}>{info.disclaimer}</Text>
        </View>
        <Text style={[styles.rowChevron, isBaggage && styles.rowChevronSuccess]}>›</Text>
      </View>
    </View>
  );
}

export function CurrentMomentSummaryCard({ summary, onPress }: {
  summary?: CurrentMomentSummary;
  onPress?: () => void;
}) {
  if (!summary) return null;
  const content = (
    <View style={styles.cardContentRow}>
      <View style={styles.largeIconCircle}>
        <Ionicons name="radio-outline" size={28} color={colors.primaryBlue} />
      </View>
      <View style={styles.cardTextGroup}>
        <Text style={styles.cardLabel}>{summary.label}</Text>
        <Text style={styles.cardTitle}>{summary.title}</Text>
        <Text style={styles.cardBody}>{summary.body}</Text>
      </View>
      <Text style={styles.rowChevron}>›</Text>
    </View>
  );

  if (!onPress) return <View style={styles.card}>{content}</View>;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, styles.pressableCard, pressed && styles.pressed]}>
      {content}
    </Pressable>
  );
}

export function NextExpectedMomentCard({ moment, onPress, expanded = false }: {
  moment: NextExpectedMoment;
  onPress?: () => void;
  expanded?: boolean;
}) {
  const content = (
    <>
      <View style={styles.cardContentRow}>
        <View style={styles.nextIcon}><Ionicons name="time-outline" size={26} color={colors.primaryBlue} /></View>
        <View style={styles.cardTextGroup}>
          <Text style={styles.cardLabel}>Next expected moment</Text>
          <Text style={styles.cardTitle}>{moment.title}</Text>
          <Text style={styles.cardBody}>{moment.body}</Text>
        </View>
        {onPress ? <Text style={styles.rowChevron}>›</Text> : null}
      </View>
      {(expanded || moment.description) ? (
        <View style={styles.noticeBox}>
          <Text style={styles.noticeTitle}>What you may notice</Text>
          <Text style={styles.noticeText}>{moment.description}</Text>
          <Text style={styles.normalText}>This is a normal part of the journey.</Text>
        </View>
      ) : null}
    </>
  );

  if (!onPress) return <View style={styles.card}>{content}</View>;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, styles.pressableCard, pressed && styles.pressed]}>
      {content}
    </Pressable>
  );
}

export function OfflineReadyCard({ status, compact = false }: {
  status: OfflineGuidanceStatus;
  compact?: boolean;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardContentRow}>
        <View style={styles.largeIconCircle}>
          <Ionicons name="cloud-done-outline" size={28} color={colors.primaryBlue} />
        </View>
        <View style={styles.cardTextGroup}>
          <Text style={styles.cardLabel}>Next Seat is ready to guide you offline</Text>
          {!compact ? <Text style={styles.cardBody}>The app has saved the calm guidance it needs for this flight.</Text> : null}
          <View style={styles.checkList}>
            {status.items.map((item) => (
              <View key={item.label} style={styles.checkRow}>
                <Ionicons name={item.isReady ? "checkmark-circle" : "ellipse-outline"} size={18} color={item.isReady ? colors.successGreen : colors.textSecondary} />
                <Text style={styles.checkText}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
      <View pointerEvents="none" style={styles.mountainVignette}>
        <View style={styles.mountainBack} />
        <View style={styles.mountainFront} />
        <View style={styles.cloudDotOne} />
        <View style={styles.cloudDotTwo} />
      </View>
    </View>
  );
}

export function RoutePatternCard({ summary }: { summary?: RoutePatternSummary }) {
  if (!summary) return null;
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{summary.title}</Text>
      <Text style={styles.cardBody}>{summary.body}</Text>
      {summary.scheduledDurationLabel ? <Text style={styles.detailLine}>Scheduled duration: {summary.scheduledDurationLabel}</Text> : null}
      {summary.updatedDurationLabel ? <Text style={styles.detailLine}>Updated duration: {summary.updatedDurationLabel}</Text> : null}
      <Text style={styles.normalText}>{summary.reassurance}</Text>
    </View>
  );
}

function normalizeProviderStatus(value?: string): string | undefined {
  if (!value) return undefined;
  return value.replace(/_/g, " ").replace(/^\w/, (first) => first.toUpperCase());
}

export function FlightDetailsCard({ summary, phaseLabel }: {
  summary: FlightSummary;
  phaseLabel: string;
}) {
  const providerStatus = normalizeProviderStatus(summary.providerStatus);
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Current flight</Text>
      <Text style={styles.detailLine}>{summary.routeLabel}</Text>
      <Text style={styles.cardBody}>{summary.airline} · {summary.flightNumber}</Text>
      <View style={styles.detailsGrid}>
        <Text style={styles.detailLine}>Current stage: {phaseLabel}</Text>
        {providerStatus ? <Text style={styles.detailLine}>Saved status: {providerStatus}</Text> : null}
        <Text style={styles.detailLine}>Departure: {summary.revisedDepartureLabel ?? summary.scheduledDepartureLabel}</Text>
        <Text style={styles.detailLine}>Arrival: {summary.revisedArrivalLabel ?? summary.scheduledArrivalLabel}</Text>
        {summary.aircraftLabel ? <Text style={styles.detailLine}>Aircraft: {summary.aircraftLabel}</Text> : null}
      </View>
      <Text style={styles.cardBody}>{summary.timeDisplayNote}</Text>
    </View>
  );
}

export function EndJourneyButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.endButton, pressed && styles.pressed]}>
      <Ionicons name="checkmark-circle" size={22} color={colors.white} />
      <Text style={styles.endButtonText}>End journey</Text>
    </Pressable>
  );
}

export function ConfirmationPrompt({ onConfirm }: {
  onConfirm?: (answer: "yes" | "not_sure" | "changed") => void;
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Does this still feel accurate?</Text>
      <Text style={styles.cardBody}>You do not need to track the flight. This only helps Next Seat keep the guidance comfortable.</Text>
      {(["yes", "not_sure", "changed"] as const).map((answer) => (
        <Pressable key={answer} style={styles.promptButton} onPress={() => onConfirm?.(answer)}>
          <Text style={styles.promptButtonText}>{answer === "yes" ? "Yes" : answer === "not_sure" ? "Not sure" : "Something changed"}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: "center",
    gap: spacing.md,
    paddingTop: spacing["3xl"],
    paddingBottom: spacing.xl
  },
  iconCircle: {
    width: 78,
    height: 78,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 9,
    borderColor: "rgba(255, 255, 255, 0.82)",
    backgroundColor: "#DDF0FF",
    shadowColor: colors.primaryBlue,
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5
  },
  iconCircleSuccess: {
    backgroundColor: colors.successGreen,
    borderColor: "rgba(255, 255, 255, 0.84)",
    shadowColor: colors.successGreen,
    shadowOpacity: 0.26
  },
  heroTitle: { ...typography.title, color: colors.textPrimary, textAlign: "center" },
  heroBody: { ...typography.body, color: colors.textPrimary, textAlign: "center", maxWidth: 330 },
  guidanceCopy: { ...typography.caption, color: colors.textPrimary, textAlign: "center", maxWidth: 330 },
  tapHint: { ...typography.caption, color: colors.primaryBlue, fontWeight: "700", textAlign: "center" },
  phasePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: "rgba(18, 102, 227, 0.16)",
    shadowColor: colors.primaryBlue,
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2
  },
  phasePillSuccess: { backgroundColor: colors.successGreen, borderColor: colors.successGreen },
  phasePillText: { ...typography.caption, color: colors.skyBlueStrong, fontWeight: "800" },
  phasePillTextSuccess: { color: colors.white },
  card: {
    gap: spacing.md,
    padding: spacing.xl,
    borderRadius: radius.xl,
    borderWidth: 1.2,
    borderColor: "rgba(13, 59, 140, 0.18)",
    backgroundColor: "rgba(255, 255, 255, 0.94)",
    shadowColor: colors.primaryBlue,
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
    overflow: "hidden"
  },
  pressableCard: { minHeight: 88 },
  cardContentRow: { flexDirection: "row", alignItems: "center", gap: spacing.lg },
  cardTextGroup: { flex: 1, gap: spacing.xs },
  journeyHeader: { flexDirection: "row", justifyContent: "space-between", gap: spacing.lg },
  journeyTitleGroup: { flex: 1, gap: spacing.xs },
  largeIconCircle: {
    width: 62,
    height: 62,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF3FF"
  },
  largeIconCircleSuccess: { backgroundColor: colors.successSoft },
  nextIcon: {
    width: 62,
    height: 62,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF3FF"
  },
  cardLabel: { ...typography.eyebrow, color: colors.primaryBlue, fontWeight: "800" },
  successLabel: { color: colors.successGreen },
  cardTitle: { ...typography.section, color: colors.textPrimary },
  cardBody: { ...typography.caption, color: colors.textPrimary },
  detailsGrid: { gap: spacing.xs },
  detailLine: { ...typography.body, color: colors.textPrimary },
  rowChevron: { color: colors.primaryBlue, fontSize: 34, lineHeight: 38, fontWeight: "600" },
  rowChevronSuccess: { color: colors.successGreen },
  chevron: { position: "absolute", right: spacing.xl, bottom: spacing.lg, color: colors.primaryBlue, fontSize: 32 },
  inlinePhasePill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
    backgroundColor: "#EAF3FF"
  },
  inlinePhasePillSuccess: { backgroundColor: colors.successSoft },
  inlinePhaseText: { ...typography.caption, color: colors.skyBlueStrong, fontWeight: "800", fontSize: 13, lineHeight: 18 },
  inlinePhaseTextSuccess: { color: colors.successGreen },
  percentBox: { alignItems: "flex-end", justifyContent: "center" },
  percentText: { ...typography.hero, fontSize: 32, lineHeight: 36 },
  percentLabel: { ...typography.caption, color: colors.textPrimary, fontSize: 12, lineHeight: 16 },
  visualTracker: { gap: spacing.sm, marginTop: spacing.md },
  routeTrack: {
    height: 34,
    justifyContent: "center",
    position: "relative",
    marginHorizontal: 4
  },
  routeTrackFill: {
    position: "absolute",
    left: 0,
    height: 3,
    borderRadius: radius.pill
  },
  routeNode: {
    position: "absolute",
    top: 12,
    width: 10,
    height: 10,
    marginLeft: -5,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: "#B9C9DC",
    backgroundColor: colors.white
  },
  planeMarker: {
    position: "absolute",
    top: 2,
    width: 30,
    height: 30,
    marginLeft: -15,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.primaryBlue,
    shadowOpacity: 0.24,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4
  },
  stepLabelRow: { flexDirection: "row", justifyContent: "space-between", gap: spacing.xs },
  stepLabel: { ...typography.caption, color: colors.textPrimary, fontSize: 11, lineHeight: 14, textAlign: "center", flex: 1 },
  badge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: "rgba(255, 255, 255, 0.88)",
    borderWidth: 1,
    borderColor: "rgba(13, 59, 140, 0.10)",
    shadowColor: colors.primaryBlue,
    shadowOpacity: 0.08,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2
  },
  badgeText: { ...typography.caption, color: colors.primaryBlue, fontWeight: "800" },
  noticeBox: { gap: spacing.sm, padding: spacing.lg, borderRadius: radius.lg, backgroundColor: "#EEF9F3" },
  noticeTitle: { ...typography.caption, color: colors.successGreen, fontWeight: "700" },
  noticeText: { ...typography.body, color: colors.textPrimary },
  normalText: { ...typography.body, color: colors.successGreen, fontWeight: "700" },
  checkList: { gap: spacing.xs, marginTop: spacing.xs },
  checkRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  checkText: { ...typography.caption, color: colors.textPrimary },
  mountainVignette: { position: "absolute", right: -4, bottom: -8, width: 150, height: 84, opacity: 0.72 },
  mountainBack: {
    position: "absolute",
    right: 18,
    bottom: 0,
    width: 74,
    height: 74,
    borderRadius: 14,
    backgroundColor: "#DCEBFF",
    transform: [{ rotate: "45deg" }]
  },
  mountainFront: {
    position: "absolute",
    right: 54,
    bottom: -8,
    width: 72,
    height: 72,
    borderRadius: 14,
    backgroundColor: "#BFD9F8",
    transform: [{ rotate: "45deg" }]
  },
  cloudDotOne: { position: "absolute", right: 24, top: 12, width: 48, height: 20, borderRadius: radius.pill, backgroundColor: "rgba(191, 217, 248, 0.72)" },
  cloudDotTwo: { position: "absolute", right: 84, top: 30, width: 38, height: 16, borderRadius: radius.pill, backgroundColor: "rgba(221, 235, 255, 0.9)" },
  promptButton: { minHeight: 44, justifyContent: "center", paddingHorizontal: spacing.lg, borderRadius: radius.lg, backgroundColor: colors.cruiseBlue },
  promptButtonText: { ...typography.body, color: colors.primaryBlue, fontWeight: "700" },
  endButton: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: colors.successGreen,
    shadowColor: colors.successGreen,
    shadowOpacity: 0.28,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4
  },
  endButtonText: { ...typography.body, color: colors.white, fontWeight: "800" },
  pressed: { opacity: 0.88, transform: [{ scale: 0.995 }] }
});