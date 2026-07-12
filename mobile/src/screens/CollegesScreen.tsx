import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { api } from '@/api/client';
import { College } from '@/types';
import { CollegeTypeLabels, Spacing, BorderRadius, FontSize, Shadows } from '@/constants/theme';

const TYPES = ['all', 'university', 'engineering', 'polytechnic', 'degree', 'medical', 'pharmacy', 'law'];

export default function CollegesScreen({ navigation }: any) {
  const { colors } = useTheme();
  const [colleges, setColleges] = useState<College[]>([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.getColleges().then((r) => setColleges(r.colleges || [])).catch(() => {});
  }, []);

  const filtered = colleges.filter((c) => {
    if (filter !== 'all' && c.type !== filter) return false;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ padding: Spacing.lg }}>
        <Text style={{ fontSize: FontSize.xxl, fontWeight: '700', color: colors.text, marginBottom: Spacing.md }}>Colleges</Text>
        <View style={[styles.searchBar, { backgroundColor: colors.surfaceVariant }]}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search colleges..."
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
          contentContainerStyle={{ gap: Spacing.sm, paddingVertical: Spacing.sm }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setFilter(item)}
              style={[styles.filterChip, {
                backgroundColor: filter === item ? colors.primary : colors.surfaceVariant,
              }]}
            >
              <Text style={{ color: filter === item ? '#fff' : colors.text, fontSize: FontSize.sm, fontWeight: '600' }}>
                {item === 'all' ? 'All' : CollegeTypeLabels[item] || item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(c) => c.id}
        contentContainerStyle={{ paddingHorizontal: Spacing.lg, paddingBottom: 100 }}
        renderItem={({ item: college }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate('CollegeDetail', { id: college.id })}
            style={[styles.card, { backgroundColor: colors.card }, Shadows.md]}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.avatar, { backgroundColor: colors.primary + '20' }]}>
                <Text style={{ color: colors.primary, fontSize: FontSize.lg, fontWeight: '700' }}>
                  {college.shortName.slice(0, 2)}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>{college.name}</Text>
                <Text style={{ color: colors.textSecondary, fontSize: FontSize.xs }}>
                  {college.location} • {college.ownership}
                </Text>
              </View>
            </View>
            <View style={styles.cardFooter}>
              <View style={[styles.badge, { backgroundColor: colors.primary + '15' }]}>
                <Text style={{ color: colors.primary, fontSize: FontSize.xs, fontWeight: '600' }}>
                  {CollegeTypeLabels[college.type]}
                </Text>
              </View>
              <Text style={{ color: colors.textMuted, fontSize: FontSize.xs }}>
                {college.courses?.length || 0} programs
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={{ color: colors.textMuted, textAlign: 'center', padding: 60 }}>No colleges found</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  searchBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm + 2, borderRadius: BorderRadius.md, marginBottom: Spacing.sm, gap: Spacing.sm },
  searchInput: { flex: 1, fontSize: FontSize.md },
  filterChip: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs + 2, borderRadius: BorderRadius.full },
  card: { padding: Spacing.lg, borderRadius: BorderRadius.lg, marginBottom: Spacing.md },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.md },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: FontSize.md, fontWeight: '600' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: BorderRadius.sm },
});
