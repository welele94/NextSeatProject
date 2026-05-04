import { StyleSheet, Text, View } from "react-native";

type ReassuranceCardProps = {
  title: string;
  body: string;
};

export function ReassuranceCard({ title, body }: ReassuranceCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 8,
    padding: 18,
    borderRadius: 8,
    backgroundColor: "#EDF7F4",
    borderWidth: 1,
    borderColor: "#C7E5DC"
  },
  title: {
    color: "#12362F",
    fontSize: 17,
    fontWeight: "700"
  },
  body: {
    color: "#2C4C45",
    fontSize: 15,
    lineHeight: 22
  }
});
