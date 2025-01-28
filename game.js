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
        // Add click listeners to towers
        ['A', 'B', 'C'].forEach(tower => {
            document.getElementById(`tower${tower}`).addEventListener('click', () => {
                this.selectTower(tower);
            });
        });

        // Reset button
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.resetGame();
        });

        // Auto solve button
        document.getElementById('autoSolveBtn').addEventListener('click', () => {
            if (!this.isAutoSolving) {
                document.querySelector('.speed-control').classList.add('visible');
                this.startAutoSolve();
            }
        });

        // Speed slider
        const speedSlider = document.getElementById('speedSlider');
        const speedValue = document.getElementById('speedValue');
        speedSlider.addEventListener('input', () => {
            speedValue.textContent = speedSlider.value;
        });
    }

    startTimer() {
        if (!this.startTime) {
            this.startTime = Date.now();
            this.timerInterval = setInterval(() => {
                const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
                const minutes = Math.floor(elapsed / 60);
                const seconds = elapsed % 60;
                document.getElementById('timer').textContent =
                    `${minutes}:${seconds.toString().padStart(2, '0')}`;
            }, 1000);
        }
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

            const moveText = `Move disk ${disk} from Tower ${fromTower} to Tower ${toTower}`;
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
        setTimeout(() => {
            alert(`Congratulations! You've completed the Tower of Hanoi!\n\n` +
                  `Moves: ${this.moves}\n` +
                  `Time: ${timeStr}\n\n` +
                  `Click Reset to play again!`);
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
                diskElement.textContent = diskSize;  // Add this line to show the disk number
                disksContainer.appendChild(diskElement);
            });
        });
    }

    async startAutoSolve() {
        if (this.isAutoSolving) return;
        this.isAutoSolving = true;
        document.getElementById('autoSolveBtn').disabled = true;
        document.getElementById('resetBtn').disabled = false;

        this.moveQueue = [];
        
        // Get the starting tower that has all disks
        const sourceTower = ['A', 'B', 'C'].find(tower => 
            this.towers[tower].disks.length === 5
        );

        // Calculate optimal moves
        this.solveTower(5, sourceTower, 'C', 'B');

        // Execute moves
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

    solveTower(n, from, to, aux) {
        if (n === 1) {
            this.moveQueue.push({ from, to });
            return;
        }
        
        this.solveTower(n - 1, from, aux, to);
        this.moveQueue.push({ from, to });
        this.solveTower(n - 1, aux, to, from);
    }

    getDelay() {
        const speed = document.getElementById('speedSlider').value;
        return 1100 - (speed * 100); // 1000ms to 100ms
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    resetGame() {
        // Stop auto-solve first
        this.isAutoSolving = false;
        this.moveQueue = [];
        
        // ...existing code...
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
        document.getElementById('timer').textContent = '0:00';
        document.getElementById('moveHistory').innerHTML = '';
        
        this.stopTimer();
        this.drawGame();
    }
}

// Start the game when the page loads
window.addEventListener('load', () => {
    new HanoiGame();
});
