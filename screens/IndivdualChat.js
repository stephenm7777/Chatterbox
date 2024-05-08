import React, { useState } from 'react';
import { KeyboardAvoidingView, Pressable, StyleSheet, Text, TextInput, View, FlatList } from 'react-native';

const IndivdualChat = () => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");

    const handleSend = () => {
        if (newMessage.trim() === "") return;

        setMessages(prevMessages => [
            ...prevMessages,
            {
                id: Math.random().toString(),
                text: newMessage.trim(),
                timestamp: new Date().toISOString()
            }
        ]);
        setNewMessage("");
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#010C80', padding: 10 }}>
            <FlatList
                inverted
                data={messages}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.messageContainer}>
                        <Text style={styles.messageText}>{item.text}</Text>
                    </View>
                )}
            />
            <KeyboardAvoidingView behavior="padding" style={styles.inputContainer}>
                <TextInput
                    value={newMessage}
                    onChangeText={setNewMessage}
                    style={styles.input}
                    placeholder="Type a message..."
                    placeholderTextColor="#F8FAFC"
                />
                <Pressable onPress={handleSend} style={styles.sendButton}>
                    <Text style={styles.sendButtonText}>Send</Text>
                </Pressable>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
    },
    input: {
        flex: 1,
        backgroundColor: '#F8FAFC',
        padding: 12,
        borderRadius: 8,
        marginRight: 10,
        color: '#010C80',
    },
    sendButton: {
        backgroundColor: '#F8FAFC',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    sendButtonText: {
        color: '#010C80',
        fontWeight: 'bold',
        fontSize: 16,
    },
    messageContainer: {
        backgroundColor: '#F8FAFC',
        padding: 10,
        borderRadius: 8,
        marginBottom: 10,
        maxWidth: '80%',
    },
    messageText: {
        color: '#010C80',
        fontSize: 16,
    },
});

export default IndivdualChat