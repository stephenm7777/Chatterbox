import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import ChatScreen from './screens/ChatScreen';
import ForgotPassword from './screens/ForgotPassword';
import IndivdualChat from './screens/IndivdualChat';
import ProfileScreen from './screens/ProfileScreen';
import UserProfile from './screens/UserProfile';
import OtherProfile from './screens/OtherProfile';

const Stack = createNativeStackNavigator();

const MyStack = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'fade', 
        }}
      >
        <Stack.Screen name="Home" component={LoginScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
        <Stack.Screen name="IndivdualChat" component={IndivdualChat} />
        <Stack.Screen name="UserProfile" component={UserProfile} />
        <Stack.Screen name="OtherProfile" component={OtherProfile} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default MyStack;
