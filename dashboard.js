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

// ✅ Detect logged-in user
auth.onAuthStateChanged((user) => {
  if (user) {
    currentUser = user;
    console.log("Logged in as:", user.email);
  } else {
    alert("User not logged in. Please log in first.");
    // Optionally redirect: window.location.href = "login.html";
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
    db.collection("bookings")
      .where("userId", "==", currentUser.uid)
      .orderBy("createdAt", "desc")
      .get(),
    db.collection("extraCylinderRequests")
      .where("userId", "==", currentUser.uid)
      .get()
  ])
    .then(([bookingsSnap, extrasSnap]) => {
      historyList.innerHTML = "";

      bookingsSnap.forEach((doc) => {
        const data = doc.data();
        const li = document.createElement("li");
        li.textContent = `📦 ${data.name} | ${new Date(data.bookingDate.toDate()).toLocaleDateString()} | Status: ${data.status}`;
        historyList.appendChild(li);
      });

      extrasSnap.forEach((doc) => {
        const data = doc.data();
        const li = document.createElement("li");
        li.textContent = `➕ Extra Cylinder Request on ${new Date(data.requestedAt.toDate()).toLocaleDateString()} | Status: ${data.status}`;
        historyList.appendChild(li);
      });

      if (!historyList.hasChildNodes()) {
        historyList.innerHTML = "<li>No data found.</li>";
      }
    })
    .catch((error) => {
      console.error("Error fetching history:", error);
      alert("Something went wrong while checking your booking history.");
    });
}

// ✅ FIXED: Submit Booking (one per 30 days)
function submitBooking() {
  if (!currentUser) {
    alert("User not logged in.");
    return;
  }

  const name = document.getElementById("name").value.trim();
  const mobile = document.getElementById("mobileNumber").value.trim();
  const date = document.getElementById("bookingDate").value;
  const payment = document.getElementById("paymentMethod").value;

  if (!name || !mobile || !date) {
    alert("All fields are required.");
    return;
  }

  const bookingDate = new Date(date);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const thirtyDaysAgoTS = firebase.firestore.Timestamp.fromDate(thirtyDaysAgo);
  const bookingDateTS = firebase.firestore.Timestamp.fromDate(bookingDate);

  console.log("Checking for existing bookings after:", thirtyDaysAgoTS.toDate());

  db.collection("bookings")
    .where("userId", "==", currentUser.uid)
    .get()
    .then((snap) => {
      let hasRecentBooking = false;

      snap.forEach(doc => {
        const data = doc.data();
        if (data.bookingDate && data.bookingDate.toDate() >= thirtyDaysAgoTS.toDate()) {
          hasRecentBooking = true;
        }
      });

      if (hasRecentBooking) {
        alert("You already booked a cylinder in the last 30 days.");
        return;
      }

      const data = {
        userId: currentUser.uid,
        email: currentUser.email,
        name,
        mobileNumber: mobile,
        bookingDate: bookingDateTS,
        paymentMethod: payment,
        status: "pending",
        createdAt: firebase.firestore.Timestamp.now()
      };

      db.collection("bookings").add(data)
        .then(() => {
          alert("Booking submitted!");
          document.getElementById("name").value = "";
          document.getElementById("mobileNumber").value = "";
          document.getElementById("bookingDate").value = "";
          document.getElementById("paymentMethod").value = "Cash on Delivery";
        })
        .catch((error) => {
          console.error("❌ Booking submission failed:", error);
          alert("Something went wrong. Please try again.");
        });
    })
    .catch((error) => {
      console.error("❌ Error checking previous bookings:", error);
      alert("Error: " + error.message);
    });
}


// Request Extra Cylinder
function requestExtraCylinder() {
  if (!currentUser) return alert("User not logged in.");

  db.collection("extraCylinderRequests").add({
    userId: currentUser.uid,
    email: currentUser.email,
    status: "pending",
    requestedAt: firebase.firestore.Timestamp.now()
  })
    .then(() => alert("Extra cylinder request submitted."))
    .catch((err) => {
      console.error("Extra request failed:", err);
      alert("Something went wrong while submitting the extra cylinder request.");
    });
}
