document.addEventListener("DOMContentLoaded", function () {
  let timeLeft = 60;
  const timerDisplay = document.getElementById("timer");
  let timerInterval;
  let currentQuestion = "";
  const questionDisplay = document.getElementById("question");
  const submitButton = document.getElementById("submit");
  const submitSpeechButton = document.getElementById("submit-speech");

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

    const data = {
      question: currentQuestion,
      answer: userAnswer,
    };

    fetch("http://127.0.0.1:5000/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((responseData) => {
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
        document.getElementById("responseGemini").innerHTML = "Error: Could not get feedback from Gemini.";
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