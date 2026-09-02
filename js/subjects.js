async function loadSubjects() {

    const grid = document.getElementById("subjectsGrid");

    const params = new URLSearchParams(window.location.search);

    const grade = params.get("grade");

    const { data: subjects, error } = await supabaseClient
        .from("subjects")
        .select("*")
        .order("id");

    if (error) {
        console.error(error);
        return;
    }

    grid.innerHTML = "";

    subjects.forEach(subject => {

        grid.innerHTML += `
            <a class="subject-card"
               href="resources.html?grade=${grade}&subject=${subject.id}">

                <div class="subject-icon">
                    <i class="${subject.icon_class}"></i>
                </div>

                <h3>${subject.name}</h3>

                <p>
                    ${subject.description}
                </p>

            </a>
        `;

    });

}

loadSubjects();