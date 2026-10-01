export interface User {
  id: number;
  email: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}

export interface Resume {
  id: string;
  filename: string;
  file_path: string;
  parsed_content?: any;
}

export interface ResumeUploadResponse {
  resume_id: string;
  filename: string;
  status: string;
  message: string;
}

export interface ATSBreakdown {
  structure: { score: number; explanation: string };
  sections: { score: number; explanation: string };
  readability: { score: number; explanation: string };
  keywords: { score: number; explanation: string };
  file_compatibility: { score: number; explanation: string };
}

export interface AnalysisResult {
  analysis_id: string;
  ats_score: number;
  ats_breakdown: ATSBreakdown;
  match_score: number;
  match_breakdown: any;
  keyword_gaps: {
    matched: string[];
    missing: string[];
  };
}

export interface BulletRewriteResponse {
  original_text: string;
  suggested_text: string;
  reasoning: string;
  missing_info: string[];
}
