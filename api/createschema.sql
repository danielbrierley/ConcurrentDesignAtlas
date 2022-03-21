CREATE TABLE questions (questionid INTEGER PRIMARY KEY AUTOINCREMENT, question TEXT, ans1 TEXT, ans2 TEXT, ans3 TEXT, theme TEXT);

CREATE TABLE users (username TEXT PRIMARY KEY, status TEXT, credentials TEXT);

CREATE TABLE achievements (achievementid INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, description TEXT, dependancy INTEGER, FOREIGN KEY (dependancy) REFERENCES achievements (achievementid));

CREATE TABLE achievementLog (logid INTEGER PRIMARY KEY AUTOINCREMENT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP, username TEXT, achievementid INTEGER, FOREIGN KEY (username) REFERENCES users (username), FOREIGN KEY (achievementid) REFERENCES achievements (achievementid));

CREATE TABLE meteorLog (logid TEXT PRIMARY KEY, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP, username TEXT, amount INTEGER, item INTEGER, FOREIGN KEY (username) REFERENCES users (username), FOREIGN KEY (item) REFERENCES shop (shopid));

CREATE TABLE questionLog (logid TEXT PRIMARY KEY, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP, username TEXT, amount INTEGER, FOREIGN KEY (username) REFERENCES users (username));

CREATE TABLE shop (shopid INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, cost INTEGER);