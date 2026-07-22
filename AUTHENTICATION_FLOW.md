# Authentication Flow - Complete Guide

## Overview

The Pet Adoption Platform now has a complete authentication system with separate flows for customers and admins.

---

## 🏠 Landing Page (Initial Page)

**URL**: `http://localhost:3000`

The first page users see when they visit the application. It displays:
- Two role selection cards: **Customer** and **Admin**
- Features overview
- Button to continue as customer or admin

### Navigation:
- **Customer Login** → `/customer/login`
- **Admin Login** → `/admin/login`

---

## 👥 Customer Flow

### 1. Customer Login Page

**URL**: `/customer/login`

**Features**:
- Email and password input
- Links to register page
- Demo credentials display

**Demo Credentials**:
```
Email: demo@example.com
Password: anything
```

**Navigation**:
- Success → `/customer/home`
- Register link → `/customer/register`
- Back button → `/`

---

### 2. Customer Register Page

**URL**: `/customer/register`

**Form Fields**:
- First Name *
- Last Name *
- Email *
- Password *
- Confirm Password *
- Phone
- City
- State

**Validation**:
- All required fields must be filled
- Passwords must match
- Password minimum 6 characters

**On Success**:
- Shows toast message
- Redirects to `/customer/login` after 1.5 seconds
- User data saved in localStorage

---

### 3. Customer Home Page

**URL**: `/customer/home` (Protected - requires login)

**Features**:
- Welcome message with user name
- "Why Adopt?" section with 3 feature cards
- Search bar for pets
- Available pets grid (4+ pets displayed)
- Pet cards showing:
  - Pet emoji icon
  - Name, Breed, Species
  - Age, Size, Adoption Fee
  - "Apply to Adopt" button
- Profile link
- Logout button

**Logout**:
- Clears auth token and user data
- Redirects to landing page

---

### 4. Customer Profile Page

**URL**: `/customer/profile` (Protected)

**Displays**:
- User information card
  - Name, Email, Phone, Location
  - Edit profile button
- Adoption history
  - Pet names and types
  - Application status (Pending/Approved)
  - Application dates

---

## 🔧 Admin Flow

### 1. Admin Login Page

**URL**: `/admin/login`

**Demo Credentials**:
```
Email: admin@petadoption.com
Password: admin123
```

**Features**:
- Email and password fields
- Demo credentials displayed

---

### 2. Admin Dashboard

**URL**: `/admin/dashboard` (Protected - requires admin login)

### Dashboard Features:

#### Overview Tab:
- **4 Statistics Cards**:
  - Total Pets (156)
  - Total Users (342)
  - Pending Applications (23)
  - Completed Adoptions (89)

- **Recent Applications Table**:
  - Pet Name, Applicant Name, Date
  - Status badge (Pending/Approved/Rejected)
  - Review button for each application

#### Pet Management Tab:
- **Add New Pet** button
- **Pets Table**:
  - Pet Name, Species, Status
  - Adoption Fee
  - Edit and Delete buttons for each pet

**Navigation**:
- Toggle between "Dashboard" and "Manage Pets" tabs
- Logout button
- Back button to landing page

---

## 📋 User Flow Diagrams

### Customer Journey:
```
Landing Page (/)
    ↓
Customer Login (/customer/login)
    ↓
[Register] → Customer Register (/customer/register)
    ↓
Customer Home (/customer/home)
    ├── Browse Pets
    ├── Apply to Adopt
    ├── View Profile (/customer/profile)
    └── Logout → Landing Page
```

### Admin Journey:
```
Landing Page (/)
    ↓
Admin Login (/admin/login)
    ↓
Admin Dashboard (/admin/dashboard)
    ├── View Statistics
    ├── Review Applications
    ├── Manage Pets
    └── Logout → Landing Page
```

---

## 🔐 Authentication Details

### localStorage Keys:

**Customer**:
- `customerToken`: Authentication token
- `currentUser`: Current logged-in user data
- `customerUser`: Registered user data

**Admin**:
- `adminToken`: Authentication token
- `adminUser`: Admin user data

### Protected Routes:
- `/customer/home` - Requires `customerToken`
- `/customer/profile` - Requires `customerToken`
- `/admin/dashboard` - Requires `adminToken`

---

## 🧪 Testing Flows

### Test Customer Flow:
1. Go to http://localhost:3000
2. Click "Customer Login"
3. Try credentials:
   - Email: demo@example.com
   - Password: anything
4. Explore customer home page
5. Click "Apply to Adopt" on any pet
6. View profile
7. Logout

### Test Customer Registration:
1. Go to http://localhost:3000
2. Click "Customer Login"
3. Click "Register here"
4. Fill form with any data
5. Submit → Redirects to login
6. Login with registered email
7. Access customer home

### Test Admin Flow:
1. Go to http://localhost:3000
2. Click "Admin Login"
3. Use credentials:
   - Email: admin@petadoption.com
   - Password: admin123
4. Explore dashboard
5. Switch between tabs
6. Logout

---

## 🛠️ API Integration (Next Steps)

Replace mock data with real API calls:

### Customer Register:
```javascript
// Replace this mock call:
await new Promise(resolve => setTimeout(resolve, 1000));

// With API call:
const response = await fetch('http://localhost:8080/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(formData)
});
```

### Customer Login:
```javascript
const response = await fetch('http://localhost:8080/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(formData)
});
const { token, user } = await response.json();
localStorage.setItem('customerToken', token);
localStorage.setItem('currentUser', JSON.stringify(user));
```

### Admin Login:
```javascript
const response = await fetch('http://localhost:8080/api/admin/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(formData)
});
const { token, admin } = await response.json();
localStorage.setItem('adminToken', token);
localStorage.setItem('adminUser', JSON.stringify(admin));
```

### Fetch Pets:
```javascript
const response = await fetch('http://localhost:8080/api/pets');
const pets = await response.json();
```

---

## 📦 Files Created

- `LandingPage.js` - Initial landing page with role selection
- `CustomerLoginPage.js` - Customer login form
- `CustomerRegisterPage.js` - Customer registration form
- `CustomerHomePage.js` - Customer home with pet listing
- `AdminLoginPage.js` - Admin login form
- `AdminDashboardPage.js` - Admin dashboard with management
- `App.js` - Updated with all routes and protected route component

---

## 🚀 Running the Application

```bash
# Start Frontend
cd Frontend
npm start

# Application opens at: http://localhost:3000
```

---

## 📝 Notes

- All authentication tokens are stored in `localStorage`
- Demo data is used; replace with backend API calls
- Protected routes redirect to landing page if not authenticated
- Toast notifications for user feedback
- Responsive design for all devices
- Admin dashboard has tab navigation

---

## 🔄 Next Steps

1. Connect to backend API endpoints
2. Add JWT token handling
3. Add form validation on backend
4. Create admin management pages
5. Add payment integration
6. Implement email notifications
7. Add image upload for pets

---

**Enjoy the new authentication system!** 🎉
