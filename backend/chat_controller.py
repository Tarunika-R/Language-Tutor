from grammar_corrector import correct_grammar
from feedback_explainer import explain_grammar


def handle_chat(message):
    corrected = correct_grammar(message)
    explanation = explain_grammar(message, corrected)

    feedback = "✅ Great! No errors detected." if message == corrected else f"⚠️ Correction: '{corrected}'\nℹ️ Explanation: {explanation}"

    return {
        "response": "Let's keep practicing!",
        "correction": corrected,
        "feedback": feedback
    }

