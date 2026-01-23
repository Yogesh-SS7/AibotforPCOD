import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SIZES } from '../theme';
import api from '../services/api';

export default function PrakritiScreen({ navigation }) {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [answers, setAnswers] = useState({}); // { questionId: type }
    const [result, setResult] = useState(null);

    useEffect(() => {
        fetchQuestions();
    }, []);

    const fetchQuestions = async () => {
        try {
            const res = await api.get('/prakriti/questions');
            setQuestions(res.data);
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Could not load questions.");
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (questionId, type) => {
        setAnswers({ ...answers, [questionId]: type });
    };

    const handleSubmit = async () => {
        // Validation
        if (Object.keys(answers).length < questions.length) {
            Alert.alert("Incomplete", "Please answer all questions.");
            return;
        }

        setLoading(true);
        try {
            const payload = Object.keys(answers).map(qid => ({
                questionId: qid, // not strict in backend currently but good practice
                selectedType: answers[qid]
            }));

            const res = await api.post('/prakriti/submit', { answers: payload });
            setResult(res.data);
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Could not calculate Prakriti.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    if (result) {
        return (
            <SafeAreaView style={styles.container}>
                <ScrollView contentContainerStyle={styles.content}>
                    <Text style={styles.resultHeader}>Your Dominant Dosha</Text>
                    <Text style={styles.resultTitle}>{result.prakriti}</Text>
                    <Text style={styles.resultDesc}>{result.description}</Text>

                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.buttonText}>Back to Home</Text>
                    </TouchableOpacity>
                </ScrollView>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.title}>Discover Your Prakriti</Text>

                {questions.map((q, index) => (
                    <View key={q.id} style={styles.qContainer}>
                        <Text style={styles.qText}>{index + 1}. {q.question}</Text>
                        <View style={styles.options}>
                            {q.options.map((opt, i) => (
                                <TouchableOpacity
                                    key={i}
                                    style={[
                                        styles.optionButton,
                                        answers[q.id] === opt.type && styles.optionSelected
                                    ]}
                                    onPress={() => handleSelect(q.id, opt.type)}
                                >
                                    <Text style={[
                                        styles.optionText,
                                        answers[q.id] === opt.type && styles.optionTextSelected
                                    ]}>{opt.text}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                ))}

                <TouchableOpacity
                    style={styles.button}
                    onPress={handleSubmit}
                >
                    <Text style={styles.buttonText}>Submit Analysis</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    content: { padding: SIZES.padding },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 24, fontWeight: 'bold', color: COLORS.primary, marginBottom: 20 },
    qContainer: { marginBottom: 25 },
    qText: { fontSize: 18, color: COLORS.text, marginBottom: 10, fontWeight: '500' },
    options: { gap: 10 },
    optionButton: {
        padding: 12,
        borderRadius: SIZES.radius,
        borderWidth: 1,
        borderColor: COLORS.secondary,
        backgroundColor: COLORS.white,
    },
    optionSelected: {
        backgroundColor: COLORS.secondary,
        borderColor: COLORS.secondary,
    },
    optionText: { color: COLORS.text, fontSize: 16 },
    optionTextSelected: { color: COLORS.white, fontWeight: 'bold' },
    button: {
        backgroundColor: COLORS.primary,
        padding: 15,
        borderRadius: SIZES.radius,
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 40,
    },
    buttonText: { color: COLORS.white, fontWeight: 'bold', fontSize: 16 },
    resultHeader: { fontSize: 20, color: COLORS.textLight, textAlign: 'center', marginTop: 20 },
    resultTitle: { fontSize: 32, fontWeight: 'bold', color: COLORS.primary, textAlign: 'center', marginVertical: 10 },
    resultDesc: { fontSize: 16, color: COLORS.text, textAlign: 'center', lineHeight: 24, marginBottom: 30 },
});
