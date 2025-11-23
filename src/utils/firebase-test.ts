// Utilidad para probar la conexión a Firebase
import { db } from '@/lib/firebase'
import { collection, addDoc, getDocs } from 'firebase/firestore'

export const testFirebaseConnection = async () => {
  try {
    console.log('🧪 Testing Firebase connection...')
    
    // Probar lectura de la colección categories
    const categoriesRef = collection(db, 'categories')
    const snapshot = await getDocs(categoriesRef)
    
    console.log('✅ Firebase connection successful!')
    console.log('📊 Categories collection exists with', snapshot.size, 'documents')
    
    // Mostrar los primeros documentos
    if (snapshot.size > 0) {
      console.log('📋 Existing categories:')
      snapshot.forEach((doc) => {
        console.log(`  - ${doc.id}:`, doc.data())
      })
    } else {
      console.log('📋 No categories found in collection')
    }
    
    return true
  } catch (error) {
    console.error('❌ Firebase connection failed:', error)
    console.error('❌ Error details:', {
      code: error.code,
      message: error.message,
      stack: error.stack
    })
    return false
  }
}

export const testCreateCategory = async () => {
  try {
    console.log('🧪 Testing category creation...')
    
    const testCategory = {
      name: 'Test Category',
      storeId: 'test-store',
      level: 1,
      parentId: undefined,
      description: 'Test category for debugging',
      isActive: true,
      sortOrder: 1,
      seoTitle: 'Test Category',
      seoDescription: 'Test category for debugging',
      imageUrl: '',
      icon: 'folder',
      color: '#ff0000',
      productCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    const docRef = await addDoc(collection(db, 'categories'), testCategory)
    
    console.log('✅ Test category created successfully!')
    console.log('📄 Document ID:', docRef.id)
    console.log('📄 Document path:', `categories/${docRef.id}`)
    
    return docRef.id
  } catch (error) {
    console.error('❌ Test category creation failed:', error)
    console.error('❌ Error details:', {
      code: error.code,
      message: error.message,
      stack: error.stack
    })
    return null
  }
}

















