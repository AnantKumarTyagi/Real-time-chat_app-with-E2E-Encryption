import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import { generateKeyPair, exportPublicKey, wrapKeyWithPin, unwrapKeyWithPin } from "../lib/crypto.js";
import { savePrivateKey, getPrivateKey, clearPrivateKey } from "../lib/KeyStorage.js";
const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  privateKey: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,
  isDeviceLocked: false,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      
      const storedPrivateKey = await getPrivateKey();

      let locked = false;
  
      if (res.data.encryptedPrivateKey && !storedPrivateKey) {
        locked = true;
      }

      set({ authUser: res.data, privateKey: storedPrivateKey || null, isDeviceLocked: locked });
      get().connectSocket();
    } catch (error) {
      console.log("Error in checkAuth:", error);
      set({ authUser: null, privateKey: null, isDeviceLocked: false });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data, pin) => {
    set({ isSigningUp: true });
    try {
      const keyPair = await generateKeyPair();
      const publicKeyJwk = await exportPublicKey(keyPair.publicKey);
      
      const { wrappedBlob, salt, iv } = await wrapKeyWithPin(keyPair.privateKey, pin);
      await savePrivateKey(keyPair.privateKey);
      set({ privateKey: keyPair.privateKey, isDeviceLocked: false });

      const payload = { ...data, publicKey: publicKeyJwk, encryptedPrivateKey: wrappedBlob,
        keyBackupSalt: salt,
        keyBackupIv: iv };
      const res = await axiosInstance.post("/auth/signup", payload);

      set({ authUser: res.data });
      toast.success("Account created successfully");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response?.data?.message || "Signup failed");
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      
      const storedPrivateKey = await getPrivateKey();
      if (res.data.encryptedPrivateKey && !storedPrivateKey) {
        set({ isDeviceLocked: true }); 
      } else {
        get().connectSocket();
      }
      
      toast.success("Logged in successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      set({ isLoggingIn: false });
    }
  },

  

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      await clearPrivateKey();
      set({ authUser: null,privateKey: null });
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("error in update profile:", error);
      toast.error(error.response.data.message);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      query: {
        userId: authUser._id,
      },
    });
    socket.connect();

    set({ socket: socket });

    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });
  },
  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },


  unlockDevice: async (pin) => {
    const { authUser } = get();
    try {
      const privateKey = await unwrapKeyWithPin(
        authUser.encryptedPrivateKey,
        pin,
        authUser.keyBackupSalt,
        authUser.keyBackupIv
      );

      await savePrivateKey(privateKey);
      set({ privateKey: privateKey, isDeviceLocked: false });
      
      toast.success("Chat history unlocked!");
      get().connectSocket();
    } catch (error) {
      console.error("Unwrap failed:", error);
      toast.error("Incorrect PIN. Please try again.");
    }
  },

  hardResetVault: async (newPin) => {
    try {
      
      const keyPair = await generateKeyPair();
      const publicKeyJwk = await exportPublicKey(keyPair.publicKey);
      
      const { wrappedBlob, salt, iv } = await wrapKeyWithPin(keyPair.privateKey, newPin);

      await savePrivateKey(keyPair.privateKey);

      
      const payload = {
        publicKey: publicKeyJwk,
        encryptedPrivateKey: wrappedBlob,
        keyBackupSalt: salt,
        keyBackupIv: iv
      };

      const res = await axiosInstance.post("/auth/reset-vault", payload);

      set({ 
        authUser: res.data, 
        privateKey: keyPair.privateKey, 
        isDeviceLocked: false 
      });
      
      toast.success("Vault Reset. You can now send new secure messages.");
      get().connectSocket();
    } catch (error) {
      console.error("Hard Reset failed:", error);
      toast.error("Failed to reset Vault. Please try again.");
    }
  },
}));
