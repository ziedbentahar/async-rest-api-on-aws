let gameState = {
    isRunning: false,
    isGameOver: false,
    isVictory: false,
    enemies: []
};

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.engine = new BABYLON.Engine(this.canvas, true);
        this.scene = null;
        this.camera = null;
        this.player = null;
        this.environment = null;
        this.enemySpawner = null;
        this.ui = null;
        this.lastFrameTime = Date.now();
        
        this.initialize();
    }

    initialize() {
        // Create scene
        this.scene = new BABYLON.Scene(this.engine);
        this.scene.collisionsEnabled = true;
        this.scene.fogEnabled = true;
        this.scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR;
        this.scene.fogStart = 10;
        this.scene.fogEnd = 100;
        this.scene.fogColor = new BABYLON.Color3(0.1, 0.1, 0.1);

        // Create camera
        this.camera = new BABYLON.UniversalCamera("camera", new BABYLON.Vector3(0, 2, -20), this.scene);
        this.camera.attachControl(this.canvas, true);
        this.camera.inertia = 0.5;
        this.camera.angularSensibility = 1000;
        this.camera.speed = 0;
        this.camera.keysUp = [];
        this.camera.keysDown = [];
        this.camera.keysLeft = [];
        this.camera.keysRight = [];

        // Lighting
        const light = new BABYLON.PointLight("light", new BABYLON.Vector3(0, 15, 0), this.scene);
        light.intensity = 1;
        light.range = 100;

        const ambientLight = new BABYLON.HemisphericLight("ambientLight", new BABYLON.Vector3(0, 1, 0), this.scene);
        ambientLight.intensity = 0.6;

        // Create environment
        this.environment = new Environment(this.scene);

        // Create player
        this.player = new Player(this.camera, this.scene, this.environment);

        // Create enemy spawner
        this.enemySpawner = new EnemySpawner(this.scene, this.player, this.environment);

        // Create UI
        this.ui = new UI();

        // Start game
        gameState.isRunning = true;
        gameState.isGameOver = false;

        // Run game loop
        this.engine.runRenderLoop(() => this.gameLoop());

        // Handle window resize
        window.addEventListener('resize', () => {
            this.engine.resize();
        });
    }

    gameLoop() {
        const now = Date.now();
        const deltaTime = (now - this.lastFrameTime) / 1000;
        this.lastFrameTime = now;

        if (!gameState.isRunning || gameState.isGameOver) {
            this.scene.render();
            return;
        }

        // Update game state
        this.update(deltaTime);

        // Check game over conditions
        if (!this.player.isAlive()) {
            gameState.isGameOver = true;
            gameState.isVictory = false;
            this.ui.showGameOver(false, this.player.getScore());
            gameState.isRunning = false;
        }

        // Check victory condition (all enemies defeated and time passed)
        if (gameState.enemies.length === 0 && this.enemySpawner.currentWave >= 5) {
            gameState.isGameOver = true;
            gameState.isVictory = true;
            this.ui.showGameOver(true, this.player.getScore());
            gameState.isRunning = false;
        }

        this.scene.render();
    }

    update(deltaTime) {
        // Update player
        this.player.update(deltaTime, gameState.enemies);

        // Update enemies
        gameState.enemies = this.enemySpawner.update(deltaTime);

        // Update UI
        this.ui.update(this.player, gameState.enemies.length);
    }

    dispose() {
        if (this.enemySpawner) {
            this.enemySpawner.clearAll();
        }
        this.scene.dispose();
        this.engine.dispose();
    }
}

// Initialize game when page loads
window.addEventListener('load', () => {
    new Game();
});

// Cleanup on unload
window.addEventListener('beforeunload', () => {
    // Cleanup handled by Babylon.js
});
