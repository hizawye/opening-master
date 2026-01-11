package handlers

import (
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/nagara/openings-master/backend/internal/models"
	"github.com/nagara/openings-master/backend/internal/repository"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type RepertoireHandler struct {
	repertoireRepo *repository.RepertoireRepository
}

func NewRepertoireHandler(repertoireRepo *repository.RepertoireRepository) *RepertoireHandler {
	return &RepertoireHandler{
		repertoireRepo: repertoireRepo,
	}
}

func (h *RepertoireHandler) List(c *gin.Context) {
	userID, err := getUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	ctx, cancel := context.WithTimeout(c.Request.Context(), 10*time.Second)
	defer cancel()

	repertoires, err := h.repertoireRepo.FindByUserID(ctx, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch repertoires"})
		return
	}

	c.JSON(http.StatusOK, repertoires)
}

func (h *RepertoireHandler) Create(c *gin.Context) {
	userID, err := getUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var req models.CreateRepertoireRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx, cancel := context.WithTimeout(c.Request.Context(), 10*time.Second)
	defer cancel()

	repertoire := &models.Repertoire{
		UserID: userID,
		Name:   req.Name,
		Color:  req.Color,
	}

	if err := h.repertoireRepo.Create(ctx, repertoire); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create repertoire"})
		return
	}

	c.JSON(http.StatusCreated, repertoire)
}

func (h *RepertoireHandler) Get(c *gin.Context) {
	userID, err := getUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	id, err := parseObjectID(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid repertoire ID"})
		return
	}

	ctx, cancel := context.WithTimeout(c.Request.Context(), 10*time.Second)
	defer cancel()

	repertoire, err := h.repertoireRepo.FindByIDAndUserID(ctx, id, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch repertoire"})
		return
	}
	if repertoire == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "repertoire not found"})
		return
	}

	c.JSON(http.StatusOK, repertoire)
}

func (h *RepertoireHandler) Update(c *gin.Context) {
	userID, err := getUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	id, err := parseObjectID(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid repertoire ID"})
		return
	}

	ctx, cancel := context.WithTimeout(c.Request.Context(), 10*time.Second)
	defer cancel()

	repertoire, err := h.repertoireRepo.FindByIDAndUserID(ctx, id, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch repertoire"})
		return
	}
	if repertoire == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "repertoire not found"})
		return
	}

	var req models.CreateRepertoireRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	repertoire.Name = req.Name
	repertoire.Color = req.Color

	if err := h.repertoireRepo.Update(ctx, repertoire); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update repertoire"})
		return
	}

	c.JSON(http.StatusOK, repertoire)
}

func (h *RepertoireHandler) Delete(c *gin.Context) {
	userID, err := getUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	id, err := parseObjectID(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid repertoire ID"})
		return
	}

	ctx, cancel := context.WithTimeout(c.Request.Context(), 10*time.Second)
	defer cancel()

	repertoire, err := h.repertoireRepo.FindByIDAndUserID(ctx, id, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch repertoire"})
		return
	}
	if repertoire == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "repertoire not found"})
		return
	}

	if err := h.repertoireRepo.Delete(ctx, id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete repertoire"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "repertoire deleted"})
}

func (h *RepertoireHandler) AddOpening(c *gin.Context) {
	userID, err := getUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	id, err := parseObjectID(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid repertoire ID"})
		return
	}

	ctx, cancel := context.WithTimeout(c.Request.Context(), 10*time.Second)
	defer cancel()

	repertoire, err := h.repertoireRepo.FindByIDAndUserID(ctx, id, userID)
	if err != nil || repertoire == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "repertoire not found"})
		return
	}

	var req models.AddOpeningRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	opening := models.Opening{
		Name:        req.Name,
		ECO:         req.ECO,
		StartingFEN: req.StartingFEN,
		Moves:       req.Moves,
	}

	if err := h.repertoireRepo.AddOpening(ctx, id, opening); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to add opening"})
		return
	}

	c.JSON(http.StatusCreated, opening)
}

func (h *RepertoireHandler) UpdateOpening(c *gin.Context) {
	userID, err := getUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	repertoireID, err := parseObjectID(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid repertoire ID"})
		return
	}

	openingID, err := parseObjectID(c.Param("openingId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid opening ID"})
		return
	}

	ctx, cancel := context.WithTimeout(c.Request.Context(), 10*time.Second)
	defer cancel()

	repertoire, err := h.repertoireRepo.FindByIDAndUserID(ctx, repertoireID, userID)
	if err != nil || repertoire == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "repertoire not found"})
		return
	}

	var req models.AddOpeningRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	opening := models.Opening{
		ID:          openingID,
		Name:        req.Name,
		ECO:         req.ECO,
		StartingFEN: req.StartingFEN,
		Moves:       req.Moves,
	}

	if err := h.repertoireRepo.UpdateOpening(ctx, repertoireID, openingID, opening); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update opening"})
		return
	}

	c.JSON(http.StatusOK, opening)
}

func (h *RepertoireHandler) DeleteOpening(c *gin.Context) {
	userID, err := getUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	repertoireID, err := parseObjectID(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid repertoire ID"})
		return
	}

	openingID, err := parseObjectID(c.Param("openingId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid opening ID"})
		return
	}

	ctx, cancel := context.WithTimeout(c.Request.Context(), 10*time.Second)
	defer cancel()

	repertoire, err := h.repertoireRepo.FindByIDAndUserID(ctx, repertoireID, userID)
	if err != nil || repertoire == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "repertoire not found"})
		return
	}

	if err := h.repertoireRepo.DeleteOpening(ctx, repertoireID, openingID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete opening"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "opening deleted"})
}

// Helper functions
func getUserID(c *gin.Context) (primitive.ObjectID, error) {
	userIDStr := c.GetString("userID")
	return parseObjectID(userIDStr)
}

func parseObjectID(id string) (primitive.ObjectID, error) {
	return primitive.ObjectIDFromHex(id)
}
