package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type PracticeSession struct {
	ID           primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID       primitive.ObjectID `bson:"user_id" json:"user_id"`
	RepertoireID primitive.ObjectID `bson:"repertoire_id" json:"repertoire_id"`
	OpeningID    primitive.ObjectID `bson:"opening_id,omitempty" json:"opening_id,omitempty"`
	Mode         string             `bson:"mode" json:"mode"`   // "specific" | "random"
	Color        string             `bson:"color" json:"color"` // "white" | "black"
	StartedAt    time.Time          `bson:"started_at" json:"started_at"`
	EndedAt      *time.Time         `bson:"ended_at,omitempty" json:"ended_at,omitempty"`
	Moves        []PracticeMove     `bson:"moves" json:"moves"`
	Stats        PracticeStats      `bson:"stats" json:"stats"`
	Config       PracticeConfig     `bson:"config" json:"config"`
}

type PracticeMove struct {
	Ply          int    `bson:"ply" json:"ply"`
	FENBefore    string `bson:"fen_before" json:"fen_before"`
	FENAfter     string `bson:"fen_after" json:"fen_after"`
	UserMove     string `bson:"user_move" json:"user_move"`
	ExpectedMove string `bson:"expected_move,omitempty" json:"expected_move,omitempty"`
	Category     string `bson:"category" json:"category"` // book, best, good, inaccuracy, mistake, blunder
	EvalBefore   int    `bson:"eval_before" json:"eval_before"`
	EvalAfter    int    `bson:"eval_after" json:"eval_after"`
	CentipawnLoss int   `bson:"centipawn_loss" json:"centipawn_loss"`
}

type PracticeStats struct {
	TotalMoves         int     `bson:"total_moves" json:"total_moves"`
	BookMoves          int     `bson:"book_moves" json:"book_moves"`
	BestMoves          int     `bson:"best_moves" json:"best_moves"`
	GoodMoves          int     `bson:"good_moves" json:"good_moves"`
	Inaccuracies       int     `bson:"inaccuracies" json:"inaccuracies"`
	Mistakes           int     `bson:"mistakes" json:"mistakes"`
	Blunders           int     `bson:"blunders" json:"blunders"`
	AccuracyPercentage float64 `bson:"accuracy_percentage" json:"accuracy_percentage"`
}

type PracticeConfig struct {
	MaxMoves        int    `bson:"max_moves" json:"max_moves"`
	Difficulty      string `bson:"difficulty" json:"difficulty"`
	AllowVariations bool   `bson:"allow_variations" json:"allow_variations"`
}

type StartPracticeRequest struct {
	RepertoireID string          `json:"repertoire_id" binding:"required"`
	OpeningID    string          `json:"opening_id"` // optional, empty = random
	Mode         string          `json:"mode" binding:"required,oneof=specific random"`
	Config       *PracticeConfig `json:"config"` // optional, defaults applied server-side
}

type SubmitMoveRequest struct {
	FENBefore     string `json:"fen_before" binding:"required"`
	FENAfter      string `json:"fen_after" binding:"required"`
	UserMove      string `json:"user_move" binding:"required"`
	ExpectedMove  string `json:"expected_move"`
	Category      string `json:"category" binding:"required"`
	EvalBefore    int    `json:"eval_before"`
	EvalAfter     int    `json:"eval_after"`
	CentipawnLoss int    `json:"centipawn_loss"`
}
