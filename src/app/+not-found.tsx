import { Link, Stack } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NotFoundScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ title: "Route not found" }} />
      <View style={styles.content}>
        <Text style={styles.eyebrow}>Navigation</Text>
        <Text style={styles.title}>This section is not available yet</Text>
        <Text style={styles.body}>
          Next Seat is keeping the MVP focused: Flight Mode, Learn More, and Settings.
        </Text>

        <Link asChild href="/">
          <Pressable style={styles.button}>
            <Text style={styles.buttonText}>Back to Flight List</Text>
          </Pressable>
        </Link>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F6F7F9"
  },
  content: {
    flex: 1,
    justifyContent: "center",
    gap: 12,
    padding: 24
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
  button: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
    minHeight: 52,
    borderRadius: 8,
    backgroundColor: "#102331"
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700"
  }
});
