import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type Status = 'pending' | 'approved' | 'rejected';

export interface Member {
  id: string;
  name: string;
  email: string;
  type: 'Permanent' | 'Contract' | 'Others';
  status: 'Active' | 'Inactive';
  joinDate: string;
}

export interface Loan {
  id: string;
  memberId: string;
  memberName: string;
  amount: number;
  purpose: string;
  status: Status;
  date: string;
}

export interface Saving {
  id: string;
  memberId: string;
  memberName: string;
  amount: number;
  type: 'Mandatory' | 'Voluntary' | 'Principal';
  date: string;
}

declare global {
  interface Window {
    snap: any;
  }
}
