import { Ionicons } from "@expo/vector-icons";
import { Tabs, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, spacing, typography } from "@/theme";

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
          backgroundColor: colors.surface
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
  }
});