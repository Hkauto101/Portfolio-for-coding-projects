# Hex Game with AI

A C++ implementation of the classic Hex board game featuring an intelligent AI opponent using Monte Carlo simulation. Play against a computer that evaluates thousands of possible game outcomes to make strategic moves.

## About Hex

Hex is a connection game where two players compete to form an unbroken chain of their pieces linking opposite sides of the board. Blue (X) tries to connect the left and right sides, while Red (O) tries to connect the top and bottom sides.

## Features

- **Interactive Gameplay**: Play against an AI opponent with console-based interface
- **Monte Carlo AI**: Computer uses simulation-based strategy to find optimal moves
- **Configurable Board Size**: Default 5x5 board (easily expandable to 11x11)
- **Smart Path Detection**: Efficient win condition checking using depth-first search
- **Player Choice**: Choose to play as Blue (first) or Red (second)

## Requirements

- **Compiler**: C++17 compatible compiler (GCC 8+, Clang 7+, or MSVC 2019+)
- **Platform**: Windows, macOS, or Linux
- **No external dependencies required**


## How to Play

1. Start the game and choose your color

y to play as Blue (X) and go first
n to play as Red (O) and go second


2. Make your move by entering coordinates

Enter row and column numbers (0-indexed)
Example: 2 3 places your piece at row 2, column 3


3. Win condition

Blue wins by connecting left and right sides
Red wins by connecting top and bottom sides



## Game Controls

1. Enter coordinates as row column (e.g., 1 2)
2. Invalid moves will prompt for re-entry
3. The board displays after each move
4. Game ends when someone forms a winning connection

## AI Strategy
The AI uses Monte Carlo simulation:

-Evaluates each possible move by running 1000 random game simulations
-Calculates win percentage for each potential move
-Selects the move with the highest win rate
-Provides challenging gameplay while remaining computationally efficient

## Customization

- Board Size: Change const int N = 5 to desired size (11 for tournament play)
- AI Strength: Modify const int TRIALS = 1000 to adjust simulation count
- Display: Customize the display() function for different visual styles

##Code Structure

1. Hex class: Main game logic and board management
2. getBestMove(): AI decision-making using Monte Carlo method
3. checkWin(): Win condition detection using DFS algorithm
4. simulateRandomGame(): Random game completion for AI evaluation

## License
This project is for educational and entertainment purposes.
RetryClaude can make mistakes. Please double-check responses.