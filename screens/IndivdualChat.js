import React, { useState, useEffect } from 'react';
import { KeyboardAvoidingView, Pressable, StyleSheet, Text, TextInput, View, FlatList, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getDatabase, ref, push, remove, onValue } from '@firebase/database';

const IndividualChat = () => {
  const [sentMessages, setSentMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const navigation = useNavigation();

  useEffect(() => {
    const db = getDatabase();
    const messagesRef = ref(db, 'messages');

    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const messages = [];
      snapshot.forEach((childSnapshot) => {
        messages.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });
      setSentMessages(messages.reverse());
    });

    return () => unsubscribe();
  }, []);

  const handleSend = () => {
    if (newMessage.trim() === "") return;

    const db = getDatabase();
    const messagesRef = ref(db, 'messages');
    
    push(messagesRef, {
      text: newMessage.trim(),
      timestamp: new Date().toISOString()
    }).then(() => {
      setNewMessage("");
    }).catch(error => {
      console.error("Error sending message:", error);
    });
  };

  const handleDelete = (id) => {
    Alert.alert(
      'Delete Message',
      'This action will delete the message only for you. The other user can still see it.',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          onPress: () => {
            const db = getDatabase();
            const messageRef = ref(db, `messages/${id}`);
            remove(messageRef);
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.navigate("Chat")}
          style={({ pressed }) => [
            {
              marginTop: 20,
              marginBottom: 20, 
              backgroundColor: '#F8FAFC', 
              paddingVertical: 10,
              paddingHorizontal: 20,
              borderRadius: 8,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <Text style={{ textAlign: "center", color: '#010C80' }}>Back</Text>
        </Pressable>
      </View>
      <FlatList
        data={sentMessages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.messageContainer}>
            <Text style={styles.messageText}>{item.text}</Text>
            <Pressable onPress={() => handleDelete(item.id)} style={styles.deleteButton}>
              <Text style={styles.deleteButtonText}>Delete</Text>
            </Pressable>
          </View>
        )}
        inverted={true}
      />
      <KeyboardAvoidingView behavior="padding" style={styles.inputContainer}>
        <TextInput
          value={newMessage}
          onChangeText={setNewMessage}
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor="#010C80"
        />
        <Pressable onPress={handleSend} style={styles.sendButton}>
          <Text style={styles.sendButtonText}>Send</Text>
        </Pressable>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#010C80',
    padding: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
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
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  messageText: {
    color: '#010C80',
    fontSize: 16,
    flex: 1,
  },
  deleteButton: {
    backgroundColor: '#FF0000',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
});

export default IndividualChat;