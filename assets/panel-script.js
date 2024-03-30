//Screen elements
const screens = document.querySelectorAll(".screen");
const steps = document.querySelectorAll(".md-step");

//Subject
const btnSubjectSave = document.getElementById("btnSubjectSave");
const txtSubjectName = document.getElementById("txtSubjectName");
const hfSubjectId = document.getElementById("hfSubjectId");
const btnSubjectModalClose = document.getElementById("btnSubjectModalClose");
const tblSubject = document.getElementById("tblSubject");
const tblSubjectBody = tblSubject.getElementsByTagName("tbody")[0];
const btnSubjectAdd = document.getElementById("btnSubjectAdd");
const txtSubjectSearch = document.getElementById("txtSubjectSearch");

//Question
const btnQuestionAdd = document.getElementById("btnQuestionAdd");
const txtQuestionText = document.getElementById("txtQuestionText");
const txtQuestionSearch = document.getElementById("txtQuestionSearch");
const ddlSubjects = document.getElementById("ddlSubjects");
const btnQuestionSave = document.getElementById("btnQuestionSave");
const btnQuestionModalClose = document.getElementById("btnQuestionModalClose");
const hfQuestionId = document.getElementById("hfQuestionId");
const tblQuestion = document.getElementById("tblQuestion");
const tblQuestionBody = tblQuestion.getElementsByTagName("tbody")[0];
const questionAddEditModalSelectRow = document.getElementById(
  "questionAddEditModalSelectRow"
);

// Answer
const answerCardArea = document.querySelector(".answer-card");
const hfAnswerSubjectId = document.getElementById("hfAnswerSubjectId");
const ddlQuestion = document.getElementById("ddlQuestion");
const answerTexts = document.getElementsByClassName("answerText");
const answerRadios = document.getElementsByName("radioGroup");
const btnAnswerSave = document.getElementById("btnAnswerSave");
const btnAnswerModalClose = document.getElementById("btnAnswerModalClose");

//User control
const currentUserNameHeading = document.getElementById(
  "currentUserNameHeading"
);
const btnLogOut = document.getElementById("btnLogOut");
const switchToHome = document.getElementById("switchToHome");
const currentClassNameHeading = document.getElementById(
  "currentClassNameHeading"
);

//current class
let currentClass;

// Subject Data Array
let subjectData = [];

// Question Data Array
let questionData = [];

// Answer Data array
let answerData = [];

//Unique id generator
var generateGuid = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const DISPLAY_PROPS = {
  NONE: "none",
  BLOCK: "block",
};

const MODE = {
  Insert: 1,
  Edit: 2,
};

const DATA_OBJECT_KEYS = {
  subject: "subjectData",
  currentUser: "currentUser",
  currentClass: "currentClass",
};

let pageMode;

//Screens part
const hideAllScreens = () => {
  Array.from(screens).forEach(
    (scr) => (scr.style.display = DISPLAY_PROPS.NONE)
  );
  Array.from(steps).forEach((step) => step.classList.remove("active"));
};

const changeScreens = (screenId) => {
  hideAllScreens();
  const selectedScreen = document.getElementById(`screen-${screenId}`);
  if (!selectedScreen) {
    throw new Error("Screen with this id does not exist");
  }
  selectedScreen.style.display = DISPLAY_PROPS.BLOCK;
  document.getElementById(`step-${screenId}`).classList.add("active");
};

const addScreenChangeEventListener = () => {
  Array.from(steps).forEach((step) =>
    step.addEventListener("click", (e) => {
      let screenId = e.target
        .closest(".md-step")
        .querySelector(".md-step-circle span").textContent;
      changeScreens(screenId);
    })
  );
};

const checkSubjectDuplicateRecord = (subject) => {
  return subjectData.filter((x) => x.name == subject.name).length > 0
    ? true
    : false;
};

//Subject part
const insertSubject = (subject) => {
  if (checkSubjectDuplicateRecord(subject)) {
    showErrorMessage("Subject", "This name has already existed");
    return;
  }
  subjectData.push(subject);
  showSuccessMessage("Subject", "Data has been added successfully!");
};

const updateSubject = (subject) => {
  let updatedSubject = subjectData.find((x) => x.id == subject.id);
  if (updatedSubject) {
    updatedSubject.name = subject.name;
  }
  subjectData.map((x) =>
    x.id == updatedSubject.id ? (x = updatedSubject) : x
  );
  showSuccessMessage("Subject", "Data has been updated successfully!");
};

const tryConvertSubjectModel = () => {
  return {
    id: hfSubjectId.value == -1 ? generateGuid() : hfSubjectId.value,
    name: txtSubjectName.value,
  };
};

const clearSubjectFields = () => {
  txtSubjectName.value = "";
  hfSubjectId.value = -1;
};

const saveSubject = () => {
  const subject = tryConvertSubjectModel();
  if (pageMode == MODE.Insert) {
    insertSubject(subject);
  } else {
    updateSubject(subject);
  }
  clearSubjectFields();
  btnSubjectModalClose.click();
  saveSubjectsToCurrentClass();
  bindSubjectTable(subjectData);
  bindQuestionTable(questionData);
  bindAnswerScreen(subjectData, questionData);
};

//Event listeners and onload
const addSubjectEventListeners = () => {
  btnSubjectSave.addEventListener("click", saveSubject);
  btnSubjectAdd.addEventListener("click", () => {
    pageMode = MODE.Insert;
  });
  txtSubjectSearch.addEventListener("keyup", onFlySearchSubject);
};

const addQuestionEventListeners = () => {
  btnQuestionSave.addEventListener("click", saveQuestion);
  btnQuestionAdd.addEventListener("click", () => {
    pageMode = MODE.Insert;
    getSubjectsForDdl(ddlSubjects, subjectData);
    questionAddEditModalSelectRow.style.display = "flex";
  });
  txtQuestionSearch.addEventListener("keyup", onFlySearchQuestion);
};

const addAnswerEventListeners = () => {
  btnAnswerSave.addEventListener("click", saveAnswer);
  ddlQuestion.addEventListener("change", getAnswersForQuestionForAnswerModal);
};

const addAllEVentListeners = () => {
  addScreenChangeEventListener();
  addSubjectEventListeners();
  addQuestionEventListeners();
  addAnswerEventListeners();
  btnLogOut.addEventListener("click", logOut);
};

const onLoad = () => {
  // Current user
  const currentUser = getFromLS(DATA_OBJECT_KEYS.currentUser);
  if (!currentUser) logOut();
  currentUserNameHeading.textContent = currentUser.userName;

  //Current Class
  currentClass = getFromLS(DATA_OBJECT_KEYS.currentClass);
  if (!currentClass) logOut();
  currentClassNameHeading.textContent = currentClass.className;

  // Subject
  subjectData = getFromLS(currentClass.id).subjects ?? [];
  changeScreens("1");
  addAllEVentListeners();
  pageMode = MODE.Insert;
  hfSubjectId.value = -1;
  bindSubjectTable(subjectData);

  //Question
  questionData = getFromLS(currentClass.id).questions ?? [];
  hfQuestionId.value = -1;
  bindQuestionTable(questionData);

  // Answer
  bindAnswerScreen(subjectData, questionData);
  answerData = getFromLS(currentClass.id).answers ?? [];
};

//Question part
const checkQuestionDuplicateRecord = (question) => {
  return questionData.filter((x) => x.text == question.text).length > 0;
};

const insertQuestion = (question) => {
  if (!ddlSubjects.value) {
    showErrorMessage("Question", "There is no such subject!");
    return;
  }

  if (checkQuestionDuplicateRecord(question)) {
    showErrorMessage("Question", "This question has already existed!");
    return;
  }

  questionData.push(question);
  showSuccessMessage("Question", "The question has been added successfully!");
};

const updateQuestion = (question) => {
  let updatedQuestion = questionData.find((x) => x.id == question.id);
  if (updatedQuestion) {
    updatedQuestion.text = question.text;
  }
  questionData.map((x) =>
    x.id == updatedQuestion.id ? (x = updatedQuestion) : x
  );
  showSuccessMessage("Question", "Data has been updated successfully!");
};

const tryConvertQuestionModel = () => {
  return {
    id: hfQuestionId.value == -1 ? generateGuid() : hfQuestionId.value,
    text: txtQuestionText.value,
    subjectId: ddlSubjects.value,
  };
};

const clearQuestionFields = () => {
  txtQuestionText.value = "";
  hfQuestionId.value = -1;
};

const saveQuestion = () => {
  let question = tryConvertQuestionModel();
  if (pageMode == MODE.Insert) {
    insertQuestion(question);
  } else {
    updateQuestion(question);
  }
  clearQuestionFields();
  btnQuestionModalClose.click();
  saveQuestionsToCurrentClass();
  bindQuestionTable(questionData);
  bindAnswerScreen(subjectData, questionData);
};

//Answer Part
const clearAnswerFields = () => {
  Array.from(answerTexts).forEach((text, idx) => {
    text.value = "";
    answerRadios[idx].checked = false;
  });
};

const getAnswersForQuestionForAnswerModal = () => {
  clearAnswerFields();
  if (answerData.some((data) => data.questionId == ddlQuestion.value)) {
    answerData
      .filter((data) => data.questionId == ddlQuestion.value)[0]
      .answers.forEach((answer, idx) => {
        answerTexts[idx].value = answer.text;
        answerRadios[idx].checked = answer.isCorrect;
      });
  }
};

const tryConvertAnswerModel = (data) => {
  return {
    questionId: ddlQuestion.value,
    answers: data,
  };
};

const saveAnswer = () => {
  let answers = [];
  Array.from(answerTexts).forEach((answer, idx) => {
    let answerText = answer.value;
    let isCorrect = answerRadios[idx].checked;
    answers.push({ text: answerText, isCorrect: isCorrect });
  });

  //Checking all radios and textareas
  if (!Array.from(answerRadios).some((radio) => radio.checked == true)) {
    showErrorMessage(
      "Couldn't save the answer",
      "You need to select a correct answer!"
    );
    return;
  }

  if (Array.from(answerTexts).some((text) => text.value == "")) {
    showErrorMessage(
      "Couldn't save the answer",
      "You need to fill all five answers!"
    );
    return;
  }

  if (!ddlQuestion.value) {
    showErrorMessage(
      "Couldn't save the answers",
      "There is no question available!"
    );
    return;
  }

  let answerModel = tryConvertAnswerModel(answers);

  //Checking update action
  if (answerData.some((data) => data.questionId == answerModel.questionId)) {
    let updatedAnswer = answerData.find(
      (answer) => answer.questionId == answerModel.questionId
    );
    updatedAnswer.answers = answerModel.answers;
    showSuccessMessage("Answer", "The answers has been updated successfully!");
  } else {
    answerData.push(answerModel);
    showSuccessMessage("Answer", "The answer has been added successfully!");
  }

  saveAnswersToCurrentClass();
  btnAnswerModalClose.click();
};

//loading data actions
const bindSubjectTable = function (datas) {
  tblSubjectBody.innerHTML = "";
  datas.forEach((data) => {
    const tr = createSubjectRow(data);
    tblSubjectBody.appendChild(tr);
  });
};

const createSubjectRow = function (data) {
  let tr = document.createElement("tr");
  let tdEdit = document.createElement("td");
  let tdRemove = document.createElement("td");
  let tdId = document.createElement("td");
  let tdName = document.createElement("td");

  let iconEdit = document.createElement("i");
  iconEdit.className = "fa-solid fa-edit text-warning";
  iconEdit.addEventListener("click", prepareSubjectUpdateAction);
  iconEdit.setAttribute("data-row-id", data.id);
  iconEdit.setAttribute("data-bs-toggle", "modal");
  iconEdit.setAttribute("data-bs-target", "#subjectAddEditModal");

  let iconRemove = document.createElement("i");
  iconRemove.className = "fa-solid fa-trash-alt text-warning";
  iconRemove.addEventListener("click", deleteSubjectRow);
  iconRemove.setAttribute("data-row-id", data.id);

  tdId.textContent = data.id;
  tdName.textContent = data.name;
  tdEdit.appendChild(iconEdit);
  tdRemove.appendChild(iconRemove);

  tr.appendChild(tdEdit);
  tr.appendChild(tdRemove);
  tr.appendChild(tdId);
  tr.appendChild(tdName);
  return tr;
};

const bindQuestionTable = (datas) => {
  tblQuestionBody.innerHTML = "";
  datas.forEach((data) => {
    const tr = createQuestionRow(data);
    if (subjectData.filter((x) => x.id == data.subjectId).length != 0)
      tblQuestionBody.appendChild(tr);
  });
};

const createQuestionRow = (data) => {
  let tr = document.createElement("tr");
  let tdEdit = document.createElement("td");
  let tdRemove = document.createElement("td");
  let tdId = document.createElement("td");
  let tdText = document.createElement("td");
  let tdSubjectName = document.createElement("td");

  let iconEdit = document.createElement("i");
  iconEdit.className = "fa-solid fa-edit text-warning";
  iconEdit.addEventListener("click", prepareQuestionUpdateAction);

  iconEdit.setAttribute("data-row-id", data.id);
  iconEdit.setAttribute("data-bs-toggle", "modal");
  iconEdit.setAttribute("data-bs-target", "#questionAddEditModal");

  let iconRemove = document.createElement("i");
  iconRemove.className = "fa-solid fa-trash-alt text-warning";
  iconRemove.addEventListener("click", deleteQuestionRow);
  iconRemove.setAttribute("data-row-id", data.id);

  tdId.textContent = data.id;
  tdText.textContent = data.text;

  if (subjectData.filter((x) => x.id == data.subjectId).length != 0)
    tdSubjectName.textContent = subjectData.find(
      (x) => x.id == data.subjectId
    ).name;

  tdEdit.appendChild(iconEdit);
  tdRemove.appendChild(iconRemove);

  tr.appendChild(tdEdit);
  tr.appendChild(tdRemove);
  tr.appendChild(tdId);
  tr.appendChild(tdText);
  tr.appendChild(tdSubjectName);
  return tr;
};

const bindAnswerScreen = (subjectData, questionData) => {
  answerCardArea.innerHTML = "";
  subjectData.forEach((subject) => {
    const card = createSubjectCard(
      subject,
      questionData.filter((x) => x.subjectId == subject.id).length
    );
    answerCardArea.appendChild(card);
  });
};

const createSubjectCard = (data, questionCount) => {
  const col3 = document.createElement("div");
  const card = document.createElement("div");
  const cardBody = document.createElement("div");
  const h3 = document.createElement("h3");
  const span = document.createElement("span");
  const hfSubjectIdCard = document.createElement("input");

  col3.className = "col-3 mb-3";
  card.className = "card py-3 bg-warning";
  card.setAttribute("data-bs-toggle", "modal");
  card.setAttribute("data-bs-target", "#answerAddEditModal");

  col3.addEventListener("click", prepareAnswerAddEditActions);

  cardBody.className = "card-body text-white";
  h3.className = "py-3";
  hfSubjectIdCard.type = "hidden";
  hfSubjectIdCard.value = data.id;

  h3.textContent = data.name;
  span.textContent = `Question count: ${questionCount}`;

  col3.appendChild(card);

  card.appendChild(cardBody);

  cardBody.appendChild(h3);
  cardBody.appendChild(span);
  cardBody.appendChild(hfSubjectIdCard);

  return col3;
};

//Get subjects for subject dropdown in question screen
const getSubjectsForDdl = (
  element,
  datas,
  subjectName = "name",
  subjectValue = "id"
) => {
  element.innerHTML = "";
  Array.from(datas).forEach((data) => {
    let option = document.createElement("option");
    option.text = data[subjectName];
    option.value = data[subjectValue];
    element.appendChild(option);
  });
};

//Get questions for questions dropdown in answer screen
const getQuestionsForDdl = (
  element,
  datas,
  subjectId,
  questionText = "text",
  questionId = "id"
) => {
  element.innerHTML = "";
  Array.from(datas)
    .filter((data) => data.subjectId == subjectId)
    .forEach((data) => {
      let option = document.createElement("option");
      option.text = data[questionText];
      option.value = data[questionId];
      element.appendChild(option);
    });
};

//preparing update actions
const prepareSubjectUpdateAction = (e) => {
  let rowId = e.target.dataset.rowId;
  const subject = subjectData.find((x) => x.id == rowId);
  hfSubjectId.value = rowId;
  txtSubjectName.value = subject.name;
  pageMode = MODE.Edit;
};

const deleteSubjectRow = (e) => {
  let rowId = e.target.dataset.rowId;
  subjectData = subjectData.filter((x) => x.id != rowId);

  saveSubjectsToCurrentClass();
  removeFromCurrentClass(rowId);
  bindSubjectTable(subjectData);
  bindQuestionTable(questionData);
  bindAnswerScreen(subjectData, questionData);
};

const prepareQuestionUpdateAction = (e) => {
  let rowId = e.target.dataset.rowId;
  const question = questionData.find((x) => x.id == rowId);
  hfQuestionId.value = rowId;
  txtQuestionText.value = question.text;
  pageMode = MODE.Edit;
  questionAddEditModalSelectRow.style.display = "none";
};

const deleteQuestionRow = (e) => {
  let rowId = e.target.dataset.rowId;
  questionData = questionData.filter((x) => x.id != rowId);
  answerData = answerData.filter((x) => x.questionId != rowId);
  saveQuestionsToCurrentClass();
  saveAnswersToCurrentClass();
  bindQuestionTable(questionData);
  bindAnswerScreen(subjectData, questionData);
};

const prepareAnswerAddEditActions = (e) => {
  let subjectId =
    e.target.closest(".card-body")?.querySelector("input").value ??
    e.target.firstChild.closest(".card-body")?.querySelector("input").value;
  hfAnswerSubjectId.value = subjectId;
  getQuestionsForDdl(ddlQuestion, questionData, subjectId);
  getAnswersForQuestionForAnswerModal();
};

// Search method in Subject
const onFlySearchSubject = (e) => {
  let searchStr = e.target.value;
  let filteredData = subjectData.filter((x) => x.name.includes(searchStr));
  bindSubjectTable(filteredData ?? getFromLS(currentClass.id).subjects);
};

// Search method in Question
const onFlySearchQuestion = (e) => {
  let searchStr = e.target.value;
  let filteredData = questionData.filter((x) => x.text.includes(searchStr));
  bindQuestionTable(filteredData ?? getFromLS(currentClass.id).questions);
};

//Log out function
const logOut = () => {
  localStorage.removeItem(DATA_OBJECT_KEYS.currentUser);
  localStorage.removeItem(DATA_OBJECT_KEYS.currentClass);
  switchToHome.click();
};

//Save Subjects To Current Class
const saveSubjectsToCurrentClass = () => {
  let subjectInCurrentClassId = getFromLS(currentClass.id);
  subjectInCurrentClassId.subjects = subjectData;
  saveToLS(currentClass.id, subjectInCurrentClassId);
};

//Save Questions To Current Class
const saveQuestionsToCurrentClass = () => {
  let questionsInCurrentClassId = getFromLS(currentClass.id);
  questionsInCurrentClassId.questions = questionData;
  saveToLS(currentClass.id, questionsInCurrentClassId);
};

const saveAnswersToCurrentClass = () => {
  let answersInCurrentClassId = getFromLS(currentClass.id);
  answersInCurrentClassId.answers = answerData;
  saveToLS(currentClass.id, answersInCurrentClassId);
};

//Removes not only subject but also its questions and answers linked
const removeFromCurrentClass = (subjectId) => {
  questionData
    .filter((data) => data.subjectId == subjectId)
    .forEach((x) => {
      answerData = answerData.filter((y) => y.questionId != x.id);
      saveAnswersToCurrentClass();
    });

  questionData = questionData.filter((z) => z.subjectId != subjectId);
  saveQuestionsToCurrentClass();
};

//sweet alert messages
var showSuccessMessage = function (title, message) {
  swal(title, message, "success");
};

var showErrorMessage = function (title, message) {
  swal(title, message, "error");
};

//local storage
var saveToLS = function (key, data) {
  localStorage.setItem(key, JSON.stringify(data));
};

var getFromLS = function (key) {
  return JSON.parse(localStorage.getItem(key));
};

document.addEventListener("DOMContentLoaded", onLoad);
