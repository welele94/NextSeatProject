import { StyleSheet, View } from "react-native";

type AmbientGlobeProps = {
  progressPercent: number;
};

export function AmbientGlobe({ progressPercent }: AmbientGlobeProps) {
  const safeProgress = Math.min(Math.max(progressPercent, 0), 100);

  return (
    <View style={styles.wrapper}>
      <View style={styles.glow} />
      <View style={styles.globe}>
        <View style={styles.innerGlow} />
        <View style={styles.routeLine}>
          <View style={[styles.routeProgress, { width: `${safeProgress}%` }]} />
        </View>
        <View style={[styles.positionDot, { left: `${safeProgress}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    height: 210,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden"
  },
  glow: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "#DDEFF3",
    opacity: 0.72
  },
  globe: {
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: "#EAF4F7",
    borderWidth: 1,
    borderColor: "#CFE0E7",
    justifyContent: "center",
    alignItems: "center",
    transform: [{ translateY: 44 }]
  },
  innerGlow: {
    position: "absolute",
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: "#FFFFFF",
    opacity: 0.42
  },
  routeLine: {
    width: 168,
    height: 3,
    borderRadius: 99,
    backgroundColor: "#B8CCD4",
    overflow: "hidden"
  },
  routeProgress: {
    height: "100%",
    borderRadius: 99,
    backgroundColor: "#2E7D7B"
  },
  positionDot: {
    position: "absolute",
    top: 121,
    width: 10,
    height: 10,
    marginLeft: -5,
    borderRadius: 5,
    backgroundColor: "#2E7D7B",
    borderWidth: 2,
    borderColor: "#FFFFFF"
  }
});
