"use client";

import { useAuthStore } from "@/store/auth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import Logo from "./Logo";

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  // Hide global navbar on login/register pages
  if (pathname === '/login' || pathname === '/register') return null;
  // If in ATS dashboard, we can hide it because it has its own sidebar, or we can keep it.
  // Actually ATS dashboard looks best standalone.
  if (pathname.startsWith('/ats')) return null;

  return (
    <nav className="absolute top-0 w-full p-6 flex justify-between items-center z-50 max-w-7xl mx-auto left-0 right-0">
      <Logo onClick={() => router.push("/")} className="scale-75 md:scale-90 origin-left" />
      <div className="flex gap-4 items-center">
        {mounted && user ? (
          <>
            <div className="text-sm text-gray-300 mr-2 flex-col items-end hidden md:flex">
              <span className="font-medium text-white">{user.name}</span>
              <span className="text-[10px] text-gray-500 px-1.5 py-0.5 bg-white/5 rounded mt-0.5">{user.role}</span>
            </div>
            {user.role === 'EMPLOYER' ? (
              <>
                <button onClick={() => router.push("/company")} className="px-4 py-2 rounded-full text-sm font-medium hover:bg-white/10 transition-colors cursor-pointer text-gray-300">Company Profile</button>
                <button onClick={() => router.push("/manage-jobs")} className="px-4 py-2 rounded-full text-sm font-medium hover:bg-white/10 transition-colors cursor-pointer text-gray-300">Manage Jobs</button>
                <button onClick={() => router.push("/ats")} className="px-4 py-2 rounded-full text-sm font-medium bg-blue-600 text-white hover:bg-blue-500 transition-colors cursor-pointer shadow-[0_0_15px_rgba(37,99,235,0.3)]">ATS Dashboard</button>
              </>
            ) : (
              <>
                <button onClick={() => router.push("/applications")} className="px-4 py-2 rounded-full text-sm font-medium hover:bg-white/10 transition-colors cursor-pointer text-gray-300">Applications</button>
                <button onClick={() => router.push("/profile")} className="px-4 py-2 rounded-full text-sm font-medium hover:bg-white/10 transition-colors cursor-pointer text-gray-300">My Profile</button>
                <button onClick={() => router.push("/jobs")} className="px-4 py-2 rounded-full text-sm font-medium bg-white text-black hover:bg-gray-200 transition-colors cursor-pointer">Browse Jobs</button>
              </>
            )}
            <button onClick={handleLogout} className="p-2 rounded-full text-gray-400 hover:bg-white/10 hover:text-white transition-colors cursor-pointer" title="Log out">
              <LogOut className="w-5 h-5" />
            </button>
          </>
        ) : (
          <>
            <button onClick={() => router.push("/login")} className="px-4 py-2 rounded-full text-sm font-medium hover:bg-white/5 transition-colors cursor-pointer text-white">Sign In</button>
            <button onClick={() => router.push("/register")} className="px-4 py-2 rounded-full text-sm font-medium bg-white text-black hover:bg-gray-200 transition-colors cursor-pointer">Post a Job</button>
          </>
        )}
      </div>
    </nav>
  );
}
