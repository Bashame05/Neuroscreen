# NeuroScreen: Precision Neurological Diagnostics & Screening

![NeuroScreen Banner](https://img.shields.io/badge/Clinical-Standard-00C9A7?style=for-the-badge)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white)
![PyTorch](https://img.shields.io/badge/PyTorch-EE4C2C?style=for-the-badge&logo=pytorch&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=A52A2A)

NeuroScreen is a high-fidelity clinical assessment platform designed to bridge the gap between interactive patient screening and advanced neurological diagnostics. By leveraging deep learning models and specialized kinetic/optical protocols, NeuroScreen provides early-stage detection and monitoring for major neurological conditions including Parkinson's, Alzheimer's, Multiple Sclerosis, and Epilepsy.

---

## 🔬 Clinical Screening Modules

### 🧠 Alzheimer's Stage Classification
Utilizes **Bayesian Probability Mapping** and computer vision to analyze structural biomarkers.
- **Stage Classification**: Differentiates between Pre-Clinical, Early, Middle, and Healthy baselines.
- **Pathological Variance**: Identifies hippocampal volume loss patterns and entorhinal cortex shifts.

### 🏃 Parkinson's Motor Assessment
Employs **Swin-Tiny Vision Transformers** to analyze spiral drawing kinetic stability.
- **Tremor Detection**: Identifies sub-millimeter oscillations and rigidity-correlated velocity shifts.
- **Spatial Motor Evaluation**: Maps pressure-velocity variance against established prodromal signatures.

### 🛡️ Multiple Sclerosis (MS) Multi-Modal Screening
A comprehensive protocol combining motor and optical thresholding.
- **Kinetic Velocity (Finger Tapping)**: Measures inter-hand kinetic ratios and dominant/non-dominant hand velocity.
- **Optical Thresholding**: Evaluates optical contrast sensitivity using calibrated visualization markers.

### ⚡ Epilepsy Cognitive & Reaction Profile
Integrates weighted clinical questionnaires with neurological response speed tests.
- **Response Latency**: Measures reaction time consistency to evaluate cognitive processing speed.
- **Risk Stratification**: Combines behavioral data with physiological response markers.

---

## 🚀 Key Features

- **High-Fidelity Clinical Reports**: 1:1 PDF exports mirroring the medical dashboard, featuring biometric profiling and actionable clinical prognosis.
- **Secure Biometric Profile**: HIPAA-compliant patient data management integrated with Firebase/Firestore.
- **Interactive Dashboards**: Real-time results visualization with color-coded risk stratification and historical progress tracking.
- **Edge AI Integration**: Direct integration with Hugging Face Transformer models for state-of-the-art diagnostic accuracy.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 19 (Vite)
- **Styling**: Advanced CSS3 (Glassmorphism & Medical Dark Mode)
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Reports**: `@react-pdf/renderer`

### Backend
- **Core**: Flask (Python 3.x)
- **Machine Learning**: PyTorch, Hugging Face Transformers
- **Models**:
  - `gianlab/swin-tiny-parkinson-classification`
  - `prithivMLmods/Alzheimer-Stage-Classifier`

### Infrastructure
- **Authentication**: Firebase Auth
- **Database**: Google Cloud Firestore
- **State Management**: React Context & Hooks

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- Firebase Account

### 1. Repository Setup
```bash
git clone https://github.com/Bashame05/Neuroscreen.git
cd Neuroscreen
```

### 2. Backend Configuration
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

### 3. Frontend Configuration
```bash
cd frontend
npm install
npm run dev
```

---

## 🏥 Medical Disclaimer

NeuroScreen is a diagnostic *screening* tool intended for clinical reference and research support. It is **not** a substitute for professional neurological evaluation. All structural and kinetic markers must be evaluated by a board-certified neurologist within the context of a comprehensive clinical history and physical examination.

---


---

**Developed for the next generation of neurological preventative care.**
*DeepMind Advanced Agentic Coding Project*
