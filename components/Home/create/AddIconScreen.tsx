import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import db from 'database/client';
import { findIconProvider, IconLibraries } from 'utils/IconsResolver';

type AddIconScreenProps = {
  onClose: () => void;
};

const AddIconScreen = ({ onClose }: AddIconScreenProps) => {
  const [iconName, setIconName] = useState('');
  const [detectedProvider, setDetectedProvider] = useState<string | null>(null);

  // ✅ Auto-detect provider when name changes
  useEffect(() => {
    const provider = findIconProvider(iconName.trim());
    setDetectedProvider(provider);
  }, [iconName]);

  const handleSaveIcon = () => {
    const name = iconName.trim();

    // 1. 🛑 GUARD: Check if provider exists BEFORE calling the DB
    if (!name) {
      Alert.alert('Error', 'Please enter an icon name.');
      return;
    }

    if (!detectedProvider) {
      Alert.alert(
        'Icon Not Found',
        'This icon name does not exist in any supported library. Please check the spelling.'
      );
      return;
    }

    try {
      // 2. Perform the insert only if we have a valid provider
      db.runSync('INSERT INTO icons (name, provider) VALUES (?, ?)', [name, detectedProvider]);

      Alert.alert('Success', `Registered ${name} from ${detectedProvider}`);
      onClose();
    } catch (error) {
      console.error('Database Error:', error);
      Alert.alert('Critical Error', 'Could not save to database.');
    }
  };

  // Preview logic
  const PreviewIcon = detectedProvider
    ? IconLibraries[detectedProvider]
    : IconLibraries.MaterialCommunityIcons;
  return (
    <View className="flex-1 justify-center bg-white p-6">
      <View className="flex-row items-center justify-between">
        <Text className="mb-2 text-2xl font-bold text-slate-900">Register Icon</Text>
        {/* Dynamic Feedback */}
        <View className="mt-4 h-10">
          {detectedProvider ? (
            <View className="flex-row items-center self-start rounded-full border border-green-100 bg-green-50 px-3 py-1">
              <Text className="text-[10px] font-bold text-green-600 uppercase">
                Detected: {detectedProvider}
              </Text>
            </View>
          ) : iconName.length > 2 ? (
            <Text className="text-[10px] font-medium text-red-400 italic">
              Icon name not found...
            </Text>
          ) : null}
        </View>
      </View>
      <View className="space-y-4">
        <View className="flex-row items-center rounded-2xl border border-slate-200 bg-slate-100 px-4">
          {/* Preview of the icon as you type */}
          <PreviewIcon
            name={iconName ? (iconName as any) : 'help-circle-outline'}
            size={24}
            color="#64748b"
          />
          <TextInput
            placeholder="e.g. facebook, google, lock"
            value={iconName}
            onChangeText={setIconName}
            autoCapitalize="none"
            className="flex-1 p-4 text-slate-900"
          />
        </View>

        <TouchableOpacity
          onPress={handleSaveIcon}
          className="mt-4 items-center rounded-2xl bg-slate-900 p-4 shadow-md">
          <Text className="text-lg font-bold text-white">Save Icon</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onClose} className="mt-2 items-center">
          <Text className="text-slate-400">Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AddIconScreen;
