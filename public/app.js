import { cleanText, makeExtractiveSummary, makeFlashcards, makeQuiz } from "/local-study.js";

const $ = (id) => document.getElementById(id);
const KEYS = { notes: "llc.notes.v1", tasks: "llc.tasks.v1", cards: "llc.cards.v1", subjects: "llc.subjects.v1" };
const read = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
};
const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
let notes = read(KEYS.notes, []);
let tasks = read(KEYS.tasks, []);
let savedCards = read(KEYS.cards, []);
let subjects = read(KEYS.subjects, []);
let aiAvailable = false;
let chatHistory = [];
let currentCards = [];
let currentCardIndex = 0;
let currentQuiz = [];
let quizIndex = 0;
let lastResultText = "";

function toast(message) {
  const node = $("toast");
  node.textContent = message;
  node.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => node.classList.remove("show"), 2800);
}

function setPage(id) {
  document.querySelectorAll(".page").forEach(page => page.classList.toggle("active", page.id === id));
  document.querySelectorAll(".nav-link").forEach(button => button.classList.toggle("active", button.dataset.page === id));
  const title = ({ home: "Overview", tutor: "AI study partner", tools: "Study tools", notes: "My notebook", planner: "Study planner", resources: "Legal resources" })[id] || "LawLearn Commons";
  $("page-name").textContent = title;
  $("sidebar").classList.remove("open");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.querySelectorAll("[data-page]").forEach(button => button.addEventListener("click", () => setPage(button.dataset.page)));
document.querySelectorAll("[data-go]").forEach(button => button.addEventListener("click", () => setPage(button.dataset.go)));
$("mobile-menu").addEventListener("click", () => $("sidebar").classList.toggle("open"));

function updateStats() {
  $("stat-notes").textContent = notes.length;
  $("stat-tasks").textContent = tasks.filter(task => !task.done).length;
  $("stat-cards").textContent = savedCards.length;
}

function renderSubjects() {
  const list = $("subjects-list");
  list.replaceChildren();
  if (!subjects.length) {
    const p = document.createElement("p");
    p.className = "empty-copy";
    p.textContent = "Add a subject or module to shape your learning space.";
    list.append(p);
    return;
  }
  for (const subject of subjects) {
    const chip = document.createElement("span");
    chip.className = "subject-chip";
    chip.textContent = subject;
    list.append(chip);
  }
}

$("add-subject").addEventListener("click", () => {
  const value = window.prompt("Add a subject or module:");
  if (!value || !value.trim()) return;
  const name = value.trim().slice(0, 80);
  if (subjects.some(item => item.toLowerCase() === name.toLowerCase())) return toast("That subject is already listed.");
  subjects.push(name);
  write(KEYS.subjects, subjects);
  renderSubjects();
  toast("Subject added.");
});

function apiStatus() {
  // Public beta safety setting: no AI provider or AI endpoint is enabled.
  aiAvailable = false;
  $("ai-state").textContent = "BETA · OFF";
  $("ai-state").classList.remove("connected");
  $("ai-notice-text").textContent = "AI is intentionally disabled in this beta. Your questions and study material are not sent to an AI provider. Use the free local study tools instead.";
}

async function callAI() {
  throw new Error("LawLearn AI is not enabled in this beta. Your text has not been sent anywhere. Please use the local study tools.");
}

function addChatMessage(role, text) {
  const item = document.createElement("div");
  item.className = `chat-message ${role}`;
  item.textContent = text;
  $("chat-messages").append(item);
  $("chat-messages").scrollTop = $("chat-messages").scrollHeight;
  return item;
}

async function sendTutorQuestion(question) {
  if (!question.trim()) return;
  if (!aiAvailable) {
    toast("LawLearn AI is not enabled in this beta. Try the local study tools.");
    return;
  }
  addChatMessage("user", question);
  const priorHistory = [...chatHistory];
  chatHistory.push({ role: "user", content: question });
  const pending = addChatMessage("assistant", "Thinking through that with you…");
  $("chat-send").disabled = true;
  try {
    const answer = await callAI("tutor", { question, history: priorHistory });
    pending.textContent = `${answer}\n\nStudy reminder: this is AI-generated educational support, not verified legal research.`;
    chatHistory.push({ role: "assistant", content: answer });
    if (chatHistory.length > 16) chatHistory = chatHistory.slice(-16);
  } catch (error) {
    pending.textContent = `${error.message}\n\nYou can still use the free local study tools in the Study tools section.`;
  } finally {
    $("chat-send").disabled = false;
    $("chat-input").focus();
  }
}

$("chat-form").addEventListener("submit", event => {
  event.preventDefault();
  const input = $("chat-input");
  const question = input.value.trim();
  input.value = "";
  sendTutorQuestion(question);
});
document.querySelectorAll("[data-prompt]").forEach(button => button.addEventListener("click", () => sendTutorQuestion(button.dataset.prompt)));

// Upload plain-text study material. PDF extraction is intentionally not claimed in this MVP.
$("text-file").addEventListener("change", async event => {
  const file = event.target.files?.[0];
  if (!file) return;
  if (file.size > 1_000_000) {
    toast("Please use a text file smaller than 1 MB.");
    event.target.value = "";
    return;
  }
  $("study-material").value = await file.text();
  toast("Text file loaded into the study workspace.");
});

function showResult(boxId, contentId, text) {
  lastResultText = text;
  $(boxId).hidden = false;
  $(contentId).textContent = text;
}

$("local-summary").addEventListener("click", () => {
  const material = cleanText($("study-material").value);
  if (material.length < 40) return toast("Paste a little more study material first.");
  const summary = makeExtractiveSummary(material, 5);
  showResult("summary-result", "summary-content", `${summary}\n\nLOCAL TOOL NOTE: This is an extractive summary of selected sentences. It does not check legal accuracy, explain context, or verify whether the law is current.`);
});

async function runAIMaterialAction(action, material, boxId, contentId) {
  if (!aiAvailable) return toast("AI is not enabled in this beta. Your text has not been sent anywhere.");
  if (!cleanText(material)) return toast("Paste some study material first.");
  const box = $(boxId);
  const content = $(contentId);
  box.hidden = false;
  content.textContent = "Working on your study material…";
  try {
    const answer = await callAI(action, { material });
    showResult(boxId, contentId, `${answer}\n\nAI STUDY SUPPORT — not legal advice and not verified against a live legal database. Check the original material and primary sources.`);
  } catch (error) {
    content.textContent = error.message;
  }
}

$("ai-summary").addEventListener("click", () => runAIMaterialAction("summarize", $("study-material").value, "summary-result", "summary-content"));
$("save-summary").addEventListener("click", () => saveNote("Study summary", lastResultText));

document.querySelectorAll("[data-copy]").forEach(button => button.addEventListener("click", async () => {
  const node = $(button.dataset.copy);
  try { await navigator.clipboard.writeText(node.textContent); toast("Copied to clipboard."); }
  catch { toast("Clipboard access is unavailable in this browser."); }
}));

// Case brief worksheet
function caseBriefText() {
  const fields = [
    ["Case name and citation", "case-name"], ["Material facts", "case-facts"], ["Legal issue", "case-issue"],
    ["Decision / outcome", "case-decision"], ["Court's reasoning", "case-reasoning"], ["Legal principle and exam relevance", "case-principle"]
  ];
  return fields.map(([label, id]) => `${label.toUpperCase()}\n${$(id).value.trim() || "Not completed — check the original judgment."}`).join("\n\n");
}
$("build-case").addEventListener("click", () => {
  const text = caseBriefText();
  if (!$("case-name").value.trim() && !$("case-facts").value.trim()) return toast("Add the case name or some case notes first.");
  showResult("case-result", "case-content", `${text}\n\nCHECK: Confirm the citation, judgment, court, and legal principle against the original judgment. This worksheet does not independently verify them.`);
});
$("ai-case").addEventListener("click", () => runAIMaterialAction("caseBrief", caseBriefText(), "case-result", "case-content"));
$("save-case").addEventListener("click", () => saveNote($("case-name").value.trim() || "Case brief", $("case-content").textContent));

// Flashcard generation and revision
function displayFlashcard() {
  if (!currentCards.length) return;
  const card = currentCards[currentCardIndex];
  $("flashcard-meta").textContent = `CARD ${currentCardIndex + 1} OF ${currentCards.length}`;
  $("flash-question").textContent = card.question || "Question unavailable";
  $("flash-answer").textContent = card.answer || "Answer not supplied";
  $("flash-answer").hidden = !card.revealed;
  $("flash-label").textContent = card.revealed ? "ANSWER" : "QUESTION";
}
function setCurrentCards(cards) {
  currentCards = cards.map(card => ({ ...card, revealed: false }));
  currentCardIndex = 0;
  $("flashcard-area").hidden = currentCards.length === 0;
  if (currentCards.length) displayFlashcard();
}
$("make-cards").addEventListener("click", () => {
  const material = $("cards-material").value;
  const generated = makeFlashcards(material, 12);
  if (!generated.length) return toast("Add a few complete sentences with useful study content.");
  setCurrentCards(generated);
  toast(`${generated.length} local revision cards created.`);
});
$("ai-cards").addEventListener("click", async () => {
  const material = $("cards-material").value.trim();
  if (!material) return toast("Paste study material first.");
  try {
    const answer = await callAI("flashcards", { material });
    const parsed = parseAIJson(answer);
    if (!Array.isArray(parsed) || !parsed.length) throw new Error("No flashcards were returned.");
    setCurrentCards(parsed.filter(card => card && card.question && card.answer).slice(0, 20));
    toast("AI flashcards created. Review every card against your notes.");
  } catch (error) { toast(error.message); }
});
function parseAIJson(raw) {
  const text = String(raw).trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  try { return JSON.parse(text); }
  catch {
    const start = text.indexOf("[");
    const end = text.lastIndexOf("]");
    if (start >= 0 && end > start) return JSON.parse(text.slice(start, end + 1));
    throw new Error("Could not read the returned JSON. Try again or create local cards.");
  }
}
function flipCard() {
  if (!currentCards.length) return;
  currentCards[currentCardIndex].revealed = !currentCards[currentCardIndex].revealed;
  displayFlashcard();
}
$("flashcard").addEventListener("click", flipCard);
$("flashcard").addEventListener("keydown", event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); flipCard(); } });
$("flashcard").tabIndex = 0;
$("reveal-card").addEventListener("click", flipCard);
$("previous-card").addEventListener("click", () => { if (!currentCards.length) return; currentCardIndex = (currentCardIndex - 1 + currentCards.length) % currentCards.length; displayFlashcard(); });
$("next-card").addEventListener("click", () => { if (!currentCards.length) return; currentCardIndex = (currentCardIndex + 1) % currentCards.length; displayFlashcard(); });
$("save-cards").addEventListener("click", () => {
  if (!currentCards.length) return;
  const timestamp = new Date().toISOString();
  const deck = currentCards.map(card => ({ question: card.question, answer: card.answer, source: card.source || "Study material", createdAt: timestamp }));
  savedCards = [...savedCards, ...deck];
  write(KEYS.cards, savedCards);
  updateStats();
  toast(`${deck.length} cards saved to your revision deck.`);
});

// Practice quiz
function showQuizQuestion() {
  const item = currentQuiz[quizIndex];
  $("quiz-progress").textContent = `QUESTION ${quizIndex + 1} OF ${currentQuiz.length}`;
  $("quiz-question").textContent = item.question;
  $("quiz-answer").value = "";
  $("quiz-feedback").textContent = "";
  $("quiz-next").hidden = true;
}
$("make-quiz").addEventListener("click", () => {
  currentQuiz = makeQuiz($("quiz-material").value, 8);
  if (!currentQuiz.length) return toast("Add more complete sentences to build questions.");
  quizIndex = 0;
  $("quiz-area").hidden = false;
  showQuizQuestion();
});
$("ai-quiz").addEventListener("click", async () => {
  const material = $("quiz-material").value.trim();
  if (!material) return toast("Paste study material first.");
  try {
    const answer = await callAI("quiz", { material });
    const parsed = parseAIJson(answer);
    if (!Array.isArray(parsed) || !parsed.length) throw new Error("No quiz questions were returned.");
    currentQuiz = parsed.slice(0, 12);
    quizIndex = 0;
    $("quiz-area").hidden = false;
    showQuizQuestion();
  } catch (error) { toast(error.message); }
});
$("quiz-form").addEventListener("submit", event => {
  event.preventDefault();
  const item = currentQuiz[quizIndex];
  if (!item) return;
  const guess = $("quiz-answer").value.trim().toLowerCase();
  const expected = String(item.answer || "").trim().toLowerCase();
  if (guess && (guess === expected || expected.includes(guess) && guess.length > 3)) {
    $("quiz-feedback").textContent = `Good work. Suggested answer: ${item.answer}. ${item.explanation || "Check the original source for context."}`;
  } else {
    $("quiz-feedback").textContent = `Suggested answer: ${item.answer}. ${item.explanation || "Review this in your notes and try again."}`;
  }
  $("quiz-next").hidden = false;
});
$("quiz-next").addEventListener("click", () => {
  if (!currentQuiz.length) return;
  quizIndex = (quizIndex + 1) % currentQuiz.length;
  showQuizQuestion();
});

// Notes and local persistence
function saveNote(title, body) {
  const cleanTitle = String(title || "Study note").trim().slice(0, 120) || "Study note";
  const cleanBody = String(body || "").trim();
  if (!cleanBody) return toast("There is no note content to save.");
  notes.unshift({ id: crypto.randomUUID?.() || String(Date.now()), title: cleanTitle, body: cleanBody, createdAt: new Date().toISOString() });
  write(KEYS.notes, notes);
  renderNotes();
  updateStats();
  toast("Saved in this browser.");
}
$("note-form").addEventListener("submit", event => {
  event.preventDefault();
  saveNote($("note-title").value, $("note-body").value);
  $("note-form").reset();
});
function renderNotes() {
  const list = $("notes-list");
  list.replaceChildren();
  if (!notes.length) {
    list.innerHTML = '<div class="empty-state"><span>✎</span><strong>Your notebook is ready.</strong><p>Save a note to see it here.</p></div>';
    return;
  }
  notes.forEach(note => {
    const item = document.createElement("article");
    item.className = "saved-item";
    const main = document.createElement("div");
    main.className = "saved-item-main";
    const title = document.createElement("strong"); title.textContent = note.title;
    const date = document.createElement("small"); date.textContent = new Date(note.createdAt).toLocaleString();
    const preview = document.createElement("p"); preview.textContent = note.body;
    main.append(title, date, preview);
    const actions = document.createElement("div"); actions.className = "saved-actions";
    const open = document.createElement("button"); open.className = "mini-btn"; open.textContent = "Expand"; open.addEventListener("click", () => { const expanded = preview.classList.toggle("expanded"); open.textContent = expanded ? "Collapse" : "Expand"; });
    const copy = document.createElement("button"); copy.className = "mini-btn"; copy.textContent = "Copy"; copy.addEventListener("click", async () => { try { await navigator.clipboard.writeText(`${note.title}\n\n${note.body}`); toast("Note copied."); } catch { toast("Clipboard unavailable."); } });
    const remove = document.createElement("button"); remove.className = "mini-btn"; remove.textContent = "Delete"; remove.addEventListener("click", () => { if (!confirm("Delete this note from this browser?")) return; notes = notes.filter(n => n.id !== note.id); write(KEYS.notes, notes); renderNotes(); updateStats(); });
    actions.append(open, copy, remove);
    item.append(main, actions);
    list.append(item);
  });
}

// Planner
$("task-form").addEventListener("submit", event => {
  event.preventDefault();
  tasks.push({ id: crypto.randomUUID?.() || String(Date.now()), title: $("task-title").value.trim(), due: $("task-date").value, subject: $("task-subject").value.trim(), done: false });
  write(KEYS.tasks, tasks);
  $("task-form").reset();
  renderTasks();
  updateStats();
  toast("Task added to your planner.");
});
function renderTasks() {
  const list = $("tasks-list");
  list.replaceChildren();
  const sorted = [...tasks].sort((a, b) => a.due.localeCompare(b.due));
  const openCount = tasks.filter(task => !task.done).length;
  $("task-summary").textContent = `${openCount} open task${openCount === 1 ? "" : "s"}`;
  if (!sorted.length) {
    list.innerHTML = '<div class="empty-state"><span>▦</span><strong>No tasks yet.</strong><p>Add one small next step to begin.</p></div>';
    return;
  }
  sorted.forEach(task => {
    const item = document.createElement("article"); item.className = `saved-item ${task.done ? "task-item complete" : "task-item"}`;
    const check = document.createElement("input"); check.type = "checkbox"; check.className = "task-check"; check.checked = task.done; check.setAttribute("aria-label", `Mark ${task.title} complete`);
    check.addEventListener("change", () => { tasks = tasks.map(t => t.id === task.id ? { ...t, done: check.checked } : t); write(KEYS.tasks, tasks); renderTasks(); updateStats(); });
    const main = document.createElement("div"); main.className = "saved-item-main";
    const title = document.createElement("strong"); title.textContent = task.title;
    const meta = document.createElement("small"); meta.textContent = [task.subject, task.due].filter(Boolean).join(" · ");
    main.append(title, meta);
    const del = document.createElement("button"); del.className = "mini-btn"; del.textContent = "Delete"; del.addEventListener("click", () => { tasks = tasks.filter(t => t.id !== task.id); write(KEYS.tasks, tasks); renderTasks(); updateStats(); });
    item.append(check, main, del);
    list.append(item);
  });
}

// Export and delete all browser-local data
$("export-data").addEventListener("click", () => {
  const payload = { exportedAt: new Date().toISOString(), app: "LawLearn Commons", notes, tasks, cards: savedCards, subjects };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a"); link.href = url; link.download = "lawlearn-commons-backup.json"; link.click();
  URL.revokeObjectURL(url);
  toast("Your backup has been prepared.");
});
$("clear-data").addEventListener("click", () => {
  if (!confirm("Delete all LawLearn Commons notes, tasks, subjects, and saved cards from this browser? This cannot be undone. Export a backup first if needed.")) return;
  Object.values(KEYS).forEach(key => localStorage.removeItem(key));
  notes = []; tasks = []; savedCards = []; subjects = [];
  renderSubjects(); renderNotes(); renderTasks(); updateStats();
  toast("Local study data cleared.");
});

// Tab control
function setTool(id) {
  document.querySelectorAll(".tool-tab").forEach(tab => {
    const active = tab.dataset.tool === id;
    tab.classList.toggle("active", active);
    tab.setAttribute("aria-selected", String(active));
  });
  document.querySelectorAll(".tool-panel").forEach(panel => panel.classList.toggle("active", panel.id === `tool-${id}`));
}
document.querySelectorAll(".tool-tab").forEach(tab => tab.addEventListener("click", () => setTool(tab.dataset.tool)));

renderSubjects();
renderNotes();
renderTasks();
updateStats();
apiStatus();
