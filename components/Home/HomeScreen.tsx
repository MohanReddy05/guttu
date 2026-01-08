import React, { useCallback, useEffect, useState } from 'react';
import { Text, TouchableOpacity, View, Modal, ScrollView } from 'react-native';
import FloatingActionButton from './FloatingActionButton';
import db from 'database/client';
import HeroSection from './hero/HeroSection';

export const HomeScreen = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  // This runs every time the user navigates to this screen
  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };
  useEffect(() => {
    // Check if icons exist, if not, add a default one
    const iconCount = db.getFirstSync('SELECT COUNT(*) as count FROM icons') as any;
    if (iconCount.count === 0) {
      db.runSync('INSERT INTO icons (name) VALUES (?)', ['shield-lock']);
      handleRefresh();
    }
  }, []);

  return (
    <View className="mb-1 flex-1 bg-white px-2 pt-1 pb-6">
      <HeroSection key={refreshTrigger} onDataSaved={handleRefresh} />

      {/* FAB stays at the bottom */}
      <FloatingActionButton onDataSaved={handleRefresh} />
    </View>
  );
};
