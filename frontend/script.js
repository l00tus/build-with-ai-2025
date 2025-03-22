document.addEventListener("DOMContentLoaded", function () {
  let timeLeft = 60;
  const timerDisplay = document.getElementById("timer");

  function updateTimer() {
    let minutes = Math.floor(timeLeft / 60);
    let seconds = timeLeft % 60;

    // Add leading zeros
    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;

    timerDisplay.textContent = minutes + ":" + seconds;
    timeLeft--;

    if (timeLeft < 0) {
      clearInterval(timerInterval);
      timerDisplay.textContent = "00:00"; // Or any other action
      // You can add code here to disable the submit button, etc.
    }
  }

  updateTimer(); // Initial display
  const timerInterval = setInterval(updateTimer, 1000); // Update every second

  fetch("data.json")
    .then((response) => response.json())
    .then((data) => {})
    .catch((error) =>
      console.error("Eroare la încărcarea întrebărilor:", error)
    );
});

document.getElementById("question-btn").addEventListener("click", function () {
  fetch("data.json")
    .then((response) => response.json())
    .then(
      (data) =>
        (document.getElementById("question").innerHTML =
          data[parseInt(Math.random() * data.length) + 1].question)
    );
});

document.getElementById("submit").addEventListener("click", function () {
    const userAnswer = document.getElementById("message").value;
    const currentQuestion = document.getElementById("question").innerHTML;

    console.log(userAnswer, currentQuestion);

    // Prepare the data for the POST request
    const data = {
      question: currentQuestion,
      answer: userAnswer,
    };

    // Make the POST request to the Flask backend
    fetch("http://127.0.0.1:5000/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((data) => {
        // Display the response from Gemini
        document.getElementById("responseGemini").innerHTML =
          "<b>Gemini Feedback:</b> " + data.feedback;
      })
      .catch((error) => {
        console.error("Error sending data to Gemini:", error);
        document.getElementById("responseGemini").innerHTML =
          "Error: Could not get feedback from Gemini.";
      });
  });