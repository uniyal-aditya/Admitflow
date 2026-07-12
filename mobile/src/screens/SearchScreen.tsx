import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { api } from '@/api/client';
import { Notice, College } from '@/types';
import { NoticeTypeLabels, NoticeTypeColors, CollegeTypeLabels, Spacing, BorderRadius, FontSize, Shadows } from '@/constants/theme';

export default function SearchScreen({ navigation }: any) {
  const { colors } = useTheme();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ notices: Notice[]; colleges: College[] } | null>(null);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setResults(null); return; }
    setLoading(true);
    try {
      const data = await api.getSearchResults(q);
      setResults(data);
    } catch {}
    setLoading(false);
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ padding: Spacing.lg }}>
        <Text style={{ fontSize: FontSize.xxl, fontWeight: '700', color: colors.text, marginBottom: Spacing.md }}>Search</Text>
        <View style={[styles.searchBar, { backgroundColor: colors.card }, Shadows.md]}>
          <Ionicons name="search" size={20} color={colors.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search notices, colleges..."
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={(t) => { setQuery(t); if (t.length >= 2) search(t); else setResults(null); }}
            returnKeyType="search"
            onSubmitEditing={() => search(query)}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => { setQuery(''); setResults(null); }}>
              <Ionicons name="close-circle" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {results && (
        <FlatList
          data={[
            ...(results.colleges || []).map((c) => ({ type: 'college' as const, data: c })),
            ...(results.notices || []).map((n) => ({ type: 'notice' as const, data: n })),
          ]}
          keyExtractor={(item) => `${item.type}-${(item.data as any).id}`}
          contentContainerStyle={{ paddingHorizontal: Spacing.lg, paddingBottom: 100 }}
          ListHeaderComponent={
            <Text style={{ color: colors.textMuted, fontSize: FontSize.sm, marginBottom: Spacing.md }}>
              {(results.colleges?.length || 0) + (results.notices?.length || 0)} results
            </Text>
          }
          renderItem={({ item }) => {
            if (item.type === 'college') {
              const c = item.data as College;
              return (
                <TouchableOpacity
                  onPress={() => navigation.navigate('CollegeDetail', { id: c.id })}
                  style={[styles.resultCard, { backgroundColor: colors.card }, Shadows.sm]}
                >
                  <View style={[styles.iconBox, { backgroundColor: colors.primary + '20' }]}>
                    <Ionicons name="school" size={20} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.resultTitle, { color: colors.text }]} numberOfLines={1}>{c.name}</Text>
                    <Text style={{ color: colors.textSecondary, fontSize: FontSize.xs }}>
                      {CollegeTypeLabels[c.type]} • {c.location}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            }
            const n = item.data as Notice;
            return (
              <TouchableOpacity
                onPress={() => navigation.navigate('NoticeDetail', { id: n.id })}
                style={[styles.resultCard, { backgroundColor: colors.card }, Shadows.sm]}
              >
                <View style={[styles.iconBox, { backgroundColor: NoticeTypeColors[n.type] + '20' }]}>
                  <Ionicons name="document-text" size={20} color={NoticeTypeColors[n.type]} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.resultTitle, { color: colors.text }]} numberOfLines={1}>{n.title}</Text>
                  <Text style={{ color: colors.textSecondary, fontSize: FontSize.xs }}>
                    {NoticeTypeLabels[n.type]} • {n.status}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <Text style={{ color: colors.textMuted, textAlign: 'center', padding: 60 }}>
              {loading ? 'Searching...' : 'No results found'}
            </Text>
          }
        />
      )}

      {!results && (
        <View style={{ alignItems: 'center', paddingTop: 100 }}>
          <Ionicons name="search-outline" size={64} color={colors.textMuted} />
          <Text style={{ color: colors.textMuted, fontSize: FontSize.md, marginTop: Spacing.lg }}>
            Type to search notices and colleges
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  searchBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderRadius: BorderRadius.lg, gap: Spacing.sm },
  searchInput: { flex: 1, fontSize: FontSize.md },
  resultCard: { flexDirection: 'row', alignItems: 'center', padding: Spacing.lg, borderRadius: BorderRadius.lg, marginBottom: Spacing.sm, gap: Spacing.md },
  iconBox: { width: 40, height: 40, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center' },
  resultTitle: { fontSize: FontSize.md, fontWeight: '600' },
});
