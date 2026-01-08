import { VectorIcon } from 'components/VectorIcon';
import { DeleteAllData, DeleteGroup } from 'controllers/DeleteGroup';
import React, { useState, useEffect } from 'react';
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
  const handleDelete = async () => {
    if (!openedGroupId) return;
    console.log(openedGroupId);
    Alert.alert(
      'Delete Group',
      'Are you sure? This will delete all accounts and sub-groups inside.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const user = await authenticateUser();
            if (!user) {
              Alert.alert('Failed to authenticate user');
              return;
            }
            try {
              // 1. Determine where to go BEFORE deleting
              // Assuming your currentGroup object contains a parentId field
              const parentId = currentGroup?.parentId || null;

              const success = await DeleteGroup(openedGroupId);

              if (success) {
                Alert.alert('Success', 'Group Deleted Successfully');

                // 2. ✅ Navigate to the parent group instead of always null
                setOpenedGroupId(parentId);

                // 3. Refresh the data to reflect the deletion in the UI
                fetchGroupData();
              } else {
                Alert.alert('Error', 'Unable to delete group contents.');
              }
            } catch (error) {
              Alert.alert('Critical Error', 'An unexpected error occurred.');
              console.error('Deletion Error', error);
            }
          },
        },
      ]
    );
  };

  const handleAllDelete = async () => {
    if (openedGroupId) return;

    // Best practice: Confirm with the user before a major deletion
    Alert.alert('Delete All Data', 'Are you sure? This will delete all accounts', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const user = await authenticateUser();
          if (!user) {
            Alert.alert('Failed to authenticate user');
            return;
          }
          try {
            const success = await DeleteAllData();

            if (success) {
              Alert.alert('Success', 'Group Deleted Successfully');
              // ✅ Important: Move the user out of the deleted group
              setOpenedGroupId(null);
              // ✅ Important: Refresh the data
              fetchGroupData();
            } else {
              Alert.alert('Error', 'Unable to delete contents.');
            }
          } catch (error) {
            Alert.alert('Critical Error', 'An unexpected error occurred.');
            console.error('Deletion Error', error);
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
            <>
              <TouchableOpacity
                onPress={openedGroupId ? handleBack : handleAllDelete}
                className="mr-4 rounded-full bg-slate-800 p-2">
                <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
              </TouchableOpacity>
            </>
          )}
          <View className="flex min-h-min justify-between">
            <View>
              <View className="flex w-full items-center justify-between">
                <Text className="text-3xl font-bold text-slate-400">
                  {currentGroup ? currentGroup.name : 'My Vault'}
                </Text>
              </View>
              <Text className="text-slate-400">
                {openedGroupId ? 'Current Group' : 'Root Directory'}
              </Text>
            </View>
          </View>
        </View>
        <View className="flex-row gap-2">
          {openedGroupId && (
            <MaterialCommunityIcons onPress={onEditPress} name="pencil" size={32} color="#94a3b8" />
          )}
          <MaterialCommunityIcons
            onPress={openedGroupId ? handleDelete : handleAllDelete}
            name="delete"
            size={32}
            color="#94a3b8"
          />
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
            {/* ✅ Pass the iconProvider from your SQL join result */}
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
