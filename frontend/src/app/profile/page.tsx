"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useAuthStore } from "@/store/auth";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, FileText, Upload, Plus, X, Briefcase, CheckCircle2 } from "lucide-react";

import { API_URL } from "@/lib/config";

type ProfileData = {
  name: string;
  email: string;
  skills: string[];
  resumeUrl: string | null;
};

export default function CandidateProfile() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [name, setName] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const { token, user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!token || user?.role === "EMPLOYER") {
      router.push("/");
      return;
    }

    async function fetchProfile() {
      try {
        const res = await axios.get(`${API_URL}/profile/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile(res.data);
        setName(res.data.name || "");
        setSkills(res.data.skills || []);
      } catch (err) {
        console.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [token, router, user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg("");
    try {
      await axios.put(
        `${API_URL}/profile/me`,
        { name, skills },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccessMsg("Profile saved successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      alert("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    setFile(selectedFile);
    setUploading(true);
    
    const formData = new FormData();
    formData.append("resume", selectedFile);
    
    try {
      const res = await axios.post(`${API_URL}/profile/resume`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`
        }
      });
      setProfile(prev => prev ? { ...prev, resumeUrl: res.data.resumeUrl } : null);
      setSuccessMsg("Resume uploaded successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      alert("Failed to upload resume");
    } finally {
      setUploading(false);
      setFile(null);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  if (loading) return (
    <div className="min-h-screen bg-[#030712] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#030712] text-white pt-36 pb-12 px-4 md:px-8 relative overflow-hidden">
      <div className="absolute top-0 right-1/4 w-[50%] h-[30%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[50%] h-[30%] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-3xl mx-auto relative z-10">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight mb-4">Candidate Profile</h1>
          <p className="text-gray-400 text-lg">Build your profile and upload your resume to stand out.</p>
        </motion.div>

        {successMsg && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl mb-6 text-center font-medium flex items-center justify-center gap-2">
            <CheckCircle2 className="w-5 h-5" /> {successMsg}
          </motion.div>
        )}

        <div className="grid md:grid-cols-3 gap-8">
          {/* Resume Upload Section */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="md:col-span-1">
            <div className="bg-[#111827]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-6 text-center shadow-2xl h-full flex flex-col justify-center items-center">
              <div className="w-20 h-20 rounded-full bg-blue-500/10 border-2 border-blue-500/30 flex items-center justify-center mb-6">
                <FileText className="w-10 h-10 text-blue-400" />
              </div>
              
              <h2 className="text-lg font-bold mb-2">Your Resume</h2>
              {profile?.resumeUrl ? (
                <div className="bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-lg text-sm mb-6 w-full truncate border border-emerald-500/20">
                  Document Uploaded
                </div>
              ) : (
                <p className="text-gray-400 text-sm mb-6">No resume uploaded yet. Recuiters won't be able to evaluate you effectively.</p>
              )}

              <label className="cursor-pointer w-full group">
                <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={handleFileUpload} disabled={uploading} />
                <div className={`w-full py-3 px-4 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 border ${uploading ? 'bg-gray-800 border-gray-700 text-gray-500' : 'bg-blue-600/10 border-blue-500/30 text-blue-400 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.1)] group-hover:shadow-[0_0_25px_rgba(37,99,235,0.3)]'}`}>
                  {uploading ? <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div> : <Upload className="w-4 h-4" />}
                  {uploading ? 'Uploading...' : profile?.resumeUrl ? 'Update Resume' : 'Upload Resume'}
                </div>
              </label>
            </div>
          </motion.div>

          {/* Profile Details Form */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="md:col-span-2">
            <form onSubmit={handleSaveProfile} className="bg-[#111827]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl space-y-6">
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Full Name</label>
                <div className="relative">
                  <User className="w-5 h-5 text-gray-500 absolute left-4 top-3.5" />
                  <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full bg-[#0f1523] border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-600" placeholder="John Doe" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Email Address (Read-only)</label>
                <input type="email" readOnly value={profile?.email} className="w-full bg-[#0a0e17] border border-white/5 rounded-xl px-4 py-3 text-gray-500 cursor-not-allowed" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Professional Skills</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {skills.map(skill => (
                    <div key={skill} className="px-3 py-1.5 rounded-lg bg-blue-600/10 border border-blue-500/20 text-blue-300 text-sm flex items-center gap-2">
                      {skill}
                      <button type="button" onClick={() => removeSkill(skill)} className="hover:text-white transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {skills.length === 0 && <span className="text-gray-500 text-sm italic py-1.5">No skills added yet.</span>}
                </div>
                
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={newSkill} 
                    onChange={e => setNewSkill(e.target.value)} 
                    onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    className="flex-1 bg-[#0f1523] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-600 text-sm" 
                    placeholder="e.g. React, Python, Data Analysis" 
                  />
                  <button type="button" onClick={addSkill} className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-white text-sm font-medium flex items-center gap-1">
                    <Plus className="w-4 h-4" /> Add
                  </button>
                </div>
              </div>

              <div className="pt-6 border-t border-white/10 flex justify-end">
                <button type="submit" disabled={saving} className="px-8 py-3 rounded-xl text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)] disabled:opacity-50">
                  {saving ? "Saving..." : "Save Profile"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
