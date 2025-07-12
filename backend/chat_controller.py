from grammar_corrector import correct_grammar

def generate_feedback(original, corrected):
    if original.strip() == corrected.strip():
        return "✅ Your sentence is grammatically correct!"
    else:
        return f"⚠️ Correction: \"{corrected}\" — please note the grammatical changes."

def generate_reply(user_input):
    return "Great! Let's keep practicing."

def handle_chat(user_input):
    correction = correct_grammar(user_input)
    feedback = generate_feedback(user_input, correction)
    bot_reply = generate_reply(user_input)
    return correction, feedback, bot_reply
