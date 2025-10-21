import AsyncStorage from '@react-native-async-storage/async-storage';
import { Contact, Ministry, Memo, MemoAction, MemoStatus, Prayer } from '../types';

const STORAGE_KEYS = {
  CONTACTS: 'contacts',
  MINISTRIES: 'ministries',
  MEMOS: 'memos',
  ACTIONS: 'actions',
  PRAYERS: 'prayers',
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
          id: Date.now().toString(),
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

  // Prayers
  static async getPrayers(memoId?: string): Promise<Prayer[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.PRAYERS);
      const prayers: Prayer[] = data ? JSON.parse(data) : [];
      return memoId ? prayers.filter(p => p.memoId === memoId) : prayers;
    } catch (error) {
      console.error('Error loading prayers:', error);
      return [];
    }
  }

  static async savePrayers(prayers: Prayer[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.PRAYERS, JSON.stringify(prayers));
  }

  static async updatePrayerStatus(prayerId: string, status: 'pending' | 'approved' | 'rejected'): Promise<void> {
    try {
      const prayers = await this.getPrayers();
      const updatedPrayers = prayers.map(prayer => 
        prayer.id === prayerId ? { ...prayer, status } : prayer
      );
      await this.savePrayers(updatedPrayers);
    } catch (error) {
      console.error('Error updating prayer status:', error);
      throw error;
    }
  }

  // Clear all data and reinitialize
  static async clearAndReinitialize(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.CONTACTS,
        STORAGE_KEYS.MINISTRIES,
        STORAGE_KEYS.MEMOS,
        STORAGE_KEYS.ACTIONS,
        STORAGE_KEYS.PRAYERS,
      ]);
      await this.initializeSampleData();
    } catch (error) {
      console.error('Error clearing and reinitializing data:', error);
      throw error;
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

    const prayers: Prayer[] = [
      {
        id: 'p1',
        memoId: '1',
        title: 'Classroom Construction',
        description: 'Construction of 10 new classrooms in rural schools',
        status: 'pending',
        amount: 5000000,
        category: 'Infrastructure',
      },
      {
        id: 'p2',
        memoId: '1',
        title: 'Teacher Training Program',
        description: 'Professional development training for 50 teachers',
        status: 'pending',
        amount: 2000000,
        category: 'Education',
      },
      {
        id: 'p3',
        memoId: '2',
        title: 'Medical Equipment Purchase',
        description: 'Purchase of modern medical equipment for state hospitals',
        status: 'pending',
        amount: 15000000,
        category: 'Healthcare',
      },
      {
        id: 'p4',
        memoId: '2',
        title: 'Ambulance Fleet',
        description: 'Purchase of 5 new ambulances for emergency services',
        status: 'pending',
        amount: 8000000,
        category: 'Healthcare',
      },
      {
        id: 'p5',
        memoId: 'm1',
        title: 'School Feeding Program',
        description: 'Daily meal program for 10,000 students',
        status: 'pending',
        amount: 12000000,
        category: 'Education',
      },
      {
        id: 'p6',
        memoId: 'm1',
        title: 'Textbook Distribution',
        description: 'Free textbook distribution to all public schools',
        status: 'pending',
        amount: 3000000,
        category: 'Education',
      },
      {
        id: 'p7',
        memoId: '5',
        title: 'Highway Construction Phase 1',
        description: 'Construction of 50km highway section connecting major cities',
        status: 'pending',
        amount: 25000000,
        category: 'Infrastructure',
      },
      {
        id: 'p8',
        memoId: '5',
        title: 'Bridge Construction',
        description: 'Construction of 3 major bridges along the highway route',
        status: 'pending',
        amount: 15000000,
        category: 'Infrastructure',
      },
      {
        id: 'p9',
        memoId: '5',
        title: 'Land Acquisition',
        description: 'Compensation for land acquisition along the highway route',
        status: 'pending',
        amount: 8000000,
        category: 'Land',
      },
      // Prayers for memo ID 3
      {
        id: 'p10',
        memoId: '3',
        title: 'Textbook Printing',
        description: 'Printing of 100,000 textbooks for distribution',
        status: 'pending',
        amount: 4000000,
        category: 'Education',
      },
      {
        id: 'p11',
        memoId: '3',
        title: 'Teacher Salaries',
        description: 'Payment of outstanding teacher salaries',
        status: 'pending',
        amount: 6000000,
        category: 'Education',
      },
      // Prayers for memo ID 4
      {
        id: 'p12',
        memoId: '4',
        title: 'Medical Supplies',
        description: 'Procurement of essential medical supplies',
        status: 'pending',
        amount: 3000000,
        category: 'Healthcare',
      },
      {
        id: 'p13',
        memoId: '4',
        title: 'Hospital Renovation',
        description: 'Renovation of 5 state hospitals',
        status: 'pending',
        amount: 12000000,
        category: 'Healthcare',
      },
      // Prayers for memo ID 6
      {
        id: 'p14',
        memoId: '6',
        title: 'Bridge Maintenance',
        description: 'Maintenance of 3 major bridges',
        status: 'pending',
        amount: 5000000,
        category: 'Infrastructure',
      },
      {
        id: 'p15',
        memoId: '6',
        title: 'Road Repairs',
        description: 'Repair of damaged road sections',
        status: 'pending',
        amount: 8000000,
        category: 'Infrastructure',
      },
      // Prayers for memo ID m2
      {
        id: 'p16',
        memoId: 'm2',
        title: 'Health Equipment',
        description: 'Purchase of diagnostic equipment for health centers',
        status: 'pending',
        amount: 7000000,
        category: 'Healthcare',
      },
      {
        id: 'p17',
        memoId: 'm2',
        title: 'Vaccination Program',
        description: 'Mass vaccination program for children',
        status: 'pending',
        amount: 4000000,
        category: 'Healthcare',
      },
      // Prayers for memo ID m3
      {
        id: 'p18',
        memoId: 'm3',
        title: 'Water Project',
        description: 'Construction of water treatment plant',
        status: 'pending',
        amount: 20000000,
        category: 'Infrastructure',
      },
      {
        id: 'p19',
        memoId: 'm3',
        title: 'Road Network',
        description: 'Construction of rural road network',
        status: 'pending',
        amount: 15000000,
        category: 'Infrastructure',
      },
      // Prayers for memo ID m4
      {
        id: 'p20',
        memoId: 'm4',
        title: 'Fertilizer Distribution',
        description: 'Distribution of subsidized fertilizers to farmers',
        status: 'pending',
        amount: 10000000,
        category: 'Agriculture',
      },
      {
        id: 'p21',
        memoId: 'm4',
        title: 'Farm Equipment',
        description: 'Procurement of modern farming equipment',
        status: 'pending',
        amount: 8000000,
        category: 'Agriculture',
      },
      // Prayers for memo ID m5
      {
        id: 'p22',
        memoId: 'm5',
        title: 'Budget Allocation',
        description: 'Additional budget allocation for ministries',
        status: 'pending',
        amount: 50000000,
        category: 'Finance',
      },
      {
        id: 'p23',
        memoId: 'm5',
        title: 'Revenue Generation',
        description: 'Program to increase state revenue',
        status: 'pending',
        amount: 20000000,
        category: 'Finance',
      },
    ];

    await this.saveContacts(contacts);
    await this.saveMinistries(ministries);
    await AsyncStorage.setItem(STORAGE_KEYS.MEMOS, JSON.stringify(memos));
    await this.savePrayers(prayers);
  }
}
