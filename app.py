from flask import Flask, request, jsonify, send_from_directory
import pandas as pd
import joblib
import os
from flask_cors import CORS  # Import CORS

# Inisialisasi Flask
app = Flask(__name__, static_folder='static', template_folder='templates')


# Menambahkan CORS setelah mendefinisikan app
CORS(app)

# Load model dan scaler
try:
    model_clf = joblib.load("model.pkl")
    scaler = joblib.load("scaler.pkl")
    le = joblib.load("label_encoder.pkl")
except Exception as e:
    print(f"[ERROR] Gagal memuat file: {e}")
    exit()

# Route untuk halaman utama
@app.route('/')
def index():
    return send_from_directory(app.template_folder, 'input_data.html')

# Route prediksi
@app.route('/predict', methods=["POST"])
def predict():
    data = request.get_json()
    
    features = ["N", "P", "K", "temperature", "humidity", "ph", "rainfall"]
    try:
        df_input = pd.DataFrame([data], columns=features)
        df_scaled = scaler.transform(df_input)

        prediction_class = model_clf.predict(df_scaled)[0]
        predicted_label = le.inverse_transform([prediction_class])[0]

        fertility_score = round((data["N"] * 0.4 + data["P"] * 0.3 + data["K"] * 0.3), 2)

        return jsonify({
            "predicted_crop": predicted_label,
            "fertility_score": fertility_score
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
