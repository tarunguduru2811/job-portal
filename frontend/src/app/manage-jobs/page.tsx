"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useAuthStore } from "@/store/auth";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Briefcase, MapPin, DollarSign, Clock, Trash2, Edit, AlertCircle, Eye, PowerOff } from "lucide-react";

import { API_URL } from "@/lib/config";

type Job = {
  id: string;
  title: string;
  locationType: string;
  salaryRange: string;
  status: string;
  createdAt: string;
  applications: any[];
};

export default function ManageJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { token, user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!token || user?.role !== "EMPLOYER") {
      router.push("/");
      return;
    }

    fetchMyJobs();
  }, [token, user, router]);

  const fetchMyJobs = async () => {
    try {
      if (!user?.companyId) return;
      const res = await axios.get(`${API_URL}/jobs?companyId=${user.companyId}`);
      setJobs(res.data);
    } catch (err) {
      console.error("Failed to load jobs", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleJobStatus = async (job: Job) => {
    const newStatus = job.status === 'PUBLISHED' ? 'CLOSED' : 'PUBLISHED';
    try {
      await axios.put(
        `${API_URL}/jobs/${job.id}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setJobs(jobs.map(j => j.id === job.id ? { ...j, status: newStatus } : j));
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const deleteJob = async (id: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this job post and all its applications?")) return;
    
    try {
      await axios.delete(`${API_URL}/jobs/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setJobs(jobs.filter(j => j.id !== id));
    } catch (err) {
      alert("Failed to delete job");
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
      
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 mb-10">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl font-extrabold tracking-tight mb-2">Manage Jobs</h1>
            <p className="text-gray-400 text-lg">Oversee your job listings, manage statuses, and track performance.</p>
          </motion.div>
          <motion.button 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            onClick={() => router.push('/post-job')} 
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)]"
          >
            + Post New Job
          </motion.button>
        </div>

        {jobs.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-[#111827]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-12 text-center shadow-xl">
            <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Briefcase className="w-10 h-10 text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold mb-3">No jobs posted yet</h2>
            <p className="text-gray-400 max-w-md mx-auto mb-8">You haven't posted any job openings. Start attracting top talent today by posting your first role.</p>
            <button onClick={() => router.push('/post-job')} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-medium transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)]">
              Post a Job
            </button>
          </motion.div>
        ) : (
          <div className="bg-[#111827]/80 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10 text-gray-400 text-sm">
                    <th className="p-5 font-medium">Job Title</th>
                    <th className="p-5 font-medium">Location & Salary</th>
                    <th className="p-5 font-medium text-center">Status</th>
                    <th className="p-5 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job, idx) => (
                    <motion.tr 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      key={job.id} 
                      className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group"
                    >
                      <td className="p-5">
                        <div className="font-bold text-white text-base mb-1">{job.title}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Posted {new Date(job.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="p-5">
                        <div className="flex flex-col gap-1.5">
                          <span className="text-sm text-gray-300 flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-gray-500" /> {job.locationType}
                          </span>
                          <span className="text-sm text-gray-300 flex items-center gap-1.5">
                            <DollarSign className="w-3.5 h-3.5 text-gray-500" /> {job.salaryRange}
                          </span>
                        </div>
                      </td>
                      <td className="p-5 text-center">
                        <button 
                          onClick={() => toggleJobStatus(job)}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border inline-flex items-center gap-1.5 ${
                            job.status === 'PUBLISHED' 
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20' 
                              : 'bg-gray-500/10 text-gray-400 border-gray-500/20 hover:bg-gray-500/20'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${job.status === 'PUBLISHED' ? 'bg-emerald-400' : 'bg-gray-400'}`}></span>
                          {job.status === 'PUBLISHED' ? 'Active' : 'Closed'}
                        </button>
                      </td>
                      <td className="p-5 text-right">
                        <div className="flex items-center justify-end gap-3 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => router.push(`/jobs/${job.id}`)} className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors" title="View Public Page">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button onClick={() => router.push(`/ats?jobId=${job.id}`)} className="p-2 text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 rounded-lg transition-colors" title="View Applicants (ATS)">
                            <Briefcase className="w-4 h-4" />
                          </button>
                          <button onClick={() => deleteJob(job.id)} className="p-2 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors" title="Delete Job">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
