
var firebaseConfig = {
  apiKey: "AIzaSy...YourAPIKey...",
  authDomain: "cinema-booking.firebaseapp.com",
  databaseURL: "https://cinema-booking.firebaseio.com",
  projectId: "cinema-booking",
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const seatGrid = document.getElementById("seatGrid");
const totalSeats = 50;
let selectedSeats = [];

function createSeats() {
  for (let i = 1; i <= totalSeats; i++) {
    const seat = document.createElement("div");
    seat.classList.add("seat");
    seat.innerText = i;
    seat.id = "seat-" + i;

    seat.addEventListener("click", () => {
      if (seat.classList.contains("booked")) return;
      seat.classList.toggle("selected");
      const seatNum = i.toString();
      if (selectedSeats.includes(seatNum)) {
        selectedSeats = selectedSeats.filter(s => s !== seatNum);
      } else {
        selectedSeats.push(seatNum);
      }
    });

    seatGrid.appendChild(seat);
  }

  db.ref("bookedSeats").once("value", (snapshot) => {
    const booked = snapshot.val() || {};
    Object.keys(booked).forEach(seatNum => {
      const seat = document.getElementById("seat-" + seatNum);
      if (seat) seat.classList.add("booked");
    });
  });
}

createSeats();

document.getElementById("submitBooking").addEventListener("click", () => {
  const name = document.getElementById("name").value;
  const contact = document.getElementById("contact").value;
  const email = document.getElementById("email").value;
  const date = document.getElementById("date").value;
  const time = document.getElementById("time").value;
  const movie = document.getElementById("movie").value;

  if (!name || !contact || !email || !date || !time || !movie || selectedSeats.length === 0) {
    alert("Please fill all fields and select at least one seat.");
    return;
  }

  const bookingId = db.ref("bookings").push().key;
  db.ref("bookings/" + bookingId).set({
    name, contact, email, date, time, movie, seats: selectedSeats
  });

  selectedSeats.forEach(seat => {
    db.ref("bookedSeats/" + seat).set(true);
    document.getElementById("seat-" + seat).classList.add("booked");
    document.getElementById("seat-" + seat).classList.remove("selected");
  });

  alert("Booking successful!");
  selectedSeats = [];
});
