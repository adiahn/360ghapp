import AsyncStorage from '@react-native-async-storage/async-storage';
import { Contact, Ministry, Memo, MemoAction, MemoStatus } from '../types';

const STORAGE_KEYS = {
  CONTACTS: 'contacts',
  MINISTRIES: 'ministries',
  MEMOS: 'memos',
  ACTIONS: 'actions',
};

export class DataService {
  // Contacts
  static async getContacts(): Promise<Contact[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.CONTACTS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting contacts:', error);
      return [];
    }
  }

  static async saveContacts(contacts: Contact[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(contacts));
    } catch (error) {
      console.error('Error saving contacts:', error);
    }
  }

  // Ministries
  static async getMinistries(): Promise<Ministry[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.MINISTRIES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting ministries:', error);
      return [];
    }
  }

  static async saveMinistries(ministries: Ministry[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.MINISTRIES, JSON.stringify(ministries));
    } catch (error) {
      console.error('Error saving ministries:', error);
    }
  }

  // Memos
  static async getMemos(contactId?: string): Promise<Memo[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.MEMOS);
      const memos: Memo[] = data ? JSON.parse(data) : [];
      
      if (contactId) {
        return memos.filter(memo => memo.contactId === contactId);
      }
      
      return memos;
    } catch (error) {
      console.error('Error getting memos:', error);
      return [];
    }
  }

  static async saveMemo(memo: Memo): Promise<void> {
    try {
      const memos = await this.getMemos();
      const existingIndex = memos.findIndex(m => m.id === memo.id);
      
      if (existingIndex >= 0) {
        memos[existingIndex] = memo;
      } else {
        memos.push(memo);
      }
      
      await AsyncStorage.setItem(STORAGE_KEYS.MEMOS, JSON.stringify(memos));
    } catch (error) {
      console.error('Error saving memo:', error);
    }
  }

  // Actions
  static async getActions(): Promise<MemoAction[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.ACTIONS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting actions:', error);
      return [];
    }
  }

  static async saveAction(action: MemoAction): Promise<void> {
    try {
      const actions = await this.getActions();
      actions.push(action);
      await AsyncStorage.setItem(STORAGE_KEYS.ACTIONS, JSON.stringify(actions));
    } catch (error) {
      console.error('Error saving action:', error);
    }
  }

  // Update memo status
  static async updateMemoStatus(memoId: string, status: MemoStatus, comment?: string): Promise<void> {
    try {
      const memos = await this.getMemos();
      const memoIndex = memos.findIndex(m => m.id === memoId);
      
      if (memoIndex >= 0) {
        memos[memoIndex].status = status;
        await this.saveMemo(memos[memoIndex]);
        
        // Save the action
        const action: MemoAction = {
          memoId,
          action: status,
          comment,
          timestamp: new Date(),
        };
        await this.saveAction(action);
      }
    } catch (error) {
      console.error('Error updating memo status:', error);
    }
  }

  // Initialize sample data
  static async initializeSampleData(): Promise<void> {
    const contacts: Contact[] = [
      {
        id: '1',
        name: 'Principal Private Secretary',
        title: 'Principal Private Secretary',
        unreadCount: 3,
      },
      {
        id: '2',
        name: 'Chief of Staff',
        title: 'Chief of Staff',
        unreadCount: 1,
      },
      {
        id: '3',
        name: 'Cabinet Secretary',
        title: 'Cabinet Secretary',
        unreadCount: 2,
      },
    ];

    const ministries: Ministry[] = [
      {
        id: 'm1',
        name: 'Ministry of Education',
        description: 'Education and Human Development',
        unreadCount: 5,
      },
      {
        id: 'm2',
        name: 'Ministry of Health',
        description: 'Health and Social Services',
        unreadCount: 3,
      },
      {
        id: 'm3',
        name: 'Ministry of Works',
        description: 'Infrastructure and Public Works',
        unreadCount: 2,
      },
      {
        id: 'm4',
        name: 'Ministry of Agriculture',
        description: 'Agriculture and Rural Development',
        unreadCount: 4,
      },
      {
        id: 'm5',
        name: 'Ministry of Finance',
        description: 'Finance and Economic Planning',
        unreadCount: 1,
      },
    ];

    const memos: Memo[] = [
      {
        id: '1',
        contactId: '1',
        title: 'Request for School Infrastructure Funding',
        content: 'We need urgent funding for the construction of new classrooms in rural areas. The current facilities are inadequate for the growing student population.',
        date: new Date('2024-01-15'),
        status: 'pending',
        priority: 'high',
      },
      {
        id: '2',
        contactId: '1',
        title: 'Teacher Training Program Proposal',
        content: 'Proposal for a comprehensive teacher training program to improve education quality across the state.',
        date: new Date('2024-01-14'),
        status: 'approved',
        priority: 'medium',
      },
      {
        id: '3',
        contactId: '1',
        title: 'Textbook Distribution Update',
        content: 'Status update on the distribution of textbooks to all public schools in the state.',
        date: new Date('2024-01-13'),
        status: 'pending',
        priority: 'low',
      },
      {
        id: '4',
        contactId: '2',
        title: 'Hospital Equipment Procurement',
        content: 'Request for approval to procure essential medical equipment for state hospitals.',
        date: new Date('2024-01-16'),
        status: 'pending',
        priority: 'urgent',
      },
      {
        id: '5',
        contactId: '3',
        title: 'Road Construction Project',
        content: 'Proposal for the construction of a new highway connecting major cities in the state.',
        date: new Date('2024-01-12'),
        status: 'request_details',
        priority: 'high',
      },
      {
        id: '6',
        contactId: '3',
        title: 'Bridge Maintenance Report',
        content: 'Report on the maintenance work completed on the main bridge in the capital city.',
        date: new Date('2024-01-11'),
        status: 'approved',
        priority: 'medium',
      },
      // Ministry memos
      {
        id: 'm1',
        contactId: 'm1',
        title: 'Education Budget Allocation Request',
        content: 'Request for additional budget allocation for the education sector to improve school facilities and teacher welfare.',
        date: new Date('2024-01-17'),
        status: 'pending',
        priority: 'high',
      },
      {
        id: 'm2',
        contactId: 'm1',
        title: 'School Feeding Program Update',
        content: 'Status report on the school feeding program implementation across the state.',
        date: new Date('2024-01-16'),
        status: 'approved',
        priority: 'medium',
      },
      {
        id: 'm3',
        contactId: 'm2',
        title: 'Medical Equipment Procurement',
        content: 'Request for approval to procure medical equipment for state hospitals and health centers.',
        date: new Date('2024-01-18'),
        status: 'pending',
        priority: 'urgent',
      },
      {
        id: 'm4',
        contactId: 'm3',
        title: 'Road Construction Project Phase 2',
        content: 'Proposal for the second phase of the major road construction project.',
        date: new Date('2024-01-15'),
        status: 'request_details',
        priority: 'high',
      },
      {
        id: 'm5',
        contactId: 'm4',
        title: 'Agricultural Input Distribution',
        content: 'Report on the distribution of agricultural inputs to farmers across the state.',
        date: new Date('2024-01-14'),
        status: 'approved',
        priority: 'medium',
      },
    ];

    await this.saveContacts(contacts);
    await this.saveMinistries(ministries);
    await AsyncStorage.setItem(STORAGE_KEYS.MEMOS, JSON.stringify(memos));
  }
}
