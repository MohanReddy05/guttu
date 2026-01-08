import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Modal, Alert } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import db from 'database/client';
import { authenticateUser } from 'Services/AuthService'; // ✅ Added Auth Service import

const EditGroupScreen = ({ visible, onClose, group, onSave }: any) => {
  const [name, setName] = useState('');
  const [targetParentId, setTargetParentId] = useState<number | null>(null);
  const [allGroups, setAllGroups] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedAccountIds, setSelectedAccountIds] = useState<number[]>([]);
  const [targetAccountGroupId, setTargetAccountGroupId] = useState<number | null>(null);

  useEffect(() => {
    if (visible && group) {
      // 1. Set initial identity
      setName(group.name);
      setTargetParentId(group.parent_id);

      // 2. Clear old selections from previous edits
      setSelectedAccountIds([]);
      setTargetAccountGroupId(null);

      loadData();
    }
  }, [visible, group]);

  // 1. New Helper: Function to find all sub-group IDs recursively
  const getDescendantIds = (parentId: number, allGroupsList: any[]): number[] => {
    let children = allGroupsList.filter((g) => g.parent_id === parentId);
    let ids = children.map((c) => c.id);

    children.forEach((child) => {
      ids = [...ids, ...getDescendantIds(child.id, allGroupsList)];
    });

    return ids;
  };

  const loadData = () => {
    try {
      // Fetch everything first so we can calculate the tree
      const rawGroups = db.getAllSync('SELECT * FROM groups');

      // 2. Identify all children/grandchildren of the current group
      const forbiddenIds = group ? [group.id, ...getDescendantIds(group.id, rawGroups)] : [];

      // 3. Filter the list so we only show groups that AREN'T the current group or its children
      const validTargets = rawGroups.filter((g) => !forbiddenIds.includes(g.id));

      setAllGroups(validTargets);

      const accs = db.getAllSync('SELECT * FROM password_metadata WHERE group_id = ?', [group.id]);
      setAccounts(accs);
    } catch (e) {
      console.error('Load edit data error:', e);
    }
  };

  const toggleAccountSelection = (id: number) => {
    setSelectedAccountIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // ✅ PROTECTED APPLY CHANGES
  const handleApplyChanges = async () => {
    try {
      // 1. Authenticate before allowing data movement
      const isAuthed = await authenticateUser();
      if (!isAuthed) {
        Alert.alert('Authentication Failed', 'You must authenticate to change vault structure.');
        return;
      }

      // 2. 🟢 Update Group Identity (Name & Parent)
      db.runSync('UPDATE groups SET name = ?, parent_id = ? WHERE id = ?', [
        name,
        targetParentId,
        group.id,
      ]);

      // 3. 🟢 Move Selected Accounts
      if (selectedAccountIds.length > 0) {
        const placeholders = selectedAccountIds.map(() => '?').join(',');
        db.runSync(`UPDATE password_metadata SET group_id = ? WHERE id IN (${placeholders})`, [
          targetAccountGroupId,
          ...selectedAccountIds,
        ]);
      }

      Alert.alert('Success', 'Vault structure updated successfully');
      onSave(); // Refresh HeroSection
      onClose();
    } catch (e) {
      Alert.alert('Error', 'Failed to update group');
      console.error(e);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <View className="flex-1 bg-slate-50">
        {/* Header Area */}
        <View className="flex-row items-center justify-between bg-slate-900 px-6 py-12">
          <TouchableOpacity onPress={onClose}>
            <MaterialCommunityIcons name="close" size={28} color="white" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-white">Edit Group Settings</Text>
          <TouchableOpacity onPress={handleApplyChanges}>
            <Text className="text-lg font-bold text-sky-400">Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="p-6">
          <Text className="mb-2 text-xs font-bold tracking-widest text-slate-400 uppercase">
            Group Name
          </Text>
          <TextInput
            className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 text-lg"
            value={name}
            onChangeText={setName}
            placeholder="Group Name"
          />

          <Text className="mb-2 text-xs font-bold tracking-widest text-slate-400 uppercase">
            Move Group To
          </Text>
          <View className="mb-6 rounded-2xl border border-slate-200 bg-white p-2">
            <TouchableOpacity
              onPress={() => setTargetParentId(null)}
              className={`flex-row items-center rounded-xl p-3 ${targetParentId === null ? 'bg-sky-50' : ''}`}>
              <MaterialCommunityIcons
                name="folder-home"
                size={20}
                color={targetParentId === null ? '#0ea5e9' : '#64748b'}
              />
              <Text
                className={`ml-2 ${targetParentId === null ? 'font-bold text-sky-600' : 'text-slate-600'}`}>
                Root Directory
              </Text>
            </TouchableOpacity>
            {allGroups.map((g) => (
              <TouchableOpacity
                key={g.id}
                onPress={() => setTargetParentId(g.id)}
                className={`flex-row items-center rounded-xl p-3 ${targetParentId === g.id ? 'bg-sky-50' : ''}`}>
                <MaterialCommunityIcons
                  name="folder"
                  size={20}
                  color={targetParentId === g.id ? '#0ea5e9' : '#64748b'}
                />
                <Text
                  className={`ml-2 ${targetParentId === g.id ? 'font-bold text-sky-600' : 'text-slate-600'}`}>
                  {g.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text className="mb-2 text-xs font-bold tracking-widest text-slate-400 uppercase">
            Move Selected Accounts ({selectedAccountIds.length})
          </Text>
          <View className="mb-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            {accounts.map((acc) => (
              <TouchableOpacity
                key={acc.id}
                onPress={() => toggleAccountSelection(acc.id)}
                className="flex-row items-center border-b border-slate-50 p-4">
                <MaterialCommunityIcons
                  name={
                    selectedAccountIds.includes(acc.id)
                      ? 'checkbox-marked'
                      : 'checkbox-blank-outline'
                  }
                  size={24}
                  color={selectedAccountIds.includes(acc.id) ? '#0ea5e9' : '#cbd5e1'}
                />
                <Text className="ml-3 font-medium text-slate-700">{acc.title}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {selectedAccountIds.length > 0 && (
            <View className="mb-10 rounded-2xl border border-amber-100 bg-amber-50 p-4">
              <Text className="mb-2 font-bold text-amber-800">Target Folder for Accounts:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <TouchableOpacity
                  onPress={() => setTargetAccountGroupId(null)}
                  className={`mr-2 rounded-full border px-4 py-2 ${targetAccountGroupId === null ? 'border-amber-500 bg-amber-500' : 'border-amber-200'}`}>
                  <Text className={targetAccountGroupId === null ? 'text-white' : 'text-amber-700'}>
                    Root
                  </Text>
                </TouchableOpacity>
                {allGroups.map((g) => (
                  <TouchableOpacity
                    key={g.id}
                    onPress={() => setTargetAccountGroupId(g.id)}
                    className={`mr-2 rounded-full border px-4 py-2 ${targetAccountGroupId === g.id ? 'border-amber-500 bg-amber-500' : 'border-amber-200'}`}>
                    <Text
                      className={targetAccountGroupId === g.id ? 'text-white' : 'text-amber-700'}>
                      {g.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

export default EditGroupScreen;
