"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";

export default function ProtectedRoute({ 
  children, 
  allowedRoles 
}: { 
  children: React.ReactNode, 
  allowedRoles?: string[] 
}) {
  const { user, token } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Give it a tiny tick to ensure store hydrates before redirecting
    const timeout = setTimeout(() => {
      const currentToken = useAuthStore.getState().token;
      const currentUser = useAuthStore.getState().user;
      
      if (!currentToken || !currentUser) {
        router.push("/login");
      } else if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
        router.push("/");
      } else {
        setAuthorized(true);
      }
    }, 50);
    
    return () => clearTimeout(timeout);
  }, [router, allowedRoles]);

  if (!mounted || !authorized) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return <>{children}</>;
}
