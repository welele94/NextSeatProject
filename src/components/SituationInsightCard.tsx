import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  title: string;
  body: string;
  label?: string;
};

export function SituationInsightCard({
  title,
  body,
  label = "Why is this happening?"
}: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.card}>
      <Pressable
        onPress={() => setExpanded((value) => !value)}
        style={styles.header}
      >
        <View style={styles.headerText}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.title}>{title}</Text>
        </View>

        <Text style={styles.expandIcon}>{expanded ? "−" : "+"}</Text>
      </Pressable>

      {expanded ? (
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
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.76)",
    borderWidth: 1,
    borderColor: "#E5EAF0"
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 14
  },
  headerText: {
    flex: 1,
    gap: 6
  },
  label: {
    color: "#64748B",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase"
  },
  title: {
    color: "#16213E",
    fontSize: 17,
    fontWeight: "700",
    lineHeight: 23
  },
  expandIcon: {
    color: "#0D3B8C",
    fontSize: 24,
    lineHeight: 26
  },
  body: {
    color: "#64748B",
    fontSize: 15,
    lineHeight: 24
  },
  preview: {
    color: "#64748B",
    fontSize: 15,
    lineHeight: 23
  }
});