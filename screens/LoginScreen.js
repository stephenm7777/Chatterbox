import React, { useState, useCallback } from 'react';
import { KeyboardAvoidingView, Pressable, StyleSheet, Text, TextInput, View, Image, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getAuth, signInWithEmailAndPassword } from '@firebase/auth';
import { getDatabase, ref, push, get } from 'firebase/database';

const LoginScreen = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false); // For showing loading indicator
    const navigation = useNavigation();

    useFocusEffect(
        useCallback(() => {
            // Reset email and password when the screen is focused
            setEmail("");
            setPassword("");
        }, [])
    );

    const handleLogin = async () => {
        setLoading(true); // Show loading indicator
        try {
            const auth = getAuth();
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            console.log("User logged in:", user);

            const db = getDatabase();
            const usersRef = ref(db, 'users');

            // Check if the user already exists in the database
            const snapshot = await get(usersRef);
            let userExists = false;
            snapshot.forEach((childSnapshot) => {
                childSnapshot.forEach((cs => {
                    if (cs.val() === email) {
                        userExists = true;
                        return;
                    }
                }));
            });

            if (!userExists) {
                // If user does not exist, add them to the database
                push(usersRef, { email });
            } else {
                console.log("User already exists in the database");
            }

            navigation.navigate("Chat");
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Invalid email or password.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <View style={{ flex: 1, backgroundColor: "#E3E7D3", padding: 10, alignItems: "center" }}>
            <ScrollView
                contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
            >
                <KeyboardAvoidingView style={{ alignItems: "center" }}>
                    <Image
                        source={require('../img/png/logo-no-background.png')}
                        style={{ width: 200, height: 200, resizeMode: "contain" }}
                    />
                    <View style={{ marginTop: 100, justifyContent: "center", alignItems: "center" }}>
                        <Text style={{ color: "#25291C", fontSize: 17, fontWeight: "600" }}>Sign in</Text>
                    </View>

                    <View style={{ marginTop: 50 }}>
                        <View>
                            <Text style={{ color: "#25291C", fontSize: 18, fontWeight: "600" }}>Email</Text>
                            <TextInput
                                value={email}
                                onChangeText={(text) => setEmail(text)}
                                style={{
                                    fontSize: email ? 18 : 18,
                                    color: "#25291C",
                                    borderBottomColor: "#25291C", borderBottomWidth: 1, marginVertical: 10, width: 300
                                }}
                                placeholderTextColor={"#25291C"}
                                placeholder='Enter email address '
                            />
                        </View>
                    </View>

                    <View style={{ marginTop: 10 }}>
                        <View>
                            <Text style={{ color: "#25291C", fontSize: 18, fontWeight: "600" }}>Password</Text>
                            <TextInput
                                value={password}
                                onChangeText={(text) => setPassword(text)}
                                secureTextEntry={true}
                                style={{
                                    fontSize: password ? 18 : 18,
                                    color: "#25291C",
                                    borderBottomColor: "#25291C", borderBottomWidth: 1, marginVertical: 10, width: 300
                                }}
                                placeholderTextColor={"#25291C"}
                                placeholder='Enter password'
                            />
                        </View>
                    </View>
                    <Pressable onPress={handleLogin} style={{
                        width: 200,
                        backgroundColor: "#25291C",
                        padding: 15,
                        marginTop: 50,
                        marginLeft: "auto",
                        marginRight: "auto",
                        borderRadius: 6
                    }}>
                        {loading ? (
                            <ActivityIndicator size="small" color="#E3E7D3" />
                        ) : (
                            <Text style={{ fontSize: 16, fontWeight: "bold", textAlign: "center", color: "#E3E7D3" }}>Login</Text>
                        )}
                    </Pressable>

                    <Pressable onPress={() => navigation.navigate("Register")} style={{ marginTop: 15 }}>
                        <Text style={{ textAlign: "center", color: '#25291C' }}>Don't have an account? Sign Up</Text>
                    </Pressable>
                    <Pressable onPress={() => navigation.navigate("ForgotPassword")} style={{ marginTop: 15 }}>
                        <Text style={{ textAlign: "center", color: '#25291C' }}>Forgot Password?</Text>
                    </Pressable>
                </KeyboardAvoidingView>
            </ScrollView>
        </View>
    );
}

export default LoginScreen;

const styles = StyleSheet.create({});
