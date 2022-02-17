from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import sqlite3



app = Flask(__name__)
CORS(app)

def verifyKey(key):
    return True



@app.route('/')
def home():
    #redirect to api.json
    return '<html><head><script>window.location = "/api.json"</script></head></html>'

@app.route('/api.json')
def question():
    key = request.args.get('key')
    print(key)
    if verifyKey(key):
        type = request.args.get('type')
        print(type)

        jsonToSend = {}
        questionArray = []
        con = sqlite3.connect('questions.db')
        cur = con.cursor()
        for row in cur.execute("SELECT question, theme, ans1, ans2, ans3 FROM questions"):
            question = {'question': row[0], 'theme': row[1], 'answers': [row[2],row[3],row[4]]}
            questionArray.append(question)
        jsonToSend['questions'] = questionArray
        
        jsonToSend['code'] = 200
        jsonToSend['message'] = 'OK'
        response = jsonToSend
    else:
        return '{"code": 403, "message": "Your key is not permitted to perform this action"}'
    
    return response

if __name__ == '__main__':
    app.run()
