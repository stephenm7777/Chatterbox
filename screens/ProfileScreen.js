import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, Button, Image, Alert, Pressable, Text } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { getAuth, updateProfile } from 'firebase/auth'; // Update import
import { getDatabase, ref, set } from 'firebase/database'; // Update import
import { getStorage, ref as storageRef, uploadString, getDownloadURL } from 'firebase/storage'; // Update import
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
      const auth = getAuth();
      const user = auth.currentUser;

      // Upload image
      const storage = getStorage();
      const storageRef = storageRef(storage, `profileImages/${user.uid}.jpg`);
      await uploadString(storageRef, image, 'data_url');

      // Get image URL
      const imageUrl = await getDownloadURL(storageRef);

      // Update profile
      await updateProfile(user, {
        displayName: name,
        photoURL: imageUrl,
      });

      // Update bio in database
      const db = getDatabase();
      const userRef = ref(db, `users/${user.uid}`); // Reference to the user's node
      await set(userRef, {
        name,
        bio,
      });

      Alert.alert('Profile saved successfully!');
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
      <Pressable
          onPress={() => navigation.navigate("Chat")}
          style={({ pressed }) => [
            {
              marginTop: 20,
              marginBottom: 20,
              backgroundColor: '#F8FAFC',
              paddingVertical: 10,
              paddingHorizontal: 20,
              borderRadius: 8,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <Text style={{ textAlign: "center", color: '#010C80' }}>Back</Text>
        </Pressable>
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
