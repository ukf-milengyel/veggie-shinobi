class GameObject {
    update() {}
}

class PhysicsObject extends GameObject {
    constructor(x, y, xSpeed, ySpeed, gravity, image) {
        super();
        this.x = x;
        this.y = y;
        this.xSpeed = xSpeed;
        this.ySpeed = ySpeed;
        this.gravity = gravity;
        this.image = image;
    }

    update(delta) {
        this.x += this.xSpeed * delta;
        this.y += this.ySpeed * delta;
        this.ySpeed += this.gravity * delta;
    }
}

class Fruit extends PhysicsObject {
    constructor(x, y, xSpeed, ySpeed, gravity, image, score) {
        super(x, y, xSpeed, ySpeed, gravity, image);
        this.score = score;
    }
}