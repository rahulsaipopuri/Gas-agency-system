// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyBrNqGug2rBwbh8fZWT8HX3TY5WAj7BwgY",
  authDomain: "online-gas-booking-91fa3.firebaseapp.com",
  databaseURL: "https://online-gas-booking-91fa3-default-rtdb.firebaseio.com",
  projectId: "online-gas-booking-91fa3",
  storageBucket: "online-gas-booking-91fa3.appspot.com",
  messagingSenderId: "278155184168",
  appId: "1:278155184168:web:1a092d544dccee4c4a0d1d",
  measurementId: "G-X76MM9R6L2"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

let currentUser = null;
let isOnlinePayment = false; // Initialize to false

// Auth state listener
auth.onAuthStateChanged((user) => {
  if (user) {
    currentUser = user;
    console.log("Logged in as:", user.uid, user.email);
  } else {
    console.warn("No user logged in. Redirecting to login.");
    alert("User not logged in. Please log in first.");
    window.location.href = "index.html";
  }
});

// Toggle UI Sections
function showBookingForm() {
  document.getElementById("bookingForm").classList.remove("hidden");
  document.getElementById("historySection").classList.add("hidden");
}

function showHistory() {
  if (!currentUser) return alert("User not logged in.");

  const historyList = document.getElementById("historyList");
  historyList.innerHTML = "<li>Loading...</li>";
  document.getElementById("bookingForm").classList.add("hidden");
  document.getElementById("historySection").classList.remove("hidden");

  Promise.all([
    db.collection("bookings").where("userId", "==", currentUser.uid).get(),
    db.collection("extraCylinderRequests").where("userId", "==", currentUser.uid).get()
  ])
    .then(([bookingsSnap, extrasSnap]) => {
      historyList.innerHTML = "";
      bookingsSnap.forEach((doc) => {
        const data = doc.data();
        const statusClass = data.status === "approved" ? "status-approved" : data.status === "denied" ? "status-denied" : "status-pending";
        const li = document.createElement("li");
        li.innerHTML = `📦 ${data.name} | ${new Date(data.bookingDate.toDate()).toLocaleDateString()} | <span class="${statusClass}">Status: ${data.status}</span>`;
        historyList.appendChild(li);
      });
      extrasSnap.forEach((doc) => {
        const data = doc.data();
        const statusClass = data.status === "approved" ? "status-approved" : data.status === "denied" ? "status-denied" : "status-pending";
        const li = document.createElement("li");
        li.innerHTML = `➕ Extra Cylinder Request on ${new Date(data.requestedAt.toDate()).toLocaleDateString()} | <span class="${statusClass}">Status: ${data.status}</span>`;
        historyList.appendChild(li);
      });
      if (!historyList.hasChildNodes()) historyList.innerHTML = "<li>No data found.</li>";
    })
    .catch((error) => {
      console.error("History load failed:", error);
      alert("Failed to load history.");
    });
}

// Show/Hide QR when Online Payment selected
document.getElementById("paymentMethod").addEventListener("change", function () {
  isOnlinePayment = this.value === "Online Payment";
  document.getElementById("qrSection").classList.toggle("hidden", !isOnlinePayment);
});

// Confirm payment button click
function confirmPayment() {
  document.getElementById("qrSection").classList.add("hidden");
  alert("Payment confirmed. You can now submit your booking.");
}

// Submit Booking (1 per 30 days)
function submitBooking() {
  // Ensure user is authenticated
  if (!currentUser) {
    console.error("No current user detected. Authentication state:", auth.currentUser);
    alert("User not logged in. Please log in first.");
    window.location.href = "index.html";
    return;
  }
  console.log("Current User:", currentUser.uid, currentUser.email);

  // Collect and validate form data
  const name = document.getElementById("name").value.trim();
  const mobile = document.getElementById("mobileNumber").value.trim();
  const dateInput = document.getElementById("bookingDate").value;
  const payment = document.getElementById("paymentMethod").value;

  console.log("Form Data:", { name, mobile, dateInput, payment });

  if (!name || !mobile || !dateInput) {
    alert("All fields (Name, Mobile Number, and Booking Date) are required.");
    return;
  }

  // Validate online payment
  if (payment === "Online Payment" && isOnlinePayment) {
    const qrVisible = !document.getElementById("qrSection").classList.contains("hidden");
    if (qrVisible) {
      alert("Please confirm payment by clicking 'I've Paid' before submitting.");
      return;
    }
  }

  // Validate and parse booking date
  const bookingDate = new Date(dateInput);
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0); // Normalize to midnight for comparison
  console.log("Current Date:", currentDate.toLocaleString(), "Input Date:", dateInput, "Parsed Date:", bookingDate.toLocaleString());

  if (isNaN(bookingDate.getTime())) {
    alert("Invalid booking date. Please use format YYYY-MM-DD (e.g., 2025-09-01).");
    return;
  }
  if (bookingDate <= currentDate) {
    alert("Booking date must be in the future. Current date is " + currentDate.toLocaleDateString());
    return;
  }

  // Calculate 30-day window
  const thirtyDaysAgo = new Date(currentDate);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  console.log("Thirty Days Ago:", thirtyDaysAgo.toLocaleString());

  const thirtyDaysAgoTS = firebase.firestore.Timestamp.fromDate(thirtyDaysAgo);
  const bookingDateTS = firebase.firestore.Timestamp.fromDate(bookingDate);

  // Check for recent bookings
  db.collection("bookings")
    .where("userId", "==", currentUser.uid)
    .get()
    .then((snap) => {
      console.log("Firestore Query Result:", snap.size, "documents found");
      let hasRecentBooking = false;

      snap.forEach((doc) => {
        const data = doc.data();
        if (!data.bookingDate) {
          console.warn("Missing bookingDate in document:", doc.id);
          return;
        }
        const docDate = data.bookingDate.toDate();
        console.log("Existing Booking Date:", docDate.toLocaleString());
        if (docDate >= thirtyDaysAgoTS.toDate()) {
          hasRecentBooking = true;
        }
      });

      if (hasRecentBooking) {
        alert("You already booked a cylinder in the last 30 days.");
        return;
      }

      // Submit new booking
      const bookingData = {
        userId: currentUser.uid,
        email: currentUser.email,
        name,
        mobileNumber: mobile,
        bookingDate: bookingDateTS,
        paymentMethod: payment,
        status: "pending",
        createdAt: firebase.firestore.Timestamp.now()
      };

      return db.collection("bookings").add(bookingData);
    })
    .then((docRef) => {
      console.log("Booking successfully added with ID:", docRef.id);
      alert("Booking submitted successfully!");
      document.getElementById("name").value = "";
      document.getElementById("mobileNumber").value = "";
      document.getElementById("bookingDate").value = "";
      document.getElementById("paymentMethod").value = "Cash on Delivery";
      if (document.getElementById("qrSection")) {
        document.getElementById("qrSection").classList.add("hidden");
      }
    })
    .catch((error) => {
      console.error("❌ Booking submission failed:", {
        code: error.code,
        message: error.message,
        stack: error.stack,
        details: error.details
      });
      alert("Something went wrong. Please try again. Error: " + error.message + " (Code: " + error.code + ")");
    });
}

// Request Extra Cylinder
function requestExtraCylinder() {
  if (!currentUser) {
    alert("User not logged in.");
    return;
  }

  db.collection("extraCylinderRequests")
    .where("userId", "==", currentUser.uid)
    .where("status", "==", "pending")
    .get()
    .then((snapshot) => {
      if (!snapshot.empty) {
        alert("You have already requested an extra cylinder.");
      } else {
        db.collection("extraCylinderRequests")
          .add({
            userId: currentUser.uid,
            email: currentUser.email,
            status: "pending",
            requestedAt: firebase.firestore.Timestamp.now()
          })
          .then(() => {
            alert("Extra cylinder request submitted.");
          })
          .catch((error) => {
            console.error("Extra cylinder request failed:", error);
            alert("Failed to submit request. Error: " + error.message);
          });
      }
    })
    .catch((error) => {
      console.error("Error checking requests:", error);
      alert("Something went wrong while checking requests.");
    });
}

function logout() {
  firebase.auth().signOut()
    .then(() => {
      alert("Logged out successfully.");
      window.location.href = "index.html";
    })
    .catch((error) => {
      console.error("Logout error:", error);
      alert("Error while logging out. Try again.");
    });
}