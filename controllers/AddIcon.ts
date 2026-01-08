import db from 'database/client';

export const addIcon = (iconName: string) => {
  try {
    db.runSync('INSERT INTO icons (name) VALUES (?)', [iconName]);
    console.log(`Icon "${iconName}" added successfully!`);
  } catch (error) {
    console.error('Failed to add icon:', error);
  }
};
