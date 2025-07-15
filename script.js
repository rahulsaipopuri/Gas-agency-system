// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBrNqGug2rBwbh8fZWT8HX3TY5WAj7BwgY",
  authDomain: "online-gas-booking-91fa3.firebaseapp.com",
  databaseURL: "https://online-gas-booking-91fa3-default-rtdb.firebaseio.com",
  projectId: "online-gas-booking-91fa3",
  storageBucket: "online-gas-booking-91fa3.firebasestorage.app",
  messagingSenderId: "278155184168",
  appId: "1:278155184168:web:1a092d544dccee4c4a0d1d",
  measurementId: "G-X76MM9R6L2"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Allowed admin emails (replace with actual admins)
const allowedAdmins = ["admin@gmail.com"];

// Toggle form visibility
function showForm(formType) {
  const adminForm = document.getElementById('adminloginform');
  const userContainer = document.getElementById('userContainer');
  const adminContainer = document.getElementById('adminContainer');
  const registerForm = document.getElementById('registerForm');
  const loginForm = document.getElementById('loginForm');
  const topUserLoginBtn = document.getElementById('topUserLogin');

  // Hide all forms & containers first
  adminForm.classList.add('hidden');
  registerForm.classList.add('hidden');
  loginForm.classList.add('hidden');
  userContainer.style.display = 'none';
  adminContainer.style.display = 'none';
  topUserLoginBtn.classList.add('hidden');

  if (formType === 'register') {
    userContainer.style.display = 'block';
    registerForm.classList.remove('hidden');
  } else if (formType === 'login') {
    userContainer.style.display = 'block';
    loginForm.classList.remove('hidden');
  } else if (formType === 'admin') {
    adminContainer.style.display = 'block';
    adminForm.classList.remove('hidden');
    topUserLoginBtn.classList.remove('hidden'); // Show User Login button on admin form
  }
}

// Register user
function registerUser() {
  const email = document.getElementById("regEmail").value;
  const password = document.getElementById("regPassword").value;

  auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const user = userCredential.user;

      user.sendEmailVerification()
        .then(() => {
          alert("Registration successful! A verification email has been sent. Please verify before logging in.");
        })
        .catch((error) => {
          alert("Error sending verification email: " + error.message);
        });

      document.getElementById("regEmail").value = "";
      document.getElementById("regPassword").value = "";
    })
    .catch((error) => {
      alert("Error: " + error.message);
    });
}


// Login user
function loginUser() {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  auth.signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const user = userCredential.user;

      if (!user.emailVerified) {
        alert("Email not verified! Please check your inbox and verify your email.");
        auth.signOut();
        return;
      }

      alert("Login successful!");
      window.location.href = "dashboard.html"; // user dashboard page
    })
    .catch((error) => {
      alert("Error: " + error.message);
    });
}


// Admin Login with fixed password & email check
function adminLogin() {
  const adminEmail = document.getElementById("adminEmail").value;
  const adminPass = document.getElementById("adminPassword").value;

  if (adminPass === 'admin2005') {
    if (!allowedAdmins.includes(adminEmail)) {
      alert("Access Denied: Not a valid admin email.");
      return;
    }
    auth.signInWithEmailAndPassword(adminEmail, adminPass)
      .then(() => {
        alert("Welcome Admin!");
        window.location.href = "admin.html"; // admin dashboard page
      })
      .catch((error) => {
        alert("Firebase Auth Error: " + error.message);
      });
  } else {
    alert("Wrong Admin Password");
  }
}
function forgotPassword() {
  const email = document.getElementById("loginEmail").value;

  if (!email) {
    alert("Please enter your email in the login field before clicking 'Forgot Password'.");
    return;
  }

  auth.sendPasswordResetEmail(email)
    .then(() => {
      alert("A password reset email has been sent. Please check your inbox.");
    })
    .catch((error) => {
      alert("Error: " + error.message);
    });
}
// Show login form on page load
window.onload = function () {
  showForm('login');
};


