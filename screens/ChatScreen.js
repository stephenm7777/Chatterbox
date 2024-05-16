import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Text, Pressable, Modal, TextInput, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { signOut, getDatabase, ref, get, push, remove } from '@firebase/database';
import { Timestamp } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const ChatScreen = () => {
    const [conversations, setConversations] = useState([]);
    const [messagePreview, setMessagePreview] = useState('');
    const navigation = useNavigation();
    const youser = getAuth().currentUser;
    const [showSignOut, setShowSignOut] = useState(false);
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [searchEmail, setSearchEmail] = useState('');
    const [searchResult, setSearchResult] = useState(null);
    const [foundUser, setFoundUser] = useState(null);

    useEffect(() => {
        fetchConversations();
    }, []);

    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
        if(user) {
            fetchConversations();
        }
        else {
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
                    fetchedConversations.push({id: childSnapshot.key, ...childSnapshot.val()});
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

    const navigateToProfile = () => {
        navigation.navigate("Profile");
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

    const setUserId = async(youser) => {
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
            try{
                const db = getDatabase();
                const usersRef = ref(db, 'users');

                setUserId(youser);
                const userRef = ref(db, 'users/'+foundUser.id+'/contacts');
                const snapshot = await get(userRef);
                if(snapshot.exists()) {
                    snapshot.forEach((childSnapshot) => {
                        cs = childSnapshot.val();
                        if(cs.id === youser.id) {
                            alert("conversation with user already exists");
                            throw Error("conversation already exists");
                        }
                    });
                }
                const selfRef = ref(db, 'users/'+youser.id+'/contacts');
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
            catch(error) {
                console.log("send message error, " + error);
            }
        } else {
            Alert.alert('User not found', 'Please search for a user first.');
        }
    };

    const deleteMessage = async (conversationId) => {
        try {
            const db = getDatabase();
            // unsafe deletion
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
            <Pressable onPress={toggleSearchModal} style={styles.dropDown}>
                <Text style={styles.dropDownText}>Search Users</Text>
            </Pressable>
            <Pressable onPress={toggleSignOut} style={styles.signOutButton}>
                <Text style={styles.signOutText}>Sign Out</Text>
            </Pressable>
            <Pressable onPress={navigateToProfile} style={styles.profileButton}>
                <Text style={styles.profileButtonText}>Profile</Text>
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
                                {/* Change this to usernames down the line*/}
                                {item.user.toLowerCase() === youser.email ? item.user2 : item.user.toLowerCase()}
                            </Text>
                            <Text style={styles.lastMessage}>{item.lastMessage}</Text>
                        </Pressable>
                        <Pressable onPress={() => deleteMessage(item.id)} style={styles.deleteButton}>
                            <Text style={styles.deleteButtonText}>Delete</Text>
                        </Pressable>
                    </View>
                )}
            />
            {/* <Text style={styles.previewMessage}>{messagePreview}</Text> */}
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
    profileButton: {
        backgroundColor: '#010C80',
        padding: 10,
        borderRadius: 8,
        marginBottom: 10,
        alignItems: 'center',
    },
    profileButtonText: {
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
