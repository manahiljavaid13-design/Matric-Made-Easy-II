// ======================================================
// MCQ.JS
// Part 1 - Loading MCQs & Rendering Questions
// ======================================================



// ======================================================
// GLOBAL VARIABLES
// ======================================================

// Stores every MCQ loaded from Supabase
let mcqs = [];

// Current question index
let currentQuestion = 0;

// User's score
let score = 0;

// Stores the selected option (A/B/C/D)
let selectedOption = null;

// Prevents changing answer after checking
let answerChecked = false;

// Stores user's answers
// Example:
// [
//   {selected:"A", checked:true},
//   {selected:"C", checked:false}
// ]
let userAnswers = [];



// ======================================================
// INITIALISE MCQ PRACTICE
// Called from mcqSetup.js
// ======================================================

async function initializeMCQ(

    selectedChapters,

    questionLimit

) {

    // -----------------------------------------
    // Fetch all MCQs from selected chapters
    // -----------------------------------------

    const { data, error } = await supabaseClient

        .from("mcqs")

        .select("*")

        .in("chapter_id", selectedChapters);

    if (error) {

        console.error(error);

        document.getElementById("practiceSection").innerHTML =

            `<h2>Unable to load MCQs.</h2>`;

        return;

    }

    mcqs = data;

shuffleArray(mcqs);

// Limit number of questions

if (

    questionLimit !== -1

    &&

    questionLimit < mcqs.length

) {

    mcqs = mcqs.slice(

        0,

        questionLimit

    );

}

currentQuestion = 0;

    score = 0;

    userAnswers = [];

    // -----------------------------------------
    // Display first question
    // -----------------------------------------

    renderQuestion();

}



// ======================================================
// DISPLAY CURRENT QUESTION
// ======================================================

function renderQuestion() {

    // Current MCQ object

    const question = mcqs[currentQuestion];

    // Safety check

    if (!question) {

        showResults();

        return;

    }

    // -----------------------------------------
    // Progress bar percentage
    // -----------------------------------------

    const answeredQuestions = userAnswers.filter(answer => answer?.checked).length;

    const progress =
    (answeredQuestions / mcqs.length) * 100;

    // -----------------------------------------
    // Has this question already been answered?
    // -----------------------------------------

    const previous = userAnswers[currentQuestion];

    selectedOption = previous ? previous.selected : null;

    answerChecked = previous ? previous.checked : false;

    // -----------------------------------------
    // Render page
    // -----------------------------------------

    document.getElementById("practiceSection").innerHTML = `

<div class="quiz-container">

    <!-- Progress -->

    <div class="progress-bar">

        <div
            class="progress-fill"
            style="width:${progress}%"
        ></div>

    </div>

    <!-- Question Counter -->

    <div class="question-counter">

        Question ${currentQuestion + 1}
        of
        ${mcqs.length}

    </div>

    <!-- Question -->

    <div class="question-card">

        <h2>

            ${question.question}

        </h2>

    </div>

    <!-- Options -->

    <div class="options">

        ${createOption("A",question.option_a)}

        ${createOption("B",question.option_b)}

        ${createOption("C",question.option_c)}

        ${createOption("D",question.option_d)}

    </div>

    <!-- Feedback appears here -->

    <div id="feedback"></div>

    <!-- Navigation -->

    <div class="quiz-buttons">

        <button

            id="previousBtn"

            onclick="previousQuestion()"

            ${currentQuestion===0 ? "disabled" : ""}

        >

            Previous

        </button>

        <button

            id="checkBtn"

            onclick="checkAnswer()"

            ${answerChecked ? "disabled" : ""}

        >

            Check Answer

        </button>

        <button

            id="nextBtn"

            onclick="nextQuestion()"

            ${!answerChecked ? "disabled" : ""}

        >

            ${currentQuestion===mcqs.length-1

                ? "Finish"

                : "Next"}

        </button>

    </div>

</div>

`;

    // Restore selection if user revisits question

   if(selectedOption){

    document
        .querySelector(
            `.option-btn[data-option="${selectedOption}"]`
        )
        ?.classList.add("selected");

}

if(answerChecked){

    highlightAnswers(mcqs[currentQuestion].correct_option);

    disableOptions();

    showFeedback(mcqs[currentQuestion].correct_option);

    document.getElementById("checkBtn").disabled = true;

    document.getElementById("nextBtn").disabled = false;

}

}



// ======================================================
// CREATE ONE OPTION BUTTON
// ======================================================

function createOption(letter,text){

    return `

<button

    class="option-btn"

    data-option="${letter}"

    onclick="selectOption('${letter}',this)"

>

    <span class="option-letter">

        ${letter}

    </span>

    <span class="option-text">

        ${text}

    </span>

</button>

`;

}



// ======================================================
// USER SELECTS AN OPTION
// ======================================================

function selectOption(letter,button){

    // Don't allow changing answer after checking

    if(answerChecked){

        return;

    }

    // Store selection

    selectedOption = letter;

    // Remove previous selection

    document

        .querySelectorAll(".option-btn")

        .forEach(btn=>{

            btn.classList.remove("selected");

        });

    // Highlight clicked option

    button.classList.add("selected");

}



// ======================================================
// SHUFFLE ARRAY
// Fisher-Yates Shuffle
// ======================================================

function shuffleArray(array){

    for(

        let i=array.length-1;

        i>0;

        i--

    ){

        const j=Math.floor(

            Math.random()*(i+1)

        );

        [array[i],array[j]]

            =

        [array[j],array[i]];

    }

}









// ======================================================
// PART 2 - CHECKING ANSWERS & NAVIGATION
// ======================================================



// ======================================================
// CHECK USER'S ANSWER
// Called when "Check Answer" is pressed
// ======================================================

function checkAnswer() {

    // Prevent checking twice
    if (answerChecked) return;

    // User must select an option first
    if (!selectedOption) {

        alert("Please select an answer first.");

        return;

    }

    const question = mcqs[currentQuestion];

    // Correct option from database
    const correctOption = question.correct_option;

    answerChecked = true;

    // Save this question so when user returns later
    // we remember what they chose
    userAnswers[currentQuestion] = {

        selected: selectedOption,

        checked: true

    };

    // Increase score ONLY if correct
    if (selectedOption === correctOption) {

        score++;

    }
    const answeredQuestions =
    userAnswers.filter(answer => answer?.checked).length;

    document.querySelector(".progress-fill").style.width =
    `${(answeredQuestions / mcqs.length) * 100}%`;

    // Highlight every option correctly
    highlightAnswers(correctOption);

    // Disable option buttons
    disableOptions();

    // Show feedback message
    showFeedback(correctOption);

    // Buttons

    document.getElementById("checkBtn").disabled = true;

    document.getElementById("nextBtn").disabled = false;

}



// ======================================================
// HIGHLIGHT OPTIONS
// ======================================================

function highlightAnswers(correctOption) {

    document.querySelectorAll(".option-btn")

        .forEach(button => {

            const option = button.dataset.option;

            // Correct answer

            if (option === correctOption) {

                button.classList.add("correct");

            }

            // Wrong selected answer

            else if (option === selectedOption) {

                button.classList.add("incorrect");

            }

        });

}



// ======================================================
// DISABLE OPTIONS AFTER CHECKING
// ======================================================

function disableOptions() {

    document.querySelectorAll(".option-btn")

        .forEach(button => {

            button.disabled = true;

        });

}



// ======================================================
// SHOW CORRECT / INCORRECT MESSAGE
// ======================================================

function showFeedback(correctOption) {

    const feedback = document.getElementById("feedback");

    const question = mcqs[currentQuestion];

    if (selectedOption === correctOption) {

        feedback.innerHTML = `

            <div class="feedback correct-feedback">

                <i class="fa-solid fa-circle-check"></i>

                Correct!

            </div>

        `;

    }

    else {

        const optionText =

            question[
                `option_${correctOption.toLowerCase()}`
            ];

        feedback.innerHTML = `

            <div class="feedback incorrect-feedback">

                <i class="fa-solid fa-circle-xmark"></i>

                Incorrect

                <br><br>

                <strong>

                    Correct Answer:

                </strong>

                ${correctOption}. ${optionText}

            </div>

        `;

    }

}



// ======================================================
// NEXT QUESTION
// ======================================================

function nextQuestion() {

    // Last question?

    if (currentQuestion === mcqs.length - 1) {

        showResults();

        return;

    }

    currentQuestion++;

    renderQuestion();

}



// ======================================================
// PREVIOUS QUESTION
// ======================================================

function previousQuestion() {

    if (currentQuestion === 0) {

        return;

    }

    currentQuestion--;

    renderQuestion();

}



// ======================================================
// RESTORE QUESTION IF USER GOES BACK
// ======================================================

// Add these lines near the END of renderQuestion()
// (right after restoring the selected option)

if (answerChecked) {

    highlightAnswers(mcqs[currentQuestion].correct_option);

    disableOptions();

    showFeedback(mcqs[currentQuestion].correct_option);

    document.getElementById("checkBtn").disabled = true;

    document.getElementById("nextBtn").disabled = false;

}

// ======================================================
// PART 3 - RESULTS SCREEN & RETRY LOGIC
// ======================================================



// ======================================================
// SHOW RESULTS
// ======================================================

function showResults() {

    const percentage = Math.round(

        (score / mcqs.length) * 100

    );

    let message = "";

    if (percentage >= 90) {

        message = "Outstanding! 🎉";

    }

    else if (percentage >= 75) {

        message = "Great job! Keep it up.";

    }

    else if (percentage >= 50) {

        message = "Good effort! A little more practice will help.";

    }

    else {

        message = "Keep practising — you'll improve with consistency.";

    }

    document.getElementById("practiceSection").innerHTML = `

<div class="results-container">

    <div class="results-card">

        <div class="results-icon">

            <i class="fa-solid fa-award"></i>

        </div>

        <h1>

            Practice Complete

        </h1>

        <p class="results-message">

            ${message}

        </p>

        <div class="score-circle">

            ${percentage}%

        </div>

        <div class="results-stats">

            <div class="stat">

                <span class="stat-number">

                    ${score}

                </span>

                <span class="stat-label">

                    Correct

                </span>

            </div>

            <div class="stat">

                <span class="stat-number">

                    ${mcqs.length}

                </span>

                <span class="stat-label">

                    Total

                </span>

            </div>

            <div class="stat">

                <span class="stat-number">

                    ${mcqs.length - score}

                </span>

                <span class="stat-label">

                    Incorrect

                </span>

            </div>

        </div>

        <div class="results-buttons">

            <button
                class="primary-btn"
                onclick="retryIncorrectQuestions()"
            >

                Retry Incorrect

            </button>

            <button
                class="secondary-btn"
                onclick="restartPractice()"
            >

                Restart Practice

            </button>

            <button
                class="secondary-btn"
                onclick="goBackToSetup()"
            >

                Back to Chapters

            </button>

        </div>

    </div>

</div>

`;

}



// ======================================================
// RETRY INCORRECT QUESTIONS ONLY
// ======================================================

function retryIncorrectQuestions() {

    const incorrectQuestions = [];

    userAnswers.forEach((answer, index) => {

        if (!answer) return;

        const question = mcqs[index];

        if (answer.selected !== question.correct_option) {

            incorrectQuestions.push(question);

        }

    });

    if (incorrectQuestions.length === 0) {

        alert("Amazing! You answered every question correctly.");

        restartPractice();

        return;

    }

    mcqs = incorrectQuestions;

    shuffleArray(mcqs);

    currentQuestion = 0;

    score = 0;

    userAnswers = [];

    renderQuestion();

}



// ======================================================
// RESTART ENTIRE QUIZ
// ======================================================

function restartPractice() {

    shuffleArray(mcqs);

    currentQuestion = 0;

    score = 0;

    userAnswers = [];

    renderQuestion();

}



// ======================================================
// RETURN TO CHAPTER SELECTION
// ======================================================

function goBackToSetup() {

    document

        .getElementById("practiceSection")

        .classList.add("hidden");

    document

        .getElementById("landingSection")

        .classList.remove("hidden");

}



// ======================================================
// OPTIONAL KEYBOARD SHORTCUTS
// ======================================================

document.addEventListener("keydown", function (event) {

    // Ignore if quiz isn't visible

    if (

        document

            .getElementById("practiceSection")

            .classList.contains("hidden")

    ) {

        return;

    }

    // Number keys choose options

    if (!answerChecked) {

        switch (event.key) {

            case "1":

                document

                    .querySelector('[data-option="A"]')

                    ?.click();

                break;

            case "2":

                document

                    .querySelector('[data-option="B"]')

                    ?.click();

                break;

            case "3":

                document

                    .querySelector('[data-option="C"]')

                    ?.click();

                break;

            case "4":

                document

                    .querySelector('[data-option="D"]')

                    ?.click();

                break;

        }

    }

    // Enter checks answer

    if (

        event.key === "Enter"

        &&

        !answerChecked

    ) {

        document

            .getElementById("checkBtn")

            ?.click();

    }

    // Right Arrow → Next

    if (

        event.key === "ArrowRight"

        &&

        answerChecked

    ) {

        document

            .getElementById("nextBtn")

            ?.click();

    }

    // Left Arrow → Previous

    if (

        event.key === "ArrowLeft"

    ) {

        document

            .getElementById("previousBtn")

            ?.click();

    }

});


