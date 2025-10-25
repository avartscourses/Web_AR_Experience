// ===== Global state & helpers =====
const ambientAudio = document.getElementById("ambientAudio");
const voiceToggle  = document.getElementById("voiceToggle");
const titleEl      = document.getElementById("title");
const storyEl      = document.getElementById("storyText");
const buttonsEl    = document.getElementById("buttonsContainer");
const gameWrap     = document.getElementById("gameContainer");

let soundEnabled = false;
let narrationUtterance = null;
let currentStage = "intro";

// ===== Stage definitions =====
const STAGES = {
  intro: {
    bg: "assets/intro.png",
    title: "Olympus Rising",
    text: `Strange forces stir atop Mount Olympus. Laughter echoes where no one stands.
The gods are silent. The mountain watches.
You came here for adventure. Now, you're caught in something far more mysterious.`,
    buttons: [
      { label: "Start", action: () => {
          enableSound();
          playAmbient();
          speak(STAGES.intro.text);
          buttonsEl.innerHTML = "";
          const contBtn = document.createElement("button");
          contBtn.textContent = "Continue";
          contBtn.addEventListener("click", () => goTo("role"));
          buttonsEl.appendChild(contBtn);
      }}
    ]
  },

  role: {
    bg: "assets/role-selection.png",
    title: "Choose Your Role",
    text: `Two paths, one mystery. Work together and share what you discover.`,
    buttons: [
      { label: "Lore Keeper", action: () => goTo("lore") },
      { label: "Instructions", action: () => goTo("instructions") }
    ]
  },

  lore: {
    bg: "assets/lore-keeper.png",
    title: "Lore Keeper",
    text: `Use AR to uncover Hermes' traces. Share what you find with your partner.`,
    buttons: [
      { label: "Explore via AR", action: () => {
          stopAmbient();
          window.open(`ar.html?from=${currentStage}`, "_blank");
      }},
      { label: "Finish Task", action: () => goTo("end") },
      { label: "How to Play", action: () => goTo("instructions_lore") },
      { label: "Back", action: () => goTo("role") }
    ]
  },

  instructions: {
    bg: "assets/instructions.png",
    title: "How to Play — Overview",
    text: `Two roles: Lore Keeper scans clues with AR.
Share your intel with your partner.`,
    buttons: [
      { label: "Back", action: () => goTo("role") }
    ]
  },

  instructions_lore: {
    bg: "assets/instructions.png",
    title: "How to Play — AR",
    text: `
      • To complete your task, download the newspaper issues, use your mobile device and allow camera access it.<br>
      &nbsp;&nbsp;<a href="assets/pdfs/issue1.pdf" target="_blank">Download Issue 1 (PDF)</a><br>
      &nbsp;&nbsp;<a href="assets/pdfs/issue2.pdf" target="_blank">Download Issue 2 (PDF)</a><br>
      &nbsp;&nbsp;<a href="assets/pdfs/issue3.pdf" target="_blank">Download Issue 3 (PDF)</a><br>
      • Study the newspaper issues to find and scan the markers. Listen carefully to the messages.<br>
      • Share the decoded hints with your partner.
    `,
    buttons: [
      { label: "Back", action: () => goTo("lore") }
    ]
  },

  end: {
    bg: "assets/olympus.jpg",
    title: "Task Complete",
    text: `You have completed your task. Share your findings and return to the role menu.`,
    buttons: [
      { label: "Back to Role Selection", action: () => goTo("role") },
      { label: "Restart", action: () => goTo("intro", true) }
    ]
  }
};

// ===== Sound / Narration =====
function enableSound() {
  soundEnabled = true;
  voiceToggle.classList.add("active");
  voiceToggle.textContent = "🔊";
}
function disableSound() {
  soundEnabled = false;
  voiceToggle.classList.remove("active");
  voiceToggle.textContent = "🔇";
  cancelNarration();
  stopAmbient();
}
function playAmbient() {
  if (!soundEnabled) return;
  ambientAudio.volume = 0.4;
  ambientAudio.play().catch(() => {});
}
function stopAmbient() { ambientAudio.pause(); }
function cancelNarration() {
  try {
    if (speechSynthesis.speaking || speechSynthesis.pending) {
      speechSynthesis.cancel();
    }
  } catch {}
}
function speak(text) {
  cancelNarration();
  if (!soundEnabled) return;
  let plainText = text.replace(/<a[^>]*>.*?<\/a>/gi, "");
  plainText = plainText.replace(/(<([^>]+)>)/gi, "");
  plainText = plainText.replace(/&[a-z]+;/gi, " ");
  plainText = plainText.replace(/\s+/g, " ").trim();
  const u = new SpeechSynthesisUtterance(plainText);
  u.lang = "en-GB";
  u.rate = 1.05;
  u.pitch = 1.0;
  narrationUtterance = u;
  speechSynthesis.speak(u);
}
voiceToggle.addEventListener("click", () => {
  if (soundEnabled) {
    disableSound();
  } else {
    enableSound();
    playAmbient();
    if (STAGES[currentStage]) speak(STAGES[currentStage].text);
  }
});

// ===== Navigation =====
function goTo(stage, resetAll = false) {
  currentStage = stage;
  const s = STAGES[stage];
  if (!s) return;

  if (s.bg) gameWrap.style.backgroundImage = `url('${s.bg}')`;
  titleEl.textContent = s.title || "";
  storyEl.innerHTML = s.text || "";

  buttonsEl.innerHTML = "";
  (s.buttons || []).forEach(b => {
    const btn = document.createElement("button");
    btn.textContent = b.label;
    btn.addEventListener("click", b.action);
    buttonsEl.appendChild(btn);
  });

  if (soundEnabled) speak(s.text || "");
}

// ===== Init =====
window.addEventListener("load", () => {
  const params = new URLSearchParams(window.location.search);
  const section = params.get('section');
  if (section && STAGES[section]) {
    goTo(section);
  } else {
    goTo("intro");
  }
});
