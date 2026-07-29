import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import type { DimensionValue } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  EUROPE_ROUTE_MAP,
  WORLD_ROUTE_MAP,
  type OfflineMapBounds,
  type OfflineRouteMapAsset
} from "@/assets/offlineRouteMaps";
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

type MapPoint = {
  x: number;
  y: number;
};

type RouteSegmentData = {
  id: string;
  left: number;
  top: number;
  width: number;
  angle: number;
};

const MAP_WIDTH = 520;
const MAP_HEIGHT = 320;
const ROUTE_SAMPLE_COUNT = 32;

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

function asPercent(value: number): DimensionValue {
  return `${clamp(value, 0, 100)}%` as DimensionValue;
}

function isRealCoordinate(coordinates: Coordinates): boolean {
  return coordinates.latitude !== 0 || coordinates.longitude !== 0;
}

function isInsideBounds(coordinates: Coordinates, bounds: OfflineMapBounds): boolean {
  return (
    coordinates.longitude >= bounds.minLongitude &&
    coordinates.longitude <= bounds.maxLongitude &&
    coordinates.latitude >= bounds.minLatitude &&
    coordinates.latitude <= bounds.maxLatitude
  );
}

function chooseMapAsset(origin: Coordinates, destination: Coordinates): OfflineRouteMapAsset {
  const isEuropeRoute =
    isRealCoordinate(origin) &&
    isRealCoordinate(destination) &&
    isInsideBounds(origin, EUROPE_ROUTE_MAP.bounds) &&
    isInsideBounds(destination, EUROPE_ROUTE_MAP.bounds);

  return isEuropeRoute ? EUROPE_ROUTE_MAP : WORLD_ROUTE_MAP;
}

function projectToMap(coordinates: Coordinates, bounds: OfflineMapBounds): MapPoint {
  const longitude = clamp(coordinates.longitude, bounds.minLongitude, bounds.maxLongitude);
  const latitude = clamp(coordinates.latitude, bounds.minLatitude, bounds.maxLatitude);

  return {
    x: ((longitude - bounds.minLongitude) / (bounds.maxLongitude - bounds.minLongitude)) * MAP_WIDTH,
    y: ((bounds.maxLatitude - latitude) / (bounds.maxLatitude - bounds.minLatitude)) * MAP_HEIGHT
  };
}

function fallbackPoint(x: number, y: number): MapPoint {
  return { x: MAP_WIDTH * x, y: MAP_HEIGHT * y };
}

function routeControlPoint(origin: MapPoint, destination: MapPoint): MapPoint {
  const midpoint = {
    x: (origin.x + destination.x) / 2,
    y: (origin.y + destination.y) / 2
  };
  const deltaX = destination.x - origin.x;
  const deltaY = destination.y - origin.y;
  const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  const curve = clamp(distance * 0.18, 24, 72);

  return {
    x: midpoint.x,
    y: midpoint.y - curve
  };
}

function bezierPoint(origin: MapPoint, control: MapPoint, destination: MapPoint, progress: number): MapPoint {
  const inverse = 1 - progress;
  return {
    x: inverse * inverse * origin.x + 2 * inverse * progress * control.x + progress * progress * destination.x,
    y: inverse * inverse * origin.y + 2 * inverse * progress * control.y + progress * progress * destination.y
  };
}

function projectedRoute(origin: MapPoint, destination: MapPoint): MapPoint[] {
  const control = routeControlPoint(origin, destination);
  return Array.from({ length: ROUTE_SAMPLE_COUNT }, (_, index) =>
    bezierPoint(origin, control, destination, index / (ROUTE_SAMPLE_COUNT - 1))
  );
}

function routeSegments(points: MapPoint[]): RouteSegmentData[] {
  const segments: RouteSegmentData[] = [];

  for (let index = 1; index < points.length; index += 1) {
    const previous = points[index - 1];
    const current = points[index];
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

function LocationMarker({ point, label }: { point: MapPoint; label: string }) {
  return (
    <View style={[styles.locationMarker, { left: point.x, top: point.y }]}> 
      <View style={styles.markerDot} />
      <Text style={styles.markerLabel}>{label}</Text>
    </View>
  );
}

function OfflineRouteMap({
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
  const mapAsset = chooseMapAsset(originCoordinates, destinationCoordinates);
  const hasCoordinates = isRealCoordinate(originCoordinates) && isRealCoordinate(destinationCoordinates);
  const originPoint = hasCoordinates
    ? projectToMap(originCoordinates, mapAsset.bounds)
    : fallbackPoint(0.28, 0.56);
  const destinationPoint = hasCoordinates
    ? projectToMap(destinationCoordinates, mapAsset.bounds)
    : fallbackPoint(0.72, 0.42);
  const routePoints = projectedRoute(originPoint, destinationPoint);
  const segments = routeSegments(routePoints);
  const planePoint = routePoints[Math.round((routePoints.length - 1) * (percent / 100))] ?? originPoint;

  return (
    <View style={styles.mapCard}>
      <View style={styles.mapHeader}>
        <Text style={styles.screenTitle}>Current journey</Text>
        <Text style={styles.screenRoute}>{origin} → {destination}</Text>
        <View style={styles.flightBadge}>
          <Ionicons name="map-outline" size={15} color={colors.skyBlueStrong} />
          <Text style={styles.flightBadgeText}>Planned route view</Text>
        </View>
      </View>

      <View style={styles.mapFrame}> 
        <Image source={{ uri: mapAsset.uri }} resizeMode="cover" style={styles.mapImage} />
        <View pointerEvents="none" style={styles.mapOverlay} />
        {segments.map((segment) => <RouteSegment key={segment.id} segment={segment} />)}
        <LocationMarker point={originPoint} label={originCode || origin} />
        <LocationMarker point={destinationPoint} label={destinationCode || destination} />
        <View style={[styles.mapPlane, { left: planePoint.x, top: planePoint.y }]}> 
          <Ionicons name="airplane" size={25} color={colors.white} />
        </View>
        <View style={styles.mapCaptionPill}>
          <Text style={styles.mapCaptionText}>Offline map · not live tracking</Text>
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
        <View style={[styles.phaseLineFill, { width: asPercent(percent) }]} />
        {journeyStages.map((stage, index) => {
          const isCompleted = index < activeIndex;
          const isCurrent = index === activeIndex;
          const isArrived = percent >= 100;
          const activeColor = isArrived ? colors.successGreen : colors.skyBlueStrong;
          return (
            <View key={stage.label} style={[styles.stageItem, { left: asPercent(stage.threshold) }]}> 
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
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <GuidanceModeBadge confidenceLevel={ui.confidenceLevel} predictionMode={ui.predictionMode} />
        <OfflineRouteMap
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
          title="Offline route map"
          body={`This map is saved inside Next Seat. ${snapshot.flightSummary.originCode} and ${snapshot.flightSummary.destinationCode} are placed using the airport coordinates saved with your flight.`}
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
  mapCard: {
    alignItems: "center",
    gap: spacing.lg,
    paddingTop: spacing.lg
  },
  mapHeader: {
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
    backgroundColor: "rgba(255, 255, 255, 0.88)",
    borderWidth: 1,
    borderColor: "rgba(18, 102, 227, 0.14)"
  },
  flightBadgeText: {
    ...typography.caption,
    color: colors.skyBlueStrong,
    fontWeight: "800"
  },
  mapFrame: {
    width: MAP_WIDTH,
    height: MAP_HEIGHT,
    borderRadius: 44,
    overflow: "hidden",
    position: "relative",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.78)",
    backgroundColor: "#D9EEFF",
    shadowColor: colors.primaryBlue,
    shadowOpacity: 0.2,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 14 },
    elevation: 7
  },
  mapImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%"
  },
  mapOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.06)"
  },
  routeSegment: {
    position: "absolute",
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.skyBlueStrong,
    shadowColor: colors.skyBlueStrong,
    shadowOpacity: 0.32,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 2 }
  },
  mapPlane: {
    position: "absolute",
    width: 42,
    height: 42,
    marginLeft: -21,
    marginTop: -21,
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
    backgroundColor: "rgba(255, 255, 255, 0.88)",
    borderRadius: radius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
    overflow: "hidden"
  },
  mapCaptionPill: {
    position: "absolute",
    left: spacing.lg,
    bottom: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderWidth: 1,
    borderColor: "rgba(13, 59, 140, 0.10)"
  },
  mapCaptionText: {
    ...typography.caption,
    color: colors.textPrimary,
    fontSize: 12,
    lineHeight: 15,
    fontWeight: "700"
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
  infoProgressText: {
    ...typography.section,
    color: colors.skyBlueStrong,
    fontSize: 21,
    lineHeight: 26,
    fontWeight: "800"
  },
  infoText: { flex: 1, gap: spacing.xs },
  infoTitle: { ...typography.section, color: colors.textPrimary },
  infoBody: { ...typography.caption, color: colors.textPrimary },
  infoChevron: { color: colors.primaryBlue, fontSize: 34, lineHeight: 38, fontWeight: "600" },
  timeNote: { ...typography.caption, color: colors.textPrimary, textAlign: "center", paddingHorizontal: spacing.xl },
  emptyState: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xl },
  emptyTitle: { ...typography.title, color: colors.textPrimary, textAlign: "center" },
  emptyBody: { ...typography.body, color: colors.textPrimary, textAlign: "center" }
});
