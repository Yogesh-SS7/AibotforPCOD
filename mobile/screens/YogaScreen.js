import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SIZES } from '../theme';
import api from '../services/api';

export default function YogaScreen() {
    const [poses, setPoses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/yoga')
            .then(res => setPoses(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <Text style={styles.title}>{item.name}</Text>
            <Text style={styles.duration}>⏱ {item.duration}</Text>

            <View style={styles.section}>
                <Text style={styles.label}>Benefits:</Text>
                <Text style={styles.text}>{item.benefits}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.label}>Instructions:</Text>
                <Text style={styles.text}>{item.instructions}</Text>
            </View>
        </View>
    );

    if (loading) return (
        <View style={styles.center}>
            <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.header}>Yoga for PCOD</Text>
            <FlatList
                contentContainerStyle={styles.list}
                data={poses}
                renderItem={renderItem}
                keyExtractor={item => item.id}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { fontSize: 24, fontWeight: 'bold', color: COLORS.primary, padding: 20, textAlign: 'center', backgroundColor: COLORS.white, borderBottomWidth: 1, borderColor: '#eee' },
    list: { padding: 20 },
    card: { backgroundColor: COLORS.white, padding: 15, borderRadius: SIZES.radius, marginBottom: 15, elevation: 2 },
    title: { fontSize: 20, fontWeight: 'bold', color: COLORS.secondary, marginBottom: 5 },
    duration: { fontSize: 14, color: COLORS.textLight, marginBottom: 10, fontWeight: 'bold' },
    section: { marginBottom: 10 },
    label: { fontWeight: 'bold', color: COLORS.text, marginBottom: 2 },
    text: { fontSize: 16, color: COLORS.text, lineHeight: 22 },
});
