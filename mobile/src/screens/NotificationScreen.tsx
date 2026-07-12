import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { api } from '@/api/client';
import { NotificationItem } from '@/types';
import { NoticeTypeLabels, NoticeTypeColors, Spacing, BorderRadius, FontSize, Shadows } from '@/constants/theme';

export default function NotificationScreen() {
  const { colors } = useTheme();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    api.getNotifications().then((r) => setNotifications(r.notifications || [])).catch(() => {});
  }, []);

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        data={notifications}
        keyExtractor={(n) => n.id}
        contentContainerStyle={{ padding: Spacing.lg, paddingBottom: 100 }}
        renderItem={({ item: notif }) => (
          <View style={[styles.card, { backgroundColor: notif.read ? colors.card : colors.primary + '08' }, Shadows.sm]}>
            <View style={[styles.dot, { backgroundColor: NoticeTypeColors[notif.type] || colors.primary }]} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>{notif.title}</Text>
              <Text style={{ color: colors.textSecondary, fontSize: FontSize.xs }} numberOfLines={2}>{notif.message}</Text>
              <Text style={{ color: colors.textMuted, fontSize: FontSize.xs, marginTop: 4 }}>{timeAgo(notif.createdAt)}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingTop: 80 }}>
            <Ionicons name="notifications-outline" size={64} color={colors.textMuted} />
            <Text style={{ color: colors.textMuted, fontSize: FontSize.md, marginTop: Spacing.lg }}>No notifications yet</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', padding: Spacing.lg, borderRadius: BorderRadius.lg, marginBottom: Spacing.sm, gap: Spacing.md },
  dot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
  title: { fontSize: FontSize.md, fontWeight: '600', marginBottom: 2 },
});
