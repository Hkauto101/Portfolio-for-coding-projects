#include <iostream>
#include <vector>
#include <random>
#include <ctime>
#include <algorithm>

using namespace std;

const int N = 5; // change to 11 for the full assignment
const int TRIALS = 1000;
enum Player { EMPTY = '.', BLUE = 'X', RED = 'O' };

struct Hex {
    vector<vector<char>> board;
    bool blueTurn;

    Hex() : board(N, vector<char>(N, EMPTY)), blueTurn(true) {}

    void display() {
        for (int i = 0; i < N; ++i) {
            cout << string(i, ' ');
            for (int j = 0; j < N; ++j)
                cout << board[i][j] << ' ';
            cout << endl;
        }
    }

    bool isValidMove(int i, int j) {
        return i >= 0 && i < N && j >= 0 && j < N && board[i][j] == EMPTY;
    }

    void makeMove(int i, int j, char player) {
        board[i][j] = player;
    }

    vector<pair<int, int>> getEmptyCells() {
        vector<pair<int, int>> moves;
        for (int i = 0; i < N; ++i)
            for (int j = 0; j < N; ++j)
                if (board[i][j] == EMPTY)
                    moves.emplace_back(i, j);
        return moves;
    }

    bool inBounds(int i, int j) {
        return i >= 0 && j >= 0 && i < N && j < N;
    }

    vector<pair<int, int>> neighbors(int i, int j) {
        vector<pair<int, int>> dirs = {{-1,0},{-1,1},{0,-1},{0,1},{1,-1},{1,0}};
        vector<pair<int, int>> result;
        for (auto [di, dj] : dirs) {
            int ni = i + di, nj = j + dj;
            if (inBounds(ni, nj))
                result.emplace_back(ni, nj);
        }
        return result;
    }

    bool dfs(int i, int j, char player, vector<vector<bool>>& visited, bool& goal) {
        if (visited[i][j] || board[i][j] != player) return false;
        visited[i][j] = true;
        if ((player == BLUE && j == N - 1) || (player == RED && i == N - 1)) {
            goal = true;
            return true;
        }
        for (auto [ni, nj] : neighbors(i, j))
            dfs(ni, nj, player, visited, goal);
        return goal;
    }

    bool checkWin(char player) {
        vector<vector<bool>> visited(N, vector<bool>(N, false));
        bool won = false;
        if (player == BLUE) {
            for (int i = 0; i < N; ++i)
                if (board[i][0] == BLUE)
                    dfs(i, 0, BLUE, visited, won);
        } else {
            for (int j = 0; j < N; ++j)
                if (board[0][j] == RED)
                    dfs(0, j, RED, visited, won);
        }
        return won;
    }

    char simulateRandomGame(int x, int y, char aiPlayer) {
        vector<vector<char>> simBoard = board;
        simBoard[x][y] = aiPlayer;
        vector<pair<int, int>> rem = getEmptyCells();
        shuffle(rem.begin(), rem.end(), default_random_engine(rand()));
        char turn = (aiPlayer == BLUE ? RED : BLUE);
        for (auto [i, j] : rem)
            simBoard[i][j] = (turn ^= (BLUE ^ RED));
        Hex simHex;
        simHex.board = simBoard;
        return simHex.checkWin(aiPlayer) ? aiPlayer : (aiPlayer == BLUE ? RED : BLUE);
    }

    pair<int, int> getBestMove(char aiPlayer) {
        auto empty = getEmptyCells();
        pair<int, int> bestMove = empty[0];
        double bestWinRate = -1.0;

        for (auto [i, j] : empty) {
            int wins = 0;
            for (int t = 0; t < TRIALS; ++t)
                if (simulateRandomGame(i, j, aiPlayer) == aiPlayer)
                    ++wins;
            double winRate = double(wins) / TRIALS;
            if (winRate > bestWinRate) {
                bestWinRate = winRate;
                bestMove = {i, j};
            }
        }
        return bestMove;
    }

    void playGame(bool humanIsBlue) {
        char human = humanIsBlue ? BLUE : RED;
        char ai = humanIsBlue ? RED : BLUE;
        while (true) {
            display();
            if ((blueTurn && human == BLUE) || (!blueTurn && human == RED)) {
                int i, j;
                do {
                    cout << "Enter move (i j): ";
                    cin >> i >> j;
                } while (!isValidMove(i, j));
                makeMove(i, j, human);
            } else {
                cout << "AI is thinking...\n";
                auto [i, j] = getBestMove(ai);
                makeMove(i, j, ai);
                cout << "AI played: " << i << " " << j << endl;
            }
            if (checkWin(human)) {
                display();
                cout << "You win!\n"; break;
            }
            if (checkWin(ai)) {
                display();
                cout << "AI wins!\n"; break;
            }
            blueTurn = !blueTurn;
        }
    }
};

int main() {
    srand(time(0));
    Hex game;
    char choice;
    cout << "Do you want to be Blue (X) and go first? (y/n): ";
    cin >> choice;
    game.playGame(choice == 'y' || choice == 'Y');
    return 0;
}
