import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SIZES } from '../theme';
import api from '../services/api';

export default function RemediesScreen() {
    const [remedies, setRemedies] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/remedies')
            .then(res => setRemedies(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <Text style={styles.condition}>{item.condition}</Text>
            <Text style={styles.remedy}>🌿 {item.remedy}</Text>
            <Text style={styles.caution}>⚠️ {item.caution}</Text>
        </View>
    );

    if (loading) return (
        <View style={styles.center}>
            <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.header}>Home Remedies</Text>
            <FlatList
                contentContainerStyle={styles.list}
                data={remedies}
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
    card: { backgroundColor: COLORS.white, padding: 15, borderRadius: SIZES.radius, marginBottom: 15, elevation: 1 },
    condition: { fontSize: 18, fontWeight: 'bold', color: COLORS.secondary, marginBottom: 5 },
    remedy: { fontSize: 16, color: COLORS.text, lineHeight: 22, marginBottom: 10 },
    caution: { fontSize: 14, color: COLORS.error, fontStyle: 'italic' },
});
