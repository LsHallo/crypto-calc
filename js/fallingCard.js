class FallingCard {
    constructor(ctx, img) {
        this.ctx = ctx;
        this.img = img;
        const size = this.scaleImg(img.width, img.height, Math.floor(Math.random() * 70) + 100);
        this.width = size[0];
        this.height = size[1];
        this.randomX();
        this.randomY(true);
        this.randomSpeed();
        this.rotation = Math.random() * (Math.PI * 2);
        this.rotationSpeed = Math.random() * 0.008 + 0.007;
        this.direction = Math.random() < .5?-1:1;
    }

    draw() {
        this.ctx.save()
        this.ctx.translate(this.x, this.y);
        this.ctx.rotate(this.rotation * this.direction);
        this.ctx.drawImage(this.img, -this.width / 2, -this.height / 2, this.width, this.height);
        this.ctx.restore();
    }

    update(delta) {
        if(delta > 5) {
            delta = 1;
        }
        this.rotation = ((this.rotation + this.rotationSpeed * delta) % (Math.PI * 2));
        this.y += this.speed * delta;
        if(this.y - this.height > this.ctx.canvas.clientHeight) {
            this.randomX();
            this.randomY(false);
            this.randomSpeed();
        }
    }

    randomX() {
        this.x = Math.random() * (ctx.canvas.clientWidth - this.width) + this.width / 2;
    }

    randomY(initial = false) {
        if(initial === true) {
            let height = this.ctx.canvas.clientHeight;
            this.y = Math.random() * height * 2 - height;
        } else {
            this.y = -Math.random() * this.height * 3 - this.height;
        }
    }

    randomSpeed() {
        this.speed = Math.random() * .65 + .3;
    }


    scaleImg(imgWidth, imgHeight, maxSize) {
        const scalingFactor = maxSize / Math.max(imgWidth, imgHeight);
        return [imgWidth * scalingFactor, imgHeight * scalingFactor];
    }

}