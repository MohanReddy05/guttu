import React from 'react';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Entypo from 'react-native-vector-icons/Entypo';

const IconSets: any = {
  AntDesign,
  FontAwesome,
  Ionicons,
  MaterialIcons,
  MaterialCommunityIcons,
  Entypo,
};

export const VectorIcon = ({ name, provider, size, color, style }: any) => {
  const IconComponent = IconSets[provider] || MaterialCommunityIcons;
  return <IconComponent name={name} size={size} color={color} style={style} />;
};

// Helper to validate if icon exists in a specific set
export const isValidIcon = (name: string, provider: string) => {
  const set = IconSets[provider];
  if (!set) return false;
  return Object.keys(set.getRawGlyphMap()).includes(name);
};
