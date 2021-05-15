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
    constructor(name, hash, price, power) {
        this.name = name;
        this.hash = hash;
        this.price = price;
        this.power = power;
    }
}

hashInput.addEventListener('change', calcCards);
hashInput.addEventListener('keyup', typingTimeout);

cardInput.addEventListener('change', calcCards);
cardInput.addEventListener('keyup', typingTimeout);

let typeoutTimer;
function typingTimeout() {
    clearTimeout(typeoutTimer);
    typeoutTimer = setTimeout(calcCards, 350);
}

let lastHashrate = 0;
let lastNumCards = 2;
function calcCards() {
    let numCards = cardInput.value || 2;
    let hashRequired = hashInput.value || 0;

    //Check if this call is not the same as last time to save performance
    if(lastHashrate === hashRequired && lastNumCards === numCards) {
        //console.log('Same call twice!!');
        return;
    }
    lastHashrate = hashRequired;
    lastNumCards = numCards;

    //Catch common errors
    //Don't need to compute those cases
    if(parseInt(hashRequired) === 0) {
        setResult('', 'ERROR\nHASH POWER CAN\'T BE 0!');
        return;
    }
    if(hashRequired / 115. > numCards) {
        setResult('', 'NOT POSSIBLE. NOT ENOUGH CARDS!');
        return;
    }

    let variants;
    if(numCards > 6) {
        variants = generateRandomVariants(750000, hashRequired, numCards);
    } else {
        variants = generateVariants(numCards);
    }
    console.log(variants.length);
    //console.log(variants);

    let chosenVariant = null;
    for(let i = 0; i < variants.length; i++) {
        if(chosenVariant !== null) {
            if(variants[i].hash >= hashRequired && variants[i].price < chosenVariant.price) {
                chosenVariant = variants[i];
            }
        } else {
            if(variants[i].hash >= hashRequired) {
                chosenVariant = variants[i];
            }
        }
    }
    if(chosenVariant !== null) {
        let warning = '';
        if(numCards > 6) {
            warning = 'RESULT MIGHT NOT BE OPTIMAL. USING MONTE CARLO FOR MORE THAN 6 CARDS.';
        }
        setResult(chosenVariant.name + '  ($' + chosenVariant.price + ')\n--> ' + chosenVariant.hash + 'MH/s (' + chosenVariant.power + 'W)', warning);
    } else {
        if(numCards > 6) {
            setResult('', 'ERROR!\nNO COMBINATION FOUND!!\nRESULT MIGHT BE INACCURATE. USING MONTE CARLO METHOD...');
        } else {
            setResult('', 'ERROR! NO COMBINATION FOUND!');
        }
    }
}

function generateVariants(level) {
    console.log('generateVariants(' + level + ')');

    if(level <= 1) {
        let variants = [];
        for(let i = 0; i < hashTable.length; i++) {
            let card = hashTable[i];
            variants.push(new Variant(card.name, card.hash, card.price, card.power));
        }
        return variants;
    } else {
        let prevVariants = generateVariants(level - 1);
        let variants = [];
        const variantLength = prevVariants.length;
        for(let i = 0; i < hashTable.length; i++) {
            let card1 = hashTable[i];
            for(let k = i; k < variantLength; k++) {
                let card2 = prevVariants[k];
                let newCard = new Variant(card1.name + ' + ' + card2.name, card1.hash + card2.hash, card1.price + card2.price, card1.power + card2.power);
                variants.push(newCard);
            }
        }
        return variants;
    }
}

function generateRandomVariants(amount, hashPower, maxCards) {
    let minCards = Math.ceil(hashPower / MAX_HASH_PER_CARD);
    let filteredHashTable = hashTable.filter(hashTableFilter(hashPower, minCards));

    if(filteredHashTable.length === 1) {
        let variant = new Variant('', 0, 0, 0);
        let card = filteredHashTable[0];
        for(let i = 0; i < minCards; i++) {
            if(i !== 0) {
                variant.name += ' + ' + card.name;
            } else {
                variant.name += card.name;
            }
            variant.power += card.power;
            variant.hash += card.hash;
            variant.price += card.price;
        }

        return [variant];
    }

    let variants = [];
    for(let i = 0; i < amount; i++) {
        let numCards = Math.floor(Math.random() * (maxCards - minCards)) + minCards;
        let combinedCard = new Variant('', 0, 0, 0);
        for(let k = 0; k < numCards; k++) {
            let index = Math.floor(Math.random() * filteredHashTable.length);
            let card = filteredHashTable[index];
            if(k === 0) {
                combinedCard.name += card.name;
            } else {
                combinedCard.name += ' + ' + card.name;
            }
            combinedCard.hash += card.hash;
            combinedCard.price += card.price;
            combinedCard.power += card.power;
        }
        variants.push(combinedCard);
    }
    return variants;
}

function hashTableFilter(hashPower, minCards) {
    return function(element) {
        console.log(Math.min(0.99, minCards / 22))
        return element.hash * minCards > hashPower * Math.min(0.99, minCards / 22);
    }
}
