import { useState } from "react";

import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, spacing, typography } from "@/theme";

import { formatMinutes } from "@/features/time/formatMinutes";

import { NextExpectedMoment } from "@/types/nextExpectedMoment";

type Props = {
  moment: NextExpectedMoment;
  emphasized?: boolean;
};

export function NextExpectedMomentCard({ moment, emphasized = false }: Props) {
  const [expanded, setExpanded] = useState(emphasized);

  const minutesUntil = moment.timingEstimate?.minutesUntil;
  const timingLabel = moment.timingEstimate?.label;

  return (
    <View style={[styles.card, emphasized && styles.emphasizedCard]}>
      <Pressable
        onPress={() => setExpanded((value) => !value)}
        style={styles.header}
      >
        <View style={styles.headerText}>
          <Text style={styles.label}>Next expected moment</Text>

          <Text style={[styles.title, emphasized && styles.emphasizedTitle]}>
            {moment.title}
          </Text>
        </View>

        <Text style={styles.expandIcon}>{expanded ? "−" : "+"}</Text>
      </Pressable>

      {expanded ? (
        <View style={styles.content}>
          <Text style={styles.body}>{moment.body}</Text>

          {minutesUntil !== undefined ? (
            <Text style={styles.time}>
              In about {formatMinutes(minutesUntil)}
            </Text>
          ) : timingLabel ? (
            <Text style={styles.time}>{timingLabel}</Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
    padding: spacing.xl,
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border
  },
  emphasizedCard: {
    padding: spacing["2xl"],
    borderColor: colors.primaryBlue
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md
  },
  headerText: {
    flex: 1,
    gap: spacing.sm
  },
  label: {
    ...typography.eyebrow,
    color: colors.textSecondary
  },
  title: {
    ...typography.section,
    color: colors.textPrimary
  },
  emphasizedTitle: {
    ...typography.title
  },
  expandIcon: {
    color: colors.primaryBlue,
    fontSize: 26,
    lineHeight: 28
  },
  content: {
    gap: spacing.sm
  },
  body: {
    ...typography.body,
    color: colors.textSecondary
  },
  time: {
    ...typography.caption,
    color: colors.primaryBlue,
    fontWeight: "700"
  }
});