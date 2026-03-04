import { Member, Loan, Saving } from './types';

export const MOCK_MEMBERS: Member[] = [
  { id: 'MEM-001', name: 'Budi Santoso', email: 'budi@example.com', type: 'Permanent', status: 'Active', joinDate: '2023-01-15' },
  { id: 'MEM-002', name: 'Siti Aminah', email: 'siti@example.com', type: 'Contract', status: 'Active', joinDate: '2023-05-20' },
  { id: 'MEM-003', name: 'Agus Setiawan', email: 'agus@example.com', type: 'Permanent', status: 'Active', joinDate: '2022-11-10' },
];

export const MOCK_LOANS: Loan[] = [
  { id: 'L-001', memberId: 'MEM-001', memberName: 'Budi Santoso', amount: 5000000, purpose: 'Renovasi Rumah', status: 'approved', date: '2024-02-01' },
  { id: 'L-002', memberId: 'MEM-002', memberName: 'Siti Aminah', amount: 2000000, purpose: 'Biaya Sekolah', status: 'pending', date: '2024-03-01' },
  { id: 'L-003', memberId: 'MEM-003', memberName: 'Agus Setiawan', amount: 10000000, purpose: 'Modal Usaha', status: 'rejected', date: '2024-01-15' },
];

export const MOCK_SAVINGS: Saving[] = [
  { id: 'S-001', memberId: 'MEM-001', memberName: 'Budi Santoso', amount: 100000, type: 'Mandatory', date: '2024-02-28' },
  { id: 'S-002', memberId: 'MEM-002', memberName: 'Siti Aminah', amount: 50000, type: 'Voluntary', date: '2024-03-01' },
];
