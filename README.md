# build-with-ai-2025

# Soft Skills Assessment Application

This project is a web application designed to help users practice and improve their soft skills for an interview.  It presents users with interview-style questions related to soft skills, allows them to answer, and then provides AI-powered feedback on their responses.

## Overview

The application consists of a frontend (HTML, CSS, JavaScript) for user interaction and a backend (Python with Flask) that uses the Gemini 2.0 Flash model to generate the assessment and provide feedback.

## Implemented Features

*   **Frontend (HTML, CSS, JavaScript):**
    *   User interface with a question area, answer textarea, and feedback display area.
    *   A button to generate a new soft skills question (using `data.json` as a source).
    *   A countdown timer, initialized to 60 seconds.  The timer counts down and displays "00:00" when it reaches zero.
    *   Submission of the user's answer to the backend (not yet fully implemented).
    *   Display of AI-generated feedback from the backend (not yet implemented).

*   **Backend (Python/Flask):**
    *   A Flask API endpoint `/analyze` that receives a question and answer from the frontend.
    *   Uses the `google-generative-ai` library to interact with the Gemini 2.0 Flash model.
    *   Formats a prompt for the Gemini model to analyze the candidate's answer and provide constructive feedback.
    *   Specifies a JSON schema for the expected response from the Gemini model.
    *   Handles potential errors during API calls and JSON parsing.
    *   Returns the Gemini model's response as a JSON object to the frontend.

## Technologies Used

*   **Frontend:**
    *   HTML
    *   CSS
    *   JavaScript
*   **Backend:**
    *   Python 3.x
    *   Flask
    *   `google-generative-ai` library