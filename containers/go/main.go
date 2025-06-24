package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"
)

type (
	RequestPayload struct {
		X int `json:"x"`
		Y int `json:"y"`
		Z int `json:"z"`
	}

	ResponsePayload struct {
		ExecutionTimeMs float64 `json:"executionTimeMs"`
		IsError       bool    `json:"isError"`
		Message       string  `json:"message"`
		Result        int     `json:"result"`
	}
)

func HelloHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Hello from Go!")
}

func takeuchiHandler(w http.ResponseWriter, r *http.Request) {
	var requestPayload RequestPayload
	if err := json.NewDecoder(r.Body).Decode(&requestPayload); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	const timeoutSec = 120
	ctx, cancel := context.WithTimeout(context.Background(), timeoutSec*time.Second)
	defer cancel()

	resultChan := make(chan ResponsePayload, 1)
	errorChan := make(chan error, 1)

	go func() {
		defer func() {
			if r := recover(); r != nil {
				errorChan <- fmt.Errorf("panic occurred: %v", r)
			}
		}()
		start := time.Now()
		result := takeuchi(requestPayload.X, requestPayload.Y, requestPayload.Z)
		executionTime := float64(time.Since(start).Nanoseconds()) / 1e6 // Convert to milliseconds
		resultChan <- ResponsePayload{
			ExecutionTimeMs: executionTime,
			IsError:       false,
			Message:       "Success",
			Result:        result,
		}
	}()

	select {
	case result := <-resultChan:
		json.NewEncoder(w).Encode(result)
	case err := <-errorChan:
		json.NewEncoder(w).Encode(ResponsePayload{
			ExecutionTimeMs: 0,
			IsError:       true,
			Message:       fmt.Sprintf("Error executing takeuchi function: %v", err),
		})
	case <-ctx.Done():
		json.NewEncoder(w).Encode(ResponsePayload{
			ExecutionTimeMs: float64(timeoutSec * 1000),
			IsError:       true,
			Message:       fmt.Sprintf("Takeuchi function execution timed out after %d seconds", timeoutSec),
		})
	}
}

func setupRoutes() {
	http.HandleFunc("GET /", HelloHandler)
	http.HandleFunc("POST /", takeuchiHandler)
}

func main() {
	setupRoutes()

	fmt.Println("Server starting on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
