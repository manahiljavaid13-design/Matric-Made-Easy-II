// practice.js

const params = new URLSearchParams(window.location.search);

const gradeId = params.get("grade");
const subjectId = params.get("subject");

const pageTitle = document.getElementById("pageTitle");
const pageDescription = document.getElementById("pageDescription");
const backBtn = document.getElementById("backBtn");

const chapterList = document.getElementById("chapterList");
const startBtn = document.getElementById("startBtn");

let chapters = [];

if (!gradeId || !subjectId) {

    window.location.href = "index.html";

}

initializePage();

async function initializePage() {

    backBtn.href = `resources.html?grade=${gradeId}&subject=${subjectId}`;

    await loadHeading();

    await loadChapters();

    startBtn.addEventListener("click", startPractice);

}

async function loadHeading() {

    const [
        { data: grade, error: gradeError },
        { data: subject, error: subjectError }
    ] = await Promise.all([

        supabaseClient
            .from("grades")
            .select("name")
            .eq("id", gradeId)
            .single(),

        supabaseClient
            .from("subjects")
            .select("name")
            .eq("id", subjectId)
            .single()

    ]);

    if (gradeError || subjectError) {

        console.error(gradeError);
        console.error(subjectError);

        return;

    }

    pageTitle.textContent =
        `${subject.name} • MCQ Practice`;

    pageDescription.textContent =
        "Select one or more chapters to begin practicing.";

}

async function loadChapters() {

    const { data, error } = await supabaseClient

        .from("chapters")

        .select("*")

        .eq("grade_id", gradeId)

        .eq("subject_id", subjectId)

        .order("unit");

    if (error) {

        console.error(error);

        return;

    }

    chapters = data;

    renderChapters();

}

function renderChapters() {

    chapterList.innerHTML = "";

    chapters.forEach(chapter => {

        const label = document.createElement("label");

        label.className = "chapter-card";

        label.innerHTML = `

            <input
                type="checkbox"
                value="${chapter.id}"
            >

            <div class="chapter-info">

                <h3>Chapter ${chapter.unit}</h3>

                <p>${chapter.chapter_name}</p>

            </div>

        `;

        chapterList.appendChild(label);

    });

}

function startPractice() {

    const selectedChapters = [];

    document
        .querySelectorAll("#chapterList input:checked")
        .forEach(box => {

            selectedChapters.push(Number(box.value));

        });
        const questionLimit = Number(

    document.querySelector(

        'input[name="questionCount"]:checked'

    ).value

);

    if (selectedChapters.length === 0) {

        alert("Please select at least one chapter.");

        return;

    }

    // Hide setup screen
    document
        .getElementById("landingSection")
        .classList.add("hidden");

    // Show MCQ interface
    document
        .getElementById("practiceSection")
        .classList.remove("hidden");

    // Launch MCQ Practice
    initializeMCQ(

    selectedChapters,

    questionLimit

);

}