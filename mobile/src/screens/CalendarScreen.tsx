import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { api } from '@/api/client';
import { Notice } from '@/types';
import { NoticeTypeLabels, NoticeTypeColors, Spacing, BorderRadius, FontSize, Shadows } from '@/constants/theme';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarScreen({ navigation }: any) {
  const { colors } = useTheme();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    api.getNotices().then((r) => setNotices(r.notices || [])).catch(() => {});
  }, []);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const deadlinesByDate: Record<string, Notice[]> = {};
  notices.forEach((n) => {
    if (n.lastDate) {
      const d = n.lastDate;
      if (!deadlinesByDate[d]) deadlinesByDate[d] = [];
      deadlinesByDate[d].push(n);
    }
    n.deadlines?.forEach((dl) => {
      if (!deadlinesByDate[dl.date]) deadlinesByDate[dl.date] = [];
      deadlinesByDate[dl.date].push(n);
    });
  });

  const selectedKey = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
  const selectedNotices = deadlinesByDate[selectedKey] || [];

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ padding: Spacing.lg }}>
        <Text style={{ fontSize: FontSize.xxl, fontWeight: '700', color: colors.text, marginBottom: Spacing.lg }}>Calendar</Text>

        <View style={[styles.calendar, { backgroundColor: colors.card }, Shadows.md]}>
          <View style={styles.calHeader}>
            <TouchableOpacity onPress={() => setCurrentMonth(new Date(year, month - 1))}>
              <Ionicons name="chevron-back" size={22} color={colors.primary} />
            </TouchableOpacity>
            <Text style={[styles.calTitle, { color: colors.text }]}>{MONTHS[month]} {year}</Text>
            <TouchableOpacity onPress={() => setCurrentMonth(new Date(year, month + 1))}>
              <Ionicons name="chevron-forward" size={22} color={colors.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.daysHeader}>
            {DAYS.map((d) => (
              <Text key={d} style={[styles.dayLabel, { color: colors.textMuted }]}>{d}</Text>
            ))}
          </View>
          <View style={styles.daysGrid}>
            {days.map((day, i) => {
              if (day === null) return <View key={`empty-${i}`} style={styles.dayCell} />;
              const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
              const isSelected = selectedDate.getDate() === day && selectedDate.getMonth() === month;
              const hasEvents = deadlinesByDate[dateKey]?.length > 0;

              return (
                <TouchableOpacity
                  key={day}
                  onPress={() => setSelectedDate(new Date(year, month, day))}
                  style={[styles.dayCell]}
                >
                  <View style={[styles.dayNumber, {
                    backgroundColor: isSelected ? colors.primary : isToday ? colors.primary + '20' : 'transparent',
                  }]}>
                    <Text style={{
                      color: isSelected ? '#fff' : isToday ? colors.primary : colors.text,
                      fontSize: FontSize.sm, fontWeight: isToday || isSelected ? '700' : '400',
                    }}>{day}</Text>
                  </View>
                  {hasEvents && <View style={[styles.eventDot, { backgroundColor: colors.danger }]} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.eventsSection}>
          <Text style={[styles.eventsTitle, { color: colors.text }]}>
            {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </Text>
          {selectedNotices.length > 0 ? (
            selectedNotices.map((notice) => (
              <TouchableOpacity
                key={notice.id}
                onPress={() => navigation.navigate('NoticeDetail', { id: notice.id })}
                style={[styles.eventCard, { backgroundColor: colors.card }, Shadows.sm]}
              >
                <View style={[styles.eventTypeDot, { backgroundColor: NoticeTypeColors[notice.type] }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.eventTitle, { color: colors.text }]} numberOfLines={1}>{notice.title}</Text>
                  <Text style={{ color: colors.textMuted, fontSize: FontSize.xs }}>
                    {NoticeTypeLabels[notice.type]} • {notice.status}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
              </TouchableOpacity>
            ))
          ) : (
            <Text style={{ color: colors.textMuted, textAlign: 'center', padding: 40 }}>No deadlines on this date</Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  calendar: { borderRadius: BorderRadius.xl, padding: Spacing.lg, marginBottom: Spacing.xl },
  calHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
  calTitle: { fontSize: FontSize.lg, fontWeight: '700' },
  daysHeader: { flexDirection: 'row', marginBottom: Spacing.sm },
  dayLabel: { flex: 1, textAlign: 'center', fontSize: FontSize.xs, fontWeight: '600' },
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: '14.28%', alignItems: 'center', paddingVertical: 4 },
  dayNumber: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  eventDot: { width: 5, height: 5, borderRadius: 2.5, marginTop: 2 },
  eventsSection: { marginBottom: Spacing.xl },
  eventsTitle: { fontSize: FontSize.lg, fontWeight: '700', marginBottom: Spacing.md },
  eventCard: { flexDirection: 'row', alignItems: 'center', padding: Spacing.lg, borderRadius: BorderRadius.lg, marginBottom: Spacing.sm, gap: Spacing.md },
  eventTypeDot: { width: 8, height: 8, borderRadius: 4 },
  eventTitle: { fontSize: FontSize.md, fontWeight: '600' },
});
