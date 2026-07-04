import { Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import { prisma } from '../prisma';
import fs from 'fs';
import path from 'path';
const pdfParse = require('pdf-parse');
import { GoogleGenAI } from '@google/genai';

const connection = process.env.REDIS_URL
  ? new IORedis(process.env.REDIS_URL, { maxRetriesPerRequest: null, enableReadyCheck: false, tls: { rejectUnauthorized: false } })
  : new IORedis({ host: 'localhost', port: 6379, maxRetriesPerRequest: null });

export const resumeWorker = new Worker('resume-parsing', async (job: Job) => {
  const { applicationId, resumeUrl } = job.data;
  console.log(`[Worker] Started real AI parsing for application ${applicationId}`);
  
  try {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { jobPost: true }
    });

    if (!application) throw new Error("Application not found");

    let dataBuffer: Buffer;
    if (resumeUrl.startsWith('http')) {
      const response = await fetch(resumeUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch remote resume: ${response.statusText}`);
      }
      dataBuffer = Buffer.from(await response.arrayBuffer());
    } else {
      const filePath = path.join(__dirname, '../../', resumeUrl);
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found at ${filePath}`);
      }
      dataBuffer = fs.readFileSync(filePath);
    }

    const pdfData = await pdfParse(dataBuffer);
    const resumeText = pdfData.text;

    let parsedNotes = "";

    // 1. Attempt Real LLM Parsing if API Key exists
    if (process.env.GEMINI_API_KEY) {
      console.log(`[Worker] GEMINI_API_KEY found, calling Gemini API...`);
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const currentDate = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      const prompt = `You are an expert ATS (Applicant Tracking System) AI. 
Analyze the candidate's resume against the job description and requirements.

CRITICAL INSTRUCTION FOR EXPERIENCE CALCULATION:
1. The CURRENT DATE is strictly ${currentDate}. You must use this exact date as "Present".
2. Any date before ${currentDate} (e.g., 2024, 2025) is strictly in the PAST. Do NOT treat them as future dates.
3. If the candidate explicitly states their total years of experience (e.g., "1+ years of experience") in their summary, you MUST take that into account and trust it if their work history dates align with the current date of ${currentDate}.
4. Calculate the duration from their past roles up to ${currentDate} to determine their true experience level.

Job Description: ${application.jobPost.description}
Job Requirements: ${application.jobPost.requirements}

Candidate Resume Text:
${resumeText}

Output exactly in this format, with no markdown code blocks around it:
✅ [AI Parse Complete]
- Extracted Skills: <list top 5 skills>
- Detected Experience Level: <level> (<X> years)
- Match Score: <0-100>%
- Required Skills Matched: <X/Y>

*Summary: <A strict 2 sentence summary of their fit>*`;

      try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt
        });
        
        parsedNotes = response.text || "";
      } catch (aiError: any) {
        console.error("[Worker] Gemini AI failed, falling back to basic matching:", aiError.message);
      }
    } else {
      console.log(`[Worker] No GEMINI_API_KEY found in .env, falling back to local regex engine...`);
    }

    // 2. Fallback to Local Regex Engine if no API key or AI fails
    if (!parsedNotes) {
      const rText = resumeText.toLowerCase();
      const reqText = application.jobPost.requirements.toLowerCase();
      const descText = application.jobPost.description.toLowerCase();
      const commonSkills = ['react', 'node', 'typescript', 'javascript', 'python', 'java', 'c++', 'aws', 'docker', 'kubernetes', 'sql', 'postgres', 'next.js', 'express', 'git', 'agile'];
      
      const candidateSkills = commonSkills.filter(skill => rText.includes(skill));
      const jobSkills = commonSkills.filter(skill => reqText.includes(skill) || descText.includes(skill));

      let matchScore = 50; 
      if (jobSkills.length > 0) {
        const matched = jobSkills.filter(s => candidateSkills.includes(s));
        matchScore = Math.round((matched.length / jobSkills.length) * 100);
      } else if (candidateSkills.length > 0) {
        matchScore = 75; 
      }

      let expStr = "Entry Level";
      if (rText.includes("senior") || rText.match(/[5-9]\+?\s*years/)) {
        expStr = "Senior (5+ years)";
      } else if (rText.match(/[2-4]\+?\s*years/)) {
        expStr = "Mid Level (2-4 years)";
      }

      parsedNotes = `⚠️ [Local Parse Complete - LLM Missing]
- Extracted Skills: ${candidateSkills.length > 0 ? candidateSkills.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(', ') : 'None explicitly found'}
- Detected Experience Level: ${expStr}
- Keyword Match Score: ${matchScore}%
- Required Skills Matched: ${jobSkills.filter(s => candidateSkills.includes(s)).length} / ${jobSkills.length}

*Summary: Candidate has a ${matchScore}% keyword overlap with the job description.*`;
    }

    // Extract score from parsedNotes since both AI and Regex output "Match Score: X%"
    const extractedScore = parsedNotes.match(/Score:\s*(\d+)%/i);
    const scoreToSave = extractedScore ? parseInt(extractedScore[1]) : 0;

    await prisma.application.update({
      where: { id: applicationId },
      data: { 
        notes: parsedNotes,
        score: scoreToSave
      }
    });

    console.log(`[Worker] Successfully parsed resume for application ${applicationId} with score ${scoreToSave}`);

  } catch (error: any) {
    console.error(`[Worker] Failed to parse resume:`, error.message);
    await prisma.application.update({
      where: { id: applicationId },
      data: { notes: `❌ [Parse Failed] Could not extract text from document.\nError: ${error.message}` }
    });
  }

}, { 
  connection: connection as any,
  metrics: { maxDataPoints: 0 },
  stalledInterval: 300000 
});

resumeWorker.on('failed', (job: Job | undefined, err: Error) => {
  console.error(`[Worker] Job ${job?.id} failed:`, err);
});
