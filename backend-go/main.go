package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"
)

// PortfolioItem represents a project or activity
type PortfolioItem struct {
	ID          int    `json:"id"`
	Title       string `json:"title"`
	Category    string `json:"category"`
	ImageURL    string `json:"imageUrl"`
	Description string `json:"description"`
}

// EnableCORS middleware
func enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		if r.Method == "OPTIONS" {
			return
		}
		next.ServeHTTP(w, r)
	})
}

func portfolioHandler(w http.ResponseWriter, r *http.Request) {
	// Simulated database data
	data := []PortfolioItem{
		{
			ID:          1,
			Title:       "Community Garden Project (Golang Powered)",
			Category:    "Environment",
			ImageURL:    "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?q=80&w=800&auto=format&fit=crop",
			Description: "Revitalizing the local park with community gardening. Delivered via high-performance Go API.",
		},
		{
			ID:          2,
			Title:       "Digital RT System Launch",
			Category:    "Technology",
			ImageURL:    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop",
			Description: "Implementing the new digital management system to streamline administrative tasks.",
		},
		{
			ID:          3,
			Title:       "Health Awareness Campaign",
			Category:    "Health",
			ImageURL:    "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=800&auto=format&fit=crop",
			Description: "Weekly health checkups for elderly residents and health education workshops.",
		},
		{
			ID:          4,
			Title:       "Youth Sports Week",
			Category:    "Sports",
			ImageURL:    "https://images.unsplash.com/photo-1526676037777-05a232554f77?q=80&w=800&auto=format&fit=crop",
			Description: "Annual sports competition for local youth to foster teamwork.",
		},
	}

	w.Header().Set("Content-Type", "application/json")
	// Simulate processing time
	time.Sleep(100 * time.Millisecond)
	json.NewEncoder(w).Encode(data)
}

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/api/portfolio", portfolioHandler)

	fmt.Println("PRISMA Go Backend running on port 8080...")
	log.Fatal(http.ListenAndServe(":8080", enableCORS(mux)))
}
