from google import genai
from google.genai import types
from google.genai.types import GenerateContentConfig
from flask import Flask, request, jsonify
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  # Allow all origins

client = genai.Client(api_key="REDACTED") # add api key


@app.route('/analyze', methods=['POST'])
def analyze_answer():
    data = request.json
    question = data['question']
    answer = data['answer']

    if not question or not answer:
        return jsonify({"error": "Missing question or answer"}), 400

    prompt = f"""
    Prompt: You are an HR professional or employer conducting an interview. Your task is to provide constructive feedback on a candidate's answer to a soft skills question.  Focus on areas for improvement, highlighting both strengths and weaknesses in their response.  Offer specific suggestions on how the candidate could improve their answer in future interviews.


    System prompt: You will be provided with the following:

    Soft Skills Question: {question}
    Candidate Answer: {answer}

    Instructions:

    1. Carefully analyze the candidate answer in relation to the question.
    2. Identify both the strengths and weaknesses of the candidate answer.
    3. Provide specific and actionable feedback on how the candidate could improve their response in future interviews.
    4. Focus on clarity, conciseness, and relevance to the question.
    5. Maintain a professional and objective tone in your feedback.
    6. Return your response as a JSON object adhering strictly to the provided schema.
    7. Write the feedback directly to the candidate using “you” statements (e.g., “You did well to…” or “You could improve by…”).
    """

    response_schema = {
      "type": "object",
      "properties": {
        "feedback": {
          "type": "object",
          "properties": {
            "strengths": {
              "type": "array",
              "items": {"type": "string"}
            },
            "weaknesses": {
              "type": "array",
              "items": {"type": "string"}
            },
            "overall_assessment": {
              "type": "string",
            },
            "areas_of_improvement": {
              "type": "array",
              "items": {"type": "string"}
            },
            "actionable_feedback": {
              "type": "array",
              "items": {"type": "string"}
            },
            "additional_feedback": {
              "type": "string",
            }
          },
          "required": [
            "strengths",
            "weaknesses",
            "overall_assessment",
            "areas_of_improvement",
            "actionable_feedback",
            "additional_feedback"
          ]
        }
      },
      "required": ["feedback"]
    }

    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt,
            config=GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=response_schema
            )
        )
        
        #  The response *should* now be JSON, but let's still validate:
        try:
            json_response = json.loads(response.text)
            return jsonify(json_response)
        except json.JSONDecodeError:
            return jsonify({"error": "Invalid JSON response from the model", "raw_response": response.text}), 500


    except Exception as e:
        return jsonify({"error": f"Error during generation: {str(e)}", "raw_response": response.text}), 500
    
# ...existing code...

@app.route('/transcribe-mic', methods=['POST'])
def transcribe_mic():
    if 'audio' not in request.files:
        return jsonify({"error": "No audio file provided"}), 400
    
    audio_file = request.files['audio']
    if audio_file.filename == '':
        return jsonify({"error": "No audio file selected"}), 400
    
    # Read the audio bytes
    audio_bytes = audio_file.read()
    
    try:
        response = client.models.generate_content(
            model='gemini-2.0-flash',
            contents=["Transcribe this audio clip",
                    types.Part.from_bytes(
                        data=audio_bytes,
                        mime_type='audio/webm' # Common format for browser recordings
                    )
                    ]
        )
        
        return jsonify({"answer": response.text})
    except Exception as e:
        return jsonify({"error": f"Error during transcription: {str(e)}"}), 500

# ...existing code...
@app.route('/speech', methods=['POST'])
def speech():
    with open('audio1.mp3', 'rb') as f:
        image_bytes = f.read()

    response = client.models.generate_content(
        model='gemini-2.0-flash',
        contents=["Transcribe this audio clip",
                  types.Part.from_bytes(
                      data=image_bytes,
                      mime_type='audio/mp3'
                  )
                  ]
    )
    
    return jsonify({ "answer": response.text })
    

if __name__ == '__main__':
    app.run(debug=True)