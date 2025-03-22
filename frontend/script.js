document.addEventListener('DOMContentLoaded', function() {
    let timeLeft = 60;
    const timerDisplay = document.getElementById('timer');

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
});