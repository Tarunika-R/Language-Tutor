def explain_grammar(original, corrected):
    if original == corrected:
        return "No grammatical errors found."
    return f"Changed from '{original}' to '{corrected}' for grammatical accuracy."

