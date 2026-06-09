import { Stack } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const learningTopics = [
  {
    title: "Sounds and movement",
    body: "Short explanations for normal changes in engine sound, turns, and small adjustments."
  },
  {
    title: "Takeoff and climb",
    body: "What passengers may feel during the more active first part of the journey."
  },
  {
    title: "Arrival and descent",
    body: "Why the final part of the flight can feel busier without meaning something is wrong."
  }
];

export default function LearnMoreScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ title: "Learn More" }} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Optional context</Text>
          <Text style={styles.title}>Learn more without leaving calm mode</Text>
          <Text style={styles.body}>
            This section is separate from Flight Mode on purpose. It gives extra context only when the passenger asks for it.
          </Text>
        </View>

        {learningTopics.map((topic) => (
          <View key={topic.title} style={styles.card}>
            <Text style={styles.cardTitle}>{topic.title}</Text>
            <Text style={styles.cardBody}>{topic.body}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F6F7F9"
  },
  content: {
    gap: 14,
    padding: 20
  },
  header: {
    gap: 8,
    paddingBottom: 8
  },
  eyebrow: {
    color: "#7A8A96",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase"
  },
  title: {
    color: "#102331",
    fontSize: 28,
    fontWeight: "800",
    lineHeight: 34
  },
  body: {
    color: "#5A6673",
    fontSize: 16,
    lineHeight: 24
  },
  card: {
    gap: 8,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderColor: "#DDE5EA",
    borderWidth: 1,
    padding: 16
  },
  cardTitle: {
    color: "#102331",
    fontSize: 18,
    fontWeight: "800"
  },
  cardBody: {
    color: "#5A6673",
    fontSize: 15,
    lineHeight: 22
  }
});
