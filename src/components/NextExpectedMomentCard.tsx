import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { formatMinutes } from "@/features/time/formatMinutes";
import { NextExpectedMoment } from "@/types/nextExpectedMoment";

type NextExpectedMomentCardProps = {
    moment: NextExpectedMoment;
    initiallyExpanded?: boolean;
};

export function NextExpectedMomentCard({
    moment,
    initiallyExpanded = true
}: NextExpectedMomentCardProps){
    const [isExpanded, setIsExpanded] = useState(initiallyExpanded);
    return (
        <View style={styles.card}>
            <Pressable 
                onPress={() = setIsExpanded((current) => !current)}
                style={styles.header}
                accessibilityRole="button"
                accessibilityLabel={`Next expected moment. Tap to ${isExpanded ? "collapse" : "expand"}`}>
                    <View style={styles.headerText}>
                        <Text style={styles.label}>Next expected moment</Text>
                        <Text style={styles.title}>{moment.title}</Text>
                    </View>

                    <Text style={styles.expandIcon}>
                        {isExpanded ? "-" : "+"}
                    </Text>

            </Pressable>

            {isExpaded ? (
                <>
                    <Text style={styles.body}>{moment.body}</Text>
                    {moment.minutesUntil !== undefined ? (
                        <Text style={styles.time}>
                            In about {formatMinutes(moment.minutesUntil)}
                        </Text>
                    ) : null}
                </>
            ) : null}

        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        gap: 12,
        padding: 20,
        borderRadius: 20,
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#DDE8EC"
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
        color: "#667584",
        fontSize: 20,
        fontWeight: "800",
        lineHeight: 26
    },

    title: {
        color: "#102331",
        fontSize: 20,
        fontWeight: "800",
        lineHeight: 26
    },

    expandIcon: {
        color: "#2E7D7B",
        fontSize: 24,
        fontWeight: "500",
        lineHeight: 26
    },

    body: {
        color:"#3D4C5C",
        fontSize:16, 
        lineHeight: 25
    },
    time: {
        marginTop:2,
        color: "#237a7B",
        fontSize: 14,
        fontWeight: "800"
    }
});