let imgReady = false;
let bladeImg;
let ringImg;

function loadImages() {
    let imagePromises = [
        new Promise(resolve => {
            bladeImg = new Image();
            bladeImg.onload = () => {
                resolve();
            }
            bladeImg.src = 'img/fan-blades.png';
        }),
        new Promise(resolve => {
            ringImg = new Image();
            ringImg.onload = () => {
                resolve();
            }
            ringImg.src = 'img/fan-ring.png';
        })
    ];

    Promise.all(imagePromises).then(() => {
        imgReady = true;
        //startFaviconAnimation();
        drawFavicon();
    })
}
loadImages();

const FAVICON_SIZE = 256;
let rotation = 0;
function drawFavicon() {
    if(imgReady) {
        const canvas = document.getElementById('hidden-canvas');
        canvas.width = canvas.height = FAVICON_SIZE;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(ringImg, 0, 0, FAVICON_SIZE, FAVICON_SIZE);
        ctx.save();
        ctx.translate(FAVICON_SIZE / 2, FAVICON_SIZE / 2);
        ctx.rotate(rotation);
        ctx.drawImage(bladeImg, -FAVICON_SIZE / 2, -FAVICON_SIZE / 2, FAVICON_SIZE, FAVICON_SIZE);
        ctx.restore();
        rotation = (rotation + .05) % (Math.PI * 2);

        document.getElementById('favicon').href = canvas.toDataURL('image/png');
    }
}

/*
window.addEventListener('blur', stopFaviconAnimation);
window.addEventListener('focus', startFaviconAnimation);

let faviconInterval;
function startFaviconAnimation() {
    clearInterval(faviconInterval);
    //faviconInterval = setInterval(drawFavicon, 33);
}

function stopFaviconAnimation() {
    clearInterval(faviconInterval);
}
*/