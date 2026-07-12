import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/api/client';
import * as WebBrowser from 'expo-web-browser';
import { Spacing, BorderRadius, FontSize, Shadows } from '@/constants/theme';

export default function LoginScreen() {
  const { colors } = useTheme();
  const { signIn } = useAuth();

  const handleGoogleLogin = async () => {
    try {
      const url = await api.loginWithGoogle();
      await WebBrowser.openBrowserAsync(url);
      await signIn();
    } catch {}
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View style={[styles.logo, { backgroundColor: colors.primary }]}>
          <Text style={{ color: '#fff', fontSize: 36, fontWeight: '800' }}>AF</Text>
        </View>
        <Text style={[styles.title, { color: colors.text }]}>AdmitFlow</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Your Uttarakhand College Admission Companion
        </Text>

        <View style={styles.features}>
          {[
            { icon: 'document-text' as const, text: 'Track admissions across 30+ colleges' },
            { icon: 'notifications' as const, text: 'Never miss a deadline' },
            { icon: 'chatbubble-ellipses' as const, text: 'AI-powered guidance' },
            { icon: 'people' as const, text: 'Community discussions' },
          ].map((f) => (
            <View key={f.text} style={styles.featureRow}>
              <Ionicons name={f.icon} size={18} color={colors.primary} />
              <Text style={{ color: colors.textSecondary, fontSize: FontSize.sm, flex: 1 }}>{f.text}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.bottom}>
        <TouchableOpacity onPress={handleGoogleLogin} style={[styles.googleBtn, { backgroundColor: colors.card }, Shadows.lg]}>
          <Ionicons name="logo-google" size={22} color="#4285F4" />
          <Text style={[styles.googleBtnText, { color: colors.text }]}>Continue with Google</Text>
        </TouchableOpacity>
        <Text style={{ color: colors.textMuted, fontSize: FontSize.xs, textAlign: 'center', marginTop: Spacing.md }}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'space-between', padding: Spacing.xl },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logo: { width: 88, height: 88, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.lg },
  title: { fontSize: FontSize.xxxl, fontWeight: '800', marginBottom: Spacing.sm },
  subtitle: { fontSize: FontSize.md, textAlign: 'center', marginBottom: Spacing.xxl },
  features: { width: '100%', gap: Spacing.md },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  bottom: { paddingBottom: 40 },
  googleBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.md, padding: Spacing.lg, borderRadius: BorderRadius.lg },
  googleBtnText: { fontSize: FontSize.lg, fontWeight: '600' },
});
