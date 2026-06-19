import { create } from 'zustand'

const useSocketStore = create((set) => ({
  socket: null,
  isConnected: false,

  setSocket: (socket) => set({ socket }),
  setIsConnected: (connected) => set({ isConnected: connected }),
}))

export default useSocketStore
