package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Repertoire struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID    primitive.ObjectID `bson:"user_id" json:"user_id"`
	Name      string             `bson:"name" json:"name"`
	Color     string             `bson:"color" json:"color"` // "white" | "black"
	Openings  []Opening          `bson:"openings" json:"openings"`
	CreatedAt time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt time.Time          `bson:"updated_at" json:"updated_at"`
}

type Opening struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Name        string             `bson:"name" json:"name"`
	ECO         string             `bson:"eco" json:"eco"`
	StartingFEN string             `bson:"starting_fen" json:"starting_fen"`
	Moves       []MoveNode         `bson:"moves" json:"moves"`
}

type MoveNode struct {
	FEN        string     `bson:"fen" json:"fen"`
	Move       string     `bson:"move" json:"move"`           // SAN notation
	UCI        string     `bson:"uci" json:"uci"`             // UCI notation
	Comment    string     `bson:"comment,omitempty" json:"comment,omitempty"`
	IsMainLine bool       `bson:"is_main_line" json:"is_main_line"`
	Children   []MoveNode `bson:"children,omitempty" json:"children,omitempty"`
}

type CreateRepertoireRequest struct {
	Name  string `json:"name" binding:"required"`
	Color string `json:"color" binding:"required,oneof=white black"`
}

type AddOpeningRequest struct {
	Name        string     `json:"name" binding:"required"`
	ECO         string     `json:"eco"`
	StartingFEN string     `json:"starting_fen"`
	Moves       []MoveNode `json:"moves"`
}
