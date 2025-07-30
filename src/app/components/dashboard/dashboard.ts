import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../services/auth';
import { ApiService } from '../../services/api';
import { Schedule, Activity, SME, Supervisor, Lead, SmeEffortData, SupervisorEffortData, LeadEffortData } from '../../models/api.models';
import { SmeSearchComponent } from '../sme-search/sme-search';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog';
import { ScheduleForm } from '../schedule-form/schedule-form';
import { EffortDialogComponent, EffortDialogData, EffortDialogResult } from '../effort-dialog/effort-dialog';
import { EffortDisplayComponent, EffortDisplayData } from '../effort-display/effort-display';
import { ErrorDialogComponent, ErrorDialogData } from '../error-dialog/error-dialog';

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTableModule,
    MatDialogModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatMenuModule
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardComponent implements OnInit {
  currentUser: SME | Supervisor | Lead | null = null;
  schedules: Schedule[] = [];
  activities: Activity[] = [];
  selectedMonth = this.getCurrentMonth();
  selectedYear = new Date().getFullYear();
  displayedColumns: string[] = ['date', 'activity', 'time', 'description', 'actions'];
  isLoading = false;
  imageLoadError = false;
  isUserMenuOpen = false;

  // Month and year options
  months = [
    { value: 1, name: 'January' },
    { value: 2, name: 'February' },
    { value: 3, name: 'March' },
    { value: 4, name: 'April' },
    { value: 5, name: 'May' },
    { value: 6, name: 'June' },
    { value: 7, name: 'July' },
    { value: 8, name: 'August' },
    { value: 9, name: 'September' },
    { value: 10, name: 'October' },
    { value: 11, name: 'November' },
    { value: 12, name: 'December' }
  ];

  years = [2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030];

  constructor(
    private readonly authService: AuthService,
    private readonly apiService: ApiService,
    private readonly dialog: MatDialog,
    private readonly snackBar: MatSnackBar
  ) {
    // Initialize selectedMonth as number for the new dropdown
    this.selectedMonth = this.getCurrentMonth();
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    console.log('Dashboard - Current User:', this.currentUser); // Debug log

    // Subscribe to user changes
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      console.log('Dashboard - User updated:', user); // Debug log
    });

    this.loadActivities();
    this.loadSchedules();
  }

  getCurrentMonth(): string {
    const now = new Date();
    return String(now.getMonth() + 1);
  }

  getFormattedMonthYear(): string {
    return `${this.selectedYear}-${String(this.selectedMonth).padStart(2, '0')}`;
  }

  onMonthYearChange(): void {
    this.loadSchedules();
  }

  getEffort(): void {
    if (!this.isSupervisorOrLead()) {
      return;
    }

    const dialogRef = this.dialog.open(EffortDialogComponent, {
      width: '600px',
      maxWidth: '95vw',
      disableClose: false,
      autoFocus: true,
      data: {
        userRole: this.currentUser?.role?.toLowerCase(),
        selectedMonth: this.selectedMonth,
        selectedYear: this.selectedYear
      } as EffortDialogData
    });

    dialogRef.afterClosed().subscribe((result: EffortDialogResult) => {
      if (result) {
        this.handleEffortRequest(result);
      }
    });
  }

  private handleEffortRequest(result: EffortDialogResult): void {
    const monthName = this.getSelectedMonthName();

    if (result.action === 'single' && result.smeId) {
      console.log(`Getting effort data for SME ${result.smeId} for ${monthName} ${this.selectedYear}`);
      this.showSuccess(`Fetching effort data for SME ${result.smeId} for ${monthName} ${this.selectedYear}`);

      const smeIdNumber = parseInt(result.smeId, 10);
      if (isNaN(smeIdNumber)) {
        this.showError('Invalid input', 'Invalid SME ID. Please enter a valid number.');
        return;
      }

      this.apiService.getSmeEffort(smeIdNumber, this.selectedYear, this.selectedMonth, this.currentUser?.role).subscribe({
        next: (effortData) => {
          this.handleSingleSmeEffortData(effortData);
        },
        error: (error) => {
          console.error('Error fetching SME effort data:', error);
          this.showError('Error fetching SME effort data', error?.message);
        }
      });

    } else if (result.action === 'all') {
      const actionText = this.currentUser?.role?.toLowerCase() === 'lead'
        ? 'all SMEs'
        : 'all reportees';

      console.log(`Getting effort data for ${actionText} for ${monthName} ${this.selectedYear}`);
      this.showSuccess(`Fetching effort data for ${actionText} for ${monthName} ${this.selectedYear}`);

      this.apiService.getAllEffort(this.selectedYear, this.selectedMonth, this.currentUser?.role).subscribe({
        next: (effortData) => {
          this.handleConsolidatedEffortData(effortData);
        },
        error: (error) => {
          console.error('Error fetching consolidated effort data:', error);
          this.showError(`Failed to load effort data for ${actionText}`, error?.message || JSON.stringify(error, null, 2));
        }
      });
    }
  }

  isSupervisorOrLead(): boolean {
    const role = this.currentUser?.role?.toLowerCase();
    return role === 'supervisor' || role === 'lead';
  }

  getSelectedMonthName(): string {
    const month = this.months.find(m => m.value === parseInt(this.selectedMonth));
    return month ? month.name : '';
  }

  loadActivities(): void {
    this.apiService.getActivities().subscribe({
      next: (activities) => {
        this.activities = activities;
      },
      error: (error) => {
        this.showError('Failed to load activities', error?.message || JSON.stringify(error, null, 2));
      }
    });
  }

  loadSchedules(): void {
    this.isLoading = true;
    const monthYear = this.getFormattedMonthYear();
    this.apiService.getSmeSchedules(monthYear).subscribe({
      next: (schedules) => {
        this.schedules = schedules;
        this.isLoading = false;
      },
      error: (error) => {
        this.showError('Failed to load schedules', error?.message || JSON.stringify(error, null, 2));
        this.isLoading = false;
      }
    });
  }

  onMonthChange(): void {
    this.onMonthYearChange();
  }

  openScheduleDialog(schedule?: Schedule): void {
    const dialogRef = this.dialog.open(ScheduleForm, {
      width: '600px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      disableClose: false,
      autoFocus: true,
      data: {
        schedule: schedule,
        activities: this.activities
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // result is the created/updated schedule
        this.loadSchedules();
        const action = schedule ? 'updated' : 'created';
        this.showSuccess(`Schedule ${action} successfully`);
      }
    });
  }

  deleteSchedule(schedule: Schedule): void {
    if (!schedule.id) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      maxWidth: '600px',
      disableClose: false,
      hasBackdrop: true,
      panelClass: 'confirm-dialog-panel',
      data: {
        title: 'Delete Schedule',
        message: 'Are you sure you want to delete this schedule? This action cannot be undone.',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        type: 'danger'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true && schedule.id) {
        this.apiService.deleteSchedule(schedule.id).subscribe({
          next: () => {
            this.loadSchedules();
            this.showSuccess('Schedule deleted successfully');
          },
          error: () => {
            this.showError('Failed to delete schedule', 'An error occurred while trying to delete the schedule. Please try again.');
          }
        });
      }
    });
  }

  openSmeSearch(): void {
    const dialogRef = this.dialog.open(SmeSearchComponent, {
      width: '1200px',
      maxWidth: '95vw',
      height: '90vh',
      maxHeight: '90vh',
      disableClose: false,
      autoFocus: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // result is the selected SME
        this.handleSmeSelection(result);
      }
    });
  }

  private handleSmeSelection(sme: SME): void {
    console.log('Selected SME:', sme);

    // Here you can add additional logic for what to do with the selected SME
    // For example:
    // - Navigate to SME details page
    // - Show SME availability
    // - Create a schedule with this SME
    // - etc.
  }

  logout(): void {
    this.authService.logout();
  }

  toggleUserMenu(): void {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  closeUserMenu(): void {
    this.isUserMenuOpen = false;
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  private showError(message: string, details?: string): void {
    const dialogRef = this.dialog.open(ErrorDialogComponent, {
      width: '500px',
      maxWidth: '95vw',
      disableClose: false,
      autoFocus: true,
      data: {
        title: message,
        message: details,
        details: details
      } as ErrorDialogData
    });

    dialogRef.afterClosed().subscribe(() => {
      // Handle any post-error actions if needed
    });
  }

  getScheduleCount(status: string): number {
    return this.schedules.filter(schedule => schedule.status === status).length;
  }

  getAvailableCount(): number {
    return this.schedules.filter(schedule => schedule.status === 'available').length;
  }

  getBusyCount(): number {
    return this.schedules.filter(schedule => schedule.status === 'busy').length;
  }

  getMonthName(monthValue: string): string {
    const months = {
      '2025-01': 'January 2025',
      '2025-02': 'February 2025',
      '2025-03': 'March 2025',
      '2025-04': 'April 2025',
      '2025-05': 'May 2025',
      '2025-06': 'June 2025',
      '2025-07': 'July 2025',
      '2025-08': 'August 2025',
      '2025-09': 'September 2025',
      '2025-10': 'October 2025',
      '2025-11': 'November 2025',
      '2025-12': 'December 2025'
    };
    return months[monthValue as keyof typeof months] || monthValue;
  }

  calculateDuration(fromTime: string, toTime: string): string {
    if (!fromTime || !toTime) return '';

    const from = new Date(`2000-01-01 ${fromTime}`);
    const to = new Date(`2000-01-01 ${toTime}`);
    const diffMs = to.getTime() - from.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours > 0 && diffMinutes > 0) {
      return `${diffHours}h ${diffMinutes}m`;
    } else if (diffHours > 0) {
      return `${diffHours}h`;
    } else {
      return `${diffMinutes}m`;
    }
  }

  getStatusIcon(status: string): string {
    const icons = {
      'available': 'check_circle',
      'busy': 'schedule',
      'unavailable': 'cancel'
    };
    return icons[status as keyof typeof icons] || 'help';
  }

  onImageError(event: any): void {
    console.log('Image failed to load, showing fallback icon');
    this.imageLoadError = true;
    event.target.style.display = 'none';
  }

  private handleSingleSmeEffortData(effortData: SmeEffortData): void {
    console.log('Single SME Effort Data:', effortData);

    // Show success message
    this.showSuccess(`Effort data retrieved successfully for ${effortData.smeName}`);

    // Open the effort display dialog
    const dialogRef = this.dialog.open(EffortDisplayComponent, {
      width: '900px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      disableClose: false,
      autoFocus: true,
      data: {
        type: 'single',
        data: effortData,
        userRole: this.currentUser?.role?.toLowerCase() || ''
      } as EffortDisplayData
    });

    dialogRef.afterClosed().subscribe(result => {
      // Handle any post-dialog actions if needed
      console.log('Effort display dialog closed');
    });
  }

  private handleConsolidatedEffortData(effortData: SupervisorEffortData | LeadEffortData): void {
    console.log('Consolidated Effort Data:', effortData);

    let teamMembers: SmeEffortData[] = [];
    let userType = '';

    if ('reportees' in effortData) {
      // Supervisor data
      teamMembers = effortData.reportees;
      userType = 'supervisor';
      this.showSuccess(`Team effort data retrieved successfully for ${effortData.supervisorName}`);
    } else {
      // Lead data
      teamMembers = effortData.smes;
      userType = 'lead';
      this.showSuccess(`Organization effort data retrieved successfully for ${effortData.leadName}`);
    }

    // Open the effort display dialog
    const dialogRef = this.dialog.open(EffortDisplayComponent, {
      width: '1200px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      disableClose: false,
      autoFocus: true,
      data: {
        type: 'consolidated',
        data: effortData,
        userRole: userType
      } as EffortDisplayData
    });

    dialogRef.afterClosed().subscribe(result => {
      // Handle any post-dialog actions if needed
      console.log('Consolidated effort display dialog closed');
    });

    // Log individual team member data for debugging
    teamMembers.forEach(member => {
      console.log(`${member.smeName}: ${member.totalHoursAllocated} hours, ${member.totalSessions} sessions`);
    });
  }
}
