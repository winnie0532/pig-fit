const DEFAULT_WEIGHT = 55;

let pigWeight =
  Number(localStorage.getItem("pigWeight")) || DEFAULT_WEIGHT;

const pigWeightElement = document.getElementById("pigWeight");
const exerciseButton = document.getElementById("exerciseButton");

function updateUI() {
  pigWeightElement.textContent = pigWeight.toFixed(1);
}

function saveData() {
  localStorage.setItem("pigWeight", pigWeight);
}

exerciseButton.addEventListener("click", () => {
  pigWeight -= 0.5;

  saveData();
  updateUI();
});

updateUI();