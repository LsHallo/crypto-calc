const cvsContainer = document.getElementById('bg-container');
const canvas = document.getElementById('background');
const ctx = canvas.getContext('2d');

window.addEventListener('resize', resizeCanvas);
function resizeCanvas() {
    canvas.width = cvsContainer.clientWidth;
    canvas.height = cvsContainer.clientHeight;
}
resizeCanvas();

let img = [
    //ASUS
    'img/3070-tuf.png',
    'img/3070-strix.png',
    'img/3080-tuf.png',
    //MSI
    'img/3070-gaming-trio.png',
    'img/3080-gaming-trio.png',
    'img/3090-suprim.png',
    //EVGA
    'img/3060-xc.png',
    'img/3070-ftw3.png'
];
function setupCanvas() {
    let loadingPromises = [];
    for(let i = 0; i < img.length; i++) {
        loadingPromises.push(new Promise(resolve => {
            let image = new Image();
            image.onload = () => {
                resolve(image);
            };
            image.src = img[i];
        }));
    }
    Promise.all(loadingPromises).then(res => {
        img = res;
        for(let i = 0; i < 75; i++) {
            cards.push(new FallingCard(ctx, img[Math.floor(Math.random() * img.length)]));
        }
        drawCanvas();
    });
}
setupCanvas();

let lastIteration = performance.now();
let cards = [];
function drawCanvas() {
    let delta = (performance.now() - lastIteration) / 16;
    ctx.clearRect(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);
    for(let i = 0; i < cards.length; i++) {
        cards[i].draw();
        cards[i].update(delta);
    }
    requestAnimationFrame(drawCanvas);
    lastIteration = performance.now();
}
