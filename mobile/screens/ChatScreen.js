import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SIZES } from '../theme';

import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TypeWriter = ({ text, onComplete }) => {
    const [displayedText, setDisplayedText] = useState('');

    useEffect(() => {
        let index = 0;
        const timer = setInterval(() => {
            if (index < text.length) {
                setDisplayedText((prev) => prev + text.charAt(index));
                index++;
            } else {
                clearInterval(timer);
                if (onComplete) onComplete();
            }
        }, 30); // Speed of typing
        return () => clearInterval(timer);
    }, [text]);

    return <Text style={styles.aiText}>{displayedText}</Text>;
};

export default function ChatScreen() {
    const [messages, setMessages] = useState([
        { id: '0', text: 'Namaste! I am your Ayurvedic assistant. How can I help you today?', sender: 'AI', animate: false }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [context, setContext] = useState(null);
    const flatListRef = useRef();

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
                context: context
            });
            const aiMsg = {
                id: (Date.now() + 1).toString(),
                text: res.data.response,
                sender: 'AI',
                animate: true // Trigger typewriter for new message
            };
            setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            console.error("Chat Error:", error);
            let userFriendlyError = "I'm having trouble connecting to nature right now.";
            if (error.code === 'ECONNABORTED') userFriendlyError = "I'm taking a bit too long to meditate on that. Please try again.";
            else if (error.message === 'Network Error') userFriendlyError = "I cannot reach the server. Please check your connection (IP/Wifi).";

            const errorMsg = {
                id: (Date.now() + 1).toString(),
                text: userFriendlyError,
                sender: 'AI',
                animate: true
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
                {isUser || !item.animate ? (
                    <Text style={[styles.msgText, isUser ? styles.userText : styles.aiText]}>{item.text}</Text>
                ) : (
                    <TypeWriter text={item.text} onComplete={() => {
                        // Optional: Mark as animated so it doesnt re-animate on scroll
                        item.animate = false;
                    }} />
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Health Assistant</Text>
            </View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0} // Adjust if needed
            >
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.list}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                />

                {loading && (
                    <View style={{ padding: 10, alignItems: 'center' }}>
                        <ActivityIndicator color={COLORS.secondary} />
                        <Text style={{ marginTop: 5, color: '#888', fontStyle: 'italic' }}>Ritu is thinking...</Text>
                    </View>
                )}

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
    list: { flexGrow: 1, padding: SIZES.padding, paddingBottom: 20 },
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
    aiText: { fontSize: 16, lineHeight: 22, color: COLORS.text },
    userText: { color: COLORS.white },
    inputContainer: {
        flexDirection: 'row',
        padding: 10,
        backgroundColor: COLORS.white,
        alignItems: 'center',
        borderTopWidth: 1,
        borderColor: '#eee',
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
