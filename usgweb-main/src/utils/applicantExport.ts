import { JobApplication } from '../types';
import { SACCO_INFO } from '../data/saccoData';

export const normalizeApplicantStatus = (s?: string): string => {
  const lower = String(s ?? '').toLowerCase().trim();
  if (lower === 'applied' || lower === 'screening' || lower === 'pending') return 'pending';
  if (lower === 'shortlisted') return 'shortlisted';
  if (lower === 'not_shortlisted' || lower === 'not-shortlisted') return 'not_shortlisted';
  if (lower === 'interview') return 'interview';
  if (lower === 'accepted' || lower === 'hired' || lower === 'offer') return 'accepted';
  if (lower === 'waitlisted') return 'waitlisted';
  if (lower === 'rejected') return 'rejected';
  return lower || 'pending';
};

/**
 * Exports an array of JobApplication records into a styled, formatted Excel spreadsheet (.xls / .csv)
 * containing all candidate information.
 */
export function exportApplicantsToExcel(
  applicants: JobApplication[],
  fileName: string = `UBUMWE_SACCO_Job_Applicants_${new Date().toISOString().split('T')[0]}.xls`
) {
  const getStatusText = (status: JobApplication['status'] | string) => {
    const norm = normalizeApplicantStatus(status);
    switch (norm) {
      case 'accepted': return 'Hired / Accepted';
      case 'shortlisted': return 'Shortlisted';
      case 'interview': return 'Interview Scheduled';
      case 'not_shortlisted': return 'Not Shortlisted';
      case 'waitlisted': return 'Waitlisted / Reserve';
      case 'rejected': return 'Rejected / Regret';
      default: return 'Pending Review';
    }
  };

  const getStatusColor = (status: JobApplication['status'] | string) => {
    const norm = normalizeApplicantStatus(status);
    switch (norm) {
      case 'accepted': return '#047857; color: #ffffff;';
      case 'shortlisted': return '#1d4ed8; color: #ffffff;';
      case 'interview': return '#7e22ce; color: #ffffff;';
      case 'not_shortlisted': return '#be123c; color: #ffffff;';
      case 'waitlisted': return '#0f766e; color: #ffffff;';
      case 'rejected': return '#b91c1c; color: #ffffff;';
      default: return '#b45309; color: #ffffff;';
    }
  };

  // Styled HTML table compatible with Microsoft Excel (.xls)
  const excelHTML = `
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="utf-8">
  <!--[if gte mso 9]>
  <xml>
    <x:ExcelWorkbook>
      <x:ExcelWorksheets>
        <x:ExcelWorksheet>
          <x:Name>Job Applicants</x:Name>
          <x:WorksheetOptions>
            <x:DisplayGridlines/>
          </x:WorksheetOptions>
        </x:ExcelWorksheet>
      </x:ExcelWorksheets>
    </x:ExcelWorkbook>
  </xml>
  <![endif]-->
  <style>
    body { font-family: Calibri, Arial, sans-serif; }
    .header-title { font-size: 16pt; font-weight: bold; color: #065f46; text-align: left; }
    .header-sub { font-size: 11pt; color: #475569; text-align: left; }
    th { background-color: #065f46; color: #ffffff; font-weight: bold; border: 1px solid #cbd5e1; padding: 10px; font-size: 10pt; }
    td { border: 1px solid #cbd5e1; padding: 8px; font-size: 9.5pt; vertical-align: top; }
    .alt-row { background-color: #f8fafc; }
    .status-badge { font-weight: bold; padding: 4px 8px; border-radius: 4px; text-align: center; }
    .meta-label { font-weight: bold; color: #334155; }
  </style>
</head>
<body>
  <table>
    <tr>
      <td colspan="15" class="header-title">${SACCO_INFO.name} - CANDIDATE APPLICATIONS ROSTER</td>
    </tr>
    <tr>
      <td colspan="15" class="header-sub">Official Recruitment Report · Exported on: ${new Date().toLocaleString()} · Total Candidates: ${applicants.length}</td>
    </tr>
    <tr><td colspan="15"></td></tr>
    <thead>
      <tr>
        <th style="width: 40px;">#</th>
        <th style="width: 140px;">Application Ref</th>
        <th style="width: 180px;">Candidate Full Name</th>
        <th style="width: 150px;">National ID (16 digits)</th>
        <th style="width: 120px;">NID Verified</th>
        <th style="width: 130px;">Phone Number</th>
        <th style="width: 180px;">Email Address</th>
        <th style="width: 200px;">Position Applied</th>
        <th style="width: 180px;">Qualification Level</th>
        <th style="width: 80px;">Experience</th>
        <th style="width: 120px;">Sector</th>
        <th style="width: 140px;">Application Status</th>
        <th style="width: 100px;">Applied Date</th>
        <th style="width: 220px;">Committee Remarks / Deliberation</th>
        <th style="width: 260px;">Motivation / Cover Statement</th>
      </tr>
    </thead>
    <tbody>
      ${applicants.map((app, index) => {
        const isAlt = index % 2 === 1 ? 'class="alt-row"' : '';
        const statusBg = getStatusColor(app.status);
        const statusLabel = getStatusText(app.status);
        return `
        <tr ${isAlt}>
          <td align="center">${index + 1}</td>
          <td style="font-family: monospace;">${app.referenceNumber || app.id}</td>
          <td><strong>${app.fullName}</strong></td>
          <td style="font-family: monospace;" align="center">${app.nationalId}</td>
          <td align="center">${app.verified ? 'YES (Verified)' : 'Pending'}</td>
          <td>${app.phone}</td>
          <td>${app.email}</td>
          <td><strong>${app.jobTitle}</strong></td>
          <td>${app.educationLevel || 'N/A'}</td>
          <td align="center">${app.yearsExperience ?? 0} yrs</td>
          <td>${app.residenceSector || 'Gakenke'}</td>
          <td align="center" style="background-color: ${statusBg}">${statusLabel}</td>
          <td align="center">${app.appliedDate}</td>
          <td>${app.comment || app.notes || 'No remarks recorded'}</td>
          <td>${app.coverLetter || 'Direct application submission'}</td>
        </tr>`;
      }).join('')}
    </tbody>
  </table>
</body>
</html>`;

  const blob = new Blob([excelHTML], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName.endsWith('.xls') || fileName.endsWith('.xlsx') ? fileName : `${fileName}.xls`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generates an official, comprehensive printable PDF report window for candidate applications.
 * Opens print preview immediately with 1-click "Save as PDF".
 */
export function exportApplicantsToPDF(
  applicants: JobApplication[],
  title: string = 'Candidate Recruitment Roster & Evaluation Report'
) {
  const printWindow = window.open('', '_blank', 'width=1100,height=850');
  if (!printWindow) {
    alert('Please allow pop-ups for this website to generate the PDF report.');
    return;
  }

  const getStatusBadgeHtml = (status: JobApplication['status'] | string) => {
    const norm = normalizeApplicantStatus(status);
    switch (norm) {
      case 'accepted': return '<span style="background:#d1fae5;color:#065f46;border:1px solid #10b981;padding:2px 8px;border-radius:12px;font-weight:bold;font-size:10px;">HIRED / ACCEPTED</span>';
      case 'shortlisted': return '<span style="background:#dbeafe;color:#1e40af;border:1px solid #3b82f6;padding:2px 8px;border-radius:12px;font-weight:bold;font-size:10px;">SHORTLISTED</span>';
      case 'interview': return '<span style="background:#f3e8ff;color:#6b21a8;border:1px solid #a855f7;padding:2px 8px;border-radius:12px;font-weight:bold;font-size:10px;">INTERVIEW</span>';
      case 'not_shortlisted': return '<span style="background:#ffe4e6;color:#9f1239;border:1px solid #f43f5e;padding:2px 8px;border-radius:12px;font-weight:bold;font-size:10px;">NOT SHORTLISTED</span>';
      case 'waitlisted': return '<span style="background:#ccfbf1;color:#115e59;border:1px solid #14b8a6;padding:2px 8px;border-radius:12px;font-weight:bold;font-size:10px;">WAITLISTED</span>';
      case 'rejected': return '<span style="background:#fee2e2;color:#991b1b;border:1px solid #ef4444;padding:2px 8px;border-radius:12px;font-weight:bold;font-size:10px;">REJECTED</span>';
      default: return '<span style="background:#fef3c7;color:#92400e;border:1px solid #f59e0b;padding:2px 8px;border-radius:12px;font-weight:bold;font-size:10px;">PENDING REVIEW</span>';
    }
  };

  const statusCounts = applicants.reduce((acc, app) => {
    const st = normalizeApplicantStatus(app.status);
    acc[st] = (acc[st] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${SACCO_INFO.name} - ${title}</title>
  <style>
    @page {
      size: A4 landscape;
      margin: 12mm 10mm;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
      color: #0f172a;
      background: #ffffff;
      margin: 0;
      padding: 20px;
      font-size: 11px;
    }
    .header-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #065f46;
      padding-bottom: 12px;
      margin-bottom: 15px;
    }
    .sacco-title {
      font-size: 18px;
      font-weight: 900;
      color: #065f46;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .sacco-sub {
      font-size: 11px;
      color: #475569;
      margin-top: 3px;
    }
    .report-meta {
      text-align: right;
      font-size: 10px;
      color: #64748b;
    }
    .stats-bar {
      display: flex;
      gap: 12px;
      margin-bottom: 15px;
      flex-wrap: wrap;
    }
    .stat-pill {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 6px 12px;
      font-size: 11px;
    }
    .stat-pill strong {
      color: #065f46;
      font-size: 12px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
      page-break-inside: auto;
    }
    tr {
      page-break-inside: avoid;
      page-break-after: auto;
    }
    th {
      background-color: #065f46;
      color: #ffffff;
      font-weight: bold;
      text-align: left;
      padding: 8px 6px;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border: 1px solid #065f46;
    }
    td {
      padding: 7px 6px;
      border: 1px solid #e2e8f0;
      font-size: 10.5px;
      vertical-align: top;
    }
    tbody tr:nth-child(even) {
      background-color: #f8fafc;
    }
    .sign-section {
      margin-top: 30px;
      display: flex;
      justify-content: space-between;
      page-break-inside: avoid;
    }
    .sign-box {
      width: 28%;
      border-top: 1px dashed #64748b;
      padding-top: 8px;
      text-align: center;
      font-size: 10px;
      color: #334155;
    }
    .print-btn-bar {
      margin-bottom: 15px;
      display: flex;
      gap: 10px;
    }
    .btn {
      background: #065f46;
      color: #ffffff;
      border: none;
      padding: 8px 16px;
      font-size: 12px;
      font-weight: bold;
      border-radius: 6px;
      cursor: pointer;
    }
    .btn-secondary {
      background: #475569;
    }
    @media print {
      .print-btn-bar {
        display: none;
      }
      body {
        padding: 0;
      }
    }
  </style>
</head>
<body>
  <div class="print-btn-bar">
    <button class="btn" onclick="window.print()">🖨️ Save as PDF / Print Report</button>
    <button class="btn btn-secondary" onclick="window.close()">Close</button>
  </div>

  <div class="header-bar">
    <div>
      <div class="sacco-title">${SACCO_INFO.name}</div>
      <div class="sacco-sub">${title} · Official Deliberation &amp; Recruitment Roster</div>
      <div class="sacco-sub">${SACCO_INFO.address.headOffice} · Phone: ${SACCO_INFO.phone} · Email: ${SACCO_INFO.email}</div>
    </div>
    <div class="report-meta">
      <div><strong>Date Generated:</strong> ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
      <div><strong>Total Candidates:</strong> ${applicants.length}</div>
      <div><strong>Status:</strong> Official Confidential HR Record</div>
    </div>
  </div>

  <div class="stats-bar">
    <div class="stat-pill">Total: <strong>${applicants.length}</strong></div>
    <div class="stat-pill">Shortlisted: <strong>${statusCounts['shortlisted'] || 0}</strong></div>
    <div class="stat-pill">Pending: <strong>${statusCounts['pending'] || 0}</strong></div>
    <div class="stat-pill">Interview: <strong>${statusCounts['interview'] || 0}</strong></div>
    <div class="stat-pill">Hired: <strong>${statusCounts['accepted'] || 0}</strong></div>
    <div class="stat-pill">Not Shortlisted: <strong>${statusCounts['not_shortlisted'] || 0}</strong></div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width: 25px;">#</th>
        <th style="width: 140px;">Candidate &amp; NID</th>
        <th style="width: 130px;">Position Applied</th>
        <th style="width: 120px;">Contact &amp; Sector</th>
        <th style="width: 140px;">Qualifications</th>
        <th style="width: 100px;">Status</th>
        <th style="width: 60px;">Date</th>
        <th>Committee Remarks &amp; Deliberation</th>
      </tr>
    </thead>
    <tbody>
      ${applicants.map((app, idx) => `
        <tr>
          <td align="center">${idx + 1}</td>
          <td>
            <strong>${app.fullName}</strong><br/>
            <span style="font-family: monospace; font-size: 9px; color: #047857; font-weight: bold;">Ref: ${app.referenceNumber || app.id}</span><br/>
            <span style="font-family: monospace; font-size: 9.5px; color: #475569;">ID: ${app.nationalId}</span>
            ${app.verified ? '<br/><span style="color:#059669; font-size: 9px; font-weight: bold;">✓ Verified NID</span>' : ''}
          </td>
          <td>
            <strong>${app.jobTitle}</strong>
          </td>
          <td>
            ${app.phone}<br/>
            <span style="font-size: 9.5px; color: #64748b;">${app.email}</span><br/>
            <span style="font-size: 9px; color: #065f46; font-weight: bold;">Sector: ${app.residenceSector || 'Gakenke'}</span>
          </td>
          <td>
            ${app.educationLevel || 'N/A'}<br/>
            <span style="font-size: 9.5px; color: #475569;">Exp: <strong>${app.yearsExperience ?? 0} yrs</strong></span>
          </td>
          <td align="center">
            ${getStatusBadgeHtml(app.status)}
          </td>
          <td align="center" style="font-size: 9.5px; color: #64748b;">
            ${app.appliedDate}
          </td>
          <td>
            ${app.comment || app.notes ? `<div style="font-style: italic; color: #334155;">&ldquo;${app.comment || app.notes}&rdquo;</div>` : '<span style="color:#94a3b8;">No remarks recorded</span>'}
            ${app.coverLetter ? `<div style="margin-top: 4px; font-size: 9px; color: #64748b;"><strong>Note:</strong> ${app.coverLetter.substring(0, 140)}${app.coverLetter.length > 140 ? '...' : ''}</div>` : ''}
          </td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="sign-section">
    <div class="sign-box">
      <strong>Recruitment / HR Officer</strong><br/>
      Signature &amp; Date
    </div>
    <div class="sign-box">
      <strong>Director of Admin &amp; Finance (DAF)</strong><br/>
      Signature &amp; Date
    </div>
    <div class="sign-box">
      <strong>Managing Director (MD)</strong><br/>
      Approval Signature &amp; Stamp
    </div>
  </div>
</body>
</html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();

  // Trigger print after resources settle
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
  }, 350);
}

/**
 * Validates a Rwandan National Identification Number (16 numeric digits starting with 1).
 */
export function validateRwandaNID(nid: string): {
  isValid: boolean;
  message: string;
  yearOfBirth?: number;
  gender?: 'Male' | 'Female';
} {
  const cleanNid = nid.replace(/\s+/g, '');

  if (!/^\d{16}$/.test(cleanNid)) {
    return {
      isValid: false,
      message: 'Rwandan National ID must be exactly 16 numeric digits.',
    };
  }

  if (cleanNid[0] !== '1') {
    return {
      isValid: false,
      message: 'Rwandan National ID must begin with digit 1.',
    };
  }

  const yearStr = cleanNid.substring(1, 5);
  const year = parseInt(yearStr, 10);
  const currentYear = new Date().getFullYear();

  if (isNaN(year) || year < 1920 || year > currentYear - 16) {
    return {
      isValid: false,
      message: `Invalid birth year in NID (${yearStr}). Candidate must be at least 16 years old.`,
    };
  }

  const genderDigit = cleanNid[5];
  let gender: 'Male' | 'Female' | undefined;
  if (genderDigit === '8') {
    gender = 'Male';
  } else if (genderDigit === '7') {
    gender = 'Female';
  }

  return {
    isValid: true,
    message: `Valid Rwandan National ID (${gender || 'Citizen'}, Born ${year})`,
    yearOfBirth: year,
    gender,
  };
}
