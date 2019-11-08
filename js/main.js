// JavaScript Single Page Application

// to be able  to make cross-origin requests, what we mean by
// is making HTTP/AJAX requests we need to allow accepting
// request from different domains, protocols, subdomains, and ports

// They happen in the following cases
// 1. when we try to make a request from a different domain to out API for example
// making a request from facebook.com to google.com
// 2. when we try to make a request from the same domain but,
// different ports for example making a request from
// localhost:8080 to localhost:3000
// 3. when we try to make a request from a sub domain to a domain
// example making a request from developers.google.com to
// google.com
// 4. when we try to make a request to a different protocol
// example: from https://stripe.com to http://stripe.com

// To Allow cross-origin requests in our rails API, we need to configure
// it so, we gonna add rack-cors gem (https://github.com/cyu/rack-cors)

// console.log("process: ", process.argv[2]);

const BASE_URL = "http://localhost:3000/api/v1";

// Requests
// Create a helper module that has all question related requests
const Question = {
  all() {
    return fetch(`${BASE_URL}/questions`, {
      credentials: "include"
    }).then(res => res.json());
  },
  one(id) {
    return fetch(`${BASE_URL}/questions/${id}`, {
      credentials: "include"
    }).then(res => res.json());
  },
  create(params) {
    // params is an object that represents a question
    // { title: 'question title', body: 'question body' }
    return fetch(`${BASE_URL}/questions`, {
      credentials: "include",
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(params)
    }).then(res => res.json());
  },

  update(id, params) {
    return fetch(`${BASE_URL}/questions/${id}`, {
      credentials: "include",
      method: "PATCH", // the difference between 'PUT', and 'PATCH' verbs
      //   is that 'PATCH' only updates the params that we provide and leave the other fields
      // the way they are while, 'PUT' updates the entire recorde wether we provide
      // params or not, in case we don't provide,
      // it will just override it with an empty value or a default value that we had
      // set when designing our database schema
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(params)
    }).then(res => res.json());
  }
};

// Testing in browser
if (false) {
  // Getting all questions
  Question.all().then(questions => console.table(questions));
  // get a single question
  Question.one(31).then(question => console.table(question));
  // Create a qeustion
  const newQuestion = {
    title: "My New Awesome Question",
    body: "oh dude, this is a good question"
  };
  Question.create(newQuestion);
  // Updating a question
  const editQuestionTo = {
    title: "My Awesome Question",
    body: "It is acutally the best question I have ever heard"
  };

  Question.update(31, editQuestionTo);
}

// This is a helper module with methods associated with creating
// (and maybe later, delete) a user session
const Session = {
  create(params) {
    // params is an object that represent a use
    // { email: 'email@domain.ext', password: 'password'}
    return fetch(`${BASE_URL}/session`, {
      credentials: "include",
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(params)
    }).then(res => res.json());
  }
};

Session.create({
  // This is a very bad bad bad hacky practise do not use it
  // instead have your credentials saved in a secret file and call it
  // or you might have a form and user submits secrets there
  // and you gonna use them to create a user session
  email: "hano@codecore.com",
  password: "supersecret"
});
// Create a function to render all questions
function renderQuestions(questions) {
  const questionsContainer = document.querySelector("ul.question-list");

  questionsContainer.innerHTML = questions
    .map(q => {
      return `
            <li>
                <span>${q.id}</span>
                <a class="question-link" data-id="${q.id}" href="">
                    ${q.title}
                </a>
            </li>
        `;
    })
    .join("");
}
// Create a function to render a single question
function renderQuestionDetails(question) {
  const questionDetailsContainer = document.querySelector("#question-show");

  const htmlString = `
    <h1>${question.title}</h1>
    <p>${question.body}</p>

    <small>Asked by: ${question.author.full_name}</small>
    <a class='link' data-target="question-edit" data-id="${
      question.id
    }" href="">
    Edit
    </a>
    <h3>Answers</h3>
    <ul>
        ${question.answers.map(a => `<li>${a.body}</li>`).join("")}
    </ul>
  `;
  questionDetailsContainer.innerHTML = htmlString;
}

// Re fetch all questions
function refreshQuestions() {
  Question.all().then(questions => renderQuestions(questions));
}

// get and display a single question
function getAndDisplayQuestion(id) {
  Question.one(id).then(question => {
    // renderQuestionDetails
    renderQuestionDetails(question);
    // Navigate to Question show page
    navigateTo("question-show");
  });
}

// Navigation
function navigateTo(id, clickedLink) {
  if (id === "question-index") {
    // get all questions
    refreshQuestions();
  }

  document.querySelectorAll(".page").forEach(node => {
    node.classList.remove("active");
  });
  document.querySelector(`.page#${id}`).classList.add("active");

  if (clickedLink) {
    document.querySelectorAll(".navbar a").forEach(node => {
      node.classList.remove("active");
    });
    clickedLink.classList.add("active");
  }
}

// Wait for DOM content to laod
document.addEventListener("DOMContentLoaded", () => {
  // Show all questions event listener
  document.querySelector(".navbar").addEventListener("click", event => {
    const link = event.target.closest("[data-target]");
    if (link) {
      event.preventDefault();
      const targetPage = link.getAttribute("data-target");
      // Create navigation function
      navigateTo(targetPage, link);
    }
  });

  const questionsContainer = document.querySelector("ul.question-list");
  //   Add a click event listener to the questions container
  questionsContainer.addEventListener("click", event => {
    const questionLink = event.target.closest("a.question-link");
    if (questionLink) {
      event.preventDefault();
      const { id } = questionLink.dataset;
      // Make the http request (get the question and show)
      getAndDisplayQuestion(id);
    }
  });

  //   Create question event
  const newQuestionForm = document.querySelector("#new-question-form");
  newQuestionForm.addEventListener("submit", event => {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    const newQuestion = {
      title: fd.get("title"),
      body: fd.get("body")
    };

    Question.create(newQuestion).then(question => {
      // clear form
      newQuestionForm.reset();
      // display the question that we just created
      getAndDisplayQuestion(question.id);
    });
  });
});
