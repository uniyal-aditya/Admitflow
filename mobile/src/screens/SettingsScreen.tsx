import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Spacing, BorderRadius, FontSize, Shadows } from '@/constants/theme';

export default function SettingsScreen() {
  const { colors, mode, setMode } = useTheme();
  const { user } = useAuth();

  const themes = [
    { key: 'light' as const, label: 'Light', icon: 'sunny' as const },
    { key: 'dark' as const, label: 'Dark', icon: 'moon' as const },
    { key: 'system' as const, label: 'System', icon: 'phone-portrait' as const },
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ padding: Spacing.lg }}>
        <Text style={{ fontSize: FontSize.xxl, fontWeight: '700', color: colors.text, marginBottom: Spacing.xl }}>Settings</Text>

        <View style={[styles.section, { backgroundColor: colors.card }, Shadows.sm]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance</Text>
          <View style={styles.themeRow}>
            {themes.map((t) => (
              <TouchableOpacity
                key={t.key}
                onPress={() => setMode(t.key)}
                style={[styles.themeOption, {
                  backgroundColor: mode === t.key ? colors.primary : colors.surfaceVariant,
                  borderColor: mode === t.key ? colors.primary : colors.border,
                }]}
              >
                <Ionicons name={t.icon} size={22} color={mode === t.key ? '#fff' : colors.textSecondary} />
                <Text style={{ color: mode === t.key ? '#fff' : colors.textSecondary, fontSize: FontSize.sm, fontWeight: '600', marginTop: 4 }}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }, Shadows.sm]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>About</Text>
          <View style={styles.infoRow}>
            <Text style={{ color: colors.textSecondary, fontSize: FontSize.sm }}>Version</Text>
            <Text style={{ color: colors.text, fontSize: FontSize.sm, fontWeight: '600' }}>1.0.0</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={{ color: colors.textSecondary, fontSize: FontSize.sm }}>Developer</Text>
            <Text style={{ color: colors.text, fontSize: FontSize.sm, fontWeight: '600' }}>Aditya Uniyal</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  section: { padding: Spacing.lg, borderRadius: BorderRadius.lg, marginBottom: Spacing.md },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '700', marginBottom: Spacing.md },
  themeRow: { flexDirection: 'row', gap: Spacing.sm },
  themeOption: { flex: 1, alignItems: 'center', padding: Spacing.md, borderRadius: BorderRadius.lg, borderWidth: 2 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
});
