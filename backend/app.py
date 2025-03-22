from google import genai
from flask import Flask, request, jsonify


app = Flask(__name__)
client = genai.Client(api_key="") # de adaugat cheia


@app.route('/analyze', methods=['POST'])
def analyze_answer():
    data = request.json
    question = data['question']
    answer = data['answer']
    
    if not question or not answer:
        return jsonify({"error": "Missing question or answer"}), 400

    prompt = f"""
    aici o sa fie prompt
    
    Question: {question}
    Answer: {answer}
    """
    
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=prompt,
    )
    
    return jsonify({"feedback": response.generated_output})


if __name__ == '__main__':
    app.run(debug=True)