import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal } from 'react-native';
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
  useEffect(() => {
    fetchGroupData();
  }, [openedGroupId]);

  const fetchGroupData = () => {
    try {
      // 📁 Groups
      // 📁 Groups
      const children = db.getAllSync(
        `SELECT g.*, i.name as iconName, i.provider as iconProvider -- ✅ Fetch provider
         FROM groups g
         LEFT JOIN icons i ON g.icons_id = i.id
         WHERE g.parent_id ${openedGroupId ? '= ?' : 'IS NULL'}`,
        openedGroupId ? [openedGroupId] : []
      );
      setChildGroups(children);

      // 🔐 Accounts
      const accountsResult = db.getAllSync(
        openedGroupId
          ? 'SELECT * FROM password_metadata WHERE group_id = ?'
          : 'SELECT * FROM password_metadata',
        openedGroupId ? [openedGroupId] : []
      );
      setAccounts(accountsResult);

      // 🧭 Header
      if (openedGroupId) {
        const info = db.getFirstSync('SELECT * FROM groups WHERE id = ?', [openedGroupId]);
        setCurrentGroup(info);
      } else {
        setCurrentGroup(null);
      }
    } catch (error) {
      console.error('Error fetching hero data:', error);
    }
  };

  const handleAccountPress = async (account: any) => {
    try {
      // Trigger Biometrics / Pin / Password
      const isAuthed = await authenticateUser();

      if (isAuthed) {
        // Only set the account if authentication succeeds
        setSelectedAccount(account);
      } else {
        // Optional: You could show a small toast here if authentication was cancelled
        console.log('Authentication failed or cancelled');
      }
    } catch (error) {
      console.error('Auth Error:', error);
    }
  };

  const handleBack = () => {
    setOpenedGroupId(currentGroup?.parent_id || null);
  };

  /* 🔁 RECEIVE UPDATED ACCOUNT FROM DETAIL SCREEN */
  const handleAccountUpdated = (payload) => {
    if (payload.type === 'update') {
      setAccounts((prev) =>
        prev.map((acc) => (acc.id === payload.account.id ? payload.account : acc))
      );
      setSelectedAccount(payload.account);
    }

    if (payload.type === 'delete') {
      setAccounts((prev) => prev.filter((acc) => acc.id !== payload.id));
      setSelectedAccount(null);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      {/* 🔍 ACCOUNT DETAIL MODAL */}
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

      {/* HEADER */}
      <Header
        openedGroupId={openedGroupId}
        currentGroup={currentGroup}
        childGroups={childGroups}
        setOpenedGroupId={setOpenedGroupId} // ✅ Pass the reference directly
        handleBack={handleBack} // ✅ Pass the reference, don't call it
        fetchGroupData={fetchGroupData}
        onEditPress={() => setIsEditModalVisible(true)}
      />

      {/* ACCOUNTS */}
      <View className="px-6 pt-6">
        <Text className="mb-4 text-xs font-semibold tracking-widest text-slate-400 uppercase">
          Stored Accounts ({accounts.length})
        </Text>

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
  );
};

export default HeroSection;
