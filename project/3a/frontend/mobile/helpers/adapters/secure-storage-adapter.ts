import * as SecureStore from 'expo-secure-store'
import { Alert, Platform } from 'react-native';

const isWeb = Platform.OS === 'web';

export class SecureStorageAdapater {

    static async setItem(key: string, value: string) {
        try {
            if (isWeb) {
                localStorage.setItem(key, value);
            } else {
                await SecureStore.setItemAsync(key, value);
            }
        } catch (error) {
            Alert.alert("Error", "Failed to save data");
        }

    }

    static async getItem(key: string ) {
        try {
            if (isWeb) {
                return localStorage.getItem(key);
            }
            return await SecureStore.getItemAsync(key);
        } catch (error) {
            Alert.alert("Error", "Failed to get data");
            return null;
        }
    }

    static async deleteItem(key: string) {
        try {
            if (isWeb) {
                localStorage.removeItem(key);
            } else {
                await SecureStore.deleteItemAsync(key);
            }
        } catch (error) {
            console.log(error);
            Alert.alert("Error", "Failed to delete data")
        }
    }
}