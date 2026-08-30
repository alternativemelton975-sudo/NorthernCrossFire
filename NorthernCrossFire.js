
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

let player;
let enemies = [];
let health = 100;
let keys = {};
let isGameOver = false;
let deathMessage = null;

function startGame() {
    player = new component(80, 80, "WebsiteIcon.png", 300, 200, "image");

    for (let i = 0; i < 5; i++) {
        enemies.push(new component(40, 40, "favicon.png", Math.random() * 600, Math.random() * 400, "enemy"));
    }

    myGameArea.start();
    createDeathMessage();
}

function createDeathMessage() {
    deathMessage = document.createElement("div");
    deathMessage.id = "game-over";
    deathMessage.className = "hidden";
    deathMessage.innerHTML = `
        <div class="message-card">
            <h3>Game Over</h3>
            <p>You were caught in the fire.</p>
        </div>
    `;
    deathMessage.addEventListener("click", function() {
        deathMessage.classList.add("hidden");
    });
    document.body.appendChild(deathMessage);
}

function triggerDeath() {
    if (isGameOver) {
        return;
    }

    isGameOver = true;
    player.speed = 0;
    player.moveAngle = 0;
    deathMessage.classList.remove("hidden");
}

document.addEventListener("keydown", function(e) {
    const key = e.key.toLowerCase();
    if (["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(key)) {
        e.preventDefault();
    }

    if (isGameOver) {
        return;
    }

    keys[key] = true;
});

document.addEventListener("keyup", function(e) {
    const key = e.key.toLowerCase();
    keys[key] = false;
});

function handlePlayerMovement() {
    if (isGameOver) {
        return;
    }

    let dx = 0;
    let dy = 0;

    if (keys.w || keys.arrowup) {
        dy -= 1;
    }
    if (keys.s || keys.arrowdown) {
        dy += 1;
    }
    if (keys.a || keys.arrowleft) {
        dx -= 1;
    }
    if (keys.d || keys.arrowright) {
        dx += 1;
    }

    if (dx !== 0 || dy !== 0) {
        const distance = Math.hypot(dx, dy) || 1;
        const moveSpeed = 2.5;
        const moveX = (dx / distance) * moveSpeed;
        const moveY = (dy / distance) * moveSpeed;

        player.x += moveX;
        player.y += moveY;
        player.angle = Math.atan2(moveY, moveX);
    }

    player.x = Math.max(player.width / 2, Math.min(myGameArea.canvas.width - player.width / 2, player.x));
    player.y = Math.max(player.height / 2, Math.min(myGameArea.canvas.height - player.height / 2, player.y));
}

function drawHealthBar() {
    const ctx = myGameArea.context;
    const barWidth = 200;
    const healthWidth = barWidth * (health / 100);

    ctx.fillStyle = "#3b0d0d";
    ctx.fillRect(20, 20, barWidth, 20);

    ctx.fillStyle = "#5ae65a";
    ctx.fillRect(20, 20, healthWidth, 20);

    ctx.strokeStyle = "#f5f5f5";
    ctx.strokeRect(20, 20, barWidth, 20);
}

function updateGameArea() {
    myGameArea.clear();

    if (!isGameOver) {
        handlePlayerMovement();
        player.update();

        enemies.forEach(enemy => {
            if (isGameOver) {
                return;
            }

            let dx = player.x - enemy.x;
            let dy = player.y - enemy.y;
            let angle = Math.atan2(dy, dx);

            enemy.x += Math.cos(angle) * 1.2;
            enemy.y += Math.sin(angle) * 1.2;

            enemy.update();

            if (player.crashWith(enemy)) {
                health -= 1;
                if (health <= 0) {
                    triggerDeath();
                }
            }
        });
    }

    drawHealthBar();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startGame);
} else {
    startGame();
}