import { StyleSheet, Text, View } from "react-native";

type SituationInsightCardProps = {
  title: string;
  body: string;
  label?: string;
};

export function SituationInsightCard({
  title,
  body,
  label = "Current situation"
}: SituationInsightCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>

      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.body}>{body}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 14,
    padding: 20,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.035)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.14)"
  },
  label: {
    color: "#8FA1AD",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase"
  },
  content: {
    gap: 8
  },
  title: {
    color: "#F4FAFC",
    fontSize: 18,
    fontWeight: "700"
  },
  body: {
    color: "#B7C4CB",
    fontSize: 15,
    lineHeight: 23
  }
});