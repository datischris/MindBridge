import random
import json
import pickle
import numpy as np
import nltk
from nltk.stem import WordNetLemmatizer
from keras.models import load_model
import sys

lemmatizer = WordNetLemmatizer()
intents = json.loads(open('Intent.json').read())
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
    res = model.predict(np.array([bow]), verbose=0)[0]  
    error_threshold = 0.25
    results = [[i, r] for i, r in enumerate(res) if r > error_threshold]
    results.sort(key=lambda x: x[1], reverse=True)
    return_list = []
    for r in results:
        return_list.append({"intent": classes[r[0]], "probability": str(r[1])})
    return return_list

def get_response(intents_list, intents_json):
    tag = intents_list[0]['intent']  
    list_of_intents = intents_json['intents']
    for i in list_of_intents:
        intent_name = i.get('intent') or i.get('tag')
        if intent_name == tag:
            result = random.choice(i['responses'])
            return result
    return "I'm not sure how to respond to that."

if __name__ == "__main__":
    try:
        if "--message" in sys.argv:
            message_index = sys.argv.index("--message") + 1
            if message_index < len(sys.argv):
                message = sys.argv[message_index]
                ints = predict_class(message)
                res = get_response(ints, intents)
                print(res, end='')  # Print only the response
            else:
                print("Error: --message argument requires a message", file=sys.stderr)
                sys.exit(1)
    except Exception as e:
        print(str(e), file=sys.stderr)
        sys.exit(1)
