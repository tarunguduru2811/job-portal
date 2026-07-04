"use client";

import { motion } from "framer-motion";
import { Search, Briefcase, MapPin, ArrowRight, LogOut } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const router = useRouter();

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (keyword) params.append("keyword", keyword);
    if (location) params.append("location", location);
    router.push(`/jobs?${params.toString()}`);
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-center min-h-screen relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Hero Content */}
      <div className="z-10 w-full max-w-4xl mx-auto px-4 text-center mt-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass border border-white/10 text-sm mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <span>Over 10,000+ jobs added this week</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight"
        >
          Find your next dream job <br className="hidden md:block" />
          with <span className="text-gradient">precision</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg md:text-xl text-gray-400 mb-12 max-w-2xl mx-auto"
        >
          The most advanced AI-powered job board connecting top talent with elite companies worldwide.
        </motion.p>

        {/* Search Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="glass-card p-2 rounded-full flex flex-col md:flex-row items-center gap-2 max-w-3xl mx-auto"
        >
          <div className="flex-1 flex items-center gap-3 px-4 py-3 w-full md:w-auto">
            <Search className="w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Job title, keywords, or company" 
              className="bg-transparent border-none outline-none w-full text-white placeholder:text-gray-500"
            />
          </div>
          <div className="hidden md:block w-px h-8 bg-white/10" />
          <div className="flex-1 flex items-center gap-3 px-4 py-3 w-full md:w-auto border-t md:border-t-0 border-white/10">
            <MapPin className="w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="City, state, or remote" 
              className="bg-transparent border-none outline-none w-full text-white placeholder:text-gray-500"
            />
          </div>
          <button 
            onClick={handleSearch}
            className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-full font-medium transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 cursor-pointer"
          >
            Search
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>

        {/* Quick Stats/Features */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm text-gray-400"
        >
          <div className="flex flex-col items-center gap-2">
            <Briefcase className="w-6 h-6 text-blue-400" />
            <span>AI Resume Parsing</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-6 h-6 rounded bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold">1-C</div>
            <span>1-Click Apply</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-6 h-6 rounded bg-green-500/20 flex items-center justify-center text-green-400 font-bold">★</div>
            <span>Verified Employers</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-6 h-6 rounded bg-orange-500/20 flex items-center justify-center text-orange-400 font-bold">⚡</div>
            <span>Real-time Alerts</span>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
