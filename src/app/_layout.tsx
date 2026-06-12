import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { colors } from "@/theme";

export default function RootLayout() {
  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          headerStyle: {
            backgroundColor: colors.background
          },
          headerTintColor: colors.textPrimary,
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: colors.background
          }
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="flight/[id]" />
        <Stack.Screen name="learn/index" />
        <Stack.Screen name="settings/index" />
        <Stack.Screen name="+not-found" />
      </Stack>

      <StatusBar style="dark" />
    </>
  );
}