import { User, Video, Item } from '../types';

// Helper to get items from localStorage
const getFromStorage = <T>(key: string, defaultValue: T): T => {
  const storedValue = localStorage.getItem(key);
  return storedValue ? (JSON.parse(storedValue) as T) : defaultValue;
};


// Helper to set items in localStorage
const setInStorage = (key: string, data: any): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

// --- User Management ---
export const db = {
  registerUser: (name: string, email: string): { success: boolean; user?: User; error?: string } => {
    const users = getFromStorage<User[]>('skillroots_users', []);
    const userExists = users.some(user => user.email === email.toLowerCase());
    if (userExists) {
      return { success: false, error: 'userExists' };
    }
    const newUser: User = { name, email: email.toLowerCase() };
    users.push(newUser);
    setInStorage('skillroots_users', users);
    return { success: true, user: newUser };
  },

  loginUser: (email: string): User | null => {
    const users = getFromStorage<User[]>('skillroots_users', []);
    return users.find(user => user.email === email.toLowerCase()) || null;
  },

  // --- Video Management ---
  addVideo: (userId: string, uploaderName: string, title: string, description: string, thumbnailUrl: string, videoUrl: string): Video => {
    const videos = getFromStorage<Video[]>('skillroots_videos', []);
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
    videos.push(newVideo);
    setInStorage('skillroots_videos', videos);
    return newVideo;
  },
  
  getAllVideos: (): Video[] => {
    return getFromStorage<Video[]>('skillroots_videos', []);
  },

  getVideoById: (videoId: string): Video | undefined => {
      const videos = getFromStorage<Video[]>('skillroots_videos', []);
      return videos.find(video => video.id === videoId);
  },

  incrementViewCount: (videoId: string): void => {
      let videos = getFromStorage<Video[]>('skillroots_videos', []);
      videos = videos.map(video => 
        video.id === videoId ? { ...video, views: video.views + 1 } : video
      );
      setInStorage('skillroots_videos', videos);
  },

  likeVideo: (videoId: string): void => {
      let videos = getFromStorage<Video[]>('skillroots_videos', []);
      videos = videos.map(video =>
        video.id === videoId ? { ...video, likes: (video.likes || 0) + 1 } : video
      );
      setInStorage('skillroots_videos', videos);
  },

  getVideosForUser: (userId: string): Video[] => {
    const videos = getFromStorage<Video[]>('skillroots_videos', []);
    return videos.filter(video => video.userId === userId);
  },

  // --- Item Management ---
  addItem: (userId: string, sellerName: string, name: string, description: string, price: number, imageUrl: string): Item => {
    const items = getFromStorage<Item[]>('skillroots_items', []);
    const newItem: Item = {
      id: `item_${new Date().getTime()}`,
      userId,
      sellerName,
      name,
      description,
      price,
      imageUrl,
    };
    items.push(newItem);
    setInStorage('skillroots_items', items);
    return newItem;
  },
  
  getAllItems: (): Item[] => {
    return getFromStorage<Item[]>('skillroots_items', []);
  },

  getItemById: (itemId: string): Item | undefined => {
      const items = getFromStorage<Item[]>('skillroots_items', []);
      return items.find(item => item.id === itemId);
  },

  getItemsForUser: (userId: string): Item[] => {
    const items = getFromStorage<Item[]>('skillroots_items', []);
    return items.filter(item => item.userId === userId);
  },
};