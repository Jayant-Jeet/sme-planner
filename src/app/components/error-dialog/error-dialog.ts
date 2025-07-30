import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ErrorDialogData {
  title?: string;
  message: string;
  buttonText?: string;
}

@Component({
  selector: 'app-error-dialog',
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="error-dialog">
      <div class="dialog-header">
        <h2 mat-dialog-title>{{ data.title || 'Error' }}</h2>
      </div>

      <mat-dialog-content class="dialog-content">
        <p class="error-message">{{ data.message }}</p>
      </mat-dialog-content>

      <mat-dialog-actions class="dialog-actions">
        <button mat-raised-button
                color="primary"
                (click)="onClose()"
                class="close-button">
          {{ data.buttonText || 'OK' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .error-dialog {
      min-width: 400px;
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
      background-color: #f8d7da;
      color: #721c24;
      border-radius: 4px 4px 0 0;
      overflow: hidden;
    }

    .dialog-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
      color: #dc3545;
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

    .error-message {
      margin: 0 0 16px 0;
      color: #333;
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

    .close-button {
      min-width: 80px;
      color: #fff;
      background: linear-gradient(135deg, #ff4757 0%, #ff3742 100%);
      padding: 12px 24px;

       &:hover {
        background: linear-gradient(135deg, #ff3742 0%, #ff2837 100%);
      }
    }
  `]
})
export class ErrorDialogComponent {
  constructor(
    private readonly dialogRef: MatDialogRef<ErrorDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ErrorDialogData
  ) {}

  onClose(): void {
    this.dialogRef.close();
  }
}
