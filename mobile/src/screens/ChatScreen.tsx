import React, { useState, useRef } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { api } from '@/api/client';
import { Spacing, BorderRadius, FontSize, Shadows } from '@/constants/theme';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatScreen() {
  const { colors } = useTheme();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hi! I\'m AdmitFlow AI. Ask me anything about Uttarakhand college admissions!' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: 'user', content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await api.chat(userMsg.content);
      setMessages((prev) => [...prev, { role: 'assistant', content: response }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }]);
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(_, i) => String(i)}
        contentContainerStyle={{ padding: Spacing.lg, paddingBottom: Spacing.md }}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        renderItem={({ item: msg }) => (
          <View style={[styles.bubble, {
            alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
            backgroundColor: msg.role === 'user' ? colors.primary : colors.card,
          }, msg.role === 'user' ? {} : Shadows.sm]}>
            <Text style={{
              color: msg.role === 'user' ? '#fff' : colors.text,
              fontSize: FontSize.sm,
              lineHeight: 20,
            }}>{msg.content}</Text>
          </View>
        )}
        ListFooterComponent={loading ? (
          <View style={[styles.bubble, { backgroundColor: colors.card }, Shadows.sm]}>
            <Text style={{ color: colors.textMuted, fontSize: FontSize.sm }}>Thinking...</Text>
          </View>
        ) : null}
      />
      <View style={[styles.inputBar, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <TextInput
          style={[styles.input, { color: colors.text, backgroundColor: colors.surfaceVariant }]}
          placeholder="Ask about admissions..."
          placeholderTextColor={colors.textMuted}
          value={input}
          onChangeText={setInput}
          multiline
          maxLength={2000}
        />
        <TouchableOpacity
          onPress={sendMessage}
          disabled={!input.trim() || loading}
          style={[styles.sendBtn, { backgroundColor: input.trim() ? colors.primary : colors.surfaceVariant }]}
        >
          <Ionicons name="send" size={18} color={input.trim() ? '#fff' : colors.textMuted} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  bubble: { maxWidth: '80%', padding: Spacing.md, borderRadius: BorderRadius.lg, marginBottom: Spacing.sm },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', padding: Spacing.sm, gap: Spacing.sm, borderTopWidth: 1 },
  input: { flex: 1, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm + 2, borderRadius: BorderRadius.xl, fontSize: FontSize.md, maxHeight: 100 },
  sendBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
});
