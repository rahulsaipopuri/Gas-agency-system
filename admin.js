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
const db = firebase.firestore();

// ✅ Only allow access for authenticated admin
firebase.auth().onAuthStateChanged((user) => {
  if (!user || user.email !== "admin@gmail.com") {
    alert("You are not authorized to access this page.");
    window.location.href = "admin-login.html";
  } else {
    loadRequests();
  }
});

function loadRequests() {
  loadNormalBookings();
  loadExtraCylinderRequests();
}

function loadNormalBookings() {
  const list = document.getElementById("bookingList");
  list.innerHTML = "Loading booking requests...";

  db.collection("bookings")
    .where("status", "==", "pending")
    .get()
    .then((querySnapshot) => {
      list.innerHTML = "";

      if (querySnapshot.empty) {
        list.innerHTML = "<p>No normal booking requests found.</p>";
        return;
      }

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const bookingDate = data.bookingDate?.toDate().toLocaleDateString() || "N/A";

        const div = document.createElement("div");
        div.innerHTML = `
          <p>📝 Booking<br>
          Name: ${data.name || "N/A"}<br>
          Email: ${data.email}<br>
          Mobile: ${data.mobileNumber || "N/A"}<br>
          Date: ${bookingDate}<br>
          Payment: ${data.paymentMethod || "N/A"}</p>
          <button onclick="updateBookingStatus('${doc.id}', 'approved')">Approve</button>
          <button onclick="updateBookingStatus('${doc.id}', 'denied')">Deny</button>
          <hr/>
        `;
        list.appendChild(div);
      });
    })
    .catch((error) => {
      list.innerHTML = `<p>Error loading bookings: ${error.message}</p>`;
      console.error("Bookings error:", error);
    });
}

function loadExtraCylinderRequests() {
  const list = document.getElementById("requestList");
  list.innerHTML = "Loading extra requests...";

  db.collection("extraCylinderRequests")
    .where("status", "==", "pending")
    .get()
    .then((querySnapshot) => {
      list.innerHTML = "";

      if (querySnapshot.empty) {
        list.innerHTML = "<p>No extra cylinder requests found.</p>";
        return;
      }

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const requestedAt = data.requestedAt?.toDate().toLocaleString() || "N/A";

        const div = document.createElement("div");
        div.innerHTML = `
          <p>📦 Extra Cylinder Request<br>
          Email: ${data.email}<br>
          Requested At: ${requestedAt}</p>
          <button onclick="updateExtraStatus('${doc.id}', 'approved')">Approve</button>
          <button onclick="updateExtraStatus('${doc.id}', 'denied')">Deny</button>
          <hr/>
        `;
        list.appendChild(div);
      });
    })
    .catch((error) => {
      list.innerHTML = `<p>Error loading extra requests: ${error.message}</p>`;
      console.error("Extra request error:", error);
    });
}

function updateBookingStatus(id, newStatus) {
  db.collection("bookings").doc(id).update({ status: newStatus })
    .then(() => {
      alert("Booking status updated.");
      loadRequests();
    })
    .catch((err) => {
      alert("Failed to update booking: " + err.message);
    });
}

function updateExtraStatus(id, newStatus) {
  db.collection("extraCylinderRequests").doc(id).update({ status: newStatus })
    .then(() => {
      if (newStatus === "approved") {
        db.collection("extraCylinderRequests").doc(id).get().then((docSnap) => {
          const data = docSnap.data();
          db.collection("bookings").add({
            userId: data.userId,
            email: data.email,
            name: "Extra Cylinder Request",
            mobileNumber: data.mobileNumber || "N/A",
            bookingDate: firebase.firestore.Timestamp.now(),
            paymentMethod: "N/A",
            status: "approved",
            createdAt: firebase.firestore.Timestamp.now()
          });
        });
      }
      alert("Extra request status updated.");
      loadRequests();
    })
    .catch((err) => {
      alert("Failed to update extra request: " + err.message);
    });
}
