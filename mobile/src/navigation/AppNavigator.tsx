import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';

import DashboardScreen from '@/screens/DashboardScreen';
import CollegesScreen from '@/screens/CollegesScreen';
import CollegeDetailScreen from '@/screens/CollegeDetailScreen';
import NoticesScreen from '@/screens/NoticesScreen';
import NoticeDetailScreen from '@/screens/NoticeDetailScreen';
import CommunityScreen from '@/screens/CommunityScreen';
import CalendarScreen from '@/screens/CalendarScreen';
import SearchScreen from '@/screens/SearchScreen';
import WatchlistScreen from '@/screens/WatchlistScreen';
import ProfileScreen from '@/screens/ProfileScreen';
import SettingsScreen from '@/screens/SettingsScreen';
import ChatScreen from '@/screens/ChatScreen';
import LoginScreen from '@/screens/LoginScreen';
import AdminScreen from '@/screens/AdminScreen';
import NotificationScreen from '@/screens/NotificationScreen';

export type RootStackParamList = {
  Login: undefined;
  MainTabs: undefined;
  CollegeDetail: { id: string };
  NoticeDetail: { id: string };
  Chat: undefined;
  Settings: undefined;
  Admin: undefined;
  Notifications: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function MainTabs() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';
          switch (route.name) {
            case 'Dashboard': iconName = focused ? 'home' : 'home-outline'; break;
            case 'CollegesTab': iconName = focused ? 'school' : 'school-outline'; break;
            case 'NoticesTab': iconName = focused ? 'document-text' : 'document-text-outline'; break;
            case 'CommunityTab': iconName = focused ? 'chatbubbles' : 'chatbubbles-outline'; break;
            case 'MoreTab': iconName = focused ? 'grid' : 'grid-outline'; break;
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.tabActive,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
        headerStyle: { backgroundColor: colors.card },
        headerTintColor: colors.text,
        headerShadowVisible: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ headerShown: false }} />
      <Tab.Screen name="CollegesTab" component={CollegesScreen} options={{ title: 'Colleges', headerShown: false }} />
      <Tab.Screen name="NoticesTab" component={NoticesScreen} options={{ title: 'Notices', headerShown: false }} />
      <Tab.Screen name="CommunityTab" component={CommunityScreen} options={{ title: 'Community', headerShown: false }} />
      <Tab.Screen name="MoreTab" component={MoreScreen} options={{ title: 'More', headerShown: false }} />
    </Tab.Navigator>
  );
}

function MoreScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { user, signOut } = useAuth();

  const items = [
    { icon: 'search' as const, label: 'Search', screen: 'Search' },
    { icon: 'heart' as const, label: 'Watchlist', screen: 'Watchlist' },
    { icon: 'calendar' as const, label: 'Calendar', screen: 'Calendar' },
    { icon: 'notifications' as const, label: 'Notifications', screen: 'Notifications' },
    { icon: 'chatbubble-ellipses' as const, label: 'AI Chat', screen: 'Chat' },
    { icon: 'person' as const, label: 'Profile', screen: 'Profile' },
    { icon: 'settings' as const, label: 'Settings', screen: 'Settings' },
    ...(user?.role === 'admin' ? [{ icon: 'shield' as const, label: 'Admin Panel', screen: 'Admin' }] : []),
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: '700', color: colors.text, marginBottom: 20 }}>More</Text>
        <View style={{ backgroundColor: colors.card, borderRadius: 14, overflow: 'hidden' }}>
          {items.map((item, i) => (
            <TouchableOpacity
              key={item.label}
              onPress={() => navigation.navigate(item.screen)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 16,
                borderBottomWidth: i < items.length - 1 ? 1 : 0,
                borderBottomColor: colors.border,
              }}
            >
              <Ionicons name={item.icon} size={22} color={colors.primary} style={{ marginRight: 14 }} />
              <Text style={{ flex: 1, fontSize: 16, color: colors.text }}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity
          onPress={signOut}
          style={{
            marginTop: 20,
            backgroundColor: colors.danger,
            borderRadius: 12,
            padding: 16,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

export default function AppNavigator() {
  const { colors } = useTheme();
  const { user, loading } = useAuth();

  if (loading) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.card },
          headerTintColor: colors.text,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        {!user ? (
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
            <Stack.Screen name="CollegeDetail" component={CollegeDetailScreen} options={{ title: 'College' }} />
            <Stack.Screen name="NoticeDetail" component={NoticeDetailScreen} options={{ title: 'Notice' }} />
            <Stack.Screen name="Chat" component={ChatScreen} options={{ title: 'AI Chat' }} />
            <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
            <Stack.Screen name="Admin" component={AdminScreen} options={{ title: 'Admin Panel' }} />
            <Stack.Screen name="Notifications" component={NotificationScreen} options={{ title: 'Notifications' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
