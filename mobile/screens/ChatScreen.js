import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SIZES } from '../theme';

import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ChatScreen() {
    const [messages, setMessages] = useState([
        { id: '0', text: 'Namaste! I am your Ayurvedic assistant. How can I help you today?', sender: 'AI' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [context, setContext] = useState(null);

    useEffect(() => {
        AsyncStorage.getItem('pcod_context').then(data => {
            if (data) setContext(JSON.parse(data));
        });
    }, []);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMsg = { id: Date.now().toString(), text: input, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const res = await api.post('/chat', {
                message: userMsg.text,
                context: context // Send PCOD context if available
            });
            const aiMsg = {
                id: (Date.now() + 1).toString(),
                text: res.data.response,
                sender: 'AI'
            };
            setMessages(prev => [...prev, aiMsg]);
            console.error("Chat Error:", error);
            let userFriendlyError = "I'm having trouble connecting to nature right now.";

            if (error.code === 'ECONNABORTED') {
                userFriendlyError = "I'm taking a bit too long to meditate on that. Please try again.";
            } else if (error.message === 'Network Error') {
                userFriendlyError = "I cannot reach the server. Please check your connection (IP/Wifi).";
            }

            const errorMsg = {
                id: (Date.now() + 1).toString(),
                text: `${userFriendlyError} (Debug: ${error.message})`,
                sender: 'AI'
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }) => {
        const isUser = item.sender === 'user';
        return (
            <View style={[
                styles.msgContainer,
                isUser ? styles.userMsg : styles.aiMsg
            ]}>
                <Text style={[
                    styles.msgText,
                    isUser ? styles.userText : styles.aiText
                ]}>{item.text}</Text>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Ayurvedic Assistant</Text>
            </View>

            <FlatList
                data={messages}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
            />

            {loading && (
                <View style={{ padding: 10, alignItems: 'center' }}>
                    <ActivityIndicator color={COLORS.secondary} />
                    <Text style={{ marginTop: 5, color: '#888', fontStyle: 'italic' }}>Thinking... (this may take a minute)</Text>
                </View>
            )}

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
            >
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Ask about Ayurveda..."
                        value={input}
                        onChangeText={setInput}
                        multiline
                    />
                    <TouchableOpacity onPress={sendMessage} style={styles.sendBtn}>
                        <Text style={styles.sendText}>Send</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: { padding: 15, backgroundColor: COLORS.white, borderBottomWidth: 1, borderColor: '#eee', alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.primary },
    list: { padding: SIZES.padding },
    msgContainer: {
        maxWidth: '80%',
        padding: 12,
        borderRadius: 16,
        marginBottom: 10,
    },
    userMsg: {
        alignSelf: 'flex-end',
        backgroundColor: COLORS.primary,
        borderBottomRightRadius: 4,
    },
    aiMsg: {
        alignSelf: 'flex-start',
        backgroundColor: COLORS.white,
        borderBottomLeftRadius: 4,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    msgText: { fontSize: 16, lineHeight: 22 },
    userText: { color: COLORS.white },
    aiText: { color: COLORS.text },
    inputContainer: {
        flexDirection: 'row',
        padding: 10,
        backgroundColor: COLORS.white,
        alignItems: 'center',
        borderTopWidth: 1,
        borderColor: '#eee',
        marginBottom: 20, // Lift up from bottom edge
    },
    input: {
        flex: 1,
        backgroundColor: '#f9f9f9',
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 10,
        maxHeight: 100,
        marginRight: 10,
    },
    sendBtn: {
        paddingVertical: 10,
        paddingHorizontal: 15,
    },
    sendText: { color: COLORS.secondary, fontWeight: 'bold', fontSize: 16 },
});
