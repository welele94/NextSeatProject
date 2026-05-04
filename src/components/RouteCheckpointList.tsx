import { StyleSheet, Text, View } from "react-native";

import { RouteCheckpoint } from "@/types/route";

type RouteCheckpointListProps = {
  currentCheckpoint?: RouteCheckpoint;
  nextCheckpoint?: RouteCheckpoint;
};

export function RouteCheckpointList({
  currentCheckpoint,
  nextCheckpoint
}: RouteCheckpointListProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Route checkpoints</Text>

      <View style={styles.row}>
        <Text style={styles.label}>Current</Text>
        <Text style={styles.value}>
          {currentCheckpoint
            ? `${currentCheckpoint.label} (${currentCheckpoint.expectedProgressPercent}%)`
            : "No checkpoint reached yet"}
        </Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.row}>
        <Text style={styles.label}>Next</Text>
        <Text style={styles.value}>
          {nextCheckpoint
            ? `${nextCheckpoint.label} (${nextCheckpoint.expectedProgressPercent}%)`
            : "Final route segment"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 12,
    padding: 18,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8EF"
  },
  title: {
    color: "#102331",
    fontSize: 17,
    fontWeight: "700"
  },
  row: {
    gap: 4
  },
  label: {
    color: "#667584",
    fontSize: 12,
    fontWeight: "600"
  },
  value: {
    color: "#102331",
    fontSize: 15,
    fontWeight: "600"
  },
  divider: {
    height: 1,
    backgroundColor: "#E7EDF2"
  }
});
