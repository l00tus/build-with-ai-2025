// Global variables for audio recording
let mediaRecorder;
let audioChunks = [];
let isRecording = false;

// Function to start recording - defined in global scope
function startRecording() {
    // Reset audio chunks
    audioChunks = [];
    isRecording = true;
    
    // Change button states
    document.getElementById('startRecordBtn').disabled = true;
    document.getElementById('stopRecordBtn').disabled = false;
    
    // Display recording indicator
    const recordingIndicator = document.getElementById('recordingIndicator');
    if (recordingIndicator) {
        recordingIndicator.style.display = 'block';
    }
    
    // Request microphone access
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            mediaRecorder = new MediaRecorder(stream);
            
            mediaRecorder.ondataavailable = (event) => {
                audioChunks.push(event.data);
            };
            
            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                sendAudioToServer(audioBlob);
                
                // Stop all tracks from the stream to release the microphone
                stream.getTracks().forEach(track => track.stop());
            };
            
            // Start recording
            mediaRecorder.start();
        })
        .catch(error => {
            console.error("Error accessing microphone:", error);
            alert("Error accessing microphone. Please ensure you have granted microphone permissions.");
            resetRecordingUI();
        });
}

// Function to stop recording - defined in global scope
function stopRecording() {
    if (mediaRecorder && isRecording) {
        isRecording = false;
        mediaRecorder.stop();
        resetRecordingUI();
    }
}

// Function to reset UI after recording - defined in global scope
function resetRecordingUI() {
    document.getElementById('startRecordBtn').disabled = false;
    document.getElementById('stopRecordBtn').disabled = true;
    
    const recordingIndicator = document.getElementById('recordingIndicator');
    if (recordingIndicator) {
        recordingIndicator.style.display = 'none';
    }
}

// Function to send audio to server - defined in global scope
function sendAudioToServer(audioBlob) {
    const formData = new FormData();
    formData.append('audio', audioBlob);
    
    // Show loading indicator
    const loadingIndicator = document.getElementById('loadingIndicator');
    if (loadingIndicator) {
        loadingIndicator.style.display = 'block';
    }
    
    fetch('http://127.0.0.1:5000/transcribe-mic', {  // Make sure to use the full URL
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            console.error("Transcription error:", data.error);
            alert("Error transcribing audio: " + data.error);
        } else {
            // Update the answer textarea with the transcribed text
            const answerTextarea = document.getElementById('message');  // Changed to 'message' based on your HTML
            if (answerTextarea) {
                answerTextarea.value = data.answer;
            }
        }
    })
    .catch(error => {
        console.error("Error sending audio to server:", error);
        alert("Error sending audio to server. Please try again.");
    })
    .finally(() => {
        // Hide loading indicator
        if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
        }
    });
}

document.addEventListener("DOMContentLoaded", function () {
  let timeLeft = 60;
  const timerDisplay = document.getElementById("timer");
  let timerInterval;
  let currentQuestion = "";
  const questionDisplay = document.getElementById("question");
  const submitButton = document.getElementById("submit");
  const submitSpeechButton = document.getElementById("submit-speech");
  
  // Add event listeners for recording buttons
  document.getElementById('startRecordBtn').addEventListener('click', startRecording);
  document.getElementById('stopRecordBtn').addEventListener('click', stopRecording);

  function updateTimer() {
    let minutes = Math.floor(timeLeft / 60);
    let seconds = timeLeft % 60;

    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;

    timerDisplay.textContent = minutes + ":" + seconds;
    timeLeft--;

    if (timeLeft < 0) {
      clearInterval(timerInterval);
      timerDisplay.textContent = "00:00";
      submitButton.disabled = true;
    }
  }

  function resetTimer() {
    clearInterval(timerInterval);
    timeLeft = 60;
    updateTimer();
    timerInterval = setInterval(updateTimer, 1000);
    submitButton.disabled = false;
  }

  function generateQuestion() {
    fetch("data.json")
      .then((response) => response.json())
      .then((data) => {
        const randomIndex = Math.floor(Math.random() * data.length);
        currentQuestion = data[randomIndex].question;
        questionDisplay.innerHTML = currentQuestion;

        //clear text boxes
        document.getElementById("message").value = "";
        document.getElementById("responseGemini").innerHTML = "";

        //reset timer
        resetTimer();
      })
      .catch((error) => {
        console.error("Error loading questions:", error);
        questionDisplay.innerHTML = "Error loading question.";
      });
  }

  function submitAnswer() {
    const userAnswer = document.getElementById("message").value;
    
    // Check if there's a question and answer before submitting
    if (!currentQuestion) {
      document.getElementById("responseGemini").innerHTML = "Error: Please generate a question first.";
      return;
    }
    
    if (!userAnswer || userAnswer.trim() === '') {
      document.getElementById("responseGemini").innerHTML = "Error: Please provide an answer before submitting.";
      return;
    }

    // Show loading indication
    document.getElementById("responseGemini").innerHTML = "Processing your answer...";

    const data = {
      question: currentQuestion,
      answer: userAnswer,
    };

    console.log("Sending data:", data); // Debug log

    fetch("http://127.0.0.1:5000/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then(response => {
        if (!response.ok) {
          return response.json().then(errorData => {
            throw new Error(`Server responded with ${response.status}: ${errorData.error || 'Unknown error'}`);
          });
        }
        return response.json();
      })
      .then(responseData => {
        console.log("Response data:", responseData); // Debug log
        
        // Check if the feedback object exists
        if (!responseData.feedback) {
          throw new Error("Response is missing the expected 'feedback' object");
        }
        
        // Extract the feedback object
        const feedback = responseData.feedback;

        // Format the feedback for display
        let feedbackText = "<b>Overall Assessment:</b><br> " + feedback.overall_assessment + "<br><br>";

        feedbackText += "<b>Strengths:</b><br>";
        feedback.strengths.forEach(strength => {
          feedbackText += "- " + strength + "<br>";
        });
        feedbackText += "<br>";

        feedbackText += "<b>Weaknesses:</b><br>";
        feedback.weaknesses.forEach(weakness => {
          feedbackText += "- " + weakness + "<br>";
        });
        feedbackText += "<br>";

        feedbackText += "<b>Actionable Feedback:</b><br>";
        feedback.actionable_feedback.forEach(actionable => {
          feedbackText += "- " + actionable + "<br>";
        });
        feedbackText += "<br>";

        feedbackText += "<b>Areas of Improvement:</b><br>";
        feedback.areas_of_improvement.forEach(areas_of_improvement => {
          feedbackText += "- " + areas_of_improvement + "<br>";
        });
        feedbackText += "<br>";

        feedbackText += "<b>Additional Feedback:</b><br>" + feedback.additional_feedback + "<br>";

        document.getElementById("responseGemini").innerHTML = feedbackText;
      })
      .catch((error) => {
        console.error("Error sending data to Gemini:", error);
        document.getElementById("responseGemini").innerHTML = "Error: " + error.message;
      });
  }

  function submitSpeech() {
    fetch("http://127.0.0.1:5000/speech", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((responseData) => {
        const speechText = responseData.answer;
  
        document.getElementById("message").value = speechText;
      })
      .catch((error) => {
        console.error("Error sending data to Gemini:", error);
        document.getElementById("message").value = "Error: Could not get feedback from Gemini.";
      });
  }

  // updateTimer();
  // timerInterval = setInterval(updateTimer, 1000);

  document.getElementById("question-btn").addEventListener("click", generateQuestion);
  submitButton.addEventListener("click", submitAnswer);
  submitSpeechButton.addEventListener("click", submitSpeech);
});