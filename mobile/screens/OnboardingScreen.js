import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SIZES } from '../theme';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function OnboardingScreen({ navigation }) {
    const [step, setStep] = useState(1); // 1: Details, 2: OTP
    const [form, setForm] = useState({ name: '', age: '', weight: '', email: '' });
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);

    const handleInitiate = async () => {
        if (!form.name || !form.age || !form.weight || !form.email) {
            Alert.alert("Missing Fields", "Please fill all fields.");
            return;
        }

        // BYPASS: Simulate sending OTP without backend call
        Alert.alert("OTP Sent", "Mock OTP is: 1234");
        setStep(2);
    };

    const handleVerify = async () => {
        if (otp !== '1234') {
            Alert.alert("Error", "Invalid OTP");
            return;
        }
        await AsyncStorage.setItem('user', JSON.stringify(form));
        navigation.replace('Home');
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll}>
                <Text style={styles.header}>Welcome to PCOD Care</Text>

                {step === 1 ? (
                    <>
                        <Text style={styles.label}>Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Your Name"
                            value={form.name}
                            onChangeText={t => setForm({ ...form, name: t })}
                        />

                        <Text style={styles.label}>Age</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Age"
                            keyboardType="numeric"
                            value={form.age}
                            onChangeText={t => setForm({ ...form, age: t })}
                        />

                        <Text style={styles.label}>Weight (kg)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Weight in kg"
                            keyboardType="numeric"
                            value={form.weight}
                            onChangeText={t => setForm({ ...form, weight: t })}
                        />

                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Email Address"
                            keyboardType="email-address"
                            value={form.email}
                            onChangeText={t => setForm({ ...form, email: t })}
                            autoCapitalize="none"
                        />

                        <TouchableOpacity
                            style={styles.button}
                            onPress={handleInitiate}
                            disabled={loading}
                        >
                            <Text style={styles.buttonText}>{loading ? "Sending..." : "Send OTP"}</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <>
                        <Text style={styles.label}>Enter OTP (Use 1234)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="OTP"
                            keyboardType="numeric"
                            value={otp}
                            onChangeText={setOtp}
                        />
                        <TouchableOpacity
                            style={styles.button}
                            onPress={handleVerify}
                            disabled={loading}
                        >
                            <Text style={styles.buttonText}>{loading ? "Verifying..." : "Verify & Enter"}</Text>
                        </TouchableOpacity>
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    scroll: { padding: SIZES.padding },
    header: { fontSize: 24, fontWeight: 'bold', color: COLORS.primary, marginBottom: 20, textAlign: 'center' },
    label: { fontSize: 16, color: COLORS.text, marginBottom: 5, marginTop: 10 },
    input: {
        backgroundColor: COLORS.white,
        padding: 12,
        borderRadius: SIZES.radius,
        borderWidth: 1,
        borderColor: '#ddd'
    },
    button: {
        backgroundColor: COLORS.secondary,
        padding: 15,
        borderRadius: SIZES.radius,
        alignItems: 'center',
        marginTop: 30,
    },
    buttonText: { color: COLORS.white, fontWeight: 'bold', fontSize: 16 }
});
