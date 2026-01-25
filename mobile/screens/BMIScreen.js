import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SIZES } from '../theme';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function BMIScreen() {
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');
    const [bmiResult, setBmiResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const calculateBMI = async () => {
        if (!height || !weight) {
            Alert.alert("Missing Input", "Please enter both height and weight");
            return;
        }

        Keyboard.dismiss();
        setLoading(true);

        const hMeters = parseFloat(height) / 100;
        const wKg = parseFloat(weight);
        const bmi = (wKg / (hMeters * hMeters)).toFixed(1);

        let category = '';
        if (bmi < 18.5) category = 'Underweight';
        else if (bmi < 24.9) category = 'Normal Weight';
        else if (bmi < 29.9) category = 'Overweight';
        else category = 'Obese';

        const result = { bmi, category };
        setBmiResult(result);

        // Update User Profile on Backend
        try {
            const userStr = await AsyncStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                // Assuming we have an endpoint or can update user details
                await api.post('/onboarding/initiate', {
                    ...user,
                    weight: wKg, // Update weight if changed
                    bmi: bmi,
                    bmi_category: category
                });
                // Also update local storage
                await AsyncStorage.setItem('user', JSON.stringify({ ...user, weight: wKg, bmi, bmi_category: category }));
            }
        } catch (error) {
            console.error("Failed to sync BMI with server", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.header}>BMI Calculator</Text>

            <View style={styles.content}>
                <Text style={styles.label}>Height (cm)</Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g. 165"
                    keyboardType="numeric"
                    value={height}
                    onChangeText={setHeight}
                />

                <Text style={styles.label}>Weight (kg)</Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g. 60"
                    keyboardType="numeric"
                    value={weight}
                    onChangeText={setWeight}
                />

                <TouchableOpacity style={styles.button} onPress={calculateBMI} disabled={loading}>
                    <Text style={styles.buttonText}>{loading ? "Saving..." : "Calculate & Save"}</Text>
                </TouchableOpacity>

                {bmiResult && (
                    <View style={styles.resultContainer}>
                        <Text style={styles.resultLabel}>Your BMI</Text>
                        <Text style={[styles.bmiValue, { color: getCategoryColor(bmiResult.category) }]}>
                            {bmiResult.bmi}
                        </Text>
                        <Text style={[styles.category, { color: getCategoryColor(bmiResult.category) }]}>
                            {bmiResult.category}
                        </Text>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}

const getCategoryColor = (cat) => {
    if (cat === 'Normal Weight') return COLORS.success;
    if (cat === 'Underweight') return COLORS.secondary;
    return COLORS.error;
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: { fontSize: 24, fontWeight: 'bold', color: COLORS.primary, padding: 20, textAlign: 'center', backgroundColor: COLORS.white, borderBottomWidth: 1, borderColor: '#eee' },
    content: { padding: 20 },
    label: { fontSize: 16, color: COLORS.text, marginBottom: 8, marginTop: 10 },
    input: { backgroundColor: COLORS.white, padding: 15, borderRadius: SIZES.radius, fontSize: 18, borderWidth: 1, borderColor: '#ddd' },
    button: { backgroundColor: COLORS.primary, padding: 15, borderRadius: SIZES.radius, alignItems: 'center', marginTop: 30 },
    buttonText: { color: COLORS.white, fontWeight: 'bold', fontSize: 18 },
    resultContainer: { alignItems: 'center', marginTop: 40, padding: 20, backgroundColor: COLORS.white, borderRadius: SIZES.radius, elevation: 2 },
    resultLabel: { fontSize: 16, color: COLORS.textLight },
    bmiValue: { fontSize: 48, fontWeight: 'bold', marginVertical: 10 },
    category: { fontSize: 24, fontWeight: '600' }
});
