class Environment {
    constructor(scene) {
        this.scene = scene;
        this.wallMeshes = [];
        this.colliders = [];
        this.createArena();
    }

    createArena() {
        const arenaSize = 50;
        const wallHeight = 15;
        const wallThickness = 0.5;

        // Floor
        const floor = BABYLON.MeshBuilder.CreateGround("floor", {
            width: arenaSize,
            height: arenaSize,
            subdivisions: 10
        }, this.scene);
        
        const floorMaterial = new BABYLON.StandardMaterial("floorMat", this.scene);
        floorMaterial.diffuse = new BABYLON.Color3(0.3, 0.3, 0.3);
        floorMaterial.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
        floor.material = floorMaterial;

        // Ceiling
        const ceiling = BABYLON.MeshBuilder.CreateGround("ceiling", {
            width: arenaSize,
            height: arenaSize,
            subdivisions: 10
        }, this.scene);
        ceiling.position.y = wallHeight;
        ceiling.rotation.z = Math.PI;
        
        const ceilingMaterial = new BABYLON.StandardMaterial("ceilingMat", this.scene);
        ceilingMaterial.diffuse = new BABYLON.Color3(0.2, 0.2, 0.2);
        ceiling.material = ceilingMaterial;

        const halfSize = arenaSize / 2;

        // North wall
        this.createWall("northWall", arenaSize, wallHeight, wallThickness, 
                       new BABYLON.Vector3(0, wallHeight / 2, -halfSize), 
                       this.scene);

        // South wall
        this.createWall("southWall", arenaSize, wallHeight, wallThickness, 
                       new BABYLON.Vector3(0, wallHeight / 2, halfSize), 
                       this.scene);

        // East wall
        this.createWall("eastWall", wallThickness, wallHeight, arenaSize, 
                       new BABYLON.Vector3(halfSize, wallHeight / 2, 0), 
                       this.scene);

        // West wall
        this.createWall("westWall", wallThickness, wallHeight, arenaSize, 
                       new BABYLON.Vector3(-halfSize, wallHeight / 2, 0), 
                       this.scene);

        // Obstacles for cover
        this.createObstacle("pillar1", new BABYLON.Vector3(-15, 0, -15), 3, wallHeight);
        this.createObstacle("pillar2", new BABYLON.Vector3(15, 0, 15), 3, wallHeight);
        this.createObstacle("pillar3", new BABYLON.Vector3(-15, 0, 15), 3, wallHeight);
        this.createObstacle("pillar4", new BABYLON.Vector3(15, 0, -15), 3, wallHeight);

        // Central structure
        this.createObstacle("centerBox", new BABYLON.Vector3(0, 0, 0), 6, 8);
    }

    createWall(name, width, height, depth, position, scene) {
        const wall = BABYLON.MeshBuilder.CreateBox(name, {
            width: width,
            height: height,
            depth: depth
        }, scene);
        
        wall.position = position;
        
        const wallMaterial = new BABYLON.StandardMaterial(name + "Mat", scene);
        wallMaterial.diffuse = new BABYLON.Color3(0.5, 0.4, 0.3);
        wallMaterial.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
        wall.material = wallMaterial;
        
        this.wallMeshes.push(wall);
        this.colliders.push(wall);
    }

    createObstacle(name, position, size, height) {
        const obstacle = BABYLON.MeshBuilder.CreateBox(name, {
            width: size,
            height: height,
            depth: size
        }, this.scene);
        
        obstacle.position = position;
        
        const obstacleMaterial = new BABYLON.StandardMaterial(name + "Mat", this.scene);
        obstacleMaterial.diffuse = new BABYLON.Color3(0.6, 0.2, 0.2);
        obstacleMaterial.specularColor = new BABYLON.Color3(0.3, 0.3, 0.3);
        obstacle.material = obstacleMaterial;
        
        this.wallMeshes.push(obstacle);
        this.colliders.push(obstacle);
    }

    checkCollision(position, radius) {
        for (let collider of this.colliders) {
            if (this.sphereBoxCollision(position, radius, collider)) {
                return true;
            }
        }
        return false;
    }

    sphereBoxCollision(spherePos, sphereRadius, box) {
        const boxMin = new BABYLON.Vector3(
            box.position.x - box.scaling.x,
            box.position.y - box.scaling.y,
            box.position.z - box.scaling.z
        );
        const boxMax = new BABYLON.Vector3(
            box.position.x + box.scaling.x,
            box.position.y + box.scaling.y,
            box.position.z + box.scaling.z
        );

        const closestPoint = new BABYLON.Vector3(
            Math.max(boxMin.x, Math.min(spherePos.x, boxMax.x)),
            Math.max(boxMin.y, Math.min(spherePos.y, boxMax.y)),
            Math.max(boxMin.z, Math.min(spherePos.z, boxMax.z))
        );

        const distance = BABYLON.Vector3.Distance(spherePos, closestPoint);
        return distance < sphereRadius;
    }

    getArenaSize() {
        return 50;
    }

    getArenaCenter() {
        return new BABYLON.Vector3(0, 0, 0);
    }
}
