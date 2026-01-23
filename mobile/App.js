import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import LandingScreen from './screens/LandingScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import HomeScreen from './screens/HomeScreen';
import PrakritiScreen from './screens/PrakritiScreen';
import ChatScreen from './screens/ChatScreen';
import RemediesScreen from './screens/RemediesScreen';
import DiagnosticScreen from './screens/DiagnosticScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Landing" component={LandingScreen} />
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Prakriti" component={PrakritiScreen} />
          <Stack.Screen name="Chat" component={ChatScreen} />
          <Stack.Screen name="Remedies" component={RemediesScreen} />
          <Stack.Screen name="Diagnostic" component={DiagnosticScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
