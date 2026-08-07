import { Ionicons } from "@expo/vector-icons";
import { Tabs, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing, typography } from "@/theme";

export default function FlightTabsLayout() {
  const router = useRouter();

  function goBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/");
  }

  return (
    <Tabs
      initialRouteName="overview"
      screenOptions={{
        headerShown: true,
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: colors.background
        },
        headerTitle: "",
        headerLeft: () => (
          <Pressable onPress={goBack} style={styles.backButton}>
            <Ionicons
              name="chevron-back"
              size={20}
              color={colors.primaryBlue}
            />

            <Text style={styles.backButtonText}>Back</Text>
          </Pressable>
        ),
        tabBarActiveTintColor: colors.primaryBlue,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: {
          ...typography.caption,
          fontSize: 12
        },
        tabBarStyle: {
          height: 86,
          paddingTop: 8,
          paddingBottom: 18,
          borderTopColor: colors.border,
          backgroundColor: colors.surface,
          overflow: "visible"
        }
      }}
    >
      <Tabs.Screen
        name="overview"
        options={{
          title: "Overview",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          )
        }}
      />

      <Tabs.Screen
        name="current-moment"
        options={{
          href: null,
          title: "What is happening now"
        }}
      />

      <Tabs.Screen
        name="next-moment"
        options={{
          href: null,
          title: "Next moment"
        }}
      />

      <Tabs.Screen
        name="journey"
        options={{
          title: "Journey",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map-outline" size={size} color={color} />
          )
        }}
      />

      <Tabs.Screen
        name="calm"
        options={{
          title: "Calm",
          headerShown: false,
          tabBarStyle: { display: "none" },
          tabBarItemStyle: styles.calmTabItem,
          tabBarIcon: () => (
            <View style={styles.calmTabButton}>
              <Ionicons name="heart-outline" size={30} color={colors.white} />
            </View>
          ),
          tabBarLabelStyle: styles.calmTabLabel
        }}
      />

      <Tabs.Screen
        name="learn"
        options={{
          title: "Learn",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book-outline" size={size} color={color} />
          )
        }}
      />

      <Tabs.Screen
        name="more"
        options={{
          title: "More",
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="ellipsis-horizontal"
              size={size}
              color={color}
            />
          )
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  backButton: {
    marginLeft: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    minHeight: 44
  },
  backButtonText: {
    ...typography.caption,
    color: colors.primaryBlue,
    fontWeight: "700"
  },
  calmTabItem: {
    overflow: "visible"
  },
  calmTabButton: {
    width: 60,
    height: 60,
    marginTop: -24,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryBlue,
    borderWidth: 4,
    borderColor: colors.surface,
    shadowColor: colors.primaryBlue,
    shadowOpacity: 0.24,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6
  },
  calmTabLabel: {
    ...typography.caption,
    color: colors.primaryBlue,
    fontSize: 12,
    fontWeight: "800",
    marginTop: 2
  }
});