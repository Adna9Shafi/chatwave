import { create } from 'zustand'

let notifIdCounter = 0

const useNotificationStore = create((set, get) => ({
  notifications: [],

  setNotifications: (notifications) => set({ notifications }),

  addNotification: (notif) =>
    set((state) => ({
      notifications: [
        { ...notif },
        ...state.notifications,
      ],
    })),

  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n._id === id ? { ...n, read: true } : n
      ),
    })),

  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    })),

  clearAll: () => set({ notifications: [] }),

  get unreadCount() {
    return get().notifications.filter((n) => !n.read).length
  },
}))

export default useNotificationStore
