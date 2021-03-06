const TILE_SIZE = 32;
const MAP_NUM_ROWS = 11;
const MAP_NUM_COLS = 15;

const WINDOW_WIDTH = MAP_NUM_COLS * TILE_SIZE;
const WINDOW_HEIGHT = MAP_NUM_ROWS * TILE_SIZE;

//FIELD OF VIEW ANGLE
const FOV_ANGLE = 60 * (Math.PI / 180);
const WALL_STRIP_WIDTH = 1;
const NUM_RAYS = WINDOW_WIDTH / WALL_STRIP_WIDTH;

// Used to lower or increase the size of thins to be printed
const MINIMAP_SCALE_FACTOR = 0.2;

// colors
const RED = [255, 1, 1];
const GREEN = [1, 255, 1];
const BLUE = [1, 1, 255];
const WHITE = [255, 255, 255];

class Map {
    constructor() {
        this.grid = [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
            [1, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 1, 0, 1],
            [1, 3, 3, 3, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 2, 2, 0, 1],
            [1, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 2, 2, 3, 2, 2, 0, 0, 0, 1, 1, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        ];
    }
    hasWallAt(x, y) {
        if (x < 0 || x > WINDOW_WIDTH || y < 0 || y > WINDOW_HEIGHT) {
            return true;
        }
        var mapGridIndexX = Math.floor(x / TILE_SIZE);
        var mapGridIndexY = Math.floor(y / TILE_SIZE);
        return this.grid[mapGridIndexY][mapGridIndexX] != 0;
    }
    render() {
        for (var i = 0; i < MAP_NUM_ROWS; i++)
        {
            for (var j = 0; j < MAP_NUM_COLS; j++)
            {
                var tileX = j * TILE_SIZE;
                var tileY = i * TILE_SIZE;
                var tileColor = this.grid[i][j] != 0 ? "#222" : "#fff";
                stroke("#222");
                fill(tileColor);
                rect(
                    MINIMAP_SCALE_FACTOR * tileX,
                    MINIMAP_SCALE_FACTOR * tileY,
                    MINIMAP_SCALE_FACTOR * TILE_SIZE,
                    MINIMAP_SCALE_FACTOR * TILE_SIZE);
            }
        }
    }
}

class Player {
    constructor() {
        this.x = WINDOW_WIDTH / 2;
        this.y = WINDOW_HEIGHT / 7;
        this.radius = 4;
        this.turnDirection = 0; // -1 if left, +1 if rightt
        this.walkDirection = 0; // -1 if back, +1 front
        this.rotationAngle = Math.PI / 2;
        this.moveSpeed = 4.0;
        this.rotationSpeed = 3 * (Math.PI / 180);
    }
    update() {
        this.rotationAngle += this.turnDirection * this.rotationSpeed;
        
        var moveStep = this.walkDirection * this.moveSpeed;
        
        var newPlayerX = this.x + Math.cos(this.rotationAngle) * moveStep;
        var newPlayerY = this.y + Math.sin(this.rotationAngle) * moveStep;
        //only set new player position if it is not colliding with the map  walls
        if (!grid.hasWallAt(newPlayerX, newPlayerY)) {
            this.x = newPlayerX;
            this.y = newPlayerY;
        }
    }
    render() {
        noStroke();
        fill("blue");
        circle(
            MINIMAP_SCALE_FACTOR * this.x,
            MINIMAP_SCALE_FACTOR * this.y,
            MINIMAP_SCALE_FACTOR * this.radius);
        stroke("blue");
        line(
            MINIMAP_SCALE_FACTOR * this.x,
            MINIMAP_SCALE_FACTOR * this.y,
            MINIMAP_SCALE_FACTOR * this.x + Math.cos(this.rotationAngle) * 30,
            MINIMAP_SCALE_FACTOR * this.y + Math.sin(this.rotationAngle) * 30
        );
    }
}

class Ray {
    constructor(rayAngle) {
        this.rayAngle = normalizeAngle(rayAngle);
        this.WallHitX = 0;
        this.WallHitY = 0;
        this.distance = 0;
        this.wasHitVertifical = false;

        this.isRayFacingDown = this.rayAngle > 0 && this.rayAngle < Math.PI;
        this.isRayFacingUp = !this.isRayFacingDown;

        this.isRayFacingRight = this.rayAngle < 0.5 * Math.PI || this.rayAngle > 1.5 * Math.PI;
        this.isRayFacingLeft = !this.isRayFacingRight;

        this.wallColor = WHITE;
    }
    cast () {
        var xintercept, yintercept;
        var xstep, ystep;

        ///////////////////////////////////////////
        // HORIZONTAL RAY-GRID INTERSECTION CODE //
        ///////////////////////////////////////////
        var foundHorzWallHit = false;
        var horzWallHitX = 0;
        var horzWallHitY = 0;

        // Find the y-coordinnate of the closest horizontal grid intersenction
        yintercept = Math.floor(player.y / TILE_SIZE) * TILE_SIZE;
        yintercept += this.isRayFacingDown ? TILE_SIZE : 0;
         
        // Find the x-coordinate of the closest horizonntal grid intersection
        xintercept = player.x + (yintercept - player.y) / Math.tan(this.rayAngle);

        // Calculate the increment xstep and ystep
        ystep = TILE_SIZE;
        ystep *= this.isRayFacingUp ? -1 : 1;

        xstep = TILE_SIZE / Math.tan(this.rayAngle);
        xstep *= (this.isRayFacingLeft && xstep > 0) ? -1 : 1;
        xstep *= (this.isRayFacingRight && xstep < 0) ? -1 : 1;

        var nextHorzTouchX = xintercept;
        var nextHorzTouchY = yintercept;

        // if (this.isRayFacingUp)
        //     nextHorzTouchY--;
        
        // Increment xstep and ystep unntil we find a wall
        while (nextHorzTouchX >= 0 && nextHorzTouchX <= WINDOW_WIDTH && nextHorzTouchY >= 0 && nextHorzTouchY <= WINDOW_HEIGHT) {
            if (grid.hasWallAt(nextHorzTouchX, nextHorzTouchY - (this.isRayFacingUp ? 1 : 0))) {
                foundHorzWallHit = true;
                horzWallHitX = nextHorzTouchX;
                horzWallHitY = nextHorzTouchY;
                break ;
            } else {
                nextHorzTouchX += xstep;
                nextHorzTouchY += ystep;
            }
        }


        ///////////////////////////////////////////
        // VERTICAL RAY-GRID INTERSECTION CODE //
        ///////////////////////////////////////////
        var foundVertWallHit = false;
        var vertWallHitX = 0;
        var vertWallHitY = 0;

        // Find the x-coordinnate of the closest vertical grid intersenction
        xintercept = Math.floor(player.x / TILE_SIZE) * TILE_SIZE;
        xintercept += this.isRayFacingRight ? TILE_SIZE : 0;
        
        // Find the y-coordinate of the closest vertical grid intersection
        yintercept = player.y + (xintercept - player.x) * Math.tan(this.rayAngle);

        // Calculate the increment xstep and ystep
        xstep = TILE_SIZE;
        xstep *= this.isRayFacingLeft ? -1 : 1;

        ystep = TILE_SIZE * Math.tan(this.rayAngle);
        ystep *= (this.isRayFacingUp && ystep > 0) ? -1 : 1;
        ystep *= (this.isRayFacingDown && ystep < 0) ? -1 : 1;

        var nextVertTouchX = xintercept;
        var nextVertTouchY = yintercept;

        
        // Increment xstep and ystep unntil we find a wall
        while (nextVertTouchX >= 0 && nextVertTouchX <= WINDOW_WIDTH && nextVertTouchY >= 0 && nextVertTouchY <= WINDOW_HEIGHT) {
            if (grid.hasWallAt(nextVertTouchX - (this.isRayFacingLeft ? 1 : 0), nextVertTouchY)) {
                foundVertWallHit = true;
                vertWallHitX = nextVertTouchX;
                vertWallHitY = nextVertTouchY;
                break ;
            } else {
                nextVertTouchX += xstep;
                nextVertTouchY += ystep;
            }
        }

        // Calculate both horizonttal and vertical distances and choose the smallest value
        var horzHitDistance = (foundHorzWallHit)
            ? distanceBetweenPoints(player.x, player.y, horzWallHitX, horzWallHitY)
            : Number.MAX_VALUE;
        
        var vertHitDistance = (foundVertWallHit)
            ? distanceBetweenPoints(player.x, player.y, vertWallHitX, vertWallHitY)
            : Number.MAX_VALUE;

        // only store the smallest of the distances
        if (vertHitDistance < horzHitDistance) {
            this.WallHitX = vertWallHitX;
            this.WallHitY = vertWallHitY;
            this.distance = vertHitDistance;
            this.wasHitVertifical = true;
        } else {
            this.WallHitX = horzWallHitX;
            this.WallHitY = horzWallHitY;
            this.distance = horzHitDistance;
            this.wasHitVertifical = false;
        }


        // Change the color of the wall
        var mapGridIndexX = 0;
        var mapGridIndexY = 0;
        if (this.wasHitVertifical)
        {
            mapGridIndexX = Math.floor((this.WallHitX - (this.isRayFacingLeft ? 1 : 0))  / TILE_SIZE);
            mapGridIndexY = Math.floor((this.WallHitY)  / TILE_SIZE);
        }
        else {
            mapGridIndexX = Math.floor((this.WallHitX)  / TILE_SIZE);
            mapGridIndexY = Math.floor((this.WallHitY - (this.isRayFacingUp ? 1 : 0))  / TILE_SIZE);
        }
        if (grid.grid[mapGridIndexY][mapGridIndexX] == 1)
            this.wallColor = WHITE;
        else if (grid.grid[mapGridIndexY][mapGridIndexX] == 2)
            this.wallColor = RED;
        else if (grid.grid[mapGridIndexY][mapGridIndexX] == 3)
            this.wallColor = GREEN;
        else if (grid.grid[mapGridIndexY][mapGridIndexX] == 4)
            this.wallColor = BLUE;
    }
    render () {
        stroke("rgba(255, 0, 0, 0.3)");
        line(
            MINIMAP_SCALE_FACTOR * player.x,
            MINIMAP_SCALE_FACTOR * player.y,
            MINIMAP_SCALE_FACTOR * this.WallHitX,
            MINIMAP_SCALE_FACTOR * this.WallHitY
        )
    }
}

var grid = new Map();
var player = new Player();
var rays = [];

function keyPressed() {
    if (keyCode == UP_ARROW) {
        player.walkDirection = +1;
    } else if (keyCode == DOWN_ARROW) {
        player.walkDirection = -1;
    } else if (keyCode == RIGHT_ARROW) {
        player.turnDirection = +1;
    } else if (keyCode == LEFT_ARROW) {
        player.turnDirection = -1;
    }
}

function keyReleased() {
    if (keyCode == UP_ARROW) {
        player.walkDirection = 0;
    } else if (keyCode == DOWN_ARROW) {
        player.walkDirection = 0;
    } else if (keyCode == RIGHT_ARROW) {
        player.turnDirection = 0;
    } else if (keyCode == LEFT_ARROW) {
        player.turnDirection = 0;
    }
}

function castAllRays() {
    // start first ray subtracting half of the FOV
    var rayAngle = player.rotationAngle - (FOV_ANGLE / 2);

    rays = [];

    // loop all columns casting the rays
    for (var col = 0; col < NUM_RAYS; col++) {
    // for (var i = 0; i < 1; i++) {
        var ray = new Ray(rayAngle);
        ray.cast();
        rays.push(ray);
        rayAngle += FOV_ANGLE / NUM_RAYS;
    }
}

function render3DProjectedWalls() {
    // Loop every ray in the array of rays
    for(var i = 0; i < NUM_RAYS; i++) {
        var ray = rays[i];

        // get the perpendicular distance to the wall  to fix fishbowl distortion
        var correctWallDistance = ray.distance * Math.cos(ray.rayAngle - player.rotationAngle);

        // Calculate the distance to the projection plane
        var distanceProjPlane = (WINDOW_WIDTH / 2) / Math.tan(FOV_ANGLE / 2);

        // Projected wall height
        var wallStripHeight =  (TILE_SIZE / correctWallDistance) * distanceProjPlane;

        // Compute the transparency based on the wall distance.
        var alpha =  1.0;//70 / correctWallDistance;

        // Change the color to effect of black
        var colors = [];
        for (var f = 0; f < 3; f++)
        {
            if (ray.wasHitVertifical == true)
            {
                colors.push(ray.wallColor[f]);
            } else {
                if (ray.wallColor[f] > 1)
                    colors.push(Math.floor(ray.wallColor[f] / 2) + 30);
                else
                    colors.push(ray.wallColor[f]);
            }
        }
        // Render a rectangle with the calculated wall height
        fill("rgba(" + String(colors[0]) + "," + String(colors[1]) + "," + String(colors[2]) + "," + alpha + ")");
        noStroke();
        rect(
            i * WALL_STRIP_WIDTH,
            (WINDOW_HEIGHT / 2) - (wallStripHeight / 2),
            WALL_STRIP_WIDTH,
            wallStripHeight
        )
    }
}

function distanceBetweenPoints(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
}

function normalizeAngle(angle) {
    angle = angle % (2 * Math.PI);
    if (angle < 0) {
        angle = (2 * Math.PI) + angle;
    }
    return angle;
}

function setup() {
    createCanvas(WINDOW_WIDTH, WINDOW_HEIGHT);
}

function update() {
    player.update();
    castAllRays();
}

function draw() {
    clear("#212121");
    update();

    render3DProjectedWalls();

    grid.render();
    for (ray of rays) {
        ray.render();
    }
    player.render();
}