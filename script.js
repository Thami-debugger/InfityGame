const selectedGameButtons = document.querySelectorAll("[data-game]");
const membershipButton = document.querySelector(".button-light");
const sceneDialog = document.querySelector("#scene-dialog");
const scenePlay = document.querySelector("#scene-play");
const dialogClose = document.querySelector(".dialog-close");
const sceneVideo = document.querySelector("#scene-dialog video");
const reelDurationSeconds = 30;

selectedGameButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const game = button.dataset.game;
    membershipButton.textContent = `Ask about ${game} play`;
    document.querySelector("#book").scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

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