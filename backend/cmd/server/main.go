package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/nagara/openings-master/backend/internal/config"
	"github.com/nagara/openings-master/backend/internal/repository"
	"github.com/nagara/openings-master/backend/internal/router"
	"github.com/nagara/openings-master/backend/internal/services"
	"github.com/nagara/openings-master/backend/pkg/database"
)

func main() {
	// Load configuration
	config.Load()

	// Connect to MongoDB
	if err := database.Connect(config.AppConfig.MongoDBURI, config.AppConfig.MongoDBDatabase); err != nil {
		log.Fatalf("Failed to connect to MongoDB: %v", err)
	}
	defer database.Disconnect()

	// Create indexes
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	userRepo := repository.NewUserRepository()
	if err := userRepo.CreateIndexes(ctx); err != nil {
		log.Printf("Warning: Failed to create user indexes: %v", err)
	}

	repertoireRepo := repository.NewRepertoireRepository()
	if err := repertoireRepo.CreateIndexes(ctx); err != nil {
		log.Printf("Warning: Failed to create repertoire indexes: %v", err)
	}

	practiceRepo := repository.NewPracticeRepository()
	if err := practiceRepo.CreateIndexes(ctx); err != nil {
		log.Printf("Warning: Failed to create practice indexes: %v", err)
	}

	// Initialize services
	authService := services.NewAuthService(config.AppConfig.JWTSecret)
	openaiService := services.NewOpenAIService(config.AppConfig.OpenAIAPIKey, config.AppConfig.OpenAIModel, config.AppConfig.OpenAIBaseURL)

	// Setup router
	r := router.Setup(authService, openaiService)

	// Start server
	port := config.AppConfig.Port
	log.Printf("Starting server on port %s", port)

	// Graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		if err := r.Run(":" + port); err != nil {
			log.Fatalf("Failed to start server: %v", err)
		}
	}()

	<-quit
	log.Println("Shutting down server...")
}
