import { Stack } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const settingsPlaceholders = [
  "Language preferences",
  "Offline flight packs",
  "Accessibility and comfort settings"
];

export default function SettingsScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ title: "Settings" }} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Utility</Text>
          <Text style={styles.title}>Settings stay outside the flight flow</Text>
          <Text style={styles.body}>
            This section is reserved for preferences and offline controls. It should not compete with Flight Mode during the journey.
          </Text>
        </View>

        {settingsPlaceholders.map((item) => (
          <View key={item} style={styles.row}>
            <Text style={styles.rowTitle}>{item}</Text>
            <Text style={styles.rowMeta}>Planned</Text>
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
  row: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderColor: "#DDE5EA",
    borderWidth: 1,
    padding: 16
  },
  rowTitle: {
    color: "#102331",
    fontSize: 16,
    fontWeight: "700"
  },
  rowMeta: {
    color: "#7A8A96",
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase"
  }
});
