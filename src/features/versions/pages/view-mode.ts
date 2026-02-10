import { create } from "zustand";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type VersionsViewMode = "view" | "edit" | "performance";

export interface VersionsViewState {
  viewMode: VersionsViewMode;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

interface VersionsViewStore extends VersionsViewState {
  setViewMode: (mode: VersionsViewMode) => void;
}

export const useViewStore = create<VersionsViewStore>((set) => ({
  viewMode: "view",
  setViewMode: (viewMode) => set({ viewMode }),
}));
