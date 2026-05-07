import { StyleSheet, Text, View } from "react-native";

type SituationInsightCardProps = {
  title: string;
  body: string;
};

export function SituationInsightCard({
  title,
  body
}: SituationInsightCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>Current situation</Text>

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
    padding: 18,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8EF"
  },
  label: {
    color: "#5A6673",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase"
  },
  content: {
    gap: 6
  },
  title: {
    color: "#102331",
    fontSize: 18,
    fontWeight: "700"
  },
  body: {
    color: "#4C5B68",
    fontSize: 15,
    lineHeight: 22
  }
});
