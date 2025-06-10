import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getToolById } from '@/lib/toolCategories';

interface FavoriteTool {
  toolId: string;
  toolName: string;
  category: string;
  addedAt: string;
}

interface RecentTool {
  toolId: string;
  toolName: string;
  category: string;
  visitedAt: string;
  visitCount: number;
}

interface UserDataContextType {
  favorites: FavoriteTool[];
  recentTools: RecentTool[];
  addToFavorites: (toolId: string) => void;
  removeFromFavorites: (toolId: string) => void;
  isFavorite: (toolId: string) => boolean;
  addToRecent: (toolId: string) => void;
  clearRecent: () => void;
  clearFavorites: () => void;
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

export function UserDataProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<FavoriteTool[]>([]);
  const [recentTools, setRecentTools] = useState<RecentTool[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedFavorites = localStorage.getItem('toolhub-favorites');
    const savedRecent = localStorage.getItem('toolhub-recent');

    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (error) {
        console.error('Failed to parse saved favorites:', error);
      }
    }

    if (savedRecent) {
      try {
        setRecentTools(JSON.parse(savedRecent));
      } catch (error) {
        console.error('Failed to parse saved recent tools:', error);
      }
    }
  }, []);

  // Save favorites to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('toolhub-favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Save recent tools to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('toolhub-recent', JSON.stringify(recentTools));
  }, [recentTools]);

  const addToFavorites = useCallback((toolId: string) => {
    const tool = getToolById(toolId);
    if (!tool) return;

    const favorite: FavoriteTool = {
      toolId,
      toolName: tool.tool.name,
      category: tool.category.title,
      addedAt: new Date().toISOString()
    };

    setFavorites(prev => {
      // Check if already in favorites
      if (prev.some(f => f.toolId === toolId)) {
        return prev;
      }
      return [favorite, ...prev];
    });
  }, []);

  const removeFromFavorites = useCallback((toolId: string) => {
    setFavorites(prev => prev.filter(f => f.toolId !== toolId));
  }, []);

  const isFavorite = useCallback((toolId: string) => {
    return favorites.some(f => f.toolId === toolId);
  }, [favorites]);

  const addToRecent = useCallback((toolId: string) => {
    const tool = getToolById(toolId);
    if (!tool) return;

    setRecentTools(prev => {
      const existingIndex = prev.findIndex(r => r.toolId === toolId);
      const visitedAt = new Date().toISOString();

      if (existingIndex !== -1) {
        // Update existing entry
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          visitedAt,
          visitCount: updated[existingIndex].visitCount + 1
        };
        // Move to front
        const item = updated.splice(existingIndex, 1)[0];
        return [item, ...updated];
      } else {
        // Add new entry
        const recentTool: RecentTool = {
          toolId,
          toolName: tool.tool.name,
          category: tool.category.title,
          visitedAt,
          visitCount: 1
        };
        // Keep only last 20 recent tools
        return [recentTool, ...prev.slice(0, 19)];
      }
    });
  }, []);

  const clearRecent = useCallback(() => {
    setRecentTools([]);
  }, []);

  const clearFavorites = useCallback(() => {
    setFavorites([]);
  }, []);

  return (
    <UserDataContext.Provider value={{
      favorites,
      recentTools,
      addToFavorites,
      removeFromFavorites,
      isFavorite,
      addToRecent,
      clearRecent,
      clearFavorites
    }}>
      {children}
    </UserDataContext.Provider>
  );
}

export function useUserData() {
  const context = useContext(UserDataContext);
  if (context === undefined) {
    throw new Error('useUserData must be used within a UserDataProvider');
  }
  return context;
}