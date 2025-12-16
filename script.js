let questions = [];
let current = 0;
let score = 0;
let streak = 0;
let answersLog = [];

const questionText = document.getElementById("questionText");
const optionsDiv = document.getElementById("options");
const feedback = document.getElementById("feedback");
const nextBtn = document.getElementById("nextBtn");
const counter = document.getElementById("counter");
const progressFill = document.getElementById("progressFill");
const streakEl = document.getElementById("streak");
const levelText = document.getElementById("levelText");
const summary = document.getElementById("summary");

fetch("questions.json")
  .then(res => res.json())
  .then(data => {
    questions = data;
    loadQuestion();
  });

function getLevel() {
  if (score >= 3) return "🏆 Level: UX Pro";
  if (score >= 1) return "🏆 Level: Learner";
  return "🏆 Level: Beginner";
}

function loadQuestion() {
  const q = questions[current];
  questionText.textContent = q.question;
  counter.textContent = `Question ${current + 1} of ${questions.length}`;
  progressFill.style.width = `${(current / questions.length) * 100}%`;
  streakEl.textContent = `🔥 Streak: ${streak}`;
  levelText.textContent = getLevel();

  optionsDiv.innerHTML = "";
  feedback.classList.add("hidden");
  nextBtn.classList.add("hidden");

  q.options.forEach((opt, index) => {
    const btn = document.createElement("button");
    btn.className = "option";
    btn.textContent = `${index + 1}. ${opt}`;

    btn.setAttribute("role", "radio");
    btn.setAttribute("aria-checked", "false");
    btn.setAttribute("tabindex", index === 0 ? "0" : "-1");

    btn.onclick = () => checkAnswer(index, btn);

    btn.onkeydown = (e) => {
      const buttons = [...document.querySelectorAll(".option")];
      const i = buttons.indexOf(e.target);

      if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        e.preventDefault();
        buttons[(i + 1) % buttons.length].focus();
      }

      if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault();
        buttons[(i - 1 + buttons.length) % buttons.length].focus();
      }

      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        checkAnswer(index, btn);
      }
    };

    optionsDiv.appendChild(btn);
  });

  questionText.focus();
}

/* 🔢 NUMBER KEY SUPPORT (1–9) */
document.addEventListener("keydown", (e) => {
  if (feedback && !feedback.classList.contains("hidden")) return;

  const num = parseInt(e.key, 10);
  const buttons = document.querySelectorAll(".option");

  if (!isNaN(num) && num >= 1 && num <= buttons.length) {
    e.preventDefault();
    const btn = buttons[num - 1];
    if (!btn.disabled) {
      btn.focus();
      checkAnswer(num - 1, btn);
    }
  }
});

function checkAnswer(index, btn) {
  const q = questions[current];
  const buttons = document.querySelectorAll(".option");

  buttons.forEach(b => {
    b.disabled = true;
    b.setAttribute("aria-checked", b === btn ? "true" : "false");
  });

  const correct = index === q.answer;
  answersLog.push({
    question: q.question,
    correctAnswer: q.options[q.answer],
    chosen: q.options[index],
    correct
  });

  if (correct) {
    btn.classList.add("correct");
    score++;
    streak++;
    feedback.textContent = " Correct!";
  } else {
    btn.classList.add("wrong");
    buttons[q.answer].classList.add("correct");
    streak = 0;
    feedback.textContent = ` ${q.explanation}`;
  }

  feedback.classList.remove("hidden");
  nextBtn.classList.remove("hidden");
  nextBtn.focus();
}

nextBtn.onclick = () => {
  current++;
  current < questions.length ? loadQuestion() : showSummary();
};

function showSummary() {
  document.querySelector(".top-screen").remove();
  document.querySelector(".bottom-screen").remove();

  const correctCount = answersLog.filter(a => a.correct).length;
  const wrongCount = answersLog.length - correctCount;

  summary.innerHTML = `
    <h1>Quiz Summary</h1>
    <p>Score: ${score} / ${questions.length}</p>
    <p>${getLevel()}</p>

    <h2>Analysis</h2>
    <p>Correct: ${correctCount} | Wrong: ${wrongCount}</p>

    <h2>Review</h2>
    ${answersLog.map(a => `
      <p>
        <strong>${a.question}</strong><br>
        Your Answer: ${a.chosen}<br>
        Correct Answer: ${a.correctAnswer}
      </p>
    `).join("")}
  `;

  summary.classList.remove("hidden");
}
