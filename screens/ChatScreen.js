import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Text, Pressable, Modal, TextInput, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getAuth, signOut, getDatabase, ref, get, query, orderByChild, equalTo, remove } from '@firebase/database';

const ChatScreen = () => {
    const [conversations, setConversations] = useState([]);
    const [messagePreview, setMessagePreview] = useState('');
    const navigation = useNavigation();
    const [showSignOut, setShowSignOut] = useState(false);
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [searchEmail, setSearchEmail] = useState('');
    const [searchResult, setSearchResult] = useState(null);
    const [foundUser, setFoundUser] = useState(null); // State to store found user

    useEffect(() => {
        fetchConversations();
    }, []);

    const fetchConversations = async () => {
        try {
            const db = getDatabase();
            const conversationsRef = ref(db, 'conversations');
            const snapshot = await get(conversationsRef);

            if (snapshot.exists()) {
                const fetchedConversations = [];
                snapshot.forEach((childSnapshot) => {
                    const conversation = childSnapshot.val();
                    // Filter conversations where the user is participating
                    if (conversation.user1 === 'User' || conversation.user2 === 'User') {
                        fetchedConversations.push({ id: childSnapshot.key, ...conversation });
                    }
                });
                setConversations(fetchedConversations);
            }
        } catch (error) {
            console.error('Fetch conversations error', error);
        }
    };

    const signOutUser = async () => {
        try {
            const auth = getAuth();
            await signOut(auth);
            navigation.navigate('Login');
        } catch (error) {
            console.error('Sign out error', error);
        }
    };

    const toggleSignOut = () => {
        setShowSignOut(!showSignOut);
    };

    const toggleSearchModal = () => {
        setShowSearchModal(!showSearchModal);
    };

    const navigateToChat = (conversation) => {
        setMessagePreview(conversation.lastMessage);
        navigation.navigate("IndivdualChat");
    };

    const handleBackdropPress = () => {
        if (showSignOut) {
            toggleSignOut();
        }
        if (showSearchModal) {
            toggleSearchModal();
        }
    };

    const searchUser = async () => {
        try {
            const db = getDatabase();
            const usersRef = ref(db, 'users');
            const snapshot = await get(usersRef);

            if (snapshot.exists()) {
                let userExists = false;
                snapshot.forEach((childSnapshot) => {
                    if (childSnapshot.val() === searchEmail) {
                        userExists = true;
                        setFoundUser({ id: childSnapshot.key, email: searchEmail }); // Store found user
                        return;
                    }
                });

                if (userExists) {
                    setSearchResult(true);
                    Alert.alert('User found', `User with email ${searchEmail} exists.`);
                } else {
                    setSearchResult(false);
                    setFoundUser(null); // Clear found user
                    Alert.alert('User not found', `User with email ${searchEmail} does not exist.`);
                }
            } else {
                setSearchResult(false);
                Alert.alert('User not found', `User with email ${searchEmail} does not exist.`);
            }
        } catch (error) {
            console.error('Search error', error);
        }
    };
    
    const sendMessage = () => {
        if (foundUser) {
            navigation.navigate('IndivdualChat', { sender: 'You', receiver: foundUser.email });
        } else {
            Alert.alert('User not found', 'Please search for a user first.');
        }
    };

    const deleteMessage = async (conversationId) => {
        try {
            const db = getDatabase();
            const conversationRef = ref(db, `conversations/${conversationId}`);
            await remove(conversationRef);
            Alert.alert('Message deleted', 'The conversation has been deleted.');
            fetchConversations(); // Fetch updated conversations
        } catch (error) {
            console.error('Delete message error', error);
        }
    };

    return (
        <View style={styles.container}>
            <Pressable onPress={toggleSearchModal} style={styles.dropDown}>
                <Text style={styles.dropDownText}>Search Users</Text>
            </Pressable>
            <Pressable onPress={toggleSignOut} style={styles.signOutButton}>
                <Text style={styles.signOutText}>Sign Out</Text>
            </Pressable>
            <Modal
                animationType="slide"
                transparent={true}
                visible={showSearchModal}
                onRequestClose={toggleSearchModal}
            >
                <Pressable style={styles.modalBackdrop} onPress={handleBackdropPress}>
                    <View style={styles.modalView}>
                        <View style={styles.searchContainer}>
                            <Text style={styles.searchTitle}>Search Users</Text>
                            <TextInput
                                style={styles.searchInput}
                                value={searchEmail}
                                onChangeText={setSearchEmail}
                                placeholder="Enter user email"
                                placeholderTextColor="#999"
                            />
                            <Pressable onPress={searchUser} style={styles.searchButton}>
                                <Text style={styles.searchButtonText}>Search</Text>
                            </Pressable>
                            {searchResult !== null && (
                                <Text style={styles.searchResultText}>
                                    {searchResult ? 'User exists' : 'User does not exist'}
                                </Text>
                            )}
                            {foundUser && (
                                <Pressable onPress={sendMessage} style={styles.sendMessageButton}>
                                    <Text style={styles.sendMessageText}>Send Message</Text>
                                </Pressable>
                            )}
                        </View>
                    </View>
                </Pressable>
            </Modal>
            <FlatList
                data={conversations}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.conversation}>
                        <Pressable onPress={() => navigateToChat(item)}>
                            <Text style={styles.user}>
                                {item.user1 === 'User' ? item.user2 : item.user1}
                            </Text>
                            <Text style={styles.lastMessage}>{item.lastMessage}</Text>
                        </Pressable>
                        <Pressable onPress={() => deleteMessage(item.id)} style={styles.deleteButton}>
                            <Text style={styles.deleteButtonText}>Delete</Text>
                        </Pressable>
                    </View>
                )}
            />
            <Text style={styles.previewMessage}>{messagePreview}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#010C80',
        padding: 10,
    },
    conversation: {
        backgroundColor: '#F8FAFC',
        padding: 10,
        borderRadius: 8,
        marginBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    user: {
        color: '#010C80',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    lastMessage: {
        color: '#010C80',
        fontSize: 16,
    },
    deleteButton: {
        backgroundColor: '#FF0000',
        padding: 5,
        borderRadius: 5,
    },
    deleteButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
    },
    dropDown: {
        backgroundColor: '#F8FAFC',
        padding: 10,
        borderRadius: 8,
        marginBottom: 10,
        alignItems: 'center',
    },
    dropDownText: {
        color: '#010C80',
        fontSize: 16,
        fontWeight: 'bold',
    },
    signOutButton: {
        backgroundColor: '#FF0000',
        padding: 10,
        borderRadius: 8,
        marginBottom: 10,
        alignItems: 'center',
    },
    signOutText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    modalView: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'transparent', 
        justifyContent: 'flex-end',
    },
    searchContainer: {
        backgroundColor: '#FFFFFF',
        padding: 20,
        borderRadius: 8,
        width: '100%',
        alignItems: 'center',
    },
    searchTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    searchInput: {
        backgroundColor: '#F8FAFC',
        padding: 10,
        borderRadius: 8,
        width: '100%',
        marginBottom: 10,
    },
    searchButton: {
        backgroundColor: '#010C80',
        padding: 10,
        borderRadius: 8,
    },
    searchButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    searchResultText: {
        marginTop: 10,
        fontWeight: 'bold',
        color: '#010C80',
    },
    sendMessageButton: {
        backgroundColor: '#010C80',
        padding: 10,
        borderRadius: 8,
        marginBottom: 10,
        alignItems: 'center',
    },
    sendMessageText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    previewMessage: {
        color: '#FFFFFF',
        fontSize: 16,
        marginTop: 10,
    },
});

export default ChatScreen;
