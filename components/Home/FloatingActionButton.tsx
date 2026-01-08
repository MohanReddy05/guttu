import { useState } from 'react';
import { TouchableOpacity, View, Modal } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AddAccountScreen from './create/AddAccountScreen';
import AddGroupScreen from './create/AddGroupScreen'; // ✅ Import the new screen

const FloatingActionButton = ({ onDataSaved }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [addAccountOpened, setAddAccountOpened] = useState(false);
  const [addGroupOpened, setAddGroupOpened] = useState(false);

  const openAccountForm = () => {
    setAddAccountOpened(true);
    setIsOpen(false);
  };

  const openGroupForm = () => {
    setAddGroupOpened(true);
    setIsOpen(false);
  };

  return (
    <View className="absolute right-6 bottom-20 z-50 items-center">
      {/* --- Account Form Modal --- */}
      <Modal
        visible={addAccountOpened}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setAddAccountOpened(false)}>
        <AddAccountScreen
          onClose={() => {
            setAddAccountOpened(false);
            onDataSaved(); // 🚀 Refresh the HeroSection after closing
          }}
        />
      </Modal>

      {/* --- Group Form Modal --- */}
      <Modal
        visible={addGroupOpened}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setAddGroupOpened(false)}>
        {/* ✅ Added the AddGroupScreen here */}
        <AddGroupScreen
          onClose={() => {
            setAddGroupOpened(false);
            onDataSaved(); // 🚀 Refresh the HeroSection after closing
          }}
        />
      </Modal>

      {/* --- Expanded Menu (FAB Sub-buttons) --- */}
      {isOpen && (
        <View className="mb-4 items-center justify-center gap-y-4">
          {/* Add Group Button */}
          <TouchableOpacity
            onPress={openGroupForm}
            activeOpacity={0.8}
            className="h-16 w-16 items-center justify-center rounded-2xl bg-(--box) shadow-2xl">
            <MaterialCommunityIcons name="folder-plus" size={35} color="#0f172a" />
          </TouchableOpacity>

          {/* Add Account Button */}
          <TouchableOpacity
            onPress={openAccountForm}
            activeOpacity={0.8}
            className="h-16 w-16 items-center justify-center rounded-2xl bg-(--box) shadow-2xl">
            <MaterialCommunityIcons name="account-plus" size={35} color="#0f172a" />
          </TouchableOpacity>
        </View>
      )}

      {/* Main Toggle Button */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => setIsOpen(!isOpen)}
        className={`h-18 w-18 items-center justify-center rounded-2xl shadow-2xl ${
          isOpen ? 'bg-slate-800' : 'bg-(--primary-400)'
        }`}>
        <MaterialCommunityIcons
          name={isOpen ? 'close' : 'plus'}
          size={40}
          color={isOpen ? 'white' : '#0f172a'}
        />
      </TouchableOpacity>
    </View>
  );
};

export default FloatingActionButton;
