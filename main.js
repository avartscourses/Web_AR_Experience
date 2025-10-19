// ===== Global state & helpers =====
const ambientAudio = document.getElementById("ambientAudio");
const voiceToggle  = document.getElementById("voiceToggle");
const titleEl      = document.getElementById("title");
const storyEl      = document.getElementById("storyText");
const buttonsEl    = document.getElementById("buttonsContainer");
const gameWrap     = document.getElementById("gameContainer");

// Chamber elements
const chamberUI    = document.getElementById("chamberUI");
const q1Block      = document.getElementById("q1");
const q2Block      = document.getElementById("q2");
const q1Feedback   = document.getElementById("q1feedback");
const puzzleResult = document.getElementById("puzzleResult");
const attemptsInfo = document.getElementById("attemptsInfo");
const checkPuzzleBtn = document.getElementById("checkPuzzleBtn");
const resetPuzzleBtn = document.getElementById("resetPuzzleBtn");
const finishBtn    = document.getElementById("finishBtn");
const exitBtn      = document.getElementById("exitBtn");

let soundEnabled = false;
let narrationUtterance = null;

// Attempts for entire chamber
const MAX_ATTEMPTS = 2;
let attemptsLeft = MAX_ATTEMPTS;

// Stage data
const STAGES = {
  intro: {
    bg: "assets/intro.png", // placeholder
    title: "Olympus Rising",
    text: `Strange forces stir atop Mount Olympus. Laughter echoes where no one stands.
The gods are silent. The mountain watches.
You came here for adventure. Now, you're caught in something far more dangerous.
Two of you have been chosen—each on a different path. Unite your paths to restore balance.`,
    buttons: [
  { label: "Start", action: () => {
      enableSound();
      playAmbient();
      speak(STAGES.intro.text);

      // Καθαρίζουμε τα αρχικά κουμπιά
      const buttonsEl = document.getElementById("buttonsContainer");
      buttonsEl.innerHTML = "";

      // Προσθέτουμε το κουμπί Continue
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
      { label: "Path Seeker", action: () => goTo("path") },
      { label: "Lore Keeper", action: () => goTo("lore") },
      { label: "Instructions", action: () => goTo("instructions") }
    ]
  },

  path: {
    bg: "assets/path_seeker.png",
    title: "Path Seeker",
    text: `Enter the metaverse at Mount Olympus. Zeus will reveal who opened the gate.
Remember: carry that knowledge back to Nemesis.`,
    buttons: [
      { label: "Explore Mount Olympus", action: () => {
          stopAmbient();
          window.open("https://www.spatial.io/s/Test_Zeus-687e566572cf55d3b72520d5?share=4939523995338131777", "_blank");
        }},
      { label: "How to Play", action: () => goTo("instructions_path") },
      { label: "Enter the Chamber of Nemesis", action: () => requestChamberPassword("path") },
      { label: "Back", action: () => goTo("role") }
    ]
  },

  lore: {
    bg: "assets/lore-keeper.png",
    title: "Lore Keeper",
    text: `Use AR to uncover Hermes' traces. Share what you find with your partner.
Then, enter the Chamber of Nemesis together.`,
    buttons: [
      { label: "Explore via AR", action: () => {
          stopAmbient();
         window.open(`ar.html?from=${currentStage}`, "_blank");
        }},
      { label: "How to Play", action: () => goTo("instructions_lore") },
      { label: "Enter the Chamber of Nemesis", action: () => requestChamberPassword("lore") },
      { label: "Back", action: () => goTo("role") }
    ]
  },

  instructions: {
    bg: "assets/instructions.png",
    title: "How to Play — Overview",
    text: `Two roles: Path Seeker explores the metaverse; Lore Keeper scans clues with AR.
Share your intel. You will need both perspectives to succeed in the Chamber of Nemesis.`,
    buttons: [
      { label: "Back", action: () => goTo("role") }
    ]
  },

  instructions_path: {
    bg: "assets/instructions.png",
    title: "How to Play — Metaverse",
    text: `On computer:<br><br>
• Use W, A, S, D keys to walk; hold Shift to run.<br>
• Move mouse to look around and turn.<br?
• Press Esc to leave the space.<br><br>

On mobile:<br><br>
• Use the on-screen joystick to walk.<br>
• Push joystick fully forward (or double-tap) to run.<br>
• Swipe to look around.<br>
• Tap the menu and select Leave to exit.<br><br>
Your task is to find Zeus who will tell you who left open the door of the sacred palace`,


    buttons: [
      { label: "Back", action: () => goTo("path") }
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
    • Study the newspaper issues to find and scan the markers. Listen carefully to the messages as they will help you understand why someone left open the door of the sacred palace.<br>
    • Share the decoded hints with your partner and enter the Chamber of Nemesis.
  `,
  buttons: [
    { label: "Back", action: () => goTo("lore") }
  ]
},



  chamber: {
    bg: "assets/temple.png",
    title: "Chamber of Nemesis",
    text: `Welcome, mortal. Reconstruct the truth and balance the scales.`,
    buttons: [
      { label: "Back", action: () => goTo("role") }
    ]
  },

  success: {
    bg: "assets/olympus.jpg",
    title: "Balance Restored",
    text: `You carried truth across worlds and faced Nemesis with resolve. Olympus is at peace… for now.`,
    buttons: [
      { label: "Play Again", action: () => goTo("intro", true) }
    ]
  },

  failure: {
    bg: "assets/failure.png",
    title: "The Scales Tip Against You",
    text: `Your attempts are spent. The gate remains ajar, and shadows grow. Try again with clearer eyes.`,
    buttons: [
      { label: "Play Again", action: () => goTo("intro", true) }
    ]
  }
};

let currentStage = "intro";

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
function stopAmbient() {
  ambientAudio.pause();
}
function cancelNarration() {
  try {
    if (speechSynthesis.speaking || speechSynthesis.pending) {
      speechSynthesis.cancel();
    }
  } catch {}
}
//function speak(text) {
  //cancelNarration();
  //if (!soundEnabled) return;
  //const u = new SpeechSynthesisUtterance(text);
  //u.lang = "en-GB";
  //u.rate = 1.05;
  //u.pitch = 1.0;
  //narrationUtterance = u;
  //speechSynthesis.speak(u);
//}

//function speak(text) {
  //cancelNarration();
  //if (!soundEnabled) return;
  // Strip HTML tags for TTS
  //const plainText = text.replace(/(<([^>]+)>)/gi, "");
  //const u = new SpeechSynthesisUtterance(plainText);
  //u.lang = "en-GB";
  //u.rate = 1.05;
  //u.pitch = 1.0;
  //narrationUtterance = u;
  //speechSynthesis.speak(u);
//}

function speak(text) {
  cancelNarration();
  if (!soundEnabled) return;

  // 1. Remove <a> links completely (both tag + content)
  let plainText = text.replace(/<a[^>]*>.*?<\/a>/gi, "");

  // 2. Remove all other HTML tags
  plainText = plainText.replace(/(<([^>]+)>)/gi, "");

  // 3. Remove HTML entities like &nbsp; &amp; etc.
  plainText = plainText.replace(/&[a-z]+;/gi, " ");

  // 4. Clean up extra spaces/newlines
  plainText = plainText.replace(/\s+/g, " ").trim();

  const u = new SpeechSynthesisUtterance(plainText);
  u.lang = "en-GB";
  u.rate = 1.05;
  u.pitch = 1.0;
  narrationUtterance = u;
  speechSynthesis.speak(u);
}


// Toggle button
voiceToggle.addEventListener("click", () => {
  if (soundEnabled) {
    disableSound();
  } else {
    enableSound();
    playAmbient();
    // Re-speak current stage text for convenience
    if (currentStage !== "chamber") speak(STAGES[currentStage]?.text || "");
  }
});

// ===== Navigation / Rendering =====
function goTo(stage, resetAll = false) {
  currentStage = stage;

  // Reset global chamber state if asked
  if (resetAll) {
    attemptsLeft = MAX_ATTEMPTS;
  }

  // Render basic stage UI (except chamber)
  const s = STAGES[stage];
  if (!s) return;

  // Background
  if (s.bg) gameWrap.style.backgroundImage = `url('${s.bg}')`;

  // Title & text
  titleEl.textContent = s.title || "";
  //storyEl.textContent = s.text || "";
  storyEl.innerHTML = s.text || "";

  // Buttons
  buttonsEl.innerHTML = "";
  (s.buttons || []).forEach(b => {
    const btn = document.createElement("button");
    btn.textContent = b.label;
    btn.addEventListener("click", b.action);
    buttonsEl.appendChild(btn);
  });

  // Chamber visibility
  const isChamber = (stage === "chamber");
  chamberUI.classList.toggle("hidden", !isChamber);
  buttonsEl.classList.toggle("hidden", isChamber);

  // Stage-specific actions
  if (stage === "intro") {
    // Stop sound until player presses Start (policy-friendly)
    disableSound();
  } else if (stage === "chamber") {
    // Chamber: restart ambience & speak intro
    if (soundEnabled) playAmbient();
    setupChamber();
  } else {
    // For all other stages, narrate the text if sound is on
    if (soundEnabled) speak(s.text || "");
  }
}

// ===== Chamber Logic =====
const CORRECT_Q1 = "Hermes";
const sentenceTarget = "Hermes was deceived and left the gate open";
const extraWords = ["sought", "power", "chaos"]; // distractor words

let dragWords = [];

function setupChamber() {
  // Reset chamber UI
  q1Feedback.textContent = "";
  puzzleResult.textContent = "";
  attemptsLeft = MAX_ATTEMPTS;
  updateAttempts();

  // Show Q1, hide Q2 & footer
  q1Block.classList.remove("hidden");
  q2Block.classList.add("hidden");
  document.getElementById("chamberFooter").classList.add("hidden");

   // 🔹 Start narration for chamber intro
  if (soundEnabled) speak(STAGES.chamber.text);

  // Bind Q1 choices
  document.querySelectorAll(".q1btn").forEach(btn => {
    btn.onclick = () => {
      const choice = btn.getAttribute("data-answer");
      



      if (choice === CORRECT_Q1) {
  q1Feedback.style.color = "lightgreen";
  q1Feedback.textContent = "Correct. Hermes is responsible.";

  if (soundEnabled) {
    // Create a custom utterance for this feedback
    const u = new SpeechSynthesisUtterance(q1Feedback.textContent);
    u.lang = "en-GB";
    u.rate = 1.05;
    u.pitch = 1.0;

    // 🔹 When narration finishes, move to Q2
    u.onend = () => {
        if (attemptsLeft <= 0) {
        goTo("failure");
        return;
      }
      
      q1Block.classList.add("hidden");
      q2Block.classList.remove("hidden");
      if (soundEnabled) speak("Reconstruct Hermes’ hidden message.");
      buildDragDropPuzzle();
    };

    // Start speaking
    speechSynthesis.speak(u);
  } else {
    // If sound is off, just proceed immediately
    q1Block.classList.add("hidden");
    q2Block.classList.remove("hidden");
    buildDragDropPuzzle();
  }
}
 else {
        attemptsLeft--;
        updateAttempts();
        q1Feedback.style.color = "#ffb3b3";
        q1Feedback.textContent = "No, think again.";
        if (soundEnabled) speak(q1Feedback.textContent);
        if (attemptsLeft <= 0) {
          // Fail
          goTo("failure");
          return;
        }
      }
    };
  });

  // Bind puzzle buttons
  checkPuzzleBtn.onclick = checkPuzzle;
  resetPuzzleBtn.onclick = () => {
    buildDragDropPuzzle();
    puzzleResult.textContent = "";
  };

  // Footer actions
  finishBtn.onclick = () => goTo("success", true);
  exitBtn.onclick = () => goTo("intro", true);
}

function updateAttempts() {
  attemptsInfo.textContent = `Attempts left: ${attemptsLeft}`;
}

function buildDragDropPuzzle() {
  const wordsWrap = document.getElementById("words");
  const dropsWrap = document.getElementById("dropzones");
  wordsWrap.innerHTML = "";
  dropsWrap.innerHTML = "";

  dragWords = sentenceTarget.split(" ");

  // Merge correct words + distractors
  const pool = [...dragWords, ...extraWords].sort(() => Math.random() - 0.5);

  // --- Δημιουργία λέξεων (drag για desktop, tap για κινητό) ---
  pool.forEach(w => {
    const span = document.createElement("span");
    span.className = "draggable-word";
    span.textContent = w;
    span.draggable = true;

    // 🖱️ Desktop drag
    span.addEventListener("dragstart", e => {
      e.dataTransfer.setData("text/plain", w);
    });

    // 📱 Mobile tap
    span.addEventListener("click", () => {
      const empty = document.querySelector(".dropzone:empty");
      if (empty) {
        empty.textContent = w;
        span.style.opacity = "0.4";
        span.style.pointerEvents = "none";
      }
    });

    wordsWrap.appendChild(span);
  });

  // --- Δημιουργία dropzones ---
  dragWords.forEach(() => {
    const dz = document.createElement("span");
    dz.className = "dropzone";

    // 🖱️ Desktop drop
    dz.addEventListener("dragover", e => e.preventDefault());
    dz.addEventListener("drop", e => {
      e.preventDefault();
      const word = e.dataTransfer.getData("text/plain");
      dz.textContent = word;
    });

    // 📱 Tap για καθάρισμα
    dz.addEventListener("click", () => {
      dz.textContent = "";
    });

    dropsWrap.appendChild(dz);
  });
}

function checkPuzzle() {
  const zones = Array.from(document.querySelectorAll(".dropzone"));
  const playerSentence = zones.map(z => (z.textContent || "").trim()).join(" ").trim();

  if (playerSentence === sentenceTarget) {
    puzzleResult.style.color = "lightgreen";
    puzzleResult.textContent = "Correct! Hermes was deceived and left the gate open.";
    if (soundEnabled) speak(puzzleResult.textContent);
    document.getElementById("chamberFooter").classList.remove("hidden");
  } else {
    attemptsLeft--;
    updateAttempts();
    puzzleResult.style.color = "#ffb3b3";
    puzzleResult.textContent = "That's not quite right. Try again.";
    if (soundEnabled) speak(puzzleResult.textContent);
    if (attemptsLeft <= 0) {
      goTo("failure");
      return;
    }
  }
}

// ===== Chamber access (passwords) =====
function requestChamberPassword(role) {
  const expected = role === "path" ? "wings" : "retribution";
  const input = prompt("Enter the password to access the Chamber of Nemesis:");
  if (input === null) return; // cancel
  if ((input || "").trim().toLowerCase() === expected) {
    goTo("chamber");
  } else {
    alert("Incorrect password.");
  }
}

// ===== Init =====
//window.addEventListener("load", () => {
  // Start at intro (sound is off until Start pressed)
  //goTo("intro");

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
