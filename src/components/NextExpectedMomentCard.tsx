import { StyleSheet, Text, View } from "react-native";

import { formatMinutes } from "@/features/time/formatMinutes";
import { NextExpectedMoment } from "@/types/nextExpectedMoment";

type NextExpectedMomentCardProps = {
    moment: NextExpectedMoment;
};

export function NextExpectedMomentCard({
    moment
}: NextExpectedMomentCardProps){
    return (
        <View style={styles.card}>
           <Text style={styles.label}>Next expected moment</Text> 
           <Text style={styles.title}>{moment.title}</Text>
           <Text style={styles.body}>{moment.body}</Text>

           {moment.minutesUntil !== undefined ? (
            <Text style={styles.time}>
                In about {formatMinutes(moment.minutesUntil)}
            </Text>
           ) : null}
        </View>
    )
}

const styles = StyleSheet.create({
    card: {
        gap: 8,
        padding: 18,
        borderRadius: 8,
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#E2E8EF"
    },
    label: {
        color: "#667584",
        fontSize: 12,
        fontWeight: "700",
        textTransform: "uppercase",
        letterSpacing: 0.6
    },
    title: {
        color: "#102331",
        fontSize: 17,
        fontWeight: "700"
    },
    body: {
        color:"#3D4C5C",
        fontSize:15, 
        lineHeight: 22
    },
    time: {
        marginTop:4,
        color: "#237a7B",
        fontSize: 14,
        fontWeight: "700"
    }
});