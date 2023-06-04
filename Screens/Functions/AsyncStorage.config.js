import AsyncStorage from '@react-native-async-storage/async-storage';
export const AsyncStorageItems = {
    isClockIn: '@isClockIn',
    lastClockInTime: '@lastClockInTime',
    lastLoginSqlId: '@lastLoginSqlId'
}
export const storeKeyAsync = async ({ key, value }) => {
    try {
        const jsonValue = JSON.stringify(value);
        await AsyncStorage.setItem(key, jsonValue);
    } catch (e) {
        console.error(`Error on setting ${key} => ${value}`, e);
    }
};

export const getKeyAsync = async ({ key }) => {
    try {
        const value = await AsyncStorage.getItem(key);
        if (value !== null) {
            return JSON.parse(value);
        } else {
            console.error(`No data found for key: ${key}`);
            return null;
        }
    } catch (e) {
        console.error(`Error reading value for key: ${key}`, e);
        return null;
    }
};

export const deleteKeyAsync = async ({ key }) => {
    try {
        await AsyncStorage.removeItem(key);
        console.log(`Key ${key} deleted successfully`);
        return null;
    } catch (error) {
        console.error(`Error deleting key: ${key}`, error);
        return null;
    }
};
