"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useAuthStore } from "@/store/auth";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Building, Link as LinkIcon, Briefcase, Info, Image as ImageIcon, Plus, X, CheckCircle2, Loader2, UploadCloud } from "lucide-react";

import { API_URL } from "@/lib/config";

type CompanyProfile = {
  id: string;
  name: string;
  description: string | null;
  website: string | null;
  bannerUrl: string | null;
  logoUrl: string | null;
  techStack: string[];
  benefits: string[];
};

export default function EmployerProfile() {
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  
  const [techStack, setTechStack] = useState<string[]>([]);
  const [newTech, setNewTech] = useState("");
  
  const [benefits, setBenefits] = useState<string[]>([]);
  const [newBenefit, setNewBenefit] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const { token, user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!token || user?.role !== "EMPLOYER") {
      router.push("/");
      return;
    }
    
    if (!user.companyId) {
       setLoading(false);
       return;
    }

    async function fetchCompany() {
      try {
        const res = await axios.get(`${API_URL}/company/${user?.companyId}`);
        const data = res.data;
        setProfile(data);
        setName(data.name || "");
        setDescription(data.description || "");
        setWebsite(data.website || "");
        setBannerUrl(data.bannerUrl || "");
        setLogoUrl(data.logoUrl || "");
        
        // Ensure array parsing if stored as string JSON, but Prisma JSON field is automatically parsed
        setTechStack(Array.isArray(data.techStack) ? data.techStack : []);
        setBenefits(Array.isArray(data.benefits) ? data.benefits : []);
      } catch (err) {
        console.error("Failed to load company profile", err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchCompany();
  }, [token, router, user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg("");
    try {
      await axios.put(
        `${API_URL}/company/${user?.companyId}`,
        { 
          name, 
          description, 
          website, 
          bannerUrl,
          logoUrl,
          techStack, 
          benefits 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccessMsg("Company profile updated successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      alert("Failed to save company profile");
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'banner') => {
    const file = e.target.files?.[0];
    if (!file || !user?.companyId) return;

    if (type === 'logo') setUploadingLogo(true);
    else setUploadingBanner(true);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await axios.post(`${API_URL}/company/${user.companyId}/image`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      
      if (type === 'logo') setLogoUrl(res.data.url);
      else setBannerUrl(res.data.url);
      
      setSuccessMsg(`${type === 'logo' ? 'Logo' : 'Banner'} uploaded successfully! Don't forget to save.`);
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      alert(`Failed to upload ${type}`);
    } finally {
      if (type === 'logo') setUploadingLogo(false);
      else setUploadingBanner(false);
    }
  };

  const addTech = () => {
    if (newTech.trim() && !techStack.includes(newTech.trim())) {
      setTechStack([...techStack, newTech.trim()]);
      setNewTech("");
    }
  };

  const removeTech = (item: string) => {
    setTechStack(techStack.filter(t => t !== item));
  };

  const addBenefit = () => {
    if (newBenefit.trim() && !benefits.includes(newBenefit.trim())) {
      setBenefits([...benefits, newBenefit.trim()]);
      setNewBenefit("");
    }
  };

  const removeBenefit = (item: string) => {
    setBenefits(benefits.filter(b => b !== item));
  };

  if (loading) return (
    <div className="min-h-screen bg-[#030712] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
    </div>
  );

  if (!profile) return (
    <div className="min-h-screen bg-[#030712] text-white flex items-center justify-center">
      <p>Could not load company profile.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#030712] text-white pt-36 pb-12 px-4 md:px-8 relative overflow-hidden">
      <div className="absolute top-0 right-1/4 w-[50%] h-[30%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[50%] h-[30%] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">Company Branding</h1>
          <p className="text-gray-400 text-lg">Enhance your employer profile to attract top talent.</p>
        </motion.div>

        {successMsg && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl mb-8 font-medium flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" /> {successMsg}
          </motion.div>
        )}

        <div className="grid md:grid-cols-3 gap-8">
          
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="md:col-span-1 space-y-6">
            <div className="bg-[#111827]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-6 text-center shadow-xl h-auto">
              <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 border-2 border-blue-500/30 flex items-center justify-center mb-6 overflow-hidden relative group">
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-bold text-gray-300">{name.charAt(0)}</span>
                )}
                <label className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                  <UploadCloud className="w-6 h-6 text-white mb-1" />
                  <span className="text-[10px] text-white font-medium">Upload</span>
                  <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'logo')} className="hidden" />
                </label>
              </div>
              <h2 className="text-xl font-bold mb-1">{name || "Company"}</h2>
              <p className="text-xs text-gray-500">Verified Employer</p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="md:col-span-2">
            <form onSubmit={handleSaveProfile} className="bg-[#111827]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl space-y-8">
              
              <div className="space-y-6">
                <h3 className="text-xl font-semibold border-b border-white/10 pb-2">General Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Company Name</label>
                    <div className="relative">
                      <Building className="w-4 h-4 text-gray-500 absolute left-4 top-4" />
                      <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full bg-[#0f1523] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all text-sm" placeholder="Acme Corp" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Website URL</label>
                    <div className="relative">
                      <LinkIcon className="w-4 h-4 text-gray-500 absolute left-4 top-4" />
                      <input type="url" value={website} onChange={e => setWebsite(e.target.value)} className="w-full bg-[#0f1523] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all text-sm" placeholder="https://..." />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Company Logo</label>
                    <label className={`flex items-center justify-center gap-2 px-4 py-3 w-full rounded-xl border border-white/10 bg-[#0f1523] hover:bg-white/5 cursor-pointer transition-colors ${uploadingLogo ? 'opacity-50 pointer-events-none' : ''}`}>
                      {uploadingLogo ? <Loader2 className="w-5 h-5 animate-spin text-blue-400" /> : <UploadCloud className="w-5 h-5 text-gray-400" />}
                      <span className="text-sm text-gray-300 font-medium">
                        {uploadingLogo ? "Uploading..." : "Upload Logo Image"}
                      </span>
                      <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'logo')} className="hidden" />
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Banner Image</label>
                    <label className={`flex items-center justify-center gap-2 px-4 py-3 w-full rounded-xl border border-white/10 bg-[#0f1523] hover:bg-white/5 cursor-pointer transition-colors ${uploadingBanner ? 'opacity-50 pointer-events-none' : ''}`}>
                      {uploadingBanner ? <Loader2 className="w-5 h-5 animate-spin text-blue-400" /> : <UploadCloud className="w-5 h-5 text-gray-400" />}
                      <span className="text-sm text-gray-300 font-medium">
                        {uploadingBanner ? "Uploading..." : "Upload Banner Image"}
                      </span>
                      <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'banner')} className="hidden" />
                    </label>
                  </div>
                </div>
                {bannerUrl && <img src={bannerUrl} alt="Banner Preview" className="mt-4 w-full h-32 object-cover rounded-xl border border-white/10" />}

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Company Description</label>
                  <textarea rows={4} value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-[#0f1523] border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-blue-500 transition-all text-sm" placeholder="About your company..."></textarea>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-xl font-semibold border-b border-white/10 pb-2">Culture & Stack</h3>
                
                {/* Tech Stack */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Tech Stack</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {techStack.map(tech => (
                      <div key={tech} className="px-3 py-1.5 rounded-lg bg-blue-600/10 border border-blue-500/20 text-blue-300 text-sm flex items-center gap-2">
                        {tech}
                        <button type="button" onClick={() => removeTech(tech)} className="hover:text-white transition-colors"><X className="w-3 h-3" /></button>
                      </div>
                    ))}
                    {techStack.length === 0 && <span className="text-gray-500 text-sm italic py-1.5">No technologies added.</span>}
                  </div>
                  
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={newTech} 
                      onChange={e => setNewTech(e.target.value)} 
                      onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addTech())}
                      className="flex-1 bg-[#0f1523] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all text-sm" 
                      placeholder="e.g. React, Node.js, AWS" 
                    />
                    <button type="button" onClick={addTech} className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white text-sm font-medium flex items-center gap-1">
                      <Plus className="w-4 h-4" /> Add
                    </button>
                  </div>
                </div>

                {/* Benefits */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Employee Benefits</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {benefits.map(benefit => (
                      <div key={benefit} className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm flex items-center gap-2">
                        {benefit}
                        <button type="button" onClick={() => removeBenefit(benefit)} className="hover:text-white transition-colors"><X className="w-3 h-3" /></button>
                      </div>
                    ))}
                    {benefits.length === 0 && <span className="text-gray-500 text-sm italic py-1.5">No benefits added.</span>}
                  </div>
                  
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={newBenefit} 
                      onChange={e => setNewBenefit(e.target.value)} 
                      onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addBenefit())}
                      className="flex-1 bg-[#0f1523] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all text-sm" 
                      placeholder="e.g. Health Insurance, Remote Work" 
                    />
                    <button type="button" onClick={addBenefit} className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white text-sm font-medium flex items-center gap-1">
                      <Plus className="w-4 h-4" /> Add
                    </button>
                  </div>
                </div>

              </div>

              <div className="pt-6 border-t border-white/10 flex justify-end">
                <button type="submit" disabled={saving} className="px-8 py-3 rounded-xl text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)] disabled:opacity-50">
                  {saving ? "Saving..." : "Save Company Profile"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
