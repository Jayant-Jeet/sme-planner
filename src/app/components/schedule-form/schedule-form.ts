import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Activity, Schedule, SME, ScheduleCreateRequest, ScheduleUpdateRequest } from '../../models/api.models';
import { ApiService } from '../../services/api';
import { AuthService } from '../../services/auth';
import { ErrorDialogComponent, ErrorDialogData } from '../error-dialog/error-dialog';

export interface ScheduleFormData {
  schedule?: Schedule;
  activities?: Activity[];
}

@Component({
  selector: 'app-schedule-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './schedule-form.html',
  styleUrl: './schedule-form.scss'
})
export class ScheduleForm implements OnInit {
  scheduleForm: FormGroup;
  activities: Activity[] = [];
  isEditMode = false;
  isSubmitting = false;
  minDate: string;
  currentUser: SME | null = null;

  constructor(
    private readonly fb: FormBuilder,
    private readonly apiService: ApiService,
    private readonly authService: AuthService,
    private readonly dialogRef: MatDialogRef<ScheduleForm>,
    private readonly dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: ScheduleFormData
  ) {
    this.currentUser = this.authService.getCurrentUser();
    this.isEditMode = !!data?.schedule;
    this.minDate = this.getTodayDate();

    this.scheduleForm = this.fb.group({
      date: ['', Validators.required],
      fromTime: ['', Validators.required],
      toTime: ['', Validators.required],
      activityId: ['', Validators.required],
      description: ['', Validators.required]
    }, { validators: this.timeOrderValidator });
  }

  ngOnInit(): void {
    this.loadActivities();

    if (this.isEditMode && this.data.schedule) {
      this.populateForm(this.data.schedule);
    }
  }

  private getTodayDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  private timeOrderValidator(control: AbstractControl): { [key: string]: any } | null {
    const fromTime = control.get('fromTime');
    const toTime = control.get('toTime');

    if (fromTime && toTime && fromTime.value && toTime.value) {
      const from = new Date(`2000-01-01 ${fromTime.value}`);
      const to = new Date(`2000-01-01 ${toTime.value}`);

      if (to <= from) {
        toTime.setErrors({ timeOrder: true });
        return { timeOrder: true };
      } else {
        // Clear the timeOrder error if it exists, but preserve other errors
        const errors = toTime.errors;
        if (errors?.['timeOrder']) {
          delete errors['timeOrder'];
          toTime.setErrors(Object.keys(errors).length ? errors : null);
        }
      }
    }

    return null;
  }

  private loadActivities(): void {
    // Use activities from data if provided, otherwise fetch from API
    if (this.data?.activities && this.data.activities.length > 0) {
      this.activities = this.data.activities;
    } else {
      this.apiService.getActivities().subscribe({
        next: (activities) => {
          this.activities = activities;
        },
        error: (error) => {
          console.error('Failed to load activities:', error);
          this.showError('Failed to load activities', error?.message || JSON.stringify(error, null, 2));
        }
      });
    }
  }

  private populateForm(schedule: Schedule): void {
    this.scheduleForm.patchValue({
      date: schedule.date,
      fromTime: schedule.fromTime,
      toTime: schedule.toTime,
      activityId: schedule.activityId,
      description: schedule.description ?? ''
    });
  }

  getDuration(): string {
    const fromTime = this.scheduleForm.get('fromTime')?.value;
    const toTime = this.scheduleForm.get('toTime')?.value;

    if (!fromTime || !toTime) return '';

    const from = new Date(`2000-01-01 ${fromTime}`);
    const to = new Date(`2000-01-01 ${toTime}`);

    if (to <= from) return '';

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

  onSubmit(): void {
    if (this.scheduleForm.invalid || !this.currentUser) return;

    this.isSubmitting = true;
    const formValue = this.scheduleForm.value;

    const scheduleData: ScheduleCreateRequest | ScheduleUpdateRequest = {
      fromDate: formValue.date,
      toDate: formValue.date, // Same date for single-day schedules
      fromTime: formValue.fromTime,
      toTime: formValue.toTime,
      activityId: formValue.activityId,
      description: formValue.description
    };

    const request = this.isEditMode && this.data.schedule?.id
      ? this.apiService.updateSchedule(this.data.schedule.id, scheduleData as ScheduleUpdateRequest)
      : this.apiService.createSchedule(scheduleData as ScheduleCreateRequest);

    request.subscribe({
      next: (schedule) => {
        this.isSubmitting = false;
        this.dialogRef.close(schedule);
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Failed to save schedule:', error);
        this.showError('Failed to save schedule', error?.message || JSON.stringify(error, null, 2));
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
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
