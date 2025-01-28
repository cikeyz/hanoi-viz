class Tower {
    constructor(name) {
        this.name = name;
        this.disks = [];
    }
}

class HanoiGame {
    constructor() {
        this.towers = {
            'A': new Tower('A'),
            'B': new Tower('B'),
            'C': new Tower('C')
        };
        this.moves = 0;
        this.gameComplete = false;
        this.moveHistory = [];
        this.selectedTower = null;
        this.startTime = null;
        this.timerInterval = null;
        this.isAutoSolving = false;
        this.moveQueue = [];
        this.timerSpeed = 10; // Default timer update speed in ms

        // Create randomized disk arrangement
        const disks = [1, 2, 3, 4, 5];
        this.shuffleArray(disks);
        this.towers['A'].disks = disks;
        
        this.initializeDOM();
        this.drawGame();
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    initializeDOM() {
        ['A', 'B', 'C'].forEach(tower => {
            document.getElementById(`tower${tower}`).addEventListener('click', () => {
                this.selectTower(tower);
            });
        });

        document.getElementById('resetBtn').addEventListener('click', () => {
            this.resetGame();
        });

        document.getElementById('autoSolveBtn').addEventListener('click', () => {
            if (!this.isAutoSolving) {
                document.querySelector('.speed-control').classList.add('visible');
                this.startAutoSolve();
            }
        });

        const speedSlider = document.getElementById('speedSlider');
        const speedValue = document.getElementById('speedValue');
        speedSlider.addEventListener('input', () => {
            speedValue.textContent = speedSlider.value;
            this.updateSpeeds(speedSlider.value);
        });
    }

    updateSpeeds(speed) {
        // Update both timer and auto-solve speeds
        this.timerSpeed = Math.max(1, 20 - (speed * 2)); // Adjust timer speed (20ms to 1ms)
        
        // Restart timer with new speed if it's running
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.startTimer(true); // true means preserve existing start time
        }
    }

    startTimer(preserveStartTime = false) {
        if (!preserveStartTime) {
            this.startTime = Date.now();
        }
        
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }

        this.timerInterval = setInterval(() => {
            const elapsed = Date.now() - this.startTime;
            const milliseconds = Math.floor((elapsed % 1000) / 10).toString().padStart(2, '0');
            const seconds = Math.floor(elapsed / 1000) % 60;
            const minutes = Math.floor(elapsed / 60000);
            document.getElementById('timer').textContent = 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${milliseconds}`;
        }, this.timerSpeed);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    makeMove(fromTower, toTower) {
        if (this.gameComplete) return false;

        const sourceTower = this.towers[fromTower];
        const targetTower = this.towers[toTower];

        if (!sourceTower.disks.length) return false;

        const diskToMove = sourceTower.disks[sourceTower.disks.length - 1];

        if (!targetTower.disks.length ||
            diskToMove < targetTower.disks[targetTower.disks.length - 1]) {
            const disk = sourceTower.disks.pop();
            targetTower.disks.push(disk);
            this.moves++;
            document.getElementById('moves').textContent = this.moves;

            const moveText = `${this.moves}. Disk ${disk}: Tower ${fromTower}→Tower ${toTower}`;
            this.moveHistory.push(moveText);
            this.updateMoveHistory();

            if (this.checkWin()) {
                this.gameComplete = true;
                this.stopTimer();
                this.showWinMessage();
            }
            return true;
        }
        return false;
    }

    selectTower(tower) {
        if (this.gameComplete) return;

        if (this.selectedTower === null) {
            if (this.towers[tower].disks.length > 0) {
                this.selectedTower = tower;
                if (this.moves === 0) this.startTimer();
                this.highlightTower(tower);
            }
        } else {
            if (this.makeMove(this.selectedTower, tower)) {
                this.unhighlightTower(this.selectedTower);
            }
            this.selectedTower = null;
            this.drawGame();
        }
    }

    highlightTower(tower) {
        const towerElement = document.getElementById(`tower${tower}`);
        if (towerElement.querySelector('.disks').lastChild) {
            towerElement.querySelector('.disks').lastChild.classList.add('selected');
        }
    }

    unhighlightTower(tower) {
        const towerElement = document.getElementById(`tower${tower}`);
        if (towerElement.querySelector('.disks').lastChild) {
            towerElement.querySelector('.disks').lastChild.classList.remove('selected');
        }
    }

    checkWin() {
        const targetTower = this.towers['C'];
        return targetTower.disks.length === 5 &&
               JSON.stringify(targetTower.disks) === '[5,4,3,2,1]';
    }

    showWinMessage() {
        const timeStr = document.getElementById('timer').textContent;
        const resetBtn = document.getElementById('resetBtn');
        
        resetBtn.textContent = 'New Game';
        resetBtn.classList.add('game-complete');
        
        setTimeout(() => {
            alert(`Congratulations! You've completed the Tower of Hanoi!\n\n` +
                  `Moves: ${this.moves}\n` +
                  `Time: ${timeStr}\n\n` +
                  `Click New Game to play again!`);
        }, 100);
    }

    updateMoveHistory() {
        const historyDiv = document.getElementById('moveHistory');
        historyDiv.innerHTML = this.moveHistory.map(move =>
            `<p>${move}</p>`
        ).join('');
        historyDiv.scrollTop = historyDiv.scrollHeight;
    }

    drawGame() {
        ['A', 'B', 'C'].forEach(towerName => {
            const towerElement = document.getElementById(`tower${towerName}`);
            const disksContainer = towerElement.querySelector('.disks');
            disksContainer.innerHTML = '';

            this.towers[towerName].disks.forEach(diskSize => {
                const diskElement = document.createElement('div');
                diskElement.className = `disk disk-${diskSize}`;
                diskElement.textContent = diskSize;
                disksContainer.appendChild(diskElement);
            });
        });
    }

    // ---- Begin BFS Implementation ----
    cloneTowersDistribution() {
        return {
            'A': [...this.towers['A'].disks],
            'B': [...this.towers['B'].disks],
            'C': [...this.towers['C'].disks]
        };
    }

    getKey(distribution) {
        // Create a string representation so we can store visited states in a Set
        // Example: A:[3,2],B:[1],C:[] => "A|3,2|B|1|C|"
        return ['A','B','C'].map(t => {
            return `${t}|${distribution[t].join(',')}`;
        }).join('|');
    }

    isGoalDistribution(distribution) {
        // Check if tower C has [5,4,3,2,1]
        if (distribution['C'].length !== 5) return false;
        return JSON.stringify(distribution['C']) === '[5,4,3,2,1]';
    }

    getNextStates(distribution, pathSoFar) {
        // All valid single-disk moves from distribution
        const result = [];
        const towers = ['A','B','C'];
        for (let from of towers) {
            if (!distribution[from].length) continue;
            const fromTop = distribution[from][distribution[from].length - 1];
            for (let to of towers) {
                if (from === to) continue;
                const toTop = distribution[to][distribution[to].length - 1];
                // Valid if to is empty or fromTop < toTop
                if (!distribution[to].length || fromTop < toTop) {
                    // Clone distribution
                    const newDist = {
                        'A': [...distribution['A']],
                        'B': [...distribution['B']],
                        'C': [...distribution['C']]
                    };
                    // Move disk
                    newDist[from].pop();
                    newDist[to].push(fromTop);
                    const newMove = { from, to };
                    result.push({
                        distribution: newDist,
                        moves: [...pathSoFar, newMove]
                    });
                }
            }
        }
        return result;
    }

    runBFS() {
        const startDist = this.cloneTowersDistribution();
        if (this.isGoalDistribution(startDist)) return [];

        const visited = new Set();
        const queue = [];
        queue.push({ distribution: startDist, moves: [] });
        visited.add(this.getKey(startDist));

        while (queue.length > 0) {
            const current = queue.shift();
            if (this.isGoalDistribution(current.distribution)) {
                // Found a solution
                return current.moves;
            }
            // Get neighbors
            const nextStates = this.getNextStates(current.distribution, current.moves);
            for (let next of nextStates) {
                const key = this.getKey(next.distribution);
                if (!visited.has(key)) {
                    visited.add(key);
                    queue.push(next);
                }
            }
        }
        return [];
    }
    // ---- End BFS Implementation ----

    async startAutoSolve() {
        if (this.isAutoSolving) return;
        this.isAutoSolving = true;
        document.getElementById('autoSolveBtn').disabled = true;
        document.getElementById('resetBtn').disabled = false;

        this.moveQueue = [];

        // Run BFS to find a solution path
        const path = this.runBFS();
        this.moveQueue = path;

        // Execute BFS moves
        while (this.moveQueue.length > 0 && this.isAutoSolving) {
            const move = this.moveQueue.shift();
            this.selectTower(move.from);
            await this.delay(this.getDelay());
            if (!this.isAutoSolving) break;
            this.selectTower(move.to);
            await this.delay(this.getDelay());
        }

        this.isAutoSolving = false;
        document.getElementById('autoSolveBtn').disabled = false;
    }

    getDelay() {
        const speed = document.getElementById('speedSlider').value;
        return 1100 - (speed * 100);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    resetGame() {
        const resetBtn = document.getElementById('resetBtn');
        resetBtn.textContent = 'Reset Game';
        resetBtn.classList.remove('game-complete');
        
        this.isAutoSolving = false;
        this.moveQueue = [];
        document.getElementById('autoSolveBtn').disabled = false;
        document.getElementById('resetBtn').disabled = false;
        document.querySelector('.speed-control').classList.remove('visible');
        this.towers = {
            'A': new Tower('A'),
            'B': new Tower('B'),
            'C': new Tower('C')
        };
        const disks = [1, 2, 3, 4, 5];
        this.shuffleArray(disks);
        this.towers['A'].disks = disks;
        
        this.moves = 0;
        this.gameComplete = false;
        this.moveHistory = [];
        this.selectedTower = null;
        this.startTime = null;
        
        document.getElementById('moves').textContent = '0';
        document.getElementById('timer').textContent = '00:00.00';
        document.getElementById('moveHistory').innerHTML = '';
        
        this.stopTimer();
        this.drawGame();
    }
}

// Start the game when the page loads
window.addEventListener('load', () => {
    new HanoiGame();
});
