const qn = 5;

var t;
var timerInterval;
let questions;
let completed = [];
var answers = [];
var ansList = [];
var qNumber = 0;

var pb = 0;
let map = [];

function shuffleAnswers(answers) {
  newAns = [];
  map = [];
  for (x = 0; x < answers.length; x++) {
    i = randint(0, answers.length-1);
    while (contains(i, map)) {
      i = randint(0, answers.length-1);
    }
    newAns.push(answers[i]);
    map.push(i);
  }
  return newAns;
}

function move(callback=function() {return}) {
  console.log(pb);
  console.log(answers.length);
  var width = pb;

  pb = answers.length*20;
  var elem = document.getElementById("myBar");
  var id = setInterval(frame, 10);
  function frame() {
    if (width == pb) {
      clearInterval(id);
      pb--;
      //console.log('callback');
      callback();
    } else {
      width++;
      elem.style.width = width + "%";
      elem.innerHTML = width + "%";
    }
  }
}

//useful functions
function randint(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function contains(item, array) {
  c = false;
  for (x = 0; x < array.length; x++) {
    if (item == array[x]) {
      c = true
    }
  }
  return c;
}

//COOKIES
function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    let expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}
  
function getCookie(cname) {
    let name = cname + "=";
    let ca = document.cookie.split(';');
    for(let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
}


function generateQuestionID() {
  number = randint(0, qn-1);
  if (completed.length == qn) {
    //alert('completed');
    return -1;
  }
  else {
    while (contains(number, completed)) {
      number = randint(0, qn-1);
    }
    completed.push(number);
    qNumber = number;
    return number;
  }
}

function answerClicked(ans) {
  if (ans >= 0) {
    ans = map[ans];
    console.log(ansList[ans]);
  }
  answers.push([qNumber, ans]);
  if (answers.length < 5) {
    move();
    nextQuestion();
  }
  else {
    move(setCompleted);
  }
  console.log(answers);
}

function setCompleted() {
  clearInterval(timerInterval);
  qDisplay = document.getElementById('mcq'); qDisplay.style.display = 'none';
  score = 0;
  for (x = 0; x < answers.length; x++) {
    answer = answers[x];
    //question = questions.questions[x];
    if (answer[1] == 0) {
      score += 1;
    } 
  }
  console.log(score);
}

function nextQuestion() {
  t = 10;
  clearInterval(timerInterval);
  index = generateQuestionID();
  

  question = questions.questions[index];
  questionElement = document.getElementById("question");
  questionElement.innerHTML = question.question;

  console.log(question.answers);
  //console.log(shuffleAnswers(question.answers));
  //console.log(map);
  shuffled = shuffleAnswers(question.answers);
  console.log(shuffled);
  ansList = question.answers;

  for (x = 0; x < shuffled.length; x++) {
    answer = shuffled[x];
    answerElement = document.getElementById("ans"+(x+1));
    answerElement.innerHTML = answer;
  }

  timerInterval = setInterval(timer, 1000);
  te = document.getElementById("timer");
  te.innerHTML = t;
}

function timer() {
    t -= 1;
    te = document.getElementById("timer");
    te.innerHTML = t;
    if (t < 0) {
      answerClicked(-1);
    }
}

function start() {
    const getJSON = async url => {
      const response = await fetch(url);
      if(!response.ok) // check if response worked (no 404 errors etc...)
        throw new Error(response.statusText);
    
      const data = response.json(); // get JSON from the response
      return data; // returns a promise, which resolves to this data value
    }
    
    console.log("Fetching data...");
    getJSON("questions.json").then(data => {
      questions = data;
      nextQuestion();
    }).catch(error => {
      console.error(error);
    });

    //var cookie = document.getElementById("cookie");
    //cookie.innerHTML = getCookie('test');
}
