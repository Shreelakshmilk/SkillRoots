export interface User {
  name: string;
  email: string;
}

export interface Video {
  id: string;
  userId: string;
  uploaderName: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  views: number;
  likes: number;
}

export interface Item {
  id: string;
  userId: string;
  sellerName: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
}


export interface ActivityStats {
  videosUploaded: number;
  earnings: number;
  skillsLearned: number;
  itemsListed: number;
  totalViews: number;
}

export enum AuthScreen {
  Login = 'LOGIN',
  Register = 'REGISTER',
}

export enum AppPage {
  Home = 'HOME',
  Marketplace = 'MARKETPLACE',
  Dashboard = 'DASHBOARD',
  Upload = 'UPLOAD',
  Sell = 'SELL',
  VideoPage = 'VIDEO_PAGE',
  ItemPage = 'ITEM_PAGE',
}

export interface Language {
  code: string;
  name: string;
}

export interface Translations {
  [key: string]: string;
}