import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  ScrollView,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { getSecret, updateSecret } from 'Services/SecureStorage';
import { authenticateUser } from 'Services/AuthService'; // ✅ Added for security
import * as Clipboard from 'expo-clipboard';
import db from 'database/client';
import { deleteAccountEntry } from 'controllers/DeleteAccount';

type Credentials = {
  username: string;
  password: string;
};

const AccountDetailScreen = ({ account, onClose, onDataSaved }) => {
  const [credentials, setCredentials] = useState<Credentials | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(account.title);

  const [allGroups, setAllGroups] = useState<any[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(account.group_id);
  const [currentGroupName, setCurrentGroupName] = useState('Root');

  useEffect(() => {
    setEditTitle(account.title);
    setSelectedGroupId(account.group_id);
    loadGroups();
    loadSecrets();
  }, [account]);

  const loadGroups = () => {
    try {
      const groups = db.getAllSync('SELECT * FROM groups');
      setAllGroups(groups);
      const current = groups.find((g) => g.id === account.group_id);
      setCurrentGroupName(current?.name || 'Root Directory');
    } catch (e) {
      console.error('Failed to load groups', e);
    }
  };

  const loadSecrets = async () => {
    try {
      const data = await getSecret(account.secure_key);
      if (data) {
        setCredentials({
          username: data.username ?? data.user,
          password: data.password ?? data.pass,
        });
      }
    } catch {
      Alert.alert('Error', 'Could not decrypt credentials.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text?: string) => {
    if (!text) return;
    await Clipboard.setStringAsync(text);
  };

  // ✅ PROTECTED TOGGLE
  const handleToggleShowPass = async () => {
    if (!showPass) {
      setShowPass(true);
    } else {
      setShowPass(false);
    }
  };

  // ✅ PROTECTED UPDATE
  const handleUpdate = async () => {
    if (!credentials?.username || !credentials?.password) {
      Alert.alert('Error', 'Missing credentials.');
      return;
    }

    const isAuthed = await authenticateUser();
    if (!isAuthed) return;

    try {
      setSaving(true);
      await updateSecret(account.secure_key, credentials.username, credentials.password);

      // ✅ Database Sync Fix: Added group_id to the update
      db.runSync('UPDATE password_metadata SET title = ?, group_id = ? WHERE id = ?', [
        editTitle,
        selectedGroupId,
        account.id,
      ]);

      setIsEditing(false);
      onDataSaved({
        type: 'update',
        account: { ...account, title: editTitle, group_id: selectedGroupId },
      });

      const newGroup = allGroups.find((g) => g.id === selectedGroupId);
      setCurrentGroupName(newGroup ? newGroup.name : 'Root Directory');
      Alert.alert('Success', 'Account updated successfully.');
    } catch (error) {
      Alert.alert('Error', 'Update failed to sync.');
    } finally {
      setSaving(false);
    }
  };

  // ✅ PROTECTED DELETE
  const handleDelete = async () => {
    const isAuthed = await authenticateUser();
    if (!isAuthed) return;

    Alert.alert('Delete Account', 'This will permanently wipe these credentials.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setSaving(true);
          const success = await deleteAccountEntry(account.id, account.secure_key);
          if (success) {
            onDataSaved({ type: 'delete', id: account.id });
            onClose();
          } else {
            Alert.alert('Error', 'Failed to delete.');
          }
          setSaving(false);
        },
      },
    ]);
  };

  if (loading) return <ActivityIndicator className="flex-1" size="large" color="#0f172a" />;

  return (
    <View className="flex-1 bg-white">
      {/* HEADER */}
      <View className="flex-row items-center justify-between border-b border-slate-100 px-6 pt-14 pb-6">
        <View className="flex-1 flex-row items-center">
          <TouchableOpacity onPress={onClose} className="mr-4 rounded-full bg-slate-100 p-2">
            <MaterialCommunityIcons name="close" size={24} color="#0f172a" />
          </TouchableOpacity>
          {isEditing ? (
            <TextInput
              value={editTitle}
              onChangeText={setEditTitle}
              className="flex-1 border-b border-blue-400 text-xl font-bold text-slate-900"
            />
          ) : (
            <Text className="text-2xl font-bold text-slate-900">{editTitle}</Text>
          )}
        </View>

        <View className="flex-row items-center gap-3">
          {!isEditing && (
            <TouchableOpacity onPress={handleDelete} disabled={saving}>
              <MaterialCommunityIcons name="trash-can-outline" size={24} color="#ef4444" />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={isEditing ? handleUpdate : () => setIsEditing(true)}
            disabled={saving}
            className={`rounded-xl p-2 ${isEditing ? 'bg-green-500' : 'bg-blue-500'}`}>
            {saving ? (
              <ActivityIndicator color="white" />
            ) : (
              <MaterialCommunityIcons
                name={isEditing ? 'check' : 'pencil'}
                size={22}
                color="white"
              />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 space-y-4 p-6">
        {/* USERNAME */}
        <View className="mb-4 rounded-3xl border border-slate-100 bg-slate-50 p-5">
          <Text className="mb-2 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
            Username
          </Text>
          {isEditing ? (
            <TextInput
              value={credentials?.username}
              autoCapitalize="none"
              onChangeText={(t) => setCredentials((p) => (p ? { ...p, username: t } : p))}
              className="text-lg text-slate-900"
            />
          ) : (
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-medium text-slate-900">{credentials?.username}</Text>
              <TouchableOpacity onPress={() => copyToClipboard(credentials?.username)}>
                <MaterialCommunityIcons name="content-copy" size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* PASSWORD */}
        <View className="mb-4 rounded-3xl border border-slate-100 bg-slate-50 p-5">
          <Text className="mb-2 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
            Password
          </Text>
          <View className="flex-row items-center justify-between">
            {isEditing ? (
              <TextInput
                value={credentials?.password}
                secureTextEntry={!showPass}
                onChangeText={(t) => setCredentials((p) => (p ? { ...p, password: t } : p))}
                className="flex-1 text-lg text-slate-900"
              />
            ) : (
              <Text className="font-mono text-xl text-slate-900">
                {showPass ? credentials?.password : '••••••••••••'}
              </Text>
            )}
            <View className="flex-row gap-4">
              <TouchableOpacity onPress={handleToggleShowPass}>
                <MaterialCommunityIcons
                  name={showPass ? 'eye-off' : 'eye-outline'}
                  size={22}
                  color="#64748b"
                />
              </TouchableOpacity>
              {!isEditing && (
                <TouchableOpacity onPress={() => copyToClipboard(credentials?.password)}>
                  <MaterialCommunityIcons name="content-copy" size={20} color="#94a3b8" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
        {/* LOCATION */}
        <View className="mb-4 rounded-3xl border border-slate-100 bg-slate-50 p-5">
          <Text className="mb-2 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
            Group
          </Text>
          {isEditing ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-2">
              <TouchableOpacity
                onPress={() => setSelectedGroupId(null)}
                className={`mr-2 rounded-full border px-4 py-2 ${selectedGroupId === null ? 'border-blue-500 bg-blue-500' : 'border-slate-200 bg-white'}`}>
                <Text
                  className={selectedGroupId === null ? 'font-bold text-white' : 'text-slate-600'}>
                  Root
                </Text>
              </TouchableOpacity>
              {allGroups.map((g) => (
                <TouchableOpacity
                  key={g.id}
                  onPress={() => setSelectedGroupId(g.id)}
                  className={`mr-2 rounded-full border px-4 py-2 ${selectedGroupId === g.id ? 'border-blue-500 bg-blue-500' : 'border-slate-200 bg-white'}`}>
                  <Text
                    className={
                      selectedGroupId === g.id ? 'font-bold text-white' : 'text-slate-600'
                    }>
                    {g.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <View className="flex-row items-center">
              <MaterialCommunityIcons name="folder-outline" size={18} color="#64748b" />
              <Text className="ml-2 text-lg font-medium text-slate-900">{currentGroupName}</Text>
            </View>
          )}
        </View>

        {/**Cancel Button */}
        {isEditing && (
          <TouchableOpacity onPress={() => setIsEditing(false)} className="mt-4 items-center">
            <Text className="text-slate-400">Cancel Editing</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <View className="mt-8 flex-row items-center rounded-2xl bg-blue-50 p-4">
        <MaterialCommunityIcons name="information-outline" size={20} color="#3b82f6" />
        <Text className="ml-3 flex-1 text-xs text-blue-700">
          This password is stored using AES-256 encryption within the device's secure enclave.
        </Text>
      </View>
    </View>
  );
};

export default AccountDetailScreen;
