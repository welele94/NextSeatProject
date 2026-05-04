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
      />
      <StatusBar style="dark" />
    </>
  );
}
