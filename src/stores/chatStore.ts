import { create } from 'zustand';
import { supabase, STORAGE_URL } from '../lib/supabase';
import type { Message, User } from '../types/supabase';
import { useAuthStore } from './authStore';

type ChatUser = {
  id: string;
  username: string;
  avatar_url: string | null;
  last_seen: string | null;
  unread_count: number;
  last_message?: Message | null;
};

type ChatState = {
  conversations: ChatUser[];
  activeConversation: ChatUser | null;
  messages: Message[];
  loading: boolean;
  error: string | null;
  fetchConversations: () => Promise<void>;
  fetchMessages: (userId: string) => Promise<void>;
  sendMessage: (receiverId: string, content: string, file?: File) => Promise<void>;
  setActiveConversation: (user: ChatUser | null) => void;
  searchUsers: (query: string) => Promise<User[]>;
  markMessagesAsRead: (senderId: string) => Promise<void>;
};

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  activeConversation: null,
  messages: [],
  loading: false,
  error: null,

  fetchConversations: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    try {
      set({ loading: true, error: null });
      
      // Get all messages where current user is either sender or receiver
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });
      
      if (messagesError) {
        set({ error: messagesError.message, loading: false });
        return;
      }

      // Extract unique user IDs from messages
      const userIds = new Set<string>();
      messagesData?.forEach(message => {
        if (message.sender_id !== user.id) userIds.add(message.sender_id);
        if (message.receiver_id !== user.id) userIds.add(message.receiver_id);
      });

      // Get user details for each conversation
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .in('id', Array.from(userIds));
      
      if (usersError) {
        set({ error: usersError.message, loading: false });
        return;
      }

      // Count unread messages
      const userMap = new Map<string, ChatUser>();
      
      usersData?.forEach(userData => {
        // Get the last message for this user
        const lastMessage = messagesData?.find(msg => 
          (msg.sender_id === userData.id && msg.receiver_id === user.id) || 
          (msg.sender_id === user.id && msg.receiver_id === userData.id)
        );
        
        // Count unread messages
        const unreadCount = messagesData?.filter(msg => 
          msg.sender_id === userData.id && 
          msg.receiver_id === user.id && 
          !msg.read
        ).length || 0;
        
        userMap.set(userData.id, {
          ...userData,
          unread_count: unreadCount,
          last_message: lastMessage
        });
      });
      
      // Sort by last message time
      const conversations = Array.from(userMap.values()).sort((a, b) => {
        const aTime = a.last_message?.created_at || '0';
        const bTime = b.last_message?.created_at || '0';
        return new Date(bTime).getTime() - new Date(aTime).getTime();
      });
      
      set({ conversations, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  fetchMessages: async (userId: string) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    try {
      set({ loading: true, error: null });
      
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(
          `and(sender_id.eq.${user.id},receiver_id.eq.${userId}),` +
          `and(sender_id.eq.${userId},receiver_id.eq.${user.id})`
        )
        .order('created_at', { ascending: true });
      
      if (error) {
        set({ error: error.message, loading: false });
        return;
      }
      
      set({ messages: data as Message[], loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  sendMessage: async (receiverId: string, content: string, file?: File) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    try {
      set({ loading: true, error: null });
      
      let fileUrl = null;
      let fileType = null;
      let fileSize = null;
      
      // Upload file if provided
      if (file) {
        // Validate file size
        const sizeInMB = file.size / (1024 * 1024);
        const fileExtension = file.name.split('.').pop()?.toLowerCase();
        
        // Check file type and apply size limits
        if (file.type.startsWith('image/') && sizeInMB > 5) {
          set({ error: 'Image files must be less than 5MB', loading: false });
          return;
        } else if (file.type.startsWith('video/') && sizeInMB > 10) {
          set({ error: 'Video files must be less than 10MB', loading: false });
          return;
        } else if (fileExtension === 'pdf' && sizeInMB > 5) {
          set({ error: 'PDF files must be less than 5MB', loading: false });
          return;
        } else if (sizeInMB > 5) {
          set({ error: 'Files must be less than 5MB', loading: false });
          return;
        }
        
        // Upload file to Supabase storage
        const filePath = `${user.id}/${Date.now()}-${file.name}`;
        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('chat_files')
          .upload(filePath, file);
        
        if (uploadError) {
          set({ error: uploadError.message, loading: false });
          return;
        }
        
        fileUrl = `${STORAGE_URL}/chat_files/${filePath}`;
        fileType = file.type;
        fileSize = file.size;
      }
      
      // Send message
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: receiverId,
          content: content || null,
          file_url: fileUrl,
          file_type: fileType,
          file_size: fileSize,
          read: false
        });
      
      if (error) {
        set({ error: error.message, loading: false });
        return;
      }
      
      // Refresh messages
      await get().fetchMessages(receiverId);
      
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  setActiveConversation: (user: ChatUser | null) => {
    set({ activeConversation: user });
    
    if (user) {
      get().markMessagesAsRead(user.id);
      get().fetchMessages(user.id);
    }
  },

  searchUsers: async (query: string) => {
    if (!query || query.length < 3) return [];
    
    const user = useAuthStore.getState().user;
    if (!user) return [];
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .ilike('username', `%${query}%`)
        .neq('id', user.id)
        .limit(10);
      
      if (error) {
        set({ error: error.message });
        return [];
      }
      
      return data as User[];
    } catch (error: any) {
      set({ error: error.message });
      return [];
    }
  },

  markMessagesAsRead: async (senderId: string) => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('sender_id', senderId)
        .eq('receiver_id', user.id)
        .eq('read', false);
      
      if (error) {
        set({ error: error.message });
        return;
      }
      
      // Update unread count in conversations
      const conversations = get().conversations.map(conversation => {
        if (conversation.id === senderId) {
          return { ...conversation, unread_count: 0 };
        }
        return conversation;
      });
      
      set({ conversations });
    } catch (error: any) {
      set({ error: error.message });
    }
  }
}));

// Set up real-time subscriptions
export const initializeRealtime = () => {
  const user = useAuthStore.getState().user;
  if (!user) return;

  // Subscribe to new messages
  const messagesSubscription = supabase
    .channel('messages')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `receiver_id=eq.${user.id}`,
    }, (payload) => {
      const message = payload.new as Message;
      
      // Get current state before updating to prevent unnecessary re-renders
      const currentState = useChatStore.getState();
      
      // Update messages if this is the active conversation
      if (currentState.activeConversation?.id === message.sender_id) {
        const messages = [...currentState.messages, message];
        useChatStore.setState({ messages });
        useChatStore.getState().markMessagesAsRead(message.sender_id);
      }
      
      // Update conversations list without triggering unnecessary re-renders
      useChatStore.getState().fetchConversations();
    })
    .subscribe();

  return () => {
    supabase.removeChannel(messagesSubscription);
  };
};