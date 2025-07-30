import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';
import { SmeEffortData, SupervisorEffortData, LeadEffortData } from '../../models/api.models';

export interface EffortDisplayData {
  type: 'single' | 'consolidated';
  data: SmeEffortData | SupervisorEffortData | LeadEffortData;
  userRole: string;
}

@Component({
  selector: 'app-effort-display',
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatCardModule,
    MatDividerModule,
    MatTabsModule
  ],
  templateUrl: './effort-display.html',
  styleUrl: './effort-display.scss'
})
export class EffortDisplayComponent {
  displayedColumns: string[] = [
    'smeName',
    'smeEmail',
    'smeConnectCount',
    'byteSizedCount',
    'lateralTrainingCount',
    'questionContributionCount',
    'totalHoursAllocated',
    'totalSessions'
  ];

  summaryDisplayedColumns: string[] = [
    'metric',
    'value'
  ];

  constructor(
    public dialogRef: MatDialogRef<EffortDisplayComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EffortDisplayData
  ) {}

  isSingleEffort(): boolean {
    return this.data.type === 'single';
  }

  isConsolidatedEffort(): boolean {
    return this.data.type === 'consolidated';
  }

  getSingleEffortData(): SmeEffortData {
    return this.data.data as SmeEffortData;
  }

  getConsolidatedEffortData(): SupervisorEffortData | LeadEffortData {
    return this.data.data as SupervisorEffortData | LeadEffortData;
  }

  getTeamMembers(): SmeEffortData[] {
    const consolidatedData = this.getConsolidatedEffortData();
    if ('reportees' in consolidatedData) {
      return consolidatedData.reportees;
    } else {
      return consolidatedData.smes;
    }
  }

  getSummaryData(): { metric: string; value: string | number }[] {
    if (this.isSingleEffort()) {
      const singleData = this.getSingleEffortData();
      return [
        { metric: 'SME Name', value: singleData.smeName },
        { metric: 'Email', value: singleData.smeEmail },
        { metric: 'Period', value: singleData.monthYear },
        { metric: 'SME Connect Sessions', value: singleData.smeConnectCount },
        { metric: 'Byte-sized Learning', value: singleData.byteSizedCount },
        { metric: 'Lateral Training', value: singleData.lateralTrainingCount },
        { metric: 'Question Contributions', value: singleData.questionContributionCount },
        { metric: 'Total Hours Allocated', value: singleData.totalHoursAllocated },
        { metric: 'Total Sessions', value: singleData.totalSessions }
      ];
    } else {
      const consolidatedData = this.getConsolidatedEffortData();
      const isLead = 'smes' in consolidatedData;
      const leadData = consolidatedData as LeadEffortData;
      const supervisorData = consolidatedData as SupervisorEffortData;

      return [
        {
          metric: isLead ? 'Lead Name' : 'Supervisor Name',
          value: isLead ? leadData.leadName : supervisorData.supervisorName
        },
        {
          metric: 'Email',
          value: isLead ? leadData.leadEmail : supervisorData.supervisorEmail
        },
        { metric: 'Period', value: consolidatedData.monthYear },
        {
          metric: isLead ? 'Total SMEs' : 'Total Reportees',
          value: consolidatedData.totals.totalReportees
        },
        { metric: 'Total SME Connect Sessions', value: consolidatedData.totals.totalSmeConnectCount },
        { metric: 'Total Byte-sized Learning', value: consolidatedData.totals.totalByteSizedCount },
        { metric: 'Total Lateral Training', value: consolidatedData.totals.totalLateralTrainingCount },
        { metric: 'Total Question Contributions', value: consolidatedData.totals.totalQuestionContributionCount },
        { metric: 'Total Hours Allocated', value: consolidatedData.totals.totalHoursAllocated },
        { metric: 'Total Sessions', value: consolidatedData.totals.totalSessions }
      ];
    }
  }

  getTitle(): string {
    if (this.isSingleEffort()) {
      return 'SME Effort Report';
    } else {
      const isLead = this.data.userRole.toLowerCase() === 'lead';
      return isLead ? 'Organization Effort Report' : 'Team Effort Report';
    }
  }

  exportToCSV(): void {
    if (this.isSingleEffort()) {
      this.exportSingleEffortToCSV();
    } else {
      this.exportConsolidatedEffortToCSV();
    }
  }

  private exportSingleEffortToCSV(): void {
    const data = this.getSingleEffortData();
    const csvContent = `SME Name,Email,Period,SME Connect,Byte-sized Learning,Lateral Training,Question Contributions,Total Hours,Total Sessions
${data.smeName},${data.smeEmail},${data.monthYear},${data.smeConnectCount},${data.byteSizedCount},${data.lateralTrainingCount},${data.questionContributionCount},${data.totalHoursAllocated},${data.totalSessions}`;

    this.downloadCSV(csvContent, `SME_Effort_${data.smeName}_${data.monthYear}.csv`);
  }

  private exportConsolidatedEffortToCSV(): void {
    const consolidatedData = this.getConsolidatedEffortData();
    const teamMembers = this.getTeamMembers();
    const isLead = 'smes' in consolidatedData;

    let csvContent = 'SME Name,Email,SME Connect,Byte-sized Learning,Lateral Training,Question Contributions,Total Hours,Total Sessions\n';

    teamMembers.forEach(member => {
      csvContent += `${member.smeName},${member.smeEmail},${member.smeConnectCount},${member.byteSizedCount},${member.lateralTrainingCount},${member.questionContributionCount},${member.totalHoursAllocated},${member.totalSessions}\n`;
    });

    // Add totals row
    csvContent += `\nTOTALS,,${consolidatedData.totals.totalSmeConnectCount},${consolidatedData.totals.totalByteSizedCount},${consolidatedData.totals.totalLateralTrainingCount},${consolidatedData.totals.totalQuestionContributionCount},${consolidatedData.totals.totalHoursAllocated},${consolidatedData.totals.totalSessions}`;

    const filename = isLead
      ? `Organization_Effort_${consolidatedData.monthYear}.csv`
      : `Team_Effort_${consolidatedData.monthYear}.csv`;

    this.downloadCSV(csvContent, filename);
  }

  private downloadCSV(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  close(): void {
    this.dialogRef.close();
  }
}
