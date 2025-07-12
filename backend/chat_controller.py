import re
from grammar_corrector import correct_grammar
from feedback_explainer import explain_grammar

def normalize(text):
    return re.sub(r'[.!?]+$', '', text.strip().lower())

def check_punctuation(original, corrected):
    if not original.strip().endswith(('.', '!', '?')) and corrected.strip().endswith(('.', '!', '?')):
        return corrected.strip()[-1]  # returns '.', '!', or '?'
    return ""

def handle_chat(message):
    corrected = correct_grammar(message)
    explanation = explain_grammar(message, corrected)

    norm_input = normalize(message)
    norm_corrected = normalize(corrected)
    missing_punct = check_punctuation(message, corrected)

    if norm_input == norm_corrected:
        if missing_punct:
            feedback = f"✅ Your sentence is grammatically correct, but it’s missing a '{missing_punct}' at the end."
            bot_reply = f"📝 Just a heads up — try ending your sentence with a '{missing_punct}'."
        else:
            feedback = "✅ Great! Your sentence is grammatically correct. 🎉"
            bot_reply = "🎯 Perfect! No corrections needed."
    else:
        feedback = (
            f"❌ You wrote: “{message}”\n"
            f"✅ Try: “{corrected}”\n"
            f"💡 {explanation}"
        )
        bot_reply = f"✏️ Here's a better way to say it: “{corrected}”. You're improving!"

    return {
        "response": bot_reply,
        "correction": corrected,
        "feedback": feedback
    }
