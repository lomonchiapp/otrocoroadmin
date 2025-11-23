// Script para actualizar los IDs de las stores con los nombres correctos
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, setDoc, doc, getDocs, writeBatch, query, where } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyACevrWjfjPKsPrNYRWtWHOLOLNx9PwJRs",
  authDomain: "otrocorofashion-42f9b.firebaseapp.com",
  projectId: "otrocorofashion-42f9b",
  storageBucket: "otrocorofashion-42f9b.firebasestorage.app",
  messagingSenderId: "600388187700",
  appId: "1:600388187700:web:842809593872a936a67c61"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function updateStoreIds() {
  console.log('🔄 Actualizando IDs de stores...\n');
  
  try {
    // 1. Crear/actualizar las stores con los IDs correctos
    console.log('1️⃣ Creando stores con IDs correctos...');
    
    const fashionStore = {
      id: 'otrocorofashion',
      name: 'OtroCoro Fashion',
      type: 'fashion',
      description: 'Tienda de moda y ropa',
      primaryColor: '#3b82f6',
      secondaryColor: '#8b5cf6',
      logo: '',
      banner: '',
      isActive: true,
      settings: {
        currency: 'COP',
        timezone: 'America/Bogota',
        language: 'es',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '24h',
      },
      address: {
        street: '',
        city: 'Bogotá',
        state: 'Cundinamarca',
        country: 'Colombia',
        postalCode: '',
      },
      contact: {
        email: 'fashion@otrocoro.com',
        phone: '',
        website: 'https://otrocorofashion.com',
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const jewelryStore = {
      id: 'otrocorooro',
      name: 'OtroCoro Oro (Joyería)',
      type: 'jewelry',
      description: 'Tienda de joyería y accesorios de oro',
      primaryColor: '#f59e0b',
      secondaryColor: '#d97706',
      logo: '',
      banner: '',
      isActive: true,
      settings: {
        currency: 'COP',
        timezone: 'America/Bogota',
        language: 'es',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '24h',
      },
      address: {
        street: '',
        city: 'Bogotá',
        state: 'Cundinamarca',
        country: 'Colombia',
        postalCode: '',
      },
      contact: {
        email: 'oro@otrocoro.com',
        phone: '',
        website: 'https://otrocorooro.com',
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await setDoc(doc(db, 'stores', 'otrocorofashion'), fashionStore);
    console.log('✅ Store creada: otrocorofashion (Fashion)');
    
    await setDoc(doc(db, 'stores', 'otrocorooro'), jewelryStore);
    console.log('✅ Store creada: otrocorooro (Joyería)');
    
    // 2. Actualizar productos existentes
    console.log('\n2️⃣ Actualizando storeId en productos...');
    const productsSnapshot = await getDocs(collection(db, 'products'));
    
    if (productsSnapshot.size > 0) {
      const batch = writeBatch(db);
      let updated = 0;
      
      productsSnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        // Actualizar productos con store-fashion-001 a otrocorofashion
        if (data.storeId === 'store-fashion-001' || data.type === 'clothing') {
          batch.update(docSnapshot.ref, { storeId: 'otrocorofashion' });
          updated++;
        }
        // Actualizar productos con store-jewelry-001 a otrocorooro
        else if (data.storeId === 'store-jewelry-001' || data.type === 'jewelry') {
          batch.update(docSnapshot.ref, { storeId: 'otrocorooro' });
          updated++;
        }
      });
      
      if (updated > 0) {
        await batch.commit();
        console.log(`✅ ${updated} productos actualizados con nuevos storeIds`);
      } else {
        console.log('ℹ️ No hay productos que actualizar');
      }
    }
    
    // 3. Verificar resultado
    console.log('\n3️⃣ Verificando resultado...');
    const fashionProducts = await getDocs(query(
      collection(db, 'products'),
      where('storeId', '==', 'otrocorofashion')
    ));
    console.log(`✅ Productos en otrocorofashion: ${fashionProducts.size}`);
    
    const jewelryProducts = await getDocs(query(
      collection(db, 'products'),
      where('storeId', '==', 'otrocorooro')
    ));
    console.log(`✅ Productos en otrocorooro: ${jewelryProducts.size}`);
    
    console.log('\n🎉 Actualización completada!');
    console.log('\n📋 Stores disponibles:');
    console.log('  - otrocorofashion (Moda)');
    console.log('  - otrocorooro (Joyería)');
    console.log('\nAhora recarga la aplicación y verás los productos correctamente.');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
  
  process.exit(0);
}

updateStoreIds().catch(console.error);
















