import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';

export interface EffortDialogData {
  userRole: string;
  selectedMonth: string;
  selectedYear: number;
}

export interface EffortDialogResult {
  action: 'single' | 'all';
  smeId?: string;
}

@Component({
  selector: 'app-effort-dialog',
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    FormsModule
  ],
  template: `
    <div class="effort-dialog">
      <div mat-dialog-title class="dialog-header">
        <h2>Get Effort Data</h2>
      </div>

      <div mat-dialog-content class="dialog-content">
        <p class="period-info">
          Period: <strong>{{ getMonthName() }} {{ data.selectedYear }}</strong>
        </p>

        <mat-form-field appearance="outline" class="sme-id-field">
          <mat-label>SME ID</mat-label>
          <input matInput
                 [(ngModel)]="smeId"
                 placeholder="Enter SME ID (optional for bulk operations)"
                 type="text">
        </mat-form-field>

        <div class="info-text">
          <p><strong>Options:</strong></p>
          <ul>
            <li>Enter an SME ID to get effort data for a specific SME</li>
            <li>Leave empty and use the bulk option to get effort for multiple SMEs</li>
          </ul>
        </div>
      </div>

      <div mat-dialog-actions class="dialog-actions">
        <button mat-button (click)="onCancel()" class="cancel-btn">
          Cancel
        </button>

        <button mat-raised-button
                color="primary"
                (click)="getSingleEffort()"
                [disabled]="!smeId.trim()"
                class="single-effort-btn">
          Get Effort for SME
        </button>

        <button mat-raised-button
                color="accent"
                (click)="getAllEffort()"
                class="bulk-effort-btn">
          {{ getBulkButtonText() }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .effort-dialog {
      min-width: 500px;
      max-width: 600px;
      padding: 24px;
    }

    .dialog-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 24px;
      color: #333;
      padding: 0 0 16px 0;

      .dialog-icon {
        font-size: 28px;
        width: 28px;
        height: 28px;
        color: #667eea;
      }

      h2 {
        margin: 0;
        font-weight: 500;
      }
    }

    .dialog-content {
      padding: 24px 0;

      .period-info {
        background: #f8f9ff;
        border: 1px solid #e1e5f2;
        border-radius: 8px;
        padding: 16px 20px;
        margin-bottom: 24px;
        color: #333;
        font-size: 14px;
      }

      .sme-id-field {
        width: 100%;
        margin-bottom: 20px;

        ::ng-deep .mat-mdc-form-field-infix {
          padding: 16px 12px;
        }
      }

      .info-text {
        background: #f0f4f8;
        border-radius: 8px;
        padding: 20px 24px;
        margin-bottom: 20px;

        p {
          margin: 0 0 12px 0;
          font-weight: 500;
          color: #333;
        }

        ul {
          margin: 0;
          padding-left: 24px;
          color: #666;

          li {
            margin-bottom: 8px;
            font-size: 14px;
            line-height: 1.4;
          }
        }
      }
    }

    .dialog-actions {
      display: flex;
      gap: 16px;
      justify-content: flex-end;
      padding: 20px 0 0 0;
      border-top: 1px solid #e1e5f2;
      margin-top: 24px;

      .cancel-btn {
        color: #fff;
        background: linear-gradient(135deg, #ff4757 0%, #ff3742 100%);
        padding: 12px 24px;

        &:hover {
          background: linear-gradient(135deg, #ff3742 0%, #ff2837 100%);
        }
      }

      .single-effort-btn {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 12px 24px;

        &:disabled {
          background: #ccc !important;
          color: #999 !important;
        }
      }

      .bulk-effort-btn {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        color: white;
        padding: 12px 24px;
      }

      button {
        display: flex;
        align-items: center;
        gap: 8px;
        border-radius: 8px;
        font-weight: 500;
        transition: all 0.3s ease;
        min-height: 44px;

        &:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        mat-icon {
          font-size: 18px;
          width: 18px;
          height: 18px;
        }
      }
    }
  `]
})
export class EffortDialogComponent {
  smeId: string = '';

  constructor(
    public dialogRef: MatDialogRef<EffortDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EffortDialogData
  ) {}

  getMonthName(): string {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[parseInt(this.data.selectedMonth) - 1] || '';
  }

  getBulkButtonText(): string {
    if (this.data.userRole === 'lead') {
      return 'Get Effort for All SMEs';
    } else if (this.data.userRole === 'supervisor') {
      return 'Get Effort for All Reportees';
    }
    return 'Get All Effort';
  }

  getSingleEffort(): void {
    if (this.smeId.trim()) {
      this.dialogRef.close({
        action: 'single',
        smeId: this.smeId.trim()
      } as EffortDialogResult);
    }
  }

  getAllEffort(): void {
    this.dialogRef.close({
      action: 'all'
    } as EffortDialogResult);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
