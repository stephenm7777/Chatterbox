import { KeyboardAvoidingView, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import React, { useState } from 'react'
import { useNavigation } from '@react-navigation/native';

const LoginScreen = () => {
    const [email, setEmail] = useState("");
    const [password, setPassport] = useState("");
    const navigation = useNavigation();
    return (
        <View style={{ flex: 1, backgroundColor: "#010C80", padding: 10, alignItems: "center" }}>
            <KeyboardAvoidingView>
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
                            onChangeText={(text) => setPassport(text)}
                            secureTextEntry={true}
                            style={{
                                fontSize: email ? 18 : 18,
                                borderBottomColor: "#F8FAFC", borderBottomWidth: 1, marginVertical: 10, width: 300
                            }}
                            placeholderTextColor={"#F8FAFC"}
                            placeholder='Enter password' />
                    </View>
                </View>
                <Pressable style={{
                    width: 200,
                    backgroundColor: "#F8FAFC",
                    padding: 15,
                    marginTop: 50,
                    marginLeft: "auto",
                    marginRight: "auto",
                    borderRadius: 6
                }}>
                    <Text style={{fontSize:16, fontWeight:"bold", textAlign:"center"}}>Login</Text>
                </Pressable>

                <Pressable onPress={() => navigation.navigate("Register")} style={{marginTop:15}}>
                    <Text style={{textAlign:"center", color:'#F8FAFC'}}>Don't have an account? Sign Up</Text>
                </Pressable>
            </KeyboardAvoidingView>
        </View>
    )
}

export default LoginScreen

const styles = StyleSheet.create({})