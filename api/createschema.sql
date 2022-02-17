CREATE TABLE questions (questionid INTEGER PRIMARY KEY AUTOINCREMENT, question TEXT, ans1 TEXT, ans2 TEXT, ans3 TEXT, theme TEXT);

CREATE TABLE users (username TEXT PRIMARY KEY, status TEXT, credentials TEXT);