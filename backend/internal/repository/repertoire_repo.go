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

type RepertoireRepository struct {
	collection *mongo.Collection
}

func NewRepertoireRepository() *RepertoireRepository {
	return &RepertoireRepository{
		collection: database.GetCollection("repertoires"),
	}
}

func (r *RepertoireRepository) Create(ctx context.Context, repertoire *models.Repertoire) error {
	repertoire.ID = primitive.NewObjectID()
	repertoire.CreatedAt = time.Now()
	repertoire.UpdatedAt = time.Now()
	if repertoire.Openings == nil {
		repertoire.Openings = []models.Opening{}
	}

	_, err := r.collection.InsertOne(ctx, repertoire)
	return err
}

func (r *RepertoireRepository) FindByUserID(ctx context.Context, userID primitive.ObjectID) ([]models.Repertoire, error) {
	cursor, err := r.collection.Find(ctx, bson.M{"user_id": userID})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var repertoires []models.Repertoire
	if err := cursor.All(ctx, &repertoires); err != nil {
		return nil, err
	}

	if repertoires == nil {
		repertoires = []models.Repertoire{}
	}
	return repertoires, nil
}

func (r *RepertoireRepository) FindByID(ctx context.Context, id primitive.ObjectID) (*models.Repertoire, error) {
	var repertoire models.Repertoire
	err := r.collection.FindOne(ctx, bson.M{"_id": id}).Decode(&repertoire)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, nil
		}
		return nil, err
	}
	return &repertoire, nil
}

func (r *RepertoireRepository) FindByIDAndUserID(ctx context.Context, id, userID primitive.ObjectID) (*models.Repertoire, error) {
	var repertoire models.Repertoire
	err := r.collection.FindOne(ctx, bson.M{"_id": id, "user_id": userID}).Decode(&repertoire)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, nil
		}
		return nil, err
	}
	return &repertoire, nil
}

func (r *RepertoireRepository) Update(ctx context.Context, repertoire *models.Repertoire) error {
	repertoire.UpdatedAt = time.Now()
	_, err := r.collection.UpdateOne(
		ctx,
		bson.M{"_id": repertoire.ID},
		bson.M{"$set": repertoire},
	)
	return err
}

func (r *RepertoireRepository) Delete(ctx context.Context, id primitive.ObjectID) error {
	_, err := r.collection.DeleteOne(ctx, bson.M{"_id": id})
	return err
}

func (r *RepertoireRepository) AddOpening(ctx context.Context, repertoireID primitive.ObjectID, opening models.Opening) error {
	opening.ID = primitive.NewObjectID()
	_, err := r.collection.UpdateOne(
		ctx,
		bson.M{"_id": repertoireID},
		bson.M{
			"$push": bson.M{"openings": opening},
			"$set":  bson.M{"updated_at": time.Now()},
		},
	)
	return err
}

func (r *RepertoireRepository) UpdateOpening(ctx context.Context, repertoireID, openingID primitive.ObjectID, opening models.Opening) error {
	_, err := r.collection.UpdateOne(
		ctx,
		bson.M{"_id": repertoireID, "openings._id": openingID},
		bson.M{
			"$set": bson.M{
				"openings.$":  opening,
				"updated_at": time.Now(),
			},
		},
	)
	return err
}

func (r *RepertoireRepository) DeleteOpening(ctx context.Context, repertoireID, openingID primitive.ObjectID) error {
	_, err := r.collection.UpdateOne(
		ctx,
		bson.M{"_id": repertoireID},
		bson.M{
			"$pull": bson.M{"openings": bson.M{"_id": openingID}},
			"$set":  bson.M{"updated_at": time.Now()},
		},
	)
	return err
}

func (r *RepertoireRepository) CreateIndexes(ctx context.Context) error {
	_, err := r.collection.Indexes().CreateMany(ctx, []mongo.IndexModel{
		{Keys: bson.M{"user_id": 1}},
		{Keys: bson.D{{Key: "user_id", Value: 1}, {Key: "color", Value: 1}}},
	}, options.CreateIndexes())
	return err
}
