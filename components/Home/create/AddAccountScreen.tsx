import addNewAccount from 'controllers/AddAccount';
import db from 'database/client';
import { useGroup } from 'hooks/useGroup';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { authenticateUser } from 'Services/AuthService';

const AddAccountScreen = ({ onClose }) => {
  const { openedGroupId } = useGroup();

  // 1. Added Form State
  const [title, setTitle] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState(openedGroupId);
  // State to hold real groups from database
  const [dbGroups, setDbGroups] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  // 1. Fetch real groups from SQLite when the component opens
  useEffect(() => {
    try {
      const results = db.getAllSync('SELECT id, name FROM groups') as {
        id: number;
        name: string;
      }[];
      setDbGroups(results);

      // If we aren't inside a group already, default to the first group found
      if (!openedGroupId && results.length > 0) {
        setSelectedGroupId(results[0].id);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  }, [openedGroupId]);

  const handleSave = async () => {
    const user = await authenticateUser();
    if (!user) {
      Alert.alert('Failed to authenticate user');
      return;
    }
    setLoading(true);

    // The controller now returns a boolean
    const success = await addNewAccount(title, selectedGroupId, username, password);

    setLoading(false);

    if (success) {
      // Only close the screen if the controller confirmed the save
      onClose();
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="mb-10 flex-1 bg-white">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-6">
        {/* Header */}
        <View className="mt-4 mb-8">
          <Text className="text-3xl font-bold text-slate-900">New Vault Item</Text>
          <Text className="mt-1 text-slate-500">
            {openedGroupId ? 'Adding to current group' : 'Store your credentials securely'}
          </Text>
        </View>

        {/* Input Fields */}
        <View className="space-y-5">
          {/* Title Input */}
          <View>
            <Text className="mb-2 ml-1 font-semibold text-slate-700">Account Title</Text>
            <View className="flex-row items-center rounded-2xl border border-slate-200 bg-slate-100 px-4">
              <MaterialCommunityIcons name="label-outline" size={20} color="#64748b" />
              <TextInput
                placeholder="e.g. Netflix"
                value={title}
                onChangeText={setTitle}
                className="flex-1 p-4 text-slate-900"
              />
            </View>
          </View>

          {/* Username Input */}
          <View>
            <Text className="mb-2 ml-1 font-semibold text-slate-700">Username / Email</Text>
            <View className="flex-row items-center rounded-2xl border border-slate-200 bg-slate-100 px-4">
              <MaterialCommunityIcons name="account-outline" size={20} color="#64748b" />
              <TextInput
                placeholder="Enter username"
                autoCapitalize="none"
                value={username}
                onChangeText={setUsername}
                className="flex-1 p-4 text-slate-900"
              />
            </View>
          </View>

          {/* Password Input */}
          <View>
            <Text className="mb-2 ml-1 font-semibold text-slate-700">Password</Text>
            <View className="flex-row items-center rounded-2xl border border-slate-200 bg-slate-100 px-4">
              <MaterialCommunityIcons name="lock-outline" size={20} color="#64748b" />
              <TextInput
                placeholder="••••••••"
                secureTextEntry={!isPasswordVisible}
                value={password}
                onChangeText={setPassword}
                className="flex-1 p-4 text-slate-900"
              />
              <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                <MaterialCommunityIcons
                  name={isPasswordVisible ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color="#64748b"
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* --- DYNAMIC GROUP SELECTION --- */}
        {!openedGroupId ? (
          <View className="mt-8">
            <Text className="mb-3 ml-1 font-semibold text-slate-700">Select Group</Text>
            {dbGroups.length === 0 ? (
              <Text className="ml-1 text-slate-400 italic">
                No groups found. Please create a group first.
              </Text>
            ) : (
              <View className="flex-row flex-wrap gap-2">
                {dbGroups.map((group) => (
                  <TouchableOpacity
                    key={group.id}
                    onPress={() => setSelectedGroupId(group.id)}
                    className={`rounded-full px-5 py-2.5 ${
                      selectedGroupId === group.id ? 'bg-slate-800' : 'bg-slate-100'
                    }`}>
                    <Text
                      className={`font-medium ${selectedGroupId === group.id ? 'text-white' : 'text-slate-600'}`}>
                      {group.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        ) : (
          <View className="mt-8 flex-row items-center rounded-2xl border border-blue-100 bg-blue-50 p-4">
            <MaterialCommunityIcons name="folder-check" size={20} color="#1e40af" />
            <Text className="ml-2 font-medium text-blue-800">Saving to the active folder</Text>
          </View>
        )}

        {/* Action Button */}
        <View className="mt-auto pt-10">
          <TouchableOpacity
            onPress={handleSave}
            activeOpacity={0.8}
            className="flex-row items-center justify-center rounded-2xl bg-(--primary-500) p-4">
            <MaterialCommunityIcons name="shield-check" size={24} color="white" />
            <Text className="ml-2 text-lg font-bold text-white">Save to Vault</Text>
          </TouchableOpacity>

          <TouchableOpacity className="mt-4 items-center" onPress={onClose}>
            <Text className="font-medium text-slate-400">Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default AddAccountScreen;
