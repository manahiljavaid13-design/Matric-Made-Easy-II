# MatricMadeEasy V2

MatricMadeEasy is an educational platform designed to help students study for the FBISE curriculum.

V2 is a rebuild of the original MatricMadeEasy website, with the main focus being on connecting the website to a database and creating reusable systems for educational content.

## ✨ Current Features

### 📝 MCQ Practice

- Interactive MCQ practice
- Questions are loaded from the database
- Students can choose how many questions they want to practise
- Supports different subjects and classes as content is added

### 📚 Past Paper Question Bank

- Past paper questions stored in the database
- Questions organised by class, subject, and chapter
- Dynamic question bank that loads content from the database
- Designed to make the database expandable as more questions are added

### 📖 Revision Notes

- Database-connected revision notes
- Reusable revision notes template
- Notes organised by class, subject, and topic
- New chapters and topics can be added through the database without creating a completely new webpage for each one

## 🗄️ Database

V2 uses **Supabase** to store and retrieve the educational content displayed on the website.

The database currently contains content for:

- SSC-II
  - Physics

The database structure is designed to eventually support additional:

- Classes
- Subjects
- Chapters
- Topics
- Questions
- Revision resources

## 🆚 V1 vs V2

| V1 | V2 |
|---|---|
| Basic website structure | Database-connected website |
| More static content | Dynamic content loaded from Supabase |
| Basic MCQ system | Database-driven MCQs |
| Basic question bank | Database-driven question bank |
| Basic revision resources | Reusable revision notes template |
| Pages/content manually structured | Content organised through database |
| Limited scalability | Designed to expand across subjects and chapters |

## 🛠️ Tech Stack

- HTML
- CSS
- JavaScript
- Supabase
- GitHub
- Netlify

## 📌 Current Content

At the moment, the database contains content for:

**SSC-II Physics**

This includes content for:

- MCQ Practice
- Past Paper Question Bank
- Revision Notes

Other subjects and classes have not yet been populated, so their pages may currently appear empty.

## 🚧 Current Development

V2 is still under development.

The current focus is on:

- Improving the website's structure
- Making the different sections more consistent
- Improving the database structure
- Cleaning up and organising the code
- Adding more educational content
- Preparing the foundation for future features

## 🔮 Future Development

Future versions may include features such as:

- Student accounts
- Saved progress
- Student dashboards
- Search
- Bookmarks
- Additional practice features
- Expanded subjects and classes
- Further improvements to the website's design and responsiveness

These features are **not currently implemented in V2**.

## 🌐 Live Website

[MatricMadeEasy](https://matricmadeeasy.netlify.app/)

## 👩‍💻 About the Project

MatricMadeEasy is an independent student-built educational technology project focused on creating a more organised and interactive way for students to access FBISE learning resources.

V2 focuses on building the technical foundation of the platform through database-driven content and reusable systems that can be expanded as the project grows.
