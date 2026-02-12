import { createSlice } from '@reduxjs/toolkit';

interface SidebarState {
  collapsed: boolean;
}

const initialState: SidebarState = {
  collapsed: JSON.parse(localStorage.getItem('sidebar_collapsed') || 'false'),
};

const sidebarSlice = createSlice({
  name: 'sidebar',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.collapsed = !state.collapsed;
      localStorage.setItem('sidebar_collapsed', JSON.stringify(state.collapsed));
    },
    setSidebarCollapsed: (state, action) => {
      state.collapsed = action.payload;
      localStorage.setItem('sidebar_collapsed', JSON.stringify(state.collapsed));
    },
  },
});

export const { toggleSidebar, setSidebarCollapsed } = sidebarSlice.actions;
export default sidebarSlice.reducer;
