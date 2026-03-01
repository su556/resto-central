

# RestaurantOS – UI Prototype Plan

A responsive web-based food ordering platform with three panels for a single restaurant, built as a polished UI prototype with mock data.

---

## 1. Landing / Restaurant Home Page
- Hero section with restaurant branding, name, and tagline
- Featured dishes carousel
- Navigation to menu, about, and contact sections
- "Order Now" call-to-action button
- Phone OTP login modal (UI only, no real auth)

## 2. Customer Ordering Flow
- **Menu Page**: Categories sidebar + dish grid with images, descriptions, prices, and veg/non-veg badges
- **Cart Drawer**: Slide-out cart with quantity controls, item totals, and subtotal
- **Checkout Page**: Delivery address form, order summary, and "Pay with Razorpay" button (mock)
- **Order Tracking Page**: Visual stepper showing order status (Confirmed → Preparing → Out for Delivery → Delivered) with auto-progressing mock animation

## 3. Restaurant Admin Dashboard
- **Dashboard Home**: Summary cards (today's orders, revenue, active riders) with a simple orders chart
- **Menu Management**: Table/grid of dishes with add, edit, and delete functionality (modal forms with image upload placeholder)
- **Order Management**: Live order feed with accept/reject buttons and status updates
- **Offers Management**: Create and manage discount offers with a simple form
- **Rider Overview**: List of riders with availability status

## 4. Rider Panel
- **Login Screen**: Phone + OTP input (mock)
- **Home Screen**: Availability toggle (Online/Offline)
- **Incoming Order Card**: Notification-style card with restaurant name, delivery address, and accept button (first-accept-wins UI)
- **Active Delivery View**: Order details with status update buttons (Picked Up → On the Way → Delivered)

## 5. Navigation & Layout
- Top-level route switching between Customer, Admin, and Rider panels via a role switcher in the header
- Responsive design: mobile-first for Customer and Rider panels, desktop-optimized for Admin dashboard
- Consistent color theme with warm restaurant-friendly tones (customizable later for white-label)

## 6. Mock Data
- Pre-populated restaurant with ~15 dishes across 4-5 categories
- Sample orders in various statuses
- 3-4 mock riders with different availability states

---

All interactions will be functional within the UI (adding to cart, toggling states, accepting orders) using local React state. No backend or database — designed to be connected to Supabase in a future phase.

