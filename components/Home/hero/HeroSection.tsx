import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  BackHandler, // ✅ Added BackHandler
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useGroup } from 'hooks/useGroup';
import db from 'database/client';
import AccountDetailScreen from './AccountDetailsScreen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Header from 'components/Home/hero/Header';
import EditGroupScreen from './EditGroupScreen';
import { authenticateUser } from 'Services/AuthService';

const HeroSection = () => {
  const { openedGroupId, setOpenedGroupId } = useGroup();
  const [currentGroup, setCurrentGroup] = useState<any>(null);
  const [childGroups, setChildGroups] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const insets = useSafeAreaInsets();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  // --- 1. DATA FETCHING ---
  useEffect(() => {
    fetchGroupData();
  }, [openedGroupId]);

  // --- 2. HARDWARE BACK BUTTON LOGIC ---
  useEffect(() => {
    const onBackPress = () => {
      // If we are deep in a group, go up one level
      if (openedGroupId !== null) {
        handleBack();
        return true; // Prevents the app from exiting
      }
      return false; // Allows the app to exit if we are at Root
    };

    // Subscribe to hardware back button
    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

    // ✅ FIX: Call .remove() on the subscription itself
    return () => subscription.remove();
  }, [openedGroupId, currentGroup]); // Dependencies ensure logic uses latest IDs

  const fetchGroupData = () => {
    try {
      // 📁 Fetch Immediate Child Groups
      const children = db.getAllSync(
        `SELECT g.*, i.name as iconName, i.provider as iconProvider 
         FROM groups g
         LEFT JOIN icons i ON g.icons_id = i.id
         WHERE g.parent_id ${openedGroupId ? '= ?' : 'IS NULL'}`,
        openedGroupId ? [openedGroupId] : []
      );
      setChildGroups(children);

      // 🔐 Fetch Accounts (Recursive Logic)
      let accountsResult;
      if (openedGroupId) {
        const recursiveQuery = `
          WITH RECURSIVE descendant_groups(id) AS (
            SELECT id FROM groups WHERE id = ?
            UNION ALL
            SELECT g.id FROM groups g
            JOIN descendant_groups dg ON g.parent_id = dg.id
          )
          SELECT * FROM password_metadata 
          WHERE group_id IN (SELECT id FROM descendant_groups)
          ORDER BY title ASC;
        `;
        accountsResult = db.getAllSync(recursiveQuery, [openedGroupId]);
      } else {
        accountsResult = db.getAllSync('SELECT * FROM password_metadata ORDER BY title ASC');
      }
      setAccounts(accountsResult);

      // 🧭 Fetch Header Info
      if (openedGroupId) {
        const info = db.getFirstSync('SELECT * FROM groups WHERE id = ?', [openedGroupId]);
        setCurrentGroup(info);
      } else {
        setCurrentGroup(null);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleBack = () => {
    // Navigate to the parent group ID or null (Root)
    setOpenedGroupId(currentGroup?.parent_id || null);
  };

  const handleAccountPress = async (account: any) => {
    const isAuthed = await authenticateUser();
    if (isAuthed) setSelectedAccount(account);
  };

  const handleAccountUpdated = (payload) => {
    fetchGroupData();
    if (payload.type === 'update') setSelectedAccount(payload.account);
    if (payload.type === 'delete') setSelectedAccount(null);
  };

  return (
    <>
      <Header
        openedGroupId={openedGroupId}
        currentGroup={currentGroup}
        childGroups={childGroups}
        setOpenedGroupId={setOpenedGroupId}
        handleBack={handleBack}
        fetchGroupData={fetchGroupData}
        onEditPress={() => setIsEditModalVisible(true)}
      />

      <Text className="mx-8 mt-4 text-xs font-semibold tracking-widest text-slate-400 uppercase">
        Stored Accounts ({accounts.length})
      </Text>

      <ScrollView className="mb-20 flex-1 bg-white" style={{ paddingBottom: insets.bottom }}>
        <Modal visible={!!selectedAccount} animationType="slide">
          {selectedAccount && (
            <AccountDetailScreen
              account={selectedAccount}
              onClose={() => setSelectedAccount(null)}
              onDataSaved={handleAccountUpdated}
            />
          )}
        </Modal>

        <EditGroupScreen
          visible={isEditModalVisible}
          group={currentGroup}
          onClose={() => setIsEditModalVisible(false)}
          onSave={fetchGroupData}
        />

        <View className="px-6 pt-6">
          {accounts.map((account) => (
            <TouchableOpacity
              key={account.id}
              onPress={() => handleAccountPress(account)}
              className="mb-3 flex-row items-center rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <View className="h-12 w-12 items-center justify-center rounded-xl bg-slate-200">
                <MaterialCommunityIcons name="shield-key" size={24} color="#475569" />
              </View>
              <View className="ml-4 flex-1">
                <Text className="text-lg font-bold text-slate-900">{account.title}</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color="#cbd5e1" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </>
  );
};

export default HeroSection;
