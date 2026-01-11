package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Port            string
	MongoDBURI      string
	MongoDBDatabase string
	JWTSecret       string
	OpenAIAPIKey    string
	OpenAIModel     string
	OpenAIBaseURL   string
}

var AppConfig *Config

func Load() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	AppConfig = &Config{
		Port:            getEnv("PORT", "8080"),
		MongoDBURI:      getEnv("MONGODB_URI", "mongodb://localhost:27017"),
		MongoDBDatabase: getEnv("MONGODB_DATABASE", "chess_trainer"),
		JWTSecret:       getEnv("JWT_SECRET", "change-me-in-production-min-32-chars"),
		OpenAIAPIKey:    getEnv("OPENAI_API_KEY", ""),
		OpenAIModel:     getEnv("OPENAI_MODEL", "gemini-3-pro-high"),
		OpenAIBaseURL:   getEnv("OPENAI_BASE_URL", ""),
	}
}

func getEnv(key, defaultValue string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultValue
}
