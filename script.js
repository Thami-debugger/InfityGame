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