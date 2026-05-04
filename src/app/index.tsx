import { Link } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { FlightOverviewCard } from "@/components/FlightOverviewCard";
import { mockFlights } from "@/data/mockFlights";

export default function HomeScreen() {
  const flight = mockFlights[0];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.appName}>Next Seat</Text>
          <Text style={styles.subtitle}>Offline flight companion</Text>
        </View>

        <FlightOverviewCard flight={flight} />

        <Link
          asChild
          href={{
            pathname: "/flight/[id]",
            params: { id: flight.id }
          }}
        >
          <Pressable style={styles.button}>
            <Text style={styles.buttonText}>Open mocked flight</Text>
          </Pressable>
        </Link>
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
    gap: 18,
    padding: 20
  },
  header: {
    gap: 4,
    paddingTop: 8
  },
  appName: {
    color: "#102331",
    fontSize: 34,
    fontWeight: "800"
  },
  subtitle: {
    color: "#5A6673",
    fontSize: 16
  },
  button: {
    alignItems: "center",
    justifyContent: "center",
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
