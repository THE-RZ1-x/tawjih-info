"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { User, Settings, LogOut, Bell, Star, BookOpen } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import AuthModal from "@/components/auth-modal";
import UserProfile from "@/components/user-profile";

export default function UserMenu() {
  const { user, isAuthenticated, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  if (!isAuthenticated) {
    return (
      <>
        <Button 
          variant="outline" 
          onClick={() => setShowAuthModal(true)}
          className="border-2 border-blue-200 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
        >
          <User className="w-4 h-4 ml-2" />
          تسجيل الدخول
        </Button>
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
        />
      </>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                {user?.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            {user?.preferences.notifications && (
              <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-white dark:border-slate-800"></div>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <div className="flex items-center justify-start gap-2 p-2">
            <div className="flex flex-col space-y-1 leading-none">
              <p className="font-medium">{user?.name}</p>
              <p className="w-[200px] truncate text-sm text-muted-foreground">
                {user?.email}
              </p>
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowProfile(true)}>
            <User className="mr-2 h-4 w-4" />
            <span>الملف الشخصي</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>الإعدادات</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Bell className="mr-2 h-4 w-4" />
            <span>الإشعارات</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Star className="mr-2 h-4 w-4" />
            <span>المفضلة</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <BookOpen className="mr-2 h-4 w-4" />
            <span>المحفوظات</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>تسجيل الخروج</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <UserProfile 
        isOpen={showProfile} 
        onClose={() => setShowProfile(false)} 
      />
    </>
  );
}