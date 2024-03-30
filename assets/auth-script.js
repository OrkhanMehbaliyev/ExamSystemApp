// Screen elements
const steps = document.querySelectorAll(".md-step");
const screens = document.getElementsByClassName("screen");

//Registration elements
const txtUserName = document.getElementById("txtUserName");
const singUpInputEmail = document.getElementById("singUpInputEmail");
const signUpInputPassword = document.getElementById("signUpInputPassword");
const selectUserProfile = document.getElementById("selectUserProfile");
const btnSignUpSubmit = document.getElementById("btnSignUpSubmit");
const switchToClassesPanel = document.getElementById("switchToClassesPanel");
const switchToQuizApp = document.getElementById("switchToQuizApp");

// Login elements
const logInInputEmail = document.getElementById("logInInputEmail");
const logInInputPassword = document.getElementById("logInInputPassword");
const btnLogInSubmit = document.getElementById("btnLogInSubmit");

//Join class modal
const joinClassModalAnchor = document.getElementById("joinClassModalAnchor");
const ddlClasses = document.getElementById("ddlClasses");
const joinClassPassword = document.getElementById("joinClassPassword");
const btnClassModalJoin = document.getElementById("btnClassModalJoin");
const btnClassJoinModalClose = document.getElementById(
  "btnClassJoinModalClose"
);

const DISPLAY_PROPS = {
  BLOCK: "block",
  NONE: "none",
};

const DATA_OBJECT_KEYS = {
  users: "userData",
  currentUser: "currentUser",
  classes: "classes",
  currentClass: "currentClass",
};

let userData = [];
let classData = [];

//unique id generator
var generateGuid = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

//Screens part
const hideAllScreens = () => {
  Array.from(screens).forEach((scr) => {
    scr.style.display = DISPLAY_PROPS.NONE;
  });
  Array.from(steps).forEach((step) => {
    step.classList.remove("active");
  });
};

const changeScreens = (screenId) => {
  hideAllScreens();
  let selectedScreen = document.getElementById(`screen-${screenId}`);
  if (selectedScreen) selectedScreen.style.display = DISPLAY_PROPS.BLOCK;
  else throw Error("This page does not exist!");
  Array.from(steps)
    .find((x) => x.id == `step-${screenId}`)
    .classList.add("active");
};

//User part
const tryConvertUserModel = () => {
  return {
    id: generateGuid(),
    userName: txtUserName.value,
    profile: selectUserProfile.value,
    email: singUpInputEmail.value,
    password: signUpInputPassword.value,
  };
};

const checkUserDuplicateRecord = (userName, email) => {
  return (
    userData.some((x) => x.userName == userName) ||
    userData.some((x) => x.email == email)
  );
};

const saveUser = () => {
  if (checkUserDuplicateRecord(txtUserName.value, singUpInputEmail.value)) {
    showErrorMessage(
      "Couldn't Signed Up",
      "Such user exists! Change your username or email"
    );
    return;
  }

  if (
    txtUserName.value.length != 0 &&
    selectUserProfile.value != 0 &&
    singUpInputEmail.value.length > 1 &&
    singUpInputEmail.value.includes("@") &&
    signUpInputPassword.value.length > 1
  ) {
    const user = tryConvertUserModel();

    userData.push({
      id: user.id,
      userName: user.userName,
      email: user.email,
      profile: user.profile,
    });

    showSuccessMessage("Signed up", "Signed up successfully!");
    saveToLS(DATA_OBJECT_KEYS.users, userData);
    saveToLS(user.id, { password: user.password });
    clearAllFields();
  } else {
    showErrorMessage("Couldn't signed up", "You haven't registered correctly!");
    return;
  }
};

const userValidation = () => {
  let email = logInInputEmail.value;
  let password = logInInputPassword.value;
  let objectFromUserData = userData.find((x) => x.email == email);
  if (objectFromUserData) {
    if (password == (getFromLS(objectFromUserData.id) ?? []).password) {
      saveToLS(DATA_OBJECT_KEYS.currentUser, objectFromUserData);
      clearAllFields();

      directUserToApp(objectFromUserData.profile);
    } else {
      showErrorMessage("Couln't Log In", "Password is incorrect!");
    }
  } else {
    showErrorMessage("Error", "Such user doesn't exist!");
  }
};

const directUserToApp = (profile) => {
  if (profile == 1) {
    prepareJoinClassActions();
  } else {
    switchToClassesPanel.setAttribute("href", "./classes.html");
    switchToClassesPanel.click();
  }
};

const clearAllFields = () => {
  let fields = document.querySelectorAll("input");
  Array.from(fields).forEach((x) => {
    x.value = "";
  });
};

//Joining class part
const getClassesForDdl = (
  element,
  datas,
  className = "className",
  classId = "id"
) => {
  element.innerHTML = "";
  datas.forEach((data) => {
    let option = document.createElement("option");
    option.value = data[classId];
    option.text = data[className];
    element.appendChild(option);
  });
};

const prepareJoinClassActions = () => {
  joinClassModalAnchor.click();
  getClassesForDdl(ddlClasses, getFromLS(DATA_OBJECT_KEYS.classes));
};

const classValidation = () => {
  let currentClass = getFromLS(DATA_OBJECT_KEYS.classes).find(
    (x) => x.id == ddlClasses.value
  );
  if (joinClassPassword.value == getFromLS(ddlClasses.value).password) {
    if (
      getFromLS(currentClass.id).questions.length >= 5 &&
      getFromLS(currentClass.id).answers.length >= 5
    ) {
      saveToLS(DATA_OBJECT_KEYS.currentClass, currentClass);
      switchToQuizApp.setAttribute("href", "./quiz.html");
      switchToQuizApp.click();
      clearAllFields();
    } else {
      showErrorMessage("Couldn't Join", "The class is not ready for exam!");
    }
  } else {
    showErrorMessage("Couldn't Join The Class", "Password is incorrect!");
  }
};

//Event listeners and onload
const addScreenChangeEventListeners = () => {
  let screens = Array.from(steps);
  screens.forEach((x) => {
    x.addEventListener("click", (e) => {
      let screenId = e.target
        .closest(".md-step")
        .querySelector(".md-step-circle span").textContent;
      changeScreens(screenId);
    });
  });
};

const addSubmitEventListeners = () => {
  btnSignUpSubmit.addEventListener("click", saveUser);
  btnLogInSubmit.addEventListener("click", userValidation);
};

const addAllEventListeners = () => {
  addScreenChangeEventListeners();
  addSubmitEventListeners();

  // For joining class
  btnClassModalJoin.addEventListener("click", classValidation);
};

const onload = () => {
  userData = getFromLS(DATA_OBJECT_KEYS.users) ?? [];
  clearAllFields();
  addAllEventListeners();
  changeScreens(1);
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
