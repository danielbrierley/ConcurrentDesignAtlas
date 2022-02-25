CREATE TABLE questions (questionid INTEGER PRIMARY KEY AUTOINCREMENT, question TEXT, ans1 TEXT, ans2 TEXT, ans3 TEXT, theme TEXT);

CREATE TABLE users (username TEXT PRIMARY KEY, status TEXT, credentials TEXT);

CREATE TABLE achievements (achievementid INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, description TEXT, dependancy INTEGER, FOREIGN KEY (dependancy) REFERENCES achievements (achievementid));

CREATE TABLE achievementLog (logid INTEGER PRIMARY KEY AUTOINCREMENT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP, username INTEGER, achievementid INTEGER, FOREIGN KEY (username) REFERENCES users (username), FOREIGN KEY (achievementid) REFERENCES achievements (achievementid));