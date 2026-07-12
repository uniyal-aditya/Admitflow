import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { api } from '@/api/client';
import { Spacing, BorderRadius, FontSize, Shadows } from '@/constants/theme';

export default function AdminScreen() {
  const { colors } = useTheme();
  const [stats, setStats] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'colleges' | 'notices' | 'users'>('overview');
  const [colleges, setColleges] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    api.getAdminStats().then((r) => setStats(r.stats)).catch(() => {});
    api.getAdminColleges().then((r) => setColleges(r.colleges || [])).catch(() => {});
    api.getAdminNotices().then((r) => setNotices(r.notices || [])).catch(() => {});
    api.getAdminUsers().then((r) => setUsers(r.users || [])).catch(() => {});
  }, []);

  const tabs = [
    { key: 'overview' as const, label: 'Overview', icon: 'grid' as const },
    { key: 'colleges' as const, label: 'Colleges', icon: 'school' as const },
    { key: 'notices' as const, label: 'Notices', icon: 'document-text' as const },
    { key: 'users' as const, label: 'Users', icon: 'people' as const },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.tabBar}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            style={[styles.tab, { backgroundColor: activeTab === tab.key ? colors.primary : 'transparent' }]}
          >
            <Ionicons name={tab.icon} size={16} color={activeTab === tab.key ? '#fff' : colors.textSecondary} />
            <Text style={{ color: activeTab === tab.key ? '#fff' : colors.textSecondary, fontSize: FontSize.xs, fontWeight: '600' }}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: Spacing.lg }}>
        {activeTab === 'overview' && stats && (
          <View style={styles.statsGrid}>
            {[
              { label: 'Colleges', value: stats.totalColleges, icon: 'school', color: colors.primary },
              { label: 'Notices', value: stats.totalNotices, icon: 'document-text', color: colors.secondary },
              { label: 'Active', value: stats.activeNotices, icon: 'checkmark-circle', color: colors.success },
              { label: 'Users', value: stats.totalUsers || 0, icon: 'people', color: colors.accent },
            ].map((s) => (
              <View key={s.label} style={[styles.statCard, { backgroundColor: colors.card }, Shadows.md]}>
                <Ionicons name={s.icon as any} size={20} color={s.color} />
                <Text style={{ fontSize: FontSize.xxl, fontWeight: '700', color: colors.text }}>{s.value}</Text>
                <Text style={{ fontSize: FontSize.xs, color: colors.textSecondary }}>{s.label}</Text>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'colleges' && (
          colleges.map((c) => (
            <View key={c.id} style={[styles.listItem, { backgroundColor: colors.card }, Shadows.sm]}>
              <Text style={[styles.listTitle, { color: colors.text }]} numberOfLines={1}>{c.name}</Text>
              <Text style={{ color: colors.textSecondary, fontSize: FontSize.xs }}>{c.type} • {c.district}</Text>
            </View>
          ))
        )}

        {activeTab === 'notices' && (
          notices.map((n) => (
            <View key={n.id} style={[styles.listItem, { backgroundColor: colors.card }, Shadows.sm]}>
              <Text style={[styles.listTitle, { color: colors.text }]} numberOfLines={1}>{n.title}</Text>
              <Text style={{ color: colors.textSecondary, fontSize: FontSize.xs }}>{n.type} • {n.status}</Text>
            </View>
          ))
        )}

        {activeTab === 'users' && (
          users.map((u) => (
            <View key={u.id} style={[styles.listItem, { backgroundColor: colors.card }, Shadows.sm]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
                <View style={[styles.userAvatar, { backgroundColor: colors.primary + '20' }]}>
                  <Text style={{ color: colors.primary, fontSize: FontSize.sm, fontWeight: '700' }}>
                    {(u.name || 'U').slice(0, 1).toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.listTitle, { color: colors.text }]} numberOfLines={1}>{u.name || 'Anonymous'}</Text>
                  <Text style={{ color: colors.textSecondary, fontSize: FontSize.xs }}>{u.email} • {u.role}</Text>
                </View>
                {u.isBanned && (
                  <View style={[styles.bannedBadge, { backgroundColor: colors.danger + '20' }]}>
                    <Text style={{ color: colors.danger, fontSize: FontSize.xs, fontWeight: '600' }}>Banned</Text>
                  </View>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: { flexDirection: 'row', padding: Spacing.sm, gap: Spacing.xs, backgroundColor: 'rgba(0,0,0,0.02)' },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: Spacing.sm + 2, borderRadius: BorderRadius.md },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  statCard: { width: '48%', flexGrow: 1, padding: Spacing.lg, borderRadius: BorderRadius.lg, alignItems: 'center', gap: 4 },
  listItem: { padding: Spacing.lg, borderRadius: BorderRadius.lg, marginBottom: Spacing.sm },
  listTitle: { fontSize: FontSize.md, fontWeight: '600' },
  userAvatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  bannedBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: BorderRadius.sm },
});
