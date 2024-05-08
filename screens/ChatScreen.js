import React, { useState } from 'react';
import { KeyboardAvoidingView, Pressable, StyleSheet, Text, TextInput, View, Image, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getAuth, signInWithEmailAndPassword } from '@firebase/auth';

const ChatScreen = () => {
    const navigation = useNavigation();
    return (
        <View style={{ flex: 1, backgroundColor: "#010C80", padding: 10, alignItems: "center" }}>
            <Text>Chat Screen</Text>
            <Pressable onPress={() => navigation.navigate("IndivdualChat")} style={{ marginTop: 15 }}>
                <Text style={{ textAlign: "center", color: '#F8FAFC' }}>Forgot Password?</Text>
            </Pressable>
        </View>
    );
}

export default ChatScreen;
