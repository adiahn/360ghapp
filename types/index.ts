export interface Contact {
  id: string;
  name: string;
  title: string;
  lastMemo?: Memo;
  unreadCount: number;
  avatar?: string;
}

export interface Ministry {
  id: string;
  name: string;
  description: string;
  lastMemo?: Memo;
  unreadCount: number;
  avatar?: string;
}

export interface Memo {
  id: string;
  contactId: string;
  title: string;
  content: string;
  date: Date;
  status: MemoStatus;
  priority: MemoPriority;
  attachments?: string[];
}

export type MemoStatus = 'pending' | 'approved' | 'rejected' | 'request_details' | 'archived';

export type MemoPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface User {
  id: string;
  name: string;
  role: string;
  department: string;
}

export interface MemoAction {
  memoId: string;
  action: MemoStatus;
  comment?: string;
  timestamp: Date;
}
