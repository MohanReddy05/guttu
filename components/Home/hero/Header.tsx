import { VectorIcon } from 'components/VectorIcon';
import { DeleteAllData, DeleteGroup } from 'controllers/DeleteGroup';
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { authenticateUser } from 'Services/AuthService';
import { HeaderProps } from 'utils/Interfaces';

const Header = ({
  openedGroupId,
  currentGroup,
  childGroups,
  setOpenedGroupId,
  handleBack,
  fetchGroupData,
  onEditPress,
}: HeaderProps) => {
  // ✅ IMPROVED DELETE LOGIC
  const handleDelete = async () => {
    if (!openedGroupId) return;

    Alert.alert(
      'Delete Group',
      'Are you sure? This will delete all accounts and sub-groups inside.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const isAuthed = await authenticateUser();
            if (!isAuthed) return;

            try {
              // Capture parentId before the group is deleted
              const parentId = currentGroup?.parent_id || null;

              const success = await DeleteGroup(openedGroupId);

              if (success) {
                Alert.alert('Success', 'Group Deleted Successfully');
                // Navigate back to the parent group
                setOpenedGroupId(parentId);
                // Trigger the recursive refresh
                fetchGroupData();
              } else {
                Alert.alert('Error', 'Unable to delete group contents.');
              }
            } catch (error) {
              console.error('Deletion Error', error);
            }
          },
        },
      ]
    );
  };

  const handleAllDelete = async () => {
    if (openedGroupId) return;

    Alert.alert('Delete All Data', 'This will wipe your entire vault. Proceed?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const isAuthed = await authenticateUser();
          if (!isAuthed) return;

          const success = await DeleteAllData();
          if (success) {
            setOpenedGroupId(null);
            fetchGroupData();
          }
        },
      },
    ]);
  };

  return (
    <View className="rounded-b-[40px] bg-slate-900 px-6 pt-4 pb-8 shadow-xl">
      <View className="mb-6 flex-row items-center justify-between">
        <View className="flex-row items-center">
          {openedGroupId && (
            <TouchableOpacity onPress={handleBack} className="mr-4 rounded-full bg-slate-800 p-2">
              <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
            </TouchableOpacity>
          )}
          <View>
            <Text className="text-3xl font-bold text-white">
              {currentGroup ? currentGroup.name : 'My Vault'}
            </Text>
            <Text className="text-slate-400">
              {openedGroupId ? 'Current Group' : 'Root Directory'}
            </Text>
          </View>
        </View>

        <View className="flex-row gap-2">
          {openedGroupId && (
            <TouchableOpacity onPress={onEditPress}>
              <MaterialCommunityIcons name="pencil" size={32} color="#94a3b8" />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={openedGroupId ? handleDelete : handleAllDelete}>
            <MaterialCommunityIcons name="delete" size={32} color="#94a3b8" />
          </TouchableOpacity>
        </View>
      </View>

      {childGroups && childGroups.length > 0 && (
        <Text className="mb-3 ml-1 text-xs font-semibold tracking-widest text-slate-500 uppercase">
          Sub Groups
        </Text>
      )}

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {childGroups.map((group) => (
          <TouchableOpacity
            key={group.id}
            onPress={() => setOpenedGroupId(group.id)}
            className="mr-3 h-24 w-24 items-center justify-center rounded-3xl border border-slate-700 bg-slate-800">
            <VectorIcon
              provider={group.iconProvider}
              name={group.iconName || 'folder'}
              size={28}
              color="#38bdf8"
            />
            <Text
              numberOfLines={1}
              className="mt-2 px-2 text-center text-[10px] font-medium text-white">
              {group.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default Header;
