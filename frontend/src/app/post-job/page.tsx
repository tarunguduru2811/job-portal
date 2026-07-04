"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { motion } from "framer-motion";
import { Briefcase, MapPin, DollarSign, FileText, CheckCircle2 } from "lucide-react";
import { API_URL } from "@/lib/config";

export default function PostJob() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [salaryRange, setSalaryRange] = useState("");
  const [locationType, setLocationType] = useState("REMOTE");
  const [status, setStatus] = useState("PUBLISHED");
  const [goLiveAt, setGoLiveAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const { user, token } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent, submitStatus: string = "PUBLISHED") => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await axios.post(
        `${API_URL}/jobs`,
        {
          title,
          description,
          requirements,
          salaryRange,
          locationType,
          companyId: user?.companyId,
          status: submitStatus,
          goLiveAt: goLiveAt ? new Date(goLiveAt).toISOString() : null
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      router.push("/ats");
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to post job");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-white pt-36 pb-12 px-6 md:px-12 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-3xl mx-auto relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">Create Job Posting</h1>
          <p className="text-gray-400 text-lg">Find the perfect candidate for your team.</p>
        </motion.div>

        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-8">{error}</div>}

        <motion.form 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          onSubmit={(e) => handleSubmit(e, "PUBLISHED")} 
          className="bg-[#111827]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl"
        >
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Job Title</label>
              <div className="relative">
                <Briefcase className="w-5 h-5 text-gray-500 absolute left-4 top-3.5" />
                <input type="text" required value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-[#0f1523] border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-600" placeholder="e.g. Senior Frontend Engineer" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Location Type</label>
                <div className="relative">
                  <MapPin className="w-5 h-5 text-gray-500 absolute left-4 top-3.5" />
                  <select value={locationType} onChange={e => setLocationType(e.target.value)} className="w-full bg-[#0f1523] border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all appearance-none">
                    <option value="REMOTE">Remote</option>
                    <option value="ONSITE">On-site</option>
                    <option value="HYBRID">Hybrid</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Salary Range</label>
                <div className="relative">
                  <DollarSign className="w-5 h-5 text-gray-500 absolute left-4 top-3.5" />
                  <input type="text" required value={salaryRange} onChange={e => setSalaryRange(e.target.value)} className="w-full bg-[#0f1523] border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-600" placeholder="e.g. $120k - $150k" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Job Description</label>
              <div className="relative">
                <FileText className="w-5 h-5 text-gray-500 absolute left-4 top-4" />
                <textarea required rows={5} value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-[#0f1523] border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-600 resize-none" placeholder="Describe the role, responsibilities, and team..." />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Requirements</label>
              <div className="relative">
                <CheckCircle2 className="w-5 h-5 text-gray-500 absolute left-4 top-4" />
                <textarea required rows={4} value={requirements} onChange={e => setRequirements(e.target.value)} className="w-full bg-[#0f1523] border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-600 resize-none" placeholder="List skills, experience, and qualifications..." />
              </div>
            </div>
            
            <div className="pt-4 border-t border-white/10">
              <h3 className="text-sm font-medium text-gray-300 mb-4">Scheduling (Optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-2">Schedule Publish Date</label>
                  <input type="datetime-local" value={goLiveAt} onChange={e => setGoLiveAt(e.target.value)} className="w-full bg-[#0f1523] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <button type="button" onClick={() => router.push("/ats")} className="w-full md:w-auto px-6 py-3 rounded-xl text-sm font-medium hover:bg-white/5 text-gray-300 transition-colors">Cancel</button>
            <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
              <button type="button" onClick={(e) => handleSubmit(e, "DRAFT")} disabled={loading} className="w-full md:w-auto px-6 py-3 rounded-xl text-sm font-medium bg-[#1f2937] border border-white/10 hover:bg-white/10 text-white transition-all disabled:opacity-50">
                Save as Draft
              </button>
              <button type="submit" disabled={loading} className="w-full md:w-auto px-8 py-3 rounded-xl text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)] disabled:opacity-50">
                {goLiveAt ? "Schedule Job" : "Publish Job"}
              </button>
            </div>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
