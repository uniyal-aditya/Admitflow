import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { api } from '@/api/client';
import { College } from '@/types';
import { CollegeTypeLabels, Spacing, BorderRadius, FontSize, Shadows } from '@/constants/theme';

export default function CollegeDetailScreen({ route, navigation }: any) {
  const { colors } = useTheme();
  const { id } = route.params;
  const [college, setCollege] = useState<College | null>(null);

  useEffect(() => {
    api.getCollege(id).then((r) => setCollege(r.college)).catch(() => {});
  }, [id]);

  if (!college) {
    return <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: colors.textMuted }}>Loading...</Text></View>;
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ padding: Spacing.lg }}>
        <View style={[styles.header, { backgroundColor: colors.card }, Shadows.md]}>
          <View style={[styles.avatar, { backgroundColor: colors.primary + '20' }]}>
            <Text style={{ color: colors.primary, fontSize: FontSize.xxl, fontWeight: '700' }}>
              {college.shortName.slice(0, 2)}
            </Text>
          </View>
          <Text style={[styles.name, { color: colors.text }]}>{college.name}</Text>
          <Text style={{ color: colors.textSecondary, fontSize: FontSize.sm }}>
            {college.location}, {college.district} • Est. {college.established}
          </Text>
          <View style={styles.badges}>
            <View style={[styles.badge, { backgroundColor: colors.primary + '15' }]}>
              <Text style={{ color: colors.primary, fontSize: FontSize.xs, fontWeight: '600' }}>
                {CollegeTypeLabels[college.type]}
              </Text>
            </View>
            <View style={[styles.badge, { backgroundColor: colors.secondary + '15' }]}>
              <Text style={{ color: colors.secondary, fontSize: FontSize.xs, fontWeight: '600' }}>
                {college.ownership}
              </Text>
            </View>
          </View>
        </View>

        {college.description && (
          <View style={[styles.section, { backgroundColor: colors.card }, Shadows.sm]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>About</Text>
            <Text style={{ color: colors.textSecondary, fontSize: FontSize.sm, lineHeight: 20 }}>{college.description}</Text>
          </View>
        )}

        {college.contact && (
          <View style={[styles.section, { backgroundColor: colors.card }, Shadows.sm]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Contact</Text>
            {college.contact.phone && (
              <TouchableOpacity onPress={() => Linking.openURL(`tel:${college.contact!.phone}`)} style={styles.contactRow}>
                <Ionicons name="call" size={16} color={colors.primary} />
                <Text style={{ color: colors.primary, fontSize: FontSize.sm }}>{college.contact.phone}</Text>
              </TouchableOpacity>
            )}
            {college.contact.email && (
              <TouchableOpacity onPress={() => Linking.openURL(`mailto:${college.contact!.email}`)} style={styles.contactRow}>
                <Ionicons name="mail" size={16} color={colors.primary} />
                <Text style={{ color: colors.primary, fontSize: FontSize.sm }}>{college.contact.email}</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {college.website && (
          <TouchableOpacity
            onPress={() => Linking.openURL(college.website)}
            style={[styles.linkButton, { backgroundColor: colors.primary }]}
          >
            <Ionicons name="globe" size={18} color="#fff" />
            <Text style={{ color: '#fff', fontSize: FontSize.md, fontWeight: '600' }}>Visit Website</Text>
          </TouchableOpacity>
        )}

        {college.courses?.length > 0 && (
          <View style={[styles.section, { backgroundColor: colors.card }, Shadows.sm]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Courses ({college.courses.length})</Text>
            {college.courses.map((course, i) => (
              <View key={i} style={[styles.courseCard, { borderBottomColor: colors.border }]}>
                <Text style={[styles.courseName, { color: colors.text }]}>{course.name}</Text>
                <View style={styles.courseMeta}>
                  <Text style={{ color: colors.textSecondary, fontSize: FontSize.xs }}>
                    {course.duration} • {course.seats} seats
                  </Text>
                  <Text style={{ color: colors.success, fontSize: FontSize.xs, fontWeight: '600' }}>
                    ₹{course.fees.toLocaleString()}
                  </Text>
                </View>
                {course.branches && course.branches.length > 0 && (
                  <Text style={{ color: colors.textMuted, fontSize: FontSize.xs, marginTop: 4 }}>
                    Branches: {course.branches.join(', ')}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity
          onPress={() => navigation.navigate('NoticesTab', { collegeId: college.id })}
          style={[styles.linkButton, { backgroundColor: colors.surfaceVariant }]}
        >
          <Ionicons name="document-text" size={18} color={colors.primary} />
          <Text style={{ color: colors.primary, fontSize: FontSize.md, fontWeight: '600' }}>View Notices</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { padding: Spacing.xl, borderRadius: BorderRadius.xl, alignItems: 'center', marginBottom: Spacing.lg },
  avatar: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md },
  name: { fontSize: FontSize.xl, fontWeight: '700', textAlign: 'center', marginBottom: Spacing.xs },
  badges: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: BorderRadius.sm },
  section: { padding: Spacing.lg, borderRadius: BorderRadius.lg, marginBottom: Spacing.md },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '700', marginBottom: Spacing.md },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  courseCard: { paddingVertical: Spacing.md, borderBottomWidth: 1 },
  courseName: { fontSize: FontSize.md, fontWeight: '600', marginBottom: 4 },
  courseMeta: { flexDirection: 'row', justifyContent: 'space-between' },
  linkButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, padding: Spacing.lg, borderRadius: BorderRadius.lg, marginBottom: Spacing.md },
});
