/**
 * DATABASE SCHEMA DEFINITIONS
 */

export const CREATE_ICONS_TABLE = `
  CREATE TABLE IF NOT EXISTS icons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    provider TEXT 
  );
`;

export const CREATE_GROUPS_TABLE = `
  CREATE TABLE IF NOT EXISTS groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    parent_id INTEGER,
    icons_id INTEGER,
    FOREIGN KEY (icons_id) REFERENCES icons (id),
    FOREIGN KEY (parent_id) REFERENCES groups (id)
  );
`;

export const CREATE_PASSWORD_METADATA_TABLE = `
  CREATE TABLE IF NOT EXISTS password_metadata (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id INTEGER,
    title TEXT NOT NULL,
    secure_key TEXT NOT NULL,
    FOREIGN KEY (group_id) REFERENCES groups (id)
  );
`;
