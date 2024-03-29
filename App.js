import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, Image, StatusBar } from 'react-native';
import * as Google from 'expo-auth-session/providers/google'; // Corrected import statement
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';

WebBrowser.maybeCompleteAuthSession();

export default function App() {
  const [userInfo, setUserInfo] = useState(null);
  const [request, response, promptAsync] = Google.useAuthRequest({

    expoClientId:
     "612225507521-jr2pg3kdjkjhntd7e3orlkh5p8n5rt6i.apps.googleusercontent.com",
    androidClientId:
     "612225507521-ieodvlm5hutjo1i8jhh91l0ea7rkh0fb.apps.googleusercontent.com",
    iosClientId:
     "612225507521-vcnmhcopl9omhhr5llkh2sb9f6b42dvs.apps.googleusercontent.com",
    webClientId:
     "612225507521-hbe23qfq0jqnef4747vkrl5fj8uvalr9.apps.googleusercontent.com",
    scopes: ["profile", "email"],
  });

  useEffect(() => {
    if (response?.type === 'success') {
      getUserInfo(response.authentication.accessToken);
    }
  }, [response]);

  useEffect(() => {
    async function loadUserInfo() {
      const user = await getLocalUser();
      if (user) {
        setUserInfo(user);
      }
    }
    loadUserInfo();
  }, []);

  const getLocalUser = async () => {
    try {
      const data = await AsyncStorage.getItem("@user");
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error retrieving user from AsyncStorage:', error);
      return null;
    }
  };

  const getUserInfo = async(token) => {
    if (!token) return;
  
    try {
      const response = await fetch (
        "https://www.googleapis.com/userinfo/v2/me",
        {
          headers : { Authorization: `Bearer ${token}`},
        }
      );
  
      if (!response.ok) {
        throw new Error('Failed to fetch user info');
      }
  
      const user = await response.json();
      console.warn(user);
      await AsyncStorage.setItem("@user", JSON.stringify(user));
      setUserInfo(user);
    } catch(error) {
      console.error('Error fetching user info:', error);
      // You might want to handle the error here, e.g., show an error message to the user
    }
  };
  

  const removeUserInfo = async () => {
    try {
      await AsyncStorage.removeItem("@user");
      setUserInfo(null);
    } catch (error) {
      console.error('Error removing user info from AsyncStorage:', error);
    }
  };

  return (
    <View style={styles.container}>
      {!userInfo ? (
        <Button
          title="Login with Google"
          onPress={() => {
            promptAsync();
          }}
        />
      ) : (
        <View>
          <Image style={styles.image} source={{ uri: userInfo?.picture }} />
          <Text style={styles.text}>Email: {userInfo.email}</Text>
          <Text style={styles.text}>Full Name: {userInfo.name}</Text>
          <Button
            title="Remove AsyncStorage value"
            onPress={removeUserInfo}
          />
        </View>
      )}
      <Text>open up app.js</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  text: {
    marginBottom: 10,
  },
});
