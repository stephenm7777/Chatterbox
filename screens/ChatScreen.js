import React, { useState } from 'react';
import { View, FlatList, StyleSheet, Text, Pressable, Modal, TextInput, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getAuth, signOut } from '@firebase/auth';

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

    const signOutUser = async () => {
        try {
            const auth = getAuth();
            await signOut(auth);
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

    const searchUser = () => {
        // Add your search logic here
        Alert.alert('Searching', `Searching for user with email: ${searchEmail}`);
        setSearchEmail('');
        toggleSearchModal();
    };

    return (
        <View style={styles.container}>
            <Pressable onPress={toggleSignOut} style={styles.dropDown}>
                <Text style={styles.dropDownText}>Options</Text>
            </Pressable>
            <Modal
                animationType="slide"
                transparent={true}
                visible={showSignOut || showSearchModal}
                onRequestClose={handleBackdropPress}
            >
                <Pressable style={styles.modalBackdrop} onPress={handleBackdropPress}>
                    <View style={styles.modalView}>
                        {showSignOut && (
                            <Pressable onPress={signOutUser} style={styles.optionButton}>
                                <Text style={styles.optionText}>Sign Out</Text>
                            </Pressable>
                        )}
                        {showSearchModal && (
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
                            </View>
                        )}
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
        marginTop: 30, 
        alignItems: 'center',
    },
    dropDownText: {
        color: '#010C80',
        fontSize: 16,
        fontWeight: 'bold',
    },
    modalView: {
        backgroundColor: '#FFFFFF',
        padding: 20,
        borderRadius: 8,
    },
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    optionButton: {
        backgroundColor: '#FF0000',
        padding: 10,
        borderRadius: 8,
        marginBottom: 10,
        alignItems: 'center',
    },
    optionText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    searchContainer: {
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
});

export default ChatScreen;
