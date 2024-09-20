import React, { useState, useEffect } from 'react';
import { KeyboardAvoidingView, Pressable, StyleSheet, Text, TextInput, View, FlatList, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getDatabase, ref, get, push, remove, onValue, update } from '@firebase/database';
import { getAuth } from 'firebase/auth';
import { LongPressGestureHandler, State, GestureHandlerRootView } from 'react-native-gesture-handler';

const IndividualChat = () => {
  const [sentMessages, setSentMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const navigation = useNavigation();
  const currentUser = getAuth().currentUser;

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

  const handleSend = async () => {
    if (newMessage.trim() === "") return;

    if (!currentUser) return;

    try {
      const db = getDatabase();
      const messagesRef = ref(db, 'messages');

      const message = {
        text: newMessage.trim(),
        senderId: currentUser.uid,
        timestamp: new Date().toISOString()
      };

      await push(messagesRef, message);
      setNewMessage("");

      const updateContacts = async (userId) => {
        const contactRef = ref(db, `users/${userId}/contacts`);
        const snapshot = await get(contactRef);

        snapshot.forEach((childSnapshot) => {
          const contactId = childSnapshot.key;
          update(ref(db, `users/${userId}/contacts/${contactId}`), {
            lastMessage: message.text,
            timestamp: message.timestamp
          });
        });
      };

      await updateContacts(currentUser.uid);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleDelete = (id) => {
    Alert.alert(
      'Delete Message',
      'This action will delete the message.',
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

  const renderMessage = ({ item }) => {
    const isSender = item.senderId === currentUser.uid;

    return (
      <LongPressGestureHandler
        onHandlerStateChange={({ nativeEvent }) => {
          if (nativeEvent.state === State.ACTIVE) {
            handleDelete(item.id);
          }
        }}
      >
        <View style={[styles.messageContainer, isSender ? styles.sender : styles.receiver]}>
          <Text style={styles.messageText}>{item.text}</Text>
        </View>
      </LongPressGestureHandler>
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation.navigate("Chat")}
            style={({ pressed }) => [
              {
                marginTop: 20,
                marginBottom: 20,
                backgroundColor: '#FFFFFF',
                paddingVertical: 10,
                paddingHorizontal: 20,
                borderRadius: 8,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <Text style={{ color: '#25291C' }}>Back</Text>
          </Pressable>
        </View>

        <FlatList
          data={sentMessages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          inverted={true}
        />

        <KeyboardAvoidingView behavior="padding" style={styles.inputContainer}>
          <TextInput
            value={newMessage}
            onChangeText={setNewMessage}
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor="#25291C"
          />
          <Pressable onPress={handleSend} style={styles.sendButton}>
            <Text style={styles.sendButtonText}>Send</Text>
          </Pressable>
        </KeyboardAvoidingView>
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E3E7D3',
    padding: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderTopColor: '#E3E7D3',
  },
  input: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
    marginRight: 10,
    color: '#25291C',
  },
  sendButton: {
    backgroundColor: '#F8FAFC',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  sendButtonText: {
    color: '#25291C',
    fontWeight: 'bold',
    fontSize: 16,
  },
  messageContainer: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    maxWidth: '75%',
  },
  sender: {
    backgroundColor: '#AEEEEE',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 0,
  },
  receiver: {
    backgroundColor: '#F8FAFC',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 0,
  },
  messageText: {
    color: '#25291C',
    fontSize: 16,
  },
});

export default IndividualChat;
