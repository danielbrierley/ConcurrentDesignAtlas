const ip = "127.0.0.1:5000";//"127.0.0.1:5000";


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

var req = 0;

var username;

var questionNo;

var rocketPos = 0;
var width = 0;


var planetNo = -1;
var rocketPositions = [[195, 820], [70, 780], [330, 760], [130, 660], [315, 620], [95, 430], [330, 440], [310, 230], [80, 200], [195, 50]]

var rocketX = rocketPositions[0][0];
var rockety = rocketPositions[0][1];

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

async function sha256(message) { //https://stackoverflow.com/questions/18338890/are-there-any-sha-256-javascript-implementations-that-are-generally-considered-t/48161723#48161723
  // encode as UTF-8
  const msgBuffer = new TextEncoder().encode(message);                    

  // hash the message
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);

  // convert ArrayBuffer to Array
  const hashArray = Array.from(new Uint8Array(hashBuffer));

  // convert bytes to hex string                  
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

async function getJSON(url) {
  const response = await fetch(url);
  if(!response.ok) // check if response worked (no 404 errors etc...)
    throw new Error(response.statusText);

  const data = response.json(); // get JSON from the response
  return data; // returns a promise, which resolves to this data value
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

function clearCookies() {
  var cookies = document.cookie.split(";");

  for (var i = 0; i < cookies.length; i++) {
      var cookie = cookies[i];
      var eqPos = cookie.indexOf("=");
      var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
  }
}

//Quiz
function shuffleAnswers(answers) { //Shuffle answers for user so they can be decoded back to original order
  newAns = []; //New order of answers
  map = []; //Translator to convert new order to old order
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

function move(callback=function() {return}) { //Move progress bar 
  console.log(pb);
  console.log(answers.length);

  rocketPos = answers.length*20;
  var id = setInterval(frame, 10);
  function frame() {
    if (width >= 100) {
      clearInterval(id);
      callback();
    }
    if (width < rocketPos) {
      width++;
      setRocket(width)
    }
    else if (width > rocketPos) {
      width--;
      setRocket(width)
    }
  }
}

function setRocket(width) {
  elem = document.getElementById("myBar");
  rocket = document.getElementById("rocket");
  elem.style.width = width + "%";
  elem.innerHTML = width + "%";
  rocket.style.left = "calc(+"+width + "% - 70px)";

}

function generateQuestionID() { //Generat a random question ID
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
  rocketPos += 20;
  if (ans >= 0) {
    ans = map[ans]; //Remap answer back to original order
    console.log(ansList[ans]);
  }
  if (ans == 0) {
    document.getElementById('resultview').innerHTML = 'Correct';
  }
  else {
    document.getElementById('resultview').innerHTML = 'Incorrect';
  }
  answers.push([qNumber, ans]); //Add question and user answer to a list
  if (answers.length < 5) {
    nextQuestion(); //Generate next question
  }
  //else {
    //move(setCompleted); //Move progress bar to 100% before finishing the set
  //}
  console.log(answers);
}

function nextQuestion() {
  //Reset 10 second timer
  t = 10;
  clearInterval(timerInterval);
  //Generate next question id
  index = generateQuestionID();
  
  //Set text in question box
  console.log(questions.questions);
  console.log(index);
  question = questions.questions[index];
  questionElement = document.getElementById("question");
  questionElement.innerHTML = question.question;

  console.log(question.answers);
  shuffled = shuffleAnswers(question.answers); //shuffle answers
  console.log(shuffled);
  ansList = question.answers;

  for (x = 0; x < shuffled.length; x++) { //Set text in each answer box
    answer = shuffled[x];
    answerElement = document.getElementById("ans"+(x+1));
    answerElement.innerHTML = answer;
  }

  //Start 10 second timer
  timerInterval = setInterval(timer, 1000);
  te = document.getElementById("timer");
  te.innerHTML = t;
}

function timer() {
    //Every 1 second this is run
    t -= 1;
    te = document.getElementById("timer");
    te.innerHTML = t;
    if (t < 0) {
      answerClicked(-1); //Progress without a correct answer
    }
}

function startQuiz() {
    quiz2 = document.getElementById('quiz2');
    quiz2.style.display = 'block';

    map = document.getElementById('map');
    map.style.display = 'none';
    rocketPos = 0;
    width = 0;
    answers = [];
    setRocket(0);
    move(setCompleted);

    
    //Read API key from Cookie
    key = getCookie('key');
    console.log(key);
    console.log("Fetching data...");

    //Fetch questions from server
    getJSON("http://"+ip+"/api.json?key="+key+"&theme=SolarSystem").then(data => {
      questions = data;
      console.log(questions);
      nextQuestion();
    })//.catch(error => {
      //console.error(error);
    //});

    //var cookie = document.getElementById("cookie");
    //cookie.innerHTML = getCookie('test');
}

function planets() {
  planetNo += 1;
  console.log(planetNo+' '+(rocketPositions.length-2));
  if (planetNo == rocketPositions.length-2) {
    console.log('done');
  }
  rocket2 = document.getElementById('rocket2');
  rocket2.style.left = 'calc('+rocketX+'px - 20vw)';
  rocket2.style.top = 'calc('+rockety+'px - 20vw)';

  completed = [];
  pb = 0;

  quiz2 = document.getElementById('quiz2');
  quiz2.style.display = 'none';

  mcq = document.getElementById('mcq');
  mcq.style.display = 'block';

  mcq = document.getElementById('result');
  mcq.style.display = 'none';

  map = document.getElementById('map');
  map.style.display = 'block';

  nextRocket = rocketPositions[planetNo+1];
  moveRocket(nextRocket[0],nextRocket[1])

  console.log(questionNo);

}

function setCompleted() {
  //Clear the timer
  clearInterval(timerInterval);

  //Hide the quiz div
  qDisplay = document.getElementById('mcq'); 
  qDisplay.style.display = 'none';

  resultView = document.getElementById('result')
  resultView.style.display = 'block';

  resultDiv = document.getElementById('resultDiv');

  resultChildren  = resultDiv.children;
  console.log(resultChildren);
  for (e = 0; e < resultChildren.length; e++) {
    resultChildren[e].style.display = 'none';//remove();
  }

  for (x = 0; x < 5; x++) {

    questionResult = document.createElement('div');
    questionResult.setAttribute('class', 'questionResult');

    questionBox = document.createElement('div');
    questionBox.setAttribute('class','questionResultSub');
    question = questions.questions[answers[x][0]];
    console.log(question);
    questionBox.innerHTML = question.question;
    questionResult.appendChild(questionBox);
    
    
    answerBox = document.createElement('div');
    answerBox.setAttribute('class', 'questionResultSub');

    for (y = 0; y < 3; y++) {
      answer = document.createElement('div');
      answer.setAttribute('class', 'resultAnswer ans'+(y+1));
      answer.innerHTML = question.answers[y];
      answer.style.border = 'hidden';
      if (answers[x][1] == y) {
        answer.style.border = 'solid';
      }
      answerBox.appendChild(answer);
    }
    questionResult.appendChild(answerBox);
    resultDiv.appendChild(questionResult);
  }

  //Verifies all answers at the end
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

function switchPage(id) {
  //Hide all pages
  pages = document.getElementsByClassName("pages");
  for (x = 0; x < pages.length; x++) {
    pages[x].style.display = 'none';
  }
  //Show the specified page
  page = document.getElementById(id);
  page.style.display = 'block';
  if (id == 'quiz') {
    planets();
  }
  else if (id == "home") {
    questionNo = 0;
    switchTab("2");
  }
}

function switchTab(id) {
  //Hide all pages
  pages = document.getElementsByClassName("contents");
  for (x = 0; x < pages.length; x++) {
    pages[x].style.display = 'none';
  }
  //Show the specified page
  page = document.getElementById(id);
  page.style.display = 'block';
  if (id == "0") {
    learn();
  }
  else if (id == "1") {
    shop();
  }
  else if (id == "2") {
    home();
  }
  else if (id == "3") {
    settings();
  }
  else if (id == "4") {
    profile();
  }
}

function learn() {
  console.log('learn');
}

function shop() {
  console.log('shop');
}

function home() {
  console.log('home');
}

function settings() {
  console.log('settings');
}

function profile() {
  console.log('profile');
  document.getElementById('usernameProfile').innerHTML = username;
  getJSON("http://"+ip+"/achievements.json?key="+key+"").then(data => {
    console.log(data);
    achievements = data.achievements;
    listItems = document.getElementById('achievements').children;
    for (x = 0; x < listItems.length; x++) {
      listItems[x].remove();
    }
    for (x = 0; x < achievements.length; x++) {
      achievement = achievements[x];
      ul = document.getElementById('acheivements');
      li = document.createElement("li");
      li.innerHTML = achievement.name+': '+achievement.description;
      img = document.createElement("img");
      img.src = achievement.image;
      img.style.width = '10vh';
      img.style.height = '10vh';
      li.appendChild(img);
      //txt = document.createTextNode(achievement.name+': '+achievement.description);
      //li.appendChild(txt);
      if (achievement.granted) {
        li.style.color = 'green';
      }
      else {
        li.style.color = 'red';
      }
      document.getElementById("achievements").appendChild(li);
      console.log(achievement);
    }
  }).catch(error => {
    console.error(error);
  });
}

function authenticate(key) {
  var data2;
  authJson = getJSON("http://"+ip+"/auth.json?key="+key).then(data => {
    console.log(data);
    data2 = data;
    username = data.username;
    start2(data2);
  }).catch(error => {
    console.error(error);
  });

}

function start(txt=null) {
  //Load the page
  key = getCookie('key');
  console.log(key);
  if (key == "") {
    switchPage('login');
  }
  else {
      authenticate(key);
  }
}

function setLoginColour(colour) {
  form = document.getElementsByClassName("loginInput");
  for (x = 0; x < form.length; x++) {
    form[x].style.backgroundColor = colour;
  }
}

function start2(data){
  console.log(data);
  document.getElementById('key').innerHTML = key;
  if (data.code == 200) {
    switchPage('home');
  }
  else {
    error = document.getElementById('error');
    error.innerHTML = data.message;
    setLoginColour('#ff6666');
    switchPage('login');
  }
}

function createAccount(key) {
  username = document.getElementById("username").value;
  result = getJSON("http://"+ip+"/create.json?key="+key+"&username="+username).then(data => {
    console.log(data);
    if (data.code == 200) {
      start();
    }
    else {
      error = document.getElementById('error');
      error.innerHTML = data.message;
      console.log(data.code+': '+data.message);
    }
  }).catch(error => {
    console.error(error);
  });
}

function logIn(callback = start) {
  setLoginColour('#ffffff');
  username = document.getElementById("username").value;
  password = document.getElementById("password").value;
  document.getElementById("password").value = '';
  //Hash username then password then combined hashes to make a unique key
  sha256(username).then((userHash) => {
    sha256(password).then((passHash) => {
      sha256(userHash+passHash).then((key) => {
        console.log(key)
        setCookie('key', key, 10000);
        document.getElementById('key').innerHTML = key;
        //Go to homepage
        callback(key);
      })
    })
  })
}

function moveRocket(x=50, y=50) {
  changex = x-rocketX;
  changey = y-rockety;

  stepx = changex/50;
  stepy = changey/50;

  console.log(stepx);
  console.log(stepy);

  angle = Math.atan(changey/changex);
  if (changex < 0) {
    angle += Math.PI;
  }
  console.log(convDegrees(angle));

  rocket2 = document.getElementById('rocket2');
  rocket2.style.left = 'calc('+rocketX+'px - 20vw)';
  rocket2.style.top = rockety;
  rocket2.style.transform = 'rotate('+angle+'rad)';
  var id = setInterval(frame, 10);
  function frame() {
    rocketX += stepx;
    rocket2.style.left = 'calc('+rocketX+'px - 20vw)';
    rockety += stepy;
    rocket2.style.top = 'calc('+rockety+'px - 20vw)';

    if ((rocketX <= x & stepx < 0) || (rocketX >= x & stepx > 0)) {
      rocketX = x;
      rocketY = y;
      clearInterval(id);
      if (planetNo == rocketPositions.length-2) {
        endQuiz();
      }
    }

  }
}

function endQuiz() {
  console.log('end quiz');
}

function convRadians(degrees){
  var pi = Math.PI;
  return degrees * (pi/180);
}

function convDegrees(radians){
  var pi = Math.PI;
  return radians / (pi/180);
}