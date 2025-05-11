import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from imblearn.over_sampling import SMOTE
from sklearn.tree import DecisionTreeClassifier
from sklearn.linear_model import LinearRegression  # Import Linear Regression
import joblib

# Load dataset
data = pd.read_csv("data_core.csv")

# Fitur dan target untuk klasifikasi
features = ["N", "P", "K", "temperature", "humidity", "ph", "rainfall"]
X = data[features]
y = data["label"]

# Encode label untuk klasifikasi
le = LabelEncoder()
y_encoded = le.fit_transform(y)

# Split data untuk klasifikasi
X_train, X_test, y_train, y_test = train_test_split(X, y_encoded, test_size=0.2, random_state=42)

# Scaling fitur untuk klasifikasi
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# Oversampling untuk mengatasi ketidakseimbangan kelas
smote = SMOTE(random_state=42)
X_res, y_res = smote.fit_resample(X_train_scaled, y_train)

# Model Decision Tree untuk klasifikasi
model_classifier = DecisionTreeClassifier(random_state=42)
model_classifier.fit(X_res, y_res)

# Model Linear Regression untuk regresi (misalnya untuk memprediksi skor kesuburan)
y_regression = data["fertility_score"]  # Asumsikan 'fertility_score' adalah target regresi
X_train_reg, X_test_reg, y_train_reg, y_test_reg = train_test_split(X, y_regression, test_size=0.2, random_state=42)

# Scaling fitur untuk regresi
X_train_scaled_reg = scaler.fit_transform(X_train_reg)
X_test_scaled_reg = scaler.transform(X_test_reg)

# Model Linear Regression
model_regressor = LinearRegression()
model_regressor.fit(X_train_scaled_reg, y_train_reg)

# Simpan model dan komponen
joblib.dump(model_classifier, "model_classifier.pkl")
joblib.dump(model_regressor, "model_regressor.pkl")
joblib.dump(scaler, "scaler.pkl")
joblib.dump(le, "label_encoder.pkl")

# Evaluasi model klasifikasi
acc = model_classifier.score(X_test_scaled, y_test)
print(f"[INFO] Akurasi model klasifikasi: {acc:.2%}")

# Evaluasi model regresi
regression_score = model_regressor.score(X_test_scaled_reg, y_test_reg)
print(f"[INFO] Akurasi model regresi: {regression_score:.2%}")
