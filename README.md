# 🔒 SecureChat: End-to-End Encrypted Real-Time Chat

A highly secure, real-time messaging application featuring End-to-End Encryption (E2EE) for both text messages and media files. Built with the MERN stack and powered by the native WebCrypto API, this application ensures that only the sender and the intended recipient can read the messages or view the images.

## 🚀 Overview
Privacy is paramount. Unlike standard chat applications where messages are stored in plain text on the server, this application mathematically scrambles your text and images directly in the browser *before* they are sent over the network. The server acts strictly as a "blind" storage locker and never has access to the cryptographic keys required to decrypt your data.

## ✨ Key Features

* **End-to-End Text Encryption:** Utilizes the WebCrypto API (AES-GCM) to encrypt and decrypt messages natively in the browser.
* **E2EE Image Sharing:** Compresses and encrypts images into binary buffers before uploading them safely to the cloud.
* **Real-Time Communication:** Instant message delivery and UI updates powered by Socket.io.
* **Zero-Knowledge Backend:** The MongoDB database and Cloudinary storage only hold encrypted gibberish and Initialization Vectors (IVs).
* **Optimistic UI Updates:** Instant visual feedback when sending messages for a snappy user experience.
* **Secure Authentication:** JWT-based user authentication with HTTP-only cookies.
* **Responsive Design:** A beautiful, modern UI that works flawlessly on desktop and mobile.

## 🛠️ Tech Stack

**Frontend:**
* React (Vite)
* Zustand (State Management)
* Tailwind CSS / DaisyUI (Styling)
* Socket.io-client (Real-time events)
* WebCrypto API (Native Cryptography)
* Browser-Image-Compression (Media optimization)

**Backend:**
* Node.js & Express
* MongoDB & Mongoose (Database)
* Socket.io (WebSocket Server)
* JSON Web Tokens (Authentication)
* Cloudinary (Encrypted Media Storage Locker)

## 🔐 How the Encryption Works

1. **Key Generation:** When a user logs in, their private keys are stored securely in the browser's IndexedDB, while public keys are saved to MongoDB.
2. **Shared Secret:** When a chat is opened, the app derives a highly secure, unique `sharedKey` using the sender's private key and the receiver's public key.
3. **Text Processing:** Messages are encrypted using AES-GCM, generating a unique Initialization Vector (IV) and a ciphertext string.
4. **Image Processing:** Images are converted to a file, heavily compressed, and then run through the AES-GCM encryption engine. The resulting binary blob is uploaded to Cloudinary as a raw `.txt` or `.bin` file to bypass image processing.
5. **Decryption:** The recipient's frontend pulls the encrypted payloads and IVs from the database/Cloudinary and reverses the math using their derived `sharedKey`.

## ⚙️ Installation & Setup

### Prerequisites
Make sure you have the following installed/configured:
* Node.js (v18 or higher)
* MongoDB Atlas Account (or local MongoDB)
* Cloudinary Account

### 1. Clone the Repository
```bash
git clone [https://github.com/AnantKumarTyagi/Real-time-chat_app-with-E2E-Encryption.git](https://github.com/AnantKumarTyagi/Real-time-chat_app-with-E2E-Encryption.git)
cd Real-time-chat_app-with-E2E-Encryption
```
### 2. Environment Variables
Create a `.env` file in the `backend` folder (or root directory, depending on your setup) and add the following keys:

```env
# Server
PORT=5001
NODE_ENV=development

# Database
MONGO_URI=your_mongodb_connection_string

# Authentication
JWT_SECRET=your_super_secret_jwt_string

# Cloudinary (Media Storage)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```
### 3. Install Dependencies
Navigate to both the frontend and backend directories to install the required packages:

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
```
### 4. Run the Application
You can run the frontend and backend concurrently.

Start the Backend:

```bash
# From the root/backend directory
npm run dev
```
Start the Frontend:
```bash
# From the frontend directory
npm run dev
```
The application will be running at http://localhost:5173.
