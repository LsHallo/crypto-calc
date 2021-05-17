const MAX_HASH_PER_CARD = 115;

const hashInput = document.getElementById('hash');
const cardInput = document.getElementById('cardNum');
const result = document.getElementById('result');
const warning = document.getElementById('warning');

function setWarning(message) {
    if(message.length <= 0) {
        warning.classList.add('hidden');
    } else {
        warning.classList.remove('hidden');
    }
    warning.innerText = message;
}

function setResult(result_text, warning) {
    result.innerText = result_text;
    setWarning(warning);
}

const hashTable = [
    {
        'name': '5600XT',
        'power': 140,
        'hash': 42,
        'price': 749
    },
    {
        'name': '5700XT',
        'hash': 54,
        'price': 1099,
        'power': 225,
    },
    {
        'name': 'R9 380',
        'hash': 18,
        'price': 235,
        'power': 150,
    },
    {
        'name': 'RTX 3090',
        'hash': 115,
        'price': 2399,
        'power': 300,
    },
    {
        'name': 'GTX 1060',
        'hash': 23,
        'price': 280,
        'power': 115,
    },
    {
        'name': 'GTX 1070',
        'hash': 26,
        'price': 335,
        'power': 135,
    },
    {
        'name': 'RX480',
        'hash': 28,
        'price': 355,
        'power': 170,
    },
    {
        'name': 'RX570',
        'hash': 29,
        'price': 499,
        'power': 150,
    },
    {
        'name': 'Vega 56',
        'hash': 50,
        'price': 650,
        'power': 200,
    },
    {
        'name': 'RTX 3060Ti',
        'hash': 61,
        'price': 1350,
        'power': 190,
    },
    {
        'name': 'RTX 3080Ti',
        'hash': 98,
        'price': 2199,
        'power': 290,
    },
    {
        'name': 'RX470',
        'hash': 22,
        'price': 250,
        'power': 120,
    },
    {
        'name': 'RTX 2060',
        'hash': 27,
        'price': 699,
        'power': 150,
    },
    {
        'name': 'RTX 2080',
        'hash': 50,
        'price': 999,
        'power': 230,
    }
];

class Variant {
    constructor() {
        this.cards = [];
        this.hash = 0;
        this.price = 0;
        this.power = 0;
    }

    addCard() {
        for(let i = 0; i < arguments.length; i++) {
            const card = arguments[i];
            if(card instanceof Variant) {
                card.cards.map(card => {
                    this.hash += card.hash;
                    this.price += card.price;
                    this.power += card.power;
                    this.cards.push(card);
                });
            } else {
                this.hash += card.hash;
                this.price += card.price;
                this.power += card.power;

                this.cards.push(card);
            }
        }
    }

    getText() {
        this.cards.sort((first, second) => {
            return second.hash - first.hash;
        });

        let cardOccurrences = {};
        this.cards.map((card) => {
            if(cardOccurrences[card.name] !== undefined) {
                cardOccurrences[card.name]++;
            } else {
                cardOccurrences[card.name] = 1;
            }
        });

        let text = '';
        for(const [key, value] of Object.entries(cardOccurrences)) {
            text += `${value}x ${key} + `
        }
        text = text.substring(0, text.lastIndexOf('+') - 1);
        text += `\n-> ${this.hash}MH/s`;
        text += `\n-> $${this.price}`;
        text += `\n-> ${this.power}W`;
        return text;
    }
}

hashInput.addEventListener('change', calcCards);
hashInput.addEventListener('keyup', typingTimeout);

cardInput.addEventListener('change', calcCards);
cardInput.addEventListener('keyup', typingTimeout);

// Timer to not fire on every keyup event but only after typing has stopped for a short period of time
let typeoutTimer;
function typingTimeout() {
    clearTimeout(typeoutTimer);
    typeoutTimer = setTimeout(calcCards, 650);
}

let lastHashrate = 0;
let lastNumCards = 2;
let cardLimit = 8;
function calcCards() {
    let numCards = parseInt(cardInput.value) || 2;
    let hashRequired = parseInt(hashInput.value) || 0;

    // Check if this call is not the same as last time to save performance
    // Event listeners might fire twice etc...
    if(lastHashrate === hashRequired && lastNumCards === numCards) {
        return;
    }
    lastHashrate = hashRequired;
    lastNumCards = numCards;

    // Catch common errors
    // Don't need to compute those cases
    if(hashRequired <= 0) {
        setResult('', 'ERROR\nHASH POWER CAN\'T BE 0!');
        return;
    }
    if(hashRequired / MAX_HASH_PER_CARD > numCards) {
        setResult('', 'NOT POSSIBLE. NOT ENOUGH CARDS!');
        return;
    }
    calcRequest(hashRequired, numCards);

    let variants;
    let chosenVariant = null;
    if(numCards > cardLimit) {
        variants = generateRandomVariants(750000, hashRequired, numCards);
        for(let i = 0; i < variants.length; i++) {
            chosenVariant = isBestVariant(variants[i], chosenVariant);
        }
    } else {
        let minCards = Math.ceil(hashRequired / MAX_HASH_PER_CARD);
        for(let i = minCards; i <= numCards; i++) {
            variants = generateVariants(hashTable, i);
            console.log(variants.length);
            for(let k = 0; k < variants.length; k++) {
                chosenVariant = isBestVariant(variants[k], chosenVariant);
            }
        }
    }

    if(chosenVariant !== null) {
        let warning = '';
        if(numCards > cardLimit) {
            warning = `RESULT MIGHT NOT BE OPTIMAL. USING MONTE CARLO FOR MORE THAN ${cardLimit} CARDS.`;
        }
        setResult(chosenVariant.getText(), warning);
    } else {
        if(numCards > cardLimit) {
            setResult('', 'ERROR!\nNO COMBINATION FOUND!!\nRESULT MIGHT BE INACCURATE. USING MONTE CARLO METHOD...');
        } else {
            setResult('', 'ERROR! NO COMBINATION FOUND!');
        }
    }

    function isBestVariant(variant, currentBest) {
        if(currentBest !== null) {
            if(variant.hash >= hashRequired && variant.price < currentBest.price) {
                currentBest = variant;
            }
        } else {
            if(variant.hash >= hashRequired) {
                currentBest = variant;
            }
        }
        return currentBest;
    }
}

function generateVariants(variants, level) {
    if(level <= 1) {
        return variants.map((card) => {
            let variant = new Variant();
            variant.addCard(card);
            return variant;
        });
    }
    const results = [];
    variants.forEach((card1, index) => {
        const smallerVariants = generateVariants(variants.slice(index), level - 1);
        smallerVariants.forEach((card2) => {
            let variant = new Variant();
            variant.addCard(card1, card2);
            results.push(variant);
        });
    });
    return results;
}

//generateVariants returns an Array of all combinations at a certain level
//generateAllVariants saves each level from 1 deep up to card max
function generateAllVariants(variants, level) {
    const cache = [];
    for(let n = 1; n <= level; n++) {
        cache.push(generateVariants(variants, n));
    }
    return cache.flat();
}

function generateRandomVariants(amount, hashPower, maxCards) {
    let minCards = Math.ceil(hashPower / MAX_HASH_PER_CARD);
    // Filter cards based on if they could achieve the hash power by themselves
    let filteredHashTable = hashTable.filter(hashTableFilter(hashPower, minCards, maxCards));
    if(window.debug) console.log(filteredHashTable);

    // If there is only one card left return the only possibility instead of generating 650k samples
    if(filteredHashTable.length === 1) {
        let variant = new Variant();
        let card = filteredHashTable[0];
        for(let i = 0; i < minCards; i++) {
            // if(i !== 0) {
            //     variant.name += ' + ' + card.name;
            // } else {
            //     variant.name += card.name;
            // }
            // variant.power += card.power;
            // variant.hash += card.hash;
            // variant.price += card.price;
            variant.addCard(card);
        }

        return [variant];
    }

    let variants = [];
    for(let i = 0; i < amount; i++) {
        let numCards = Math.floor(Math.random() * (maxCards - minCards)) + minCards;
        let combinedCard = new Variant();
        for(let k = 0; k < numCards; k++) {
            let index = Math.floor(Math.random() * filteredHashTable.length);
            let card = filteredHashTable[index];
            combinedCard.addCard(card);
        }
        variants.push(combinedCard);
    }
    return variants;
}

function calcRequest(hash, num_gpu) {
    let uid = getCookie('uid');
    if(uid === undefined) {
        uid = generateUid();
    }
    setCookie(uid);

    let http = new XMLHttpRequest();
    let url = 'https://io.lshallo.eu/crypto-calc/request.php';
    let params = 'hash=' + encodeURIComponent(hash) + '&num_gpu=' + encodeURIComponent(num_gpu) + '&uid=' + encodeURIComponent(uid);
    http.open('POST', url, true);

    http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    http.send(params);

    function setCookie(uid) {
        const _30days = 30 * 24 * 3600000;
        document.cookie = "uid=" + uid + "; expires=" + new Date(new Date().getTime() + _30days).toUTCString();
    }

    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if(parts.length === 2) return parts.pop().split(';').shift();
    }

    function generateUid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
}

function hashTableFilter(hashPower, minCards, maxCards) {
    return function(element) {
        console.log(Math.min(0.99, minCards / 22))
        return element.hash * maxCards > hashPower * Math.min(0.99, minCards / 22);
    }
}
