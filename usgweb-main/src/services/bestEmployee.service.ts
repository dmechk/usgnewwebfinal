import { EmployeeOfTheYear } from '../types';

const API_BASE = '/api/best-employee';

export const fetchBestEmployees = async (): Promise<EmployeeOfTheYear[]> => {
  const res = await fetch(API_BASE);
  if (!res.ok) throw new Error('Failed to fetch best employees');
  return res.json();
};

export const createBestEmployee = async (employee: Omit<EmployeeOfTheYear, '_id'>): Promise<EmployeeOfTheYear> => {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(employee),
  });
  if (!res.ok) throw new Error('Failed to create best employee');
  return res.json();
};

export const updateBestEmployee = async (id: string, employee: Partial<EmployeeOfTheYear>): Promise<EmployeeOfTheYear> => {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(employee),
  });
  if (!res.ok) throw new Error('Failed to update best employee');
  return res.json();
};

export const deleteBestEmployee = async (id: string): Promise<void> => {
  const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete best employee');
};