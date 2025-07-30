export interface Activity {
  id: number;
  name: string;
  description?: string;
}

export interface Schedule {
  id?: number;
  smeId: number;
  activityId: number;
  date: string;
  fromTime: string;
  toTime: string;
  status: 'available' | 'busy' | 'unavailable';
  description?: string;
  activity?: Activity;
}

export interface SME {
  id: number;
  name: string;
  email: string;
  role: string;
  department?: string;
}

export interface Supervisor {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface Lead {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface SMEAvailability {
  smeId: number;
  sme: SME;
  availableSlots: AvailabilitySlot[];
}

export interface AvailabilitySlot {
  date: string;
  fromTime: string;
  toTime: string;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: SME | Supervisor | Lead;
  expiresIn: number;
}

export interface ScheduleCreateRequest {
  fromDate: string;
  toDate: string;
  fromTime: string;
  toTime: string;
  activityId: number;
  description: string;
}

export interface ScheduleUpdateRequest {
  fromDate?: string;
  toDate?: string;
  fromTime?: string;
  toTime?: string;
  activityId?: number;
  description?: string;
}

// Effort-related interfaces
export interface SmeEffortData {
  smeId: number;
  smeName: string;
  smeEmail: string;
  monthYear: string;
  smeConnectCount: number;
  byteSizedCount: number;
  lateralTrainingCount: number;
  questionContributionCount: number;
  totalHoursAllocated: number;
  totalSessions: number;
}

export interface ConsolidatedEffortTotals {
  totalReportees: number;
  totalSmeConnectCount: number;
  totalByteSizedCount: number;
  totalLateralTrainingCount: number;
  totalQuestionContributionCount: number;
  totalHoursAllocated: number;
  totalSessions: number;
}

export interface SupervisorEffortData {
  supervisorId: number;
  supervisorName: string;
  supervisorEmail: string;
  monthYear: string;
  reportees: SmeEffortData[];
  totals: ConsolidatedEffortTotals;
}

export interface LeadEffortData {
  leadId: number;
  leadName: string;
  leadEmail: string;
  monthYear: string;
  smes: SmeEffortData[];
  totals: ConsolidatedEffortTotals;
}
