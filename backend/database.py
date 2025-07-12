import sqlite3
from datetime import datetime

def init_db():
    conn = sqlite3.connect("chat_history.db")
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_input TEXT,
            correction TEXT,
            feedback TEXT,
            bot_reply TEXT,
            timestamp TEXT
        )
    ''')
    conn.commit()
    conn.close()

def save_message(user_input, correction, feedback, bot_reply):
    conn = sqlite3.connect("chat_history.db")
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO messages (user_input, correction, feedback, bot_reply, timestamp)
        VALUES (?, ?, ?, ?, ?)
    ''', (user_input, correction, feedback, bot_reply, datetime.now().isoformat()))
    conn.commit()
    conn.close()

def get_history():
    conn = sqlite3.connect("chat_history.db")
    cursor = conn.cursor()
    cursor.execute('SELECT user_input, correction, feedback, bot_reply, timestamp FROM messages ORDER BY id DESC')
    rows = cursor.fetchall()
    conn.close()
    return rows

def clear_history():
    conn = sqlite3.connect("chat_history.db")
    cursor = conn.cursor()
    cursor.execute('DELETE FROM messages')
    conn.commit()
    conn.close()