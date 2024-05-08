import React, { useState } from 'react';
import { KeyboardAvoidingView, Pressable, StyleSheet, Text, TextInput, View, Image, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getAuth, signInWithEmailAndPassword } from '@firebase/auth';

const LoginScreen = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false); // For showing loading indicator
    const navigation = useNavigation();

    const handleLogin = () => {
        setLoading(true); // Show loading indicator
        signInWithEmailAndPassword(getAuth(), email, password)
            .then((userCredential) => {
                // Signed in 
                const user = userCredential.user;
                console.log("User logged in:", user);
                // Navigate to the chat screen
                navigation.navigate("Chat");
            })
            .catch((error) => {
                console.error(error);
                Alert.alert('Error', 'Invalid email or password.');
            })
            .finally(() => {
                setLoading(false); // Hide loading indicator
            });
    }

    return (
        <View style={{ flex: 1, backgroundColor: "#010C80", padding: 10, alignItems: "center" }}>
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
                        <Text style={{ color: "#F8FAFC", fontSize: 17, fontWeight: "600" }}>Sign in</Text>
                        <Text style={{ color: "#F8FAFC", fontSize: 17, fontWeight: "600", marginTop: 15 }}>Sign In to Your Account</Text>
                    </View>

                    <View style={{ marginTop: 50 }}>
                        <View>
                            <Text style={{ color: "gray", fontSize: 18, fontWeight: "600" }}>Email</Text>
                            <TextInput
                                value={email}
                                onChangeText={(text) => setEmail(text)}
                                style={{
                                    fontSize: email ? 18 : 18,
                                    color: "#FFFFFF",
                                    borderBottomColor: "#F8FAFC", borderBottomWidth: 1, marginVertical: 10, width: 300
                                }}
                                placeholderTextColor={"#F8FAFC"}
                                placeholder='Enter email address ' />
                        </View>
                    </View>

                    <View style={{ marginTop: 10 }}>
                        <View>
                            <Text style={{ color: "gray", fontSize: 18, fontWeight: "600" }}>Password</Text>
                            <TextInput
                                value={password}
                                onChangeText={(text) => setPassword(text)}
                                secureTextEntry={true}
                                style={{
                                    fontSize: password ? 18 : 18,
                                    color: "#FFFFFF",
                                    borderBottomColor: "#F8FAFC", borderBottomWidth: 1, marginVertical: 10, width: 300
                                }}
                                placeholderTextColor={"#F8FAFC"}
                                placeholder='Enter password' />
                        </View>
                    </View>
                    <Pressable onPress={handleLogin} style={{
                        width: 200,
                        backgroundColor: "#F8FAFC",
                        padding: 15,
                        marginTop: 50,
                        marginLeft: "auto",
                        marginRight: "auto",
                        borderRadius: 6
                    }}>
                        {loading ? (
                            <ActivityIndicator size="small" color="#010C80" />
                        ) : (
                            <Text style={{ fontSize: 16, fontWeight: "bold", textAlign: "center" }}>Login</Text>
                        )}
                    </Pressable>

                    <Pressable onPress={() => navigation.navigate("Register")} style={{ marginTop: 15 }}>
                        <Text style={{ textAlign: "center", color: '#F8FAFC' }}>Don't have an account? Sign Up</Text>
                    </Pressable>
                    <Pressable onPress={() => navigation.navigate("ForgotPassword")} style={{ marginTop: 15 }}>
                        <Text style={{ textAlign: "center", color: '#F8FAFC' }}>Forgot Password?</Text>
                    </Pressable>
                </KeyboardAvoidingView>
            </ScrollView>
        </View>
    )
}

export default LoginScreen;

const styles = StyleSheet.create({});
