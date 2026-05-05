import { StyleSheet, Text, View } from "react-native";

import { ProgressBar } from "@/components/ProgressBar";
import { formatMinutes } from "@/features/time/formatMinutes";

type FlightProgressCardProps = {
  progressPercent: number;
  elapsedMinutes: number;
  remainingMinutes: number;
};

export function FlightProgressCard({
  progressPercent,
  elapsedMinutes,
  remainingMinutes
}: FlightProgressCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Flight progress</Text>
        <Text style={styles.percent}>{Math.round(progressPercent)}%</Text>
      </View>

      <ProgressBar value={progressPercent} />

      <View style={styles.stats}>
        <View>
          <Text style={styles.statLabel}>Elapsed</Text>
          <Text style={styles.statValue}>{formatMinutes(elapsedMinutes)}</Text>
        </View>
        <View style={styles.statEnd}>
          <Text style={styles.statLabel}>Remaining</Text>
          <Text style={styles.statValue}>
            {formatMinutes(remainingMinutes)}

          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 14,
    padding: 18,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8EF"
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12
  },
  title: {
    color: "#102331",
    fontSize: 17,
    fontWeight: "700"
  },
  percent: {
    color: "#247A7B",
    fontSize: 22,
    fontWeight: "800"
  },
  stats: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  statEnd: {
    alignItems: "flex-end"
  },
  statLabel: {
    color: "#667584",
    fontSize: 12
  },
  statValue: {
    marginTop: 3,
    color: "#102331",
    fontSize: 15,
    fontWeight: "700"
  }
});
