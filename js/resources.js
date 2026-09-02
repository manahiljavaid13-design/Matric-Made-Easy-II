async function loadResources() {

    const params = new URLSearchParams(window.location.search);

    const gradeId = params.get("grade");
    const subjectId = params.get("subject");

    // Redirect if URL is missing parameters
    if (!gradeId || !subjectId) {
        window.location.href = "index.html";
        return;
    }

    // Fetch grade and subject from Supabase
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

    // Heading
    document.getElementById("subjectTitle").textContent =
        `${subject.name} • ${grade.name}`;

    // Back button
    document.getElementById("backBtn").href =
        `subjects.html?grade=${gradeId}`;

    // Resource links
    document.getElementById("mcqCard").href =
    `practice.html?grade=${gradeId}&subject=${subjectId}`;

    document.getElementById("notesCard").href =
    `notes.html?grade=${gradeId}&subject=${subjectId}`;


   document.getElementById("questionsCard").href =
    `questionbank.html?grade=${gradeId}&subject=${subjectId}`;
}

loadResources();
