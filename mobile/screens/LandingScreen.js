import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SIZES } from '../theme';

export default function LandingScreen({ navigation }) {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Ritu AI</Text>
                <Text style={styles.subtitle}>Ancient Wisdom, Modern Insight</Text>

                <View style={styles.disclaimerBox}>
                    <Text style={styles.disclaimerTitle}>Disclaimer</Text>
                    <Text style={styles.disclaimerText}>
                        This app provides educational insights based on Ayurvedic principles and is not a substitute for professional medical advice.
                        Do not use this app for emergencies.
                    </Text>
                </View>

                <TouchableOpacity
                    style={styles.button}
                    onPress={() => navigation.navigate('Onboarding')}
                >
                    <Text style={styles.buttonText}>Begin Journey</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        justifyContent: 'center',
    },
    content: {
        padding: SIZES.padding,
        alignItems: 'center',
    },
    title: {
        fontSize: 36,
        color: COLORS.primary,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 18,
        color: COLORS.secondary,
        marginBottom: 40,
    },
    disclaimerBox: {
        backgroundColor: COLORS.white,
        padding: 20,
        borderRadius: SIZES.radius,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        marginBottom: 60,
    },
    disclaimerTitle: {
        fontSize: 16,
        color: COLORS.error,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    disclaimerText: {
        fontSize: 14,
        color: COLORS.text,
        lineHeight: 20,
        textAlign: 'center',
    },
    button: {
        backgroundColor: COLORS.primary,
        paddingVertical: 16,
        paddingHorizontal: 40,
        borderRadius: 30,
        elevation: 3,
    },
    buttonText: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: 'bold',
    },
});
