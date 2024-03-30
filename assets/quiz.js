//quiz actions
const questionCardContainer = document.getElementById("questionCardContainer");
const btnSubmitExam = document.getElementById("btnSubmitExam");

//user actions
const btnLogOut = document.getElementById("btnLogOut");
const switchToHome = document.getElementById("switchToHome");

//Infos
const currentClassName = document.getElementById("currentClassName");
const currentUserNameHeading = document.getElementById(
  "currentUserNameHeading"
);

// Result modal elements
const correctAnswerDisplay = document.getElementById("correctAnswerDisplay");
const wrongAnswerDisplay = document.getElementById("wrongAnswerDisplay");
const passedAnswerDisplay = document.getElementById("passedAnswerDisplay");

// Objects
const DATA_OBJECT_KEYS = {
  subject: "subjectData",
  currentUser: "currentUser",
  currentClass: "currentClass",
};

let currentClass;
let currentUser;
let questionData = [];
let answerData = [];
let examQuestions;

// Counts
let correctAnswerCount = 0;
let wrongAnswerCount = 0;
let passedAnswerCount = 0;

//Exam part
const shuffleQuestions = (questions) => {
  for (let i = questions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [questions[i], questions[j]] = [questions[j], questions[i]];
  }
  return questions;
};

const generateQuestions = (element, questions) => {
  element.innerHTML = "";
  questions.forEach((question, idx) => {
    let answers = getFromLS(currentClass.id).answers.find(
      (x) => x.questionId == question.id
    );
    let questionCard = createQuestionCard(question.text, answers, idx);
    element.appendChild(questionCard);
  });
};

const createQuestionCard = (text, answersObject, idx) => {
  let container = document.createElement("div");
  container.className =
    "col-12 mx-0 my-2 py-5 px-4 bg-warning-subtle quiz-question";

  let questionHeader = document.createElement("div");
  questionHeader.className = "row mx-0 my-4";
  questionHeader.setAttribute("data-row-id", answersObject.questionId);
  let h3 = document.createElement("h3");
  h3.textContent = `${idx + 1}. ` + text;

  let answersContainer = document.createElement("div");
  answersContainer.className = "row quiz-answers";

  let answers = answersObject.answers;
  answers.forEach((answer, i) => {
    let variant = document.createElement("div");
    variant.className = "row";

    let variantInputArea = document.createElement("div");
    variantInputArea.className =
      "col-1 d-flex justify-content-center align-items-center";
    let radioInput = document.createElement("input");
    radioInput.type = "radio";
    radioInput.className = "form-check-input";
    radioInput.name = `radioGroup${idx}`;
    radioInput.id = `radio${i}Group${idx}`;

    let answerTextArea = document.createElement("div");
    answerTextArea.className = "col-11 d-flex align-items-center";
    answerTextArea.textContent = answer.text;

    variantInputArea.appendChild(radioInput);
    variant.appendChild(variantInputArea);
    variant.appendChild(answerTextArea);
    answersContainer.appendChild(variant);
  });

  questionHeader.appendChild(h3);

  container.appendChild(questionHeader);
  container.appendChild(answersContainer);

  return container;
};

const checkExam = () => {
  let questionsInExam = Array.from(
    document.getElementsByClassName("quiz-question")
  );
  answerData = getFromLS(currentClass.id).answers;

  questionsInExam.forEach((question, idx) => {
    let rowId = question.firstChild.dataset.rowId;
    let radioSelected = Array.from(
      question.querySelectorAll(`input[name=radioGroup${idx}]`)
    ).find((x) => x.checked == true);

    let correctAnswer = answerData
      .find((answer) => answer.questionId == rowId)
      .answers.find((x) => x.isCorrect == true).text;

    let writtenAnswer = radioSelected?.closest(".row").querySelector(".col-11");
    if (writtenAnswer?.textContent == correctAnswer) {
      correctAnswerCount++;
      writtenAnswer.classList.add("text-success");
    } else if (writtenAnswer == undefined) {
      passedAnswerCount++;
    } else {
      wrongAnswerCount++;
      writtenAnswer.classList.add("text-danger");
    }
  });

  //Showing the results
  correctAnswerDisplay.textContent = `Correct Answers: ${correctAnswerCount}`;
  wrongAnswerDisplay.textContent = `Wrong Answers: ${wrongAnswerCount}`;
  passedAnswerDisplay.textContent = `Passed Answers: ${passedAnswerCount}`;

  btnSubmitExam.style.display = "none";
};

//user and class actions
const logOut = () => {
  localStorage.removeItem(DATA_OBJECT_KEYS.currentUser);
  localStorage.removeItem(DATA_OBJECT_KEYS.currentClass);
  switchToHome.click();
};

const fillLayoutInfo = () => {
  currentClassName.textContent = currentClass.className;
  currentUserNameHeading.textContent = currentUser.userName;
};

//Event listeners and onload
const addUserEventListeners = () => {
  btnSubmitExam.addEventListener("click", checkExam);
  btnLogOut.addEventListener("click", logOut);

  window.addEventListener("beforeunload", function (e) {
    e.preventDefault();
    e.returnValue = "";
  });
};

const addAllEventListeners = () => {
  addUserEventListeners();
};

const onload = () => {
  addAllEventListeners();
  currentUser = getFromLS(DATA_OBJECT_KEYS.currentUser);
  if (!currentUser) logOut();

  currentClass = getFromLS(DATA_OBJECT_KEYS.currentClass);
  if (!currentClass) logOut();

  questionData = getFromLS(currentClass.id).questions ?? [];

  fillLayoutInfo();

  let numOfQuestions = 10;

  questionData = shuffleQuestions(questionData);
  questionData = questionData.slice(0, numOfQuestions);

  generateQuestions(questionCardContainer, questionData);
};

//local storage
const saveToLS = function (key, data) {
  localStorage.setItem(key, JSON.stringify(data));
};

const getFromLS = function (key) {
  return JSON.parse(localStorage.getItem(key));
};

document.addEventListener("DOMContentLoaded", onload);
