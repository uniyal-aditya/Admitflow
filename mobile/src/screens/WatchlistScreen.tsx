import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { api } from '@/api/client';
import { College } from '@/types';
import { CollegeTypeLabels, Spacing, BorderRadius, FontSize, Shadows } from '@/constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function WatchlistScreen({ navigation }: any) {
  const { colors } = useTheme();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);

  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem('favorites');
      if (stored) setFavorites(JSON.parse(stored));
      try {
        const data = await api.getColleges();
        setColleges(data.colleges || []);
      } catch {}
    })();
  }, []);

  const toggleFavorite = async (id: string) => {
    const next = favorites.includes(id) ? favorites.filter((f) => f !== id) : [...favorites, id];
    setFavorites(next);
    await AsyncStorage.setItem('favorites', JSON.stringify(next));
  };

  const favColleges = colleges.filter((c) => favorites.includes(c.id));

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ padding: Spacing.lg }}>
        <Text style={{ fontSize: FontSize.xxl, fontWeight: '700', color: colors.text, marginBottom: Spacing.md }}>Watchlist</Text>
        <Text style={{ color: colors.textSecondary, fontSize: FontSize.sm, marginBottom: Spacing.md }}>
          {favColleges.length} colleges saved
        </Text>
      </View>
      <FlatList
        data={favColleges}
        keyExtractor={(c) => c.id}
        contentContainerStyle={{ paddingHorizontal: Spacing.lg, paddingBottom: 100 }}
        renderItem={({ item: college }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate('CollegeDetail', { id: college.id })}
            style={[styles.card, { backgroundColor: colors.card }, Shadows.md]}
          >
            <View style={styles.cardContent}>
              <View style={[styles.avatar, { backgroundColor: colors.primary + '20' }]}>
                <Text style={{ color: colors.primary, fontSize: FontSize.lg, fontWeight: '700' }}>
                  {college.shortName.slice(0, 2)}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>{college.name}</Text>
                <Text style={{ color: colors.textSecondary, fontSize: FontSize.xs }}>
                  {CollegeTypeLabels[college.type]} • {college.location}
                </Text>
              </View>
              <TouchableOpacity onPress={() => toggleFavorite(college.id)}>
                <Ionicons name="heart" size={22} color={colors.danger} />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingTop: 60 }}>
            <Ionicons name="heart-outline" size={64} color={colors.textMuted} />
            <Text style={{ color: colors.textMuted, fontSize: FontSize.md, marginTop: Spacing.lg }}>
              No colleges in your watchlist
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('CollegesTab')}
              style={[styles.browseBtn, { backgroundColor: colors.primary }]}
            >
              <Text style={{ color: '#fff', fontWeight: '600' }}>Browse Colleges</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: Spacing.lg, borderRadius: BorderRadius.lg, marginBottom: Spacing.sm },
  cardContent: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: FontSize.md, fontWeight: '600' },
  browseBtn: { marginTop: Spacing.lg, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, borderRadius: BorderRadius.md },
});
