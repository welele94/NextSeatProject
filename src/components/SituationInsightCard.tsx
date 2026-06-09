import { StyleSheet, Text, View } from "react-native";

type SituationInsightCardProps = {
  title: string;
  body: string;
  label?: string;
};

function getDisplayContent(title: string, body: string) {
  if (title === "Journey progress") {
    return {
      title: "Current situation",
      body: body.replace(
        "remaining in the scheduled journey.",
        "left in this part of the journey. The flight is continuing steadily."
      )
    };
  }

  return { title, body };
}

export function SituationInsightCard({
  title,
  body,
  label = "Current situation"
}: SituationInsightCardProps) {
  const displayContent = getDisplayContent(title, body);

  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>

      <View style={styles.content}>
        <Text style={styles.title}>{displayContent.title}</Text>
        <Text style={styles.body}>{displayContent.body}</Text>
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
