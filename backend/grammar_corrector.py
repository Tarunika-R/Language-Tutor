from transformers import T5ForConditionalGeneration, T5Tokenizer

model_name = "prithivida/grammar_error_correcter_v1"
tokenizer = T5Tokenizer.from_pretrained(model_name)
model = T5ForConditionalGeneration.from_pretrained(model_name)

def correct_grammar(text):
    input_text = "gec: " + text
    input_ids = tokenizer.encode(input_text, return_tensors="pt")
    outputs = model.generate(input_ids, max_length=64, num_beams=4)
    corrected = tokenizer.decode(outputs[0], skip_special_tokens=True)
    return corrected
