class Player {
    constructor(camera, scene, environment) {
        this.camera = camera;
        this.scene = scene;
        this.environment = environment;
        
        this.position = new BABYLON.Vector3(0, 2, -20);
        this.health = 100;
        this.maxHealth = 100;
        this.score = 0;
        this.ammo = Infinity;
        
        this.velocity = new BABYLON.Vector3(0, 0, 0);
        this.speed = 0.3;
        this.sensitivity = 0.002;
        
        this.keys = {};
        this.mouseButtons = {};
        this.gunCooldown = 0;
        this.gunCooldownMax = 0.1;
        
        this.setupControls();
        this.createGunMesh();
    }

    setupControls() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            
            if (e.key === ' ') {
                this.shoot();
                e.preventDefault();
            }
            
            if (e.key === 'Escape') {
                window.location.reload();
            }
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });

        document.addEventListener('mousemove', (e) => {
            if (document.pointerLockElement === document.getElementById('gameCanvas')) {
                this.camera.rotation.y += e.movementX * this.sensitivity;
                this.camera.rotation.x += e.movementY * this.sensitivity;

                // Clamp pitch
                this.camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.camera.rotation.x));
            }
        });

        document.addEventListener('mousedown', (e) => {
            this.mouseButtons[e.button] = true;
            if (e.button === 0) {
                this.shoot();
            }
        });

        document.addEventListener('mouseup', (e) => {
            this.mouseButtons[e.button] = false;
        });

        // Pointer lock for mouse
        document.getElementById('gameCanvas').addEventListener('click', () => {
            document.getElementById('gameCanvas').requestPointerLock();
        });
    }

    createGunMesh() {
        // Simple gun visual in first-person view
        this.gun = BABYLON.MeshBuilder.CreateBox("gun", {
            width: 0.5,
            height: 1,
            depth: 2
        }, this.scene);
        
        const gunMaterial = new BABYLON.StandardMaterial("gunMat", this.scene);
        gunMaterial.diffuse = new BABYLON.Color3(0.1, 0.1, 0.1);
        this.gun.material = gunMaterial;
        this.gun.parent = this.camera;
        this.gun.position = new BABYLON.Vector3(0.3, -0.3, 0.8);
    }

    update(deltaTime, enemies) {
        this.updateMovement(deltaTime);
        this.updateCamera();
        this.updateGunCooldown(deltaTime);
        this.updateHealth(enemies);
    }

    updateMovement(deltaTime) {
        const moveDirection = BABYLON.Vector3.Zero();
        
        // Get forward and right vectors from camera
        const forward = BABYLON.Vector3.TransformCoordinates(
            BABYLON.Vector3.Forward(),
            BABYLON.Matrix.RotationYawPitchRoll(this.camera.rotation.y, 0, 0)
        );
        const right = BABYLON.Vector3.TransformCoordinates(
            BABYLON.Vector3.Right(),
            BABYLON.Matrix.RotationYawPitchRoll(this.camera.rotation.y, 0, 0)
        );

        if (this.keys['w'] || this.keys['arrowup']) moveDirection.addInPlace(forward);
        if (this.keys['s'] || this.keys['arrowdown']) moveDirection.addInPlace(forward.scale(-1));
        if (this.keys['a'] || this.keys['arrowleft']) moveDirection.addInPlace(right.scale(-1));
        if (this.keys['d'] || this.keys['arrowright']) moveDirection.addInPlace(right);

        if (moveDirection.length() > 0) {
            moveDirection.normalize();
            moveDirection.scaleInPlace(this.speed);
        }

        const newPosition = this.position.add(moveDirection);

        if (!this.environment.checkCollision(newPosition, 1)) {
            this.position = newPosition;
        }

        this.camera.position = this.position;
    }

    updateCamera() {
        this.camera.position = this.position;
    }

    shoot() {
        if (this.gunCooldown > 0 || this.ammo <= 0) return;

        this.gunCooldown = this.gunCooldownMax;

        // Visual feedback - gun kickback
        this.gun.position.z -= 0.1;

        // Raycast for hit detection
        const rayOrigin = this.camera.position;
        const rayDirection = BABYLON.Vector3.TransformCoordinates(
            BABYLON.Vector3.Forward(),
            BABYLON.Matrix.RotationYawPitchRoll(this.camera.rotation.y, this.camera.rotation.x, 0)
        );
        const rayLength = 500;
        const ray = new BABYLON.Ray(rayOrigin, rayDirection, rayLength);

        // Check collision with enemies
        for (let enemy of gameState.enemies) {
            const hit = ray.intersectsMesh(enemy.mesh);
            if (hit && hit.hit) {
                enemy.takeDamage(25);
                if (enemy.health <= 0) {
                    this.score += 100;
                    enemy.destroy();
                }
                break;
            }
        }

        this.ammo--;
    }

    updateGunCooldown(deltaTime) {
        if (this.gunCooldown > 0) {
            this.gunCooldown -= deltaTime;
        }

        // Gun return to position
        this.gun.position.z = BABYLON.Scalar.Lerp(this.gun.position.z, 0.8, 0.1);
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health < 0) this.health = 0;
    }

    heal(amount) {
        this.health = Math.min(this.health + amount, this.maxHealth);
    }

    updateHealth(enemies) {
        // Check proximity damage from enemies
        for (let enemy of enemies) {
            const distance = BABYLON.Vector3.Distance(this.position, enemy.position);
            if (distance < 2 && enemy.isAlive) {
                this.takeDamage(0.5);
            }
        }
    }

    getHealth() {
        return this.health;
    }

    getScore() {
        return this.score;
    }

    isAlive() {
        return this.health > 0;
    }

    respawn() {
        this.position = new BABYLON.Vector3(0, 2, -20);
        this.health = this.maxHealth;
        this.ammo = Infinity;
    }
}
