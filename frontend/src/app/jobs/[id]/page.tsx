"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useAuthStore } from "@/store/auth";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { MapPin, DollarSign, Clock, CheckCircle2,Briefcase, ChevronRight, ArrowLeft, Building2, Globe, Sparkles } from "lucide-react";

import { API_URL } from "@/lib/config";

type Job = {
  id: string;
  title: string;
  description: string;
  requirements: string;
  benefits: string[];
  locationType: string;
  salaryRange: string;
  createdAt: string;
  company: {
    name: string;
    description: string;
    website: string;
    logoUrl: string;
    techStack: string[];
    isVerified: boolean;
  };
};

export default function JobDetailsPage() {
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [isApplied, setIsApplied] = useState(false);
  
  const { id } = useParams();
  const { user, token } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    async function loadData() {
      try {
        const jobRes = await axios.get(`${API_URL}/jobs/${id}`);
        setJob(jobRes.data);

        // Check if already applied
        if (user && token && user.role === 'JOB_SEEKER') {
          try {
            const appsRes = await axios.get(`${API_URL}/applications/me`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            const appliedList = appsRes.data.map((a: any) => a.jobPostId);
            if (appliedList.includes(jobRes.data.id)) {
              setIsApplied(true);
            }
          } catch (e) {
            // ignore
          }
        }
      } catch (error) {
        console.error("Failed to load job", error);
      } finally {
        setLoading(false);
      }
    }
    
    if (id) loadData();
  }, [id, user, token]);

  const handleApply = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    setApplying(true);
    try {
      await axios.post(
        `${API_URL}/applications`, 
        { jobPostId: job?.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsApplied(true);
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to apply");
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-[#030712] text-white pt-36 px-4 flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-4">Job not found</h2>
        <button onClick={() => router.push('/jobs')} className="text-blue-400 hover:underline flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to jobs
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] text-white pt-36 pb-12 px-4 md:px-8 relative overflow-hidden">
      <div className="absolute top-0 right-1/4 w-[50%] h-[30%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[50%] h-[30%] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-4xl mx-auto relative z-10">
        <button onClick={() => router.push('/jobs')} className="text-gray-400 hover:text-white mb-8 transition-colors flex items-center gap-2 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to all jobs
        </button>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#111827]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-6 md:p-10 shadow-2xl"
        >
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8 pb-8 border-b border-white/5">
            <div className="flex gap-5">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-3xl text-white shadow-lg border border-white/20 shrink-0">
                {job.company.logoUrl ? (
                  <img src={job.company.logoUrl} alt={job.company.name} className="w-full h-full object-cover rounded-2xl" />
                ) : (
                  job.company.name.charAt(0)
                )}
              </div>
              <div className="flex flex-col justify-center">
                <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-2">{job.title}</h1>
                <div className="flex items-center gap-2 text-lg text-gray-400">
                  <span className="font-medium text-blue-400">{job.company.name}</span>
                  {job.company.isVerified && <CheckCircle2 className="w-5 h-5 text-blue-400" />}
                </div>
              </div>
            </div>
            
            {job.status === 'CLOSED' ? (
              <button 
                disabled
                className="w-full md:w-auto py-3.5 px-8 rounded-xl text-base font-bold transition-all flex items-center justify-center gap-2 shrink-0 bg-gray-500/20 text-gray-400 border border-gray-500/30 cursor-not-allowed"
              >
                Job Closed
              </button>
            ) : user?.role === 'EMPLOYER' ? (
              <button 
                disabled
                className="w-full md:w-auto py-3.5 px-8 rounded-xl text-base font-bold transition-all flex items-center justify-center gap-2 shrink-0 bg-gray-500/10 text-gray-400 border border-gray-500/20 cursor-not-allowed"
                title="Employers cannot apply to jobs. Please use a Job Seeker account."
              >
                Employer Account
              </button>
            ) : (
              <button 
                onClick={handleApply}
                disabled={isApplied || applying}
                className={`w-full md:w-auto py-3.5 px-8 rounded-xl text-base font-bold transition-all flex items-center justify-center gap-2 shrink-0 ${
                  isApplied 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.2)] hover:shadow-[0_0_30px_rgba(37,99,235,0.4)]'
                }`}
              >
                {isApplied ? (
                  <>Applied <CheckCircle2 className="w-5 h-5" /></>
                ) : applying ? (
                  "Applying..."
                ) : (
                  <>Apply Now <ChevronRight className="w-5 h-5" /></>
                )}
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-3 mb-10">
            <span className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-sm font-medium text-gray-300 flex items-center gap-2 shadow-inner">
              <MapPin className="w-4 h-4 text-gray-400" /> {job.locationType}
            </span>
            <span className="px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/20 text-sm font-medium text-green-400 flex items-center gap-2 shadow-inner">
              <DollarSign className="w-4 h-4" /> {job.salaryRange}
            </span>
            <span className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-sm font-medium text-gray-300 flex items-center gap-2 shadow-inner">
              <Clock className="w-4 h-4 text-gray-400" /> Active Hiring
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-10">
              <section>
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-blue-400" /> About the Role
                </h3>
                <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{job.description}</p>
              </section>
              
              {job.requirements && (
                <section>
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Requirements
                  </h3>
                  <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{job.requirements}</p>
                </section>
              )}
              
              {job.benefits && job.benefits.length > 0 && (
                <section>
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-400" /> Perks & Benefits
                  </h3>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {job.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-300">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
            
            <div className="lg:col-span-1">
              <div className="bg-black/30 border border-white/10 rounded-2xl p-6 sticky top-28">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-gray-400" /> About the Company
                </h3>
                
                {job.company.description ? (
                  <p className="text-sm text-gray-400 mb-6 leading-relaxed line-clamp-4">
                    {job.company.description}
                  </p>
                ) : (
                  <p className="text-sm text-gray-500 mb-6 italic">No description provided.</p>
                )}
                
                {job.company.website && (
                  <a href={job.company.website} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center gap-2 mb-6">
                    <Globe className="w-4 h-4" /> Visit Website
                  </a>
                )}
                
                {job.company.techStack && job.company.techStack.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Tech Stack</h4>
                    <div className="flex flex-wrap gap-2">
                      {job.company.techStack.map(tech => (
                        <span key={tech} className="px-2.5 py-1 bg-white/5 border border-white/10 text-gray-300 rounded-md text-xs font-medium">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
