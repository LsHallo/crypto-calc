let imgReady = false;
let bladeImg;
let ringImg;

let frames;
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
        Promise.all(generateFaviconAnimationFrames()).then(generateFrames => {
            frames = generateFrames;
            imgReady = true;
            startFaviconAnimation();
        });
    });
}
loadImages();

const FAVICON_SIZE = 256;
let rotation = 0;
let animateFavicon = true;
let notDrawn = true;
let frameIndex = 0;
function drawFavicon() {
    if((frames !== null && animateFavicon && imgReady) || (frames !== null && notDrawn && imgReady)) {
        document.getElementById('favicon').href = frames[frameIndex];
        frameIndex = (frameIndex  + 1) % frames.length;
        notDrawn = false;
    }
}

/***
 * Generate blobs required for a sixth rotation of the fan blades.
 * Blob urls can then be accessed after the promises return.
 * @return {Promise[]} Array of promises
 */
function generateFaviconAnimationFrames() {
    let framePromises = [];
    const canvas = document.getElementById('hidden-canvas');
    canvas.width = canvas.height = FAVICON_SIZE;
    const ctx = canvas.getContext('2d');
    while(rotation <= (Math.PI * 2) / 6) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(ringImg, 0, 0, FAVICON_SIZE, FAVICON_SIZE);
        ctx.save();
        ctx.translate(FAVICON_SIZE / 2, FAVICON_SIZE / 2);
        ctx.rotate(-rotation);
        ctx.drawImage(bladeImg, -FAVICON_SIZE / 2, -FAVICON_SIZE / 2, FAVICON_SIZE, FAVICON_SIZE);
        ctx.restore();
        rotation = rotation + .2;

        framePromises.push(new Promise(resolve => {
            canvas.toBlob(img => {
                resolve(URL.createObjectURL(img));
            }, 'image/png');
        }));
    }
    return framePromises;
}

window.addEventListener('blur', stopFaviconAnimation);
window.addEventListener('focus', startFaviconAnimation);

let faviconInterval;
function startFaviconAnimation() {
    clearInterval(faviconInterval);
    faviconInterval = setInterval(drawFavicon, 100);
}

function stopFaviconAnimation() {
    clearInterval(faviconInterval);
}


const animateFaviconElement = document.getElementById('faviconAnim');
animateFaviconElement.addEventListener('change', () => {
    animateFavicon = animateFaviconElement.checked;
    saveAnimationPreference();
});
loadAnimationPreference();

function saveAnimationPreference() {
    localStorage.setItem('faviconAnimation', JSON.stringify({'enabled': animateFavicon}));
}

function loadAnimationPreference() {
    animateFavicon = JSON.parse(localStorage.getItem('faviconAnimation') || JSON.stringify({'enabled': true}))['enabled'];
    animateFaviconElement.checked = animateFavicon;
}


