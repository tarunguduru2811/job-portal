"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useAuthStore } from "@/store/auth";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Building2, MapPin, DollarSign, Calendar, Briefcase,ChevronRight, Clock, CheckCircle2, XCircle, AlertCircle, FileText } from "lucide-react";

import { API_URL } from "@/lib/config";

type Application = {
  id: string;
  status: string;
  createdAt: string;
  jobPost: {
    id: string;
    title: string;
    locationType: string;
    salaryRange: string;
    company: {
      name: string;
      logoUrl: string | null;
      isVerified: boolean;
    };
  };
};

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { token, user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!token || user?.role === "EMPLOYER") {
      router.push("/");
      return;
    }

    async function fetchApplications() {
      try {
        const res = await axios.get(`${API_URL}/applications/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setApplications(res.data);
      } catch (err) {
        console.error("Failed to load applications", err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchApplications();
  }, [token, user, router]);

  const getStatusConfig = (status: string) => {
    switch(status) {
      case 'APPLIED': return { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: Clock, label: 'Application Sent' };
      case 'REVIEWING': return { color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', icon: FileText, label: 'Under Review' };
      case 'INTERVIEWING': return { color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', icon: AlertCircle, label: 'Interviewing' };
      case 'OFFER_EXTENDED': return { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: CheckCircle2, label: 'Offer Extended' };
      case 'HIRED': return { color: 'text-emerald-500', bg: 'bg-emerald-500/20', border: 'border-emerald-500/30', icon: CheckCircle2, label: 'Hired!' };
      case 'REJECTED': return { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', icon: XCircle, label: 'Not Selected' };
      default: return { color: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/20', icon: Clock, label: status };
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
      <div className="absolute top-0 right-1/4 w-[50%] h-[30%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[50%] h-[30%] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">My Applications</h1>
          <p className="text-gray-400 text-lg">Track your job applications and monitor your hiring status.</p>
        </motion.div>

        {applications.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-[#111827]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-12 text-center shadow-xl">
            <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Briefcase className="w-10 h-10 text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold mb-3">No applications yet</h2>
            <p className="text-gray-400 max-w-md mx-auto mb-8">You haven't applied to any jobs yet. Start exploring opportunities and land your dream role.</p>
            <button onClick={() => router.push('/jobs')} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-medium transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)]">
              Browse Jobs
            </button>
          </motion.div>
        ) : (
          <div className="grid gap-4">
            {applications.map((app, idx) => {
              const statusConfig = getStatusConfig(app.status);
              const StatusIcon = statusConfig.icon;
              const dateObj = new Date(app.createdAt);
              const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

              return (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={app.id}
                  className="bg-[#111827]/80 backdrop-blur-xl border border-white/5 hover:border-white/10 rounded-2xl p-6 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-lg"
                >
                  <div className="flex items-center gap-5 flex-1">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center font-bold text-2xl text-gray-300 border border-white/10 overflow-hidden shrink-0">
                      {app.jobPost.company.logoUrl ? (
                        <img src={app.jobPost.company.logoUrl} alt={app.jobPost.company.name} className="w-full h-full object-cover" />
                      ) : (
                        app.jobPost.company.name.charAt(0)
                      )}
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1 hover:text-blue-400 cursor-pointer transition-colors" onClick={() => router.push(`/jobs/${app.jobPost.id}`)}>
                        {app.jobPost.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Building2 className="w-4 h-4 shrink-0" />
                        <span className="font-medium">{app.jobPost.company.name}</span>
                        {app.jobPost.company.isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
                      </div>
                      
                      <div className="flex flex-wrap gap-3 mt-3">
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {app.jobPost.locationType}
                        </span>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <DollarSign className="w-3 h-3" /> {app.jobPost.salaryRange}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col md:items-end justify-between gap-4 md:w-48 shrink-0">
                    <div className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 border ${statusConfig.bg} ${statusConfig.border} ${statusConfig.color} w-fit md:w-auto`}>
                      <StatusIcon className="w-4 h-4" />
                      {statusConfig.label}
                    </div>
                    
                    <div className="text-xs text-gray-500 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      Applied on {formattedDate}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
