# Smart Campus Operations Hub - Development Plan

## Design Guidelines

### Design References
- **Modern University Portal**: Clean, professional, institutional feel
- **Style**: Modern Glassmorphism + Gradient Accents + Campus Blue Theme

### Color Palette
- Primary: #1E3A5F (Deep Navy - main brand)
- Secondary: #3B82F6 (Bright Blue - accents/CTAs)
- Accent: #10B981 (Emerald Green - success/active states)
- Warning: #F59E0B (Amber - pending states)
- Danger: #EF4444 (Red - rejected/destructive)
- Background: #F8FAFC (Light Gray-Blue)
- Card: #FFFFFF (White)
- Dark Text: #0F172A
- Muted Text: #64748B

### Typography
- Font: Inter (clean, modern sans-serif)
- Heading1: Inter 700 (40px)
- Heading2: Inter 600 (28px)
- Heading3: Inter 600 (20px)
- Body: Inter 400 (14px)

### Key Component Styles
- Cards: White bg, subtle shadow, 12px rounded, hover lift effect
- Buttons: Rounded-lg, gradient backgrounds for primary CTAs
- Status Badges: Color-coded pills (green=active, amber=pending, red=rejected, blue=in-progress)
- Sidebar: Dark navy with icon navigation
- Theater Booking: Grid-based seat/slot selector with color states

### Images to Generate
1. **hero-campus-aerial.jpg** - Aerial view of a modern university campus with green lawns, glass buildings, and walkways (photorealistic)
2. **hero-booking-illustration.jpg** - Abstract illustration of calendar and room booking concept with blue tones (minimalist)
3. **hero-maintenance-illustration.jpg** - Abstract illustration of maintenance tools and gears with green/blue tones (minimalist)
4. **campus-pattern-bg.jpg** - Subtle geometric pattern background with university theme in navy/blue tones (minimalist)

---

## Pages & Files Structure

### Shared Components (src/components/)
1. **AppSidebar.tsx** - Role-based sidebar navigation with icons
2. **AppLayout.tsx** - Main layout wrapper with sidebar + header + content area
3. **StatusBadge.tsx** - Reusable status badge component
4. **NotificationBell.tsx** - Notification bell icon with count badge

### Mock Data (src/lib/)
5. **mockData.ts** - All mock data for resources, bookings, tickets, notifications, users

### Pages (src/pages/)
6. **Landing.tsx** - Public landing page with hero, features, CTA
7. **Login.tsx** - Login page with Google OAuth button
8. **Register.tsx** - Registration form
9. **Dashboard.tsx** - User dashboard with overview cards
10. **Facilities.tsx** - Module A - Browse & search resources with filters
11. **ResourceDetail.tsx** - Module A - Single resource view with metadata & book button
12. **Bookings.tsx** - Module B - My bookings list with status filters
13. **BookingDetail.tsx** - Module B - Single booking with workflow visualization
14. **BookingCreate.tsx** - Module B - Theater-style booking for halls, time-slot picker for equipment
15. **Tickets.tsx** - Module C - My tickets list
16. **TicketDetail.tsx** - Module C - Single ticket with comments, status tracker
17. **TicketCreate.tsx** - Module C - Create ticket form with image upload
18. **Notifications.tsx** - Module D - Notification list
19. **Profile.tsx** - User profile page
20. **Admin.tsx** - Admin dashboard with analytics
21. **AdminBookings.tsx** - Admin view all bookings, approve/reject
22. **AdminTickets.tsx** - Admin view all tickets, assign technician
23. **AdminResources.tsx** - Admin manage catalogue CRUD
24. **AdminUsers.tsx** - Admin manage users & roles
25. **MyAssignedTickets.tsx** - Technician assigned tickets

### Router
26. **App.tsx** - Updated with all routes and lazy loading