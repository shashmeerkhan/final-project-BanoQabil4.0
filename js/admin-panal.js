// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyDZpPjrUPavZ6dqTZbDbzjjUuPk9oJ5b68",
  authDomain: "nueplex-seatbooking.firebaseapp.com",
  projectId: "nueplex-seatbooking",
  storageBucket: "nueplex-seatbooking.appspot.com",
  messagingSenderId: "1042991524918",
  appId: "1:1042991524918:web:9b8e4c3ee71a143f25bc97"
};

// Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import {
  getFirestore, collection, addDoc, getDoc, setDoc,
  updateDoc, deleteDoc, onSnapshot, doc
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
let currentEditingDocId = null;

// Show Message Box
function showMessageBox(message, type = 'alert', onConfirm = null) {
  const overlay = document.getElementById("messageBoxOverlay");
  const box = document.getElementById("messageBox");
  const text = document.getElementById("messageBoxText");
  const confirm = document.getElementById("messageBoxConfirmBtn");
  const cancel = document.getElementById("messageBoxCancelBtn");

  text.textContent = message;
  overlay.style.display = "block";
  box.style.display = "flex";

  confirm.onclick = () => {
    box.style.display = "none";
    overlay.style.display = "none";
    if (onConfirm) onConfirm();
  };

  if (type === "confirm") {
    cancel.style.display = "inline-block";
    cancel.onclick = () => {
      box.style.display = "none";
      overlay.style.display = "none";
    };
  } else {
    cancel.style.display = "none";
  }
}

// Auth State
onAuthStateChanged(auth, (user) => {
  const login = document.getElementById("loginForm");
  const panel = document.getElementById("bookingsPanel");
  const userIdDisplay = document.getElementById("userIdDisplay");

  if (user) {
    login.classList.add("hidden");
    panel.classList.remove("hidden");
    userIdDisplay.textContent = `Logged in as: ${user.uid}`;
    loadBookings();
  } else {
    login.classList.remove("hidden");
    panel.classList.add("hidden");
    userIdDisplay.textContent = "";
  }
});

// Login
document.getElementById("adminLoginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("adminEmail").value;
  const password = document.getElementById("adminPassword").value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    showMessageBox("Login successful!");
  } catch (err) {
    showMessageBox("Login failed: " + err.message);
  }
});

// Load Bookings
function loadBookings() {
  const q = collection(db, "bookings");
  const tbody = document.getElementById("bookingData");

  onSnapshot(q, (snapshot) => {
    tbody.innerHTML = "";

    if (snapshot.empty) {
      tbody.innerHTML = `<tr><td colspan="8" class="text-center py-4 text-gray-500">No bookings found.</td></tr>`;
      return;
    }

    snapshot.forEach(docSnap => {
      const d = docSnap.data();
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${d.name}</td>
        <td>${d.contact}</td>
        <td>${d.email}</td>
        <td>${d.movie}</td>
        <td>${d.tickets}</td>
        <td>${d.date}</td>
        <td>${d.time}</td>
        <td class="flex justify-center space-x-2">
          <button onclick="editBooking('${docSnap.id}')" class="edit px-3 py-1 text-sm rounded-md">Edit</button>
          <button onclick="deleteBooking('${docSnap.id}')" class="danger px-3 py-1 text-sm rounded-md">Delete</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  });
}

// Add / Update Booking
document.getElementById("bookingForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = {
    name: document.getElementById("bookingName").value,
    contact: document.getElementById("bookingContact").value,
    email: document.getElementById("bookingEmail").value,
    movie: document.getElementById("bookingMovie").value,
    tickets: parseInt(document.getElementById("bookingTickets").value),
    date: document.getElementById("bookingDate").value,
    time: document.getElementById("bookingTime").value,
    timestamp: new Date()
  };

  try {
    if (currentEditingDocId) {
      await updateDoc(doc(db, "bookings", currentEditingDocId), data);
      showMessageBox("Booking updated successfully!");
    } else {
      await addDoc(collection(db, "bookings"), data);
      showMessageBox("Booking added successfully!");
    }
    resetForm();
  } catch (err) {
    showMessageBox("Error: " + err.message);
  }
});

// Edit Booking
window.editBooking = async (id) => {
  const docRef = doc(db, "bookings", id);
  const snap = await getDoc(docRef);
  const data = snap.data();

  document.getElementById("bookingName").value = data.name;
  document.getElementById("bookingContact").value = data.contact;
  document.getElementById("bookingEmail").value = data.email;
  document.getElementById("bookingMovie").value = data.movie;
  document.getElementById("bookingTickets").value = data.tickets;
  document.getElementById("bookingDate").value = data.date;
  document.getElementById("bookingTime").value = data.time;

  document.getElementById("submitBookingBtn").textContent = "Update Booking";
  document.getElementById("cancelEditBtn").classList.remove("hidden");
  currentEditingDocId = id;
};

// Delete Booking
window.deleteBooking = (id) => {
  showMessageBox("Are you sure you want to delete?", "confirm", async () => {
    await deleteDoc(doc(db, "bookings", id));
    showMessageBox("Booking deleted.");
  });
};

// Reset Form
window.resetForm = () => {
  document.getElementById("bookingForm").reset();
  document.getElementById("submitBookingBtn").textContent = "Add Booking";
  document.getElementById("cancelEditBtn").classList.add("hidden");
  currentEditingDocId = null;
};

// Logout
window.logout = () => {
  signOut(auth).then(() => {
    showMessageBox("Logged out successfully!");
    resetForm();
  }).catch(err => {
    showMessageBox("Logout error: " + err.message);
  });
};
