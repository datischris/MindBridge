import random
import json
import pickle
import numpy as np
import nltk
from nltk.stem import WordNetLemmatizer
from keras.models import load_model

import queue
import re
import sys
from google.cloud import speech
import pyaudio
import os
RATE = 16000
CHUNK = int(RATE / 10)



lemmatizer = WordNetLemmatizer()
intents=json.loads(open('Intent.json').read())

words = pickle.load(open("words.pkl", "rb"))
classes = pickle.load(open("classes.pkl", "rb"))
model = load_model("chatbot_model.keras")


def clean_up_sentence(sentence):
    sentence_words = nltk.word_tokenize(sentence) 
    sentence_words = [lemmatizer.lemmatize(word.lower()) for word in sentence_words if word not in ["?", "!", ".", ","]]
    return sentence_words

def bag_of_words(sentence):
    sentence_words = clean_up_sentence(sentence)
    bag = [0] * len(words)
    for w in sentence_words:
        for i, word in enumerate(words):
            if word == w:
                bag[i] = 1
    return np.array(bag)


def predict_class(sentence):
    bow = bag_of_words(sentence)
    res = model.predict(np.array([bow]))[0]
    error_threshold = 0.25
    results = [[i,r] for i,r in enumerate(res) if r > error_threshold]

    results.sort(key=lambda x: x[1], reverse=True)
    return_list = []
    for r in results:
        return_list.append({"intent": classes[r[0]], "probability": str(r[1])})
    return return_list

def get_response(intents_list, intents_json):
    tag = intents_list[0]['intent']  # The intent of the first (highest probability) prediction
    list_of_intents = intents_json['intents']
    for i in list_of_intents:
        # Check both 'intent' and 'tag' keys for compatibility
        intent_name = i.get('intent') or i.get('tag')
        if intent_name == tag:
            result = random.choice(i['responses'])
            return result
    return "I'm not sure how to respond to that."

def evaluate_chatbot(test_set):
    correct_predictions = 0
    total_predictions = len(test_set["tests"])

    for test in test_set["tests"]:
        input_text = test["input"]
        expected_intent = test["expected_intent"]
        predicted_intents = predict_class(input_text)
        
        if not predicted_intents:
            print(f"No prediction for: {input_text}")
            continue

        predicted_intent = predicted_intents[0]["intent"]
        print(f"Input: {input_text}, Expected: {expected_intent}, Predicted: {predicted_intent}")
        
        if predicted_intent == expected_intent:
            correct_predictions += 1
    
    accuracy = (correct_predictions / total_predictions) * 100
    print(f"Accuracy: {accuracy:.2f}%")

test_set = json.loads(open('test.json').read())

evaluate_chatbot(test_set)


print("Chatbot is running! Type 'quit' to exit.")

while True:
    message = input("")
    if message == "quit":
        break

    ints = predict_class(message)
    res = get_response(ints, intents)
    print(res)