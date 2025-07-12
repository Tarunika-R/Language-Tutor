from flask import Flask, request, jsonify
from flask_cors import CORS
from chat_controller import handle_chat

app = Flask(__name__)
CORS(app)

@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    user_message = data.get("message", "")
    result = handle_chat(user_message)
    return jsonify(result)

if __name__ == "__main__":
    app.run(debug=True)
