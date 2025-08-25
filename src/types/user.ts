export interface User {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin";
  preferences: {
    theme: "light" | "dark";
    notifications: boolean;
    emailUpdates: boolean;
    savedJobs: string[];
    favoriteRegions: string[];
    favoriteSectors: string[];
  };
  createdAt: string;
  updatedAt: string;
}