import * as SecureStore from 'expo-secure-store';

/**
 * Saves both username and password as a JSON string.
 */
export async function saveSecret(key: string, username: string, value: string) {
  try {
    // We combine the data into an object and turn it into a string
    const dataToStore = JSON.stringify({ username, password: value });

    await SecureStore.setItemAsync(key, dataToStore);
  } catch (error) {
    console.error('Error saving to SecureStore:', error);
    throw error;
  }
}

/**
 * Retrieves the secret and parses it back into an object.
 */
export async function getSecret(
  key: string
): Promise<{ username: string; password: string } | null> {
  try {
    const result = await SecureStore.getItemAsync(key);
    if (result) {
      // Parse the string back into a JavaScript object
      return JSON.parse(result);
    } else {
      console.log('No values stored under that key.');
      return null;
    }
  } catch (error) {
    console.error('Error retrieving from SecureStore:', error);
    return null;
  }
}

/**
 * Deletes a secret when a database entry is removed.
 */
export async function deleteSecret(key: string) {
  await SecureStore.deleteItemAsync(key);
}

/**
 * Updates an existing secret in encrypted storage.
 */
export async function updateSecret(key: string, newUsername: string, newPassword: string) {
  try {
    // Overwrite the existing data at 'key'
    const updatedData = JSON.stringify({
      username: newUsername,
      password: newPassword,
    });

    await SecureStore.setItemAsync(key, updatedData);
    console.log('Secret updated successfully');
  } catch (error) {
    console.error('Error updating SecureStore:', error);
    throw error;
  }
}
