import { StyleSheet, Text, View } from "react-native";

import { Flight } from "@/types/flight";

type FlightOverviewCardProps = {
  flight: Flight;
};

export function FlightOverviewCard({ flight }: FlightOverviewCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.label}>{flight.airline}</Text>
          <Text style={styles.title}>{flight.flightNumber}</Text>
        </View>
        <Text style={styles.aircraft}>{flight.aircraftType}</Text>
      </View>

      <View style={styles.routeRow}>
        <View style={styles.airport}>
          <Text style={styles.code}>{flight.origin.code}</Text>
          <Text style={styles.city}>{flight.origin.city}</Text>
        </View>
        <View style={styles.routeLine} />
        <View style={[styles.airport, styles.destination]}>
          <Text style={styles.code}>{flight.destination.code}</Text>
          <Text style={styles.city}>{flight.destination.city}</Text>
        </View>
      </View>

      <View style={styles.metaRow}>
        <Text style={styles.metaText}>
          {flight.schedule.estimatedDurationMinutes} min
        </Text>
        <Text style={styles.metaText}>{flight.routeDistanceKm} km</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 18,
    padding: 18,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8EF"
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12
  },
  label: {
    color: "#5A6673",
    fontSize: 13
  },
  title: {
    marginTop: 4,
    color: "#102331",
    fontSize: 28,
    fontWeight: "700"
  },
  aircraft: {
    flexShrink: 1,
    alignSelf: "flex-start",
    color: "#2E5961",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "right"
  },
  routeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  airport: {
    width: 82
  },
  destination: {
    alignItems: "flex-end"
  },
  code: {
    color: "#102331",
    fontSize: 26,
    fontWeight: "700"
  },
  city: {
    marginTop: 2,
    color: "#5A6673",
    fontSize: 13
  },
  routeLine: {
    flex: 1,
    height: 2,
    backgroundColor: "#9DB2C3"
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  metaText: {
    color: "#40515F",
    fontSize: 14,
    fontWeight: "600"
  }
});
