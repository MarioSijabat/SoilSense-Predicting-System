// DOM Elements
const form = document.getElementById("cropForm");
const predictedLabelElement = document.getElementById("predictedLabel");
const cropDescriptionElement = document.getElementById("cropDescription");
const fertilityScoreElement = document.getElementById("fertilityScore");
const fertilityCategoryElement = document.getElementById("fertilityCategory");
const resultSection = document.getElementById("result");
const cropImage = document.getElementById("predictedCropImage");
const scoreImage = document.getElementById("predictedScoreImage");
const infoPopupButton = document.getElementById("openInfoPopup");
const infoPopup = document.getElementById("infoPopup");
const closePopup = document.getElementById("closePopup");
const backButton = document.getElementById("backButton");
const infoButtonContainer = document.getElementById("infoButton");

const CROP_DESCRIPTIONS = {
  "Barley": "Barley is a cereal crop that is resistant to dry and cold conditions, ideal for growing in highland areas or regions with low to moderate rainfall, such as Northern Europe and the Himalayan mountains.",
  "Cotton": "Cotton is a fiber crop that produces fibers for textiles, suitable for tropical and subtropical areas with hot and dry climates, such as India and the United States.",
  "Groundnut": "Groundnut is a legume crop that produces protein-rich fruits, suitable for tropical and subtropical regions such as West Africa with rainfall between 500-1000 mm per year.",
  "Maize": "Maize is a staple food crop that produces seeds, suitable for tropical and subtropical regions such as Central America and Southeast Asia with rainfall between 500-800 mm.",
  "Millet": "Millet is a small drought-resistant grain, suitable for semi-arid regions like Sub-Saharan Africa with low rainfall.",
  "Rice": "Rice is a grain crop that produces rice, suitable for tropical regions like Southeast Asia with high rainfall or irrigation.",
  "Soybean": "Soybean is a protein-rich legume, suitable for tropical and subtropical regions such as Brazil and East Asia with rainfall between 600-1000 mm.",
  "Sugarcane": "Sugarcane is a tall crop that produces sugar, suitable for tropical regions such as Brazil and Indonesia with rainfall between 1500-2500 mm.",
  "Sunflower": "Sunflower produces seeds for oil, suitable for tropical and subtropical regions such as Eastern Europe with moderate rainfall.",
  "Wheat": "Wheat is a grain used for flour, suitable for cool to temperate regions such as Europe and North America with rainfall between 300-1000 mm."
};

const CROP_IMAGES = {
  "Wheat": "/static/assets/images/wheat.jpg",
  "Groundnut": "/static/assets/images/GroundNuts.jpeg",
  "Millet": "/static/assets/images/Millet.jpg",
  "Rice": "/static/assets/images/Rice.jpg",
  "Sugarcane": "/static/assets/images/sugarcane.png",
  "Cotton": "/static/assets/images/Cotton.jpg",
  "Sunflower": "/static/assets/images/sunFlower.jpeg",
  "Barley": "/static/assets/images/Barley.webp",
  "Maize": "/static/assets/images/Maize.png",
  "Soybean": "/static/assets/images/Soybean.jpg"
};

const FERTILITY_CATEGORIES = [
  {
    min: 0,
    max: 25.9,
    category: "Very Low Fertility, indicates extremely low nutrient levels (N, P, K), severely limiting crop growth and yield potential.",
    image: "/static/assets/images/very-low-fertility.png"
  },
  {
    min: 26.0,
    max: 60.0,
    category: "Low Fertility, indicates insufficient nutrient levels (N, P, K) to support robust crop growth, limiting yield potential.",
    image: "/static/assets/images/low-fertility.png"
  },
  {
    min: 60.1,
    max: 90.0,
    category: "Moderate Fertility, suggests adequate nutrient availability, supporting decent crop development but not optimal productivity.",
    image: "/static/assets/images/moderate-fertility.png"
  },
  {
    min: 90.1,
    max: 120.0,
    category: "High Fertility, reflects high nutrient levels, ideal for maximizing crop yield and supporting vigorous plant growth.",
    image: "/static/assets/images/high-fertility.png"
  },
  {
    min: 120.1,
    max: Infinity,
    category: "Very High Fertility, indicates extremely high nutrient levels, which can lead to excessive growth and potential nutrient imbalances.",
    image: "/static/assets/images/very-high-fertility.png"
  }
];

document.addEventListener("DOMContentLoaded", () => {
  infoPopupButton.addEventListener("click", showInfoPopup);
  closePopup.addEventListener("click", hideInfoPopup);
  infoPopup.addEventListener("click", handlePopupClick);
  form.addEventListener("submit", handleFormSubmit);
  window.addEventListener("scroll", handleScroll);
});

// Functions
function showInfoPopup() {
  infoPopup.classList.remove("hidden");
}

function hideInfoPopup() {
  infoPopup.classList.add("hidden");
}

function handlePopupClick(e) {
  if (e.target === infoPopup) {
    hideInfoPopup();
  }
}

async function handleFormSubmit(e) {
  e.preventDefault();
  
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());
  
  for (let key in data) {
    data[key] = parseFloat(data[key]);
    if (isNaN(data[key])) {
      alert(`Please enter a valid number for ${key}`);
      return;
    }
  }

  try {
    const response = await fetch("/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.error) {
      throw new Error(result.error);
    }

    updateUIWithResults(result);
  } catch (error) {
    console.error("Error:", error);
    alert(`Failed to get prediction: ${error.message}`);
  }
}

function updateUIWithResults(result) {
  predictedLabelElement.textContent = result.predicted_crop;
  fertilityScoreElement.textContent = result.fertility_score;

  const fertilityInfo = getFertilityInfo(result.fertility_score);
  fertilityCategoryElement.textContent = fertilityInfo.category;
  scoreImage.src = fertilityInfo.image;

  cropDescriptionElement.textContent = CROP_DESCRIPTIONS[result.predicted_crop] || "Description not available.";
  cropImage.src = CROP_IMAGES[result.predicted_crop] || "/static/assets/images/crop.png";

  resultSection.classList.remove("hidden");
  resultSection.scrollIntoView({ behavior: "smooth" });
}

function getFertilityInfo(score) {
  return FERTILITY_CATEGORIES.find(category => 
    score >= category.min && score <= category.max
  ) || {
    category: "Unknown fertility level",
    image: "/static/assets/icons/fertilizer.png"
  };
}

function handleScroll() {
  const opacity = 1 - window.scrollY / 500;
  const newOpacity = Math.max(opacity, 0);
  backButton.style.opacity = newOpacity;
  infoButtonContainer.style.opacity = newOpacity;
}