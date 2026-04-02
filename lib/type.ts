export interface ServiceType {
  id: string;
  label: string;
  description: string;
  keyQuestions: string[];
}

export interface DeadlineRule {
  serviceTypeId: string;
  periodDescription: string;
  startEvent: string;
}

export interface ForumRoute {
  serviceTypeId: string;
  forum: string;
  conditions?: string;
}

export interface BriefOutput {
  clientName: string;
  contactPhone: string;
  serviceType: string;
  serviceSubType: string;
  factSummary: string;
  applicableRules: string[];
  deadlineDate: string;
  deadlineStatus: "safe" | "warning" | "expired";
  recommendedForum: string;
  urgency: "low" | "medium" | "high" | "critical";
  questionsForProfessional: string[];
}

export interface ProfessionConfig {
  systemPrompt: string;
  serviceTypes: ServiceType[];
  brandConfig: {
    firmName: string;
    address: string;
    hours: string;
    disclaimer: string;
  };
}