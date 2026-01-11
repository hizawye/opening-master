package repository

import (
	"context"
	"errors"
	"time"

	"github.com/nagara/openings-master/backend/internal/models"
	"github.com/nagara/openings-master/backend/pkg/database"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type PracticeRepository struct {
	collection *mongo.Collection
}

func NewPracticeRepository() *PracticeRepository {
	return &PracticeRepository{
		collection: database.GetCollection("practice_sessions"),
	}
}

func (r *PracticeRepository) Create(ctx context.Context, session *models.PracticeSession) error {
	session.ID = primitive.NewObjectID()
	session.StartedAt = time.Now()
	session.Moves = []models.PracticeMove{}
	session.Stats = models.PracticeStats{}

	_, err := r.collection.InsertOne(ctx, session)
	return err
}

func (r *PracticeRepository) FindByID(ctx context.Context, id primitive.ObjectID) (*models.PracticeSession, error) {
	var session models.PracticeSession
	err := r.collection.FindOne(ctx, bson.M{"_id": id}).Decode(&session)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, nil
		}
		return nil, err
	}
	return &session, nil
}

func (r *PracticeRepository) FindByIDAndUserID(ctx context.Context, id, userID primitive.ObjectID) (*models.PracticeSession, error) {
	var session models.PracticeSession
	err := r.collection.FindOne(ctx, bson.M{"_id": id, "user_id": userID}).Decode(&session)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, nil
		}
		return nil, err
	}
	return &session, nil
}

func (r *PracticeRepository) FindByUserID(ctx context.Context, userID primitive.ObjectID, limit int) ([]models.PracticeSession, error) {
	opts := options.Find().
		SetSort(bson.M{"started_at": -1}).
		SetLimit(int64(limit))

	cursor, err := r.collection.Find(ctx, bson.M{"user_id": userID}, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var sessions []models.PracticeSession
	if err := cursor.All(ctx, &sessions); err != nil {
		return nil, err
	}

	if sessions == nil {
		sessions = []models.PracticeSession{}
	}
	return sessions, nil
}

func (r *PracticeRepository) AddMove(ctx context.Context, sessionID primitive.ObjectID, move models.PracticeMove) error {
	_, err := r.collection.UpdateOne(
		ctx,
		bson.M{"_id": sessionID},
		bson.M{"$push": bson.M{"moves": move}},
	)
	return err
}

func (r *PracticeRepository) EndSession(ctx context.Context, sessionID primitive.ObjectID, stats models.PracticeStats) error {
	now := time.Now()
	_, err := r.collection.UpdateOne(
		ctx,
		bson.M{"_id": sessionID},
		bson.M{"$set": bson.M{
			"ended_at": now,
			"stats":    stats,
		}},
	)
	return err
}

func (r *PracticeRepository) CreateIndexes(ctx context.Context) error {
	_, err := r.collection.Indexes().CreateMany(ctx, []mongo.IndexModel{
		{Keys: bson.D{{Key: "user_id", Value: 1}, {Key: "started_at", Value: -1}}},
		{Keys: bson.D{{Key: "user_id", Value: 1}, {Key: "repertoire_id", Value: 1}}},
	}, options.CreateIndexes())
	return err
}
