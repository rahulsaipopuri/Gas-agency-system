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
  if (!user) {
    alert("You are not logged in.");
    window.location.href = "admin-login.html";
    return;
  }

  const email = user.email.toLowerCase(); // normalize case
  if (email.startsWith("admin")) {
    loadRequests(); // ✅ Allow access
  } else {
    alert("Access denied. Only admin users allowed.");
    firebase.auth().signOut().then(() => {
      window.location.href = "admin-login.html";
    });
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

        let bookingDate = "N/A";
        if (data.bookingDate && typeof data.bookingDate.toDate === "function") {
          bookingDate = data.bookingDate.toDate().toLocaleDateString();
        }

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

        let requestedAt = "N/A";
        if (data.requestedAt && typeof data.requestedAt.toDate === "function") {
          requestedAt = data.requestedAt.toDate().toLocaleString();
        }

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
  db.collection("bookings").doc(id).get().then((docSnap) => {
    const data = docSnap.data();

    db.collection("bookings").doc(id).update({ status: newStatus })
      .then(() => {
        sendBookingEmail(data.email, data.name || "Customer", newStatus); // <-- add this
        alert("Booking status updated.");
        loadRequests();
      })
      .catch((err) => {
        alert("Failed to update booking: " + err.message);
      });
  });
}
function sendBookingEmail(toEmail, toName, status) {
  const templateParams = {
    to_email: toEmail,
    to_name: toName,
    status: status
  };

  emailjs.send("service_gk4khie", "template_p1rs2zd", templateParams)
    .then(() => {
      console.log("✅ Email sent to", toEmail);
    })
    .catch((error) => {
      console.error("❌ Email failed:", error);
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
function logout() {
  firebase.auth().signOut()
    .then(() => {
      alert("Logged out successfully.");
      window.location.href = "index.html";  // Redirect to login page
    })
    .catch((error) => {
      console.error("Logout failed:", error);
      alert("Error while logging out.");
    });
}
function exportBookingsToExcel() {
  db.collection("bookings").get()
    .then((querySnapshot) => {
      const bookings = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        bookings.push({
          Name: data.name || "N/A",
          Email: data.email || "N/A",
          Mobile: data.mobileNumber || "N/A",
          Date: data.bookingDate?.toDate().toLocaleDateString() || "N/A",
          Payment: data.paymentMethod || "N/A",
          Status: data.status || "N/A"
        });
      });

      if (bookings.length === 0) {
        alert("No booking data to export.");
        return;
      }

      // Generate worksheet and workbook
      const worksheet = XLSX.utils.json_to_sheet(bookings);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Bookings");

      // Trigger download
      XLSX.writeFile(workbook, "Booking_Requests.xlsx");
    })
    .catch((error) => {
      console.error("Error exporting bookings:", error);
      alert("Failed to export data.");
    });
}

