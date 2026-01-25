import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SIZES } from '../theme';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function OnboardingScreen({ navigation }) {
    const [step, setStep] = useState(1); // 1: Details, 2: OTP

    const [form, setForm] = useState({ name: '', age: '', weight: '', city: '', phone: '', language: 'English' });
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [tempId, setTempId] = useState(null); // Explicit state for ID from backend

    const handleInitiate = async () => {
        if (!form.name || !form.age || !form.weight || !form.city || !form.phone || !form.language) {
            Alert.alert("Missing Fields", "Please fill all fields.");
            return;
        }

        setLoading(true);
        try {
            const res = await api.post('/onboarding/initiate', form);
            Alert.alert("OTP Sent", res.data.message || `Mock OTP is: ${res.data.otp}`);

            // Save userId returned from backend
            if (res.data.userId) {
                console.log("Backend returned UserID:", res.data.userId);
                setTempId(res.data.userId);
                setForm(prev => ({ ...prev, id: res.data.userId })); // Also update form for consistency
            }
            setStep(2);
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Could not send OTP. Please check connection.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async () => {
        if (!otp) {
            Alert.alert("Error", "Please enter OTP");
            return;
        }

        setLoading(true);
        try {
            // Updated to send phone and otp
            await api.post('/onboarding/verify-otp', { phone: form.phone, otp });

            // Ensure ID is included
            const finalUser = { ...form, id: tempId || form.id };
            console.log("Saving User to Storage:", finalUser);

            await AsyncStorage.setItem('user', JSON.stringify(finalUser));
            navigation.replace('Home');
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Invalid OTP or connection error.");
        } finally {
            setLoading(false);
        }
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

                        <Text style={styles.label}>City</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Your City"
                            value={form.city}
                            onChangeText={t => setForm({ ...form, city: t })}
                        />

                        <Text style={styles.label}>Mobile Number</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Mobile Number"
                            keyboardType="phone-pad"
                            value={form.phone}
                            onChangeText={t => setForm({ ...form, phone: t })}
                            maxLength={10}
                        />

                        <Text style={styles.label}>Language</Text>
                        <View style={styles.langList}>
                            {['English', 'Hindi', 'Gujarati'].map((lang) => (
                                <TouchableOpacity
                                    key={lang}
                                    style={[styles.langItem, form.language === lang && styles.langItemActive]}
                                    onPress={() => setForm({ ...form, language: lang })}
                                >
                                    <View style={[styles.radioOuter, form.language === lang && styles.radioOuterActive]}>
                                        {form.language === lang && <View style={styles.radioInner} />}
                                    </View>
                                    <Text style={[styles.langText, form.language === lang && styles.langTextActive]}>{lang}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

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
    buttonText: { color: COLORS.white, fontWeight: 'bold', fontSize: 16 },
    buttonText: { color: COLORS.white, fontWeight: 'bold', fontSize: 16 },
    langList: { marginTop: 10 },
    langItem: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: COLORS.white, borderRadius: SIZES.radius, marginBottom: 8, borderWidth: 1, borderColor: '#eee' },
    langItemActive: { borderColor: COLORS.primary, backgroundColor: '#F0FDFD' },
    langText: { fontSize: 16, color: COLORS.text, marginLeft: 10 },
    langTextActive: { color: COLORS.primary, fontWeight: 'bold' },
    radioOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#ccc', justifyContent: 'center', alignItems: 'center' },
    radioOuterActive: { borderColor: COLORS.primary },
    radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.primary }
});
