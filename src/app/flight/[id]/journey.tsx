import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import type { DimensionValue } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { GuidanceModeBadge } from "@/components/flight/Sprint10Cards";
import { buildFlightUiSnapshot } from "@/features/flightSnapshot/uiSnapshot";
import { useFlightSnapshot } from "@/features/flightSnapshot/useFlightSnapshot";
import { greatCircleRoute } from "@/features/maps/greatCircle";
import {
  clamp,
  getEquirectangularImageStyle,
  isRealCoordinate,
  projectToViewport,
  type MapPoint
} from "@/features/maps/projection";
import { computeMapViewport } from "@/features/maps/viewport";
import { colors, radius, spacing, typography } from "@/theme";
import type { Coordinates } from "@/types/route";

type IoniconName = ComponentProps<typeof Ionicons>["name"];

type JourneyStage = {
  label: string;
  icon: IoniconName;
  threshold: number;
};

type RouteSegmentData = {
  id: string;
  left: number;
  top: number;
  width: number;
  angle: number;
};

const MAP_WIDTH = 342;
const MAP_HEIGHT = 190;
const EXPANDED_MAP_HEIGHT = 360;
const ROUTE_SAMPLE_COUNT = 32;
const WORLD_MAP = require("../../../assets/maps/map.png");

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

function asPercent(value: number): DimensionValue {
  return `${clamp(value, 0, 100)}%` as DimensionValue;
}

function fallbackPoint(x: number, y: number, width: number, height: number): MapPoint {
  return { x: width * x, y: height * y };
}

function fallbackRoute(origin: MapPoint, destination: MapPoint): MapPoint[] {
  return Array.from({ length: ROUTE_SAMPLE_COUNT }, (_, index) => {
    const progress = index / (ROUTE_SAMPLE_COUNT - 1);
    return {
      x: origin.x + (destination.x - origin.x) * progress,
      y: origin.y + (destination.y - origin.y) * progress
    };
  });
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
      top: (previous.y + current.y) / 2 - 1.5,
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

function LocationMarker({ point, label, expanded = false }: { point: MapPoint; label: string; expanded?: boolean }) {
  return (
    <View
      style={[
        styles.locationMarker,
        expanded && styles.locationMarkerExpanded,
        { left: point.x, top: point.y }
      ]}
    >
      <View style={[styles.markerDot, expanded && styles.markerDotExpanded]} />
      <Text style={[styles.markerLabel, expanded && styles.markerLabelExpanded]}>{label}</Text>
    </View>
  );
}

function RouteMapCanvas({
  width,
  height,
  origin,
  destination,
  originCode,
  destinationCode,
  originCoordinates,
  destinationCoordinates,
  percent,
  expanded = false
}: {
  width: number;
  height: number;
  origin: string;
  destination: string;
  originCode: string;
  destinationCode: string;
  originCoordinates: Coordinates;
  destinationCoordinates: Coordinates;
  percent: number;
  expanded?: boolean;
}) {
  const viewport = computeMapViewport(originCoordinates, destinationCoordinates, width, height);
  const imageStyle = getEquirectangularImageStyle(viewport, width, height);
  const hasCoordinates = isRealCoordinate(originCoordinates) && isRealCoordinate(destinationCoordinates);
  const originPoint = hasCoordinates
    ? projectToViewport(originCoordinates, viewport, width, height)
    : fallbackPoint(0.3, 0.58, width, height);
  const destinationPoint = hasCoordinates
    ? projectToViewport(destinationCoordinates, viewport, width, height)
    : fallbackPoint(0.7, 0.42, width, height);
  const routePoints = hasCoordinates
    ? greatCircleRoute(originCoordinates, destinationCoordinates, ROUTE_SAMPLE_COUNT).map((coordinates) =>
        projectToViewport(coordinates, viewport, width, height)
      )
    : fallbackRoute(originPoint, destinationPoint);
  const segments = routeSegments(routePoints);
  const planePoint = routePoints[Math.round((routePoints.length - 1) * (percent / 100))] ?? originPoint;

  return (
    <View style={[styles.mapCanvas, { width, height }, expanded && styles.mapCanvasExpanded]}>
      <Image source={WORLD_MAP} resizeMode="stretch" style={[styles.mapImage, imageStyle]} />
      <View pointerEvents="none" style={styles.mapOverlay} />
      {segments.map((segment) => <RouteSegment key={segment.id} segment={segment} />)}
      <LocationMarker point={originPoint} label={originCode || origin} expanded={expanded} />
      <LocationMarker point={destinationPoint} label={destinationCode || destination} expanded={expanded} />
      <View
        style={[
          styles.mapPlane,
          expanded && styles.mapPlaneExpanded,
          { left: planePoint.x, top: planePoint.y }
        ]}
      >
        <Ionicons name="airplane" size={expanded ? 24 : 20} color={colors.white} />
      </View>
      <View style={styles.mapCaptionPill}>
        <Text style={styles.mapCaptionText}>Offline map · not live tracking</Text>
      </View>
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
  const [isExpanded, setIsExpanded] = useState(false);

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

      {isExpanded ? (
        <View style={styles.expandedMapPanel}>
          <View style={styles.expandedMapHeader}>
            <View>
              <Text style={styles.modalEyebrow}>Planned route view</Text>
              <Text style={styles.modalTitle}>{origin} → {destination}</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close map"
              onPress={() => setIsExpanded(false)}
              style={({ pressed }) => [styles.closeButton, pressed && styles.mapPressed]}
            >
              <Ionicons name="close" size={24} color={colors.primaryBlue} />
            </Pressable>
          </View>
          <RouteMapCanvas
            width={MAP_WIDTH}
            height={EXPANDED_MAP_HEIGHT}
            origin={origin}
            destination={destination}
            originCode={originCode}
            destinationCode={destinationCode}
            originCoordinates={originCoordinates}
            destinationCoordinates={destinationCoordinates}
            percent={percent}
            expanded
          />
          <Text style={styles.modalNote}>Based on the flight saved on this device.</Text>
        </View>
      ) : (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open route map"
          onPress={() => setIsExpanded(true)}
          style={({ pressed }) => [styles.mapFrame, pressed && styles.mapPressed]}
        >
          <RouteMapCanvas
            width={MAP_WIDTH}
            height={MAP_HEIGHT}
            origin={origin}
            destination={destination}
            originCode={originCode}
            destinationCode={destinationCode}
            originCoordinates={originCoordinates}
            destinationCoordinates={destinationCoordinates}
            percent={percent}
          />
          <View style={styles.expandButton}>
            <Ionicons name="expand-outline" size={18} color={colors.primaryBlue} />
          </View>
        </Pressable>
      )}
    </View>
  );
}

function PhaseProgressCard({ percent, activeIndex }: { percent: number; activeIndex: number }) {
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
                <Ionicons
                  name={stage.icon}
                  size={isCurrent ? 24 : 19}
                  color={(isCompleted || isCurrent) ? colors.white : "#8AA3C2"}
                />
              </View>
              <Text style={[styles.stageLabel, isCurrent && { color: activeColor, fontWeight: "800" }]}>
                {stage.label}
              </Text>
            </View>
          );
        })}
      </View>
      <Text style={[styles.progressNumber, { color: percent >= 100 ? colors.successGreen : colors.skyBlueStrong }]}>
        {percent}%
      </Text>
      <Text style={styles.progressCaption}>of journey</Text>
    </View>
  );
}

function InfoCard({ icon, title, body, progress }: { icon: IoniconName; title: string; body: string; progress?: number }) {
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
          <Text style={styles.emptyBody}>This flight is not available on this device.</Text>
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
          body={`This map is stored on your device. ${snapshot.flightSummary.originCode} and ${snapshot.flightSummary.destinationCode} are placed using the airport coordinates saved with your flight.`}
        />
        <InfoCard
          icon="analytics-outline"
          title="Journey progress"
          body={`${percent}% of the journey completed. Based on the latest flight data saved on this device.`}
          progress={percent}
        />
        <Text style={styles.timeNote}>{snapshot.flightSummary.timeDisplayNote}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#EAF5FF", overflow: "hidden" },
  skyWash: { position: "absolute", top: 0, left: 0, right: 0, height: 520, backgroundColor: "#DCEEFF" },
  cloudLeft: { position: "absolute", top: 140, left: -110, width: 260, height: 150, borderRadius: radius.pill, backgroundColor: "rgba(255, 255, 255, 0.68)" },
  cloudRight: { position: "absolute", top: 210, right: -120, width: 300, height: 170, borderRadius: radius.pill, backgroundColor: "rgba(255, 255, 255, 0.62)" },
  horizonCloud: { position: "absolute", top: 420, left: -60, right: -60, height: 120, borderRadius: radius.pill, backgroundColor: "rgba(255, 255, 255, 0.54)" },
  content: { width: "100%", maxWidth: 430, alignSelf: "center", gap: spacing.lg, paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: 132 },
  mapCard: { alignItems: "center", gap: spacing.lg, paddingTop: spacing.lg },
  mapHeader: { alignItems: "center", gap: spacing.sm },
  screenTitle: { ...typography.hero, color: colors.textPrimary, textAlign: "center" },
  screenRoute: { ...typography.section, color: colors.textPrimary, textAlign: "center" },
  flightBadge: { flexDirection: "row", alignItems: "center", gap: spacing.xs, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.pill, backgroundColor: "rgba(255, 255, 255, 0.88)", borderWidth: 1, borderColor: "rgba(18, 102, 227, 0.14)" },
  flightBadgeText: { ...typography.caption, color: colors.skyBlueStrong, fontWeight: "800" },
  mapFrame: { width: MAP_WIDTH, height: MAP_HEIGHT, borderRadius: 24, overflow: "hidden", position: "relative", borderWidth: 2, borderColor: "rgba(255, 255, 255, 0.88)", backgroundColor: "#B5DDF4", shadowColor: colors.primaryBlue, shadowOpacity: 0.16, shadowRadius: 22, shadowOffset: { width: 0, height: 10 }, elevation: 6 },
  mapCanvas: { overflow: "hidden", position: "relative", backgroundColor: "#B5DDF4" },
  mapCanvasExpanded: { borderRadius: radius.xl, borderWidth: 1, borderColor: "rgba(255,255,255,0.8)" },
  mapImage: { position: "absolute", opacity: 0.96 },
  mapOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(234, 245, 255, 0.08)" },
  routeSegment: { position: "absolute", height: 3, borderRadius: radius.pill, backgroundColor: colors.skyBlueStrong, shadowColor: colors.skyBlueStrong, shadowOpacity: 0.24, shadowRadius: 5, shadowOffset: { width: 0, height: 2 } },
  mapPlane: { position: "absolute", width: 34, height: 34, marginLeft: -17, marginTop: -17, borderRadius: radius.pill, alignItems: "center", justifyContent: "center", backgroundColor: colors.skyBlueStrong, shadowColor: colors.primaryBlue, shadowOpacity: 0.28, shadowRadius: 10, shadowOffset: { width: 0, height: 5 }, elevation: 5 },
  mapPlaneExpanded: { width: 42, height: 42, marginLeft: -21, marginTop: -21 },
  locationMarker: { position: "absolute", alignItems: "center", gap: 2, marginLeft: -28, marginTop: -9, width: 56 },
  locationMarkerExpanded: { width: 76, marginLeft: -38, marginTop: -12 },
  markerDot: { width: 14, height: 14, borderRadius: radius.pill, backgroundColor: colors.skyBlueStrong, borderWidth: 3, borderColor: colors.white },
  markerDotExpanded: { width: 18, height: 18, borderWidth: 4 },
  markerLabel: { ...typography.caption, color: colors.textPrimary, fontSize: 11, lineHeight: 14, fontWeight: "800", backgroundColor: "rgba(255,255,255,0.92)", borderRadius: radius.sm, paddingHorizontal: 5, paddingVertical: 1, overflow: "hidden" },
  markerLabelExpanded: { fontSize: 13, lineHeight: 16, paddingHorizontal: 7, paddingVertical: 3 },
  mapCaptionPill: { position: "absolute", left: spacing.sm, bottom: spacing.sm, paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radius.pill, backgroundColor: "rgba(255,255,255,0.92)", borderWidth: 1, borderColor: "rgba(13,59,140,0.10)" },
  mapCaptionText: { ...typography.caption, color: colors.textPrimary, fontSize: 11, lineHeight: 14, fontWeight: "700" },
  expandButton: { position: "absolute", top: spacing.sm, right: spacing.sm, width: 34, height: 34, borderRadius: radius.pill, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.94)", borderWidth: 1, borderColor: "rgba(13,59,140,0.10)" },
  mapPressed: { opacity: 0.9 },
  expandedMapPanel: { width: MAP_WIDTH, gap: spacing.md, padding: spacing.md, borderRadius: radius.xl, backgroundColor: "rgba(255,255,255,0.94)", borderWidth: 1, borderColor: "rgba(13,59,140,0.12)" },
  expandedMapHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.md },
  modalEyebrow: { ...typography.eyebrow, color: colors.primaryBlue, fontWeight: "800" },
  modalTitle: { ...typography.title, color: colors.textPrimary, marginTop: spacing.xs },
  closeButton: { width: 44, height: 44, borderRadius: radius.pill, alignItems: "center", justifyContent: "center", backgroundColor: colors.white, borderWidth: 1, borderColor: "rgba(13,59,140,0.12)" },
  modalNote: { ...typography.caption, color: colors.textSecondary, textAlign: "center" },
  card: { gap: spacing.lg, padding: spacing.xl, borderRadius: radius.xl, backgroundColor: "rgba(255,255,255,0.94)", borderWidth: 1.2, borderColor: "rgba(13,59,140,0.18)", shadowColor: colors.primaryBlue, shadowOpacity: 0.12, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 4 },
  phaseTrack: { height: 82, position: "relative", justifyContent: "center", marginHorizontal: 10 },
  phaseLine: { position: "absolute", left: 0, right: 0, top: 30, height: 3, borderRadius: radius.pill, backgroundColor: "#D6E4F5" },
  phaseLineFill: { position: "absolute", left: 0, top: 30, height: 3, borderRadius: radius.pill, backgroundColor: colors.skyBlueStrong },
  stageItem: { position: "absolute", top: 12, alignItems: "center", gap: spacing.xs, width: 66, marginLeft: -33 },
  stageIcon: { width: 38, height: 38, borderRadius: radius.pill, alignItems: "center", justifyContent: "center", backgroundColor: colors.white, borderWidth: 1, borderColor: "#D6E4F5" },
  stageIconCurrent: { width: 50, height: 50, marginTop: -6, shadowColor: colors.skyBlueStrong, shadowOpacity: 0.26, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 5 },
  stageLabel: { ...typography.caption, color: colors.textPrimary, fontSize: 11, lineHeight: 14, textAlign: "center" },
  progressNumber: { ...typography.hero, textAlign: "center", fontSize: 34, lineHeight: 38 },
  progressCaption: { ...typography.caption, color: colors.textPrimary, textAlign: "center" },
  infoCard: { flexDirection: "row", alignItems: "center", gap: spacing.lg, padding: spacing.xl, borderRadius: radius.xl, backgroundColor: "rgba(255,255,255,0.94)", borderWidth: 1.2, borderColor: "rgba(13,59,140,0.14)", shadowColor: colors.primaryBlue, shadowOpacity: 0.08, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 3 },
  infoIconCircle: { width: 62, height: 62, borderRadius: radius.pill, alignItems: "center", justifyContent: "center", backgroundColor: "#EAF3FF" },
  infoProgressText: { ...typography.section, color: colors.skyBlueStrong, fontSize: 21, lineHeight: 26, fontWeight: "800" },
  infoText: { flex: 1, gap: spacing.xs },
  infoTitle: { ...typography.section, color: colors.textPrimary },
  infoBody: { ...typography.caption, color: colors.textPrimary },
  infoChevron: { color: colors.primaryBlue, fontSize: 34, lineHeight: 38, fontWeight: "600" },
  timeNote: { ...typography.caption, color: colors.textPrimary, textAlign: "center", paddingHorizontal: spacing.xl },
  emptyState: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xl },
  emptyTitle: { ...typography.title, color: colors.textPrimary, textAlign: "center" },
  emptyBody: { ...typography.body, color: colors.textPrimary, textAlign: "center" }
});