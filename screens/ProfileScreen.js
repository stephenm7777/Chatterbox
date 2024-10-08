import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, Button, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { getAuth, updateProfile } from 'firebase/auth'; // Update import
import { getDatabase, ref, set, get, child } from 'firebase/database'; // Update import
import { getStorage, ref as sRef, uploadBytes, getDownloadURL } from 'firebase/storage'; // Update import

const ProfileScreen = () => {
    const [image, setImage] = useState(null);
    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const navigation = useNavigation();
    const youser = getAuth().currentUser;

    useEffect(() => {
        (async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Sorry, we need camera roll permissions to make this work!');
            }
        })();
    }, []);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.cancelled) {
            setImage(result.uri);
        }
    };

    const saveProfile = async () => {
        try {
            const auth = getAuth();
            const user = auth.currentUser;
            // Update bio in database
            const db = getDatabase();

            // Upload image
            const storage = getStorage();
            const storageRef = sRef(storage, "profileImages/" + youser.id + ".jpg");
            await uploadBytes(storageRef, image);

            // Get image URL
            const imageUrl = await getDownloadURL(storageRef);
            let uniqueUsername = true;

            const userRef = ref(db, `users/${user.id}/profile/`); // Reference to the user's node

            // Update profile
            await updateProfile(user, {
                displayName: name,
                photoURL: imageUrl
            });


            await set(userRef, {
                name,
                bio,
            });
            Alert.alert('Profile saved successfully!');
            navigation.navigate("Chat");
        } catch (error) {
            console.error('Error saving profile:', error);
            Alert.alert('Error saving profile. Please try again later.');
        }
    };


    return (
        <View style={styles.container}>
            {image && (
                <Image source={{ uri: image }} style={styles.previewImage} />
            )}
            <View style={styles.imageContainer}>
                <Button title="Pick an image from camera roll" onPress={pickImage} color="#010C80" />
            </View>
            <TextInput
                style={styles.input}
                placeholder="Name"
                value={name}
                onChangeText={setName}
                placeholderTextColor="#010C80"
            />
            <TextInput
                style={styles.input}
                placeholder="Bio"
                multiline
                value={bio}
                onChangeText={setBio}
                placeholderTextColor="#010C80"
            />
            <Button title="Save" onPress={saveProfile} color="#010C80" />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#010C80',
    },
    imageContainer: {
        marginBottom: 20,
    },
    previewImage: {
        width: 200,
        height: 200,
        resizeMode: 'cover',
        marginBottom: 10,
        borderRadius: 100,
    },
    input: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        padding: 10,
        marginBottom: 10,
        borderRadius: 5,
        color: '#010C80',
    },
});

export default ProfileScreen;
