import { create } from 'zustand'

const useChatStore = create((set, get) => ({
  conversations: [],
  activeConversation: null,
  messagesMap: {},
  groupMessagesMap: {},
  groups: [],
  activeGroup: null,
  onlineUsers: [],
  awayUsers: [],
  typingUsersMap: {},
  unreadCounts: {},
  isMessagesLoading: false,
  isConversationsLoading: false,
  replyTo: null,
  chatSearchOpen: false,
  scrollToMessage: null,
  contacts: [],
  blockedUsers: [],

  setConversations: (conversations) => set({ conversations }),
  setActiveConversation: (conversation) => set({ activeConversation: conversation }),

  setMessages: (convId, messages) =>
    set((state) => ({ messagesMap: { ...state.messagesMap, [convId]: messages } })),
  addMessage: (convId, message) =>
    set((state) => ({
      messagesMap: {
        ...state.messagesMap,
        [convId]: [...(state.messagesMap[convId] || []), message],
      },
    })),
  prependMessages: (convId, messages) =>
    set((state) => ({
      messagesMap: {
        ...state.messagesMap,
        [convId]: [...messages, ...(state.messagesMap[convId] || [])],
      },
    })),
  updateMessage: (convId, messageId, updates) =>
    set((state) => ({
      messagesMap: {
        ...state.messagesMap,
        [convId]: (state.messagesMap[convId] || []).map((m) =>
          m._id === messageId ? { ...m, ...updates } : m
        ),
      },
    })),
  clearMessages: (convId) =>
    set((state) => {
      const map = { ...state.messagesMap }
      delete map[convId]
      return { messagesMap: map }
    }),

  setGroupMessages: (groupId, messages) =>
    set((state) => ({ groupMessagesMap: { ...state.groupMessagesMap, [groupId]: messages } })),
  addGroupMessage: (groupId, message) =>
    set((state) => ({
      groupMessagesMap: {
        ...state.groupMessagesMap,
        [groupId]: [...(state.groupMessagesMap[groupId] || []), message],
      },
    })),
  prependGroupMessages: (groupId, messages) =>
    set((state) => ({
      groupMessagesMap: {
        ...state.groupMessagesMap,
        [groupId]: [...messages, ...(state.groupMessagesMap[groupId] || [])],
      },
    })),
  updateGroupMessage: (groupId, messageId, updates) =>
    set((state) => ({
      groupMessagesMap: {
        ...state.groupMessagesMap,
        [groupId]: (state.groupMessagesMap[groupId] || []).map((m) =>
          m._id === messageId ? { ...m, ...updates } : m
        ),
      },
    })),

  setGroups: (groups) => set({ groups }),
  setActiveGroup: (group) => set({ activeGroup: group }),

  setOnlineUsers: (users) => set({ onlineUsers: users }),
  addOnlineUser: (userId) =>
    set((state) => ({
      onlineUsers: state.onlineUsers.includes(userId)
        ? state.onlineUsers
        : [...state.onlineUsers, userId],
      awayUsers: state.awayUsers.filter((id) => id !== userId),
    })),
  removeOnlineUser: (userId) =>
    set((state) => ({
      onlineUsers: state.onlineUsers.filter((id) => id !== userId),
    })),

  setAwayUsers: (users) => set({ awayUsers: users }),
  addAwayUser: (userId) =>
    set((state) => ({
      awayUsers: state.awayUsers.includes(userId)
        ? state.awayUsers
        : [...state.awayUsers, userId],
    })),
  removeAwayUser: (userId) =>
    set((state) => ({
      awayUsers: state.awayUsers.filter((id) => id !== userId),
    })),

  setTypingUsers: (convId, users) =>
    set((state) => ({
      typingUsersMap: { ...state.typingUsersMap, [convId]: users },
    })),
  addTypingUser: (convId, userId) =>
    set((state) => {
      const current = state.typingUsersMap[convId] || []
      return {
        typingUsersMap: {
          ...state.typingUsersMap,
          [convId]: current.includes(userId) ? current : [...current, userId],
        },
      }
    }),
  removeTypingUser: (convId, userId) =>
    set((state) => ({
      typingUsersMap: {
        ...state.typingUsersMap,
        [convId]: (state.typingUsersMap[convId] || []).filter((id) => id !== userId),
      },
    })),

  setReplyTo: (replyTo) => set({ replyTo }),
  clearReplyTo: () => set({ replyTo: null }),

  setChatSearchOpen: (open) => set({ chatSearchOpen: open }),
  setScrollToMessage: (messageId) => set({ scrollToMessage: messageId }),

  setIsMessagesLoading: (loading) => set({ isMessagesLoading: loading }),
  setIsConversationsLoading: (loading) => set({ isConversationsLoading: loading }),

  setContacts: (contacts) => set({ contacts }),
  setBlockedUsers: (users) => set({ blockedUsers: users }),

  incrementUnread: (conversationId) =>
    set((state) => ({
      unreadCounts: {
        ...state.unreadCounts,
        [conversationId]: (state.unreadCounts[conversationId] || 0) + 1,
      },
    })),
  markAsRead: (conversationId) =>
    set((state) => ({
      unreadCounts: { ...state.unreadCounts, [conversationId]: 0 },
    })),
  getUnread: (conversationId) => get().unreadCounts[conversationId] || 0,
}))

export default useChatStore
