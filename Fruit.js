class GameObject {
    update() {}
}

class PhysicsObject extends GameObject {
    constructor(x, y, xSpeed, ySpeed, gravity, image, size, sizeChange, imageIndex) {
        super();
        this.x = x;
        this.y = y;
        this.xSpeed = xSpeed;
        this.ySpeed = ySpeed;
        this.gravity = gravity;
        this.image = image;
        this.imageIndex = imageIndex;
        this.size = size;
        this.sizeChange = sizeChange;
    }

    update(delta) {
        this.x += this.xSpeed * delta;
        this.y += this.ySpeed * delta;
        this.ySpeed += this.gravity * delta;
        //this.size += this.sizeChange * delta;     // todo: ?????
    }
}

class Fruit extends PhysicsObject {
    constructor(x, y, xSpeed, ySpeed, gravity, image, size, sizeChange, score) {
        super(x, y, xSpeed, ySpeed, gravity, image, size, sizeChange, 0);
        this.score = score;
    }
}