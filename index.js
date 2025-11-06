const bgm = document.getElementById("bgm");
const notification = document.getElementById("notification");
const startButton = document.getElementById("start");
const basicAtkButton = document.getElementById("basicatkbutton");
const skillButton = document.getElementById("skillbutton");
const ultimateButton = document.getElementById("ultimatebutton");
const skillpointscurrentdisplay = document.getElementById("currentsp");
const spdivider = document.getElementById("spdivider");
const skillpointmaxdisplay = document.getElementById("maxsp");
const pauseMusicButton = document.getElementById("pauseMusic");
let total = 0;
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
const backgroundList = [
    { name: "Herta Space Station", src: "Space_Anchor_Electrical_Room.webp", affiliations: ["Antimatter Legion", "Herta Space Station"] },
    { name: "Astral Express", src: "2ddeccfe02c63d8b59e96e0b18cee2d6_3750609136158297103.webp", affiliations: ["None", "Astral Express"] }
]
const backgroundImage = document.getElementById("background");
let sp = 3;
document.getElementById("currentsp").innerText = sp;
let spmax = 5;
document.getElementById("maxsp").innerText = spmax;
let turnOrder = [];
let characterList = [];
let enemyList = [];
let targetList = [];
let turnOrderCheck = 0;
const bgmList = [
    { name: "Scarab King", src: "Aberrant Receptacle • Starcrusher Swarm King Boss Theme (Extended) Perfect Loop- HSR Version 1.6 OST [EjCeuPEq4ro].mp3" },
    { name: "Lygus", src: "Lygus Boss Theme (Extended) - Honkai_ Star Rail 3.5 OST.mp3" },
    { name: "Nikador", src: "Nikador Boss Battle Theme Final Battle Honkai Star Rail 3.0 OST.mp3" },
    { name: "Aquila", src: "(Extended) Proi Proi Hyacine Song - Aquila Boss Theme Phase 3Honkai Star Rail 3.3 OST.mp3" },
    { name: "Cocolia", src: "Wildfire [30 Minutes Perfect Loop] [apsyvq-DP7A].mp3" },
    { name: "Judge of Oblivion", src: "Unholy Blood Ichor Memosprite_ Judge of Oblivion Boss Theme (Extended) - Honkai_ Star Rail 3.6 OST.mp3" },
];
bgm.loop = true;

const elementList = [
    { name: "Fire", img: "st,large,507x507-pad,600x600,f8f8f8.u3.jpg" },
    { name: "Physical", img: "Type_Physical.webp" },
    { name: "Lightning", img: "Type_Lightning.png" },
    { name: "Imaginary", img: "9b8f9a121dd836de734838c287eb4737.jpg" },
    { name: "Quantum", img: "Type_Quantum.webp" },
    { name: "Wind", img: "Type_Wind.webp" },
    { name: "Ice", img: "Type_Ice.png" },
]
let selectedTarget = document.querySelector('.target')
const volumeUp = document.getElementById("volumeUp");
const volumeDown = document.getElementById("volumeDown");
const volumePercent = document.getElementById("volumePercent");
const changeMusic = document.getElementById("changeMusic");
const infoText = document.getElementById("infotext").textContent;

function onStartUp() {

    for (let i = enemyList.length; i < 5; i++) {
        const container = document.getElementById(`enemy${i + 1}-weakness`);
        if (container) container.style.display = "none";
    }

    basicAtkButton.style.display = "none";
    skillButton.style.display = "none";
    ultimateButton.style.display = "none";
    skillpointscurrentdisplay.style.display = "none";
    spdivider.style.display = "none";
    skillpointmaxdisplay.style.display = "none";
    document.getElementById("basicatkbutton").disabled = true;
    document.getElementById("skillbutton").disabled = true;
    document.getElementById("ultimatebutton").disabled = true;

}
onStartUp();


class Unit {
    constructor({ name, img, level, affiliation, resource, resourcemax, basehp, baseatk, basedef, basespeed, hpgrowth, atkgrowth, defgrowth }) {
        this.name = name;
        this.img = img;
        this.level = level;
        this.affiliation = affiliation;
        this.stats = {
            hp: basehp + level * hpgrowth,
            atk: baseatk + level * atkgrowth,
            def: basedef + level * defgrowth,
            speed: basespeed,
            effectres: 0.05,
            defignore: 0,
            defreduction: 0,
            vulnerability: 0,
            DoTvulnerability: 0,
            damageBonus: 0,
            defBonus: 0,
            vuln: 1,
            resi: 0,
            damageMitigation: 0,
        }
        this.statgrowth = {
            hp: hpgrowth,
            atk: atkgrowth,
            def: defgrowth
        };
        this.resource = resource;
        this.resourcemax = resourcemax;

        this.currentHP = this.stats.hp || 0;
        this.isBroken = false;
    }
    get isAlive() {
        return this.currentHP > 0
    }
}

class Character extends Unit {
    constructor({ star, path, element, resource, resourcemax, breakeffect, ...unitProps }) {
        super(unitProps);
        this.star = star;
        this.path = path;
        this.element = element;
        this.resourcemax = resourcemax;
        this.resource = (resourcemax * 0.25);
        this.breakeffect = 1;
        this.stats.crrate = 0.05;
        this.stats.critDmg = 0.5;
        this.stats.resPen = 0;
        this.stats.damageBonus = 0;
        this.stats.defBonus = 0;
    };
}

class Enemy extends Unit {
    constructor({ name, img, level, affiliation, weaknesses = {}, hp, atk, def, speed, toughness, hpgrowth, atkgrowth, defgrowth }) {
        super({
            name,
            img,
            level,
            affiliation,
            basehp: hp,
            baseatk: atk,
            basedef: def,
            basespeed: speed,
            hpgrowth: hpgrowth,
            atkgrowth: atkgrowth,
            defgrowth: defgrowth
        });
        this.currenttoughness = toughness;
        this.maxtoughness = toughness;
        this.weaknesses = Object.values(weaknesses).map(w => ({ weakness: w }));
    }
}

class DestructionMC extends Character {
    constructor(level) {
        super({
            name: "Trailblazer",
            img: "honkai-star-rail-trailblazer-destroyer-best-builds.avif",
            level: level,
            affiliation: "Astral Express",
            star: "5*",
            path: "Destruction",
            element: "Physical",
            resource: 25,
            resourcemax: 100,
            basehp: 209,
            baseatk: 99,
            basedef: 70,
            basespeed: 102,
            hpgrowth: 15,
            atkgrowth: 7.5,
            defgrowth: 6,
        });

        this.basic = {
            name: "Batter Up!",
            description: "Deal Physical damage to one designated enemy.",
            modifier: 0.75,
            sfx: new Audio("Minecraft Fall Damage (Crack) - Sound Effect (HD).mp3"),
            execute: (targets) => {
                const target = targets[0];
                this.basic.sfx.play();
                    const dmg = dealDamageHP(this, target, this.basic.modifier);
                    target.currentHP -= dmg;
                    if (target.weaknesses.some(w => w.weakness === this.element)) {
                        target.currenttoughness -= (10 * this.breakeffect);
                    }
                    this.resource = Math.min(this.resource + 10, this.resourcemax);
                    if (sp < spmax) {
                        sp += 1;
                        document.getElementById("currentsp").innerText = sp;
                    }
                    document.getElementById("dmgtext").innerText = `${this.name} dealt ${dmg} damage to ${target.name}`;
                    addTotalDamage(dmg);
                }
            },

        this.skill = {
            name: "Home Run Hit",
            description: "Deal Physical damage to one designated enemy and adjacent targets.",
            modifier1: 1.5,
            modifier2: 0.75,
            sfx: "",
            execute: (targets) => {

                if (sp != 0) {
                    const main = targets[0];
                    const index = enemyList.indexOf(main);

                    const dmgMain = dealDamageHP(this, main, this.skill.modifier1);
                    main.currentHP -= dmgMain;
                    if (main.weaknesses.some(w => w.weakness === this.element)) {
                        main.currenttoughness -= ( 20 * this.breakeffect );
                    }

                    const left = enemyList[index - 1];
                    const right = enemyList[index + 1];
                    const leftdmg = left ? dealDamageHP(this, left, this.skill.modifier2) : 0;
                    const rightdmg = right ? dealDamageHP(this, right, this.skill.modifier2) : 0;
                    if (left) left.currentHP -= leftdmg;
                    if (left) { if (left.weaknesses.some(w => w.weakness === this.element)) left.currenttoughness -= ( 10 * this.breakeffect ) }
                    if (right) right.currentHP -= rightdmg;
                    if (right) if (right.weaknesses.some(w => w.weakness === this.element)) { right.currenttoughness -= ( 10 * this.breakeffect ) }
                    this.resource = Math.min(this.resource + 20, this.resourcemax);
                    addTotalDamage(dmgMain);
                    addTotalDamage(leftdmg);
                    addTotalDamage(rightdmg);
                    document.getElementById("dmgtext").innerText = `${this.name} dealt ${dmgMain} damage to ${main.name} and ${(Math.ceil(dmgMain / 2))} damage to adjacent targets!`
                }
                else {
                    notification.innerText = "Not enough skill points!"
                }
            },
        };

        this.ultimate = {
            name: "Ace Player",
            description: "Deal Physical damage all enemy targets.",
            modifier: 2,
            sfx: "",
            execute: () => {
                if (this.resource >= this.resourcemax) {
                    enemyList.forEach(enemy => {
                        const dmg = dealDamageHP(this, enemy, this.ultimate.modifier);
                        if (enemy.weaknesses.some(w => w.weakness === this.element)) {
                            enemy.currenttoughness -= 20;
                        }
                        enemy.currentHP -= dmg;
                        console.log(this.resource)
                        turnOrder[0].resource = 5;
                        addTotalDamage(dmg);
                        document.getElementById("dmgtext").innerText = `${this.name} dealt ${dmg} damage to all enemies!`
                        console.log(this.resource)
                    });
                }
                else {
                    showTotalDamage("Not enough energy!");
                }
            },
        };
    }
}

class VoidRangerReaver extends Enemy {
    constructor(level) {
        super({
            name: "Voidranger: Reaver",
            img: "Voidranger Reaver.png",
            level: level,
            affiliation: "Antimatter Legion",
            weaknesses: {
                weakness1: "Physical",
                weakness2: "Ice",
                weakness3: "Wind",
            },
            hp: 120,
            atk: 12,
            def: 210,
            speed: 100,
            toughness: 20,
            hpgrowth: 8,
            atkgrowth: 5,
            defgrowth: 4
        });
    }

    async onTurn() {
        await sleep(1000);

        if (this.isBroken == true) {
            brokenEnemy(this);
            return;
        }

        await sleep(750);
        console.log(`${this.name}'s turn!`);
        const chooseAttack = Math.floor(Math.random() * 2);
        let { actualTarget } = enemyRandomTarget();
        await sleep(750);
        if (chooseAttack == 0) {
            // Hunting Blade
            document.getElementById("infotext").textContent = `${this.name} uses Hunting Blade!`;
            document.getElementById("dmgtext").innerText = ``
            await sleep(1000);
            let dmg = dealDamageEnemy(this, actualTarget, 2.5);
            actualTarget.currentHP -= dmg
            console.log(dmg)
            document.getElementById("dmgtext").innerText = `${this.name} dealt ${dmg} damage to ${actualTarget.name}!`
        } else {
            // Vortex Leap
            const { actualTarget, index } = enemyRandomTarget();
            let targetLeft = characterList[index - 1];
            let targetRight = characterList[index + 1];
            document.getElementById("dmgtext").innerText = ``
            document.getElementById("infotext").textContent = `${this.name} uses Vortex Leap!`;
            await sleep(1000);
            let dmg = dealDamageEnemy(this, actualTarget, 1.5);
            actualTarget.currentHP -= dmg
            document.getElementById("dmgtext").innerText = `${this.name} dealt ${dmg} damage to multiple enemies!`
            if (targetLeft)
                targetLeft.currentHP -= dmg;
            if (targetRight)
                targetRight.currentHP -= dmg;

        }
        checkDeath(targetList, turnOrder);
        updateCharacterStats();
        updateEnemyStats();
    }
}

function enemyRandomTarget() {
    let aliveTarget = false;
    let randomTarget;
    let actualTarget;

    while (!aliveTarget) {
        randomTarget = Math.floor(Math.random() * characterList.length);
        actualTarget = characterList[randomTarget];
        if (actualTarget.currentHP > 0) aliveTarget = true;
    }

    return { actualTarget, index: randomTarget };
}


function isAlive() {
    return this.currentHP > 0
}

function targetEnemies() {
    const enemyImgs = document.querySelectorAll(".enemy-portrait");
    enemyImgs.forEach((img, index) => {
        img.addEventListener("click", () => {
            const enemy = enemyList[index];
            if (!enemy) return;

            if (selectedTarget) {
                const prevImg = document.getElementById(`enemy${enemyList.indexOf(selectedTarget) + 1}`);
                if (prevImg) prevImg.classList.remove('enemy-targeted');
            }


            selectedTarget = enemy;
            img.classList.add('enemy-targeted');

            targetList = [enemy].filter(e => e && e.currentHP > 0);
            [-2, -1, 1, 2].forEach(offset => {
                const adj = enemyList[index + offset];
                if (adj && adj.currentHP > 0) targetList.push(adj);
            });
        });
    });
}

async function brokenEnemy(enemy) {
    await sleep(1000);
    document.getElementById("infotext").textContent = `${enemy.name} recovers from being broken!`;
    enemy.isBroken = false;
    enemy.currenttoughness = enemy.maxtoughness;
    checkDeath(enemyList, turnOrder);
    updateEnemyStats();
}


function setBackground() {
    const affiliationList = fillAffiliationList(characterList, enemyList);

    if (affiliationList.length !== 0) {
        const randomAffIndex = Math.floor(Math.random() * affiliationList.length);
        const selectedAffiliation = affiliationList[randomAffIndex];

        const possibleBackgrounds = backgroundList.filter(bg => bg.affiliations.includes(selectedAffiliation));

        if (possibleBackgrounds.length > 0) {
            const randomBgIndex = Math.floor(Math.random() * possibleBackgrounds.length);
            backgroundImage.src = possibleBackgrounds[randomBgIndex].src;
        }
    }
}

function fillAffiliationList(characterList, enemyList) {
    const affiliationList = [];
    characterList.forEach(character => affiliationList.push(character.affiliation));
    enemyList.forEach(enemy => affiliationList.push(enemy.affiliation));
    return affiliationList
}

function removeWeaknessDisplay() {
    for (let i = enemyList.length; i < 5; i++) {
        const container = document.getElementById(`enemy${i + 1}-weakness`);
        if (container) container.style.display = "none";
    }

}
function updateEnemyWeaknessIcons() {

    for (let i = 0; i < enemyList.length; i++) {
        const container = document.getElementById(`enemy${i + 1}-weakness`);
        if (container) container.style.display = "block";
    }

    enemyList.forEach((enemy, index) => {
        const weaknessContainer = document.getElementById(`enemy${index + 1}-weakness`);

        if (!weaknessContainer) return;

        if (!enemy || enemy.currentHP <= 0) {
            weaknessContainer.style.display = "none";
            return;
        }

        const imgs = weaknessContainer.querySelectorAll("img");
        imgs.forEach(img => img.src = "");

        enemy.weaknesses.forEach((weakness, i) => {
            const element = elementList.find(e => e.name === weakness.weakness);
            if (element && imgs[i]) {
                imgs[i].src = element.img;
            }
        });
    });
    removeWeaknessDisplay()
}

function setCharacterElementImages() {
    characterList.forEach((char, i) => {
        const characterElement = document.getElementById(`char${i + 1}-element`);
        if (!characterElement) return;
        characterElement.style.display = "block";
        const element = elementList.find(e => e.name === char.element);
        if (element) {
            characterElement.src = element.img;
        } else {
            characterElement.src = "";
        }
    });
}

function setImages() {
    for (let i = 0; i < 5; i++) {
        const enemy = enemyList[i];
        const enemyImage = document.getElementById(`enemy${i + 1}`);
        if (enemy && enemy.img) {
            enemyImage.src = enemy.img;
            enemyImage.style.display = "block";
        } else {
            enemyImage.src = "";
            enemyImage.style.display = "none";
        }
    }

    for (let i = 0; i < 4; i++) {
        const char = characterList[i];
        const charImage = document.getElementById(`char${i + 1}`);
        const charStats = document.getElementById(`char${i + 1}-stats`);
        const charElement = document.getElementById(`char${i + 1}-element`);
        if (char && char.img) {
            charImage.src = char.img;
            charImage.style.display = "block";
            charElement.style.display = "block";
        } else {
            charImage.src = "";
            charImage.style.display = "none";
            charStats.display = "none";
            charElement.style.display = "none";
        }
    }
    updateEnemyWeaknessIcons();
    setCharacterElementImages();
    targetEnemies();
    console.log(document.querySelectorAll(".enemy img"));
}

function start() {
    createParty();
    createEnemy();
    setBackground();
    let randomIndex = Math.floor(Math.random() * bgmList.length);
    bgm.src = bgmList[randomIndex].src;
    bgm.volume = 0.3;
    volumePercent.textContent = Math.round(bgm.volume * 100) + "%";
    bgm.play();
    setImages();
    startButton.style.display = "none";
    basicAtkButton.style.display = "inline-block";
    skillButton.style.display = "inline-block";
    ultimateButton.style.display = "inline-block";
    skillpointscurrentdisplay.style.display = "inline-block";
    spdivider.style.display = "inline-block";
    skillpointmaxdisplay.style.display = "inline-block";
    checkDeath(targetList, turnOrder);
    initializeTurnOrder(characterList, enemyList);
    checkTurnOrder();
    updateEnemyStats();
    updateCharacterStats();
    console.log(characterList);
    console.log(enemyList);
    console.log(turnOrder)
};

function createParty() {
    char1 = new DestructionMC(1);
    characterList.push(char1);
}

function createEnemy() {
    let enemy1, enemy2, enemy3, enemy4, enemy5;
    enemy1 = new VoidRangerReaver(1);
    enemy2 = new VoidRangerReaver(5);
    enemy3 = new VoidRangerReaver(1);
    const enemies = [enemy1, enemy2, enemy3, enemy4, enemy5];
    enemies.forEach(e => e && enemyList.push(e));
};

pauseMusicButton.onclick = () => {
    if (bgm.paused) {
        bgm.play();
    } else {
        bgm.pause();
    }
}

startButton.onclick = start;

volumePercent.textContent = Math.round(bgm.volume * 30) + "%";

volumeUp.onclick = () => {
    bgm.volume = Math.min(1, bgm.volume + 0.1);
    volumePercent.textContent = Math.round(bgm.volume * 100) + "%";
};

volumeDown.onclick = () => {
    bgm.volume = Math.max(0, bgm.volume - 0.1);
    volumePercent.textContent = Math.round(bgm.volume * 100) + "%";
};

changeMusic.onclick = () => {

    let randomIndex = Math.floor(Math.random() * bgmList.length);
    bgm.src = bgmList[randomIndex].src;
    bgm.play();
}
basicAtkButton.onclick = () => {
    startBasic();
    turnOrder[0].basic.execute(targetList);
    endBasic();
};
skillButton.onclick = () => {
    startSkill();
    turnOrder[0].skill.execute(targetList);
    endSkill();
};

ultimateButton.onclick = () => {
    startUltimate();
    turnOrder[0].ultimate.execute(targetList);
    endUltimate();
};

function checkEndCombat() {
    if (enemyList.length == 0) {
        document.getElementById("infotext").textContent = `VICTORY!`;
        document.getElementById("dmgtext").textContent = ``;
        basicAtkButton.style.display = "none";
        skillButton.style.display = "none";
        ultimateButton.style.display = "none";
        skillpointscurrentdisplay.style.display = "none";
        spdivider.style.display = "none";
        skillpointmaxdisplay.style.display = "none";
        removeWeaknessDisplay();

    }
    let downedCharacters = 0;
    for (let i = 0; i < characterList.length; i++)
        if (characterList[i].currentHP === 0) {
            downedCharacters += 1;
        }
    if (downedCharacters == characterList.length) {
        document.getElementById("infotext").textContent = `DEFEAT!`;
        document.getElementById("dmgtext").textContent = ``;
    }

}

function checkEnemyBreaks() {
    enemyList.forEach(enemy => {
        if (enemy.currenttoughness <= 0 && !enemy.isBroken) {
            enemy.isBroken = true;
            enemy.currenttoughness = 0;
            const dmg = dealBreakDamage(turnOrder[0], enemy);
            enemy.currentHP -= dmg;
            addTotalDamage(dmg);
            document.getElementById("dmgtext").textContent = `${enemy.name} took ${dmg} break damage!`;
        }
    });
}

function updateEnemyStats() {

    for (let i = 0; i < 6; i++) {
        const statsDiv = document.getElementById(`enemy${i}-stats`);
        if (statsDiv) statsDiv.style.display = "none";
    }
    enemyList.forEach((enemy, i) => {
        const statsDiv = document.getElementById(`enemy${i + 1}-stats`);
        if (enemy.currentHP < 0) enemy.currentHP = 0;
        if (enemy.currenttoughness < 0) enemy.currenttoughness = 0;


        if (!statsDiv) return;
        statsDiv.style.display = "block";
        if (enemy.isBroken) {
            statsDiv.textContent = `${Math.floor((enemy.currentHP / enemy.stats.hp) * 100)}% HP | BROKEN`;
        } else {
            statsDiv.textContent = `${Math.floor((enemy.currentHP / enemy.stats.hp) * 100)}% HP | ${Math.floor((enemy.currenttoughness / enemy.maxtoughness) * 100)}% T`;
        }
    });
    checkEndCombat();
}


function updateCharacterStats() {
    characterList.forEach((character, i) => {
        if (character.currentHP < 0) {
            character.currentHP = 0,
                checkEndCombat();
        }
        const statsDiv = document.getElementById(`char${i + 1}-stats`);
        if (statsDiv) {
            statsDiv.textContent = `${character.currentHP} / ${character.stats.hp} HP | ${character.resource} / ${character.resourcemax} Energy`;
        }
    });
}

function addTotalDamage(dmg) {
    total += dmg;
    return total;
}

function showTotalDamage(amount) {
    const damageText = document.getElementById("totaldamage");
    damageText.textContent = ("Total Damage", amount);

    damageText.style.transition = 'none';
    damageText.style.opacity = 1;

    void damageText.offsetWidth;

    damageText.style.transition = 'opacity 1.2s ease-out';

    setTimeout(() => {
        damageText.style.opacity = 0;
    }, 500);
    setTimeout(() => total = 0, 500)
}

function initializeTurnOrder(characterList, enemyList) {
    let character1 = characterList[0];
    let character2 = characterList[1];
    let character3 = characterList[2];
    let character4 = characterList[3];
    let enemy1 = enemyList[0];
    let enemy2 = enemyList[1];
    let enemy3 = enemyList[2];
    let enemy4 = enemyList[3];
    let enemy5 = enemyList[4];
    turnOrder = [character1, character2, character3, character4, enemy1, enemy2, enemy3, enemy4, enemy5]
        .filter(unit => unit != null)
        .sort((a, b) => b.stats.speed - a.stats.speed);
}

function endTurn() {
    turnOrderCheck++;
    document.getElementById("basicatkbutton").disabled = true;
    document.getElementById("skillbutton").disabled = true;
    document.getElementById("ultimatebutton").disabled = true;
    checkDeath(enemyList, turnOrder);
    updateEnemyStats();
    updateCharacterStats();
    checkEndCombat();
}

async function checkTurnOrder() {
    if (turnOrderCheck >= turnOrder.length) {
        turnOrderCheck = 0;
    }

    const currentUnit = turnOrder[turnOrderCheck];

    if (enemyList.includes(currentUnit)) {
        checkEndCombat();
        if (document.getElementById("infotext").textContent == "VICTORY!" || document.getElementById("infotext").textContent == "DEFEAT!") {
            return
        }
        await sleep(2000);
        document.getElementById("infotext").textContent = `It's ${currentUnit.name}'s turn!`
        await currentUnit.onTurn();
        await sleep(750);
        turnOrderCheck++;
        checkTurnOrder();
    } else {
        checkEndCombat();
        if (document.getElementById("infotext").textContent == "VICTORY!" || document.getElementById("infotext").textContent == "DEFEAT!") {
            return
        }
        targetEnemies();
        await sleep(1000);
        document.getElementById("infotext").textContent = `It's ${currentUnit.name}'s turn!`;
        targetEnemies();
        await sleep(1000);
        console.log(`${turnOrder[turnOrderCheck].name}'s turn!`);
        await sleep(1000);
        document.getElementById("basicatkbutton").disabled = false;
        document.getElementById("skillbutton").disabled = false;
        if (turnOrder[0].resource == turnOrder[0].resourcemax) {
            document.getElementById("ultimatebutton").disabled = false;
        }
        document.getElementById("basicatkbutton").title = turnOrder[0].basic.description;
        document.getElementById("skillbutton").title = turnOrder[0].skill.description;
        document.getElementById("ultimatebutton").title = turnOrder[0].ultimate.description;
        checkDeath(enemyList, turnOrder);
        updateEnemyStats();
        updateCharacterStats();
    }
}
function defaultTarget() {
    targetList = targetList.filter(t => t.currentHP > 0);
    if (!targetList || targetList.length === 0) {
        let middleIndex;

        if (enemyList.length === 5) {
            middleIndex = Math.ceil(enemyList.length / 2);
        } else {
            middleIndex = Math.floor(enemyList.length / 2);
        }

        targetList = [enemyList[middleIndex]];
    }
}
function startBasic() {
    defaultTarget();
}

function endBasic() {
    checkUpdateEnd();
}

function startSkill() {
    defaultTarget();
}

function endSkill() {
    if (sp != 0) {
        sp -= 1;
        document.getElementById("currentsp").innerText = sp;
        checkUpdateEnd();
    } else {
        checkDeath(enemyList, turnOrder)
        updateEnemyStats();
        updateCharacterStats();
    }
    ;
}

function startUltimate() {
    if (turnOrder[0].resource < turnOrder[0].resourcemax) {
        window.alert("Not enough energy!")
        return;
    }
    document.getElementById("voiceline").src = turnOrder[0].voiceline;

}

function endUltimate() {
    checkEnemyBreaks();
    checkUpdateEnd();
}

function checkUpdateEnd() {
    checkEnemyBreaks();
    checkDeath(enemyList, turnOrder)
    updateEnemyStats();
    updateCharacterStats();
    showTotalDamage(total);
    endTurn();
    checkEndCombat();
    checkTurnOrder();
}

function checkDeath(targetList, turnOrder) {
    let enemyDied = false;

    for (let i = enemyList.length - 1; i >= 0; i--) {
        if (enemyList[i].currentHP <= 0) {
            enemyList.splice(i, 1);
            enemyDied = true;
        }
    }

    for (let i = turnOrder.length - 1; i >= 0; i--) {
        if (turnOrder[i].currentHP <= 0) {
            turnOrder.splice(i, 1);
        }
    }

    for (let i = targetList.length - 1; i >= 0; i--) {
        if (!targetList[i].isAlive) {
            targetList.splice(i, 1);
        }
    }

    if (enemyDied && (!targetList || targetList.length === 0)) {
        defaultTarget();
    }

    setImages();
}



function dealDamageHP(attacker, target, skillMultiplier) {
    let randomNum = Math.random() * (1.06 - 0.97) + 0.97;
    let attackPower = attacker.stats.hp * skillMultiplier;
    if (Math.random() < attacker.stats.crrate) {
        attackPower *= ((attacker.stats.critDmg) + 1);
    }
    if (target.isBroken == false) {
        attackPower *= 0.9;
    }
    let defMultiplier = (attacker.level + 20) / ((target.level + 20) * Math.max(0, 1 + target.stats.defBonus - target.stats.defreduction - attacker.stats.defignore) + attacker.level + 20);
    let resMultiplier = 1 - (target.stats.resi - attacker.stats.resPen);
    let damage = Math.floor(randomNum * (attackPower * (target.stats.vuln || 1) * defMultiplier * (1 + (attacker.stats.damageBonus || 0)) * (1 - (target.stats.damageMitigation || 0)) * resMultiplier));
    return damage;
}

function dealDamage(attacker, target, skillMultiplier) {
    let randomNum = Math.random() * (1.06 - 0.97) + 0.97;
    let attackPower = attacker.stats.atk * skillMultiplier;
    if (Math.random() < attacker.stats.crrate) {
        attackPower *= ((attacker.stats.critDmg) + 1);
    }
    if (target.isBroken == false) {
        attackPower *= 0.9;
    }
    let defMultiplier = (attacker.level + 20) / ((target.level + 20) * Math.max(0, 1 + target.stats.defBonus - target.stats.defReduction - attacker.stats.defIgnore) + attacker.level + 20);
    let resMultiplier = 1 - (target.stats.resi - attacker.stats.resPen);
    let damage = Math.floor(randomNum * (attackPower * (target.stats.vuln || 1) * defMultiplier * (1 + (attacker.stats.damageBonus || 0)) * (1 - (target.stats.damageMitigation || 0)) * resMultiplier));
    return damage;
}

function dealDamageDef(attacker, target, skillMultiplier) {
    let randomNum = Math.random() * (1.06 - 0.97) + 0.97;
    let attackPower = attacker.stats.def * skillMultiplier;
    if (Math.random() < attacker.stats.crrate) {
        attackPower *= ((attacker.stats.critDmg) + 1);
    }
    if (target.isBroken == false) {
        attackPower *= 0.9;
    }
    let defMultiplier = (attacker.level + 20) / ((target.level + 20) * Math.max(0, 1 + target.stats.defBonus - target.stats.defReduction - attacker.stats.defIgnore) + attacker.level + 20);
    let resMultiplier = 1 - (target.stats.resi - attacker.stats.resPen);
    let damage = Math.floor(randomNum * (attackPower * (target.stats.vuln || 1) * defMultiplier * (1 + (attacker.stats.damageBonus || 0)) * (1 - (target.stats.damageMitigation || 0)) * resMultiplier));
    return damage;
}

function dealDamageEnemy(attacker, target, skillMultiplier) {
    let randomNum = Math.random() * (1.06 - 0.97) + 0.97;
    let attackPower = attacker.stats.atk * skillMultiplier;
    let defMultiplier = (attacker.level + 20) / ((target.level + 20) * Math.max(0, 1 + (target.stats?.defBonus || 0) - target.stats?.defreduction - attacker.stats.defignore) + attacker.level + 20);
    let damage = Math.floor(randomNum * (attackPower * (target.stats?.vuln || 1) * defMultiplier * (1 + (attacker.stats.damageBonus || 0)) * (1 - (target.stats?.damageMitigation || 0))));
    return damage;
}

function dealDoTDamage(attacker, target, DoTMultiplier) {
    let randomNum = Math.random() * (1.06 - 0.97) + 0.97;
    let attackPower = attacker.stats.atk * DoTMultiplier;
    if (target.isBroken == false) {
        attackPower *= 0.9;
    }
    let defMultiplier = (attacker.level + 20) / ((target.level + 20) * Math.max(0, 1 + target.defBonus - target.defreduction - attacker.defignore) + attacker.level + 20);
    let resMultiplier = 1 - (target.stats.resi - attacker.resPen);
    let damage = Math.floor(randomNum * (attackPower * (target.stats.vuln || 1) * defMultiplier * (attacker.stats.damageBonus || 1) * (1 - (target.stats.damageMitigation || 0)) * resMultiplier * (target.stats.DoTvuln || 1)));
    return damage;
}

function dealBreakDamage(attacker, target) {
    let randomNum = Math.random() * (1.06 - 0.97) + 0.97;
    let baseDamage = 0;
    if (attacker.element == "Physical" || attacker.element == "Fire") {
        baseDamage = 2 * 50 * Math.pow(attacker.level, 0.95) * (0.5 + (target.maxtoughness / 40));
    } else if (attacker.element == "Ice" || attacker.element == "Lightning") {
        baseDamage = 1 * 50 * Math.pow(attacker.level, 0.95) * (0.5 + (target.maxtoughness / 40));
    } else if (attacker.element == "Wind") {
        baseDamage = 1.5 * 50 * Math.pow(attacker.level, 0.95) * (0.5 + (target.maxtoughness / 40));
    } else if (attacker.element == "Quantum" || attacker.element == "Imaginary") {
        baseDamage = 0.5 * 50 * Math.pow(attacker.level, 0.95) * (0.5 + (target.maxtoughness / 40));
    }

    let defMultiplier = (attacker.level + 20) / ((target.level + 20) * Math.max(0, 1 + target.stats.defBonus - target.stats.defreduction - attacker.stats.defignore) + attacker.level + 20);
    let resMultiplier = 1 - (target.stats.resi - attacker.stats.resPen);
    let damage = Math.floor(randomNum * (baseDamage * (target.stats.vuln || 1) * defMultiplier * (1 + (attacker.stats.damageBonus || 0)) * (1 - (target.stats.damageMitigation || 0)) * resMultiplier));
    return damage;
}


