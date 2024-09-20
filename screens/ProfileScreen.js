import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, Button, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { auth, database, storage } from '../firebase'; 
import { updateProfile } from 'firebase/auth';
import { ref as databaseRef, set } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useNavigation } from '@react-navigation/native';

const ProfileScreen = () => {
  const [image, setImage] = useState(null);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const navigation = useNavigation();

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
      const user = auth.currentUser;

      // Upload image
      const storageReference = storageRef(storage, `profileImages/${user.uid}.jpg`);
      const response = await fetch(image);
      const blob = await response.blob();
      await uploadBytes(storageReference, blob);

      // Get image URL
      const imageUrl = await getDownloadURL(storageReference);

      // Update Firebase Auth profile
      await updateProfile(user, {
        displayName: name,
        photoURL: imageUrl,
      });

      // Save bio and image URL in Realtime Database
      const userRef = databaseRef(database, `users/${user.uid}`);
      await set(userRef, {
        name,
        bio,
        imageUrl,
      });

      Alert.alert('Profile saved successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error saving profile. Please try again later.');
    }
  };

  return (
    <View style={styles.container}>
      {image && <Image source={{ uri: image }} style={styles.previewImage} />}
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
      <Button title="Go to Chat" onPress={() => navigation.navigate('Chat')} color="#010C80" />
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
