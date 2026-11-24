class Enemy {
    constructor(position, scene, player, environment) {
        this.scene = scene;
        this.player = player;
        this.environment = environment;
        
        this.position = position;
        this.health = 50;
        this.maxHealth = 50;
        this.isAlive = true;
        this.speed = 0.15;
        this.attackRange = 3;
        this.attackCooldown = 0;
        this.attackCooldownMax = 1;
        this.visionRange = 30;
        this.damage = 10;
        
        this.state = 'idle'; // idle, chase, attack
        this.patrolPoint = this.position.clone();
        this.patrolDirection = Math.random() * Math.PI * 2;
        
        this.createMesh();
    }

    createMesh() {
        this.mesh = BABYLON.MeshBuilder.CreateBox("enemy", {
            width: 1.5,
            height: 2.5,
            depth: 1.5
        }, this.scene);
        
        this.mesh.position = this.position;
        
        const enemyMaterial = new BABYLON.StandardMaterial("enemyMat" + Math.random(), this.scene);
        enemyMaterial.diffuse = new BABYLON.Color3(0.8, 0.1, 0.1);
        enemyMaterial.emissiveColor = new BABYLON.Color3(0.3, 0, 0);
        this.mesh.material = enemyMaterial;
        
        // Add eyes
        const eyeMaterial = new BABYLON.StandardMaterial("eyeMat" + Math.random(), this.scene);
        eyeMaterial.diffuse = new BABYLON.Color3(1, 1, 0);
        eyeMaterial.emissiveColor = new BABYLON.Color3(1, 1, 0);
        
        const leftEye = BABYLON.MeshBuilder.CreateSphere("eye", { diameter: 0.3 }, this.scene);
        leftEye.position = new BABYLON.Vector3(-0.3, 0.5, 0.75);
        leftEye.material = eyeMaterial;
        leftEye.parent = this.mesh;
        
        const rightEye = BABYLON.MeshBuilder.CreateSphere("eye", { diameter: 0.3 }, this.scene);
        rightEye.position = new BABYLON.Vector3(0.3, 0.5, 0.75);
        rightEye.material = eyeMaterial;
        rightEye.parent = this.mesh;
    }

    update(deltaTime) {
        if (!this.isAlive) return;

        const distanceToPlayer = BABYLON.Vector3.Distance(this.position, this.player.position);

        // State machine
        if (distanceToPlayer < this.visionRange) {
            if (distanceToPlayer < this.attackRange) {
                this.state = 'attack';
            } else {
                this.state = 'chase';
            }
        } else {
            this.state = 'idle';
        }

        switch (this.state) {
            case 'chase':
                this.chase(deltaTime);
                break;
            case 'attack':
                this.attack(deltaTime);
                break;
            case 'idle':
            default:
                this.patrol(deltaTime);
                break;
        }

        this.updateCooldowns(deltaTime);
        this.mesh.position = this.position;
    }

    chase(deltaTime) {
        const direction = BABYLON.Vector3.Normalize(
            this.player.position.subtract(this.position)
        );
        
        const moveDirection = direction.scale(this.speed);
        const newPosition = this.position.add(moveDirection);

        if (!this.environment.checkCollision(newPosition, 0.75)) {
            this.position = newPosition;
        }

        // Look at player
        this.mesh.lookAt(this.player.position);
    }

    attack(deltaTime) {
        // Move toward player if not close enough
        const distanceToPlayer = BABYLON.Vector3.Distance(this.position, this.player.position);
        
        if (distanceToPlayer > this.attackRange) {
            this.chase(deltaTime);
        }

        // Deal damage
        if (this.attackCooldown <= 0) {
            this.player.takeDamage(this.damage);
            this.attackCooldown = this.attackCooldownMax;
        }

        // Look at player
        this.mesh.lookAt(this.player.position);
    }

    patrol(deltaTime) {
        // Move toward patrol point
        const distanceToPatrol = BABYLON.Vector3.Distance(this.position, this.patrolPoint);
        
        if (distanceToPatrol < 2) {
            // Choose new patrol point
            this.patrolDirection = Math.random() * Math.PI * 2;
            this.patrolPoint = this.position.add(
                new BABYLON.Vector3(
                    Math.cos(this.patrolDirection) * 10,
                    0,
                    Math.sin(this.patrolDirection) * 10
                )
            );

            // Clamp to arena
            const arenaSize = this.environment.getArenaSize() / 2;
            this.patrolPoint.x = Math.max(-arenaSize + 2, Math.min(arenaSize - 2, this.patrolPoint.x));
            this.patrolPoint.z = Math.max(-arenaSize + 2, Math.min(arenaSize - 2, this.patrolPoint.z));
        }

        const direction = BABYLON.Vector3.Normalize(
            this.patrolPoint.subtract(this.position)
        );
        
        const moveDirection = direction.scale(this.speed * 0.5);
        const newPosition = this.position.add(moveDirection);

        if (!this.environment.checkCollision(newPosition, 0.75)) {
            this.position = newPosition;
        }

        // Look at patrol point
        this.mesh.lookAt(this.patrolPoint);
    }

    takeDamage(amount) {
        this.health -= amount;
        
        // Visual feedback
        const hitMaterial = new BABYLON.StandardMaterial("hitMat" + Math.random(), this.scene);
        hitMaterial.diffuse = new BABYLON.Color3(1, 1, 1);
        hitMaterial.emissiveColor = new BABYLON.Color3(1, 1, 1);
        
        const originalMaterial = this.mesh.material;
        this.mesh.material = hitMaterial;
        
        setTimeout(() => {
            if (this.mesh) {
                this.mesh.material = originalMaterial;
            }
        }, 100);

        if (this.health <= 0) {
            this.isAlive = false;
        }
    }

    destroy() {
        this.isAlive = false;
        
        // Death animation - fade out
        const startTime = Date.now();
        const duration = 500;
        
        const animateDestructions = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            if (this.mesh) {
                this.mesh.visibility = 1 - progress;
            }
            
            if (progress < 1) {
                requestAnimationFrame(animateDestructions);
            } else if (this.mesh) {
                this.mesh.dispose();
            }
        };
        
        animateDestructions();
    }

    updateCooldowns(deltaTime) {
        if (this.attackCooldown > 0) {
            this.attackCooldown -= deltaTime;
        }
    }

    getPosition() {
        return this.position.clone();
    }
}

class EnemySpawner {
    constructor(scene, player, environment) {
        this.scene = scene;
        this.player = player;
        this.environment = environment;
        this.enemies = [];
        this.spawnCooldown = 0;
        this.spawnCooldownMax = 3;
        this.maxEnemies = 8;
        this.waveSize = 2;
        this.currentWave = 0;
    }

    update(deltaTime) {
        // Remove dead enemies
        this.enemies = this.enemies.filter(e => e.isAlive);

        // Update alive enemies
        for (let enemy of this.enemies) {
            enemy.update(deltaTime);
        }

        // Spawn new enemies
        this.spawnCooldown -= deltaTime;
        
        if (this.enemies.length < this.maxEnemies && this.spawnCooldown <= 0) {
            this.spawnEnemy();
            this.spawnCooldown = this.spawnCooldownMax;
        }

        // Check if wave cleared
        if (this.enemies.length === 0 && this.currentWave > 0) {
            this.startNewWave();
        }

        return this.enemies;
    }

    spawnEnemy() {
        // Spawn at random position around arena edge
        const angle = Math.random() * Math.PI * 2;
        const radius = 20;
        
        const spawnPosition = new BABYLON.Vector3(
            Math.cos(angle) * radius,
            2,
            Math.sin(angle) * radius
        );

        const enemy = new Enemy(spawnPosition, this.scene, this.player, this.environment);
        this.enemies.push(enemy);
        this.currentWave++;
    }

    startNewWave() {
        this.maxEnemies = Math.min(this.maxEnemies + 2, 15);
        this.waveSize += 1;
    }

    getEnemies() {
        return this.enemies;
    }

    clearAll() {
        for (let enemy of this.enemies) {
            if (enemy.mesh) {
                enemy.mesh.dispose();
            }
        }
        this.enemies = [];
    }
}
