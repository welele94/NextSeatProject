import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { GuidanceModeBadge } from "@/components/flight/Sprint10Cards";
import { buildFlightUiSnapshot } from "@/features/flightSnapshot/uiSnapshot";
import { useFlightSnapshot } from "@/features/flightSnapshot/useFlightSnapshot";
import { colors, radius, spacing, typography } from "@/theme";
import type { Coordinates } from "@/types/route";

type IoniconName = ComponentProps<typeof Ionicons>["name"];

type JourneyStage = {
  label: string;
  icon: IoniconName;
  threshold: number;
};

type ProjectedPoint = {
  x: number;
  y: number;
  visible: boolean;
};

type RouteSegmentData = {
  id: string;
  left: number;
  top: number;
  width: number;
  angle: number;
};

const GLOBE_WIDTH = 520;
const GLOBE_HEIGHT = 330;
const GLOBE_RADIUS = 150;
const ROUTE_SAMPLE_COUNT = 36;

const journeyStages: JourneyStage[] = [
  { label: "Pre-flight", icon: "clipboard-outline", threshold: 0 },
  { label: "Takeoff", icon: "airplane", threshold: 15 },
  { label: "Cruise", icon: "cloud-outline", threshold: 50 },
  { label: "Descent", icon: "navigate-outline", threshold: 80 },
  { label: "Arrival", icon: "business-outline", threshold: 100 }
];

function splitRoute(routeLabel: string) {
  const parts = routeLabel.split("→").map((part) => part.trim());
  return {
    origin: parts[0] || "Origin",
    destination: parts[1] || "Destination"
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function toRadians(value: number): number {
  return (value * Math.PI) / 180;
}

function toDegrees(value: number): number {
  return (value * 180) / Math.PI;
}

function isRealCoordinate(coordinates: Coordinates): boolean {
  return coordinates.latitude !== 0 || coordinates.longitude !== 0;
}

function hasRealRoute(origin: Coordinates, destination: Coordinates): boolean {
  return isRealCoordinate(origin) && isRealCoordinate(destination);
}

function normalizeLongitude(longitude: number): number {
  if (longitude > 180) return longitude - 360;
  if (longitude < -180) return longitude + 360;
  return longitude;
}

function routeCenter(origin: Coordinates, destination: Coordinates): Coordinates {
  let destinationLongitude = destination.longitude;
  const deltaLongitude = Math.abs(origin.longitude - destination.longitude);

  if (deltaLongitude > 180) {
    destinationLongitude += destinationLongitude > origin.longitude ? -360 : 360;
  }

  return {
    latitude: clamp((origin.latitude + destination.latitude) / 2, -60, 75),
    longitude: normalizeLongitude((origin.longitude + destinationLongitude) / 2)
  };
}

function projectOrthographic(coordinates: Coordinates, center: Coordinates): ProjectedPoint {
  const latitude = toRadians(coordinates.latitude);
  const longitude = toRadians(coordinates.longitude);
  const centerLatitude = toRadians(center.latitude);
  const centerLongitude = toRadians(center.longitude);
  const deltaLongitude = longitude - centerLongitude;
  const cosDistance =
    Math.sin(centerLatitude) * Math.sin(latitude) +
    Math.cos(centerLatitude) * Math.cos(latitude) * Math.cos(deltaLongitude);

  return {
    x: GLOBE_WIDTH / 2 + GLOBE_RADIUS * Math.cos(latitude) * Math.sin(deltaLongitude),
    y:
      GLOBE_HEIGHT / 2 -
      GLOBE_RADIUS *
        (Math.cos(centerLatitude) * Math.sin(latitude) -
          Math.sin(centerLatitude) * Math.cos(latitude) * Math.cos(deltaLongitude)),
    visible: cosDistance > -0.12
  };
}

function coordinatesToVector(coordinates: Coordinates): [number, number, number] {
  const latitude = toRadians(coordinates.latitude);
  const longitude = toRadians(coordinates.longitude);
  return [
    Math.cos(latitude) * Math.cos(longitude),
    Math.cos(latitude) * Math.sin(longitude),
    Math.sin(latitude)
  ];
}

function vectorToCoordinates(vector: [number, number, number]): Coordinates {
  const [x, y, z] = vector;
  const hypotenuse = Math.sqrt(x * x + y * y);
  return {
    latitude: toDegrees(Math.atan2(z, hypotenuse)),
    longitude: normalizeLongitude(toDegrees(Math.atan2(y, x)))
  };
}

function interpolateGreatCircle(origin: Coordinates, destination: Coordinates, progress: number): Coordinates {
  const originVector = coordinatesToVector(origin);
  const destinationVector = coordinatesToVector(destination);
  const dot = clamp(
    originVector[0] * destinationVector[0] +
      originVector[1] * destinationVector[1] +
      originVector[2] * destinationVector[2],
    -1,
    1
  );
  const omega = Math.acos(dot);
  const sinOmega = Math.sin(omega);

  if (sinOmega < 0.0001) {
    return {
      latitude: origin.latitude + (destination.latitude - origin.latitude) * progress,
      longitude: origin.longitude + (destination.longitude - origin.longitude) * progress
    };
  }

  const originWeight = Math.sin((1 - progress) * omega) / sinOmega;
  const destinationWeight = Math.sin(progress * omega) / sinOmega;

  return vectorToCoordinates([
    originWeight * originVector[0] + destinationWeight * destinationVector[0],
    originWeight * originVector[1] + destinationWeight * destinationVector[1],
    originWeight * originVector[2] + destinationWeight * destinationVector[2]
  ]);
}

function projectedRoute(origin: Coordinates, destination: Coordinates, center: Coordinates): ProjectedPoint[] {
  return Array.from({ length: ROUTE_SAMPLE_COUNT }, (_, index) => {
    const progress = index / (ROUTE_SAMPLE_COUNT - 1);
    return projectOrthographic(interpolateGreatCircle(origin, destination, progress), center);
  });
}

function routeSegments(points: ProjectedPoint[]): RouteSegmentData[] {
  const segments: RouteSegmentData[] = [];

  for (let index = 1; index < points.length; index += 1) {
    const previous = points[index - 1];
    const current = points[index];
    if (!previous.visible || !current.visible) continue;

    const deltaX = current.x - previous.x;
    const deltaY = current.y - previous.y;
    const width = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const angle = Math.atan2(deltaY, deltaX);

    segments.push({
      id: `${index}`,
      left: (previous.x + current.x) / 2 - width / 2,
      top: (previous.y + current.y) / 2 - 2,
      width,
      angle
    });
  }

  return segments;
}

function getJourneyPercent(progressPercent: number): number {
  return clamp(Math.round(progressPercent), 0, 100);
}

function getActiveStageIndex(phaseLabel: string, percent: number): number {
  const normalized = phaseLabel.toLowerCase();
  if (normalized.includes("arriv")) return journeyStages.length - 1;
  if (normalized.includes("approach") || normalized.includes("descent")) return 3;
  if (normalized.includes("cruise")) return 2;
  if (normalized.includes("takeoff") || normalized.includes("climb")) return 1;
  if (normalized.includes("pre")) return 0;

  if (percent >= 100) return journeyStages.length - 1;
  if (percent >= 80) return 3;
  if (percent >= 20) return 2;
  if (percent >= 5) return 1;
  return 0;
}

function SkyBackground() {
  return (
    <>
      <View pointerEvents="none" style={styles.skyWash} />
      <View pointerEvents="none" style={styles.cloudLeft} />
      <View pointerEvents="none" style={styles.cloudRight} />
      <View pointerEvents="none" style={styles.horizonCloud} />
    </>
  );
}

function RouteSegment({ segment }: { segment: RouteSegmentData }) {
  return (
    <View
      style={[
        styles.routeSegment,
        {
          left: segment.left,
          top: segment.top,
          width: segment.width,
          transform: [{ rotate: `${segment.angle}rad` }]
        }
      ]}
    />
  );
}

function LocationMarker({ point, label }: { point: ProjectedPoint; label: string }) {
  return (
    <View style={[styles.locationMarker, { left: point.x, top: point.y }]}> 
      <View style={styles.markerDot} />
      <Text style={styles.markerLabel}>{label}</Text>
    </View>
  );
}

function GlobeRoute({
  origin,
  destination,
  originCode,
  destinationCode,
  originCoordinates,
  destinationCoordinates,
  percent
}: {
  origin: string;
  destination: string;
  originCode: string;
  destinationCode: string;
  originCoordinates: Coordinates;
  destinationCoordinates: Coordinates;
  percent: number;
}) {
  const hasCoordinates = hasRealRoute(originCoordinates, destinationCoordinates);
  const center = hasCoordinates
    ? routeCenter(originCoordinates, destinationCoordinates)
    : { latitude: 39, longitude: -3 };
  const fallbackOrigin = { x: GLOBE_WIDTH * 0.28, y: GLOBE_HEIGHT * 0.52, visible: true };
  const fallbackDestination = { x: GLOBE_WIDTH * 0.72, y: GLOBE_HEIGHT * 0.52, visible: true };
  const routePoints = hasCoordinates
    ? projectedRoute(originCoordinates, destinationCoordinates, center)
    : [fallbackOrigin, fallbackDestination];
  const segments = hasCoordinates ? routeSegments(routePoints) : [];
  const originPoint = hasCoordinates ? routePoints[0] : fallbackOrigin;
  const destinationPoint = hasCoordinates ? routePoints[routePoints.length - 1] : fallbackDestination;
  const planePoint = routePoints[Math.round((routePoints.length - 1) * (percent / 100))] ?? originPoint;

  return (
    <View style={styles.globeCard}>
      <View style={styles.globeHeader}>
        <Text style={styles.screenTitle}>Current journey</Text>
        <Text style={styles.screenRoute}>{origin} → {destination}</Text>
        <View style={styles.flightBadge}>
          <Ionicons name="earth-outline" size={15} color={colors.skyBlueStrong} />
          <Text style={styles.flightBadgeText}>Planned route view</Text>
        </View>
      </View>

      <View style={styles.globe}> 
        <View style={styles.globeDisc} />
        <View style={styles.graticuleVertical} />
        <View style={styles.graticuleHorizontal} />
        <View style={[styles.landBlob, styles.landNorth]} />
        <View style={[styles.landBlob, styles.landWest]} />
        <View style={[styles.landBlob, styles.landEast]} />
        <View style={[styles.landBlob, styles.landSouth]} />
        <View style={styles.globeCloudOne} />
        <View style={styles.globeCloudTwo} />

        {segments.length > 0 ? (
          segments.map((segment) => <RouteSegment key={segment.id} segment={segment} />)
        ) : (
          <View style={styles.fallbackRouteArc} />
        )}

        <LocationMarker point={originPoint} label={originCode || origin} />
        <LocationMarker point={destinationPoint} label={destinationCode || destination} />

        <View style={[styles.globePlane, { left: planePoint.x, top: planePoint.y }]}> 
          <Ionicons name="airplane" size={28} color={colors.white} />
        </View>
      </View>
    </View>
  );
}

function PhaseProgressCard({ percent, activeIndex }: {
  percent: number;
  activeIndex: number;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.phaseTrack}> 
        <View style={styles.phaseLine} />
        <View style={[styles.phaseLineFill, { width: `${Math.min(percent, 100)}%` }]} />
        {journeyStages.map((stage, index) => {
          const isCompleted = index < activeIndex;
          const isCurrent = index === activeIndex;
          const isArrived = percent >= 100;
          const activeColor = isArrived ? colors.successGreen : colors.skyBlueStrong;
          return (
            <View key={stage.label} style={[styles.stageItem, { left: `${stage.threshold}%` }]}> 
              <View
                style={[
                  styles.stageIcon,
                  (isCompleted || isCurrent) && { backgroundColor: activeColor },
                  isCurrent && styles.stageIconCurrent
                ]}
              >
                <Ionicons name={stage.icon} size={isCurrent ? 24 : 19} color={(isCompleted || isCurrent) ? colors.white : "#8AA3C2"} />
              </View>
              <Text style={[styles.stageLabel, isCurrent && { color: activeColor, fontWeight: "800" }]}>{stage.label}</Text>
            </View>
          );
        })}
      </View>
      <Text style={[styles.progressNumber, { color: percent >= 100 ? colors.successGreen : colors.skyBlueStrong }]}>{percent}%</Text>
      <Text style={styles.progressCaption}>of journey</Text>
    </View>
  );
}

function InfoCard({ icon, title, body, progress }: {
  icon: IoniconName;
  title: string;
  body: string;
  progress?: number;
}) {
  return (
    <View style={styles.infoCard}>
      <View style={styles.infoIconCircle}>
        {typeof progress === "number" ? (
          <Text style={styles.infoProgressText}>{progress}%</Text>
        ) : (
          <Ionicons name={icon} size={30} color={colors.skyBlueStrong} />
        )}
      </View>
      <View style={styles.infoText}>
        <Text style={styles.infoTitle}>{title}</Text>
        <Text style={styles.infoBody}>{body}</Text>
      </View>
      <Text style={styles.infoChevron}>›</Text>
    </View>
  );
}

export default function JourneyTab() {
  const { snapshot } = useFlightSnapshot();

  if (!snapshot) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Flight not found</Text>
          <Text style={styles.emptyBody}>
            This flight is not available on this device.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const ui = buildFlightUiSnapshot(snapshot);
  const { origin, destination } = splitRoute(ui.routeLabel);
  const percent = getJourneyPercent(snapshot.progress.progressPercent);
  const activeIndex = getActiveStageIndex(ui.currentPhaseLabel, percent);

  return (
    <SafeAreaView style={styles.safeArea}>
      <SkyBackground />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <GuidanceModeBadge confidenceLevel={ui.confidenceLevel} predictionMode={ui.predictionMode} />
        <GlobeRoute
          origin={origin}
          destination={destination}
          originCode={snapshot.flightSummary.originCode}
          destinationCode={snapshot.flightSummary.destinationCode}
          originCoordinates={snapshot.flightSummary.originCoordinates}
          destinationCoordinates={snapshot.flightSummary.destinationCoordinates}
          percent={percent}
        />
        <PhaseProgressCard percent={percent} activeIndex={activeIndex} />
        <InfoCard
          icon="map-outline"
          title="Planned route"
          body={`This view places ${snapshot.flightSummary.originCode} and ${snapshot.flightSummary.destinationCode} using the airport coordinates saved with your flight.`}
        />
        <InfoCard
          icon="analytics-outline"
          title="Timeline progress"
          body={`${percent}% of the journey completed. This is based on the saved flight timeline, not live tracking.`}
          progress={percent}
        />
        <Text style={styles.timeNote}>{snapshot.flightSummary.timeDisplayNote}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#EAF5FF",
    overflow: "hidden"
  },
  skyWash: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 520,
    backgroundColor: "#DCEEFF"
  },
  cloudLeft: {
    position: "absolute",
    top: 140,
    left: -110,
    width: 260,
    height: 150,
    borderRadius: radius.pill,
    backgroundColor: "rgba(255, 255, 255, 0.68)"
  },
  cloudRight: {
    position: "absolute",
    top: 210,
    right: -120,
    width: 300,
    height: 170,
    borderRadius: radius.pill,
    backgroundColor: "rgba(255, 255, 255, 0.62)"
  },
  horizonCloud: {
    position: "absolute",
    top: 420,
    left: -60,
    right: -60,
    height: 120,
    borderRadius: radius.pill,
    backgroundColor: "rgba(255, 255, 255, 0.54)"
  },
  content: {
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: 132
  },
  globeCard: {
    alignItems: "center",
    gap: spacing.lg,
    paddingTop: spacing.lg
  },
  globeHeader: {
    alignItems: "center",
    gap: spacing.sm
  },
  screenTitle: {
    ...typography.hero,
    color: colors.textPrimary,
    textAlign: "center"
  },
  screenRoute: {
    ...typography.section,
    color: colors.textPrimary,
    textAlign: "center"
  },
  flightBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: "rgba(255, 255, 255, 0.86)",
    borderWidth: 1,
    borderColor: "rgba(18, 102, 227, 0.14)"
  },
  flightBadgeText: {
    ...typography.caption,
    color: colors.skyBlueStrong,
    fontWeight: "800"
  },
  globe: {
    width: GLOBE_WIDTH,
    height: GLOBE_HEIGHT,
    borderRadius: 260,
    overflow: "hidden",
    position: "relative",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.75)",
    shadowColor: colors.primaryBlue,
    shadowOpacity: 0.2,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 14 },
    elevation: 7
  },
  globeDisc: {
    position: "absolute",
    inset: 0,
    backgroundColor: "#BFE0FF"
  },
  graticuleVertical: {
    position: "absolute",
    left: GLOBE_WIDTH / 2 - 1,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: "rgba(255, 255, 255, 0.18)"
  },
  graticuleHorizontal: {
    position: "absolute",
    left: 0,
    right: 0,
    top: GLOBE_HEIGHT / 2 - 1,
    height: 2,
    backgroundColor: "rgba(255, 255, 255, 0.18)"
  },
  landBlob: {
    position: "absolute",
    backgroundColor: "rgba(245, 250, 255, 0.82)",
    borderRadius: radius.pill
  },
  landNorth: { top: 40, left: 190, width: 190, height: 58, transform: [{ rotate: "8deg" }] },
  landWest: { top: 116, left: 90, width: 170, height: 78, transform: [{ rotate: "-12deg" }] },
  landEast: { top: 116, right: 82, width: 180, height: 86, transform: [{ rotate: "10deg" }] },
  landSouth: { bottom: 28, left: 164, width: 220, height: 72, transform: [{ rotate: "3deg" }] },
  globeCloudOne: { position: "absolute", top: 78, left: 50, width: 180, height: 34, borderRadius: radius.pill, backgroundColor: "rgba(255, 255, 255, 0.42)" },
  globeCloudTwo: { position: "absolute", top: 210, right: 40, width: 200, height: 38, borderRadius: radius.pill, backgroundColor: "rgba(255, 255, 255, 0.36)" },
  routeSegment: {
    position: "absolute",
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.skyBlueStrong,
    shadowColor: colors.skyBlueStrong,
    shadowOpacity: 0.28,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 }
  },
  fallbackRouteArc: {
    position: "absolute",
    left: GLOBE_WIDTH * 0.26,
    right: GLOBE_WIDTH * 0.26,
    top: GLOBE_HEIGHT * 0.46,
    height: 80,
    borderTopWidth: 4,
    borderColor: colors.skyBlueStrong,
    borderRadius: 180,
    transform: [{ rotate: "2deg" }]
  },
  globePlane: {
    position: "absolute",
    width: 44,
    height: 44,
    marginLeft: -22,
    marginTop: -22,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.skyBlueStrong,
    shadowColor: colors.primaryBlue,
    shadowOpacity: 0.28,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6
  },
  locationMarker: {
    position: "absolute",
    alignItems: "center",
    gap: 3,
    marginLeft: -28,
    marginTop: -11,
    width: 56
  },
  markerDot: {
    width: 16,
    height: 16,
    borderRadius: radius.pill,
    backgroundColor: colors.skyBlueStrong,
    borderWidth: 4,
    borderColor: colors.white
  },
  markerLabel: {
    ...typography.caption,
    color: colors.textPrimary,
    fontSize: 12,
    lineHeight: 15,
    fontWeight: "800",
    backgroundColor: "rgba(255, 255, 255, 0.86)",
    borderRadius: radius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
    overflow: "hidden"
  },
  card: {
    gap: spacing.lg,
    padding: spacing.xl,
    borderRadius: radius.xl,
    backgroundColor: "rgba(255, 255, 255, 0.94)",
    borderWidth: 1.2,
    borderColor: "rgba(13, 59, 140, 0.18)",
    shadowColor: colors.primaryBlue,
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4
  },
  phaseTrack: {
    height: 82,
    position: "relative",
    justifyContent: "center",
    marginHorizontal: 10
  },
  phaseLine: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 30,
    height: 3,
    borderRadius: radius.pill,
    backgroundColor: "#D6E4F5"
  },
  phaseLineFill: {
    position: "absolute",
    left: 0,
    top: 30,
    height: 3,
    borderRadius: radius.pill,
    backgroundColor: colors.skyBlueStrong
  },
  stageItem: {
    position: "absolute",
    top: 12,
    alignItems: "center",
    gap: spacing.xs,
    width: 66,
    marginLeft: -33
  },
  stageIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: "#D6E4F5"
  },
  stageIconCurrent: {
    width: 50,
    height: 50,
    marginTop: -6,
    shadowColor: colors.skyBlueStrong,
    shadowOpacity: 0.26,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5
  },
  stageLabel: {
    ...typography.caption,
    color: colors.textPrimary,
    fontSize: 11,
    lineHeight: 14,
    textAlign: "center"
  },
  progressNumber: {
    ...typography.hero,
    textAlign: "center",
    fontSize: 34,
    lineHeight: 38
  },
  progressCaption: {
    ...typography.caption,
    color: colors.textPrimary,
    textAlign: "center"
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
    padding: spacing.xl,
    borderRadius: radius.xl,
    backgroundColor: "rgba(255, 255, 255, 0.94)",
    borderWidth: 1.2,
    borderColor: "rgba(13, 59, 140, 0.14)",
    shadowColor: colors.primaryBlue,
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3
  },
  infoIconCircle: {
    width: 62,
    height: 62,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF3FF"
  },
  infoProgressText: { ...typography.section, color: colors.skyBlueStrong, fontWeight: "900" },
  infoText: { flex: 1, gap: spacing.xs },
  infoTitle: { ...typography.section, color: colors.textPrimary },
  infoBody: { ...typography.caption, color: colors.textPrimary },
  infoChevron: { color: colors.primaryBlue, fontSize: 32, lineHeight: 36, fontWeight: "600" },
  timeNote: { ...typography.caption, color: colors.textPrimary, textAlign: "center" },
  emptyState: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xl, gap: spacing.sm },
  emptyTitle: { ...typography.title, color: colors.textPrimary, textAlign: "center" },
  emptyBody: { ...typography.body, color: colors.textPrimary, textAlign: "center" }
});
