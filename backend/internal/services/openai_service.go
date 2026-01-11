package services

import (
	"context"
	"fmt"

	"github.com/sashabaranov/go-openai"
)

type OpenAIService struct {
	client *openai.Client
	model  string
}

func NewOpenAIService(apiKey, model, baseURL string) *OpenAIService {
	var client *openai.Client

	if baseURL != "" {
		// Use custom base URL for OpenAI-compatible APIs
		config := openai.DefaultConfig(apiKey)
		config.BaseURL = baseURL
		client = openai.NewClientWithConfig(config)
	} else {
		// Use default OpenAI API
		client = openai.NewClient(apiKey)
	}

	return &OpenAIService{
		client: client,
		model:  model,
	}
}

func (s *OpenAIService) ExplainOpening(ctx context.Context, openingName, eco, pgn string) (string, error) {
	prompt := fmt.Sprintf(`You are a chess coach explaining an opening to an intermediate player.

Opening: %s (%s)
Moves: %s

Explain:
1. The main ideas and goals of this opening
2. Key piece placements to aim for
3. Typical pawn structures
4. Common plans for the middlegame
5. Important tactical motifs to watch for

Keep the explanation concise but informative (200-300 words).`, openingName, eco, pgn)

	resp, err := s.client.CreateChatCompletion(ctx, openai.ChatCompletionRequest{
		Model: s.model,
		Messages: []openai.ChatCompletionMessage{
			{Role: openai.ChatMessageRoleUser, Content: prompt},
		},
		MaxTokens: 500,
	})
	if err != nil {
		return "", err
	}

	if len(resp.Choices) == 0 {
		return "", fmt.Errorf("no response from OpenAI")
	}

	return resp.Choices[0].Message.Content, nil
}

func (s *OpenAIService) SuggestPlan(ctx context.Context, fen, openingName, playerColor string) (string, error) {
	prompt := fmt.Sprintf(`You are a chess coach. Given this position from the %s opening:

FEN: %s
You are playing as: %s

Suggest a concrete plan for the next 5-10 moves. Include:
1. What pieces to develop and where
2. Which pawn breaks to prepare
3. Where to place the king (castling direction)
4. What to watch out for from the opponent

Be specific and actionable (150-200 words).`, openingName, fen, playerColor)

	resp, err := s.client.CreateChatCompletion(ctx, openai.ChatCompletionRequest{
		Model: s.model,
		Messages: []openai.ChatCompletionMessage{
			{Role: openai.ChatMessageRoleUser, Content: prompt},
		},
		MaxTokens: 350,
	})
	if err != nil {
		return "", err
	}

	if len(resp.Choices) == 0 {
		return "", fmt.Errorf("no response from OpenAI")
	}

	return resp.Choices[0].Message.Content, nil
}

func (s *OpenAIService) AnalyzeMistake(ctx context.Context, fen, playedMove, bestMove string, centipawnLoss int) (string, error) {
	prompt := fmt.Sprintf(`You are a chess coach analyzing a mistake.

Position (FEN): %s
Move played: %s
Better move: %s
Centipawn loss: %d

Explain briefly (100-150 words):
1. Why the played move is problematic
2. What makes the better move superior
3. What the player should look for in similar positions`, fen, playedMove, bestMove, centipawnLoss)

	resp, err := s.client.CreateChatCompletion(ctx, openai.ChatCompletionRequest{
		Model: s.model,
		Messages: []openai.ChatCompletionMessage{
			{Role: openai.ChatMessageRoleUser, Content: prompt},
		},
		MaxTokens: 250,
	})
	if err != nil {
		return "", err
	}

	if len(resp.Choices) == 0 {
		return "", fmt.Errorf("no response from OpenAI")
	}

	return resp.Choices[0].Message.Content, nil
}
