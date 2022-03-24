const ip = "apitest2-b5pthtwkoq-nw.a.run.app";
//const ip = "127.0.0.1:5000";
const protocol = "https://";

const qn = 24;

const rocketSize = '10vh';

var t;
var timerInterval;
let questions;
let completed = [];
var answers = [];
var ansList = [];
var qNumber = 0;
var achievements;
var shopList;
var achievements;
var facts;
var streak = 0;
var incorrect = 0;
var icon;

var pb = 0;
let map = [];

var req = 0;

var username;

var questionNo;

var rocketPos = 0;
var width = 0;


var planetNo = -1;
var rocketScreenHeight = 844;
var rocketPositions = [[195, 820], [70, 780], [330, 760], [130, 660], [315, 620], [95, 430], [330, 440], [310, 230], [80, 200], [195, 50]];
var planetList = ['Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune'];

var meteors = 0;
var totalScore = 0;

var rocketX = rocketPositions[0][0];
var rockety = rocketPositions[0][1];

var music = true;
var sound = true;
var titleMusic = new Audio('sound/Logic.wav');
var quizMusic = new Audio('sound/quiz.wav');

document.addEventListener("touchmove", function (e) {
  e.preventDefault();
}, { passive: false });




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
  //console.log('test');
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  //console.log('test');

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
  //console.log(pb);
  //console.log(answers.length);

  rocketPos = answers.length*20;
  var id = setInterval(frame, 10);
  function frame() {
    if (width >= 100) {
      width = 100;
      setRocket(width);
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

function grantAchievement(aid) {
  console.log(key);
  console.log(achievements);
  getJSON(protocol+ip+"/grant.json?key="+key+"&achievementid="+aid).then(data => {
    console.log(data);
    if (data.code == 200) {
      achievementName = document.getElementById('achievtitle');
      achievementName.innerHTML = data.name+' - '+data.description;
      achievementIcon = document.getElementById('achievIcn');
      console.log(aid);
      achievementIcon.src = 'images/achievements/ach'+aid+'.png';//achievements[id].image;
      achievementIcon.alt = 'achievement '+aid;
      achievementPopup2 = document.getElementById('achievUnlocked');
      achievementPopup2.style.display = 'block';
      a = setInterval(function() {achievementPopup2.style.display = 'none'; clearInterval(a)}, 3000)
    }
  })
}

function setRocket(width) {
  if (width >= 100) {
    width = 100;
  }
  elem = document.getElementById("myBar");
  rocket = document.getElementById("rocket");
  elem.style.width = width + "%";
  elem.innerHTML = width + "%";
  rocket.style.left = "calc(+"+width + "% - 8vh)";

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
    //console.log(ansList[ans]);
  }
  if (ans == 0) {
    timerBack = document.getElementById('timerBackground');
    timerBack.classList.remove('incorrect');
    timerBack.classList.remove('correct');
    timerBack.offsetWidth;
    timerBack.classList.add('correct');
    streak += 1;
    if (streak == 5) {
      grantAchievement(3);
    }
    console.log(streak);
  }
  else {
    timerBack = document.getElementById('timerBackground');
    timerBack.classList.remove('incorrect');
    timerBack.classList.remove('correct');
    timerBack.offsetWidth;
    timerBack.classList.add('incorrect');
    streak = 0;
    console.log(streak);
  }
  answers.push([qNumber, ans]); //Add question and user answer to a list
  if (answers.length < 5) {
    nextQuestion(); //Generate next question
  }
  //else {
    //move(setCompleted); //Move progress bar to 100% before finishing the set
  //}
  //console.log(answers);
}

function nextQuestion() {
  //Reset 10 second timer
  t = 10;
  clearInterval(timerInterval);
  //Generate next question id
  index = generateQuestionID();
  
  //Set text in question box
  //console.log(questions.questions);
  //console.log(index);
  question = questions.questions[index];
  questionElement = document.getElementById("question");
  questionElement.innerHTML = question.question;

  //console.log(question.answers);
  shuffled = shuffleAnswers(question.answers); //shuffle answers
  //console.log(shuffled);
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
    if (music) {
      titleMusic.pause();
      titleMusic.currentTime = 0;
      quizMusic.loop = true;
      quizMusic.play();
    }
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
    //console.log(key);
    //console.log(planetList[planetNo]);
    //console.log("Fetching data...");

    //Fetch questions from server
    getJSON(protocol+ip+"/questions.json?key="+key+"&theme=SolarSystem").then(data => {
      questions = data;
      //console.log(questions);
      nextQuestion();
    })//.catch(error => {
      //console.error(error);
    //});

    //var cookie = document.getElementById("cookie");
    //cookie.innerHTML = getCookie('test');
}

function planets() {
  planetNo += 1;
  if (planetNo == 7) {
    grantAchievement(2);
  }
  //console.log(planetNo+' '+(rocketPositions.length-2));
  planetName = document.getElementById('planetName');
  planetName.innerHTML = planetList[planetNo]; 

  meteorCount = document.getElementById('meteorCount');
  meteorCount.innerHTML = meteors; 

  if (planetNo == rocketPositions.length-2) {
    //console.log('done');
  }
  rocket2 = document.getElementById('rocket2');
  rocket2.style.left = 'calc('+rocketX+'px - 20vw)';
  rocket2.style.top = 'calc('+rockety+'px - 20vw)';

  completed = [];
  pb = 0;

  quiz2 = document.getElementById('quiz2');
  quiz2.style.display = 'none';


  endScreen = document.getElementById('endofstory');
  endScreen.style.display = 'none';

  mcq = document.getElementById('mcq');
  mcq.style.display = 'block';

  mcq = document.getElementById('result');
  mcq.style.display = 'none';

  map = document.getElementById('map');
  map.style.display = 'block';

  timerBack = document.getElementById('timerBackground');
  timerBack.classList.remove('incorrect');
  timerBack.classList.remove('correct');

  nextRocket = rocketPositions[planetNo+1];
  moveRocket(nextRocket[0],nextRocket[1])

  //console.log(questionNo);

}

function setCompleted() {
  //Clear the timer
  clearInterval(timerInterval);

  if (music) {
    quizMusic.pause();
    quizMusic.currentTime = 0;
    titleMusic.loop = true;
    titleMusic.play();
  }

  //Hide the quiz div
  qDisplay = document.getElementById('mcq'); 
  qDisplay.style.display = 'none';

  resultView = document.getElementById('result')
  resultView.style.display = 'block';

  resultDiv = document.getElementById('resultDiv');

  resultChildren  = resultDiv.children;
  //console.log(resultChildren);
  for (e = 0; e < resultChildren.length; e++) {
    resultChildren[e].style.display = 'none';
    //resultChildren[0].remove();
  }

  for (x = 0; x < 5; x++) {

    questionResult = document.createElement('div');
    questionResult.setAttribute('class', 'questionResult');

    questionBox = document.createElement('div');
    questionBox.setAttribute('class','questionResultSubTop');
    question = questions.questions[answers[x][0]];
    //console.log(question);
    questionBox.innerHTML = question.question;
    questionResult.appendChild(questionBox);
    
    
    answerBox = document.createElement('div');
    answerBox.setAttribute('class', 'questionResultSubBottom');

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
  incorrect += (5-score);
  if (incorrect >= 10) {
    grantAchievement(4);
  }
  meteors += score;
  totalScore += score;
  if (meteors >= 25) {
    grantAchievement(5);
  }
  if (score == 1) {
    document.getElementById('meteorites').innerHTML = 'You have earned '+score+' meteorite!';
  }
  else {
    document.getElementById('meteorites').innerHTML = 'You have earned '+score+' meteorites!'
  }
  timestamp = Date.now();
  console.log(timestamp);
  console.log(username);
  sha256(timestamp+username).then((uid) => {
    getJSON(protocol+ip+"/addmeteors.json?key="+key+"&uid="+uid+'&amount='+score).then(data => {
      console.log(data);
    });
    getJSON(protocol+ip+"/addResult.json?key="+key+"&uid="+uid+'&amount='+score).then(data => {
      console.log(data);
    });
  })
  //console.log(score);
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
    startStory();
  }
  else if (id == "home") {
    questionNo = 0;
    switchTab("2");
  }
}

function startStory() {
  if (music) {
    quizMusic.pause();
    quizMusic.currentTime = 0;
    titleMusic.loop = true;
    titleMusic.play();
  }
  grantAchievement(1);
  planets();
  meteors = 0;
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
  getJSON(protocol+ip+"/facts.json?key="+key+"").then(data => {
    facts = data.facts;
    console.log(facts);
    factContents = document.getElementById('factContents');
    factContents.innerHTML = "";
    for (x = 0; x < facts.length; x++) {
      factSet = facts[x];
      tab = document.createElement('div');
      tab.classList.add('learnTabs');
      for (y = 0; y < factSet.length; y++) {
        fact = factSet[y];
        f = document.createElement('div');
        f.innerHTML = fact.fact;
        tab.appendChild(f);
      }
      tab.style.display = 'none';
      factContents.appendChild(tab);
    }
    switchLearnTab(0);
  });
  //console.log('learn');
}

function switchLearnTab(id) {
  tabs = document.getElementsByClassName('learnTabs');
  for (x = 0; x < tabs.length; x++) {
    tabs[x].style.display = 'none';
  }
  tabs[id].style.display = 'block';
}

function shop() {
  //console.log('shop');
  getJSON(protocol+ip+"/shop.json?key="+key+"").then(data => {
    //console.log(data);
    shopList = data.shop;
    meteors = data.meteors[0];
    meteorCountShop = document.getElementById('meteorCountShop');
    meteorCountShop.innerHTML = meteors;
    listItems = document.getElementById('shopContents').children;
    for (x = 0; x < listItems.length; x++) {
      listItems[x].style.display = 'none';
    }
    for (x = 0; x < shopList.length; x++) {
      item = shopList[x];
      ul = document.getElementById('acheivements');//.onclick();
      li = document.createElement("li");
      //li.innerHTML = item.name+': '+item.description;
      img = document.createElement("img");
      img.src = 'images/shop/item'+item.id+'.png';//item.image;
      img.alt = 'item '+item.id;
      img.classList.add('imageGrid');
      //txt = document.createTextNode(item.name+': '+item.description);
      //li.appendChild(txt);
      /*if (item.granted) {
        img.style.filter = "grayscale(0%)";
      }
      else {
        img.style.filter = "grayscale(100%)";
      }*/
      //console.log(x);
      l = x;
      //img.onclick = function() {showitem(this.parentElement.id[0]);};
      //console.log(img.onclick);
      li.id = x+'item';
      console.log(item.cost);
      div = document.createElement("div");
      div.classList.add("cost");

      span = document.createElement("span");
      span.classList.add("costText");
      span.innerHTML = item.cost;
      if (item.cost > meteors) {
        span.style.color = 'red';
        console.log('red');
      }

      mimg = document.createElement("img");
      mimg.classList.add("meteoriteCost");
      mimg.src = "images/meteorite.png";
      
      div.appendChild(span);
      div.appendChild(mimg);

      li.onclick = function() {showItem(this.id[0]);};

      li.appendChild(img);
      li.appendChild(div);
      document.getElementById("shopContents").appendChild(li);
      //console.log(item);
    }
  })
}

function home() {
  //console.log('home');
  getJSON(protocol+ip+"/fact.json?key="+key+"").then(data => {
    fact = document.getElementById('fact');
    fact.innerHTML = data.fact.fact;
    console.log(data);
  });
  
}

function settings() {
  //console.log('settings');
}

function profile() {
  //console.log('profile');
  

  document.getElementById('usernameProfile').innerHTML = username;
  getJSON(protocol+ip+"/achievements.json?key="+key+"").then(data => {
    //console.log(data);
    achievements = data.achievements;
    listItems = document.getElementById('achievements').children;
    for (x = 0; x < listItems.length; x++) {
      listItems[x].style.display = 'none';
    }
    for (x = 0; x < achievements.length; x++) {
      achievement = achievements[x];
      ul = document.getElementById('achievements');//.onclick();
      li = document.createElement("li");
      //li.innerHTML = achievement.name+': '+achievement.description;
      img = document.createElement("img");
      img.src = 'images/achievements/ach'+achievement.id+'.png';//achievement.image;
      img.alt = 'achievement '+achievement.id;
      img.classList.add('imageGrid');
      //txt = document.createTextNode(achievement.name+': '+achievement.description);
      //li.appendChild(txt);
      if (achievement.granted) {
        img.style.filter = "grayscale(0%)";
      }
      else {
        img.style.filter = "grayscale(100%)";
      }
      //console.log(x);
      l = x;
      img.onclick = function() {showAchievement(this.parentElement.id[0]);};
      //console.log(img.onclick);
      li.id = x+'achievement';
      li.appendChild(img);
      document.getElementById("achievements").appendChild(li);
      //console.log(achievement);
    }
  });//.catch(error => {
    //console.error(error);
  //});
  getJSON(protocol+ip+"/getResults.json?username="+username+"").then(data => {
    correct = data.correct;
    total = data.total;
    stats = document.getElementById('stats');
    stats.innerHTML = correct+'/'+total;

  });

  getJSON(protocol+ip+"/inventory.json?key="+key+"").then(data => {
    //console.log(data);
    inventory = data.inventory;
    listItems = document.getElementById('inventory').children;
    for (x = 0; x < listItems.length; x++) {
      listItems[x].style.display = 'none';
    }
    for (x = 0; x < inventory.length; x++) {
      item = inventory[x];
      ul = document.getElementById('inventory');//.onclick();
      li = document.createElement("li");
      //li.innerHTML = item.name+': '+item.description;
      img = document.createElement("img");
      img.src = 'images/shop/item'+item.id+'.png';//item.image;
      img.alt = 'item '+item.id;
      img.classList.add('imageGrid');
      //txt = document.createTextNode(item.name+': '+item.description);
      //li.appendChild(txt);
      //console.log(x);
      l = x;
      img.onclick = function() {setPFP(this.parentElement.id[0]);};
      //console.log(img.onclick);
      li.id = x+'item';
      li.appendChild(img);
      document.getElementById("inventory").appendChild(li);
      //console.log(item);
    }
  }); 
  getJSON(protocol+ip+"/geticon.json?username="+username+"").then(data => {
    console.log(data);
    setIcon(data.icon);
  });
}

function setPFP(id) {
  id = inventory[id].id;
  getJSON(protocol+ip+"/seticon.json?key="+key+"&id="+id).then(data => {
    console.log(data);
    setIcon(data.icon);
  });
  console.log(id);
}

function setIcon(id) {
  icon = id;
  profilePic = document.getElementById('profilePic');
  profilePic.src = "images/shop/item"+id+".png"
}

function showItem(id) {
  //console.log(id);
  itemCost = document.getElementById('itemCost');
  itemCost.innerHTML = shopList[id].cost;
  
  //mimg = document.createElement("img");
  //mimg.classList.add("meteoriteCost");
  //mimg.src = "images/meteorite.png";
  //itemCost.appendChild(mimg);

  itemImage = document.getElementById('itemImage');
  itemImage.src = 'images/shop/item'+(parseInt(id)+1)+'.png';//achievements[id].image;
  itemImage.alt = 'item '+(parseInt(id)+1);
  itemPopup = document.getElementById('itemPopup');

  purchaseButton = document.getElementById('purchase');
  if (shopList[id].cost > meteors) {
    purchaseButton.disabled = true;
    itemCost.style.color = 'red';
  }
  else {
    purchaseButton.disabled = false;
    itemCost.style.color = 'black';
    purchaseButton.onclick = function() {purchaseItem(shopList[id].id);};
  }

  /*if (achievements[id].granted){
    achievementPopup.style.backgroundColor = '#fb78c9';
  }
  else {
    achievementPopup.style.backgroundColor = '#888888';
  }*/
  itemPopup.style.display = 'block';
  shopDisabler = document.getElementById('shopDisabler');
  shopDisabler.style.display = 'block';
}

function purchaseItem(id) {
  console.log(id);
  sha256(id+username).then((uid) => {
    getJSON(protocol+ip+"/purchase.json?key="+key+"&uid="+uid+'&item='+id).then(data => {
      meteors = data.meteors;
      shop();
      console.log(data);
    });
  });
}

function hideItem() {
  itemPopup = document.getElementById('itemPopup');
  itemPopup.style.display = 'none';
  shopDisabler = document.getElementById('shopDisabler');
  shopDisabler.style.display = 'none';

}

function showAchievement(id) {
  //console.log(id);
  achievementName = document.getElementById('achievementName');
  achievementName.innerHTML = achievements[id].name;
  achievementDescription = document.getElementById('achievementDescription');
  achievementDescription.innerHTML = achievements[id].description;
  achievementImage = document.getElementById('achievementImage');
  achievementImage.src = 'images/achievements/ach'+(parseInt(id)+1)+'.png';//achievements[id].image;
  achievementImage.alt = 'achievement '+(parseInt(id)+1);
  achievementPopup = document.getElementById('achievementPopup');
  if (achievements[id].granted){
    achievementPopup.style.backgroundColor = '#fb78c9';
  }
  else {
    achievementPopup.style.backgroundColor = '#888888';
  }
  achievementPopup.style.display = 'block';
  achievementDisabler = document.getElementById('achievementDisabler');
  achievementDisabler.style.display = 'block';
}

function hideAchievement() {
  achievementPopup = document.getElementById('achievementPopup');
  achievementPopup.style.display = 'none';
  achievementDisabler = document.getElementById('achievementDisabler');
  achievementDisabler.style.display = 'none';
}

function authenticate(key) {
  var data2;
  authJson = getJSON(protocol+ip+"/auth.json?key="+key).then(data => {
    //console.log(data);
    data2 = data;
    username = data.username;
    start2(data2);
  })//.catch(error => {
  //  console.error(error);
  //});

}

function start(txt=null) {

  scrolls = document.getElementsByClassName('scroll');
  for (x = 0; x < scrolls.length; x++) {
    console.log(x);
    scrolls[x].addEventListener("touchmove", function (e) {
      e.stopPropagation();
    }, { passive: false });
  }

  //Load the page
  //window.location = '#';
  key = getCookie('key');
  //console.log(key);
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
  //console.log(data);
  if (data.code == 200) {
    getJSON(protocol+ip+'/getResults.json?username='+username).then(data => {
      incorrect += data.total-data.correct;
      if (incorrect >= 10) {
        grantAchievement(4);
      }
      console.log(incorrect);
    });
    switchPage('home');
    switchTab('2');
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
  result = getJSON(protocol+ip+"/create.json?key="+key+"&username="+username).then(data => {
    //console.log(data);
    if (data.code == 200) {
      start();
    }
    else {
      error = document.getElementById('error');
      error.innerHTML = data.message;
      //console.log(data.code+': '+data.message);
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
        //console.log(key)
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

  //console.log(stepx);
  //console.log(stepy);

  angle = Math.atan(changey/changex);
  if (changex < 0) {
    angle += Math.PI;
  }
  //console.log(convDegrees(angle));

  rocket2 = document.getElementById('rocket2');
  rocket2.style.left = 'calc('+rocketX+'px - '+rocketSize+')';
  rocket2.style.top = rockety;
  rocket2.style.transform = 'rotate('+angle+'rad)';
  var id = setInterval(frame, 10);
  function frame() {
    body = document.body,
    html = document.documentElement;
    //height = Math.max( body.scrollHeight, body.offsetHeight, 
    //                   html.clientHeight, html.scrollHeight, html.offsetHeight );

    height = html.clientHeight;
    heightRatio = height/844;
    //console.log(height);
    //console.log(heightRatio);

    rocketX += stepx;
    //console.log(rocketX);
    rocket2.style.left = 'calc(50% - (195 * (100vh / 844)) + ('+rocketX+' * (100vh / 844)) - '+rocketSize+')';
    //rocket2.style.left = 'calc(50% - '+(195*heightRatio)+'px + '+(rocketX*heightRatio)+'px - '+rocketSize+')';
    rockety += stepy;
    rocket2.style.top = 'calc('+(rockety/8.44)+'% - '+rocketSize+')';

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
  //console.log('end quiz');

  resultCorrect = document.getElementById('resultCorrect');
  resultCorrect.innerHTML = totalScore+"/40"; 

  meteoritesEnd = document.getElementById('meteoritesEnd');
  meteoritesEnd.innerHTML = "You earned a total of "+meteors+" Meteorites!"; 


  rocketPos = 0;
  width = 0;
  totalScore = 0;
  meteors = 0;
  
  
  planetNo = -1;
  rocketX = rocketPositions[0][0];
  rockety = rocketPositions[0][1];
  
  planetsEnd = document.getElementById('map');
  planetsEnd.style.display = 'none';
  
  endOfStory = document.getElementById('endofstory');
  endOfStory.style.display = 'block';
  //switchPage('home');
}

function logOut() {
  clearCookies();
  window.location = ''; //reload
}

function toggleSound() {
  sound = !sound;
  console.log(sound);
}

function toggleMusic() {
  music = !music;
  console.log(music);
}

function convRadians(degrees){
  var pi = Math.PI;
  return degrees * (pi/180);
}

function convDegrees(radians){
  var pi = Math.PI;
  return radians / (pi/180);
}