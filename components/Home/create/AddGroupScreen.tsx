import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, FlatList, Modal } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useGroup } from 'hooks/useGroup';
import db from 'database/client';
import AddIconScreen from './AddIconScreen';
import { VectorIcon } from 'components/VectorIcon';

// ✅ Updated type to include provider
type DbIcon = {
  id: number;
  name: string;
  provider: string;
};

const AddGroupScreen = ({ onClose }: { onClose: () => void }) => {
  const { openedGroupId } = useGroup();
  const [groupName, setGroupName] = useState('');
  const [selectedIconId, setSelectedIconId] = useState<number | null>(null);
  const [dbIcons, setDbIcons] = useState<DbIcon[]>([]);
  const [isAddIcon, setIsAddIcon] = useState(false);

  // Fetch icons from DB
  const fetchIcons = useCallback(() => {
    try {
      // ✅ Fetching provider column
      const icons = db.getAllSync(
        'SELECT id, name, provider FROM icons ORDER BY id DESC'
      ) as DbIcon[];

      setDbIcons(icons);

      if (icons.length && !selectedIconId) {
        setSelectedIconId(icons[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch icons', error);
    }
  }, [selectedIconId]);

  useEffect(() => {
    fetchIcons();
  }, [fetchIcons]);

  const handleCreateGroup = () => {
    if (!groupName.trim()) {
      Alert.alert('Required', 'Please enter a group name.');
      return;
    }

    if (!selectedIconId) {
      Alert.alert('Required', 'Please select an icon.');
      return;
    }

    try {
      db.runSync('INSERT INTO groups (name, parent_id, icons_id) VALUES (?, ?, ?)', [
        groupName.trim(),
        openedGroupId || null,
        selectedIconId,
      ]);

      Alert.alert('Success', 'Group created!', [{ text: 'OK', onPress: onClose }]);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Could not create group.');
    }
  };

  const handleAddIconClose = () => {
    setIsAddIcon(false);
    fetchIcons();
  };

  const renderIconItem = ({ item }: { item: DbIcon }) => {
    const isSelected = selectedIconId === item.id;

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setSelectedIconId(item.id)}
        className={`h-16 w-16 items-center justify-center rounded-2xl border-2 ${
          isSelected ? 'border-slate-800 bg-slate-800 shadow-lg' : 'border-slate-100 bg-slate-50'
        }`}>
        {/* ✅ Use VectorIcon instead of hardcoded MaterialCommunityIcons */}
        <VectorIcon
          provider={item.provider}
          name={item.name}
          size={28}
          color={isSelected ? '#ffffff' : '#64748b'}
        />
      </TouchableOpacity>
    );
  };

  return (
    <>
      <Modal visible={isAddIcon} animationType="slide" onRequestClose={handleAddIconClose}>
        <View className="flex-1 bg-white">
          <AddIconScreen onClose={handleAddIconClose} />
        </View>
      </Modal>

      <View className="mb-10 flex-1 bg-white p-6">
        <View className="mt-4 mb-8">
          <Text className="text-3xl font-bold text-slate-900">New Group</Text>
          <Text className="mt-1 font-medium text-slate-500">
            {openedGroupId ? `Folder Location: Sub-group` : 'Folder Location: Root Directory'}
          </Text>
        </View>

        <View className="mb-6">
          <Text className="mb-2 ml-1 text-xs font-bold tracking-widest text-slate-400 uppercase">
            Name
          </Text>
          <TextInput
            placeholder="e.g. Finance, Shopping..."
            value={groupName}
            onChangeText={setGroupName}
            className="rounded-2xl border border-slate-200 bg-slate-100 p-4 text-lg text-slate-900"
          />
        </View>

        <View className="mb-4 flex flex-row items-center justify-between">
          <Text className="ml-1 text-xs font-bold tracking-widest text-slate-400 uppercase">
            Select Icon
          </Text>
          <TouchableOpacity onPress={() => setIsAddIcon(true)}>
            <View className="flex-row items-center rounded-full border border-blue-100 bg-blue-50 p-1 px-3">
              <MaterialCommunityIcons name="plus" size={16} color="#3b82f6" />
              <Text className="ml-1 text-[10px] font-bold text-blue-600">ADD NEW</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View className="flex-1">
          <FlatList
            data={dbIcons}
            numColumns={4}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderIconItem}
            columnWrapperStyle={{
              justifyContent: 'space-between',
              marginBottom: 6,
            }}
            showsVerticalScrollIndicator={false}
          />
        </View>

        <View className="mt-4">
          <TouchableOpacity
            disabled={!groupName.trim()}
            onPress={handleCreateGroup}
            className={`flex-row items-center justify-center rounded-2xl p-4 shadow-lg ${
              groupName.trim() ? 'bg-slate-900' : 'bg-slate-200'
            }`}>
            <MaterialCommunityIcons
              name="folder-plus"
              size={24}
              color={groupName.trim() ? 'white' : '#94a3b8'}
            />
            <Text
              className={`ml-2 text-lg font-bold ${groupName.trim() ? 'text-white' : 'text-slate-400'}`}>
              Create Group
            </Text>
          </TouchableOpacity>

          <TouchableOpacity className="mt-4 items-center" onPress={onClose}>
            <Text className="font-medium text-slate-400">Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

export default AddGroupScreen;
