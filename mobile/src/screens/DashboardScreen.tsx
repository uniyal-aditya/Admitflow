import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/api/client';
import { DashboardStats, Notice, College } from '@/types';
import { NoticeTypeLabels, NoticeTypeColors, Spacing, BorderRadius, FontSize, Shadows } from '@/constants/theme';

export default function DashboardScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [statsRes, noticesRes, collegesRes] = await Promise.allSettled([
        api.get<{ stats: DashboardStats }>('/api/admin/stats'),
        api.get<{ notices: any[] }>('/api/admin/notices'),
        api.get<{ colleges: any[] }>('/api/admin/colleges'),
      ]);
      if (statsRes.status === 'fulfilled') setStats(statsRes.value.stats);
      if (noticesRes.status === 'fulfilled') setNotices(noticesRes.value.notices.slice(0, 10));
      if (collegesRes.status === 'fulfilled') setColleges(collegesRes.value.colleges);
    } catch {}
  };

  useEffect(() => { loadData(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      <View style={{ padding: Spacing.lg }}>
        <View style={{ marginBottom: Spacing.xl }}>
          <Text style={{ fontSize: FontSize.sm, color: colors.textSecondary }}>{getGreeting()}</Text>
          <Text style={{ fontSize: FontSize.xxl, fontWeight: '700', color: colors.text }}>
            {user?.name || 'Student'}
          </Text>
        </View>

        {stats && (
          <View style={styles.statsGrid}>
            {[
              { label: 'Active Notices', value: stats.activeNotices, icon: 'document-text', color: colors.primary },
              { label: 'Colleges', value: stats.totalColleges, icon: 'school', color: colors.secondary },
              { label: 'This Week', value: stats.noticesThisWeek, icon: 'trending-up', color: colors.success },
              { label: 'Deadlines', value: stats.upcomingDeadlines, icon: 'time', color: colors.warning },
            ].map((s) => (
              <View key={s.label} style={[styles.statCard, { backgroundColor: colors.card }, Shadows.md]}>
                <Ionicons name={s.icon as any} size={20} color={s.color} />
                <Text style={[styles.statValue, { color: colors.text }]}>{s.value}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{s.label}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Latest Notices</Text>
            <TouchableOpacity onPress={() => navigation.navigate('NoticesTab')}>
              <Text style={{ color: colors.primary, fontSize: FontSize.sm }}>See All</Text>
            </TouchableOpacity>
          </View>
          {notices.map((notice) => (
            <TouchableOpacity
              key={notice.id}
              onPress={() => navigation.navigate('NoticeDetail', { id: notice.id })}
              style={[styles.noticeCard, { backgroundColor: colors.card }, Shadows.sm]}
            >
              <View style={[styles.noticeTypeBadge, { backgroundColor: NoticeTypeColors[notice.type] + '20' }]}>
                <Text style={[styles.noticeTypeText, { color: NoticeTypeColors[notice.type] }]}>
                  {NoticeTypeLabels[notice.type]}
                </Text>
              </View>
              <Text style={[styles.noticeTitle, { color: colors.text }]} numberOfLines={2}>{notice.title}</Text>
              {notice.lastDate && (
                <View style={styles.deadlineRow}>
                  <Ionicons name="time-outline" size={12} color={colors.textMuted} />
                  <Text style={[styles.deadlineText, { color: colors.textMuted }]}>Due: {notice.lastDate}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
          {notices.length === 0 && (
            <Text style={{ color: colors.textMuted, textAlign: 'center', padding: 40 }}>No notices yet</Text>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
          </View>
          <View style={styles.actionsGrid}>
            {[
              { icon: 'search' as const, label: 'Search', screen: 'Search' },
              { icon: 'heart' as const, label: 'Watchlist', screen: 'Watchlist' },
              { icon: 'chatbubble-ellipses' as const, label: 'AI Chat', screen: 'Chat' },
              { icon: 'calendar' as const, label: 'Calendar', screen: 'Calendar' },
            ].map((a) => (
              <TouchableOpacity
                key={a.label}
                onPress={() => navigation.navigate(a.screen)}
                style={[styles.actionCard, { backgroundColor: colors.surfaceVariant }]}
              >
                <Ionicons name={a.icon} size={24} color={colors.primary} />
                <Text style={[styles.actionLabel, { color: colors.text }]}>{a.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.xl },
  statCard: { width: '48%', flexGrow: 1, padding: Spacing.lg, borderRadius: BorderRadius.lg, alignItems: 'center', gap: 4 },
  statValue: { fontSize: FontSize.xxl, fontWeight: '700' },
  statLabel: { fontSize: FontSize.xs },
  section: { marginBottom: Spacing.xl },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '700' },
  noticeCard: { padding: Spacing.lg, borderRadius: BorderRadius.lg, marginBottom: Spacing.sm },
  noticeTypeBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: BorderRadius.sm, marginBottom: Spacing.sm },
  noticeTypeText: { fontSize: FontSize.xs, fontWeight: '600' },
  noticeTitle: { fontSize: FontSize.md, fontWeight: '600', marginBottom: Spacing.xs },
  deadlineRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  deadlineText: { fontSize: FontSize.xs },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  actionCard: { width: '48%', flexGrow: 1, padding: Spacing.lg, borderRadius: BorderRadius.lg, alignItems: 'center', gap: Spacing.sm },
  actionLabel: { fontSize: FontSize.sm, fontWeight: '600' },
});
