import { React, useState, useEffect } from 'react';
import { View, KeyboardAvoidingView, FlatList, StyleSheet, Text, Pressable, Modal, TextInput, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getAuth } from 'firebase/auth';
import { GestureHandlerRootView, ScrollView } from 'react-native-gesture-handler';
import { getDatabase, ref, onValue } from 'firebase/database';
import { Image } from 'expo-image';

const UserProfile = () => {
    const navigation = useNavigation();
    const youser = getAuth().currentUser;
    const [bio, setBio] = useState('');
    const [image, setImage] = useState(null);
    const [username, setUsername] = useState("");
    const db = getDatabase();

    useEffect(() => {
      const bioRef = ref(db, `users/${youser.id}/profile/bio`);
      const imageRef = ref(db, `users/${youser.id}/profile/imageURL`);
      const usernameRef = ref(db, `users/${youser.id}/profile/name`);

      onValue(bioRef, (snapshot) => {
        const bio = snapshot.val();
        setBio(bio);
      });

      onValue(imageRef, (snapshot) => {
        const imageURL = snapshot.val();
        setImage(imageURL);
      });

      onValue(usernameRef, (snapshot) => {
        const usernameVal = snapshot.val();
        setUsername(usernameVal);
      });

    }, []);

    return (
        <View style={styles.container} >
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
            <Pressable onPress={() => null}>
                <Image source = {{uri: image}} style={styles.image} />
            </Pressable>
            <Text style={styles.username}>{username}</Text>
            <GestureHandlerRootView style={{height: '40%', paddingTop: '10%'}}>
                <ScrollView style={{borderRadius: 8, borderWidth: 3}}>
                    <Text style={styles.userbio}>{bio}</Text>
                    {/* <Pressable onPress={() => null}>
                        <Icon></Icon>
                    </Pressable> */}
                </ScrollView>
            </GestureHandlerRootView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#E3E7D3',
      padding: 10
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    image: {
        width: 200,
        height: 200,
        backgroundColor: 'black',
        alignSelf: 'center'
    },
    username: {
        width: '100%',
        textAlign: 'center',
        paddingTop: 50,
        fontSize: 28,
        fontWeight: '800'
    },
    userbio: {
        width: '80%',
        alignSelf: 'center',
        textAlign: 'center',
        paddingTop: 25,
        fontSize: 16
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
      backgroundColor: '#F8FAFC',
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

export default UserProfile;
