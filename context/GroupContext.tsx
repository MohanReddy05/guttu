import { createContext, ReactNode, useState } from 'react';
import { GroupContextType } from 'utils/Interfaces';

// create context object
export const GroupContext = createContext<GroupContextType | undefined>(undefined);

// create context provider
export const GroupProvider = ({ children }: { children: ReactNode }) => {
  const [openedGroupId, setOpenedGroupId] = useState<Number | null>(null);
  const clearGroup = () => setOpenedGroupId(null);

  return (
    <GroupContext.Provider value={{ openedGroupId, setOpenedGroupId, clearGroup }}>
      {children}
    </GroupContext.Provider>
  );
};
