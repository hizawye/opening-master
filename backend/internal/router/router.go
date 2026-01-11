package router

import (
	"github.com/gin-gonic/gin"
	"github.com/nagara/openings-master/backend/internal/handlers"
	"github.com/nagara/openings-master/backend/internal/middleware"
	"github.com/nagara/openings-master/backend/internal/repository"
	"github.com/nagara/openings-master/backend/internal/services"
)

func Setup(authService *services.AuthService, openaiService *services.OpenAIService) *gin.Engine {
	r := gin.Default()

	// Middleware
	r.Use(middleware.CORSMiddleware())

	// Repositories
	userRepo := repository.NewUserRepository()
	repertoireRepo := repository.NewRepertoireRepository()
	practiceRepo := repository.NewPracticeRepository()

	// Handlers
	authHandler := handlers.NewAuthHandler(userRepo, authService)
	repertoireHandler := handlers.NewRepertoireHandler(repertoireRepo)
	practiceHandler := handlers.NewPracticeHandler(practiceRepo, repertoireRepo)
	teachingHandler := handlers.NewTeachingHandler(openaiService)

	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	// API routes
	api := r.Group("/api")
	{
		// Auth routes (public)
		auth := api.Group("/auth")
		{
			auth.POST("/register", authHandler.Register)
			auth.POST("/login", authHandler.Login)
			auth.POST("/refresh", authHandler.Refresh)
		}

		// Protected routes
		protected := api.Group("")
		protected.Use(middleware.AuthMiddleware(authService))
		{
			// User routes
			users := protected.Group("/users")
			{
				users.GET("/me", authHandler.GetMe)
			}

			// Repertoire routes
			repertoires := protected.Group("/repertoires")
			{
				repertoires.GET("", repertoireHandler.List)
				repertoires.POST("", repertoireHandler.Create)
				repertoires.GET("/:id", repertoireHandler.Get)
				repertoires.PUT("/:id", repertoireHandler.Update)
				repertoires.DELETE("/:id", repertoireHandler.Delete)
				repertoires.POST("/:id/openings", repertoireHandler.AddOpening)
				repertoires.PUT("/:id/openings/:openingId", repertoireHandler.UpdateOpening)
				repertoires.DELETE("/:id/openings/:openingId", repertoireHandler.DeleteOpening)
			}

			// Practice routes
			practice := protected.Group("/practice")
			{
				practice.POST("/start", practiceHandler.Start)
				practice.POST("/:sessionId/move", practiceHandler.SubmitMove)
				practice.POST("/:sessionId/end", practiceHandler.End)
				practice.GET("/history", practiceHandler.History)
				practice.GET("/:sessionId", practiceHandler.GetSession)
			}

			// Teaching routes
			teaching := protected.Group("/teaching")
			{
				teaching.POST("/explain-opening", teachingHandler.ExplainOpening)
				teaching.POST("/suggest-plan", teachingHandler.SuggestPlan)
				teaching.POST("/analyze-mistake", teachingHandler.AnalyzeMistake)
			}
		}
	}

	return r
}
