import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SIZES } from '../theme';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function DiagnosticScreen({ navigation }) {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [answers, setAnswers] = useState({});
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [result, setResult] = useState(null);
    const [explanation, setExplanation] = useState(null);
    const [explaining, setExplaining] = useState(false);
    const [inputText, setInputText] = useState("");


    const [userId, setUserId] = useState(null);

    useEffect(() => {
        // Load user email
        AsyncStorage.getItem('user').then(data => {
            if (data) {
                const user = JSON.parse(data);
                if (user.id) setUserId(user.id);
            }
        });

        api.get('/pcod/questions')
            .then(res => {
                const data = res.data;
                if (data && data.length > 0) {
                    setQuestions(data);
                } else {
                    Alert.alert("Error", "No questions found.");
                }
            })
            .catch(err => {
                console.error(err);
                Alert.alert("Error", "Could not load diagnostic questions");
            })
            .finally(() => setLoading(false));
    }, []);

    const getCurrentQuestion = () => questions[currentQIndex];

    const handleOptionSelect = (option) => {
        const q = getCurrentQuestion();
        // In new JSON, we store the 'text' of the option as the answer value
        const answerValue = option.text;

        saveAnswerAndNext(q.id, answerValue);
    };

    const handleInputSubmit = () => {
        const q = getCurrentQuestion();
        if (!inputText) return;

        saveAnswerAndNext(q.id, inputText);
        setInputText("");
    };

    const saveAnswerAndNext = (fileId, value) => {
        const newAnswers = { ...answers, [fileId]: value };
        setAnswers(newAnswers);

        if (currentQIndex < questions.length - 1) {
            setCurrentQIndex(currentQIndex + 1);
        } else {
            submitAnalysis(newAnswers);
        }
    };

    const handleBack = () => {
        if (currentQIndex > 0) {
            setCurrentQIndex(currentQIndex - 1);
        } else {
            navigation.goBack();
        }
    };


    const submitAnalysis = async (finalAnswers) => {
        setLoading(true);
        try {
            const payload = { answers: finalAnswers, userId: userId };
            const res = await api.post('/pcod/submit', payload);
            setResult(res.data);

            // Save result locally for Chat context
            await AsyncStorage.setItem('pcod_context', JSON.stringify(res.data));

            setExplanation(null); // Reset explanation for new result
            setExplaining(false);
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Could not submit analysis");
        } finally {
            setLoading(false);
        }
    };

    const handleExplain = async () => {
        if (!result) return;
        setExplaining(true);
        try {
            const res = await api.post('/pcod/explain', { result });
            setExplanation(res.data.explanation);
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Could not get explanation");
        } finally {
            setExplaining(false);
        }
    };

    if (result) {
        return (
            <SafeAreaView style={styles.container}>
                <ScrollView contentContainerStyle={styles.content}>
                    <Text style={[styles.title, { color: COLORS.primary }]}>Assessment Result</Text>

                    <View style={styles.resultBox}>
                        <Text style={styles.scoreLabel}>Risk Category:</Text>
                        <Text style={styles.scoreValue}>{result.risk_category}</Text>
                        <Text style={styles.scoreSub}>(Score: {result.score})</Text>
                    </View>

                    {result.observed_patterns && result.observed_patterns.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.subTitle}>Observed Patterns:</Text>
                            {result.observed_patterns.map((p, i) => <Text key={i} style={styles.text}>• {p}</Text>)}
                        </View>
                    )}

                    <View style={styles.section}>
                        <Text style={styles.subTitle}>Recommendations:</Text>
                        {result.recommendations.map((rec, i) => (
                            <Text key={i} style={styles.bullet}>• {rec}</Text>
                        ))}
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.subTitle}>Recommendations:</Text>
                        {result.recommendations.map((rec, i) => (
                            <Text key={i} style={styles.bullet}>• {rec}</Text>
                        ))}
                    </View>

                    {/* AI Explanation Section */}
                    <View style={styles.aiSection}>
                        <Text style={styles.aiHeader}>Ritu AI Insights</Text>
                        {!explanation && !explaining && (
                            <TouchableOpacity style={styles.explainBtn} onPress={handleExplain}>
                                <Text style={styles.explainBtnText}>✨ Explain Result with Ritu AI</Text>
                            </TouchableOpacity>
                        )}

                        {explaining && (
                            <View style={styles.loadingBox}>
                                <ActivityIndicator color={COLORS.secondary} />
                                <Text style={styles.loadingText}>Ritu is analyzing your result...</Text>
                            </View>
                        )}

                        {explanation && (
                            <View style={styles.explanationBox}>
                                <Text style={styles.explanationText}>{explanation}</Text>
                            </View>
                        )}
                    </View>

                    <Text style={styles.disclaimer}>{result.disclaimer}</Text>

                    <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
                        <Text style={styles.buttonText}>Close</Text>
                    </TouchableOpacity>
                </ScrollView>
            </SafeAreaView>
        );
    }

    if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;

    const q = getCurrentQuestion();
    if (!q) return <View style={styles.center}><Text>Question not found</Text></View>;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
                    <Text style={styles.backText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.progress}>Question {currentQIndex + 1} of {questions.length}</Text>
                {q.section && <Text style={{ fontSize: 12, color: COLORS.secondary, marginTop: 4 }}>{q.section}</Text>}
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.questionText}>{q.text}</Text>

                {q.type === 'single_choice' || q.type === 'multi_choice' ? (
                    q.options.map((opt, i) => (
                        <TouchableOpacity
                            key={i}
                            style={styles.optBtn}
                            onPress={() => handleOptionSelect(opt)}
                        >
                            <Text style={styles.optText}>{opt.text}</Text>
                        </TouchableOpacity>
                    ))
                ) : (
                    <View>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter value..."
                            keyboardType={q.type === 'number_input' ? 'numeric' : 'default'}
                            value={inputText}
                            onChangeText={setInputText}
                        />
                        <TouchableOpacity style={styles.button} onPress={handleInputSubmit}>
                            <Text style={styles.buttonText}>Next</Text>
                        </TouchableOpacity>
                    </View>
                )}

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    content: { padding: 20 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderColor: '#eee' },
    backBtn: { marginRight: 15 },
    backText: { fontSize: 16, color: COLORS.primary },
    progress: { fontSize: 14, color: COLORS.textLight, fontWeight: 'bold' },

    questionText: { fontSize: 24, fontWeight: 'bold', color: COLORS.text, marginBottom: 30, marginTop: 10 },

    optBtn: {
        padding: 18,
        backgroundColor: COLORS.white,
        borderRadius: 12,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#eee',
        elevation: 2
    },
    optText: { fontSize: 18, color: COLORS.text },

    input: { backgroundColor: COLORS.white, padding: 15, borderRadius: 10, fontSize: 18, marginBottom: 20, borderWidth: 1, borderColor: '#ddd' },

    button: { backgroundColor: COLORS.primary, padding: 15, borderRadius: 10, alignItems: 'center' },
    buttonText: { color: COLORS.white, fontWeight: 'bold', fontSize: 16 },

    title: { fontSize: 26, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    resultBox: { backgroundColor: COLORS.white, padding: 20, borderRadius: 15, alignItems: 'center', marginBottom: 20, elevation: 3 },
    scoreLabel: { fontSize: 16, color: COLORS.textLight },
    scoreValue: { fontSize: 28, fontWeight: 'bold', color: COLORS.error, marginVertical: 5 },
    scoreSub: { fontSize: 14, color: COLORS.textLight },

    section: { marginBottom: 20 },
    subTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: COLORS.text },
    text: { fontSize: 16, color: COLORS.text, marginBottom: 5 },
    bullet: { fontSize: 16, color: COLORS.text, marginBottom: 8, lineHeight: 22 },
    disclaimer: { fontSize: 13, color: COLORS.textLight, fontStyle: 'italic', textAlign: 'center', marginTop: 10, marginBottom: 30 },

    aiSection: { marginTop: 20, marginBottom: 20, padding: 15, backgroundColor: '#FFF5F7', borderRadius: 15, borderLeftWidth: 4, borderLeftColor: COLORS.secondary },
    aiHeader: { fontSize: 18, fontWeight: 'bold', color: COLORS.secondary, marginBottom: 10 },
    explainBtn: { backgroundColor: COLORS.secondary, padding: 12, borderRadius: 8, alignItems: 'center' },
    explainBtnText: { color: COLORS.white, fontWeight: 'bold' },
    loadingBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 10 },
    loadingText: { marginLeft: 10, color: COLORS.textLight },
    explanationBox: { marginTop: 5 },
    explanationText: { fontSize: 16, color: COLORS.text, lineHeight: 24, fontStyle: 'italic' },
});
