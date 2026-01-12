package handlers

import (
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/nagara/openings-master/backend/internal/models"
	"github.com/nagara/openings-master/backend/internal/repository"
)

type PracticeHandler struct {
	practiceRepo   *repository.PracticeRepository
	repertoireRepo *repository.RepertoireRepository
}

func NewPracticeHandler(practiceRepo *repository.PracticeRepository, repertoireRepo *repository.RepertoireRepository) *PracticeHandler {
	return &PracticeHandler{
		practiceRepo:   practiceRepo,
		repertoireRepo: repertoireRepo,
	}
}

func (h *PracticeHandler) Start(c *gin.Context) {
	userID, err := getUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var req models.StartPracticeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx, cancel := context.WithTimeout(c.Request.Context(), 10*time.Second)
	defer cancel()

	repertoireID, err := parseObjectID(req.RepertoireID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid repertoire ID"})
		return
	}

	repertoire, err := h.repertoireRepo.FindByIDAndUserID(ctx, repertoireID, userID)
	if err != nil || repertoire == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "repertoire not found"})
		return
	}

	// Apply defaults to config if not provided
	config := req.Config
	if config == nil {
		config = &models.PracticeConfig{
			MaxMoves:        30,
			Difficulty:      "flexible",
			AllowVariations: false,
		}
	}

	session := &models.PracticeSession{
		UserID:       userID,
		RepertoireID: repertoireID,
		Mode:         req.Mode,
		Color:        repertoire.Color,
		Config:       *config,
	}

	if req.OpeningID != "" {
		openingID, err := parseObjectID(req.OpeningID)
		if err == nil {
			session.OpeningID = openingID
		}
	}

	if err := h.practiceRepo.Create(ctx, session); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to start session"})
		return
	}

	c.JSON(http.StatusCreated, session)
}

func (h *PracticeHandler) SubmitMove(c *gin.Context) {
	userID, err := getUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	sessionID, err := parseObjectID(c.Param("sessionId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid session ID"})
		return
	}

	ctx, cancel := context.WithTimeout(c.Request.Context(), 10*time.Second)
	defer cancel()

	session, err := h.practiceRepo.FindByIDAndUserID(ctx, sessionID, userID)
	if err != nil || session == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "session not found"})
		return
	}

	if session.EndedAt != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "session already ended"})
		return
	}

	var req models.SubmitMoveRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	move := models.PracticeMove{
		Ply:           len(session.Moves) + 1,
		FENBefore:     req.FENBefore,
		FENAfter:      req.FENAfter,
		UserMove:      req.UserMove,
		ExpectedMove:  req.ExpectedMove,
		Category:      req.Category,
		EvalBefore:    req.EvalBefore,
		EvalAfter:     req.EvalAfter,
		CentipawnLoss: req.CentipawnLoss,
	}

	if err := h.practiceRepo.AddMove(ctx, sessionID, move); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to record move"})
		return
	}

	c.JSON(http.StatusOK, move)
}

func (h *PracticeHandler) End(c *gin.Context) {
	userID, err := getUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	sessionID, err := parseObjectID(c.Param("sessionId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid session ID"})
		return
	}

	ctx, cancel := context.WithTimeout(c.Request.Context(), 10*time.Second)
	defer cancel()

	session, err := h.practiceRepo.FindByIDAndUserID(ctx, sessionID, userID)
	if err != nil || session == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "session not found"})
		return
	}

	// Calculate stats
	stats := calculateStats(session.Moves)

	if err := h.practiceRepo.EndSession(ctx, sessionID, stats); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to end session"})
		return
	}

	session.Stats = stats
	now := time.Now()
	session.EndedAt = &now

	c.JSON(http.StatusOK, session)
}

func (h *PracticeHandler) History(c *gin.Context) {
	userID, err := getUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	ctx, cancel := context.WithTimeout(c.Request.Context(), 10*time.Second)
	defer cancel()

	sessions, err := h.practiceRepo.FindByUserID(ctx, userID, 50)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch history"})
		return
	}

	c.JSON(http.StatusOK, sessions)
}

func (h *PracticeHandler) GetSession(c *gin.Context) {
	userID, err := getUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	sessionID, err := parseObjectID(c.Param("sessionId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid session ID"})
		return
	}

	ctx, cancel := context.WithTimeout(c.Request.Context(), 10*time.Second)
	defer cancel()

	session, err := h.practiceRepo.FindByIDAndUserID(ctx, sessionID, userID)
	if err != nil || session == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "session not found"})
		return
	}

	c.JSON(http.StatusOK, session)
}

func calculateStats(moves []models.PracticeMove) models.PracticeStats {
	stats := models.PracticeStats{
		TotalMoves: len(moves),
	}

	for _, move := range moves {
		switch move.Category {
		case "repertoire":
			stats.BookMoves++ // Correct moves (using BookMoves field for backwards compatibility)
		case "mistake":
			stats.Mistakes++
		// Legacy categories for backwards compatibility
		case "book":
			stats.BookMoves++
		case "best":
			stats.BestMoves++
		case "good":
			stats.GoodMoves++
		case "inaccuracy":
			stats.Inaccuracies++
		case "blunder":
			stats.Blunders++
		}
	}

	if stats.TotalMoves > 0 {
		correctMoves := stats.BookMoves + stats.BestMoves + stats.GoodMoves
		stats.AccuracyPercentage = float64(correctMoves) / float64(stats.TotalMoves) * 100
	}

	return stats
}
