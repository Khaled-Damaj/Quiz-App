//We can fetch the questions using the api below
//url: https://opentdb.com/api_config.php //https://docs.ccle.ucla.edu/index.php?title=Tips_for_taking_quizzes_in_CCLE_Moodle

/*
    Collect data from the form
    [1]. The name
    [2]. Number of question
    [3]. selected category
    [4]. selected difficulity
    [5]. selected questions type
    [6]. click on begin test button
    [7]. remove the form after submition

*/

let form = document.getElementById("form"),
  container = document.querySelector(".container"),
  username = document.getElementById("username"),
  hour = document.getElementById("total-hours"),
  minutes = document.getElementById("total-minutes"),
  numberOfQuestion = document.getElementById("total-number"),
  selectedCategory = document.getElementById("category"),
  selectedDifficulity = document.getElementById("difficulty"),
  selectedQuestionsType = document.getElementById("questions-type"),
  navigationNumbers = document.querySelector(".question-numbers"),
  review_container = document.querySelector(".review .container .col-1"),
  completed_date = document.querySelector(".completed-date"),
  quiz_minutes = document.querySelector("#quiz .minutes"),
  quiz_seconds = document.querySelector("#quiz .seconds"),
  count_interval,
  position = 0,
  questionsLength = 0,
  questions,
  shuffled_questions = [],
  answerd = {};

let user = "";
const date = new Date();
let questionsQbjects = [];
let grade = 0;

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

document.querySelector("#begin-test").onclick = function (e) {
  let amount = numberOfQuestion,
    difficulty = "",
    category = "",
    type = "",
    url;

  // check the username input if it's not empty then it will takes the user's value
  if (username.value === "") {
    user = "user";
  } else {
    user = username.value;
  }

  //set the category
  if (selectedCategory.value !== "any") {
    category = `&category=${selectedCategory.value}`;
  }

  //set the difficulty
  if (selectedDifficulity.value !== "any") {
    difficulty = `&difficulty=${selectedDifficulity.value}`;
  }

  // set the type of questions
  if (selectedQuestionsType.value !== "any") {
    type = `&type=${selectedQuestionsType.value}`;
  }

  // build the url to fetch the data
  url = `https://opentdb.com/api.php?amount=${amount.value}${category}${difficulty}${type}`;
  form.remove();
  quiz_minutes.textContent =
    parseInt(minutes.value) + parseInt(hour.value * 60) < 10
      ? `0${parseInt(minutes.value) + parseInt(hour.value * 60) - 1}`
      : parseInt(minutes.value) + parseInt(hour.value * 60) - 1;
  fetchQuestions(url);
  5;
  container.classList.add("show");
};

// fetch json using ajax call
// function getQuestions(url) {
//   let myRequest = new XMLHttpRequest();

//   myRequest.onreadystatechange = function () {
//     if (this.readyState === 4 && this.status === 200) {
//       questionsObject = JSON.parse(this.responseText);
//       console.log(Array.from(questionsObject.results));
//       // questions = Array.from(questionsObject.results);
//       // // get the total number of question
//       // questionsLength = questions.length;
//       // // create the quiz navigation
//       // createNavigation(questions);
//       // addQuestion(questions[position]);
//     }
//   };
//   myRequest.open("GET", url, true);

//   myRequest.send();
// }

function fetchQuestions(url) {
  // fetch the data
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      // json object contains two objects, the code-reuqest and the results
      // where the results is an array that contains the questions as object
      questions = Array.from(data.results);

      // get the total number of questions
      questionsLength = questions.length;

      // create the quiz navigation
      createNavigation(questions);
      timer(parseInt(minutes.value) + parseInt(hour.value * 60));
      addQuestion();
    });
}

function createNavigation(arr) {
  arr.forEach(function (ele, index) {
    navigationNumbers.innerHTML += `
    <span class="number" data-number=${index + 1}>${index + 1}</span>`;
  });
}

function addQuestion() {
  let questionNumber = document.querySelector("span.question-number");

  let questionContainer = document.querySelector(".generate-question");

  questionNumber.textContent = position + 1;

  // create an array that hold all the questions
  let answers = Array.from(questions[position].incorrect_answers);

  // we push the right answer
  answers.push(questions[position].correct_answer);

  //call array_shuffle function to shuffle the array
  let shuffleAnswers = array_shuffle(answers);

  // add shuffled array to the shuffled questions array
  shuffled_questions.push(shuffleAnswers);

  // get the category of the question
  let category = questions[position].category;

  //get the question
  let currentQuestion = questions[position].question;

  // append the question
  questionContainer.innerHTML = `              
    <span class="question" data-number="${
      position + 1
    }">${currentQuestion}</span>
    <span class="select">Select one:</span>`;

  // check if the type is multiple then we add all the answers else if it's boolean we add true and false
  shuffleAnswers.forEach((ele, index) => {
    questionContainer.innerHTML += `
          <div>
              <input type="radio" name="${category}"
              id="answer_${index + 1}" value="${ele}" />
              <label for="answer_${index + 1}">${ele}</label>
          </div>
        `;
  });

  // set the answer to empty
  answerd[`question_${questionNumber.textContent}`] = "";

  // set the answer to the chosen value
  document.querySelectorAll(".generate-question div input").forEach((radio) => {
    radio.onclick = function () {
      let obj = {
        choosed_answer: radio.value,
        questions: shuffleAnswers,
        result: questions[position],
      };
      questionsQbjects.push(obj);
      answerd[`question_${questionNumber.textContent}`] = radio.value;
      document.querySelector(".answered").textContent = "Answer is saved";
    };
  });

  if (
    parseInt(quiz_minutes.textContent) === 0 &&
    parseInt(quiz_seconds.textContent) === 0
  ) {
    createReviewPage();
  }

  if (position === questions.length - 1) {
    document.querySelector(".next").textContent = "Finish attempt";
    setTimeout(() => {
      document.querySelector(".next").classList.add("finish");
      document.querySelector(".next").classList.remove("next");
    }, 500);
  }
}

// fucntion to shuffle an array
function array_shuffle(arr) {
  let new_Array = [];
  for (var i = 0; i < arr.length; i++) {
    let random = Math.floor(Math.random() * arr.length);
    while (new_Array.indexOf(arr[random]) !== -1) {
      random = Math.floor(Math.random() * arr.length);
    }
    new_Array.push(arr[random]);
  }
  return new_Array;
}

document.addEventListener("click", function (e) {
  if (e.target.classList.contains("next")) {
    Array.from(navigationNumbers.children).forEach((ele) => {
      if (ele.dataset.number == position + 1) {
        if (answerd[`question_${position + 1}`] !== "") {
          ele.classList.add("active");
          document.querySelector(".answered").textContent = "Not yet saved";
        } else {
          questionsQbjects.push({
            choosed_answer: "",
            questions: shuffled_questions[position],
            result: questions[position],
          });
        }
      }
    });
    position++;
    addQuestion();
  }

  if (
    e.target.classList.contains("finish") ||
    e.target.classList.contains("finish-attempt")
  ) {
    if (answerd[`question_${position + 1}`] !== "") {
      navigationNumbers.children[position].classList.add("active");
    } else {
      questionsQbjects.push({
        choosed_answer: "",
        questions: shuffled_questions[position],
        result: questions[position],
      });
    }
    createPopup();
  }
});

function createPopup() {
  let popup = document.createElement("div");
  popup.className = "popup";
  popup.innerHTML = `
    <div class="box">
      <h2>Confirmation</h2>
      <p>
        Once you submit you will no longer be able to change your answers for
        this attempt
      </p>
      <span class="submit">Submit all and finish</span>
      <span class="cancel">Cancel</span>
    </div>
  `;
  document.body.appendChild(popup);

  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("cancel")) {
      e.target.parentNode.parentNode.remove();
    }
    if (e.target.classList.contains("submit")) {
      e.target.parentNode.parentNode.remove();
      document.getElementById("quiz").remove();
      createReviewPage();
    }
  });
}

// function to create the review page
function createReviewPage() {
  clearInterval(count_interval);
  console.log(quiz_minutes.textContent + " " + quiz_seconds.textContent);
  document.querySelector(".review").classList.add("show");
  // let reviewQuestions = document.querySelector(".review .generate-question");
  let reviewNavigation = document.querySelector(".review .question-numbers");
  completed_date.textContent = `${date.getDate()} ${
    months[date.getMonth()]
  }  ${date.getFullYear()}`;

  document.querySelector(".review .row-1 .username").textContent = user;

  // Create the navgitaionNumbers and add class active whereas the answer choosed is empty or not
  questionsQbjects.forEach((span, index) => {
    if (span.choosed_answer === span.result.correct_answer) {
      reviewNavigation.innerHTML += `<span class="number correct-answer-color" data-number=${
        index + 1
      }>${index + 1}</span>`;
    } else {
      reviewNavigation.innerHTML += `<span class="number wrong-answer-color" data-number=${
        index + 1
      }>${index + 1}</span>`;
    }
  });

  console.log(questionsQbjects);

  questionsQbjects.forEach((obj, index) => {
    createRow(obj, index);
  });

  document.querySelector(".total-marks .grade").textContent = grade;
  document.querySelector(".total-marks .total-questions").textContent =
    questions.length;
}

// function to create the whole row that hold the generate questions the marks
function createRow(obj, index) {
  let row = document.createElement("div");
  row.classList.add("row");
  let generate_question = document.createElement("div");
  generate_question.classList.add("generate-question");
  let selected_answer = obj.choosed_answer;

  let saved = selected_answer === "" ? "Not yet answered" : "Answer saved";
  let points = selected_answer === obj.result.correct_answer ? 1 : 0;

  let marks = `  <div class="marks">
  <div class="question-marks">
    <h3>Question <span class="question-number">${index + 1}</span></h3>
    <span class="answered">${saved}</span>
    <span>Marked out ${points} of <span class="marks">1.00</span></span>
  </div>
</div>`;

  let box = document.createElement("div");
  box.classList.add(`question_${index + 1}`);

  let spans = `
  <span class="question">${obj.result.question}</span>
  <span class="select">Select one:</span>`;

  box.innerHTML = spans;

  obj.questions.forEach((ele, i) => {
    box.appendChild(createBox(obj, ele, i, index));
    // createBox(obj, ele, index);
  });

  generate_question.appendChild(box);

  let correction = createCorrection(obj);

  generate_question.appendChild(correction);

  row.innerHTML = marks;
  row.appendChild(generate_question);
  review_container.appendChild(row);
}

// function to create dic that hold all the radio input
function createBox(obj, ele, pos, index) {
  let div = document.createElement("div");
  let input = document.createElement("input");
  input.setAttribute("type", "radio");
  input.name = `question_${index + 1}`;
  input.id = `answer_${pos + 1}`;
  input.value = ele;
  let label = document.createElement("label");
  let labelText = document.createTextNode(ele);
  label.setAttribute("for", ele);
  label.appendChild(labelText);
  div.appendChild(input);
  div.appendChild(label);
  let i = document.createElement("i");
  if (obj.choosed_answer === ele) {
    input.checked = true;
    if (obj.choosed_answer === obj.result.correct_answer) {
      i.classList.add("right-answer", "fas", "fa-check");
    } else {
      i.classList.add("false-answer", "fas", "fa-times");
    }
    div.appendChild(i);
  }
  return div;
}

// function to show if the answer is correct or not
function createCorrection(obj) {
  if (obj.choosed_answer !== obj.result.correct_answer) {
    let div_Wrong = document.createElement("div");
    div_Wrong.className = "wrong-answer";
    let span1 = document.createElement("span");
    let span1_text = document.createTextNode(`Your answer is incorrect`);
    span1.appendChild(span1_text);
    let span2 = document.createElement("span");
    span2.innerHTML = `The corrected answer is <b>${obj.result.correct_answer}</b>`;
    div_Wrong.appendChild(span1);
    div_Wrong.appendChild(span2);
    return div_Wrong;
  } else {
    let div_correct = document.createElement("div");
    div_correct.className = "correct-answer";
    let span1 = document.createElement("span");
    let span1_text = document.createTextNode(`Your answer is correct`);
    span1.appendChild(span1_text);
    div_correct.appendChild(span1);
    grade++;
    return div_correct;
  }
}

function timer(min) {
  let seconds = 59;
  count_interval = setInterval(function () {
    quiz_minutes.textContent = min < 10 ? `0${min - 1}` : min - 1;
    quiz_seconds.textContent = seconds < 10 ? `0${seconds}` : seconds;

    if (
      parseInt(quiz_minutes.textContent) === 0 &&
      parseInt(quiz_seconds.textContent) === 0
    ) {
      clearInterval(count_interval);
    } else {
      if (parseInt(seconds) === 0) {
        min = min - 1;
        seconds = 59;
      } else {
        seconds = Number(seconds) - 1;
      }
    }
  }, 1000);
}
