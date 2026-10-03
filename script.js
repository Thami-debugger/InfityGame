const selectedGameButtons = document.querySelectorAll("[data-game]");
const payForm = document.querySelector("#pay-form");
const payAmount = document.querySelector("#pay-amount");
const payItem = document.querySelector("#pay-item");
const paySubmit = document.querySelector("#pay-submit");
const paySummary = document.querySelector("#pay-summary");
const payQty = document.querySelector("#pay-qty");
const payQtyWrap = document.querySelector("#pay-qty-wrap");
const payReset = document.querySelector("#pay-reset");
const sceneDialog = document.querySelector("#scene-dialog");
const scenePlay = document.querySelector("#scene-play");
const dialogClose = document.querySelector(".dialog-close");
const sceneVideo = document.querySelector("#scene-dialog video");
const reelDurationSeconds = 30;

const MEMBER_PASS = { name: "Infinity Member Pass (monthly)", label: "Member pass", price: 700 };
let current = { ...MEMBER_PASS, perGame: false };

const updatePayment = () => {
  const qty = current.perGame ? Math.min(20, Math.max(1, parseInt(payQty.value, 10) || 1)) : 1;
  const total = (current.price * qty).toFixed(2);
  payAmount.value = total;
  payItem.value = current.perGame ? `${current.name} x${qty}` : current.name;
  paySummary.innerHTML = `${current.perGame ? `${current.label} &times; ${qty}` : current.label} &mdash; R${total}`;
  paySubmit.firstChild.textContent = `Pay R${total} with PayFast `;
  payQtyWrap.hidden = payReset.hidden = !current.perGame;
};

selectedGameButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const game = button.dataset.game;
    current = { name: `Infinity Games - ${game}`, label: game, price: parseFloat(button.dataset.price), perGame: true };
    payQty.value = 1;
    updatePayment();
    document.querySelector("#book").scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

payQty.addEventListener("input", updatePayment);
payReset.addEventListener("click", () => {
  current = { ...MEMBER_PASS, perGame: false };
  updatePayment();
});
payForm.addEventListener("submit", updatePayment);
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