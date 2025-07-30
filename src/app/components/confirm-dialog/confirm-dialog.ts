import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'danger' | 'info';
}

@Component({
  selector: 'app-confirm-dialog',
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="confirm-dialog">
      <div class="dialog-header" [ngClass]="'dialog-' + (data.type || 'info')">
        <h2 mat-dialog-title>{{ data.title }}</h2>
      </div>

      <mat-dialog-content class="dialog-content">
        <p>{{ data.message }}</p>
      </mat-dialog-content>

      <mat-dialog-actions class="dialog-actions">
        <button mat-stroked-button
                (click)="onCancel()"
                class="cancel-button">
          {{ data.cancelText || 'Cancel' }}
        </button>
        <button mat-stroked-button
                [color]="getButtonColor()"
                (click)="onConfirm()"
                class="confirm-button">
          {{ data.confirmText || 'Confirm' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .confirm-dialog {
      min-width: 450px;
      max-width: 600px;
      width: 100%;
      overflow: hidden;
      resize: none;
    }

    .dialog-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 20px 24px 16px;
      margin: -20px -24px 16px;
      border-radius: 4px 4px 0 0;
      overflow: hidden;
    }

    .dialog-header.dialog-warning {
      background-color: #fff3cd;
      color: #856404;
    }

    .dialog-header.dialog-danger {
      background-color: #f8d7da;
      color: #721c24;
    }

    .dialog-header.dialog-info {
      background-color: #d1ecf1;
      color: #0c5460;
    }

    .dialog-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    h2[mat-dialog-title] {
      margin: 0;
      font-size: 18px;
      font-weight: 500;
    }

    .dialog-content {
      padding: 0 24px 20px;
      overflow: hidden;
      max-height: none;
    }

    .dialog-content p {
      margin: 0;
      color: #666;
      line-height: 1.5;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .dialog-actions {
      padding: 0 24px 20px;
      gap: 12px;
      justify-content: flex-end;
      overflow: hidden;
    }

    .cancel-button {
      color: #666;
    }

    .confirm-button {
      min-width: 80px;
    }
  `]
})
export class ConfirmDialogComponent {
  constructor(
    private readonly dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {}

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  getIcon(): string {
    switch (this.data.type) {
      case 'warning':
        return 'warning';
      case 'danger':
        return 'error';
      case 'info':
      default:
        return 'info';
    }
  }

  getButtonColor(): string {
    switch (this.data.type) {
      case 'danger':
        return 'warn';
      case 'warning':
        return 'accent';
      case 'info':
      default:
        return 'primary';
    }
  }
}
