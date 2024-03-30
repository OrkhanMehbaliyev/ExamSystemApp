// Screen elements
const txtClassName = document.getElementById("txtClassName");
const createClassInputPassword = document.getElementById(
  "createClassInputPassword"
);
const btnCreateClass = document.getElementById("btnCreateClass");

//table
const tblClasses = document.getElementById("tblClasses");
const tblClassesBody = document.getElementsByTagName("tbody")[0];

//modal edit
const txtClassEditName = document.getElementById("txtClassEditName");
const btnClassSave = document.getElementById("btnClassSave");
const btnClassModalClose = document.getElementById("btnClassModalClose");
const hfClassId = document.getElementById("hfClassId");

//modal join
const setClassNameField = document.getElementById("setClassNameField");
const hfClassJoinId = document.getElementById("hfClassJoinId");
const btnClassModalJoin = document.getElementById("btnClassModalJoin");
const btnClassJoinModalClose = document.getElementById(
  "btnClassJoinModalClose"
);
const joinClassPassword = document.getElementById("joinClassPassword");

// Switch Anchors
const switchAnchorToModeratorPage = document.getElementById(
  "switchAnchorToModeratorPage"
);
const logOutAnchor = document.getElementById("logOutAnchor");

//UserPart
const btnLogOut = document.getElementById("btnLogOut");
const currentUserNameHeading = document.getElementById(
  "currentUserNameHeading"
);

// Objects
let classes = [];

const DATA_OBJECT_KEYS = {
  users: "userData",
  currentUser: "currentUser",
  classes: "classes",
  currentClass: "currentClass",
};

//Unique id generator
var generateGuid = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const clearAllFields = () => {
  let fields = document.querySelectorAll("input");
  Array.from(fields).forEach((x) => {
    x.value = "";
  });
};

//Class creation,manipulation and validation
const checkClassNameDuplicateRecord = (className) => {
  return classes.filter((x) => x.className === className).length > 0;
};

const tryConvertClassModel = () => {
  return {
    id: generateGuid(),
    className: txtClassName.value,
    password: createClassInputPassword.value,
  };
};

const createClass = () => {
  let className = txtClassName.value;
  let password = createClassInputPassword.value;
  if (checkClassNameDuplicateRecord(className)) {
    showErrorMessage("Classes", "Such class exists!");
    return;
  }
  if (className.length != 0 && password.length != 0) {
    const _class = tryConvertClassModel();

    classes.push({
      id: _class.id,
      className: _class.className,
    });

    showSuccessMessage("Class", "The class has been created successfully!");
    saveToLS(_class.id, {
      password: _class.password,
      subjects: [],
      questions: [],
      answers: [],
    });
    saveToLS(DATA_OBJECT_KEYS.classes, classes);
    clearAllFields();
    bindClassTable(classes);
  } else {
    showErrorMessage(
      "Couldn't Create The Class",
      "You haven't filled everything correctly!"
    );
    return;
  }
};

const editClass = () => {
  if (
    !checkClassNameDuplicateRecord(txtClassEditName.value) &&
    txtClassEditName.value.length > 0
  ) {
    let updatedClass = classes.find((x) => x.id == hfClassId.value);
    updatedClass.className = txtClassEditName.value;
    saveToLS(DATA_OBJECT_KEYS.classes, classes);
    btnClassModalClose.click();
    bindClassTable(classes);
    showSuccessMessage("Edited", "The class edited successfully!");
  } else {
    showErrorMessage("Could't update the class", "Such classname exists!");
  }
};

const switchToClassPanel = () => {
  switchAnchorToModeratorPage.setAttribute("href", "./moderatorPanel.html");
  switchAnchorToModeratorPage.click();
};

const classValidation = () => {
  let rowId = hfClassJoinId.value;
  let currentClass = classes.find((x) => x.id == rowId);
  if (joinClassPassword.value == getFromLS(rowId).password) {
    saveToLS(DATA_OBJECT_KEYS.currentClass, currentClass);
    switchToClassPanel();
    clearAllFields();
  } else {
    showErrorMessage("Couldn't join", "Password is wrong!");
  }
};

const joinClass = (e) => {
  let rowId = e.target.dataset.rowId;
  let currentClass = classes.find((x) => x.id == rowId);
  setClassNameField.textContent = currentClass.className;
  hfClassJoinId.value = rowId;
};

//Event listeners and onload
const addCreateClassEventListeners = () => {
  btnCreateClass.addEventListener("click", createClass);
};

const addEditJoinClassEventListeners = () => {
  btnClassSave.addEventListener("click", editClass);
  btnClassModalJoin.addEventListener("click", classValidation);
  btnClassJoinModalClose.addEventListener("click", clearAllFields);
};

const addCurrentUserEventListeners = () => {
  btnLogOut.addEventListener("click", logOut);
};

const addAllEventListeners = () => {
  addCreateClassEventListeners();
  addEditJoinClassEventListeners();
  addCurrentUserEventListeners();
};

const onload = () => {
  localStorage.removeItem(DATA_OBJECT_KEYS.currentClass);
  classes = getFromLS(DATA_OBJECT_KEYS.classes) ?? [];
  const currentUser = getFromLS(DATA_OBJECT_KEYS.currentUser);
  if (!currentUser) logOut();
  currentUserNameHeading.textContent = currentUser.userName;
  addAllEventListeners();
  bindClassTable(classes);
};

//Log out from current user
const logOut = () => {
  localStorage.removeItem(DATA_OBJECT_KEYS.currentUser);
  localStorage.removeItem(DATA_OBJECT_KEYS.currentClass);
  logOutAnchor.setAttribute("href", "./index.html");
  logOutAnchor.click();
};

//Binding classes table
const prepareClassEditAction = (e) => {
  let rowId = e.target.dataset.rowId;
  let _class = classes.find((x) => x.id == rowId);
  txtClassEditName.value = _class.className;
  hfClassId.value = rowId;
};

const deleteClassRow = (e) => {
  let rowId = e.target.dataset.rowId;
  classes = classes.filter((x) => x.id != rowId);
  saveToLS(DATA_OBJECT_KEYS.classes, classes);
  localStorage.removeItem(rowId);
  bindClassTable(classes);
};

const createClassesRow = (data) => {
  let tr = document.createElement("tr");
  let tdEdit = document.createElement("td");
  let tdRemove = document.createElement("td");
  let tdClassName = document.createElement("td");
  let tdJoinButton = document.createElement("td");

  let iconEdit = document.createElement("i");
  iconEdit.className = "fa-solid fa-edit text-warning";
  iconEdit.addEventListener("click", prepareClassEditAction);
  iconEdit.setAttribute("data-row-id", data.id);
  iconEdit.setAttribute("data-bs-toggle", "modal");
  iconEdit.setAttribute("data-bs-target", "#classEditModal");

  let iconRemove = document.createElement("i");
  iconRemove.className = "fa-solid fa-trash-alt text-warning";
  iconRemove.addEventListener("click", deleteClassRow);
  iconRemove.setAttribute("data-row-id", data.id);

  let joinButton = document.createElement("button");
  joinButton.textContent = "Join";
  joinButton.className = "btn btn-outline-warning";
  joinButton.type = "button";
  joinButton.setAttribute("data-bs-toggle", "modal");
  joinButton.setAttribute("data-bs-target", "#classJoinModal");
  joinButton.setAttribute("data-row-id", data.id);
  joinButton.addEventListener("click", joinClass);

  tdClassName.textContent = data.className;
  tdEdit.appendChild(iconEdit);
  tdRemove.appendChild(iconRemove);
  tdJoinButton.appendChild(joinButton);

  tdClassName.className = "text-center";
  tdJoinButton.className = "text-center";

  tr.appendChild(tdEdit);
  tr.appendChild(tdRemove);
  tr.appendChild(tdClassName);
  tr.appendChild(tdJoinButton);

  return tr;
};

const bindClassTable = (datas) => {
  tblClassesBody.innerHTML = "";
  datas.forEach((data) => {
    let tr = createClassesRow(data);
    tblClassesBody.appendChild(tr);
  });
};

//sweet alert messages
const showSuccessMessage = function (title, message) {
  swal(title, message, "success");
};

const showErrorMessage = function (title, message) {
  swal(title, message, "error");
};

//local storage
const saveToLS = function (key, data) {
  localStorage.setItem(key, JSON.stringify(data));
};

const getFromLS = function (key) {
  return JSON.parse(localStorage.getItem(key));
};

document.addEventListener("DOMContentLoaded", onload);
