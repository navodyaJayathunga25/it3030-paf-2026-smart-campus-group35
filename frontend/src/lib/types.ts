// ============ TYPES ============
export type UserRole = "USER" | "ADMIN" | "TECHNICIAN";
export type ResourceType = "LECTURE_HALL" | "LAB" | "MEETING_ROOM" | "EQUIPMENT";
export type ResourceStatus = "ACTIVE" | "OUT_OF_SERVICE";
export type BookingStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
export type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED" | "REJECTED";
export type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type NotificationType = "BOOKING" | "TICKET" | "COMMENT";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  department?: string;
}

export interface Resource {
  id: string;
  name: string;
  type: ResourceType;
  capacity?: number;
  location: string;
  building: string;
  floor: string;
  status: ResourceStatus;
  description: string;
  amenities: string[];
  availabilityWindows: string;
  image?: string;
}

export interface Booking {
  id: string;
  resourceId: string;
  resourceName: string;
  userId: string;
  userName: string;
  date: string;
  startTime: string;
  endTime: string;
  purpose: string;
  attendees: number;
  status: BookingStatus;
  adminReason?: string;
  createdAt: string;
}

export interface Ticket {
  id: string;
  resourceId?: string;
  resourceName?: string;
  location: string;
  userId: string;
  userName: string;
  category: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  assignedTo?: string;
  assignedToName?: string;
  contactEmail: string;
  contactPhone?: string;
  images: string[];
  resolutionNotes?: string;
  rejectionReason?: string;
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
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  link: string;
  createdAt: string;
}

// ============ MOCK USERS ============
export const mockUsers: User[] = [
  { id: "u1", name: "John Student", email: "john@campus.edu", role: "USER", department: "Computer Science" },
  { id: "u2", name: "Dr. Sarah Admin", email: "sarah@campus.edu", role: "ADMIN", department: "Administration" },
  { id: "u3", name: "Mike Technician", email: "mike@campus.edu", role: "TECHNICIAN", department: "Facilities" },
  { id: "u4", name: "Emily Researcher", email: "emily@campus.edu", role: "USER", department: "Physics" },
  { id: "u5", name: "David Lecturer", email: "david@campus.edu", role: "USER", department: "Mathematics" },
  { id: "u6", name: "Anna Tech", email: "anna@campus.edu", role: "TECHNICIAN", department: "IT Support" },
];

// Current logged-in user (simulated)
export const currentUser: User = mockUsers[0];

// ============ MOCK RESOURCES ============
export const mockResources: Resource[] = [
  {
    id: "r1", name: "Main Auditorium", type: "LECTURE_HALL", capacity: 500,
    location: "Building A, Ground Floor", building: "Building A", floor: "Ground",
    status: "ACTIVE", description: "Large auditorium with tiered seating, projector, and surround sound system. Ideal for lectures, seminars, and events.",
    amenities: ["Projector", "Microphone", "Air Conditioning", "Wi-Fi", "Recording System"],
    availabilityWindows: "Mon-Fri 8:00-20:00, Sat 9:00-17:00",
  },
  {
    id: "r2", name: "Lecture Hall B-201", type: "LECTURE_HALL", capacity: 120,
    location: "Building B, 2nd Floor", building: "Building B", floor: "2nd",
    status: "ACTIVE", description: "Medium-sized lecture hall with modern AV equipment and comfortable seating.",
    amenities: ["Projector", "Whiteboard", "Air Conditioning", "Wi-Fi"],
    availabilityWindows: "Mon-Fri 8:00-21:00",
  },
  {
    id: "r3", name: "Physics Lab 101", type: "LAB", capacity: 30,
    location: "Science Block, 1st Floor", building: "Science Block", floor: "1st",
    status: "ACTIVE", description: "Fully equipped physics laboratory with experiment stations and safety equipment.",
    amenities: ["Lab Equipment", "Safety Gear", "Fume Hood", "Wi-Fi"],
    availabilityWindows: "Mon-Fri 9:00-17:00",
  },
  {
    id: "r4", name: "Computer Lab C-301", type: "LAB", capacity: 40,
    location: "Building C, 3rd Floor", building: "Building C", floor: "3rd",
    status: "ACTIVE", description: "Computer lab with 40 high-performance workstations, dual monitors, and development software.",
    amenities: ["Computers", "Dual Monitors", "Projector", "Wi-Fi", "Printer"],
    availabilityWindows: "Mon-Sat 8:00-22:00",
  },
  {
    id: "r5", name: "Board Room", type: "MEETING_ROOM", capacity: 16,
    location: "Admin Building, 4th Floor", building: "Admin Building", floor: "4th",
    status: "ACTIVE", description: "Executive boardroom with video conferencing, large display, and comfortable seating.",
    amenities: ["Video Conferencing", "Large Display", "Whiteboard", "Air Conditioning"],
    availabilityWindows: "Mon-Fri 8:00-18:00",
  },
  {
    id: "r6", name: "Meeting Room D-102", type: "MEETING_ROOM", capacity: 8,
    location: "Building D, 1st Floor", building: "Building D", floor: "1st",
    status: "ACTIVE", description: "Small meeting room ideal for team discussions and project meetings.",
    amenities: ["TV Screen", "Whiteboard", "Wi-Fi"],
    availabilityWindows: "Mon-Fri 8:00-20:00",
  },
  {
    id: "r7", name: "Sony 4K Projector", type: "EQUIPMENT", capacity: undefined,
    location: "Equipment Store, Building A", building: "Building A", floor: "Ground",
    status: "ACTIVE", description: "Sony VPL-VW295ES 4K HDR projector. Suitable for presentations and events.",
    amenities: ["4K Resolution", "HDR", "HDMI", "Wireless"],
    availabilityWindows: "Mon-Fri 8:00-18:00",
  },
  {
    id: "r8", name: "Canon EOS R5 Camera", type: "EQUIPMENT", capacity: undefined,
    location: "Media Center, Building B", building: "Building B", floor: "1st",
    status: "ACTIVE", description: "Professional mirrorless camera for photography and video recording.",
    amenities: ["45MP Sensor", "8K Video", "Dual Card Slots", "Wi-Fi"],
    availabilityWindows: "Mon-Fri 9:00-17:00",
  },
  {
    id: "r9", name: "Chemistry Lab 201", type: "LAB", capacity: 25,
    location: "Science Block, 2nd Floor", building: "Science Block", floor: "2nd",
    status: "OUT_OF_SERVICE", description: "Chemistry laboratory currently undergoing renovation. Expected back in service by May 2026.",
    amenities: ["Lab Equipment", "Fume Hoods", "Safety Showers", "Wi-Fi"],
    availabilityWindows: "Currently unavailable",
  },
  {
    id: "r10", name: "Portable PA System", type: "EQUIPMENT", capacity: undefined,
    location: "Equipment Store, Building A", building: "Building A", floor: "Ground",
    status: "ACTIVE", description: "Portable public address system with wireless microphones. Ideal for outdoor events.",
    amenities: ["2 Wireless Mics", "Bluetooth", "Battery Powered", "Portable"],
    availabilityWindows: "Mon-Sat 8:00-20:00",
  },
];

// ============ SEAT LAYOUT FOR THEATER BOOKING ============
export interface SeatRow {
  row: string;
  seats: number;
  type: "standard" | "premium" | "accessible";
}

export const auditoriumLayout: SeatRow[] = [
  { row: "A", seats: 12, type: "premium" },
  { row: "B", seats: 14, type: "premium" },
  { row: "C", seats: 16, type: "standard" },
  { row: "D", seats: 16, type: "standard" },
  { row: "E", seats: 18, type: "standard" },
  { row: "F", seats: 18, type: "standard" },
  { row: "G", seats: 20, type: "standard" },
  { row: "H", seats: 20, type: "standard" },
  { row: "J", seats: 4, type: "accessible" },
];

// ============ TIME SLOTS ============
export const timeSlots = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
  "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00",
];

// ============ MOCK BOOKINGS ============
export const mockBookings: Booking[] = [
  {
    id: "b1", resourceId: "r1", resourceName: "Main Auditorium", userId: "u1", userName: "John Student",
    date: "2026-04-15", startTime: "09:00", endTime: "11:00", purpose: "Guest Lecture on AI Ethics",
    attendees: 200, status: "APPROVED", createdAt: "2026-04-10T08:30:00Z",
  },
  {
    id: "b2", resourceId: "r4", resourceName: "Computer Lab C-301", userId: "u1", userName: "John Student",
    date: "2026-04-16", startTime: "14:00", endTime: "16:00", purpose: "Programming Workshop",
    attendees: 35, status: "PENDING", createdAt: "2026-04-11T10:00:00Z",
  },
  {
    id: "b3", resourceId: "r5", resourceName: "Board Room", userId: "u4", userName: "Emily Researcher",
    date: "2026-04-14", startTime: "10:00", endTime: "12:00", purpose: "Research Committee Meeting",
    attendees: 12, status: "APPROVED", createdAt: "2026-04-09T14:20:00Z",
  },
  {
    id: "b4", resourceId: "r7", resourceName: "Sony 4K Projector", userId: "u5", userName: "David Lecturer",
    date: "2026-04-17", startTime: "13:00", endTime: "15:00", purpose: "Department Presentation",
    attendees: 1, status: "PENDING", createdAt: "2026-04-11T16:45:00Z",
  },
  {
    id: "b5", resourceId: "r2", resourceName: "Lecture Hall B-201", userId: "u1", userName: "John Student",
    date: "2026-04-13", startTime: "08:00", endTime: "10:00", purpose: "Study Group Session",
    attendees: 50, status: "REJECTED", adminReason: "Conflict with scheduled maintenance.",
    createdAt: "2026-04-08T09:00:00Z",
  },
  {
    id: "b6", resourceId: "r6", resourceName: "Meeting Room D-102", userId: "u4", userName: "Emily Researcher",
    date: "2026-04-18", startTime: "15:00", endTime: "16:30", purpose: "Thesis Defense Prep",
    attendees: 5, status: "APPROVED", createdAt: "2026-04-10T11:30:00Z",
  },
  {
    id: "b7", resourceId: "r8", resourceName: "Canon EOS R5 Camera", userId: "u1", userName: "John Student",
    date: "2026-04-12", startTime: "09:00", endTime: "17:00", purpose: "Campus Documentary Filming",
    attendees: 1, status: "CANCELLED", createdAt: "2026-04-05T13:00:00Z",
  },
];

// ============ MOCK TICKETS ============
export const mockTickets: Ticket[] = [
  {
    id: "t1", resourceId: "r1", resourceName: "Main Auditorium", location: "Building A, Ground Floor",
    userId: "u1", userName: "John Student", category: "AV Equipment", description: "The main projector in the auditorium is displaying a flickering image. The issue started during yesterday's lecture and has been persistent.",
    priority: "HIGH", status: "IN_PROGRESS", assignedTo: "u3", assignedToName: "Mike Technician",
    contactEmail: "john@campus.edu", contactPhone: "+94 77 123 4567",
    images: [], createdAt: "2026-04-10T09:15:00Z", updatedAt: "2026-04-11T14:30:00Z",
  },
  {
    id: "t2", resourceId: "r4", resourceName: "Computer Lab C-301", location: "Building C, 3rd Floor",
    userId: "u4", userName: "Emily Researcher", category: "IT Infrastructure", description: "5 workstations in the back row are not connecting to the university network. Students cannot access online resources.",
    priority: "MEDIUM", status: "OPEN", contactEmail: "emily@campus.edu",
    images: [], createdAt: "2026-04-11T11:00:00Z", updatedAt: "2026-04-11T11:00:00Z",
  },
  {
    id: "t3", location: "Building B, Corridor 2nd Floor",
    userId: "u5", userName: "David Lecturer", category: "Electrical", description: "Several ceiling lights in the 2nd floor corridor of Building B are not working, creating a safety hazard during evening hours.",
    priority: "LOW", status: "RESOLVED", assignedTo: "u6", assignedToName: "Anna Tech",
    contactEmail: "david@campus.edu", resolutionNotes: "Replaced 4 fluorescent tubes and 2 ballasts. All lights now functioning.",
    images: [], createdAt: "2026-04-08T16:00:00Z", updatedAt: "2026-04-10T10:00:00Z",
  },
  {
    id: "t4", resourceId: "r9", resourceName: "Chemistry Lab 201", location: "Science Block, 2nd Floor",
    userId: "u4", userName: "Emily Researcher", category: "Plumbing", description: "Water leak detected under sink station 3. Water is pooling on the floor and could damage equipment.",
    priority: "CRITICAL", status: "OPEN", contactEmail: "emily@campus.edu", contactPhone: "+94 77 987 6543",
    images: [], createdAt: "2026-04-12T07:30:00Z", updatedAt: "2026-04-12T07:30:00Z",
  },
  {
    id: "t5", location: "Admin Building, Elevator",
    userId: "u1", userName: "John Student", category: "Mechanical", description: "The elevator in the Admin Building makes unusual grinding noises and occasionally stops between floors.",
    priority: "HIGH", status: "CLOSED", assignedTo: "u3", assignedToName: "Mike Technician",
    contactEmail: "john@campus.edu", resolutionNotes: "Elevator maintenance company called. Motor bearings replaced and safety inspection completed.",
    images: [], createdAt: "2026-04-05T08:00:00Z", updatedAt: "2026-04-09T16:00:00Z",
  },
];

// ============ MOCK COMMENTS ============
export const mockComments: Comment[] = [
  { id: "c1", ticketId: "t1", userId: "u1", userName: "John Student", userRole: "USER", content: "The flickering seems to get worse when the projector has been running for more than 30 minutes.", createdAt: "2026-04-10T10:00:00Z" },
  { id: "c2", ticketId: "t1", userId: "u3", userName: "Mike Technician", userRole: "TECHNICIAN", content: "I've inspected the projector. It appears to be a lamp issue. Ordering a replacement lamp now.", createdAt: "2026-04-11T14:30:00Z" },
  { id: "c3", ticketId: "t1", userId: "u2", userName: "Dr. Sarah Admin", userRole: "ADMIN", content: "Please prioritize this as we have a major event next week.", createdAt: "2026-04-11T15:00:00Z" },
  { id: "c4", ticketId: "t3", userId: "u6", userName: "Anna Tech", userRole: "TECHNICIAN", content: "Replaced all faulty tubes. Please confirm if the issue is resolved.", createdAt: "2026-04-10T10:00:00Z" },
  { id: "c5", ticketId: "t3", userId: "u5", userName: "David Lecturer", userRole: "USER", content: "Confirmed! All lights are working now. Thank you!", createdAt: "2026-04-10T11:30:00Z" },
  { id: "c6", ticketId: "t5", userId: "u3", userName: "Mike Technician", userRole: "TECHNICIAN", content: "Elevator maintenance team has been scheduled for tomorrow morning.", createdAt: "2026-04-06T09:00:00Z" },
];

// ============ MOCK NOTIFICATIONS ============
export const mockNotifications: Notification[] = [
  { id: "n1", userId: "u1", type: "BOOKING", title: "Booking Approved", message: "Your booking for Main Auditorium on Apr 15 has been approved.", read: false, link: "/bookings/b1", createdAt: "2026-04-11T09:00:00Z" },
  { id: "n2", userId: "u1", type: "TICKET", title: "Ticket Update", message: "Your ticket #t1 has been assigned to Mike Technician.", read: false, link: "/tickets/t1", createdAt: "2026-04-11T14:30:00Z" },
  { id: "n3", userId: "u1", type: "COMMENT", title: "New Comment", message: "Mike Technician commented on your ticket #t1.", read: true, link: "/tickets/t1", createdAt: "2026-04-11T14:35:00Z" },
  { id: "n4", userId: "u1", type: "BOOKING", title: "Booking Rejected", message: "Your booking for Lecture Hall B-201 on Apr 13 was rejected.", read: true, link: "/bookings/b5", createdAt: "2026-04-09T10:00:00Z" },
  { id: "n5", userId: "u1", type: "TICKET", title: "Ticket Resolved", message: "Ticket #t5 (Elevator Issue) has been resolved and closed.", read: true, link: "/tickets/t5", createdAt: "2026-04-09T16:00:00Z" },
  { id: "n6", userId: "u1", type: "BOOKING", title: "Booking Pending", message: "Your booking for Computer Lab C-301 is pending approval.", read: false, link: "/bookings/b2", createdAt: "2026-04-11T10:05:00Z" },
];

// ============ TICKET CATEGORIES ============
export const ticketCategories = [
  "AV Equipment", "IT Infrastructure", "Electrical", "Plumbing",
  "HVAC", "Furniture", "Cleaning", "Security", "Mechanical", "Other",
];

// ============ HELPER FUNCTIONS ============
export function getResourceById(id: string): Resource | undefined {
  return mockResources.find((r) => r.id === id);
}

export function getBookingById(id: string): Booking | undefined {
  return mockBookings.find((b) => b.id === id);
}

export function getTicketById(id: string): Ticket | undefined {
  return mockTickets.find((t) => t.id === id);
}

export function getCommentsByTicketId(ticketId: string): Comment[] {
  return mockComments.filter((c) => c.ticketId === ticketId);
}

export function getUserBookings(userId: string): Booking[] {
  return mockBookings.filter((b) => b.userId === userId);
}

export function getUserTickets(userId: string): Ticket[] {
  return mockTickets.filter((t) => t.userId === userId);
}

export function getUserNotifications(userId: string): Notification[] {
  return mockNotifications.filter((n) => n.userId === userId);
}

export function getResourceTypeIcon(type: ResourceType): string {
  switch (type) {
    case "LECTURE_HALL": return "🏛️";
    case "LAB": return "🔬";
    case "MEETING_ROOM": return "🤝";
    case "EQUIPMENT": return "📷";
  }
}

export function getResourceTypeLabel(type: ResourceType): string {
  switch (type) {
    case "LECTURE_HALL": return "Lecture Hall";
    case "LAB": return "Laboratory";
    case "MEETING_ROOM": return "Meeting Room";
    case "EQUIPMENT": return "Equipment";
  }
}