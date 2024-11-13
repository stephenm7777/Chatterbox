import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Text, Pressable, Modal, TextInput, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getDatabase, ref, get, push, remove, onValue } from '@firebase/database';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { List } from 'react-native-paper';
import { Image } from 'expo-image';

const ChatScreen = () => {
    const [conversations, setConversations] = useState([]);
    const navigation = useNavigation();
    const youser = getAuth().currentUser;
    const [showSignOut, setShowSignOut] = useState(false);
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [searchEmail, setSearchEmail] = useState('');
    const [searchResult, setSearchResult] = useState(null);
    const [foundUser, setFoundUser] = useState(null);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        const usersRef = ref(getDatabase(), 'users');
        onValue(usersRef, (snapshot) => {
            fetchConversations();
        });
    }, [youser]);


    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
        if (youser) {
            // fetchConversations();
        } else {
            console.log("N/A");
        }
    });

    const fetchConversations = async () => {
        try {
            const db = getDatabase();
            await setUserId(youser);
            const conversationsRef = ref(db, `users/${youser.id}/contacts`);
            const snapshot = await get(conversationsRef);
            if (snapshot.exists()) {
                const fetchedConversations = [];
                snapshot.forEach((childSnapshot) => {
                    fetchedConversations.push({ id: childSnapshot.key, ...childSnapshot.val() });
                });
                setConversations(fetchedConversations);
            }
            else {
                setConversations([]);
            }
        } catch (error) {
            console.error('Fetch conversations error', error);
        }
    };

    const getUserPhoto = (item) => {
        const db = getDatabase();
        const photoRef = ref(db, `users/${item.id}/profile/imageURL`);
        let photoURL;
        onValue(photoRef, (sShot) => { 
            photoURL = sShot.val();
        });
        return photoURL;
    }

    const getUsername = (item) => {
        const db = getDatabase();
        const usernameRef = ref(db, `users/${item.id}/profile/name`);
        let name;
        onValue(usernameRef, (sShot) => { 
            name = sShot.val();
        });
        return name;
    };

    const navigateToOtherProfile = (item) => {
        navigation.navigate("OtherProfile", { user: item });
    }

    const performSignOut = async () => {
        try {
            console.log("Signing out user...");
            await signOut(getAuth());
            navigation.navigate('Home');
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
        navigation.navigate("IndivdualChat", {conversationId: conversation.conversationId, receiver: conversation.id});
    };

    const navigateToProfile = async () => {
        try {
            const db = getDatabase();
            const userRef = ref(db, 'users/' + youser.id + '/profile/');

            const snapshot = await get(userRef);
            if (snapshot.exists()) {
                navigation.navigate("UserProfile");
            }
            else {
                navigation.navigate("Profile");
            }
        }
        catch (error) {
            console.log("An error occurred:", error);
        }
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
                    childSnapshot.forEach((cs) => {
                        if (cs.val() === searchEmail) {
                            if(cs.val().toLowerCase() == youser.email) {
                                return;
                            }
                            userExists = true;
                            setFoundUser({ id: childSnapshot.key, email: searchEmail }); // Store found user
                            return;
                        }
                    });
                });

                if (userExists) {
                    setSearchResult(true);
                    Alert.alert('User found', `User with email ${searchEmail} exists.`);
                } else {
                    setSearchResult(false);
                    setFoundUser(null); // Clear found user
                    if(searchEmail.toLowerCase() === youser.email) {
                        Alert.alert("You can't message yourself");
                    }
                    else {
                        Alert.alert('User not found', `User with email ${searchEmail} does not exist.`);
                    }
                }
            } else {
                setSearchResult(false);
                Alert.alert('User not found', `User with email ${searchEmail} does not exist.`);
            }
        } catch (error) {
            console.error('Search error', error);
        }
    };

    const setUserId = async (youser) => {
        const db = getDatabase();
        const usersRef = ref(db, 'users');
        const snapshot = await get(usersRef);

        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                childSnapshot.forEach((cs) => {
                    self = childSnapshot.val();
                    if (self.email && self.email.toLowerCase() === youser.email) {
                        youser.id = childSnapshot.key;
                    }
                });
            });
        }
    };

    const sendMessage = async () => {
        if (foundUser) {
            try {
                const db = getDatabase();
                const usersRef = ref(db, 'users');

                setUserId(youser);
                const userRef = ref(db, 'users/' + foundUser.id + '/contacts');
                const snapshot = await get(userRef);
                if (snapshot.exists()) {
                    snapshot.forEach((childSnapshot) => {
                        cs = childSnapshot.val();
                        if (cs.id === youser.id) {
                            alert("conversation with user already exists");
                            throw Error("conversation already exists");
                        }
                    });
                }
                const messagesRef = ref(db, 'messages/');
                const contactId = await push(messagesRef, {});
                const selfRef = ref(db, 'users/' + youser.id + '/contacts');
                const toReceiver = {
                    id: youser.id,
                    user: youser.email,
                    conversationId: contactId.key
                };
                push(userRef, toReceiver);
                const toSender = {
                    id: foundUser.id,
                    user: foundUser.email,
                    conversationId: contactId.key
                }
                push(selfRef, toSender);
                navigation.navigate('IndivdualChat', { sender: 'You', receiver: foundUser.id, conversationId: contactId.key });
            }
            catch (error) {
                console.log("send message error, " + error);
            }
        } else {
            Alert.alert('User not found', 'Please search for a user first.');
        }
    };

    const deleteMessage = async (item) => {
        try {
            const db = getDatabase();
            let convoKey;
            const messageRef = ref(db, `messages/${item.conversationId}`);
            const conversationRef = ref(db, `users/${youser.id}/contacts`);
            const receiverRef = ref(db, `users/${item.id}/contacts`);
            let snapshot = await get(conversationRef);
            snapshot.forEach((childSnapshot) => {
                childSnapshot.forEach((cs) => {
                    if(cs.val() === item.conversationId) {
                        convoKey = childSnapshot.key;
                    }
                });
            });
            const youserConvoRef = ref(db, `users/${youser.id}/contacts/${convoKey}`);
            snapshot = await get(receiverRef);
            snapshot.forEach((childSnapshot) => {
                childSnapshot.forEach((cs) => {
                    if(cs.val() === item.conversationId) {
                        convoKey = childSnapshot.key;
                    }
                });
            });
            const userConvoRef = ref(db, `users/${item.id}/contacts/${convoKey}`);
            await remove(youserConvoRef);
            await remove(userConvoRef);
            await remove(messageRef);
            fetchConversations(); // Fetch updated conversations
            Alert.alert('Message deleted', 'The conversation has been deleted.');
        } catch (error) {
            console.error('Delete message error', error);
        }
    };

    return (
        <View style={styles.container}>
            <List.Section style={styles.listSection}>
                <List.Accordion
                    title="Options"
                    left={props => <List.Icon {...props} icon="equal" />}
                    expanded={expanded}
                    onPress={() => setExpanded(!expanded)}
                >
                    <List.Item
                        title="Search Users"
                        onPress={toggleSearchModal}
                        left={props => <List.Icon {...props} icon="account-search" />}
                    />
                    <List.Item
                        title="Sign Out"
                        onPress={performSignOut}
                        left={props => <List.Icon {...props} icon="logout" />}
                    />
                    <List.Item
                        title="Profile"
                        onPress={navigateToProfile}
                        left={props => <List.Icon {...props} icon="account" />}
                    />
                </List.Accordion>
            </List.Section>
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
                    <Pressable style={styles.conversation} onPress={() => navigateToChat(item)}>
                        <View style={styles.pressableConversation}>
                            <Pressable onPress={() => navigateToOtherProfile(item)}>
                                <Image source={getUserPhoto(item)} style={styles.previewImage} />
                            </Pressable>
                            <View style={{flexDirection: 'column'}}>
                                <Text style={styles.user}>{getUsername(item)}</Text>
                                <Text style={styles.lastMessage}>{item.lastMessage}</Text>
                            </View>
                        </View>
                        <Pressable onPress={() => deleteMessage(item)} style={styles.deleteButton}>
                            <Text style={styles.deleteButtonText}>Delete</Text>
                        </Pressable>
                    </Pressable>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E3E7D3',
        padding: 10,
    },
    listSection: {
        marginTop: 20,
    },
    previewImage: {
        width: 50,
        height: 50,
        contentFit: 'cover',
        marginRight: 5,
        borderRadius: 100,
    },
    conversation: {
        backgroundColor: '#E3E7D3', //#E3E7D3
        padding: 10,
        borderRadius: 8,
        marginBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    pressableConversation: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center'
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
});

export default ChatScreen;