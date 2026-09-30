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

export default function Navigation({ user }: { user: User | null }) {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.bg },
          headerTintColor: theme.colors.white,
          headerShadowVisible: false,
          headerTitle: "",
        }}
      >
        {user ? (
          <>
            <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Solo" component={SoloScreen} />
            <Stack.Screen name="CreateRoom" component={CreateRoomScreen} />
            <Stack.Screen name="PublicRooms" component={PublicRoomsScreen} />
            <Stack.Screen name="Room" component={RoomScreen} />
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
