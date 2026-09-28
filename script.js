/* =========================================================
   THIRUMALAI EXECUTION OS
   Local-first productivity dashboard
   ========================================================= */

const STORAGE_KEY = "thirumalai_execution_os_v1";

const DEFAULT_DATA = {
  settings: {
    mode: "college"
  },

  days: {},

  leetcode: [],

  learning: [],

  entertainment: []
};

let data = loadData();

let entertainmentTimer = {
  running: false,
  startedAt: null,
  elapsed: 0,
  interval: null
};


/* =========================================================
   STORAGE
   ========================================================= */

function loadData() {

  try {

    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return structuredClone(DEFAULT_DATA);
    }

    const parsed = JSON.parse(saved);

    return {
      ...structuredClone(DEFAULT_DATA),
      ...parsed
    };

  } catch {

    return structuredClone(DEFAULT_DATA);

  }

}


function saveData() {

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(data)
  );

}


function todayKey() {

  const d = new Date();

  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2,"0"),
    String(d.getDate()).padStart(2,"0")
  ].join("-");

}


function getToday() {

  const key = todayKey();

  if (!data.days[key]) {

    data.days[key] = {
      mode: data.settings.mode || "college",
      tasks: []
    };

    saveData();

  }

  return data.days[key];

}


/* =========================================================
   DATE / TIME
   ========================================================= */

function updateClock() {

  const now = new Date();

  const dateText = now.toLocaleDateString(
    "en-IN",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    }
  );

  const timeText = now.toLocaleTimeString(
    "en-IN",
    {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    }
  );

  document.getElementById("currentDate").textContent = dateText;
  document.getElementById("currentTime").textContent = timeText;

  document.getElementById("heroDay").textContent =
    now.toLocaleDateString("en-IN",{weekday:"long"});

  document.getElementById("heroDate").textContent =
    now.toLocaleDateString("en-IN",{
      day:"numeric",
      month:"short",
      year:"numeric"
    });

  highlightCurrentPhase();

}


setInterval(updateClock,1000);
updateClock();


/* =========================================================
   PHASES
   ========================================================= */

function getPhaseTimes() {

  const mode = data.settings.mode;

  if (mode === "college") {

    return {
      phase1: ["09:00","12:30"],
      phase2: ["13:30","16:30"],
      phase3: ["19:00","01:00"]
    };

  }

  return {
    phase1: ["09:00","12:30"],
    phase2: ["18:00","21:00"],
    phase3: ["21:00","01:00"]
  };

}


function setPhaseTimes() {

  const times = getPhaseTimes();

  document.getElementById("phase1Time").textContent =
    `${times.phase1[0]} — ${times.phase1[1]}`;

  document.getElementById("phase2Time").textContent =
    `${times.phase2[0]} — ${times.phase2[1]}`;

  document.getElementById("phase3Time").textContent =
    `${times.phase3[0]} — ${times.phase3[1]}`;

}


function timeToMinutes(time) {

  const [h,m] = time.split(":").map(Number);

  return h * 60 + m;

}


function currentMinutes() {

  const d = new Date();

  return d.getHours() * 60 + d.getMinutes();

}


function isInsidePhase(start,end) {

  const now = currentMinutes();

  const s = timeToMinutes(start);
  let e = timeToMinutes(end);

  if (e <= s) {

    if (now >= s) {
      return true;
    }

    e += 1440;

  }

  return now >= s && now < e;

}


function highlightCurrentPhase() {

  document
    .querySelectorAll(".phase-card")
    .forEach(x => x.classList.remove("current"));

  const times = getPhaseTimes();

  for (const [phase,t] of Object.entries(times)) {

    if (isInsidePhase(t[0],t[1])) {

      document
        .getElementById(phase)
        ?.classList.add("current");

    }

  }

}


/* =========================================================
   NAVIGATION
   ========================================================= */

document.querySelectorAll(".nav-btn").forEach(btn => {

  btn.addEventListener("click",() => {

    showPage(btn.dataset.page);

  });

});


function showPage(page) {

  document
    .querySelectorAll(".page")
    .forEach(p => p.classList.remove("active"));

  document
    .getElementById(page)
    ?.classList.add("active");

  document
    .querySelectorAll(".nav-btn")
    .forEach(b => {
      b.classList.toggle(
        "active",
        b.dataset.page === page
      );
    });

  if (page === "dashboard") renderDashboard();
  if (page === "planner") renderPlanner();
  if (page === "leetcode") renderLeetCode();
  if (page === "learning") renderLearning();
  if (page === "entertainment") renderEntertainment();
  if (page === "progress") renderProgress();
  if (page === "history") renderHistory();
}


/* =========================================================
   MODE
   ========================================================= */

document.querySelectorAll(".mode-btn").forEach(btn => {

  btn.addEventListener("click",() => {

    data.settings.mode = btn.dataset.mode;

    getToday().mode = btn.dataset.mode;

    saveData();

    document
      .querySelectorAll(".mode-btn")
      .forEach(x => x.classList.remove("active"));

    btn.classList.add("active");

    setPhaseTimes();
    renderPlanner();
    renderDashboard();

    toast(
      btn.dataset.mode === "college"
        ? "College Day activated"
        : "No College schedule activated"
    );

  });

});


/* =========================================================
   TASKS
   ========================================================= */

function openTaskModal(phase = "phase1", task = null) {

  document
    .getElementById("taskModal")
    .classList.remove("hidden");

  const form = document.getElementById("taskForm");

  form.reset();

  document.getElementById("taskPhase").value = phase;

  document.getElementById("taskPriority").value = "Medium";
  document.getElementById("taskMinutes").value = 30;

  if (task) {

    document.getElementById("taskModalTitle").textContent =
      "Edit Task";

    document.getElementById("editTaskId").value =
      task.id;

    document.getElementById("taskTitle").value =
      task.title;

    document.getElementById("taskPhase").value =
      task.phase;

    document.getElementById("taskPriority").value =
      task.priority;

    document.getElementById("taskMinutes").value =
      task.minutes || 30;

    document.getElementById("taskNotes").value =
      task.notes || "";

  } else {

    document.getElementById("taskModalTitle").textContent =
      "Add Task";

    document.getElementById("editTaskId").value = "";

  }

}


function closeTaskModal() {

  document
    .getElementById("taskModal")
    .classList.add("hidden");

}


document
  .getElementById("closeTaskModal")
  .addEventListener("click",closeTaskModal);


document
  .getElementById("dashboardAdd")
  .addEventListener("click",() => openTaskModal());


document
  .getElementById("quickAdd")
  .addEventListener("click",() => openTaskModal());


document
  .querySelectorAll(".add-task-btn")
  .forEach(btn => {

    btn.addEventListener("click",() => {

      openTaskModal(btn.dataset.phase);

    });

  });


document
  .getElementById("taskForm")
  .addEventListener("submit",e => {

    e.preventDefault();

    const today = getToday();

    const id =
      document.getElementById("editTaskId").value;

    const task = {

      id: id || crypto.randomUUID(),

      title:
        document.getElementById("taskTitle").value.trim(),

      phase:
        document.getElementById("taskPhase").value,

      priority:
        document.getElementById("taskPriority").value,

      minutes:
        Number(document.getElementById("taskMinutes").value),

      notes:
        document.getElementById("taskNotes").value.trim(),

      completed: false,

      createdAt: new Date().toISOString(),

      completedAt: null

    };


    if (id) {

      const index =
        today.tasks.findIndex(t => t.id === id);

      if (index !== -1) {

        task.completed =
          today.tasks[index].completed;

        task.completedAt =
          today.tasks[index].completedAt;

        today.tasks[index] = task;

      }

    } else {

      today.tasks.push(task);

    }


    saveData();
    closeTaskModal();

    renderPlanner();
    renderDashboard();

    toast(
      id
        ? "Task updated"
        : "Task added"
    );

  });


function toggleTask(id) {

  const today = getToday();

  const task = today.tasks.find(
    t => t.id === id
  );

  if (!task) return;

  task.completed = !task.completed;

  task.completedAt =
    task.completed
      ? new Date().toISOString()
      : null;

  saveData();

  renderPlanner();
  renderDashboard();

}


function deleteTask(id) {

  if (!confirm("Delete this task?")) return;

  const today = getToday();

  today.tasks =
    today.tasks.filter(t => t.id !== id);

  saveData();

  renderPlanner();
  renderDashboard();

  toast("Task deleted");

}


function editTask(id) {

  const task =
    getToday().tasks.find(t => t.id === id);

  if (task) {
    openTaskModal(task.phase,task);
  }

}


function taskHTML(task) {

  return `

    <div class="task ${task.completed ? "completed" : ""}">

      <button
        class="check"
        onclick="toggleTask('${task.id}')"
      >
        ✓
      </button>

      <div class="task-title">
        ${escapeHTML(task.title)}
      </div>

      <div class="task-meta priority-${task.priority.toLowerCase()}">
        ${task.priority}
        ·
        ${task.minutes || 0}m
      </div>

      <div class="task-actions">

        <button onclick="editTask('${task.id}')">
          ✎
        </button>

        <button onclick="deleteTask('${task.id}')">
          ×
        </button>

      </div>

    </div>

  `;

}


function renderPlanner() {

  setPhaseTimes();

  const today = getToday();

  document
    .querySelectorAll(".mode-btn")
    .forEach(btn => {
      btn.classList.toggle(
        "active",
        btn.dataset.mode === data.settings.mode
      );
    });


  ["phase1","phase2","phase3"].forEach(phase => {

    const box =
      document.getElementById(`tasks-${phase}`);

    const tasks =
      today.tasks.filter(t => t.phase === phase);

    box.innerHTML =
      tasks.length
        ? tasks.map(taskHTML).join("")
        : `<div class="muted">No tasks assigned yet.</div>`;

  });

  highlightCurrentPhase();

}


/* =========================================================
   DASHBOARD
   ========================================================= */

function renderDashboard() {

  const today = getToday();

  const total = today.tasks.length;

  const completed =
    today.tasks.filter(t => t.completed).length;

  const completion =
    total
      ? Math.round((completed / total) * 100)
      : 0;

  document.getElementById("statTasks").textContent =
    total;

  document.getElementById("statTaskSub").textContent =
    `${completed} completed`;

  document.getElementById("statCompletion").textContent =
    `${completion}%`;


  const leetToday =
    data.leetcode.filter(
      x => x.date === todayKey()
    ).length;

  document.getElementById("statLeet").textContent =
    leetToday;

  document.getElementById("statLeetSub").textContent =
    leetToday
      ? "problem completed today"
      : "no problem yet";


  const focus =
    data.learning
      .filter(x => x.date === todayKey())
      .reduce((sum,x) => sum + Number(x.minutes || 0),0);

  document.getElementById("statFocus").textContent =
    formatHours(focus);


  let message =
    "Your execution is built one day at a time.";

  if (completion >= 90)
    message = "Excellent execution. Protect this momentum.";

  else if (completion >= 60)
    message = "Good progress. Finish the important remaining tasks.";

  else if (total > 0)
    message = "You are behind today. Focus on the highest-value task.";

  document.getElementById("heroMessage").textContent =
    message;


  renderDashboardPhases();

  updateMiniAI();

}


function renderDashboardPhases() {

  const today = getToday();

  const container =
    document.getElementById("dashboardPhases");

  const phases = [
    ["phase1","Phase 1","09:00 — 12:30"],
    ["phase2","Phase 2",data.settings.mode === "college"
      ? "13:30 — 16:30"
      : "18:00 — 21:00"],
    ["phase3","Phase 3",data.settings.mode === "college"
      ? "19:00 — 01:00"
      : "21:00 — 01:00"]
  ];

  container.innerHTML = phases.map(p => {

    const tasks =
      today.tasks.filter(t => t.phase === p[0]);

    const done =
      tasks.filter(t => t.completed).length;

    return `

      <div class="phase-card">

        <div class="phase-top">

          <div class="phase-number">
            ${p[0].replace("phase","0")}
          </div>

          <div>
            <span>${p[1]}</span>
            <h2>${p[2]}</h2>
          </div>

          <div class="phase-time">
            ${done}/${tasks.length}
          </div>

        </div>

        <div class="task-list">

          ${
            tasks.length
              ? tasks.map(taskHTML).join("")
              : `<div class="muted">No tasks assigned.</div>`
          }

        </div>

      </div>

    `;

  }).join("");

}


function updateMiniAI() {

  const today = getToday();

  const total = today.tasks.length;

  const done =
    today.tasks.filter(t => t.completed).length;

  let title = "Ready when you are.";
  let text = "Add tasks and I'll analyze your execution.";

  if (total) {

    const pct =
      Math.round(done / total * 100);

    if (pct === 100) {

      title = "Day completed.";
      text = "You completed everything assigned today.";

    } else {

      title = `${total - done} task${total-done === 1 ? "" : "s"} remaining.`;

      text =
        pct >= 60
          ? "Good momentum. Finish the highest-priority remaining task."
          : "Execution is slipping. Stop adding tasks and finish the important ones.";

    }

  }

  document.getElementById("aiMiniTitle").textContent =
    title;

  document.getElementById("aiMiniText").textContent =
    text;

}


/* =========================================================
   LEETCODE
   ========================================================= */

document
  .getElementById("leetcodeForm")
  .addEventListener("submit",e => {

    e.preventDefault();

    data.leetcode.unshift({

      id: crypto.randomUUID(),

      date: todayKey(),

      name:
        document.getElementById("leetcodeName").value.trim(),

      difficulty:
        document.getElementById("leetcodeDifficulty").value,

      link:
        document.getElementById("leetcodeLink").value.trim()

    });

    saveData();

    e.target.reset();

    renderLeetCode();
    renderDashboard();

    toast("LeetCode problem recorded 🔥");

  });


function calculateLeetStreak() {

  const dates =
    new Set(data.leetcode.map(x => x.date));

  let streak = 0;

  const d = new Date();

  while (true) {

    const key =
      d.toISOString().slice(0,10);

    if (!dates.has(key)) break;

    streak++;

    d.setDate(d.getDate() - 1);

  }

  return streak;

}


function renderLeetCode() {

  document.getElementById("leetcodeStreak").textContent =
    calculateLeetStreak();

  const container =
    document.getElementById("leetcodeHistory");

  if (!data.leetcode.length) {

    container.innerHTML =
      `<p>No problems recorded yet.</p>`;

    return;

  }

  container.innerHTML =
    data.leetcode.map(x => `

      <div class="leetcode-row">

        <div>
          <strong>${escapeHTML(x.name)}</strong>
          <div class="muted">
            ${x.date} · ${x.difficulty}
          </div>
        </div>

        ${
          x.link
            ? `<a href="${safeURL(x.link)}"
                  target="_blank"
                  rel="noopener"
                  class="secondary-btn">
                  Open
               </a>`
            : ""
        }

      </div>

    `).join("");

}


/* =========================================================
   LEARNING
   ========================================================= */

document
  .getElementById("addLearning")
  .addEventListener("click",() => {

    document
      .getElementById("learningModal")
      .classList.remove("hidden");

  });


document
  .getElementById("closeLearningModal")
  .addEventListener("click",() => {

    document
      .getElementById("learningModal")
      .classList.add("hidden");

  });


document
  .getElementById("learningForm")
  .addEventListener("submit",e => {

    e.preventDefault();

    data.learning.unshift({

      id: crypto.randomUUID(),

      date: todayKey(),

      topic:
        document.getElementById("learningTopic").value.trim(),

      minutes:
        Number(
          document.getElementById("learningMinutes").value
        ),

      notes:
        document.getElementById("learningNotes").value.trim()

    });

    saveData();

    e.target.reset();

    document
      .getElementById("learningModal")
      .classList.add("hidden");

    renderLearning();
    renderDashboard();

    toast("Learning session saved");

  });


function renderLearning() {

  const sessions =
    data.learning.filter(
      x => x.date === todayKey()
    );

  const minutes =
    data.learning.reduce(
      (sum,x) => sum + Number(x.minutes || 0),
      0
    );

  document.getElementById("learningSessions").textContent =
    sessions.length;

  document.getElementById("learningHours").textContent =
    formatHours(minutes);

  document.getElementById("learningArea").textContent =
    sessions[0]?.topic || "—";


  const container =
    document.getElementById("learningHistory");

  if (!data.learning.length) {

    container.innerHTML =
      `<p>No learning sessions recorded.</p>`;

    return;

  }

  container.innerHTML =
    data.learning.map(x => `

      <div class="learning-row">

        <div>
          <strong>${escapeHTML(x.topic)}</strong>

          <div class="muted">
            ${x.date}
            ·
            ${x.minutes} minutes
          </div>
        </div>

        <button
          class="danger-btn"
          onclick="deleteLearning('${x.id}')"
        >
          Delete
        </button>

      </div>

    `).join("");

}


function deleteLearning(id) {

  data.learning =
    data.learning.filter(x => x.id !== id);

  saveData();

  renderLearning();

  toast("Session deleted");

}


/* =========================================================
   ENTERTAINMENT
   ========================================================= */

document
  .getElementById("startEntertainment")
  .addEventListener("click",() => {

    if (entertainmentTimer.running) return;

    entertainmentTimer.running = true;

    entertainmentTimer.startedAt = Date.now();

    entertainmentTimer.interval =
      setInterval(updateEntertainmentTimer,1000);

    toast("Entertainment timer started");

  });


document
  .getElementById("stopEntertainment")
  .addEventListener("click",stopEntertainment);


function updateEntertainmentTimer() {

  if (!entertainmentTimer.running) return;

  const elapsed =
    Date.now() -
    entertainmentTimer.startedAt +
    entertainmentTimer.elapsed;

  document.getElementById("entTimer").textContent =
    formatClock(elapsed);

}


function stopEntertainment() {

  if (!entertainmentTimer.running) return;

  entertainmentTimer.elapsed +=
    Date.now() -
    entertainmentTimer.startedAt;

  entertainmentTimer.running = false;

  clearInterval(entertainmentTimer.interval);

  const seconds =
    Math.floor(entertainmentTimer.elapsed / 1000);

  if (seconds >= 5) {

    data.entertainment.unshift({

      id: crypto.randomUUID(),

      date: todayKey(),

      category:
        document.getElementById("entCategory").value,

      seconds

    });

    saveData();

  }

  entertainmentTimer.elapsed = 0;
  entertainmentTimer.startedAt = null;

  document.getElementById("entTimer").textContent =
    "00:00:00";

  renderEntertainment();

  toast("Entertainment session saved");

}


function renderEntertainment() {

  const today =
    data.entertainment.filter(
      x => x.date === todayKey()
    );

  const seconds =
    today.reduce(
      (sum,x) => sum + Number(x.seconds || 0),
      0
    );

  document.getElementById("todayEntertainment").textContent =
    formatDuration(seconds);


  const container =
    document.getElementById("entHistory");

  container.innerHTML =
    today.length

      ? today.map(x => `

          <div class="ent-row">

            <div>
              <strong>${escapeHTML(x.category)}</strong>

              <div class="muted">
                ${formatDuration(x.seconds)}
              </div>
            </div>

            <button
              class="danger-btn"
              onclick="deleteEntertainment('${x.id}')"
            >
              Delete
            </button>

          </div>

        `).join("")

      : `<p>No entertainment recorded today.</p>`;

}


function deleteEntertainment(id) {

  data.entertainment =
    data.entertainment.filter(x => x.id !== id);

  saveData();

  renderEntertainment();

}


/* =========================================================
   PROGRESS
   ========================================================= */

function renderProgress() {

  const allDays =
    Object.values(data.days);

  const tasks =
    allDays.flatMap(x => x.tasks || []);

  const completed =
    tasks.filter(x => x.completed);

  const completion =
    tasks.length
      ? Math.round(completed.length / tasks.length * 100)
      : 0;

  const dailyPercentages =
    allDays.map(day => {

      const t = day.tasks.length;

      const c =
        day.tasks.filter(x => x.completed).length;

      return t
        ? c / t * 100
        : 0;

    });


  const avg =
    dailyPercentages.length
      ? Math.round(
          dailyPercentages.reduce((a,b) => a+b,0) /
          dailyPercentages.length
        )
      : 0;


  document.getElementById("allTasks").textContent =
    tasks.length;

  document.getElementById("allCompleted").textContent =
    completed.length;

  document.getElementById("avgCompletion").textContent =
    `${avg}%`;

  document.getElementById("activeDays").textContent =
    allDays.length;


  renderChart();

}


function renderChart() {

  const container =
    document.getElementById("progressChart");

  const values = [];

  for (let i=13;i>=0;i--) {

    const d = new Date();

    d.setDate(d.getDate()-i);

    const key =
      d.toISOString().slice(0,10);

    const day =
      data.days[key];

    const total =
      day?.tasks?.length || 0;

    const done =
      day?.tasks?.filter(x => x.completed).length || 0;

    values.push({

      key,

      percentage:
        total
          ? Math.round(done / total * 100)
          : 0

    });

  }


  container.innerHTML =
    values.map(x => `

      <div class="bar-wrap">

        <div
          class="bar"
          style="height:${Math.max(3,x.percentage)}%"
          title="${x.key}: ${x.percentage}%"
        ></div>

        <span class="bar-label">
          ${x.key.slice(8)}
        </span>

      </div>

    `).join("");

}


/* =========================================================
   HISTORY
   ========================================================= */

document
  .getElementById("historyMonth")
  .value =
    new Date().toISOString().slice(0,7);


document
  .getElementById("historyMonth")
  .addEventListener("change",renderHistory);


document
  .getElementById("historySearch")
  .addEventListener("input",renderHistory);


function renderHistory() {

  const month =
    document.getElementById("historyMonth").value;

  const search =
    document
      .getElementById("historySearch")
      .value
      .toLowerCase()
      .trim();


  const keys =
    Object.keys(data.days)
      .filter(k => !month || k.startsWith(month))
      .sort()
      .reverse();


  const filtered =
    keys.map(key => {

      const day = data.days[key];

      const tasks =
        day.tasks.filter(task =>
          !search ||
          task.title.toLowerCase().includes(search)
        );

      return {
        key,
        day,
        tasks
      };

    }).filter(x => x.tasks.length);


  const container =
    document.getElementById("historyList");


  if (!filtered.length) {

    container.innerHTML =
      `<div class="panel">
         <p>No matching history found.</p>
       </div>`;

    return;

  }


  container.innerHTML =
    filtered.map(x => {

      const done =
        x.day.tasks.filter(t => t.completed).length;

      const total =
        x.day.tasks.length;

      const pct =
        total
          ? Math.round(done/total*100)
          : 0;

      return `

        <div class="history-day">

          <div class="history-day-head">

            <div>
              <strong>${formatDate(x.key)}</strong>

              <div class="muted">
                ${total} tasks · ${done} completed
              </div>
            </div>

            <strong>${pct}%</strong>

          </div>

          <div class="history-day-body">

            ${
              x.tasks
                .map(taskHTML)
                .join("")
            }

          </div>

        </div>

      `;

    }).join("");

}


/* =========================================================
   AI COACH
   ========================================================= */

document
  .querySelectorAll(".ai-command")
  .forEach(btn => {

    btn.addEventListener("click",() => {

      generateAIAnalysis(btn.dataset.command);

    });

  });


document
  .getElementById("openAI")
  .addEventListener("click",() => {

    showPage("ai");

    generateAIAnalysis("today");

  });


function generateAIAnalysis(command) {

  const output =
    document.getElementById("aiOutput");

  if (command === "today") {

    const today = getToday();

    const total =
      today.tasks.length;

    const done =
      today.tasks.filter(t => t.completed).length;

    const remaining =
      today.tasks.filter(t => !t.completed);

    const pct =
      total
        ? Math.round(done / total * 100)
        : 0;

    const high =
      remaining.filter(
        t => t.priority === "High"
      );


    output.innerHTML = `

      <span class="eyebrow">TODAY ANALYSIS</span>

      <h2>${pct}% execution completed.</h2>

      <ul>

        <li>
          ${done} of ${total} assigned tasks completed.
        </li>

        <li>
          ${remaining.length} task${remaining.length===1?"":"s"} remaining.
        </li>

        ${
          high.length
            ? `<li>
                ${high.length} high-priority task${high.length===1?"":"s"} still unfinished.
               </li>`
            : `<li>
                No unfinished high-priority tasks.
               </li>`
        }

        <li>
          ${getTodayRecommendation(today)}
        </li>

      </ul>

    `;

  }


  if (command === "week") {

    const days = [];

    for (let i=0;i<7;i++) {

      const d = new Date();

      d.setDate(d.getDate()-i);

      const key =
        d.toISOString().slice(0,10);

      days.push(data.days[key]);

    }

    const valid =
      days.filter(Boolean);

    const tasks =
      valid.flatMap(x => x.tasks || []);

    const done =
      tasks.filter(x => x.completed).length;

    const pct =
      tasks.length
        ? Math.round(done/tasks.length*100)
        : 0;

    output.innerHTML = `

      <span class="eyebrow">7 DAY ANALYSIS</span>

      <h2>${pct}% average execution.</h2>

      <ul>

        <li>${valid.length} recorded days.</li>

        <li>${tasks.length} total tasks assigned.</li>

        <li>${done} tasks completed.</li>

        <li>
          ${
            pct >= 80
              ? "Your consistency is strong. Protect the routine."
              : pct >= 60
              ? "Your execution is moderate. Reduce unfinished tasks."
              : "Your recorded execution is low. Simplify your daily plan."
          }
        </li>

      </ul>

    `;

  }


  if (command === "backlog") {

    const unfinished = [];

    Object.entries(data.days).forEach(
      ([date,day]) => {

        day.tasks
          .filter(t => !t.completed)
          .forEach(t => {

            unfinished.push({
              ...t,
              date
            });

          });

      }
    );


    unfinished.sort(
      (a,b) =>
        priorityValue(b.priority) -
        priorityValue(a.priority)
    );


    output.innerHTML = `

      <span class="eyebrow">BACKLOG ANALYSIS</span>

      <h2>${unfinished.length} unfinished tasks.</h2>

      ${
        unfinished.length

          ? `<ul>
              ${
                unfinished
                  .slice(0,12)
                  .map(t =>
                    `<li>
                       <strong>${escapeHTML(t.title)}</strong>
                       — ${t.priority}
                       — ${t.date}
                     </li>`
                  )
                  .join("")
              }
             </ul>`

          : `<p>
               Your recorded backlog is empty. Nice.
             </p>`
      }

    `;

  }


  if (command === "leetcode") {

    const total =
      data.leetcode.length;

    const easy =
      data.leetcode.filter(
        x => x.difficulty === "Easy"
      ).length;

    const medium =
      data.leetcode.filter(
        x => x.difficulty === "Medium"
      ).length;

    const hard =
      data.leetcode.filter(
        x => x.difficulty === "Hard"
      ).length;

    output.innerHTML = `

      <span class="eyebrow">LEETCODE ANALYSIS</span>

      <h2>${total} problems recorded.</h2>

      <ul>

        <li>Easy: ${easy}</li>
        <li>Medium: ${medium}</li>
        <li>Hard: ${hard}</li>
        <li>Current streak: ${calculateLeetStreak()} days</li>

      </ul>

      <p>
        ${
          total === 0
            ? "Start with one problem today."
            : calculateLeetStreak() >= 7
            ? "Your consistency streak is strong."
            : "Focus on making LeetCode a daily habit."
        }
      </p>

    `;

  }

}


function getTodayRecommendation(today) {

  const remaining =
    today.tasks.filter(t => !t.completed);

  if (!remaining.length)
    return "Everything assigned today is complete.";

  const high =
    remaining.find(
      t => t.priority === "High"
    );

  if (high)
    return `Finish "${high.title}" before adding anything new.`;

  return "Finish the oldest remaining task before adding another.";
}


function priorityValue(priority) {

  return {
    Low: 1,
    Medium: 2,
    High: 3
  }[priority] || 0;

}


/* =========================================================
   SETTINGS / BACKUP
   ========================================================= */

document
  .getElementById("exportData")
  .addEventListener("click",() => {

    const blob =
      new Blob(
        [JSON.stringify(data,null,2)],
        {type:"application/json"}
      );

    const url =
      URL.createObjectURL(blob);

    const a =
      document.createElement("a");

    a.href = url;

    a.download =
      `thirumalai-execution-${todayKey()}.json`;

    a.click();

    URL.revokeObjectURL(url);

    toast("Backup exported");

  });


document
  .getElementById("importData")
  .addEventListener("change",e => {

    const file = e.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {

      try {

        const imported =
          JSON.parse(reader.result);

        if (
          !imported ||
          typeof imported !== "object"
        ) {
          throw new Error();
        }

        data = {
          ...structuredClone(DEFAULT_DATA),
          ...imported
        };

        saveData();

        location.reload();

      } catch {

        alert("Invalid backup file.");

      }

    };

    reader.readAsText(file);

  });


document
  .getElementById("resetToday")
  .addEventListener("click",() => {

    if (
      !confirm(
        "Delete all tasks recorded for today?"
      )
    ) return;

    delete data.days[todayKey()];

    saveData();

    renderPlanner();
    renderDashboard();
    renderHistory();

    toast("Today's planner reset");

  });


document
  .getElementById("resetEverything")
  .addEventListener("click",() => {

    if (
      !confirm(
        "This will permanently delete ALL planner, LeetCode, learning and entertainment data. Continue?"
      )
    ) return;

    if (
      !confirm(
        "Final confirmation: delete everything?"
      )
    ) return;

    data =
      structuredClone(DEFAULT_DATA);

    saveData();

    location.reload();

  });


/* =========================================================
   UTILITIES
   ========================================================= */

function formatHours(minutes) {

  const h =
    Math.floor(minutes / 60);

  const m =
    minutes % 60;

  if (!h) return `${m}m`;

  return `${h}h ${m ? m+"m" : ""}`;

}


function formatDuration(seconds) {

  const h =
    Math.floor(seconds / 3600);

  const m =
    Math.floor((seconds % 3600) / 60);

  return `${h}h ${m}m`;

}


function formatClock(milliseconds) {

  const total =
    Math.floor(milliseconds / 1000);

  const h =
    Math.floor(total / 3600);

  const m =
    Math.floor((total % 3600) / 60);

  const s =
    total % 60;

  return [
    h,m,s
  ]
    .map(x => String(x).padStart(2,"0"))
    .join(":");

}


function formatDate(key) {

  const [y,m,d] =
    key.split("-").map(Number);

  return new Date(
    y,
    m-1,
    d
  ).toLocaleDateString(
    "en-IN",
    {
      weekday:"short",
      day:"numeric",
      month:"short",
      year:"numeric"
    }
  );

}


function escapeHTML(value) {

  return String(value)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");

}


function safeURL(value) {

  try {

    const url =
      new URL(value);

    if (
      url.protocol === "http:" ||
      url.protocol === "https:"
    ) {
      return url.href;
    }

  } catch {}

  return "#";

}


function toast(message) {

  const el =
    document.getElementById("toast");

  el.textContent = message;

  el.classList.add("show");

  clearTimeout(window.__toastTimer);

  window.__toastTimer =
    setTimeout(
      () => el.classList.remove("show"),
      2200
    );

}


/* =========================================================
   INITIALIZATION
   ========================================================= */

setPhaseTimes();

renderDashboard();

renderPlanner();

renderLeetCode();

renderLearning();

renderEntertainment();

renderProgress();

renderHistory();
