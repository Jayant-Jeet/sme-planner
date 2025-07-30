import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { ApiService } from '../../services/api';
import { SME, Schedule, Activity } from '../../models/api.models';
import { ErrorDialogComponent, ErrorDialogData } from '../error-dialog/error-dialog';

@Component({
  selector: 'app-sme-search',
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatCardModule,
    MatDividerModule,
    MatTableModule,
    MatSelectModule,
    MatTabsModule,
    MatChipsModule
  ],
  templateUrl: './sme-search.html',
  styleUrl: './sme-search.scss'
})
export class SmeSearchComponent {
  searchEmail = '';
  searchResult: SME | null = null;
  schedules: Schedule[] = [];
  activities: Activity[] = [];
  isSearching = false;
  isLoadingSchedules = false;
  hasSearched = false;
  selectedMonth = this.getCurrentMonth();
  displayedColumns: string[] = ['date', 'activity', 'time', 'description'];

  constructor(
    private readonly dialogRef: MatDialogRef<SmeSearchComponent>,
    private readonly apiService: ApiService,
    private readonly snackBar: MatSnackBar,
    private readonly dialog: MatDialog
  ) {
    this.loadActivities();
  }

  searchSme(): void {
    if (!this.searchEmail.trim()) {
      this.showError('Invalid input', 'Please enter an email address');
      return;
    }

    if (!this.isValidEmail(this.searchEmail)) {
      this.showError('Invalid input', 'Please enter a valid email address');
      return;
    }

    this.isSearching = true;
    this.searchResult = null;
    this.schedules = [];
    this.hasSearched = false;

    this.apiService.getSmeByEmail(this.searchEmail.trim()).subscribe({
      next: (sme) => {
        this.searchResult = sme;
        this.hasSearched = true;
        this.isSearching = false;
        // Load schedules for the found SME
        this.loadSmeSchedules(sme.id);
      },
      error: (error) => {
        console.error('Search error:', error);
        this.searchResult = null;
        this.schedules = [];
        this.hasSearched = true;
        this.isSearching = false;

        if (error?.error?.message) {
          this.showError('Search error', error.error.message);
        } else {
          this.showError('SME not found with this email address', 'Please check the email address and try again.');
        }
      }
    });
  }

  selectSme(sme: SME): void {
    this.dialogRef.close(sme);
  }

  close(): void {
    this.dialogRef.close();
  }

  clearSearch(): void {
    this.searchEmail = '';
    this.searchResult = null;
    this.schedules = [];
    this.hasSearched = false;
  }

  getCurrentMonth(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  loadActivities(): void {
    this.apiService.getActivities().subscribe({
      next: (activities) => {
        this.activities = activities;
      },
      error: (error) => {
        console.error('Failed to load activities:', error);
      }
    });
  }

  loadSmeSchedules(smeId: number): void {
    this.isLoadingSchedules = true;
    this.apiService.getSchedulesBySmeId(smeId, this.selectedMonth).subscribe({
      next: (schedules) => {
        this.schedules = schedules;
        this.isLoadingSchedules = false;
      },
      error: (error) => {
        console.error('Failed to load SME schedules:', error);
        this.schedules = [];
        this.isLoadingSchedules = false;
        this.showError('Failed to load SME schedules', error?.message || JSON.stringify(error, null, 2));
      }
    });
  }

  onMonthChange(): void {
    if (this.searchResult) {
      this.loadSmeSchedules(this.searchResult.id);
    }
  }

  getActivityName(activityId: number): string {
    const activity = this.activities.find(a => a.id === activityId);
    return activity ? activity.name : 'Unknown Activity';
  }

  getStatusIcon(status: string): string {
    const icons = {
      'available': 'check_circle',
      'busy': 'schedule',
      'unavailable': 'cancel'
    };
    return icons[status as keyof typeof icons] || 'help';
  }

  getStatusColor(status: string): string {
    const colors = {
      'available': 'success',
      'busy': 'warn',
      'unavailable': 'error'
    };
    return colors[status as keyof typeof colors] || 'default';
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

  getAvailableCount(): number {
    return this.schedules.filter(schedule => schedule.status === 'available').length;
  }

  getBusyCount(): number {
    return this.schedules.filter(schedule => schedule.status === 'busy').length;
  }

  getUnavailableCount(): number {
    return this.schedules.filter(schedule => schedule.status === 'unavailable').length;
  }

  getInitials(name: string): string {
    if (!name) return 'SME';
    return name
      .split(' ')
      .map(n => n.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
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
      } as ErrorDialogData
    });

    dialogRef.afterClosed().subscribe(() => {
      // Handle any post-error actions if needed
    });
  }
}
