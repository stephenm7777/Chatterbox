import React, { useState } from 'react';
import { View, FlatList, StyleSheet, Text, Pressable, Modal, TextInput, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getAuth, signOut, getDatabase, ref, child, get, query, orderByChild, equalTo } from '@firebase/database';

const ChatScreen = () => {
    const [conversations, setConversations] = useState([
        { id: '1', user: 'User 1', lastMessage: 'Hello', timestamp: '2024-05-01T12:00:00Z' },
        { id: '2', user: 'User 2', lastMessage: 'Hi there', timestamp: '2024-05-02T12:00:00Z' },
        { id: '3', user: 'User 3', lastMessage: 'Hey', timestamp: '2024-05-03T12:00:00Z' },
    ]);
    const navigation = useNavigation();
    const [showSignOut, setShowSignOut] = useState(false);
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [searchEmail, setSearchEmail] = useState('');
    const [searchResult, setSearchResult] = useState(null);

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

    const navigateToChat = () => {
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
            const searchQuery = query(usersRef, orderByChild('email'), equalTo(searchEmail));
            const snapshot = await get(searchQuery);
            if (snapshot.exists()) {
                setSearchResult(true);
                Alert.alert('User found', `User with email ${searchEmail} exists.`);
            } else {
                setSearchResult(false);
                Alert.alert('User not found', `User with email ${searchEmail} does not exist.`);
            }
        } catch (error) {
            console.error('Search error', error);
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
                        </View>
                    </View>
                </Pressable>
            </Modal>
            <FlatList
                data={conversations}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <Pressable onPress={navigateToChat} style={styles.conversation}>
                        <Text style={styles.user}>{item.user}</Text>
                        <Text style={styles.lastMessage}>{item.lastMessage}</Text>
                    </Pressable>
                )}
            />
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
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
});

export default ChatScreen;
