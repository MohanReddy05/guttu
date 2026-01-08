import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Entypo from 'react-native-vector-icons/Entypo';

export const IconLibraries: any = {
  MaterialCommunityIcons,
  Ionicons,
  FontAwesome,
  MaterialIcons,
  AntDesign,
  Entypo,
};

/**
 * Scans all libraries to find which one contains the icon name.
 * Returns the name of the provider or null.
 */
export const findIconProvider = (name: string): string | null => {
  if (!name) return null;

  // Define priority (search these sets in order)
  const order = [
    'MaterialCommunityIcons',
    'Ionicons',
    'FontAwesome',
    'MaterialIcons',
    'AntDesign',
    'Entypo',
  ];

  for (const provider of order) {
    const glyphMap = IconLibraries[provider].getRawGlyphMap();
    if (Object.keys(glyphMap).includes(name)) {
      return provider;
    }
  }
  return null;
};
