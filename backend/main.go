package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "log"
    "net/http"
    "os/exec"
    "strings"
)

type ChatMessage struct {
    Message string `json:"message"`
}

type ChatResponse struct {
    Response string `json:"response"`
}

func sendMessageToPython(message string) (string, error) {
    cmd := exec.Command("/Users/joe/mindbridge/path/to/venv/bin/python3", "chatbot.py", "--message", message)
    // cmd := exec.Command("python", "chatbot.py", "--message", message)

    var stdout, stderr bytes.Buffer
    cmd.Stdout = &stdout
    cmd.Stderr = &stderr
    err := cmd.Run()
    if err != nil {
        log.Printf("Python stderr: %s\n", stderr.String())
        return "", fmt.Errorf("python error: %s", err)
    }
    response := strings.TrimSpace(stdout.String())
    return response, nil
}


func messageHandler(w http.ResponseWriter, r *http.Request) {
    log.Println("Received request at /message")
    if r.Method != "POST" {
        http.Error(w, "Only POST requests are allowed", http.StatusMethodNotAllowed)
        return
    }

    var msg ChatMessage
    err := json.NewDecoder(r.Body).Decode(&msg)
    if err != nil {
        log.Printf("Error decoding request: %v", err)
        http.Error(w, err.Error(), http.StatusBadRequest)
        return
    }

    log.Printf("Decoded message: %v", msg.Message)
    response, err := sendMessageToPython(msg.Message)
    if err != nil {
        log.Printf("Error in sendMessageToPython: %v", err)
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    log.Printf("Response from Python: %s", response)
    chatResponse := ChatResponse{Response: response}
    if err = json.NewEncoder(w).Encode(chatResponse); err != nil {
        log.Printf("Error encoding JSON response: %v", err)
    }
}

func main() {
    http.HandleFunc("/message", messageHandler)
    fmt.Println("Server is running on port 8080")
    log.Fatal(http.ListenAndServe(":8080", nil))
}