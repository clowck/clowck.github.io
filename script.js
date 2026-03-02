const segmentMap = {
  0: ["a", "b", "c", "d", "e", "f"],
  1: ["b", "c"],
  2: ["a", "b", "g", "e", "d"],
  3: ["a", "b", "g", "c", "d"],
  4: ["f", "g", "b", "c"],
  5: ["a", "f", "g", "c", "d"],
  6: ["a", "f", "g", "e", "c", "d"],
  7: ["a", "b", "c"],
  8: ["a", "b", "c", "d", "e", "f", "g"],
  9: ["a", "b", "c", "d", "f", "g"]
};

const segmentNames = ["a", "b", "c", "d", "e", "f", "g"];
const digitNodes = Array.from(document.querySelectorAll(".digit"));
const colonHourMinute = document.querySelector('[data-colon="c1"]');
const colonMinuteSecond = document.querySelector('[data-colon="c2"]');
const ampmNode = document.getElementById("ampm");
const dateLineNode = document.getElementById("dateLine");
const fullscreenToggle = document.getElementById("fullscreenToggle");

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric"
});

function buildDigit(node) {
  const parts = {};
  segmentNames.forEach((name) => {
    const seg = document.createElement("span");
    seg.className = `segment ${name}`;
    node.appendChild(seg);
    parts[name] = seg;
  });
  return parts;
}

const digits = digitNodes.map(buildDigit);

function updateFullscreenLabel() {
  const isFullscreen = !!document.fullscreenElement;
  fullscreenToggle.textContent = isFullscreen ? "Exit Fullscreen" : "Fullscreen";
}

async function toggleFullscreen() {
  if (!document.fullscreenElement) {
    await document.documentElement.requestFullscreen();
    return;
  }
  await document.exitFullscreen();
}

fullscreenToggle.addEventListener("click", async () => {
  try {
    await toggleFullscreen();
  } catch (error) {
    console.error("Fullscreen request failed:", error);
  }
});

document.addEventListener("fullscreenchange", updateFullscreenLabel);

function setDigit(index, value) {
  const active = new Set(segmentMap[value] || []);
  segmentNames.forEach((name) => {
    digits[index][name].classList.toggle("on", active.has(name));
  });
}

function updateClock() {
  const now = new Date();
  const seconds = now.getSeconds();
  const minutes = now.getMinutes();
  const rawHours = now.getHours();
  const isPM = rawHours >= 12;
  const hours12 = rawHours % 12 || 12;

  const timeString = [hours12, minutes, seconds]
    .map((part) => String(part).padStart(2, "0"))
    .join("");

  for (let i = 0; i < timeString.length; i += 1) {
    setDigit(i, Number(timeString[i]));
  }

  // HH:MM colon blinks only when minute changes (at second 00).
  const minuteChangeBlink = seconds === 0 && now.getMilliseconds() < 500;
  colonHourMinute.classList.toggle("off", minuteChangeBlink);

  // MM:SS colon blinks in sync with seconds.
  const secondSyncBlinkOn = seconds % 2 === 0;
  colonMinuteSecond.classList.toggle("off", !secondSyncBlinkOn);

  ampmNode.innerHTML = isPM ? "P<sub>M</sub>" : "A<sub>M</sub>";
  dateLineNode.textContent = dateFormatter.format(now);
}

updateClock();
updateFullscreenLabel();
setInterval(updateClock, 200);
