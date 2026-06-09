export type DecorationType = '毛坯' | '简装' | '精装' | '豪装';
export type OrientationType = '南' | '北' | '东' | '西' | '南北' | '东南' | '西南';
export type RoomType = 'livingroom' | 'bedroom' | 'kitchen' | 'bathroom' | 'balcony' | 'study' | 'diningroom';
export type HotspotType = 'room' | 'info' | 'furniture';
export type LightingMode = 'day' | 'dusk' | 'night';
export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface Room {
  id: string;
  name: string;
  area: number;
  type: RoomType;
  svgPath: string;
  position: { x: number; y: number };
}

export interface Hotspot {
  id: string;
  roomId: string;
  type: HotspotType;
  position: { x: number; y: number; z: number };
  label: string;
  targetRoomId?: string;
  info?: string;
}

export interface Property {
  id: string;
  title: string;
  district: string;
  address: string;
  price: number;
  area: number;
  layout: string;
  bedrooms: number;
  livingrooms: number;
  bathrooms: number;
  decoration: DecorationType;
  orientation: OrientationType;
  floor: string;
  coverImage: string;
  images: string[];
  isOnSale: boolean;
  builtArea: number;
  netArea: number;
  rooms: Room[];
  hotspots: Hotspot[];
  pricePerSqm: number;
  community: string;
  year: number;
  hasVR: boolean;
  tags: string[];
  description: string;
  monthlyPayment?: number;
}

export interface Agent {
  id: string;
  name: string;
  avatar: string;
  phone: string;
  rating: number;
  deals: number;
  experience: number;
  specialties: string[];
  status: 'online' | 'offline' | 'busy';
}

export interface Note {
  id: string;
  propertyId: string;
  propertyTitle: string;
  content: string;
  tags: string[];
  screenshot?: string;
  createdAt: string;
}

export interface Appointment {
  id: string;
  propertyId: string;
  propertyTitle: string;
  agentId: string;
  agentName: string;
  time: string;
  status: AppointmentStatus;
  userName: string;
  userPhone: string;
}

export interface VisitRecord {
  id: string;
  propertyId: string;
  propertyTitle: string;
  visitTime: string;
  duration: number;
  userName: string;
}

export interface QuoteItem {
  id: string;
  propertyId: string;
  propertyTitle: string;
  price: number;
  discount: number;
  downPaymentRatio: number;
  loanYears: number;
  interestRate: number;
}

export interface OpenSlot {
  id: string;
  propertyId: string;
  propertyTitle: string;
  date: string;
  timeSlot: string;
  isActive: boolean;
  maxCapacity: number;
}

export interface Filters {
  districts: string[];
  layouts: string[];
  priceRange: [number, number];
  decorations: DecorationType[];
  keyword: string;
}

export type SortType = 'default' | 'price-asc' | 'price-desc' | 'area-desc' | 'newest';
