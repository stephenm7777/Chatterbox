import { React, useState, useEffect } from 'react';
import { View, StyleSheet, Text, Pressable, TextInput, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { getAuth } from 'firebase/auth';
import { GestureHandlerRootView, ScrollView } from 'react-native-gesture-handler';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getDatabase, ref, onValue, update } from 'firebase/database';
import { Image } from 'expo-image';
import { Button } from 'react-native-paper';

const UserProfile = () => {
    const navigation = useNavigation();
    const youser = getAuth().currentUser;
    const [bio, setBio] = useState('');
    const [image, setImage] = useState(null);
    const [username, setUsername] = useState("");
    const [isEditing, setIsEditing] = useState(false); // toggle edit mode
    const db = getDatabase();

    useEffect(() => {
      const bioRef = ref(db, `users/${youser.id}/profile/bio`);
      const imageRef = ref(db, `users/${youser.id}/profile/imageURL`);
      const usernameRef = ref(db, `users/${youser.id}/profile/name`);

      onValue(bioRef, (snapshot) => setBio(snapshot.val()));
      onValue(imageRef, (snapshot) => setImage(snapshot.val()));
      onValue(usernameRef, (snapshot) => setUsername(snapshot.val()));
    }, [youser]);

    // function to pick an image from the camera roll
    const pickImage = async () => {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImage(result.assets[0].uri);
      }
    };

    // function to save profile changes
    const saveProfile = async () => {
      try {
        let imageUrl = image;
        if (image && image.startsWith("file")) {
          const storage = getStorage();
          const storageRefInstance = storageRef(storage, `profileImages/${youser.id}.jpg`);
          const response = await fetch(image);
          const blob = await response.blob();
          await uploadBytes(storageRefInstance, blob);
          imageUrl = await getDownloadURL(storageRefInstance);
        }
        // update the user's profile data in the database
        await update(ref(db, `users/${youser.id}/profile`), {
          bio,
          imageURL: imageUrl,
        });
        Alert.alert("Profile updated successfully!");
      } catch (error) {
        console.error("Error updating profile:", error);
        Alert.alert("An error occurred while updating your profile. Please try again later.");
      } finally {
        setIsEditing(false);
      }
    };
    

  return (

    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.navigate("Chat")} style={styles.backButton}>
          <Text style={styles.backButtonText}>Back</Text>
        </Pressable>
        <Pressable onPress={() => {
          if (isEditing) {
            saveProfile();  // Save changes when in editing mode
          }
          setIsEditing(!isEditing);  // Toggle edit mode
        }} style={styles.editButton}>
          <Text style={styles.editButtonText}>{isEditing ? "Save" : "Edit"}</Text>
        </Pressable>
      </View>

      <Pressable onPress={isEditing ? pickImage : null}>
        <Image source={{ uri: image }} style={styles.image} />
      </Pressable>

      <Text style={styles.username}>{username}</Text>

      {isEditing ? (
        <TextInput
          style={styles.bioInput}
          placeholder="Enter your bio here"
          value={bio}
          onChangeText={setBio}
          multiline
        />
      ) : (
        <GestureHandlerRootView style={{ height: '40%', paddingTop: '10%' }}>
          <ScrollView style={{ borderRadius: 8, borderWidth: 3 }}>
            <Text style={styles.userbio}>{bio}</Text>
          </ScrollView>
        </GestureHandlerRootView>
      )}

      {isEditing && <Button title="Save Changes" onPress={saveProfile} color="#25291C" />}
    </View>
  );
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
      justifyContent: 'space-between',
    },
    backButton: {
      marginTop: 20,
      marginBottom: 20,
      backgroundColor: '#FFFFFF',
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 8,
    },
    backButtonText: {
      color: '#25291C',
    },
    editButton: {
      backgroundColor: '#25291C',
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 8,
    },
    editButtonText: {
      color: '#FFFFFF',
    },
    image: {
        width: 200,
        height: 200,
        backgroundColor: 'black',
        alignSelf: 'center',
        borderRadius: 100,
        marginVertical: 20,
    },
    username: {
        width: '100%',
        textAlign: 'center',
        paddingTop: 50,
        fontSize: 28,
        fontWeight: '800'
    },
    bioInput: {
      width: '80%',
      padding: 10,
      backgroundColor: '#FFFFFF',
      borderRadius: 8,
      textAlign: 'center',
      color: '#25291C',
      marginBottom: 20,
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
