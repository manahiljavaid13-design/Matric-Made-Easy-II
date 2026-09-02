// ==========================================
// MME NOTES ENGINE
// ==========================================


// ==========================================
// GET URL PARAMETERS
// ==========================================

const params = new URLSearchParams(window.location.search);

const gradeId = params.get("grade");
const subjectId = params.get("subject");
const topicId = params.get("topic");


// ==========================================
// PAGE ELEMENTS
// ==========================================

const chapterList = document.getElementById("chapterList");
const sidebarSubject = document.getElementById("sidebarSubject");
const noteContent = document.getElementById("noteContent");
const backBtn = document.getElementById("backBtn");

const sidebarToggle = document.getElementById("sidebarToggle");
const notesPage = document.querySelector(".notes-page");
const scrollToTop = document.getElementById("scrollToTop");

let allSubtopics = [];
// ==========================================
// CHECK URL
// ==========================================

if (!gradeId || !subjectId) {

    window.location.href = "index.html";

}
// ==========================================
// SIDEBAR TOGGLE
// ==========================================




sidebarToggle.addEventListener("click", () => {

    notesPage.classList.toggle("sidebar-collapsed");

});

// ==========================================
// LOAD NOTES PAGE
// ==========================================

async function loadNotesPage() {

    try {

        // --------------------------------------
        // Fetch grade and subject
        // --------------------------------------

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


        // --------------------------------------
        // Check errors
        // --------------------------------------

        if (gradeError || subjectError) {

            console.error("Grade error:", gradeError);
            console.error("Subject error:", subjectError);

            showError(
                "We couldn't load the subject information."
            );

            return;

        }


        // --------------------------------------
        // Page title
        // --------------------------------------

        document.title =
            `${subject.name} Revision Notes | Matric Made Easy`;


        // --------------------------------------
        // Sidebar subject
        // --------------------------------------

        sidebarSubject.textContent =
            `${subject.name} • ${grade.name}`;


        // --------------------------------------
        // Back button
        // --------------------------------------

        backBtn.href =
            `resources.html?grade=${gradeId}&subject=${subjectId}`;


        // --------------------------------------
        // Fetch chapters
        // --------------------------------------

        const {
            data: chapters,
            error: chaptersError
        } = await supabaseClient
            .from("chapters")
            .select(`
                id,
                unit,
                chapter_name
            `)
            .eq("grade_id", gradeId)
            .eq("subject_id", subjectId)
            .order("unit", { ascending: true });


        // --------------------------------------
        // Check chapter error
        // --------------------------------------

        if (chaptersError) {

            console.error(
                "Chapter error:",
                chaptersError
            );

            showError(
                "We couldn't load the chapters."
            );

            return;

        }


        // --------------------------------------
        // Check chapters
        // --------------------------------------

        if (!chapters || chapters.length === 0) {

            chapterList.innerHTML = `
                <p class="sidebar-empty">
                    No chapters available yet.
                </p>
            `;

            return;

        }


        // --------------------------------------
        // Build sidebar
        // --------------------------------------

        await buildSidebar(chapters);


        // --------------------------------------
        // Load topic
        // --------------------------------------

        if (topicId) {

            await loadTopic(topicId);

        } else {

            showWelcomeMessage();

        }


    } catch (error) {

        console.error(
            "Unexpected notes error:",
            error
        );

        showError(
            "Something went wrong while loading the notes."
        );

    }

}


// ==========================================
// BUILD SIDEBAR
// ==========================================

async function buildSidebar(chapters) {

    chapterList.innerHTML = "";

    // ==========================================
    // FETCH ALL SUBTOPICS IN ONE REQUEST
    // ==========================================

    const chapterIds = chapters.map(chapter => chapter.id);

    const {
    data: fetchedSubtopics,
    error: subtopicsError
    } = await supabaseClient
        .from("subtopics")
        .select(`
            id,
            chapter_id,
            subtopic_number,
            subtopic_name
        `)
        .in("chapter_id", chapterIds)
        .order("subtopic_number", { ascending: true });


    // ==========================================
    // CHECK ERROR
    // ==========================================

    if (subtopicsError) {

        console.error(
            "Subtopic error:",
            subtopicsError
        );

    }


    // ==========================================
    // GROUP SUBTOPICS BY CHAPTER
    // ==========================================

    const subtopicsByChapter = {};

    (fetchedSubtopics || []).forEach(subtopic => {
        if (!subtopicsByChapter[subtopic.chapter_id]) {
            subtopicsByChapter[subtopic.chapter_id] = [];
        }

        subtopicsByChapter[subtopic.chapter_id].push(subtopic);

    });
    // ==========================================
// BUILD GLOBAL TOPIC ORDER
// Used for Previous / Next navigation
// ==========================================

allSubtopics = [];

chapters.forEach(chapter => {

    const subtopics =
        subtopicsByChapter[chapter.id] || [];

    subtopics.forEach(subtopic => {

        allSubtopics.push({

            id: subtopic.id,

            chapter_id: subtopic.chapter_id,

            subtopic_number:
                subtopic.subtopic_number,

            subtopic_name:
                subtopic.subtopic_name,

            display_number:
                `${chapter.unit}.${subtopic.subtopic_number}`

        });

    });

});


    // ==========================================
    // BUILD SIDEBAR
    // ==========================================

    chapters.forEach(chapter => {

        // --------------------------------------
        // Create chapter
        // --------------------------------------

        const chapterElement =
            document.createElement("div");

        chapterElement.className =
            "chapter";


        // --------------------------------------
        // Chapter header
        // --------------------------------------

        const chapterHeader =
            document.createElement("button");

        chapterHeader.className =
            "chapter-header";

        chapterHeader.type = "button";

        chapterHeader.innerHTML = `

            <span class="chapter-name">
                ${chapter.unit}.
                ${chapter.chapter_name}
            </span>

            <i class="fa-solid fa-chevron-down chapter-arrow"></i>

        `;


        // --------------------------------------
        // Subtopic container
        // --------------------------------------

        const subtopicList =
            document.createElement("div");

        subtopicList.className =
            "subtopic-list";


        // --------------------------------------
        // Get subtopics for this chapter
        // --------------------------------------

        const subtopics =
            subtopicsByChapter[chapter.id] || [];


        // --------------------------------------
        // Create subtopics
        // --------------------------------------

        if (subtopics.length > 0) {

            subtopics.forEach(subtopic => {

                const subtopicLink =
                    document.createElement("a");

                subtopicLink.className =
                    "subtopic";

                subtopicLink.href = "#";

                subtopicLink.dataset.topicId =
                    subtopic.id;


                subtopicLink.innerHTML = `

                    <span class="subtopic-indicator"></span>

                    <span class="subtopic-number">
                        ${chapter.unit}.${subtopic.subtopic_number}
                    </span>

                    <span class="subtopic-name">
                        ${subtopic.subtopic_name}
                    </span>

                `;


                // ----------------------------------
                // Click topic
                // ----------------------------------

                subtopicLink.addEventListener(
                    "click",
                    async (event) => {

                        event.preventDefault();

                        const newUrl =
                            `notes.html?grade=${gradeId}&subject=${subjectId}&topic=${subtopic.id}`;

                        window.history.pushState(
                            { topicId: subtopic.id },
                            "",
                            newUrl
                        );

                        await loadTopic(subtopic.id);

                    }
                );


                subtopicList.appendChild(
                    subtopicLink
                );

            });

        }


        // --------------------------------------
        // No subtopics
        // --------------------------------------

        else {

            subtopicList.innerHTML = `

                <p class="no-subtopics">
                    No topics available yet.
                </p>

            `;

        }


        // --------------------------------------
        // Assemble chapter
        // --------------------------------------

        chapterElement.appendChild(
            chapterHeader
        );

        chapterElement.appendChild(
            subtopicList
        );

        chapterList.appendChild(
            chapterElement
        );


        // --------------------------------------
        // Expand / collapse
        // --------------------------------------

        chapterHeader.addEventListener(
            "click",
            () => {

                chapterElement.classList.toggle(
                    "expanded"
                );

            }
        );

    });

}
function updateActiveTopic(topicId) {

    document.querySelectorAll(".subtopic").forEach(link => {

        const isActive =
            String(link.dataset.topicId) === String(topicId);

        link.classList.toggle("active", isActive);

    });

}
// ==========================================
// UPDATE NEXT TOPIC BUTTON
// ==========================================

function updateTopicNavigation(currentTopicId) {

    const currentIndex =
        allSubtopics.findIndex(
            topic =>
                String(topic.id) ===
                String(currentTopicId)
        );

    if (currentIndex === -1) {
        return;
    }


    const previousTopic =
        allSubtopics[currentIndex - 1] || null;

    const nextTopic =
        allSubtopics[currentIndex + 1] || null;


    let html = `
        <nav
            class="note-navigation"
            aria-label="Topic navigation"
        >
    `;


    // ======================================
    // PREVIOUS
    // ======================================

    if (previousTopic) {

        html += `
            <a
                href="#"
                class="note-nav-button note-nav-previous"
                data-topic-id="${previousTopic.id}"
            >

                <span class="note-nav-label">
                    <i class="fa-solid fa-arrow-left"></i>
                    Previous
                </span>

                <span class="note-nav-title">
                    ${previousTopic.display_number}
                    ${previousTopic.subtopic_name}
                </span>

            </a>
        `;

    } else {

        html += `<div></div>`;

    }


    // ======================================
    // NEXT
    // ======================================

    if (nextTopic) {

        html += `
            <a
                href="#"
                class="note-nav-button note-nav-next"
                data-topic-id="${nextTopic.id}"
            >

                <span class="note-nav-label">
                    Next
                    <i class="fa-solid fa-arrow-right"></i>
                </span>

                <span class="note-nav-title">
                    ${nextTopic.display_number}
                    ${nextTopic.subtopic_name}
                </span>

            </a>
        `;

    } else {

        html += `<div></div>`;

    }


    html += `
        </nav>
    `;


    noteContent.insertAdjacentHTML(
        "beforeend",
        html
    );


    // ======================================
    // ADD CLICK EVENTS
    // ======================================

    document
        .querySelectorAll(
            ".note-nav-button[data-topic-id]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                async event => {

                    event.preventDefault();

                    const newTopicId =
                        button.dataset.topicId;


                    const newUrl =
                        `notes.html?grade=${gradeId}&subject=${subjectId}&topic=${newTopicId}`;


                    window.history.pushState(
                        {
                            topicId: newTopicId
                        },
                        "",
                        newUrl
                    );


                    await loadTopic(
                        newTopicId
                    );

                }
            );

        });

}
// ==========================================
// LOAD TOPIC
// ==========================================

async function loadTopic(topicId) {
    noteContent.innerHTML = `
    <div class="notes-loading">
        <i class="fa-solid fa-spinner fa-spin"></i>
        <p>Loading revision notes...</p>
    </div>
    `;
    const {
        data: note,
        error
    } = await supabaseClient

        .from("revision_notes")

        .select(`
            id,
            subtopic_id,
            content
        `)

        .eq("subtopic_id", topicId)

        .single();


    if (error) {

        console.error(
            "Note error:",
            error
        );

        showError(
            "We couldn't load this revision note."
        );

        return;

    }


    noteContent.innerHTML = `
        <div class="note-content-inner">
            ${note.content}
        </div>
        `;

        // Update the Next Topic button
        updateTopicNavigation(topicId);
        if (window.MathJax) {

        await MathJax.typesetPromise([
            noteContent
        ]);

}

    // --------------------------------------
    // Mark active topic
    // --------------------------------------

    updateActiveTopic(topicId);


    // --------------------------------------
    // Expand active chapter
    // --------------------------------------

    const activeLink =
        document.querySelector(
            `.subtopic[data-topic-id="${topicId}"]`
        );


    if (activeLink) {

        const chapter =
            activeLink.closest(".chapter");

        if (chapter) {

            chapter.classList.add(
                "expanded"
            );

        }

    }

}


// ==========================================
// WELCOME MESSAGE
// ==========================================

function showWelcomeMessage() {

    noteContent.innerHTML = `

        <div class="notes-welcome">

            <span class="welcome-icon">

                <i class="fa-solid fa-book-open"></i>

            </span>

            <h1>
                Revision Notes
            </h1>

            <p>
                Choose a topic from the sidebar
                to begin revising.
            </p>

        </div>

    `;

}


// ==========================================
// ERROR MESSAGE
// ==========================================

function showError(message) {

    noteContent.innerHTML = `

        <div class="notes-error">

            <i class="fa-solid fa-circle-exclamation"></i>

            <h2>
                Something went wrong
            </h2>

            <p>
                ${message}
            </p>

        </div>

    `;

}


// ==========================================
// START
// ==========================================

loadNotesPage();

window.addEventListener("popstate", async () => {

    const params =
        new URLSearchParams(
            window.location.search
        );

    const topicId =
        params.get("topic");

    if (topicId) {

        await loadTopic(topicId);

    } else {

        showWelcomeMessage();

    }

});

// ==========================================
// SIDEBAR TOGGLE
// ==========================================



window.addEventListener("scroll", () => {
    if (window.scrollY > 400) {
        scrollToTop.classList.add("visible");
    } else {
        scrollToTop.classList.remove("visible");
    }
});

scrollToTop.addEventListener("click", () => {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
});