import { StyleSheet, View } from "react-native";

type ProgressBarProps = {
  value: number;
};

export function ProgressBar({ value }: ProgressBarProps) {
  const normalizedValue = Math.min(Math.max(value, 0), 100);

  return (
    <View style={styles.track} accessibilityRole="progressbar">
      <View style={[styles.fill, { width: `${normalizedValue}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 10,
    overflow: "hidden",
    borderRadius: 5,
    backgroundColor: "#DDE5ED"
  },
  fill: {
    height: "100%",
    borderRadius: 5,
    backgroundColor: "#247A7B"
  }
});
