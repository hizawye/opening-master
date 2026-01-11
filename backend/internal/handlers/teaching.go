package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/nagara/openings-master/backend/internal/services"
)

type TeachingHandler struct {
	openaiService *services.OpenAIService
}

func NewTeachingHandler(openaiService *services.OpenAIService) *TeachingHandler {
	return &TeachingHandler{
		openaiService: openaiService,
	}
}

type ExplainOpeningRequest struct {
	OpeningName string `json:"opening_name" binding:"required"`
	ECO         string `json:"eco"`
	PGN         string `json:"pgn"`
}

type SuggestPlanRequest struct {
	FEN         string `json:"fen" binding:"required"`
	OpeningName string `json:"opening_name"`
	PlayerColor string `json:"player_color" binding:"required,oneof=white black"`
}

type AnalyzeMistakeRequest struct {
	FEN           string `json:"fen" binding:"required"`
	PlayedMove    string `json:"played_move" binding:"required"`
	BestMove      string `json:"best_move" binding:"required"`
	CentipawnLoss int    `json:"centipawn_loss"`
}

func (h *TeachingHandler) ExplainOpening(c *gin.Context) {
	var req ExplainOpeningRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	explanation, err := h.openaiService.ExplainOpening(c.Request.Context(), req.OpeningName, req.ECO, req.PGN)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to generate explanation"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"explanation": explanation})
}

func (h *TeachingHandler) SuggestPlan(c *gin.Context) {
	var req SuggestPlanRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	plan, err := h.openaiService.SuggestPlan(c.Request.Context(), req.FEN, req.OpeningName, req.PlayerColor)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to generate plan"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"plan": plan})
}

func (h *TeachingHandler) AnalyzeMistake(c *gin.Context) {
	var req AnalyzeMistakeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	analysis, err := h.openaiService.AnalyzeMistake(c.Request.Context(), req.FEN, req.PlayedMove, req.BestMove, req.CentipawnLoss)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to analyze mistake"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"analysis": analysis})
}
