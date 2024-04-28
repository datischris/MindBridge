import csv
import json
import unicodedata
import nltk
import pandas as pd

# Read the CSV file into a DataFrame
df = pd.read_csv("datasets/chat-train-1.csv")

intents = json.loads(open('datasets/Intent.json').read())

# words is for tokenized patterns or context
# classes is for intent name or tag
# documents is for [context, tag]
words = []
classes = []
documents = []
ignore_letters = ["?", "!", ".", ","]

for intent in intents["intents"]:
    patterns = intent.get("patterns", intent.get("text", []))
    intent_name = intent.get("tag", intent.get("intent", ""))

    for pattern in patterns:
        word_list = nltk.word_tokenize(pattern)
        words.extend(word_list)
        documents.append((word_list, intent_name))
        if intent_name not in classes:
            classes.append(intent_name)

print(words)
print(documents)
print(classes)
with open('datasets/chat-train-1.csv','r', encoding='utf-8', errors='ignore') as file:
    reader = csv.reader(file)
    next(reader)
    for row in reader:
        # Access the first column of the current row
        context = row[0]
        contextwords = context.split()
        for word in contextwords:
            if word in classes:
                words.append(unicodedata.normalize("NFKD", row[1]))
#print(words)