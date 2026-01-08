import db from 'database/client';
import { deleteAccountEntry } from './DeleteAccount';
import * as SecureStore from 'expo-secure-store';

export async function DeleteGroup(groupId) {
  try {
    // 1. Handle Sub-Groups (Recursive Cleanup)
    // We fetch sub-groups first so we can delete their accounts/secrets too
    const subGroups = db.getAllSync(`SELECT id FROM groups WHERE parent_id = ?`, [groupId]);
    for (const sub of subGroups) {
      await DeleteGroup(sub.id); // Recursive call to clean nested items
    }

    // 2. Fetch all accounts in THIS group
    const accounts = db.getAllSync(
      `SELECT id, secure_key FROM password_metadata WHERE group_id = ?`,
      [groupId]
    );

    // 3. Delete each account and its secret
    for (const account of accounts) {
      await deleteAccountEntry(account.id, account.secure_key);
    }

    // 4. Finally, delete the group itself
    db.runSync(`DELETE FROM groups WHERE id = ?`, [groupId]);

    return true;
  } catch (error) {
    console.error('Failed to delete group:', error);
    return false;
  }
}

export async function DeleteAllData() {
  try {
    // 1. Fetch keys to wipe SecureStore first
    const accounts = db.getAllSync('SELECT secure_key FROM password_metadata');
    for (const account of accounts) {
      if (account?.secure_key) {
        await SecureStore.deleteItemAsync(account?.secure_key);
      }
    }

    // 2. Wipe DB Tables
    db.runSync('DELETE FROM password_metadata');
    db.runSync('DELETE FROM groups');
    db.runSync('DELETE FROM icons');
    return true;
  } catch (error) {
    console.error('Wipe failed:', error);
    return false;
  }
}
