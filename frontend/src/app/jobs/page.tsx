"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useAuthStore } from "@/store/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Search, MapPin, DollarSign, Clock, Briefcase, ChevronRight, CheckCircle2, Filter, X, Calendar } from "lucide-react";

import { API_URL } from "@/lib/config";

type Job = {
  id: string;
  title: string;
  description: string;
  requirements: string;
  locationType: string;
  salaryRange: string;
  createdAt: string;
  company: {
    name: string;
    isVerified: boolean;
    logoUrl: string | null;
  };
};

function JobsContent() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState<string | null>(null);
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]);
  
  const searchParams = useSearchParams();
  const [keyword, setKeyword] = useState(searchParams?.get("keyword") || "");
  const [location, setLocation] = useState(searchParams?.get("location") || "");
  const [locationType, setLocationType] = useState("");
  const [datePosted, setDatePosted] = useState("");
  
  const { user, token } = useAuthStore();
  const router = useRouter();

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (keyword) params.append("keyword", keyword);
      if (location) params.append("location", location);
      if (locationType) params.append("locationType", locationType);
      if (datePosted) params.append("datePosted", datePosted);
      
      const res = await axios.get(`${API_URL}/jobs?${params.toString()}`);
      setJobs(res.data);
    } catch (err) {
      console.error("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    
    // Fetch user's applied jobs
    if (user && token && user.role === 'JOB_SEEKER') {
      axios.get(`${API_URL}/applications/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        const appliedList = res.data.map((a: any) => a.jobPostId);
        setAppliedJobs(appliedList);
      })
      .catch(() => {});
    }
  }, [user, token]);

  const handleApply = async (jobId: string) => {
    if (!user || !token) {
      router.push("/login");
      return;
    }
    if (user.role === "EMPLOYER") {
      alert("Employers cannot apply to jobs.");
      return;
    }

    setApplying(jobId);
    try {
      await axios.post(
        `${API_URL}/applications`, 
        { jobPostId: jobId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAppliedJobs(prev => [...prev, jobId]);
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to apply");
    } finally {
      setApplying(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] text-white pt-36 pb-12 px-4 md:px-8 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 right-1/4 w-[50%] h-[30%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Explore Opportunities</h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">Discover roles that match your skills and apply with a single click using our smart matching engine.</p>
          
          <div className="bg-[#111827]/80 backdrop-blur-xl border border-white/10 p-2 rounded-2xl md:rounded-full flex flex-col md:flex-row items-center gap-2 max-w-4xl mx-auto shadow-lg">
            <div className="flex-1 flex items-center gap-3 px-4 py-3 w-full md:w-auto">
              <Search className="w-5 h-5 text-gray-400" />
              <input 
                type="text" 
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
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
                placeholder="City, state, or region" 
                className="bg-transparent border-none outline-none w-full text-white placeholder:text-gray-500"
              />
            </div>
            
            {/* Added Date Filter */}
            <div className="hidden md:block w-px h-8 bg-white/10" />
            <div className="flex-1 flex items-center gap-3 px-4 py-3 w-full md:w-auto border-t md:border-t-0 border-white/10">
              <Calendar className="w-5 h-5 text-gray-400" />
              <select 
                value={datePosted}
                onChange={(e) => setDatePosted(e.target.value)}
                className="bg-transparent border-none outline-none w-full text-white placeholder:text-gray-500 appearance-none cursor-pointer"
              >
                <option value="" className="bg-[#111827]">Any Date</option>
                <option value="past_24h" className="bg-[#111827]">Past 24 hours</option>
                <option value="past_week" className="bg-[#111827]">Past week</option>
                <option value="past_month" className="bg-[#111827]">Past month</option>
              </select>
            </div>

            <div className="hidden md:block w-px h-8 bg-white/10" />
            <div className="flex-1 flex items-center gap-3 px-4 py-3 w-full md:w-auto border-t md:border-t-0 border-white/10">
              <Filter className="w-5 h-5 text-gray-400" />
              <select 
                value={locationType}
                onChange={(e) => setLocationType(e.target.value)}
                className="bg-transparent border-none outline-none w-full text-white placeholder:text-gray-500 appearance-none"
              >
                <option value="" className="bg-[#111827]">Any Type</option>
                <option value="REMOTE" className="bg-[#111827]">Remote</option>
                <option value="HYBRID" className="bg-[#111827]">Hybrid</option>
                <option value="ONSITE" className="bg-[#111827]">On-site</option>
              </select>
            </div>
            <button 
              onClick={fetchJobs}
              className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl md:rounded-full font-medium transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(37,99,235,0.2)]"
            >
              Search
            </button>
          </div>
        </motion.div>

        <div className="space-y-4">
          {jobs.map((job, idx) => {
            const isApplied = appliedJobs.includes(job.id);
            return (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                key={job.id} 
                className="group bg-[#111827]/80 backdrop-blur-xl border border-white/5 hover:border-blue-500/30 rounded-2xl p-6 transition-all shadow-lg hover:shadow-blue-500/10"
              >
                <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center font-bold text-xl text-gray-300 border border-white/10 overflow-hidden shrink-0">
                        {job.company.logoUrl ? (
                          <img src={job.company.logoUrl} alt={job.company.name} className="w-full h-full object-cover" />
                        ) : (
                          job.company.name.charAt(0)
                        )}
                      </div>
                      <div>
                        <h2 className="text-xl font-bold group-hover:text-blue-400 transition-colors">{job.title}</h2>
                        <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                          <span>{job.company.name}</span>
                          {job.company.isVerified && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 mt-4">
                      <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-xs font-medium text-gray-300 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" /> {job.locationType}
                      </span>
                      <span className="px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-xs font-medium text-green-400 flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5" /> {job.salaryRange}
                      </span>
                      <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-xs font-medium text-gray-300 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-gray-400" /> Just posted
                      </span>
                    </div>

                    <p className="mt-4 text-gray-400 text-sm line-clamp-2 pr-8">
                      {job.description}
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-end justify-between min-w-[140px]">
                    {job.status === 'CLOSED' ? (
                      <button 
                        disabled
                        className="w-full py-3 px-6 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 bg-gray-500/10 text-gray-400 border border-gray-500/20 cursor-not-allowed"
                      >
                        Closed
                      </button>
                    ) : user?.role === 'EMPLOYER' ? (
                      <button 
                        disabled
                        className="w-full py-3 px-6 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 bg-gray-500/10 text-gray-400 border border-gray-500/20 cursor-not-allowed"
                        title="Employers cannot apply to jobs."
                      >
                        Employer
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleApply(job.id)}
                        disabled={isApplied || applying === job.id}
                        className={`w-full py-3 px-6 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                          isApplied 
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                            : 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.2)] hover:shadow-[0_0_30px_rgba(37,99,235,0.4)]'
                        } disabled:opacity-50`}
                      >
                        {isApplied ? (
                          <>Applied <CheckCircle2 className="w-4 h-4" /></>
                        ) : applying === job.id ? (
                          "Applying..."
                        ) : (
                          <>1-Click Apply <ChevronRight className="w-4 h-4" /></>
                        )}
                      </button>
                    )}
                    
                    <button onClick={() => router.push(`/jobs/${job.id}`)} className="text-xs text-gray-500 hover:text-white mt-4 transition-colors">
                      View full details
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
          
          {jobs.length === 0 && (
            <div className="text-center py-20 bg-[#111827]/50 rounded-3xl border border-white/5">
              <Briefcase className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">No active jobs</h3>
              <p className="text-gray-500">Check back later for new opportunities.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { Suspense } from 'react';

export default function JobsFeed() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#030712] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <JobsContent />
    </Suspense>
  );
}
