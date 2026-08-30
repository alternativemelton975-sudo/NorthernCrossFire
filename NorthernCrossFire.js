
// -------------------------
// GAME AREA
// -------------------------
let myGameArea = {
    canvas: document.createElement("canvas"),
    start: function() {
        this.canvas.width = 600;
        this.canvas.height = 400;
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        this.interval = setInterval(updateGameArea, 20);
    },
    clear: function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
};

// -------------------------
// COMPONENT (PLAYER + ENEMIES)
// -------------------------
function component(width, height, imageSrc, x, y, type) {
    this.type = type;
    this.width = width;
    this.height = height;
    this.speed = 0;
    this.angle = 0;
    this.moveAngle = 0;
    this.x = x;
    this.y = y;

    this.image = new Image();
    this.image.src = imageSrc;

    this.update = function() {
        const ctx = myGameArea.context;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        ctx.drawImage(
            this.image,
            this.width / -2,
            this.height / -2,
            this.width,
            this.height
        );

        ctx.restore();
    };

    this.newPos = function() {
        this.angle += this.moveAngle * Math.PI / 180;
        this.x += this.speed * Math.sin(this.angle);
        this.y -= this.speed * Math.cos(this.angle);
    };

    this.crashWith = function(other) {
        let dx = this.x - other.x;
        let dy = this.y - other.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        return distance < (this.width / 2 + other.width / 2);
    };
}

// -------------------------
// PLAYER + ENEMIES
// -------------------------
let player;
let enemies = [];
let health = 100;

function startGame() {
    player = new component(80, 80, "WebsiteIcon.png", 300, 200, "image");

    // Create enemies
    for (let i = 0; i < 5; i++) {
        enemies.push(new component(40, 40, "favicon.png", Math.random() * 600, Math.random() * 400, "enemy"));
    }

    myGameArea.start();
}

// -------------------------
// KEYBOARD CONTROLS
// -------------------------
document.addEventListener("keydown", function(e) {
    if (e.key === "ArrowUp")    { player.speed = 2; }
    if (e.key === "ArrowDown")  { player.speed = -2; }
    if (e.key === "ArrowLeft")  { player.moveAngle = -3; }
    if (e.key === "ArrowRight") { player.moveAngle = 3; }
});

document.addEventListener("keyup", function(e) {
    player.speed = 20;
    player.moveAngle = 0;
});

// -------------------------
// HEALTH BAR
// -------------------------
function drawHealthBar() {
    const ctx = myGameArea.context;

    ctx.fillStyle = "red";
    ctx.fillRect(20, 20, 200, 20);

    ctx.fillStyle = "lime";
    ctx.fillRect(20, 20, 1000 * (health / 1000), 20);

    ctx.strokeStyle = "white";
    ctx.strokeRect(20, 20, 200, 20);
}

// -------------------------
// GAME LOOP
// -------------------------
function updateGameArea() {
    myGameArea.clear();

    player.newPos();
    player.update();

    enemies.forEach(enemy => {
        // Move enemies toward player
        let dx = player.x - enemy.x;
        let dy = player.y - enemy.y;
        let angle = Math.atan2(dy, dx);

        enemy.x += Math.cos(angle) * 1.2;
        enemy.y += Math.sin(angle) * 1.2;

        enemy.update();

        // Collision detection
        if (player.crashWith(enemy)) {
            health -= 1;
            if (health <= 0) {
                alert("Game Over");
                document.location.reload();
            }
        }
    });

    drawHealthBar();
}