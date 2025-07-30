import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import {
  Activity,
  Schedule,
  SME,
  SMEAvailability,
  LoginRequest,
  LoginResponse,
  ScheduleCreateRequest,
  ScheduleUpdateRequest,
  SmeEffortData,
  SupervisorEffortData,
  LeadEffortData
} from '../models/api.models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('API Error:', error);

    if (error.status === 0) {
      // Network error or CORS issue
      return throwError(() => new Error('Unable to connect to server. Please check if the backend is running.'));
    }

    if (error.status >= 400 && error.status < 500) {
      // Client error
      const message = error.error?.message ?? 'Invalid request';
      return throwError(() => ({ message: message, status: error.status }));
    }

    if (error.status >= 500) {
      // Server error
      return throwError(() => new Error('Server error. Please try again later.'));
    }

    return throwError(() => error);
  }

  // Authentication
  login(credentials: LoginRequest): Observable<LoginResponse> {
    console.log('Attempting login for:', credentials.email);
    return this.http.post<LoginResponse>(`${this.baseUrl}/auth/login`, credentials)
      .pipe(catchError(this.handleError.bind(this)));
  }

  getCurrentUser(): Observable<SME> {
    return this.http.get<SME>(`${this.baseUrl}/me`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Activities
  getActivities(): Observable<Activity[]> {
    return this.http.get<Activity[]>(`${this.baseUrl}/activities`, {
      headers: this.getHeaders()
    });
  }

  // Schedules
  getSmeSchedules(month: string): Observable<Schedule[]> {
    const params = new HttpParams().set('month', month);
    return this.http.get<Schedule[]>(`${this.baseUrl}/schedules`, {
      headers: this.getHeaders(),
      params
    });
  }

  getSchedulesBySmeId(smeId: number, month?: string): Observable<Schedule[]> {
    let params = new HttpParams().set('smeId', smeId.toString());
    if (month) {
      params = params.set('month', month);
    }
    return this.http.get<Schedule[]>(`${this.baseUrl}/schedules/sme/${smeId}`, {
      headers: this.getHeaders(),
      params
    });
  }

  createSchedule(scheduleRequest: ScheduleCreateRequest): Observable<Schedule> {
    return this.http.post<Schedule>(`${this.baseUrl}/schedules`, scheduleRequest, {
      headers: this.getHeaders()
    });
  }

  updateSchedule(scheduleId: number, scheduleRequest: ScheduleUpdateRequest): Observable<Schedule> {
    return this.http.put<Schedule>(`${this.baseUrl}/schedules/${scheduleId}`, scheduleRequest, {
      headers: this.getHeaders()
    });
  }

  deleteSchedule(scheduleId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/schedules/${scheduleId}`, {
      headers: this.getHeaders()
    });
  }

  // SME Availability
  searchSmeAvailability(date: string, fromTime: string, toTime: string): Observable<SMEAvailability[]> {
    const params = new HttpParams()
      .set('date', date)
      .set('fromTime', fromTime)
      .set('toTime', toTime);

    return this.http.get<SMEAvailability[]>(`${this.baseUrl}/smes/availability`, {
      headers: this.getHeaders(),
      params
    });
  }

  getSmeAvailability(smeId: number, startDate: string, endDate: string, workingHoursStart?: string, workingHoursEnd?: string): Observable<SMEAvailability> {
    let params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);

    if (workingHoursStart) params = params.set('workingHoursStart', workingHoursStart);
    if (workingHoursEnd) params = params.set('workingHoursEnd', workingHoursEnd);

    return this.http.get<SMEAvailability>(`${this.baseUrl}/smes/${smeId}/availability`, {
      headers: this.getHeaders(),
      params
    });
  }

  getSmeByEmail(email: string): Observable<SME> {
    const params = new HttpParams().set('email', email);

    return this.http.get<SME>(`${this.baseUrl}/smes/by-email`, {
      headers: this.getHeaders(),
      params
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Effort-related methods

  /**
   * Get individual SME effort data (for Supervisors - restricted to reportees)
   */
  getSupervisorSmeEffort(smeId: number, monthYear: string): Observable<SmeEffortData> {
    return this.http.get<SmeEffortData>(`${this.baseUrl}/supervisor/sme/${smeId}/effort/${monthYear}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get individual SME effort data (for Leads - unrestricted access)
   */
  getLeadSmeEffort(smeId: number, monthYear: string): Observable<SmeEffortData> {
    return this.http.get<SmeEffortData>(`${this.baseUrl}/lead/sme/${smeId}/effort/${monthYear}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get consolidated effort data for all reportees (for Supervisors)
   */
  getSupervisorReporteesEffort(monthYear: string): Observable<SupervisorEffortData> {
    return this.http.get<SupervisorEffortData>(`${this.baseUrl}/supervisor/reportees/effort/${monthYear}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get consolidated effort data for all SMEs (for Leads)
   */
  getLeadSmesEffort(monthYear: string): Observable<LeadEffortData> {
    return this.http.get<LeadEffortData>(`${this.baseUrl}/lead/smes/effort/${monthYear}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Generic method to get SME effort data based on user role
   */
  getSmeEffort(smeId: number, year: number, month: string, userRole?: string): Observable<SmeEffortData> {
    const monthYear = `${year}-${String(month).padStart(2, '0')}`;

    if (userRole?.toLowerCase() === 'lead') {
      return this.getLeadSmeEffort(smeId, monthYear);
    } else {
      return this.getSupervisorSmeEffort(smeId, monthYear);
    }
  }

  /**
   * Generic method to get consolidated effort data based on user role
   */
  getAllEffort(year: number, month: string, userRole?: string): Observable<SupervisorEffortData | LeadEffortData> {
    const monthYear = `${year}-${String(month).padStart(2, '0')}`;

    if (userRole?.toLowerCase() === 'lead') {
      return this.getLeadSmesEffort(monthYear);
    } else {
      return this.getSupervisorReporteesEffort(monthYear);
    }
  }
}
