from transformers import pipeline, AutoImageProcessor, SiglipForImageClassification
from PIL import Image
from flask import Flask, request, jsonify
from flask_cors import CORS
import io
import torch

app = Flask(__name__)
CORS(app)

model = pipeline("image-classification", model="gianlab/swin-tiny-patch4-window7-224-finetuned-parkinson-classification")

@app.route('/predict', methods=['POST'])
def predict():
    file = request.files['image']
    img = Image.open(io.BytesIO(file.read())).convert('RGB')
    result = model(img)
    top = result[0]
    # Return all labels/scores for the breakdown section in UI
    all_scores = {item['label']: round(item['score'] * 100, 1) for item in result}
    return jsonify({
        'result': top['label'], 
        'confidence': round(top['score'] * 100, 1),
        'all_scores': all_scores
    })

alzheimer_model = SiglipForImageClassification.from_pretrained("prithivMLmods/Alzheimer-Stage-Classifier")
alzheimer_processor = AutoImageProcessor.from_pretrained("prithivMLmods/Alzheimer-Stage-Classifier")

id2label = {
    "0": "Early Stage (Mild Cognitive Decline)",
    "1": "Middle Stage (Moderate Decline)",
    "2": "Cognitively Normal (Healthy)",
    "3": "Very Early Decline (Pre-Clinical)"
}

@app.route('/predict-alzheimer', methods=['POST'])
def predict_alzheimer():
    file = request.files['image']
    img = Image.open(io.BytesIO(file.read())).convert('RGB')
    inputs = alzheimer_processor(images=img, return_tensors="pt")
    with torch.no_grad():
        outputs = alzheimer_model(**inputs)
        probs = torch.nn.functional.softmax(outputs.logits, dim=1).squeeze().tolist()
    prediction = {id2label[str(i)]: round(probs[i] * 100, 1) for i in range(len(probs))}
    top_label = max(prediction, key=lambda k: prediction[k])
    top_confidence = prediction[top_label]
    return jsonify({'result': top_label, 'confidence': top_confidence, 'all_stages': prediction})

if __name__ == '__main__':
    app.run(debug=True)
