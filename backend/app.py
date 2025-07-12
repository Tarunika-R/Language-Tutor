from flask import Flask, request, jsonify
from flask_cors import CORS
from chat_controller import handle_chat
from database import init_db, save_message, get_history
from database import clear_history  # add this to imports

app = Flask(__name__)
CORS(app)

# Initialize DB
init_db()

@app.route("/chat", methods=["POST"])
def chat():
    data = request.json
    user_message = data.get("message", "")

    correction, feedback, bot_reply = handle_chat(user_message)

    # Save to DB
    save_message(user_message, correction, feedback, bot_reply)

    return jsonify({
        "correction": correction,
        "feedback": feedback,
        "response": bot_reply
    })

@app.route("/history", methods=["GET"])
def history():
    rows = get_history()
    return jsonify([
        {
            "user_input": r[0],
            "correction": r[1],
            "feedback": r[2],
            "bot_reply": r[3],
            "timestamp": r[4]
        }
        for r in rows
    ])

@app.route("/clear-history", methods=["POST"])
def clear():
    clear_history()
    return jsonify({"message": "Chat history cleared."})

if __name__ == "__main__":
    app.run(debug=True)
