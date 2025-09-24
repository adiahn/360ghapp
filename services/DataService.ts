import AsyncStorage from '@react-native-async-storage/async-storage';
import { Contact, Memo, MemoAction, MemoStatus } from '../types';

const STORAGE_KEYS = {
  CONTACTS: 'contacts',
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
        name: 'Dr. Ibrahim Musa',
        title: 'Permanent Secretary',
        unreadCount: 3,
      },
      {
        id: '2',
        name: 'Alhaji Aminu Sani',
        title: 'Chief of Staff',
        unreadCount: 1,
      },
      {
        id: '3',
        name: 'Hajiya Fatima Abdullahi',
        title: 'Cabinet Secretary',
        unreadCount: 2,
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
    ];

    await this.saveContacts(contacts);
    await AsyncStorage.setItem(STORAGE_KEYS.MEMOS, JSON.stringify(memos));
  }
}
