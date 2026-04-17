import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import { deriveSharedKey, decryptMessage } from "../lib/crypto";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  sharedKey: null,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      const { privateKey } = useAuthStore.getState();
      const { selectedUser } = get();

      let decryptedMessages = res.data;

      if (selectedUser?.publicKey && privateKey) {
        try {
          const sharedKey = await deriveSharedKey(privateKey, selectedUser.publicKey);
          
          decryptedMessages = await Promise.all(
            res.data.map(async (msg) => {
              if (msg.text && msg.iv) {
                try {
                  msg.text = await decryptMessage(msg.text, msg.iv, sharedKey);
                } catch (err) {
                  err.message = "Message Decryption Failed";
                }
              }
              return msg;
            })
          );
        } catch (cryptoError) {
          console.error("Key derivation failed:", cryptoError);
       
        }
      }

      set({ messages: decryptedMessages });
    } catch (error) {
      console.error("Error in getMessages:", error);
      const errorMessage = error.response?.data?.message;
      toast.error(errorMessage);
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  sendMessage: async (messageData, originalText) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      
      const sentMessage = res.data;
      
      if (originalText) {
        sentMessage.text = originalText;
      } else {
        sentMessage.text = ""; 
      }

      set({ messages: [...messages, sentMessage] });
      
    } catch (error) {
      console.error("Error in sendMessage:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to send message";
      toast.error(errorMessage);
    }
  },
  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    socket.on("newMessage",async (newMessage) => {
      const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;
      const { privateKey } = useAuthStore.getState();

      if (newMessage.text && newMessage.iv && selectedUser.publicKey && privateKey) {
        try {
          const sharedKey = await deriveSharedKey(privateKey, selectedUser.publicKey);
          newMessage.text = await decryptMessage(newMessage.text, newMessage.iv, sharedKey);
        } catch (err) {
          err.message = "Message Decryption Failed";
        }
      }
      set({
        messages: [...get().messages, newMessage],
      });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },

  setSelectedUser: async (selectedUser) => {
    set({ selectedUser });

    if (!selectedUser) {
      return set({ sharedKey: null });
    }

    const { privateKey } = useAuthStore.getState();
    
    if (privateKey && selectedUser.publicKey) {
      try {
        const key = await deriveSharedKey(privateKey, selectedUser.publicKey);
        set({ sharedKey: key });
      } catch (error) {
        console.error("Failed to derive shared key for this chat:", error);
        set({ sharedKey: null });
      }
    } else {
      set({ sharedKey: null });
    }
  },

}));
