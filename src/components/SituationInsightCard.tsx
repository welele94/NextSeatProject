import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type SituationInsightCardProps = {
  title: string;
  body: string;
  label?: string;
  initiallyExpanded?: boolean;
};



export function SituationInsightCard({
  title,
  body,
  label = "Why is this happening?",
  initiallyExpanded = false
}: SituationInsightCardProps) {
  const [isExpanded, setIsExpanded] = useState(initiallyExpanded);
  return (
    <View style={styles.card}>
      <Pressable 
        onPress={() => setIsExpanded((current) => !current)}
        style={styles.header}
        accessibilityRole="button"
        accessibilityLabel={`${label}. Tap to ${isExpanded ? "collapse" : "expand"}`}
      >
        <View style={styles.headerText}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.title}>{title}</Text>
        </View>

        <Text style={styles.expandIcon}>
          {isExpanded ? "-" : "+"}
        </Text>
      </Pressable>

      {isExpanded? (
        <Text style={styles.body}>{body}</Text>
      ) : (
        <Text style={styles.preview} numberOfLines={2}>
          {body}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 12,
    padding: 18,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.78)",
    borderWidth: 1,
    borderColor: "rgba(210, 222, 230, 0.72)"
  },

  header: {
    flexDirection: "row",
    alignItems: "flex-start", 
    justifyContent: "space-between",
    gap: 16
  },
  headerText: {
    flex: 1,
    gap: 6
  },

  label: {
    color: "#7A8A96",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase"
  },
  content: {
    gap: 8
  },

  expandIcon: {
    color: "#2e7d7b",
    fontSize: 24,
    fontWeight: "500",
    lineHeight: 26
  },

  title: {
    color: "#102331",
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 24
  },
  body: {
    color: "#4D5F6B",
    fontSize: 15,
    lineHeight: 24
  },
  preview: {
    color: "#6b7b86",
    fontSize: 15,
    lineHeight: 23
  }
});
