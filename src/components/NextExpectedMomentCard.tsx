import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { formatMinutes } from "@/features/time/formatMinutes";
import { NextExpectedMoment } from "@/types/nextExpectedMoment";

type Props = {
  moment: NextExpectedMoment;
  emphasized?: boolean;
};

export function NextExpectedMomentCard({ moment, emphasized = false }: Props) {
  const [expanded, setExpanded] = useState(emphasized);

  return (
    <View style={[styles.card, emphasized && styles.emphasizedCard]}>
      <Pressable
        onPress={() => setExpanded((value) => !value)}
        style={styles.header}
      >
        <View style={styles.headerText}>
          <Text style={styles.label}>Next expected moment</Text>
          <Text style={[styles.title, emphasized && styles.emphasizedTitle]}>
            {moment.title}
          </Text>
        </View>

        <Text style={styles.expandIcon}>{expanded ? "−" : "+"}</Text>
      </Pressable>

      {expanded ? (
        <View style={styles.content}>
          <Text style={styles.body}>{moment.body}</Text>

          {moment.minutesUntil !== undefined ? (
            <Text style={styles.time}>
              In about {formatMinutes(moment.minutesUntil)}
            </Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 14,
    padding: 18,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5EAF0"
  },
  emphasizedCard: {
    padding: 22,
    borderColor: "#CFE0E7"
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
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 24
  },
  emphasizedTitle: {
    fontSize: 21,
    lineHeight: 28
  },
  expandIcon: {
    color: "#0D3B8C",
    fontSize: 24,
    lineHeight: 26
  },
  content: {
    gap: 10
  },
  body: {
    color: "#64748B",
    fontSize: 15,
    lineHeight: 24
  },
  time: {
    color: "#0D3B8C",
    fontSize: 14,
    fontWeight: "800"
  }
});