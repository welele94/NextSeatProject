import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: "#F6F7F9"
          },
          headerTintColor: "#102331",
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: "#F6F7F9"
          }
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: "Next Seat",
            headerShown: false
          }}
        />
        <Stack.Screen
          name="flight/[id]"
          options={{
            title: "Flight Mode",
            headerShown: false
          }}
        />
        <Stack.Screen
          name="learn/index"
          options={{
            title: "Learn More"
          }}
        />
        <Stack.Screen
          name="settings/index"
          options={{
            title: "Settings"
          }}
        />
        <Stack.Screen
          name="+not-found"
          options={{
            title: "Route not found"
          }}
        />
      </Stack>
      <StatusBar style="dark" />
    </>
  );
}
