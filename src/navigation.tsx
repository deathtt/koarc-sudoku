// src/navigation.tsx
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { User } from "firebase/auth";
import LoginScreen from "./screens/LoginScreen";
import HomeScreen from "./screens/HomeScreen";
import SoloScreen from "./screens/SoloScreen";
import CreateRoomScreen from "./screens/CreateRoomScreen";
import PublicRoomsScreen from "./screens/PublicRoomsScreen";
import RoomScreen from "./screens/RoomScreen";
import { theme } from "./theme";

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Solo: undefined;
  CreateRoom: undefined;
  PublicRooms: undefined;
  Room: { code: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function Navigation({
  user,
  guest,
  onGuest,
  onSignOutGuest,
}: {
  user: User | null;
  guest: boolean;
  onGuest: () => void;
  onSignOutGuest: () => void;
}) {
  const inApp = !!user || guest;

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.bg },
          headerTintColor: theme.colors.ink,
          headerShadowVisible: false,
          headerTitle: "",
        }}
      >
        {inApp ? (
          <>
            <Stack.Screen name="Home" options={{ headerShown: false }}>
              {(props) => (
                <HomeScreen
                  {...props}
                  isGuest={guest && !user}
                  onSignOutGuest={onSignOutGuest}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="Solo" component={SoloScreen} options={{ title: "Daily puzzle" }} />
            <Stack.Screen name="CreateRoom" component={CreateRoomScreen} options={{ title: "Create room" }} />
            <Stack.Screen name="PublicRooms" component={PublicRoomsScreen} options={{ title: "Public rooms" }} />
            <Stack.Screen name="Room" component={RoomScreen} options={{ title: "Room" }} />
          </>
        ) : (
          <Stack.Screen name="Login" options={{ headerShown: false }}>
            {(props) => <LoginScreen {...props} onGuest={onGuest} />}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
