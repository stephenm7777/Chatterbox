import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Text, Pressable, Modal, TextInput, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getDatabase, ref, get, push, remove, onValue } from '@firebase/database';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { List } from 'react-native-paper';
import { Image } from 'expo-image';

const ChatScreen = () => {
    const [conversations, setConversations] = useState([]);
    const [messagePreview, setMessagePreview] = useState('');
    const navigation = useNavigation();
    const youser = getAuth().currentUser;
    const [showSignOut, setShowSignOut] = useState(false);
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [searchEmail, setSearchEmail] = useState('');
    const [searchUsername, setUsername] = useState('');
    const [searchResult, setSearchResult] = useState(null);
    const [foundUser, setFoundUser] = useState(null);
    const [expanded, setExpanded] = useState(false);
    const [photo, setPhoto] = useState(null);

    useEffect(() => {
        fetchConversations();
    }, [youser]);


    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
        if (youser) {
            fetchConversations();
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
        navigation.navigate("IndivdualChat");
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

    const setUserId = async (youser) => {
        const db = getDatabase();
        const usersRef = ref(db, 'users');
        const snapshot = await get(usersRef);

        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                childSnapshot.forEach((cs) => {
                    self = childSnapshot.val();
                    if (self.email.toLowerCase() === youser.email) {
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
                const selfRef = ref(db, 'users/' + youser.id + '/contacts');
                const toReceiver = {
                    id: youser.id,
                    user: youser.email
                };
                push(userRef, toReceiver);
                const toSender = {
                    id: foundUser.id,
                    user: foundUser.email
                }
                push(selfRef, toSender);
                navigation.navigate('IndivdualChat', { sender: 'You', receiver: foundUser.email });
            }
            catch (error) {
                console.log("send message error, " + error);
            }
        } else {
            Alert.alert('User not found', 'Please search for a user first.');
        }
    };

    const deleteMessage = async (conversationId) => {
        try {
            const db = getDatabase();
            const conversationRef = ref(db, `users/${youser.id}/contacts`);
            await remove(conversationRef);
            Alert.alert('Message deleted', 'The conversation has been deleted.');
            fetchConversations(); // Fetch updated conversations
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
                            <Text style={styles.user}>{item.user}</Text>
                            {/* <Text style={styles.lastMessage}>{item.lastMessage}</Text> */}
                        </View>
                        <Pressable onPress={() => deleteMessage(item.id)} style={styles.deleteButton}>
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
        resizeMode: 'cover',
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