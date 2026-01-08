# Guttu - Secure Password Vault

**Guttu** is a robust, offline-first mobile password manager built with **React Native** and **Expo**. It empowers users to store their sensitive credentials locally with enterprise-grade encryption, ensuring that data never leaves the device.

## 🛡️ Security Architecture

Security is the core of Guttu. The application employs a multi-layered defense strategy:

1.  **Hardware-Backed Key Storage:** Master encryption keys are stored in the device's secure enclave (Android Keystore) using `expo-secure-store`.
2.  **AES-256 Encryption:** All passwords are encrypted using the AES-256 algorithm before being written to the disk. Even if the database file is accessed, the contents remain unreadable.
3.  **Local Persistence:** Data is stored in a local **SQLite** database (`expo-sqlite`), ensuring high performance and 100% offline capability.
4.  **Zero-Knowledge Philosophy:** The app does not use cloud sync or external servers. Your data belongs to you and stays on your physical hardware.

## ✨ Features

- **Encrypted Storage:** Securely save passwords, usernames, and website URLs.
- **Biometric Ready:** Built with hooks ready for FaceID/Fingerprint integration.
- **Search & Filter:** Quickly find credentials using a fast, indexed SQLite search.
- **Auto-Key Generation:** Automatically generates a unique encryption key upon the first launch.

## 🛠️ Tech Stack

- **Framework:** [React Native](https://reactnative.dev/) (Expo SDK)
- **Database:** [Expo SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite/)
- **Security:** [Expo SecureStore](https://docs.expo.dev/versions/latest/sdk/securestore/) & [CryptoJS](https://www.npmjs.com/package/crypto-js)
- **Icons:** Expo Vector Icons (Material Community)

## 📦 Installation & Setup

Ensure you have [Node.js](https://nodejs.org/) and [Expo Go](https://expo.dev/client) installed on your physical device.

1. **Clone the repository:**

   ```bash
   git clone [https://github.com/MohanReddy05/guttu.git](https://github.com/MohanReddy05/guttu.git)
   cd guttu

   ```

2. **Install dependencies::**

   ```bash
   npm install

   ```

3. **Start the development server**

   ```bash
   npx expo start

   ```

4. **Run on your device**
   :Scan the QR code appearing in your terminal using the Expo Go app (Android).

# 📂 Project Structure

```Plaintext
├── src/
│   ├── components/      # Reusable UI components
│   ├── database/        # SQLite initialization and queries
│   ├── services/        # Encryption and SecureStore logic
│   ├── screens/         # App screens (Home, Add Password, Settings)
│   └── utils/           # Helper functions
├── App.js               # Main entry point
└── package.json         # Project dependencies
```

# 🔒 Security Best Practices Implemented

- **No Plaintext:** No sensitive data is ever stored in AsyncStorage or plain text files.

- **Memory Management:** Decrypted strings exist only in memory during the specific view lifecycle.

- **Scoped Storage:** Uses platform-specific scoped storage to prevent other apps from accessing the database file.
