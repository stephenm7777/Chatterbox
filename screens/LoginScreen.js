import { KeyboardAvoidingView, StyleSheet, Text, TextInput, View } from 'react-native'
import React from 'react'

const LoginScreen = () => {
    return (
        <View style={{ flex: 1, backgroundColor: "#010C80", padding: 10, alignItems: "center" }}>
            <KeyboardAvoidingView>
                <View style={{ marginTop: 100, justifyContent: "center", alignItems: "center" }}>
                    <Text style={{ color: "#F8FAFC", fontSize: 17, fontWeight: "600" }}>Sign in</Text>
                    <Text style={{ color: "#F8FAFC", fontSize: 17, fontWeight: "600", marginTop: 15 }}>Sign In to Your Account</Text>
                </View>

                <View style={{marginTop:50}}>
                    <View>
                        <Text style={{ color: "#F8FAFC", fontSize:18, fontWeight:"600"}}>Email</Text>
                        <TextInput  style ={{borderBottomColor:"#F8FAFC", borderBottomWidth:1, marginVertical:10, width:300}}
                            placeholderTextColor={"#F8FAFC"} 
                            placeholder='Enter email address '/>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </View>
    )
}

export default LoginScreen

const styles = StyleSheet.create({})