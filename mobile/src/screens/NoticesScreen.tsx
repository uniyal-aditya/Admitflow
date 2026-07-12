import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { api } from '@/api/client';
import { Notice } from '@/types';
import { NoticeTypeLabels, NoticeTypeColors, Spacing, BorderRadius, FontSize, Shadows } from '@/constants/theme';

const TYPES = ['all', 'admission', 'registration', 'counselling', 'spot_round', 'vacant_seat', 'merit_list'];
const STATUSES = ['all', 'active', 'upcoming', 'expired'];

export default function NoticesScreen({ navigation, route }: any) {
  const { colors } = useTheme();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const preselectedCollege = route?.params?.collegeId;

  useEffect(() => {
    api.getNotices().then((r) => setNotices(r.notices || [])).catch(() => {});
  }, []);

  const filtered = notices.filter((n) => {
    if (typeFilter !== 'all' && n.type !== typeFilter) return false;
    if (statusFilter !== 'all' && n.status !== statusFilter) return false;
    if (preselectedCollege && n.collegeId !== preselectedCollege) return false;
    if (search && !n.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ padding: Spacing.lg }}>
        <Text style={{ fontSize: FontSize.xxl, fontWeight: '700', color: colors.text, marginBottom: Spacing.md }}>Notices</Text>
        <View style={[styles.searchBar, { backgroundColor: colors.surfaceVariant }]}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search notices..."
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <FlatList
          horizontal
          data={TYPES}
          keyExtractor={(i) => i}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: Spacing.sm, paddingBottom: Spacing.sm }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setTypeFilter(item)}
              style={[styles.filterChip, {
                backgroundColor: typeFilter === item ? colors.primary : colors.surfaceVariant,
              }]}
            >
              <Text style={{ color: typeFilter === item ? '#fff' : colors.text, fontSize: FontSize.xs, fontWeight: '600' }}>
                {item === 'all' ? 'All' : NoticeTypeLabels[item] || item}
              </Text>
            </TouchableOpacity>
          )}
        />
        <FlatList
          horizontal
          data={STATUSES}
          keyExtractor={(i) => i}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: Spacing.sm }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setStatusFilter(item)}
              style={[styles.filterChip, {
                backgroundColor: statusFilter === item ? colors.secondary : colors.surfaceVariant,
              }]}
            >
              <Text style={{ color: statusFilter === item ? '#fff' : colors.text, fontSize: FontSize.xs, fontWeight: '600' }}>
                {item === 'all' ? 'All' : item.charAt(0).toUpperCase() + item.slice(1)}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(n) => n.id}
        contentContainerStyle={{ paddingHorizontal: Spacing.lg, paddingBottom: 100 }}
        renderItem={({ item: notice }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate('NoticeDetail', { id: notice.id })}
            style={[styles.card, { backgroundColor: colors.card }, Shadows.sm]}
          >
            <View style={styles.cardTop}>
              <View style={[styles.typeBadge, { backgroundColor: NoticeTypeColors[notice.type] + '20' }]}>
                <Text style={{ color: NoticeTypeColors[notice.type], fontSize: FontSize.xs, fontWeight: '600' }}>
                  {NoticeTypeLabels[notice.type]}
                </Text>
              </View>
              <View style={[styles.statusBadge, {
                backgroundColor: notice.status === 'active' ? '#10b98120' : notice.status === 'upcoming' ? '#f59e0b20' : '#ef444420',
              }]}>
                <Text style={{
                  color: notice.status === 'active' ? '#10b981' : notice.status === 'upcoming' ? '#f59e0b' : '#ef4444',
                  fontSize: FontSize.xs, fontWeight: '600',
                }}>
                  {notice.status}
                </Text>
              </View>
            </View>
            <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={2}>{notice.title}</Text>
            {notice.lastDate && (
              <View style={styles.deadlineRow}>
                <Ionicons name="time-outline" size={12} color={colors.textMuted} />
                <Text style={{ color: colors.textMuted, fontSize: FontSize.xs }}>Due: {notice.lastDate}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={{ color: colors.textMuted, textAlign: 'center', padding: 60 }}>No notices found</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  searchBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm + 2, borderRadius: BorderRadius.md, marginBottom: Spacing.sm, gap: Spacing.sm },
  searchInput: { flex: 1, fontSize: FontSize.md },
  filterChip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: BorderRadius.full },
  card: { padding: Spacing.lg, borderRadius: BorderRadius.lg, marginBottom: Spacing.sm },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm },
  typeBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: BorderRadius.sm },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: BorderRadius.sm },
  cardTitle: { fontSize: FontSize.md, fontWeight: '600', marginBottom: Spacing.xs },
  deadlineRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});
