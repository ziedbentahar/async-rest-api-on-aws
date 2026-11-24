class UI {
    constructor() {
        this.healthElement = document.getElementById('healthValue');
        this.scoreElement = document.getElementById('scoreValue');
        this.ammoElement = document.getElementById('ammoValue');
        this.fpsElement = document.getElementById('fpsValue');
        this.gameOverScreen = document.getElementById('gameOverScreen');
        this.gameOverTitle = document.getElementById('gameOverTitle');
        this.gameOverMessage = document.getElementById('gameOverMessage');
        this.restartButton = document.getElementById('restartButton');
        
        this.frameCount = 0;
        this.lastFpsUpdate = Date.now();
        this.fps = 0;
        
        this.restartButton.addEventListener('click', () => {
            window.location.reload();
        });
    }

    update(player, enemyCount) {
        // Update HUD
        this.healthElement.textContent = Math.ceil(player.health);
        this.scoreElement.textContent = player.score;
        
        if (player.ammo === Infinity) {
            this.ammoElement.textContent = '∞';
        } else {
            this.ammoElement.textContent = player.ammo;
        }

        // Update FPS
        this.frameCount++;
        const now = Date.now();
        if (now - this.lastFpsUpdate >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastFpsUpdate = now;
        }
        this.fpsElement.textContent = this.fps;

        // Update health color
        if (player.health > 50) {
            this.healthElement.style.color = '#ffff00';
        } else if (player.health > 25) {
            this.healthElement.style.color = '#ff9900';
        } else {
            this.healthElement.style.color = '#ff0000';
        }
    }

    showGameOver(isVictory, finalScore) {
        this.gameOverScreen.style.display = 'flex';
        
        if (isVictory) {
            this.gameOverTitle.textContent = 'VICTORY';
            this.gameOverTitle.style.color = '#00ff00';
            this.gameOverMessage.textContent = `You defeated all enemies!\nFinal Score: ${finalScore}`;
            this.gameOverMessage.style.color = '#ffff00';
        } else {
            this.gameOverTitle.textContent = 'DEFEATED';
            this.gameOverTitle.style.color = '#ff0000';
            this.gameOverMessage.textContent = `You were eliminated!\nFinal Score: ${finalScore}`;
            this.gameOverMessage.style.color = '#ff9900';
        }
    }

    hideGameOver() {
        this.gameOverScreen.style.display = 'none';
    }
}
