import { JobApplication } from '../types';

/**
 * Exports an array of JobApplication records into an Excel-compatible CSV file with UTF-8 BOM.
 */
export function exportApplicantsToExcel(
  applicants: JobApplication[],
  fileName: string = 'UBUMWE_SACCO_GAKENKE_Job_Applicants_2026.csv'
) {
  const headers = [
    'Application ID',
    'Candidate Full Name',
    'National ID (16 digits)',
    'NID Verification Status',
    'Phone Number',
    'Email Address',
    'Position Applied',
    'Qualification Level',
    'Years of Experience',
    'Residence Sector (Gakenke)',
    'Application Status',
    'Review Rating (1-5)',
    'Applied Date',
    'Feedback Email Sent',
    'Last Feedback Date',
    'Admin Review Notes',
    'Motivation Statement',
  ];

  const escapeCSV = (value: any): string => {
    if (value === null || value === undefined) return '""';
    const stringVal = String(value).replace(/"/g, '""');
    return `"${stringVal}"`;
  };

  const rows = applicants.map((app) => [
    escapeCSV(app.id),
    escapeCSV(app.fullName),
    escapeCSV(app.nationalId),
    escapeCSV(app.verified ? 'VERIFIED' : 'Pending Verification'),
    escapeCSV(app.phone),
    escapeCSV(app.email),
    escapeCSV(app.jobTitle),
    escapeCSV(app.educationLevel),
    escapeCSV(app.yearsExperience),
    escapeCSV(app.residenceSector),
    escapeCSV(app.status.toUpperCase()),
    escapeCSV(app.rating ? `${app.rating} / 5` : 'Not Rated'),
    escapeCSV(app.appliedDate),
    escapeCSV(app.emailFeedbackSent ? 'YES' : 'NO'),
    escapeCSV(app.lastFeedbackDate || 'N/A'),
    escapeCSV(app.notes || ''),
    escapeCSV(app.coverLetter || ''),
  ]);

  const csvContent =
    '\uFEFF' +
    [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
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
