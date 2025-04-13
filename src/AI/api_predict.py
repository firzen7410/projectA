from flask import Flask, request, jsonify
import tensorflow as tf
import numpy as np
from tensorflow.keras.preprocessing import image
import json
import os

app = Flask(__name__)

# ---------- 載入模型與類別 ----------
model_path = os.path.join(os.path.dirname(__file__), "food_classifier_modelv2.h5")
model = tf.keras.models.load_model(model_path)

class_names_path = "src/AI/class_names.json"
if os.path.exists(class_names_path):
    with open(class_names_path, "r", encoding="utf-8") as f:
        class_indices = json.load(f)
    class_names = [None] * len(class_indices)
    for name, idx in class_indices.items():
        class_names[idx] = name
else:
    class_names = [
        'caesar_salad', 'cheesecake', 'donuts', 'dumplings',
        'french_fries', 'fried_rice', 'pizza', 'ramen', 'steak', 'sushi'
    ]

img_size = (224, 224)

@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({'error': '未提供圖片'}), 400

    file = request.files['file']
    img = image.load_img(file, target_size=img_size)
    img_array = image.img_to_array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=0)

    predictions = model.predict(img_array, verbose=0)
    prob = float(np.max(predictions))
    predicted_index = int(np.argmax(predictions))
    predicted_class = class_names[predicted_index]

    return jsonify({
        "class": predicted_class,
        "confidence": round(prob * 100, 2)
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)  # 可用 Docker 或直接部署
