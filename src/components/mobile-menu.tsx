"use client";

import { useState } from "react";
import { Menu, X, Home, TrendingUp, BookOpen, Calendar, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import Link from "next/link";
import GlobalSearch from "./global-search";

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const navigationItems = [
    {
      name: "الرئيسية",
      href: "/",
      icon: Home,
    },
    {
      name: "مباريات",
      href: "/jobs",
      icon: TrendingUp,
    },
    {
      name: "توجيه مدرسي",
      href: "/guidance",
      icon: BookOpen,
    },
    {
      name: "امتحانات",
      href: "/exams",
      icon: Calendar,
    },
  ];

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-10 w-10"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">فتح القائمة</span>
          </Button>
        </SheetTrigger>
        
        <SheetContent side="right" className="w-full sm:w-[400px] bg-background border-l">
          <SheetHeader className="border-b pb-4">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-right">القائمة الرئيسية</SheetTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </SheetHeader>

          <div className="flex flex-col h-full">
            {/* Logo and Brand */}
            <div className="flex items-center gap-3 p-6 border-b">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold gradient-text">INFO TAWJIH 2.0</h2>
                <p className="text-sm text-muted-foreground">منصة التوجيه والمباريات</p>
              </div>
            </div>

            {/* Global Search */}
            <div className="p-4 border-b">
              <GlobalSearch />
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 p-4">
              <div className="space-y-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={handleLinkClick}
                      className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </nav>

            {/* Quick Actions */}
            <div className="border-t p-4 space-y-3">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                إجراءات سريعة
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                  <Link href="/jobs" onClick={handleLinkClick}>
                    <TrendingUp className="w-4 h-4 ml-2" />
                    المباريات
                  </Link>
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                  <Link href="/guidance" onClick={handleLinkClick}>
                    <BookOpen className="w-4 h-4 ml-2" />
                    التوجيه
                  </Link>
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                  <Link href="/exams" onClick={handleLinkClick}>
                    <Calendar className="w-4 h-4 ml-2" />
                    الامتحانات
                  </Link>
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                  <Link href="/" onClick={handleLinkClick}>
                    <Search className="w-4 h-4 ml-2" />
                    البحث
                  </Link>
                </Button>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t p-4">
              <div className="text-center text-xs text-muted-foreground">
                <p>INFO TAWJIH 2.0 © 2024</p>
                <p className="mt-1">جميع الحقوق محفوظة</p>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}