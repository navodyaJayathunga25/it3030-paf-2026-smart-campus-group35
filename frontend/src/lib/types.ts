// ============ SHARED TYPES ============
export type UserRole = 'USER' | 'ADMIN' | 'TECHNICIAN' | 'LECTURER';
export type ResourceType = 'LECTURE_HALL' | 'LAB' | 'MEETING_ROOM' | 'EQUIPMENT';
export type ResourceStatus = 'ACTIVE' | 'OUT_OF_SERVICE';
export type BookingStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'REJECTED';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type NotificationType = 'BOOKING' | 'TICKET' | 'COMMENT';

export interface User {
  id: string;
  name: string;
  email: string;
  picture?: string;
  department?: string;
  role: UserRole;
  active: boolean;
  createdAt?: string;
}

export interface Resource {
  id: string;
  name: string;
  type: ResourceType;
  capacity?: number;
  location: string;
  description?: string;
  status: ResourceStatus;
  facilities?: string[];
  availabilityWindows?: string;
  imageUrl?: string;
  allowedRoles?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Booking {
  id: string;
  userId: string;
  userName: string;
  resourceId: string;
  resourceName: string;
  date: string;
  startTime: string;
  endTime: string;
  purpose: string;
  expectedAttendees: number;
  status: BookingStatus;
  rejectionReason?: string;
  approvedBy?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Ticket {
  id: string;
  userId: string;
  userName: string;
  resourceId?: string;
  resourceName?: string;
  location: string;
  category: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  assignedTo?: string;
  assignedToName?: string;
  resolutionNotes?: string;
  rejectionReason?: string;
  attachmentUrls: string[];
  contactEmail: string;
  contactPhone?: string;
  firstResponseAt?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  ticketId: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  referenceId?: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

// ============ STATIC HELPERS ============
export const ticketCategories = [
  'AV Equipment', 'IT Infrastructure', 'Electrical', 'Plumbing',
  'HVAC', 'Furniture', 'Cleaning', 'Security', 'Mechanical', 'Other',
];

export const timeSlots = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00',
];

export function getResourceTypeIcon(type: ResourceType): string {
  switch (type) {
    case 'LECTURE_HALL': return '🏛️';
    case 'LAB': return '🔬';
    case 'MEETING_ROOM': return '🤝';
    case 'EQUIPMENT': return '📷';
  }
}

export function getResourceTypeLabel(type: ResourceType): string {
  switch (type) {
    case 'LECTURE_HALL': return 'Lecture Hall';
    case 'LAB': return 'Laboratory';
    case 'MEETING_ROOM': return 'Meeting Room';
    case 'EQUIPMENT': return 'Equipment';
  }
}
