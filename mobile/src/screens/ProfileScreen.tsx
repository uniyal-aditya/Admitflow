import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Spacing, BorderRadius, FontSize, Shadows } from '@/constants/theme';

export default function ProfileScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { user, signOut } = useAuth();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ padding: Spacing.lg }}>
        <Text style={{ fontSize: FontSize.xxl, fontWeight: '700', color: colors.text, marginBottom: Spacing.xl }}>Profile</Text>

        <View style={[styles.avatarSection, { backgroundColor: colors.card }, Shadows.md]}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={{ color: '#fff', fontSize: FontSize.xxxl, fontWeight: '700' }}>
              {(user?.name || 'U').slice(0, 1).toUpperCase()}
            </Text>
          </View>
          <Text style={[styles.name, { color: colors.text }]}>{user?.name || 'Student'}</Text>
          <Text style={{ color: colors.textSecondary, fontSize: FontSize.sm }}>{user?.email}</Text>
          <View style={[styles.roleBadge, { backgroundColor: colors.primary + '15' }]}>
            <Text style={{ color: colors.primary, fontSize: FontSize.xs, fontWeight: '600' }}>
              {user?.role?.toUpperCase() || 'USER'}
            </Text>
          </View>
        </View>

        <View style={[styles.menuCard, { backgroundColor: colors.card }, Shadows.sm]}>
          {[
            { icon: 'settings' as const, label: 'Settings', screen: 'Settings' },
            { icon: 'heart' as const, label: 'Watchlist', screen: 'Watchlist' },
            { icon: 'notifications' as const, label: 'Notifications', screen: 'Notifications' },
            { icon: 'chatbubble-ellipses' as const, label: 'AI Chat', screen: 'Chat' },
            ...(user?.role === 'admin' ? [{ icon: 'shield' as const, label: 'Admin Panel', screen: 'Admin' }] : []),
          ].map((item, i, arr) => (
            <TouchableOpacity
              key={item.label}
              onPress={() => navigation.navigate(item.screen)}
              style={[styles.menuItem, { borderBottomColor: colors.border, borderBottomWidth: i < arr.length - 1 ? 1 : 0 }]}
            >
              <Ionicons name={item.icon} size={20} color={colors.primary} />
              <Text style={[styles.menuLabel, { color: colors.text }]}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          onPress={signOut}
          style={[styles.signOutBtn, { backgroundColor: colors.danger + '15' }]}
        >
          <Ionicons name="log-out" size={20} color={colors.danger} />
          <Text style={{ color: colors.danger, fontSize: FontSize.md, fontWeight: '600' }}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  avatarSection: { padding: Spacing.xxl, borderRadius: BorderRadius.xl, alignItems: 'center', marginBottom: Spacing.lg },
  avatar: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md },
  name: { fontSize: FontSize.xl, fontWeight: '700', marginBottom: Spacing.xs },
  roleBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: BorderRadius.sm, marginTop: Spacing.sm },
  menuCard: { borderRadius: BorderRadius.lg, marginBottom: Spacing.lg, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: Spacing.lg, gap: Spacing.md },
  menuLabel: { flex: 1, fontSize: FontSize.md, fontWeight: '500' },
  signOutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, padding: Spacing.lg, borderRadius: BorderRadius.lg },
});
