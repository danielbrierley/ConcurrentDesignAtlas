from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import sqlite3



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

@app.route('/')
def home():
    #redirect to api.json
    return '<html><head><script>window.location = "/api.json"</script></head></html>'

@app.route('/api.json')
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
        return '{"code": 200, "message": "OK", "auth": "%s"}' % key
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
            return '{"code": 409, "message": "An account with the specified username already exists"}'
    else:
        return '{"code": 400, "message": "The key or username are empty"}'

if __name__ == '__main__':
    app.run()
