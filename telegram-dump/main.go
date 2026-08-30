package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"time"
)

// -------------------------------------------------------------
// 1. CONFIGURATION (Put your Bot Token and Chat ID here)
// -------------------------------------------------------------
const (
	BotToken = "YOUR_TELEGRAM_BOT_TOKEN_HERE" // e.g. "7123456789:AAH..."
	ChatID   = "-1004302268775"               // Your Telegram channel / supergroup ID
	DBFile   = "media_db.json"
	Port     = "8080"
)

// MediaItem represents an uploaded file record
type MediaItem struct {
	FileID    string `json:"file_id"`
	FileName  string `json:"file_name"`
	MimeType  string `json:"mime_type"`
	Size      int64  `json:"size"`
	IsVideo   bool   `json:"is_video"`
	CreatedAt int64  `json:"created_at"`
}

type Database struct {
	sync.RWMutex
	Items []MediaItem `json:"items"`
}

var db = &Database{Items: make([]MediaItem, 0)}

// Load saved index on startup
func loadDB() {
	data, err := os.ReadFile(DBFile)
	if err == nil {
		json.Unmarshal(data, &db.Items)
	}
}

// Save index to JSON file
func saveDB() {
	db.RLock()
	defer db.RUnlock()
	data, _ := json.MarshalIndent(db.Items, "", "  ")
	os.WriteFile(DBFile, data, 0644)
}

// Enable CORS for frontend requests
func enableCORS(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
}

// -------------------------------------------------------------
// 2. TELEGRAM API STRUCTS
// -------------------------------------------------------------
type TelegramSendDocResponse struct {
	Ok     bool `json:"ok"`
	Result struct {
		Document struct {
			FileID   string `json:"file_id"`
			FileName string `json:"file_name"`
			MimeType string `json:"mime_type"`
			FileSize int64  `json:"file_size"`
		} `json:"document"`
	} `json:"result"`
	Description string `json:"description"`
}

type TelegramGetFileResponse struct {
	Ok     bool `json:"ok"`
	Result struct {
		FilePath string `json:"file_path"`
	} `json:"result"`
	Description string `json:"description"`
}

// -------------------------------------------------------------
// 3. HANDLERS
// -------------------------------------------------------------

// POST /upload -> Forwards file to Telegram & indexes it
func uploadHandler(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)
	if r.Method == http.MethodOptions {
		return
	}
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// 50MB max upload buffer
	err := r.ParseMultipartForm(50 << 20)
	if err != nil {
		http.Error(w, "File too large (max 50MB)", http.StatusBadRequest)
		return
	}

	file, header, err := r.FormFile("file")
	if err != nil {
		http.Error(w, "Invalid file payload", http.StatusBadRequest)
		return
	}
	defer file.Close()

	// Prepare multipart request to Telegram sendDocument
	bodyBuf := &bytes.Buffer{}
	writer := multipart.NewWriter(bodyBuf)
	part, err := writer.CreateFormFile("document", header.Filename)
	if err != nil {
		http.Error(w, "Failed to create form part", http.StatusInternalServerError)
		return
	}
	io.Copy(part, file)
	writer.WriteField("chat_id", ChatID)
	writer.Close()

	tgURL := fmt.Sprintf("https://api.telegram.org/bot%s/sendDocument", BotToken)
	req, err := http.NewRequest("POST", tgURL, bodyBuf)
	if err != nil {
		http.Error(w, "Failed to build request", http.StatusInternalServerError)
		return
	}
	req.Header.Set("Content-Type", writer.FormDataContentType())

	client := &http.Client{Timeout: 60 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		http.Error(w, "Telegram API connection error: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	var tgResp TelegramSendDocResponse
	if err := json.NewDecoder(resp.Body).Decode(&tgResp); err != nil || !tgResp.Ok {
		msg := tgResp.Description
		if msg == "" {
			msg = "Telegram upload failed"
		}
		http.Error(w, msg, http.StatusBadRequest)
		return
	}

	ext := strings.ToLower(filepath.Ext(header.Filename))
	isVideo := ext == ".mp4" || ext == ".webm" || ext == ".mov" || ext == ".m4v"

	item := MediaItem{
		FileID:    tgResp.Result.Document.FileID,
		FileName:  header.Filename,
		MimeType:  tgResp.Result.Document.MimeType,
		Size:      tgResp.Result.Document.FileSize,
		IsVideo:   isVideo,
		CreatedAt: time.Now().Unix(),
	}

	db.Lock()
	db.Items = append([]MediaItem{item}, db.Items...) // newest first
	db.Unlock()
	saveDB()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(item)
}

// GET /files -> Returns list of all uploaded media items
func listFilesHandler(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)
	if r.Method == http.MethodOptions {
		return
	}
	db.RLock()
	defer db.RUnlock()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(db.Items)
}

// GET /file/:id -> Streams raw file data directly from Telegram CDN to browser
func streamFileHandler(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)
	if r.Method == http.MethodOptions {
		return
	}

	fileID := strings.TrimPrefix(r.URL.Path, "/file/")
	if fileID == "" {
		http.Error(w, "Missing file ID", http.StatusBadRequest)
		return
	}

	// 1. Get temporary file_path from Telegram
	getInfoURL := fmt.Sprintf("https://api.telegram.org/bot%s/getFile?file_id=%s", BotToken, fileID)
	resp, err := http.Get(getInfoURL)
	if err != nil {
		http.Error(w, "Failed to resolve file info", http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	var pathResp TelegramGetFileResponse
	if err := json.NewDecoder(resp.Body).Decode(&pathResp); err != nil || !pathResp.Ok {
		http.Error(w, "File not found on Telegram", http.StatusNotFound)
		return
	}

	// 2. Stream content directly from Telegram CDN
	downloadURL := fmt.Sprintf("https://api.telegram.org/file/bot%s/%s", BotToken, pathResp.Result.FilePath)
	fileResp, err := http.Get(downloadURL)
	if err != nil {
		http.Error(w, "Failed to fetch file stream", http.StatusInternalServerError)
		return
	}
	defer fileResp.Body.Close()

	w.Header().Set("Content-Type", fileResp.Header.Get("Content-Type"))
	w.Header().Set("Content-Length", fileResp.Header.Get("Content-Length"))
	io.Copy(w, fileResp.Body)
}

func main() {
	loadDB()

	http.HandleFunc("/upload", uploadHandler)
	http.HandleFunc("/files", listFilesHandler)
	http.HandleFunc("/file/", streamFileHandler)

	fmt.Printf("🚀 Telegram Storage Server running at http://localhost:%s\n", Port)
	log.Fatal(http.ListenAndServe(":"+Port, nil))
}
