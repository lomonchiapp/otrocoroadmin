import { query, where, orderBy, getDocs, collection } from 'firebase/firestore'
import { BaseService } from './base'
import { db } from '@/lib/firebase'
import type { Popup, CreatePopupInput, UpdatePopupInput, Lead } from '@/types/ads'

class AdService extends BaseService<Popup> {
  private leadsCollectionName = 'leads'

  constructor() {
    super('popups')
  }

  protected mapDocumentData(data: any): Popup {
    return {
      ...data,
      id: data.id,
      createdAt: this.toDate(data.createdAt),
      updatedAt: this.toDate(data.updatedAt),
      startDate: data.startDate ? this.toDate(data.startDate) : undefined,
      endDate: data.endDate ? this.toDate(data.endDate) : undefined,
    } as Popup
  }

  async createPopup(data: CreatePopupInput, createdBy: string): Promise<string> {
    const popup: Omit<Popup, 'id'> = {
      ...data,
      showOnPages: data.showOnPages || [],
      hideOnPages: data.hideOnPages || [],
      views: 0,
      clicks: 0,
      conversions: 0,
      createdBy,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    return await this.create(popup)
  }

  async updatePopup(data: UpdatePopupInput): Promise<void> {
    const { id, ...updateData } = data
    await this.update(id, updateData)
  }

  // LEADS

  async getLeads(storeId?: string): Promise<Lead[]> {
    try {
      let q = query(collection(db, this.leadsCollectionName), orderBy('createdAt', 'desc'))
      
      if (storeId) {
        q = query(q, where('storeId', '==', storeId))
      }

      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date()
        } as Lead
      })
    } catch (error) {
      console.error('Error getting leads:', error)
      return []
    }
  }
}

export const adService = new AdService()
