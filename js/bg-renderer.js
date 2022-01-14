let CardImages = [
    //**NVIDIA**//
    //NVIDIA
    'img/3070-fe.png',
    'img/3080-fe.png',
    'img/3080-fe.png',
    //ASUS
    'img/3070-tuf.png',
    'img/3070-strix.png',
    //MSI
    'img/3070-gaming-trio.png',
    'img/3090-suprim.png',
    //EVGA
    'img/3060-xc.png',
    'img/3070-ftw3.png',
    //GIGABYTE
    'img/3060-elite.png',
    'img/3070-gaming.png',
    'img/3090-xtreme.png',
    //GAINWARD
    'img/3070-phoenix.png',
    //GALAX
    'img/3060-ex.png',
    'img/3090-hof.png',
    //ZOTAC
    'img/3070-twin.png',

    //**AMD**//
    //AMD
    'img/6800xt-amd.png',
    'img/6700xt-amd.png',
    //POWERCOLOR
    'img/6800xt-dragon.png',
    //SAPPHIRE
    'img/6600xt-speedster.png',
    'img/6800xt-nitro.png'
];

const gpuAnimSetting = document.getElementById('gpuAnim');
const cvsContainer = document.getElementById('bg-container');
const canvas = document.getElementById('background');
const ctx = canvas.getContext('2d');
let animateCards = true;
let lastIteration = performance.now();
let cards = [];

function resizeCanvas() {
    canvas.width = cvsContainer.clientWidth;
    canvas.height = cvsContainer.clientHeight;
    updateCardAmount();
    if(!animateCards) {
        distributeCards();
        drawCanvas();
    }
}

/***
 * Preload all required images and start drawing the canvas once finished.
 */
function setupCanvas() {
    let loadingPromises = [];
    for(let i = 0; i < CardImages.length; i++) {
        loadingPromises.push(new Promise(resolve => {
            let image = new Image();
            image.onload = () => {
                resolve(image);
            };
            image.src = CardImages[i];
        }));
    }
    Promise.all(loadingPromises).then(res => {
        CardImages = res;
        updateCardAmount();
        loadCardAnimationPreference();
        resizeCanvas();
        drawCanvas();
        window.addEventListener('resize', resizeCanvas);
    });
}
setupCanvas();

function drawCanvas() {
    let delta = (performance.now() - lastIteration) / 16;
    ctx.clearRect(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);
    for(let i = 0; i < cards.length; i++) {
        cards[i].draw();
        cards[i].update(delta);
    }
    if(animateCards) {
        requestAnimationFrame(drawCanvas);
    }
    lastIteration = performance.now();
}

function distributeCards() {
    for(let i = 0; i < cards.length; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        cards[i].x = x;
        cards[i].y = y;
    }
}

function updateCardAmount() {
    const numCards = Math.ceil(calcNumCards());
    if(cards.length === numCards) {
        return;
    }
    if(cards.length > numCards) {
        cards = cards.slice(0, numCards);
    } else {
        for(let i = Math.max(0, cards.length - 1); i < numCards; i++) {
            cards.push(new FallingCard(ctx));
        }
    }
}

function calcNumCards() {
    let factor = 1 / 19000;
    if(!animateCards) {
        factor = 1 / 25000;
    }
    return Math.min((window.innerWidth * window.innerHeight) * factor, 125); // Restrict to 125 to avoid ruining somebody's performance
}

gpuAnimSetting.addEventListener('change', () => {
    animateCards = gpuAnimSetting.checked;
    saveCardAnimationPreference();
    drawCanvas();
});

function loadCardAnimationPreference() {
    animateCards = JSON.parse(localStorage.getItem('cardAnim') || '{"animate": "true"}')['animate'];
    if(animateCards === undefined || animateCards === null) {
        animateCards = true;
    }
    gpuAnimSetting.checked = animateCards;
}

function saveCardAnimationPreference() {
    localStorage.setItem('cardAnim', JSON.stringify({'animate': animateCards}));
}
