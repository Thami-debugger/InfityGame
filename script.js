const sceneDialog = document.querySelector("#scene-dialog");
const scenePlay = document.querySelector("#scene-play");
const dialogClose = document.querySelector(".dialog-close");
const sceneVideo = document.querySelector("#scene-dialog video");
const reelDurationSeconds = 30;

const stopAtReelEnd = () => {
  if (sceneVideo.currentTime >= reelDurationSeconds) {
    sceneVideo.currentTime = reelDurationSeconds;
    sceneVideo.pause();
  }
};

sceneVideo.addEventListener("timeupdate", stopAtReelEnd);
sceneVideo.addEventListener("seeking", stopAtReelEnd);
scenePlay.addEventListener("click", () => sceneDialog.showModal());
dialogClose.addEventListener("click", () => sceneDialog.close());
sceneDialog.addEventListener("click", (event) => {
  if (event.target === sceneDialog) sceneDialog.close();
});

const bookingDialog = document.querySelector("#booking-dialog");
const bookingForm = document.querySelector("#booking-form");
const bookingDate = document.querySelector("#booking-date");
const bookingTime = document.querySelector("#booking-time");
const bookingGame = document.querySelector("#booking-game");
const bookingAvailability = document.querySelector("#booking-availability");
const confirmationDialog = document.querySelector("#confirmation-dialog");
const confirmationMessage = document.querySelector("#confirmation-message");
const bookingClose = document.querySelector("#booking-close");
const confirmationClose = document.querySelector("#confirmation-close");
const bookingStorageKey = "infinity-bookings";
const pendingStorageKey = "infinity-pending-booking";
const publicSiteUrl = "https://thami-debugger.github.io/InfityGame/";
const timeSlots = ["10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30"];
let selectedGame = null;

const getBookings = () => JSON.parse(localStorage.getItem(bookingStorageKey) || "[]");
const bookingId = (game, date, time) => `${game}|${date}|${time}`;
const isBooked = (game, date, time) => getBookings().some((booking) => booking.id === bookingId(game, date, time));
const getLocalDate = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
const isPastTime = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  const now = new Date();
  return hours < now.getHours() || (hours === now.getHours() && minutes <= now.getMinutes());
};

const updateTimeSlots = () => {
  const date = bookingDate.value;
  const booked = selectedGame && date ? getBookings().filter((booking) => booking.game === selectedGame.game && booking.date === date).map((booking) => booking.time) : [];
  const availableSlots = timeSlots.filter((time) => !booked.includes(time) && !(date === getLocalDate() && isPastTime(time)));
  bookingTime.replaceChildren();
  availableSlots.forEach((time) => {
    const option = document.createElement("option");
    option.value = time;
    option.textContent = time;
    bookingTime.append(option);
  });
  bookingTime.disabled = bookingTime.options.length === 0;
  bookingAvailability.textContent = bookingTime.disabled
    ? (date === getLocalDate() ? "There are no future times left today. Please choose another day." : "This day is fully booked. Please choose another day.")
    : `${bookingTime.options.length} time${bookingTime.options.length === 1 ? "" : "s"} available.`;
};

const openBooking = (event) => {
  selectedGame = { game: event.currentTarget.dataset.game, price: event.currentTarget.dataset.price };
  bookingGame.textContent = `${selectedGame.game.toUpperCase()}.`;
  bookingDate.value = "";
  updateTimeSlots();
  bookingDialog.showModal();
};

document.querySelectorAll(".game-select").forEach((button) => button.addEventListener("click", openBooking));
bookingDate.min = getLocalDate();
bookingDate.addEventListener("change", updateTimeSlots);
bookingClose.addEventListener("click", () => bookingDialog.close());
bookingDialog.addEventListener("click", (event) => {
  if (event.target === bookingDialog) bookingDialog.close();
});

bookingForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const booking = {
    id: bookingId(selectedGame.game, bookingDate.value, bookingTime.value),
    game: selectedGame.game,
    price: selectedGame.price,
    date: bookingDate.value,
    time: bookingTime.value
  };
  if (!booking.date || !booking.time || (booking.date === getLocalDate() && isPastTime(booking.time)) || isBooked(booking.game, booking.date, booking.time)) {
    updateTimeSlots();
    return;
  }
  localStorage.setItem(pendingStorageKey, JSON.stringify(booking));
  const paymentForm = document.createElement("form");
  paymentForm.action = "https://www.payfast.co.za/eng/process";
  paymentForm.method = "POST";
  [
    ["merchant_id", "30190175"],
    ["merchant_key", "w8s8ndvwk7qld"],
    ["amount", selectedGame.price],
    ["item_name", `Infinity Games - ${selectedGame.game} (${booking.date} ${booking.time})`],
    ["return_url", `${publicSiteUrl}?booking=confirmed`],
    ["cancel_url", `${publicSiteUrl}?booking=cancelled`]
  ].forEach(([name, value]) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    paymentForm.append(input);
  });
  document.body.append(paymentForm);
  paymentForm.submit();
});

const confirmPendingBooking = () => {
  if (new URLSearchParams(window.location.search).get("booking") !== "confirmed") return;
  const pending = JSON.parse(localStorage.getItem(pendingStorageKey) || "null");
  if (!pending) return;
  const bookings = getBookings();
  if (!bookings.some((booking) => booking.id === pending.id)) {
    bookings.push({ ...pending, confirmedAt: new Date().toISOString() });
    localStorage.setItem(bookingStorageKey, JSON.stringify(bookings));
  }
  localStorage.removeItem(pendingStorageKey);
  confirmationMessage.textContent = `${pending.game} is booked for ${pending.date} at ${pending.time}. Your payment was received and your station is confirmed.`;
  confirmationDialog.showModal();
};

confirmationClose.addEventListener("click", () => confirmationDialog.close());
confirmPendingBooking();