
import { User, Video, Item, Order } from '../types';

const DB_NAME = 'SkillRootsDB';
const DB_VERSION = 2; // Incremented for schema change
const USERS_STORE = 'users';
const VIDEOS_STORE = 'videos';
const ITEMS_STORE = 'items';
const ORDERS_STORE = 'orders';

let dbInstance: IDBDatabase;

const INITIAL_VIDEOS: Video[] = [
    {
        id: 'vid_seed_1',
        userId: 'admin@skillroots.com',
        uploaderName: 'Lakshmi Narayan',
        title: 'The Art of Pattachitra Painting',
        description: 'Discover the intricate details of traditional scroll painting from Odisha. In this masterclass, we explore the preparation of the canvas using tamarind seeds and the application of natural colors.',
        thumbnailUrl: 'https://images.unsplash.com/photo-1582560475093-6f7332240962?q=80&w=1000&auto=format&fit=crop',
        videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        views: 3420,
        likes: 215
    },
    {
        id: 'vid_seed_2',
        userId: 'admin@skillroots.com',
        uploaderName: 'Karthik Weaver',
        title: 'Kanchipuram Silk Weaving Process',
        description: 'Watch the master weavers of Tamil Nadu create the queen of silks. Learn about the Korvai technique used to join the border to the body of the saree.',
        thumbnailUrl: 'https://images.unsplash.com/photo-1606744837616-56c9a5c6a6eb?q=80&w=1000&auto=format&fit=crop',
        videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        views: 5100,
        likes: 480
    },
    {
        id: 'vid_seed_3',
        userId: 'admin@skillroots.com',
        uploaderName: 'Rajesh Pottery',
        title: 'Jaipur Blue Pottery Masterclass',
        description: 'A step-by-step guide to the unique pottery style of Rajasthan which does not use clay. Learn how we prepare the dough using quartz stone powder, powdered glass, Multani Mitti, borax, and gum.',
        thumbnailUrl: 'https://images.unsplash.com/photo-1569388330292-79cc1ec67270?q=80&w=1000&auto=format&fit=crop',
        videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
        views: 2800,
        likes: 340
    },
    {
        id: 'vid_seed_4',
        userId: 'admin@skillroots.com',
        uploaderName: 'Tribal Arts Collective',
        title: 'Dhokra Metal Craft Casting',
        description: 'Witness the ancient lost-wax casting technique used by tribal artisans in Chhattisgarh to create timeless metal artifacts.',
        thumbnailUrl: 'https://images.unsplash.com/photo-1515488042361-25f06a12dc6e?q=80&w=1000&auto=format&fit=crop',
        videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
        views: 1950,
        likes: 180
    },
    {
        id: 'vid_seed_5',
        userId: 'admin@skillroots.com',
        uploaderName: 'Meera Textiles',
        title: 'Hand Block Printing of Bagru',
        description: 'Explore the traditional woodblock printing techniques of Bagru, Rajasthan. See how natural dyes and mud resists are used to create stunning patterns.',
        thumbnailUrl: 'https://images.unsplash.com/photo-1598462097728-3e414c2b9a11?q=80&w=1000&auto=format&fit=crop',
        videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        views: 4200,
        likes: 560
    },
    {
        id: 'vid_seed_6',
        userId: 'admin@skillroots.com',
        uploaderName: 'Savitri Devi',
        title: 'Warli Tribal Art for Beginners',
        description: 'A basic tutorial on the geometric tribal art form of Maharashtra. Learn to draw the iconic human figures and scenes from daily village life.',
        thumbnailUrl: 'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?q=80&w=1000&auto=format&fit=crop',
        videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        views: 1500,
        likes: 120
    }
];

const INITIAL_ITEMS: Item[] = [
    {
        id: 'item_seed_1',
        userId: 'admin@skillroots.com',
        sellerName: 'Lakshmi Narayan',
        name: 'Krishna Leela Pattachitra Scroll',
        description: 'Hand-painted Pattachitra scroll depicting scenes from Lord Krishna\'s life. Painted on treated cloth canvas using natural stone colors. Dimensions: 12x24 inches.',
        price: 2500,
        imageUrl: 'https://images.unsplash.com/photo-1582560475093-6f7332240962?q=80&w=1000&auto=format&fit=crop'
    },
    {
        id: 'item_seed_2',
        userId: 'admin@skillroots.com',
        sellerName: 'Karthik Weaver',
        name: 'Pure Kanchipuram Silk Saree',
        description: 'Authentic handwoven Kanchipuram silk saree in deep maroon with gold zari border. Comes with Silk Mark certification.',
        price: 12500,
        imageUrl: 'https://images.unsplash.com/photo-1610189012906-4783382c591d?q=80&w=1000&auto=format&fit=crop'
    },
    {
        id: 'item_seed_3',
        userId: 'admin@skillroots.com',
        sellerName: 'Rajesh Pottery',
        name: 'Blue Pottery Floral Vase',
        description: 'Handcrafted blue pottery vase with intricate floral motifs. 10 inches tall. Perfect for living room decor.',
        price: 850,
        imageUrl: 'https://images.unsplash.com/photo-1578749556935-ef887c46baf5?q=80&w=1000&auto=format&fit=crop'
    },
    {
        id: 'item_seed_4',
        userId: 'admin@skillroots.com',
        sellerName: 'Tribal Arts Collective',
        name: 'Dhokra Bull Figurine',
        description: 'Traditional brass Dhokra bull figurine crafted using the lost-wax technique. A rustic piece of tribal heritage.',
        price: 1800,
        imageUrl: 'https://images.unsplash.com/photo-1533158388470-9a56699990c6?q=80&w=1000&auto=format&fit=crop'
    },
     {
        id: 'item_seed_5',
        userId: 'admin@skillroots.com',
        sellerName: 'Meera Textiles',
        name: 'Bagru Print Cotton Bedspread',
        description: 'King size cotton bedspread featuring traditional Bagru hand block prints using natural vegetable dyes.',
        price: 1200,
        imageUrl: 'https://images.unsplash.com/photo-1522771772403-8058db30f64f?q=80&w=1000&auto=format&fit=crop'
    }
];

function getDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      return resolve(dbInstance);
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('Database error:', request.error);
      reject('Error opening database');
    };

    request.onsuccess = async () => {
      dbInstance = request.result;
      await seedDatabaseIfNeeded(dbInstance);
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      if (!db.objectStoreNames.contains(USERS_STORE)) {
        db.createObjectStore(USERS_STORE, { keyPath: 'email' });
      }
      
      if (!db.objectStoreNames.contains(VIDEOS_STORE)) {
        const videosStore = db.createObjectStore(VIDEOS_STORE, { keyPath: 'id' });
        videosStore.createIndex('by_userId', 'userId', { unique: false });
      }
      
      if (!db.objectStoreNames.contains(ITEMS_STORE)) {
        const itemsStore = db.createObjectStore(ITEMS_STORE, { keyPath: 'id' });
        itemsStore.createIndex('by_userId', 'userId', { unique: false });
      }

      if (!db.objectStoreNames.contains(ORDERS_STORE)) {
        const ordersStore = db.createObjectStore(ORDERS_STORE, { keyPath: 'id' });
        ordersStore.createIndex('by_userId', 'userId', { unique: false });
      }
    };
  });
}

async function seedDatabaseIfNeeded(db: IDBDatabase) {
    return new Promise<void>((resolve) => {
        const videoTransaction = db.transaction(VIDEOS_STORE, 'readonly');
        const videoStore = videoTransaction.objectStore(VIDEOS_STORE);
        const videoCountRequest = videoStore.count();

        videoCountRequest.onsuccess = () => {
            if (videoCountRequest.result === 0) {
                // Seed Videos
                const writeTx = db.transaction([VIDEOS_STORE, ITEMS_STORE], 'readwrite');
                const vStore = writeTx.objectStore(VIDEOS_STORE);
                INITIAL_VIDEOS.forEach(video => vStore.add(video));
                
                const iStore = writeTx.objectStore(ITEMS_STORE);
                INITIAL_ITEMS.forEach(item => iStore.add(item));
                
                writeTx.oncomplete = () => {
                    console.log("Database seeded with initial data.");
                    resolve();
                };
                writeTx.onerror = () => resolve(); 
            } else {
                resolve();
            }
        };
        videoCountRequest.onerror = () => resolve();
    });
}

async function performTransaction<T>(storeName: string, mode: IDBTransactionMode, operation: (store: IDBObjectStore) => IDBRequest): Promise<T> {
    const db = await getDB();
    return new Promise<T>((resolve, reject) => {
        const transaction = db.transaction(storeName, mode);
        const store = transaction.objectStore(storeName);
        
        transaction.onerror = () => {
            console.error('Transaction failed:', transaction.error ? transaction.error.message : 'Unknown error');
            reject(transaction.error);
        };

        const request = operation(store);
        
        request.onsuccess = () => resolve(request.result as T);
        request.onerror = () => {
             console.error('Request failed:', request.error ? request.error.message : 'Unknown error');
            reject(request.error);
        };
    });
}

export const db = {
  async registerUser(name: string, email: string): Promise<{ success: boolean; user?: User; error?: string }> {
    const lowerEmail = email.toLowerCase();
    const existingUser = await this.loginUser(lowerEmail);
    if (existingUser) {
        return { success: false, error: 'userExists' };
    }
    const newUser: User = { name, email: lowerEmail };
    await performTransaction(USERS_STORE, 'readwrite', store => store.add(newUser));
    return { success: true, user: newUser };
  },

  async loginUser(email: string): Promise<User | null> {
    const user = await performTransaction<User>(USERS_STORE, 'readonly', store => store.get(email.toLowerCase()));
    return user || null;
  },

  async addVideo(userId: string, uploaderName: string, title: string, description: string, thumbnailUrl: string, videoUrl: string): Promise<Video> {
    const newVideo: Video = {
      id: `vid_${new Date().getTime()}`,
      userId,
      uploaderName,
      title,
      description,
      thumbnailUrl,
      videoUrl,
      views: 0,
      likes: 0,
    };
    await performTransaction(VIDEOS_STORE, 'readwrite', store => store.add(newVideo));
    return newVideo;
  },
  
  async getAllVideos(): Promise<Video[]> {
    return await performTransaction<Video[]>(VIDEOS_STORE, 'readonly', store => store.getAll());
  },

  async getVideoById(videoId: string): Promise<Video | undefined> {
      return await performTransaction<Video | undefined>(VIDEOS_STORE, 'readonly', store => store.get(videoId));
  },

  async incrementViewCount(videoId: string): Promise<void> {
      const db = await getDB();
      return new Promise((resolve, reject) => {
          const transaction = db.transaction(VIDEOS_STORE, 'readwrite');
          const store = transaction.objectStore(VIDEOS_STORE);
          const request = store.get(videoId);
          
          request.onerror = () => reject(request.error);
          request.onsuccess = () => {
              const video = request.result;
              if (video) {
                  video.views += 1;
                  const updateRequest = store.put(video);
                  updateRequest.onerror = () => reject(updateRequest.error);
              }
          };

          transaction.oncomplete = () => resolve();
          transaction.onerror = () => reject(transaction.error);
      });
  },

  async likeVideo(videoId: string): Promise<void> {
    const db = await getDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(VIDEOS_STORE, 'readwrite');
        const store = transaction.objectStore(VIDEOS_STORE);
        const request = store.get(videoId);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            const video = request.result;
            if (video) {
                video.likes = (video.likes || 0) + 1;
                const updateRequest = store.put(video);
                updateRequest.onerror = () => reject(updateRequest.error);
            }
        };

        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
    });
  },

  async getVideosForUser(userId: string): Promise<Video[]> {
    const db = await getDB();
    return new Promise<Video[]>((resolve, reject) => {
        const transaction = db.transaction(VIDEOS_STORE, 'readonly');
        const store = transaction.objectStore(VIDEOS_STORE);
        const index = store.index('by_userId');
        const request = index.getAll(userId);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
  },

  async addItem(userId: string, sellerName: string, name: string, description: string, price: number, imageUrl: string): Promise<Item> {
    const newItem: Item = {
      id: `item_${new Date().getTime()}`,
      userId,
      sellerName,
      name,
      description,
      price,
      imageUrl,
    };
    await performTransaction(ITEMS_STORE, 'readwrite', store => store.add(newItem));
    return newItem;
  },
  
  async getAllItems(): Promise<Item[]> {
    return await performTransaction<Item[]>(ITEMS_STORE, 'readonly', store => store.getAll());
  },

  async getItemById(itemId: string): Promise<Item | undefined> {
      return await performTransaction<Item | undefined>(ITEMS_STORE, 'readonly', store => store.get(itemId));
  },

  async getItemsForUser(userId: string): Promise<Item[]> {
    const db = await getDB();
    return new Promise<Item[]>((resolve, reject) => {
        const transaction = db.transaction(ITEMS_STORE, 'readonly');
        const store = transaction.objectStore(ITEMS_STORE);
        const index = store.index('by_userId');
        const request = index.getAll(userId);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
  },

  async addOrder(userId: string, items: Item[], totalAmount: number, paymentMethod: string): Promise<Order> {
    const newOrder: Order = {
        id: `ord_${new Date().getTime()}`,
        userId,
        items,
        totalAmount,
        date: new Date().toISOString(),
        status: 'completed',
        paymentMethod
    };
    await performTransaction(ORDERS_STORE, 'readwrite', store => store.add(newOrder));
    return newOrder;
  },

  async getOrdersForUser(userId: string): Promise<Order[]> {
      const db = await getDB();
      return new Promise<Order[]>((resolve, reject) => {
          const transaction = db.transaction(ORDERS_STORE, 'readonly');
          const store = transaction.objectStore(ORDERS_STORE);
          const index = store.index('by_userId');
          const request = index.getAll(userId);
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
      });
  }
};
