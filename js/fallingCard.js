let chosenCards = Array.from({length: 50}, () => 0);

class FallingCard {
    // Declare width and height since destructuring seems to confuse IDE
    width;
    height;
    constructor(ctx) {
        this.ctx = ctx;
        this.randomImage();
        this.randomX();
        this.randomY(true);
        this.randomSpeed();
        this.rotation = Math.random() * (Math.PI * 2);
        this.randomRotation();
        this.randomDirection();
    }

    draw() {
        this.ctx.save()
        this.ctx.translate(Math.floor(this.x), Math.floor(this.y));
        this.ctx.rotate(this.rotation * this.direction);
        this.ctx.drawImage(this.img, Math.floor(-this.width / 2), Math.floor(-this.height / 2), this.width, this.height);
        this.ctx.restore();
    }

    update(delta) {
        // Probably visited another tab. Keep cards from moving erratically
        if(delta > 15) {
            delta = 1;
        }
        // Cap rotation at 2*PI
        this.rotation = (this.rotation + this.rotationSpeed * delta) % (Math.PI * 2);
        this.y += this.speed * delta;
        // Reset card to top when it falls off the screen at the bottom
        if(this.y - this.height > this.ctx.canvas.clientHeight) {
            this.randomImage();
            this.randomX();
            this.randomY(false);
            this.randomSpeed();
            this.randomRotation();
            this.randomDirection();
        }
    }

    randomX() {
        this.x = Math.random() * (ctx.canvas.clientWidth - this.width) + this.width / 2;
    }

    randomY(initial = false) {
        if(initial === true) {
            let height = this.ctx.canvas.clientHeight;
            this.y = Math.random() * height * 2.25 - height;
        } else {
            this.y = -Math.max(this.height, this.width) * 1.25;
        }
    }

    randomSpeed() {
        this.speed = Math.random() * .65 + .3;
    }

    randomRotation() {
        this.rotationSpeed = Math.random() * 0.008 + 0.007;
    }

    randomDirection() {
        this.direction = Math.random() < .5?-1:1;
    }

    randomImage() {
        const index = Math.floor(Math.random() * CardImages.length);
        chosenCards[index]++;
        this.img = CardImages[index];
        [this.width, this.height] = scaleImg(this.img.width, this.img.height, Math.floor(Math.random() * 70) + 80);
    }
}

/***
 * Scale two sides of an image proportionally
 * @param imgWidth Width of image
 * @param imgHeight Height of image
 * @param maxSize Longest side constraint
 * @return {number[]} scaled width and height as array
 */
function scaleImg(imgWidth, imgHeight, maxSize) {
    const scalingFactor = maxSize / Math.max(imgWidth, imgHeight);
    return [Math.floor(imgWidth * scalingFactor), Math.floor(imgHeight * scalingFactor)];
}