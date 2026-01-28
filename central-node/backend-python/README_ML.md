# Machine Learning & Chatbot Backend

## Overview
This backend now includes a Hybrid Machine Learning classifier (using Scikit-Learn) to determine user intent alongside the Generative AI response.

## algoritma yang digunakan 
1. **Naive Bayes (MultinomialNB)**: Probabilistic classification for baseline intent detection.
2. **Support Vector Machine (SVM)**: Robust linear classification for determining the specific user action (Admin, Finance, Report, Contact).
3. **Generative AI (LLM)**: Handles the natural language conversation and RAG (Retrieval Augmented Generation).
   * *Note: The LLM serves the sequence modeling role typically reserved for RNNs in older architectures.*

## Setup
1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
   (Make sure `scikit-learn` covers the SVM/Naive Bayes requirements)

2. Run the server:
   ```bash
   python main.py
   ```

## classification Logic
The logic is defined in `ml_utils.py`. You can extend the `TRAINING_DATA` list to improve the model's accuracy on new phrases.
