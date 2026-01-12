"use client";
import React, { useState, useEffect } from "react";
import { SidebarTrigger } from "./ui/sidebar";
import { Button } from "./ui/button";
import { useTheme } from "next-themes";
import { MoonIcon, SunDimIcon } from "lucide-react";
import SearchComponent from "./search-component";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { SUPPORTED_LANGUAGES } from "@/constants/dummy";

const Header: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const [language, setLanguage] = useState("en-US");
  const handleChangeTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <div className="flex items-center h-16 w-full p-4 gap-3">
      <SidebarTrigger />
      <SearchComponent />
      <div className="flex items-center justify-center gap-2">
        <Button variant="outline" onClick={handleChangeTheme}>
          {mounted ? (theme === "light" ? <MoonIcon /> : <SunDimIcon />) : <SunDimIcon />}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="outline" className="min-w-28.75">
              {SUPPORTED_LANGUAGES.find((lang) => lang.code === language)
                ?.label || "English"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-40 z-40" align="end" side="bottom">
            <DropdownMenuGroup>
              {SUPPORTED_LANGUAGES.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  className="flex gap-2 items-center cursor-pointer min-w-28.75"
                  onSelect={() => setLanguage(lang.code)}
                >
                  {lang.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="w-10 h-10 rounded-full border border-slate-200 flex justify-center items-center">
          User
        </div>
      </div>
    </div>
  );
};

export default Header;
