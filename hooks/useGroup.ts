import { useContext } from 'react';
import { GroupContext } from '../context/GroupContext';
import { GroupContextType } from 'utils/Interfaces';

/**
 * Custom hook to access the current opened group state.
 * Must be used within a GroupProvider.
 */
export const useGroup = (): GroupContextType => {
  const context = useContext(GroupContext);

  if (!context) {
    throw new Error('useGroup must be used within a GroupProvider');
  }

  return context;
};
