// for GroupContext
export interface GroupContextType {
  openedGroupId: Number | null;
  setOpenedGroupId: (id: string | null) => void;
  clearGroup: () => void;
}

// TypeScript Types for your application logic
export interface Icon {
  id: number;
  name: string;
}

export interface Group {
  id: number;
  name: string;
  parent_id: number | null;
  icons_id: number | null;
}

export interface PasswordMetadata {
  id: number;
  group_id: number;
  title: string;
  secure_key: string; // UUID string
}

export interface HeaderProps {
  openedGroupId: number | null;
  currentGroup: any;
  childGroups: any[];
  setOpenedGroupId: (id: number | null) => void;
  handleBack: () => void;
  onEditGroup: () => void; // 🆕 Trigger for the Edit Modal
  fetchGroupData: () => void;
  onEditPress: () => void;
}
