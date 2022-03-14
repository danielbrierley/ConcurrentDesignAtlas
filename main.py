from flask import Flask, request, jsonify, send_file, render_template
from flask_cors import CORS
import json
import sqlite3
import os



app = Flask(__name__)
CORS(app)

def hash(key):
    #TODO hash the key through a secure hashing algorithm
    return key

def verifyKey(key):
    con = sqlite3.connect('questions.db')
    cur = con.cursor()
    result = cur.execute('SELECT * FROM users WHERE credentials=?', (key,)).fetchall()
    con.close()
    if len(result) == 0:
        return False
    else:
        return True

def getUsername(key):
    con = sqlite3.connect('questions.db')
    cur = con.cursor()
    result = cur.execute('SELECT username FROM users WHERE credentials=?', (key,)).fetchall()
    con.close()
    print(result)
    try:
        return result[0][0]
    except:
        return ''

@app.route('/')
def home():
    #redirect to questions.json
    return '<html><head><script>window.location = "/questions.json"</script></head></html>'

@app.route('/questions.json')
def question():
    key = request.args.get('key')
    key = hash(key)
    print(key)
    if verifyKey(key):
        type = request.args.get('theme')
        print(type)

        jsonToSend = {}
        questionArray = []
        con = sqlite3.connect('questions.db')
        cur = con.cursor()
        v = (type,)
        if type == None:
            values = cur.execute("SELECT question, theme, ans1, ans2, ans3 FROM questions")
        else:
            values = cur.execute("SELECT question, theme, ans1, ans2, ans3 FROM questions WHERE theme=?", v)
        for row in values:
            question = {'question': row[0], 'theme': row[1], 'answers': [row[2],row[3],row[4]]}
            questionArray.append(question)
        con.close()
        jsonToSend['questions'] = questionArray
        
        jsonToSend['code'] = 200
        jsonToSend['message'] = 'OK'
        response = jsonToSend
    else:
        return '{"code": 403, "message": "Your key is not permitted to perform this action"}'
    
    return response

@app.route('/auth.json')
def auth():
    key = request.args.get('key')
    key = hash(key)
    print(key)
    if verifyKey(key):
        return '{"code": 200, "message": "OK", "auth": "%s", "username": "%s"}' % (key, getUsername(key))
    else:
        return '{"code": 403, "message": "Username or Password is incorrect", "auth": ""}'

@app.route('/create.json')
def createAccount():
    key = request.args.get('key')
    key = hash(key)
    username = request.args.get('username')


    if key and username:
        con = sqlite3.connect('questions.db')
        cur = con.cursor()
        result = cur.execute('SELECT * FROM users WHERE username=?', (username,)).fetchall()
        print(len(result))
        if len(result) == 0:
            print('inserting')
            print(username, key)
            print(cur.execute('INSERT INTO users (username, credentials) VALUES (?, ?)', (username,key)))
            con.commit()
            con.close()
            return '{"code": 200, "message": "OK"}'
        else:
            con.close()
            return '{"code": 409, "message": "An account with that username already exists"}'
    else:
        return '{"code": 400, "message": "The key or username are empty"}'

@app.route('/username.json')
def user():
    key = request.args.get('key')
    username = getUsername(key)
    if username:
        return '{"code": 200, "message": "OK", "username": "%s"}' % username
    else:
        return '{"code": 404, "message": "Username could not be found"}'

@app.route('/achievements.json')
def getAchievements():
    key = request.args.get('key')
    con = sqlite3.connect('questions.db')
    cur = con.cursor()
    achievementsRaw = cur.execute('SELECT name, description, achievementid FROM achievements')
    achievements = []
    for achievement in achievementsRaw:
        id = achievement[2]
        print(id)
        username = getUsername(key)
        granted = alreadyGranted(username, id)
        achievements.append({'id': id, 'name': achievement[0], 'description': achievement[1], 'granted': granted, 'image': 'http://127.0.0.1:5500/images/icon.png'})
    con.close()

    jsonToReturn = {'code': 200, 'message': 'OK', 'achievements': achievements}
    return jsonToReturn

def alreadyGranted(username, achievementid):
    con = sqlite3.connect('questions.db')
    cur = con.cursor()
    numOfResults = len(cur.execute('SELECT * FROM achievementLog WHERE username=? AND achievementid=?', (username,achievementid)).fetchall())
    con.close()
    if numOfResults:
        return True
    else:
        return False


@app.route('/grant.json')
def grantAchievement():
    key = request.args.get('key')
    print(key)
    achievementid = request.args.get('achievementid')
    username = getUsername(key)
    print(username)
    if username:
        if alreadyGranted(username, achievementid):
            return '{"code": 409, "message": "Achievement has already been granted to this user"}'
        else:
            con = sqlite3.connect('questions.db')
            cur = con.cursor()
            cur.execute('INSERT INTO achievementLog (username, achievementid) VALUES (?, ?)', (username,achievementid))
            con.commit()
            con.close()
            return '{"code": 200, "message": "OK"}'
    else:
        return '{"code": 404, "message": "User not found"}'

def alreadyMeteor(uid):
    con = sqlite3.connect('questions.db')
    cur = con.cursor()
    print(uid)
    numOfResults = len(cur.execute('SELECT * FROM meteorLog WHERE logid=?', (uid,)).fetchall())
    con.close()
    if numOfResults:
        return True
    else:
        return False

@app.route('/addmeteors.json')
def addMeteor():
    key = request.args.get('key')
    print(key)
    uid = request.args.get('uid')
    amount = request.args.get('amount')

    username = getUsername(key)
    print(username)
    if username:
        if alreadyMeteor(uid):
            return '{"code": 409, "message": "This request has already been fulfilled"}'
        else:
            con = sqlite3.connect('questions.db')
            cur = con.cursor()
            cur.execute('INSERT INTO meteorLog (logid, username, amount) VALUES (?, ?, ?)', (uid,username,amount))
            con.commit()
            con.close()
            return '{"code": 200, "message": "OK"}'
    else:
        return '{"code": 404, "message": "User not found"}'

def alreadyResult(uid):
    con = sqlite3.connect('questions.db')
    cur = con.cursor()
    print(uid)
    numOfResults = len(cur.execute('SELECT * FROM questionLog WHERE logid=?', (uid,)).fetchall())
    con.close()
    if numOfResults:
        return True
    else:
        return False

@app.route('/addResult.json')
def addResult():
    key = request.args.get('key')
    print(key)
    uid = request.args.get('uid')
    amount = request.args.get('amount')

    username = getUsername(key)
    print(username)
    if username:
        if alreadyResult(uid):
            return '{"code": 409, "message": "This request has already been fulfilled"}'
        else:
            con = sqlite3.connect('questions.db')
            cur = con.cursor()
            cur.execute('INSERT INTO questionLog (logid, username, amount) VALUES (?, ?, ?)', (uid,username,amount))
            con.commit()
            con.close()
            return '{"code": 200, "message": "OK"}'
    else:
        return '{"code": 404, "message": "User not found"}'

@app.route('/getMeteors.json')
def getMeteors():
    username = request.args.get('username')
    con = sqlite3.connect('questions.db')
    cur = con.cursor()
    meteors = cur.execute('SELECT SUM(amount) FROM meteorLog WHERE username=?', (username,)).fetchall()[0]
    con.close()
    return '{"code": 200, "message": "OK", "meteors": '+str(meteors[0])+'}'

@app.route('/getResults.json')
def getResults():
    username = request.args.get('username')
    con = sqlite3.connect('questions.db')
    cur = con.cursor()
    results = cur.execute('SELECT SUM(amount), COUNT(amount) FROM questionLog WHERE username=?', (username,)).fetchall()[0]
    con.close()
    return '{"code": 200, "message": "OK", "correct": '+str(results[0])+', "total": '+str(results[1]*5)+'}'


@app.route('/image.png')
def get_image():
    filename = request.args.get('id')+'.png'
    return send_file(filename, mimetype='image/png')

@app.route('/index.html')
def returnFile():
    return render_template("index.html")

@app.route('/userList.json')
def userList():
    key = request.args.get('key')
    if key == '34034db3c6d844c8c005a5826ee8745ab97418d195356ab0ad8ab10fb5f46d8e':
        con = sqlite3.connect('questions.db')
        cur = con.cursor()
        userArray = []
        values = cur.execute('SELECT username FROM users')
        for user in values:
            userArray.append(user[0])
        con.close()
        jsonToSend = {}
        jsonToSend['code'] = 200
        jsonToSend['message'] = 'OK'
        jsonToSend['users'] = userArray

        return jsonToSend
    else:
        return '{"code": 403, "message": "Forbidden"}'
        

#@app.errorhandler(404)
#def notFound(e):
#    print(e)
#    return 'test'

if __name__ == '__main__':
    #app.run()
    app.run(debug=True, host="0.0.0.0", port=int(os.environ.get("PORT", 8080)))
