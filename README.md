Online Gas Cylinder Booking System
Overview
The Online Gas Cylinder Booking System is a web-based application developed to streamline the process of booking gas cylinders for users and managing booking requests for administrators. Built during an internship at Unified Mentor, the project addresses inefficiencies in manual booking systems by providing a secure, user-friendly platform with features like user registration, cylinder booking, extra cylinder requests, payment options (cash/QR), and admin approval/denial workflows.
The application uses HTML, CSS, and JavaScript for the frontend, with Firebase for authentication and data storage, and EmailJS for sending status update notifications. It supports role-based access: users can book cylinders and view history, while admins manage requests with real-time updates.
Features

User Authentication: Register, login, and password reset with Firebase Authentication.
User Dashboard:
Book a gas cylinder with name, mobile number, date, and payment method (Cash/Online with QR code).
Request extra cylinders (limited to one pending request).
View booking history with status (Pending, Approved, Denied).


Admin Dashboard:
Approve or deny booking and extra cylinder requests.
Filter bookings by date.
Real-time display of pending requests.


Email Notifications: Automated emails sent via EmailJS for booking status updates.
Responsive Design: Optimized for desktop and mobile devices.
Security: Admin access restricted to specific emails with a fixed password (prototype).

Technologies Used

Frontend: HTML5, CSS3, JavaScript (ES6)
Backend: Firebase (Authentication, Firestore)
Email Service: EmailJS
Development Tools: Visual Studio Code
Libraries: Firebase SDK, EmailJS SDK
Styling: Custom CSS with responsive design (gradients, animations, media queries)

Project Structure
online-gas-booking-system/
├── index.html          # User login/registration page
├── script.js           # Authentication logic (user/admin login, registration)
├── admin.html          # Admin dashboard for managing bookings
├── admin.js            # Admin logic for loading/approving requests
├── admin.css           # Styles for admin dashboard
├── dashboard.html      # User dashboard for booking and history
├── dashboard.js        # User logic for booking and history
├── dashboard.css       # Styles for user dashboard
├── style.css           # General styles for login/registration
└── README.md           # Project documentation

Setup Instructions
Prerequisites

A modern web browser (Google Chrome, Firefox, Edge)
Node.js (optional, for local development server)
Firebase account and EmailJS account
Stable internet connection

Installation

Clone the Repository:
git clone https://github.com/your-username/online-gas-booking-system.git
cd online-gas-booking-system


Set Up Firebase:

Create a Firebase project at firebase.google.com.
Enable Authentication (Email/Password provider) and Firestore Database.
Copy the Firebase configuration (apiKey, authDomain, etc.) from your Firebase project settings.
Replace the firebaseConfig object in script.js, admin.js, and dashboard.js with your configuration:const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-auth-domain",
  databaseURL: "your-database-url",
  projectId: "your-project-id",
  storageBucket: "your-storage-bucket",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id",
  measurementId: "your-measurement-id"
};




Set Up EmailJS:

Create an EmailJS account at emailjs.com.
Configure a service and template for sending booking status emails.
Update the sendBookingEmail function in admin.js with your EmailJS service ID and template ID:emailjs.send("your-service-id", "your-template-id", templateParams)




Host the Application:

Option 1: Use a local development server (e.g., VS Code Live Server extension).
Option 2: Deploy to Firebase Hosting:npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy




Run the Application:

Open index.html in a browser or access the deployed URL.
Use an admin email (e.g., admin@example.com) with password admin2005 for admin access.
Register as a user with any email and password for user access.



Usage

User Flow:
Visit the login page (index.html) and register or log in.
On the user dashboard (dashboard.html), book a cylinder, request an extra cylinder, or view booking history.
For online payments, scan the QR code and confirm payment.


Admin Flow:
Access the admin login from the top-right button on index.html.
Log in with an admin email and password (admin2005).
On the admin dashboard (admin.html), filter bookings, approve/deny requests, and view updates in real-time.


Email Notifications: Users receive automated emails when booking statuses change.

Screenshots

Login Page: User/admin login and registration interface.
User Dashboard: Booking form, history, and extra request options.
Admin Dashboard: Request management with filtering and approval buttons.

[Insert Screenshots in Word Document: See Results/Screenshots section]
Testing

Unit Testing: Verified functions like submitBooking, updateBookingStatus, and registerUser via browser console.
Integration Testing: Ensured Firebase Authentication, Firestore, and EmailJS integration.
Functional Testing: Tested booking submission, admin approvals, history display, and responsive design.
Edge Cases: Handled empty inputs, duplicate requests, and invalid credentials.

Future Enhancements

Integrate real-time notifications with Firebase Cloud Messaging.
Add inventory tracking for gas cylinders.
Implement secure online payment gateways (e.g., Stripe, PayPal).
Enhance admin security with multi-factor authentication.
Develop a mobile app version using React Native.

Known Issues

Admin password is hardcoded (admin2005) for prototype purposes; replace with secure authentication in production.
QR code payment is static; integrate dynamic payment APIs for real transactions.

Contributing
Contributions are welcome! Please:

Fork the repository.
Create a feature branch (git checkout -b feature/your-feature).
Commit changes (git commit -m "Add your feature").
Push to the branch (git push origin feature/your-feature).
Open a pull request.
To Visit this page -https://rahulsaipopuri.github.io/Gas-agency-system/ 
