// ==========================================================
// QUESTION BANK
// Matric Made Easy
// ==========================================================

// ---------- URL PARAMETERS ----------

const params = new URLSearchParams(window.location.search);

const gradeId = params.get("grade");
const subjectId = params.get("subject");

if (!subjectId) {
    alert("Subject not found.");
    window.location.href = "resources.html";
}



// ==========================================================
// GLOBAL STATE
// ==========================================================

let allQuestions = [];
let filteredQuestions = [];
let chapters = [];



// ==========================================================
// DOM ELEMENTS
// ==========================================================

const subjectTitle = document.getElementById("subject-title");

const searchInput = document.getElementById("search-input");

const chapterFilter = document.getElementById("chapter-filter");
const yearFilter = document.getElementById("year-filter");
const typeFilter = document.getElementById("type-filter");
const sortFilter = document.getElementById("sort-filter");

const questionCount = document.getElementById("question-count");

const questionsContainer = document.getElementById("questions-container");

const previewPlaceholder =
    document.getElementById("preview-placeholder");

const previewPanel =
    document.getElementById("question-preview");



// ==========================================================
// INITIALISE PAGE
// ==========================================================

document.addEventListener("DOMContentLoaded", async () => {

    await loadSubject();

    await loadChapters();
    

    await loadQuestions();

    populateChapterFilter();

    populateYearFilter();

    applyFilters();
    updateProgressSummary();

});



// ==========================================================
// LOAD SUBJECT
// ==========================================================

async function loadSubject() {

    const { data, error } = await supabaseClient
        .from("subjects")
        .select("name")
        .eq("id", subjectId)
        .single();

    if (error) {

        console.error(error);
        return;

    }

    subjectTitle.textContent = `${data.name} Question Bank`;

}



// ==========================================================
// LOAD CHAPTERS
// ==========================================================

async function loadChapters() {

    const { data, error } = await supabaseClient

        .from("chapters")

        .select("*")

        .eq("subject_id", subjectId)
        
        .eq("grade_id", gradeId)

        .order("id");



    if (error) {

        console.error(error);

        return;

    }

    chapters = data;

}



// ==========================================================
// LOAD QUESTIONS
// ==========================================================

async function loadQuestions() {

    const chapterIds = chapters.map(chapter => chapter.id);

    if (chapterIds.length === 0) {

        allQuestions = [];
        return;

    }

    const { data, error } = await supabaseClient

        .from("questions")

        .select("*")

        .in("chapter_id", chapterIds)

        .order("created_at", { ascending: false });



    if (error) {

        console.error(error);

        return;

    }

    // Add chapter names to each question

    allQuestions = data.map(question => {

        const chapter = chapters.find(c => c.id === question.chapter_id);
        console.table(allQuestions);
        return {

            ...question,

            chapter_name: chapter?.chapter_name || "Unknown Chapter"
        };

    });

}



// ==========================================================
// POPULATE CHAPTER FILTER
// ==========================================================

function populateChapterFilter() {

    chapterFilter.innerHTML =
        `<option value="">All Chapters</option>`;



    chapters.forEach(chapter => {

        const option = document.createElement("option");

        option.value = chapter.id;

        option.textContent = chapter.chapter_name;        

        chapterFilter.appendChild(option);

    });

}



// ==========================================================
// POPULATE YEAR FILTER
// ==========================================================

function populateYearFilter() {

    yearFilter.innerHTML =
        `<option value="">All Years</option>`;


    const years = [...new Set(

        allQuestions.map(question => question.year)

    )].sort().reverse();



    years.forEach(year => {

        const option = document.createElement("option");

        option.value = year;

        option.textContent = year;

        yearFilter.appendChild(option);

    });

}

// ==========================================================
// CURRENT QUESTION
// ==========================================================

let currentQuestion = null;



// ==========================================================
// APPLY FILTERS
// ==========================================================

function applyFilters() {

    filteredQuestions = [...allQuestions];

    // ---------------- Search ----------------

    const search = searchInput.value
        .trim()
        .toLowerCase();

    if (search) {

        filteredQuestions = filteredQuestions.filter(question =>

            question.question
                .toLowerCase()
                .includes(search)

        );

    }

    // ---------------- Chapter ----------------

    if (chapterFilter.value !== "") {

        filteredQuestions = filteredQuestions.filter(question =>

            question.chapter_id == chapterFilter.value

        );

    }

    // ---------------- Year ----------------

    if (yearFilter.value !== "") {

        filteredQuestions = filteredQuestions.filter(question =>

            question.year === yearFilter.value

        );

    }

    // ---------------- Type ----------------

    if (typeFilter.value !== "") {

        filteredQuestions = filteredQuestions.filter(question =>

            question.type === typeFilter.value

        );

    }

    // ---------------- Sort ----------------

    if (sortFilter.value === "newest") {

        filteredQuestions.sort((a, b) =>

            new Date(b.created_at) -
            new Date(a.created_at)

        );

    }

    else {

        filteredQuestions.sort((a, b) =>

            new Date(a.created_at) -
            new Date(b.created_at)

        );

    }

    updateQuestionCounter();

    renderQuestionCards();

    refreshStatusIcons();

}



// ==========================================================
// QUESTION COUNTER
// ==========================================================

function updateQuestionCounter() {

    questionCount.textContent =

        `Showing ${filteredQuestions.length} of ${allQuestions.length} Questions`;

}



// ==========================================================
// RENDER QUESTION CARDS
// ==========================================================

// ==========================================================
// RENDER QUESTION CARDS
// ==========================================================

function renderQuestionCards() {

    questionsContainer.innerHTML = "";

    if (filteredQuestions.length === 0) {

        questionsContainer.innerHTML = `

            <div class="empty-state">

                <h3>No questions found</h3>

                <p>Try changing your filters.</p>

            </div>

        `;

        return;

    }

    filteredQuestions.forEach(question => {

        const card = document.createElement("div");

        card.className = "question-card";

        card.dataset.id = question.id;

        // Find chapter so we can display the unit
        const chapter = chapters.find(c => c.id === question.chapter_id);

        const unit = chapter ? chapter.unit : "-";

        card.innerHTML = `

            <div class="question-left">

                <div class="unit-badge">
                    Unit ${unit}
                </div>

            </div>

            <div class="question-content">

                <div class="chapter-name">
                    ${question.chapter_name}
                </div>

                <div class="question-text">
                    ${question.question}
                </div>

                <div class="question-meta">

                    <span>${question.year}</span>

                    <span>${question.type}</span>

                </div>

            </div>

            <div
                class="question-status"
                id="status-${question.id}">
            </div>

        `;

        card.addEventListener("click", () => {

            document
                .querySelectorAll(".question-card")
                .forEach(card =>
                    card.classList.remove("selected")
                );

            card.classList.add("selected");

            currentQuestion = question;

            renderPreview(question);

        });

        questionsContainer.appendChild(card);

    });

    refreshStatusIcons();

}// ==========================================================
// RENDER PREVIEW
// ==========================================================

function renderPreview(question) {

    previewPlaceholder.classList.add("hidden");
    previewPanel.classList.remove("hidden");

    document.getElementById("preview-question").textContent =
        question.question;

    document.getElementById("preview-year").textContent =
        `Year: ${question.year}`;

    document.getElementById("preview-type").textContent =
        `${question.type} Question`;

    const status = getQuestionStatus(question.id);

    updatePreviewButtons(status);

    localStorage.setItem(
        "lastQuestionViewed",
        question.id
    );

}



// ==========================================================
// RESTORE LAST VIEWED QUESTION
// ==========================================================

function restoreLastViewedQuestion() {

    const lastQuestionId =
        localStorage.getItem("lastQuestionViewed");

    if (!lastQuestionId) return;

    const question = allQuestions.find(q =>

        q.id == lastQuestionId

    );

    if (!question) return;

    currentQuestion = question;

    renderPreview(question);

    const card = document.querySelector(

        `.question-card[data-id="${question.id}"]`

    );

    if (card) {

        card.classList.add("selected");

        card.scrollIntoView({

            behavior: "smooth",

            block: "center"

        });

    }

}



// ==========================================================
// RESET FILTERS
// ==========================================================

function resetFilters() {

    searchInput.value = "";

    chapterFilter.value = "";

    yearFilter.value = "";

    typeFilter.value = "";

    sortFilter.value = "newest";

    applyFilters();

}



// ==========================================================
// FILTER EVENTS
// ==========================================================

searchInput.addEventListener(

    "input",

    applyFilters

);

chapterFilter.addEventListener(

    "change",

    applyFilters

);

yearFilter.addEventListener(

    "change",

    applyFilters

);

typeFilter.addEventListener(

    "change",

    applyFilters

);

sortFilter.addEventListener(

    "change",

    applyFilters

);

document

    .getElementById("reset-filters")

    .addEventListener(

        "click",

        resetFilters

    );



// ==========================================================
// KEYBOARD NAVIGATION
// ==========================================================

document.addEventListener("keydown", event => {

    if (filteredQuestions.length === 0) return;

    if (!currentQuestion) return;

    const currentIndex = filteredQuestions.findIndex(question =>

        question.id === currentQuestion.id

    );

    if (event.key === "ArrowDown") {

        if (currentIndex < filteredQuestions.length - 1) {

            const nextQuestion =
                filteredQuestions[currentIndex + 1];

            document

                .querySelector(
                    `.question-card[data-id="${nextQuestion.id}"]`
                )

                ?.click();

        }

    }

    if (event.key === "ArrowUp") {

        if (currentIndex > 0) {

            const previousQuestion =
                filteredQuestions[currentIndex - 1];

            document

                .querySelector(
                    `.question-card[data-id="${previousQuestion.id}"]`
                )

                ?.click();

        }

    }

});



// ==========================================================
// PAGE READY
// ==========================================================

window.addEventListener("load", () => {

    setTimeout(() => {

        restoreLastViewedQuestion();

    }, 250);

});// ==========================================================
// PROGRESS TRACKING
// ==========================================================

const STORAGE_KEY = `questionbank-progress-${subjectId}`;

let progress =
    JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};



// ==========================================================
// STATUS HELPERS
// ==========================================================

function getQuestionStatus(questionId) {

    return progress[questionId] || "not-started";

}



function setQuestionStatus(questionId, status) {

    progress[questionId] = status;

    localStorage.setItem(

        STORAGE_KEY,

        JSON.stringify(progress)

    );

    updateQuestionStatusIcon(questionId);

    updateProgressSummary();

}



// ==========================================================
// STATUS ICONS
// ==========================================================

function updateQuestionStatusIcon(questionId) {

    const icon = document.getElementById(`status-${questionId}`);

    if (!icon) return;

    const status = getQuestionStatus(questionId);

    switch (status) {

        case "mastered":

            icon.textContent = "🟢";

            break;

        case "revision":

            icon.textContent = "🟡";

            break;

        default:

            icon.textContent = "⚪";

    }

}



// ==========================================================
// REFRESH ALL STATUS ICONS
// ==========================================================

function refreshStatusIcons() {

    filteredQuestions.forEach(question => {

        updateQuestionStatusIcon(question.id);

    });

}



// ==========================================================
// PREVIEW BUTTON STATES
// ==========================================================

function updatePreviewButtons(status) {

    const buttons = [

        document.getElementById("mark-not-started"),

        document.getElementById("mark-revision"),

        document.getElementById("mark-mastered")

    ];

    buttons.forEach(button =>

        button.classList.remove("active")

    );

    switch (status) {

        case "mastered":

            buttons[2].classList.add("active");

            break;

        case "revision":

            buttons[1].classList.add("active");

            break;

        default:

            buttons[0].classList.add("active");

    }

}



// ==========================================================
// PROGRESS SUMMARY
// ==========================================================

function updateProgressSummary() {

    const mastered = Object.values(progress)

        .filter(status => status === "mastered")

        .length;

    const revision = Object.values(progress)

        .filter(status => status === "revision")

        .length;

    const notStarted =

        allQuestions.length -

        mastered -

        revision;

    document.getElementById("progress-summary").innerHTML = `

        🟢 ${mastered} Mastered

        &nbsp;&nbsp;

        🟡 ${revision} Revision

        &nbsp;&nbsp;

        ⚪ ${notStarted} Not Started

    `;
console.log("Total:", allQuestions.length);
console.log("Progress:", progress);
console.log(Object.values(progress));
}



// ==========================================================
// STATUS BUTTON EVENTS
// ==========================================================

document

.getElementById("mark-not-started")

.addEventListener("click", () => {

    if (!currentQuestion) return;

    setQuestionStatus(

        currentQuestion.id,

        "not-started"

    );

    updatePreviewButtons("not-started");

});



document

.getElementById("mark-revision")

.addEventListener("click", () => {

    if (!currentQuestion) return;

    setQuestionStatus(

        currentQuestion.id,

        "revision"

    );

    updatePreviewButtons("revision");

});



document

.getElementById("mark-mastered")

.addEventListener("click", () => {

    if (!currentQuestion) return;

    setQuestionStatus(

        currentQuestion.id,

        "mastered"

    );

    updatePreviewButtons("mastered");

});



// ==========================================================
// INITIALISE PROGRESS
// ==========================================================

