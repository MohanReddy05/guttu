import * as SQLite from 'expo-sqlite';
import { CREATE_GROUPS_TABLE, CREATE_ICONS_TABLE, CREATE_PASSWORD_METADATA_TABLE } from './Schema';

// Open or create the database file
const db = SQLite.openDatabaseSync('volt.db');

/**
 * initialize the database by resetting and creating tables.
 * Note: Dropping tables will delete all stored data.
 */
export const initializeDatabase = async () => {
  try {
    // 1. Enable Foreign Key support in SQLite
    db.execSync('PRAGMA foreign_keys = ON;');

    // 2. DROP existing tables in reverse order of dependency
    // We drop the child table (metadata) before the parent tables (groups/icons)
    // console.log('Resetting database tables...');
    // db.execSync(`DROP TABLE IF EXISTS password_metadata;`);
    // db.execSync(`DROP TABLE IF EXISTS groups;`);
    // db.execSync(`DROP TABLE IF EXISTS icons;`);

    // 3. CREATE tables with the new schema
    db.execSync(CREATE_ICONS_TABLE);
    db.execSync(CREATE_GROUPS_TABLE);
    db.execSync(CREATE_PASSWORD_METADATA_TABLE);
    db.execSync(`UPDATE icons SET provider = 'MaterialCommunityIcons' WHERE provider IS NULL;`);
    console.log('Database initialized successfully with new schema');
    return true;
  } catch (error) {
    console.error('Error initializing Database:', error);
    return false;
  }
};

export default db;
