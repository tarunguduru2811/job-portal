"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Mail, Calendar, MoreVertical, Briefcase, Star, Clock, FileText, Plus, MapPin, Loader2, X, Home, Building, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import Logo from "@/components/Logo";

import { API_URL } from "@/lib/config";

type Application = {
  id: string;
  status: string;
  notes?: string;
  score?: number;
  user: {
    name: string;
    email: string;
    skills: string[];
    resumeUrl?: string;
  };
  createdAt: string;
};

type Job = {
  id: string;
  title: string;
  locationType: string;
};

const COLUMNS = [
  { id: "APPLIED", title: "New Applicants", gradient: "from-blue-500/20 to-transparent", text: "text-blue-400", border: "border-blue-500/30", dot: "bg-blue-400" },
  { id: "SCREENING", title: "Screening", gradient: "from-indigo-500/20 to-transparent", text: "text-indigo-400", border: "border-indigo-500/30", dot: "bg-indigo-400" },
  { id: "INTERVIEW", title: "Interviews", gradient: "from-purple-500/20 to-transparent", text: "text-purple-400", border: "border-purple-500/30", dot: "bg-purple-400" },
  { id: "OFFER", title: "Offers", gradient: "from-pink-500/20 to-transparent", text: "text-pink-400", border: "border-pink-500/30", dot: "bg-pink-400" },
  { id: "HIRED", title: "Hired", gradient: "from-emerald-500/20 to-transparent", text: "text-emerald-400", border: "border-emerald-500/30", dot: "bg-emerald-400" },
  { id: "REJECTED", title: "Rejected", gradient: "from-rose-500/20 to-transparent", text: "text-rose-400", border: "border-rose-500/30", dot: "bg-rose-400" }
];

export default function ATSKanbanBoard() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [loadingApps, setLoadingApps] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [viewProfileAppId, setViewProfileAppId] = useState<string | null>(null);
  
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch all jobs for this recruiter's company
  useEffect(() => {
    async function loadJobs() {
      if (!user?.companyId) return;
      try {
        const jobsRes = await axios.get(`${API_URL}/jobs?companyId=${user.companyId}`);
        setJobs(jobsRes.data);
        if (jobsRes.data.length > 0 && !selectedJobId) {
          setSelectedJobId(jobsRes.data[0].id);
        }
      } catch (error) {
        console.error("Failed to load jobs", error);
      }
    }
    if (mounted && user) {
      loadJobs();
    }
  }, [user, mounted]); // removed selectedJobId to avoid loops

  // Fetch applications when selectedJobId changes
  useEffect(() => {
    async function loadApplications() {
      if (!selectedJobId) return;
      setLoadingApps(true);
      try {
        const appsRes = await axios.get(`${API_URL}/applications/job/${selectedJobId}`);
        setApplications(appsRes.data);
      } catch (error) {
        console.error("Failed to load ATS applications", error);
      } finally {
        setLoadingApps(false);
      }
    }
    loadApplications();
  }, [selectedJobId]);

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    
    const { source, destination, draggableId } = result;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;
    
    const previousApps = [...applications];
    const newStatus = destination.droppableId;
    
    setApplications(apps => apps.map(app => 
      app.id === draggableId ? { ...app, status: newStatus } : app
    ));

    if (source.droppableId !== destination.droppableId) {
      try {
        await axios.patch(`${API_URL}/applications/${draggableId}/status`, { status: newStatus });
      } catch (error) {
        console.error("Failed to update status", error);
        setApplications(previousApps); 
      }
    }
  };

  const updateStatus = async (appId: string, newStatus: string) => {
    const previousApps = [...applications];
    setApplications(apps => apps.map(app => 
      app.id === appId ? { ...app, status: newStatus } : app
    ));
    try {
      await axios.patch(`${API_URL}/applications/${appId}/status`, { status: newStatus });
    } catch (error) {
      console.error("Failed to update status", error);
      setApplications(previousApps);
    }
  };

  if (!mounted) return null;

  const selectedJobTitle = jobs.find(j => j.id === selectedJobId)?.title || "Select a Job";

  return (
    <div className="h-screen bg-[#030712] text-white flex overflow-hidden font-sans">
      
      {/* Sidebar - Open Roles */}
      <div className="w-72 bg-[#0a0e17] border-r border-white/5 flex flex-col shrink-0 z-20">
        <div className="p-6 border-b border-white/5">
          <Logo onClick={() => router.push("/")} className="scale-75 origin-left mb-2" />
          <h2 className="font-semibold text-gray-400 text-sm tracking-wider uppercase mt-6 mb-2">Your Open Roles</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {jobs.length === 0 ? (
            <div className="text-center p-4 text-gray-500 text-sm">
              No jobs posted yet.
            </div>
          ) : (
            jobs.map(job => (
              <button 
                key={job.id} 
                onClick={() => setSelectedJobId(job.id)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  selectedJobId === job.id 
                    ? 'bg-blue-600/10 border-blue-500/30 text-blue-100 shadow-[0_0_15px_rgba(37,99,235,0.1)]' 
                    : 'bg-transparent border-transparent hover:bg-white/5 text-gray-400 hover:text-gray-200'
                }`}
              >
                <div className="font-medium truncate">{job.title}</div>
                <div className="text-xs opacity-70 flex items-center gap-1.5 mt-1.5">
                  <MapPin className="w-3 h-3"/> {job.locationType}
                </div>
              </button>
            ))
          )}
        </div>
        
        <div className="p-4 border-t border-white/5 space-y-2">
          <button onClick={() => router.push("/")} className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-3">
            <Home className="w-4 h-4" /> Home
          </button>
          <button onClick={() => router.push("/manage-jobs")} className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-3">
            <Briefcase className="w-4 h-4" /> Manage Jobs
          </button>
          <button onClick={() => router.push("/company")} className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-3">
            <Building className="w-4 h-4" /> Company Profile
          </button>
          <button onClick={() => {
            useAuthStore.getState().logout();
            router.push("/login");
          }} className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors flex items-center gap-3">
            <LogOut className="w-4 h-4" /> Log Out
          </button>
        </div>
      </div>

      {/* Main Board Area */}
      <div className="flex-1 relative flex flex-col overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-1/4 w-[50%] h-[30%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="flex-1 p-6 md:p-8 flex flex-col relative z-10 overflow-hidden">
          {/* Header Area */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 shrink-0"
          >
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-gray-300 mb-4">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Active Pipeline
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight mb-2">
                {selectedJobTitle}
              </h1>
              <p className="text-gray-400 flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Applicant Tracking Dashboard
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => router.push("/post-job")} className="px-5 py-2.5 rounded-full text-sm font-medium bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex items-center gap-2 shadow-lg">
                <Plus className="w-4 h-4" /> Post New Job
              </button>
              <button className="px-5 py-2.5 rounded-full text-sm font-medium bg-blue-600 hover:bg-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-400" /> Share Pipeline
              </button>
            </div>
          </motion.div>

          {/* Kanban Board */}
          {loadingApps ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : (
            <DragDropContext onDragEnd={onDragEnd}>
              <div className="flex gap-6 overflow-x-auto pb-8 h-full snap-x custom-scrollbar">
                {COLUMNS.map(column => (
                  <div key={column.id} className="flex flex-col w-[340px] flex-shrink-0 snap-center h-full">
                    {/* Column Header */}
                    <div className={`p-4 rounded-t-2xl border border-b-0 border-white/5 bg-gradient-to-b ${column.gradient} bg-[#141b2d] shrink-0`}>
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${column.dot}`} />
                          <h2 className="font-semibold text-gray-100 tracking-wide text-sm uppercase">{column.title}</h2>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${column.border} ${column.text} bg-[#030712]/50`}>
                          {applications.filter(a => a.status === column.id).length}
                        </span>
                      </div>
                    </div>
                    
                    {/* Drop Zone */}
                    <div className="flex-1 overflow-y-auto rounded-b-2xl border border-white/5 bg-[#0f1523] p-3 shadow-2xl custom-scrollbar">
                      <Droppable droppableId={column.id}>
                        {(provided, snapshot) => (
                          <div 
                            ref={provided.innerRef} 
                            {...provided.droppableProps}
                            className={`min-h-full transition-colors duration-200 rounded-xl ${snapshot.isDraggingOver ? 'bg-white/[0.04]' : ''}`}
                          >
                            <div className="space-y-4">
                              {applications
                                .filter(app => app.status === column.id)
                                .map((app, index) => (
                                  <Draggable key={app.id} draggableId={app.id} index={index}>
                                    {(provided, snapshot) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        style={{
                                          ...provided.draggableProps.style,
                                          transform: snapshot.isDragging ? `${provided.draggableProps.style?.transform} scale(1.02)` : provided.draggableProps.style?.transform,
                                        }}
                                        className={`group relative overflow-hidden bg-[#111827]/80 p-5 rounded-2xl border transition-all duration-200 cursor-grab active:cursor-grabbing shadow-xl ${
                                          snapshot.isDragging 
                                            ? `border-gray-500 shadow-2xl z-50 ring-2 ring-blue-500/20` 
                                            : `border-white/5 hover:border-white/20 hover:bg-[#111827]`
                                        }`}
                                      >
                                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                        
                                        <div className="flex justify-between items-start mb-4">
                                          <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center font-bold text-lg text-gray-300 border border-white/10 shadow-inner">
                                              {app.user.name.charAt(0)}
                                            </div>
                                            <div>
                                              <h3 className="font-semibold text-gray-100 group-hover:text-blue-300 transition-colors">{app.user.name}</h3>
                                              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                                <Clock className="w-3 h-3" />
                                                <span>Applied recently</span>
                                              </div>
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            {app.score !== undefined && app.score !== null && (
                                              <div className={`px-2 py-1 rounded-md text-[10px] font-bold border flex items-center gap-1 ${
                                                app.score >= 80 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                                                app.score >= 50 ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 
                                                'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                              }`}>
                                                {app.score}% Match
                                              </div>
                                            )}
                                            <div className="relative">
                                              <button 
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  setOpenMenuId(openMenuId === app.id ? null : app.id);
                                                }}
                                                className="text-gray-500 hover:text-white transition-colors p-1"
                                              >
                                                <MoreVertical className="w-4 h-4" />
                                              </button>
                                              
                                              {openMenuId === app.id && (
                                                <div className="absolute right-0 mt-2 w-36 bg-[#1f2937] border border-white/10 rounded-lg shadow-2xl overflow-hidden z-50">
                                                  <button onClick={(e) => { e.stopPropagation(); setViewProfileAppId(app.id); setOpenMenuId(null); }} className="w-full text-left px-4 py-2.5 text-xs font-medium text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
                                                    View Profile
                                                  </button>
                                                  <a href={`mailto:${app.user.email}`} onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); }} className="block w-full text-left px-4 py-2.5 text-xs font-medium text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
                                                    Send Email
                                                  </a>
                                                  <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(app.user.email); setOpenMenuId(null); }} className="w-full text-left px-4 py-2.5 text-xs font-medium text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
                                                    Copy Email
                                                  </button>
                                                  <button onClick={(e) => { e.stopPropagation(); updateStatus(app.id, 'REJECTED'); setOpenMenuId(null); }} className="w-full text-left px-4 py-2.5 text-xs font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors border-t border-white/5">
                                                    Reject
                                                  </button>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        </div>

                                        <div className="space-y-3">
                                          <a href={`mailto:${app.user.email}`} className="flex items-center gap-2 text-sm text-gray-400 bg-black/20 hover:bg-black/40 hover:text-white transition-colors p-2 rounded-lg border border-white/5 cursor-pointer" onClick={(e) => e.stopPropagation()}>
                                            <Mail className="w-3.5 h-3.5" />
                                            <span className="truncate">{app.user.email}</span>
                                          </a>

                                          <div className="flex flex-wrap gap-1.5">
                                            {app.user.skills.map(skill => (
                                              <span key={skill} className="px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/5 text-gray-300 rounded-md text-[11px] font-medium transition-colors">
                                                {skill}
                                              </span>
                                            ))}
                                            {app.user.resumeUrl ? (
                                              <a 
                                                href={app.user.resumeUrl.startsWith('http') ? app.user.resumeUrl : `http://localhost:5000${app.user.resumeUrl}`} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                onClick={(e) => e.stopPropagation()}
                                                className="px-2.5 py-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-md text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
                                              >
                                                <FileText className="w-3 h-3" /> View Resume
                                              </a>
                                            ) : (
                                              <span className="px-2.5 py-1 bg-gray-500/10 text-gray-400 border border-gray-500/20 rounded-md text-[11px] font-medium flex items-center gap-1">
                                                <FileText className="w-3 h-3" /> No Resume
                                              </span>
                                            )}
                                          </div>

                                          {app.notes && (
                                            <div className="mt-4 pt-3 border-t border-white/5">
                                              <div className="text-xs font-semibold text-purple-400 mb-1 flex items-center gap-1">
                                                <Star className="w-3 h-3" /> AI Summary
                                              </div>
                                              <p className="text-[11px] text-gray-400 whitespace-pre-wrap leading-relaxed bg-[#030712]/50 p-2 rounded-lg border border-white/5">
                                                {app.notes}
                                              </p>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </Draggable>
                                ))}
                              {provided.placeholder}
                            </div>
                          </div>
                        )}
                      </Droppable>
                    </div>
                  </div>
                ))}
              </div>
            </DragDropContext>
          )}
        </div>
      </div>

      {/* View Profile Modal */}
      {viewProfileAppId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#111827] border border-white/10 rounded-2xl p-6 w-full max-w-xl shadow-2xl relative">
            <button onClick={() => setViewProfileAppId(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 bg-white/5 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
            
            {(() => {
              const app = applications.find(a => a.id === viewProfileAppId);
              if (!app) return null;
              
              return (
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg border border-white/20">
                      {app.user.name.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">{app.user.name}</h2>
                      <p className="text-gray-400">{app.user.email}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-300 mb-2 border-b border-white/10 pb-1">Application Status</h3>
                      <div className="flex items-center justify-between">
                        <span className="px-3 py-1 bg-white/5 border border-white/10 text-gray-300 rounded-md text-sm font-medium">
                          {app.status}
                        </span>
                        {app.score !== undefined && app.score !== null && (
                          <span className={`px-3 py-1 rounded-md text-sm font-bold border ${
                            app.score >= 80 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                            app.score >= 50 ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 
                            'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          }`}>
                            {app.score}% Match
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-gray-300 mb-2 border-b border-white/10 pb-1">Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {app.user.skills.length > 0 ? app.user.skills.map(skill => (
                          <span key={skill} className="px-2.5 py-1 bg-blue-500/10 text-blue-300 border border-blue-500/20 rounded-md text-xs font-medium">
                            {skill}
                          </span>
                        )) : <span className="text-gray-500 text-sm">No skills listed</span>}
                      </div>
                    </div>

                    {app.notes && (
                      <div>
                        <h3 className="text-sm font-semibold text-purple-400 mb-2 border-b border-white/10 pb-1 flex items-center gap-1">
                          <Star className="w-4 h-4" /> AI Analysis
                        </h3>
                        <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed bg-black/40 p-4 rounded-xl border border-white/5">
                          {app.notes}
                        </p>
                      </div>
                    )}

                    <div className="pt-4 flex gap-3 justify-end">
                      {app.user.resumeUrl && (
                        <a 
                          href={app.user.resumeUrl.startsWith('http') ? app.user.resumeUrl : `http://localhost:5000${app.user.resumeUrl}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors"
                        >
                          View Resume
                        </a>
                      )}
                      <button onClick={() => { updateStatus(app.id, 'REJECTED'); setViewProfileAppId(null); }} className="px-4 py-2 rounded-lg text-sm font-medium bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors">
                        Reject Candidate
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.01);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  );
}
