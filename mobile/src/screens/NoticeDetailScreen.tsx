import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { api } from '@/api/client';
import { Notice } from '@/types';
import { NoticeTypeLabels, NoticeTypeColors, Spacing, BorderRadius, FontSize, Shadows } from '@/constants/theme';

export default function NoticeDetailScreen({ route }: any) {
  const { colors } = useTheme();
  const { id } = route.params;
  const [notice, setNotice] = useState<Notice | null>(null);

  useEffect(() => {
    api.getNotice(id).then((r) => setNotice(r.notice)).catch(() => {});
  }, [id]);

  if (!notice) {
    return <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: colors.textMuted }}>Loading...</Text></View>;
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ padding: Spacing.lg }}>
        <View style={[styles.header, { backgroundColor: colors.card }, Shadows.md]}>
          <View style={[styles.typeBadge, { backgroundColor: NoticeTypeColors[notice.type] + '20' }]}>
            <Text style={{ color: NoticeTypeColors[notice.type], fontSize: FontSize.sm, fontWeight: '600' }}>
              {NoticeTypeLabels[notice.type]}
            </Text>
          </View>
          <Text style={[styles.title, { color: colors.text }]}>{notice.title}</Text>
          <View style={styles.metaRow}>
            <View style={[styles.statusBadge, {
              backgroundColor: notice.status === 'active' ? '#10b98120' : notice.status === 'upcoming' ? '#f59e0b20' : '#ef444420',
            }]}>
              <Text style={{
                color: notice.status === 'active' ? '#10b981' : notice.status === 'upcoming' ? '#f59e0b' : '#ef4444',
                fontSize: FontSize.xs, fontWeight: '600', textTransform: 'capitalize',
              }}>{notice.status}</Text>
            </View>
            <Text style={{ color: colors.textMuted, fontSize: FontSize.xs }}>Published: {notice.publishedDate}</Text>
          </View>
        </View>

        {notice.summary && (
          <View style={[styles.section, { backgroundColor: colors.card }, Shadows.sm]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Summary</Text>
            <Text style={{ color: colors.textSecondary, fontSize: FontSize.sm, lineHeight: 20 }}>{notice.summary}</Text>
          </View>
        )}

        {notice.aiSummary && (
          <View style={[styles.section, { backgroundColor: colors.primary + '08' }, Shadows.sm]}>
            <View style={styles.aiHeader}>
              <Ionicons name="sparkles" size={16} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.primary, marginBottom: 0 }]}>AI Summary</Text>
            </View>
            <Text style={{ color: colors.textSecondary, fontSize: FontSize.sm, lineHeight: 20, marginTop: Spacing.sm }}>{notice.aiSummary}</Text>
          </View>
        )}

        {notice.highlights.length > 0 && (
          <View style={[styles.section, { backgroundColor: colors.card }, Shadows.sm]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Highlights</Text>
            {notice.highlights.map((h, i) => (
              <View key={i} style={styles.highlightRow}>
                <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                <Text style={{ color: colors.textSecondary, fontSize: FontSize.sm, flex: 1 }}>{h}</Text>
              </View>
            ))}
          </View>
        )}

        {notice.deadlines.length > 0 && (
          <View style={[styles.section, { backgroundColor: colors.card }, Shadows.sm]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Deadlines</Text>
            {notice.deadlines.map((d, i) => (
              <View key={i} style={styles.deadlineRow}>
                <Ionicons name="time-outline" size={16} color={colors.warning} />
                <Text style={{ color: colors.text, fontSize: FontSize.sm, flex: 1 }}>{d.label}</Text>
                <Text style={{ color: colors.danger, fontSize: FontSize.sm, fontWeight: '600' }}>{d.date}</Text>
              </View>
            ))}
          </View>
        )}

        {notice.documentsRequired.length > 0 && (
          <View style={[styles.section, { backgroundColor: colors.card }, Shadows.sm]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Documents Required</Text>
            {notice.documentsRequired.map((doc, i) => (
              <View key={i} style={styles.highlightRow}>
                <Ionicons name="document-outline" size={14} color={colors.info} />
                <Text style={{ color: colors.textSecondary, fontSize: FontSize.sm }}>{doc}</Text>
              </View>
            ))}
          </View>
        )}

        {notice.eligibility && (
          <View style={[styles.section, { backgroundColor: colors.card }, Shadows.sm]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Eligibility</Text>
            <Text style={{ color: colors.textSecondary, fontSize: FontSize.sm, lineHeight: 20 }}>{notice.eligibility}</Text>
          </View>
        )}

        {notice.pdfUrl && (
          <TouchableOpacity
            onPress={() => Linking.openURL(notice.pdfUrl)}
            style={[styles.linkButton, { backgroundColor: colors.danger }]}
          >
            <Ionicons name="document-text" size={18} color="#fff" />
            <Text style={{ color: '#fff', fontSize: FontSize.md, fontWeight: '600' }}>Download PDF</Text>
          </TouchableOpacity>
        )}

        {notice.sourceUrl && (
          <TouchableOpacity
            onPress={() => Linking.openURL(notice.sourceUrl)}
            style={[styles.linkButton, { backgroundColor: colors.primary }]}
          >
            <Ionicons name="open-outline" size={18} color="#fff" />
            <Text style={{ color: '#fff', fontSize: FontSize.md, fontWeight: '600' }}>View Source</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { padding: Spacing.xl, borderRadius: BorderRadius.xl, marginBottom: Spacing.lg },
  typeBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: BorderRadius.sm, marginBottom: Spacing.md },
  title: { fontSize: FontSize.xl, fontWeight: '700', marginBottom: Spacing.sm },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: BorderRadius.sm },
  section: { padding: Spacing.lg, borderRadius: BorderRadius.lg, marginBottom: Spacing.md },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '700', marginBottom: Spacing.md },
  aiHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  highlightRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, marginBottom: Spacing.sm },
  deadlineRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  linkButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, padding: Spacing.lg, borderRadius: BorderRadius.lg, marginBottom: Spacing.md },
});
