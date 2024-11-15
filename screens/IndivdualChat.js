import React, { useState, useEffect } from 'react';
import { KeyboardAvoidingView, Pressable, StyleSheet, Text, TextInput, View, FlatList, Alert, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native'; // Import GestureHandlerRootView
import { getDatabase, ref, get, push, remove, onValue, update, child } from '@firebase/database';
import { getAuth } from 'firebase/auth';
import { LongPressGestureHandler, State, GestureHandlerRootView } from 'react-native-gesture-handler';

const IndividualChat = () => {
  const [sentMessages, setSentMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [ouID, setOtherUserId] = useState("");
  const navigation = useNavigation();
  const youser = getAuth().currentUser;
  const route = useRoute();
  const otherUserId = route.params?.receiver;
  const convoId = route.params?.conversationId;
  const receiverName = route.params?.receiverName;


  useEffect(() => {
    const db = getDatabase();
    getUserCoversation();
    const messagesRef = ref(db, `messages/${convoId}`);
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

  const getUserCoversation = async() => {
    const db = getDatabase();
    const convoRef = ref(db, `users/${otherUserId}/contacts`);
    const snapshot = await get(convoRef);
    snapshot.forEach((childSnapshot) => {
      childSnapshot.forEach((cs) => {
        if(cs.val() === convoId) {
          setOtherUserId(childSnapshot.key);
          return;
        }
      });
    });
  };

  const handleSend = async () => {
    if (newMessage.trim() === "") return;

    const currentUser = getAuth().currentUser;
    if (!currentUser) return;

    try {
      const db = getDatabase();
      const messagesRef = ref(db, `messages/${convoId}`);
      const message = {
        text: newMessage.trim(),
        timestamp: new Date().toISOString(),
        senderId: youser.id
      };

      await push(messagesRef, message);
      setNewMessage("");
      const updateContacts = async (userId) => {
        const contactRef = ref(db, `users/${userId}/contacts`);
        const snapshot = await get(contactRef);
        snapshot.forEach((childSnapshot) => {
          const contactId = childSnapshot.key;
          childSnapshot.forEach((cs) => {
            if(cs.val() === convoId) {
              update(ref(db, `users/${userId}/contacts/${contactId}`), {
                lastMessage: message.text,
                timestamp: message.timestamp
              });
              update(ref(db, `users/${otherUserId}/contacts/${ouID}`), {
                lastMessage: message.text,
                timestamp: message.timestamp
              });
            }
          });
        });
      };
      getUserCoversation();
      updateContacts(youser.id);
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
          onPress: async() => {
            const db = getDatabase();
            const messageRef = ref(db, `messages/${convoId}/${id}`);
            await remove(messageRef);

            const updateContacts = async (userId) => {
              const contactRef = ref(db, `users/${userId}/contacts`);
              const snapshot = await get(contactRef);
              snapshot.forEach((childSnapshot) => {
                const contactId = childSnapshot.key;
                childSnapshot.forEach((cs) => {
                  if(cs.val() === convoId) {
                    if(sentMessages.length === 1) {
                      update(ref(db, `users/${userId}/contacts/${contactId}`), {
                        lastMessage: '',
                        timestamp: null
                      });
                      update(ref(db, `users/${otherUserId}/contacts/${ouID}`), {
                        lastMessage: '',
                        timestamp: null
                      });
                    }
                    else if(sentMessages[0].id === id){
                      update(ref(db, `users/${userId}/contacts/${contactId}`), {
                        lastMessage: sentMessages[1].text,
                        timestamp: sentMessages[1].timestamp
                      });
                      update(ref(db, `users/${otherUserId}/contacts/${ouID}`), {
                        lastMessage: sentMessages[1].text,
                        timestamp: sentMessages[1].timestamp
                      });
                    }
                  }
                });
              });
            };
            updateContacts(youser.id);
          }
        }
      ]
    );
  };

  return (
    <GestureHandlerRootView>
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
          <Text style={{
            position: 'absolute', 
            textAlign: 'center', 
            width: '50%', 
            marginLeft: '25%',
            fontSize: 20,
            fontWeight: '700'
            }}>
            {receiverName}
          </Text>
        </View>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <FlatList
            data={sentMessages}
            scrollEnabled={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <LongPressGestureHandler
                onHandlerStateChange={({ nativeEvent }) => {
                  if (nativeEvent.state === State.ACTIVE) {
                    handleDelete(item.id); 
                  }
                }}
              >
                <View style={item.senderId === youser.id ? styles.messageContainer : styles.messageContainerReceiver}>
                  <Text style={styles.messageText}>{item.text}</Text>
                </View>
              </LongPressGestureHandler>
            )}
            inverted={true}
          />
        </ScrollView>
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
    backgroundColor: '#F8FAFC', //sender color 
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    maxWidth: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  messageContainerReceiver: {
    backgroundColor: '#c1eCf0', //receiver color
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    maxWidth: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  messageText: {
    color: '#25291C',
    fontSize: 16,
    flex: 1,
  },
});

export default IndividualChat;
