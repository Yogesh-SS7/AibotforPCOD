import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SIZES } from '../theme';

export default function HomeScreen({ navigation }) {
    const [user, setUser] = useState(null);

    useEffect(() => {
        AsyncStorage.getItem('user').then(u => {
            if (u) setUser(JSON.parse(u));
        });
    }, []);

    const MenuItem = ({ title, route, color }) => (
        <TouchableOpacity
            style={[styles.card, { borderLeftColor: color }]}
            onPress={() => navigation.navigate(route)}
        >
            <Text style={styles.cardTitle}>{title}</Text>
            <Text style={styles.arrow}>→</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.greeting}>Hello,</Text>
                    <Text style={styles.username}>{user ? user.name : 'Guest'}</Text>
                </View>

                <Text style={styles.sectionTitle}>Ritu PCOD Companion</Text>

                <MenuItem title="PCOD Symptom Check" route="Diagnostic" color={COLORS.error} />
                <MenuItem title="Ask Ritu AI" route="Chat" color={COLORS.secondary} />
                <MenuItem title="Home Remedies" route="Remedies" color={COLORS.success} />
                <MenuItem title="Yoga for PCOD" route="Yoga" color={COLORS.primary} />
                <MenuItem title="BMI Calculator" route="BMI" color={COLORS.title} />

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    content: { padding: SIZES.padding },
    header: { marginBottom: 30 },
    greeting: { fontSize: 18, color: COLORS.textLight },
    username: { fontSize: 28, fontWeight: 'bold', color: COLORS.text },
    sectionTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.text, marginBottom: 15 },
    card: {
        backgroundColor: COLORS.white,
        padding: 20,
        marginBottom: 15,
        borderRadius: SIZES.radius,
        elevation: 2,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderLeftWidth: 5,
    },
    cardTitle: { fontSize: 18, fontWeight: '500', color: COLORS.text },
    arrow: { fontSize: 24, color: COLORS.textLight },
});
