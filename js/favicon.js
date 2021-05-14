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
        startFaviconAnimation();
        drawFavicon();
    })
}
loadImages();

const FAVICON_SIZE = 256;
let rotation = 0;
let animateFavicon = true;
let notDrawn = true;
function drawFavicon() {
    if((imgReady && notDrawn) || (imgReady && animateFavicon)) {
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
        notDrawn = false;
    }
}

window.addEventListener('blur', stopFaviconAnimation);
window.addEventListener('focus', startFaviconAnimation);

const animateFaviconElement = document.getElementById('faviconAnim');
animateFaviconElement.addEventListener('change', () => {
    animateFavicon = animateFaviconElement.checked;
    saveAnimationPreference();
});
loadAnimationPreference();

let faviconInterval;
function startFaviconAnimation() {
    clearInterval(faviconInterval);
    faviconInterval = setInterval(drawFavicon, 33);
}

function stopFaviconAnimation() {
    clearInterval(faviconInterval);
}

function saveAnimationPreference() {
    localStorage.setItem('faviconAnimation', JSON.stringify({'enabled': animateFavicon}));
}

function loadAnimationPreference() {
    animateFavicon = JSON.parse(localStorage.getItem('faviconAnimation') || JSON.stringify({'enabled': false}))['enabled'];
    animateFaviconElement.checked = animateFavicon;
}