const bgm = document.getElementById("bgm");
const notification = document.getElementById("notification");
const difficultyInput = document.getElementById("difficulty");
const startButton = document.getElementById("start");
const basicAtkButton = document.getElementById("basicatkbutton");
const skillButton = document.getElementById("skillbutton");
const ultimateButton = document.getElementById("ultimatebutton");
const skillpointscurrentdisplay = document.getElementById("currentsp");
const spdivider = document.getElementById("spdivider");
const skillpointmaxdisplay = document.getElementById("maxsp");
const pauseMusicButton = document.getElementById("pauseMusic");
const notEnoughEnergy = "Not Enough Energy!"
const notEnoughSP = "Not Enough Skill Points!"
const DoTDamage = "DoT damage:"
let currentTurn;
let total = 0;
let combatOngoing = false;
let difficultyLevel;
let enemyPoints = 0;
let victoryPoints = 0;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const backgroundList = [
    { name: "Herta Space Station", src: "Space_Anchor_Electrical_Room.webp", affiliations: ["Antimatter Legion", "Herta Space Station"] },
    { name: "Astral Express", src: "2ddeccfe02c63d8b59e96e0b18cee2d6_3750609136158297103.webp", affiliations: ["None", "Astral Express", "Neutral"] },
    { name: "Xianzhou", src: "img_5322.webp", affiliations: ["Xianzhou"] },
    { name: "Penacony", src: "458b8bb768478059846f8f050b104454_5921643887301072597.png", affiliations: ["Penacony"] }
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
let allyTargetList = [];
let turnOrderCheck = 0;
let selectableCharacters = [
    { name: "Trailblazer", img: "honkai-star-rail-trailblazer-destroyer-best-builds.avif", element: "Type_Physical.webp", description: "A primary damage dealer that scales off their own current health and gains more energy everytime an ally is healed." },
    { name: "Constance", img: "Character_The_Dahlia_Splash_Art.webp", element: "fire.webp", description: "A Damage-Over-Time unit that can help accelerate those effects while also reducing the enemy's defenses. She gains more energy when more DoT effects occur." },
    { name: "Baiheng", img: "Baiheng.png", element: "Type_Ice.png", description: "A healer that applies a Healing-Over-Time effect to allies and can equalize the health of all allies." },
    { name: "Mr. Reca", img: "MrReca-removebg-preview.png", element: "Type_Quantum.webp", description: "A supportive unit that allows another unit to immediately take a turn and increase their damage. Can also speed up allies while slowing down enemies." },
    { name: "Screwllum", img: "so-again-how-is-screwllum-still-not-playable-v0-roxuglb2y40g1.webp", element: "Type_Imaginary-removebg-preview.png", description: "A primary damage dealer, apt at dealing with multiple enemies at once." },
    { name: "Yanqing", img: "7188611a0125132f22376df9638d6675_602835355632644652-removebg-preview.png", element: "Type_Ice.png", description: "A primary damage dealer that consumes skill points fast to damage one enemy." },
    { name: "Stephen", img: "NPC_Stephen_Lloyd-removebg-preview.png", element: "Type_Imaginary-removebg-preview.png", description: "A tanky support unit that can shield allies and increase their defenses." },
    { name: "Tribios", img: "a800ca311eaac0c77272cb34ce7b40bd-removebg-preview.png", element: "Type_Wind.webp", description: "A team support that lets your entire team deal more damage. Her buffs only tick down on her own turns." },
];
let selectedCharacters = [];
const debuffList = [
    { id: "FireBreak", name: "Burn", src: "Icon_Burn.webp", description: `Take Fire damage each turn`, duration: 2, effect: (attacker, unit) => { unit.currentHP -= 50 * Math.pow(attacker.level, 0.95) }, element: "Fire", applier: "", event: "DoT" },
    { id: "PhysicalBreak", name: "Bleed", src: "Icon_Bleed.webp", description: `Take Physical damage each turn based on max HP`, duration: 2, effect: (attacker, unit) => { takeDamage(unit, Math.min((unit.stats.hp * 0.1), 50 * Math.pow(attacker.level, 0.95))) }, element: "Physical", applier: "", event: "DoT" },
    { id: "IceBreak", name: "Freeze", src: "Icon_Frozen.webp", description: `Take Ice damage each turn and stunned`, duration: 1, effectdmg: (attacker, unit) => { unit.isStunned = true; takeDamage(unit, 50 * Math.pow(attacker.level, 0.95)) }, element: "Ice", applier: "", event: "" },
    { id: "LightningBreak", name: "Shock", src: "Icon_Shock.webp", description: `Take Lightning damage each turn`, duration: 2, effect: (attacker, unit) => { takeDamage(unit, 100 * Math.pow(attacker.level, 0.95)) }, element: "Lightning", applier: "", event: "DoT" },
    { id: "WindBreak", name: "Shear", src: "Icon_Wind_Shear.webp", description: `Take Wind damage each turn`, duration: 2, stacks: 1, maxstacks: 5, effect: (attacker, unit) => { takeDamage(unit, stacks * 50 * Math.pow(attacker.level, 0.95)) }, element: "Wind", applier: "", event: "DoT" },
    { id: "QuantumBreak", name: "Entangle", src: "Icon_Entanglement.webp", description: `Take Quantum damage each turn and slightly reduces speed`, duration: 2, stacks: 1, maxstacks: 5, baseChance: 1.5, effect: (attacker, unit) => { takeDamage(unit, 0, 6 * 50 * Math.pow(attacker.level, 0.95)); unit.speed -= (10 * attacker.breakeffect) }, revert: (attacker, unit) => { unit.speed += (10 * attacker.breakeffect) }, element: "Quantum", applier: "", event: "" },
    { id: "ImaginaryBreak", name: "Imprison", src: "Icon_Imprisonment.webp", description: `This unit has reduced speed`, duration: 2, effect: (attacker, unit) => { unit.speed *= 0.8 }, revert: (attacker, unit) => { unit.speed += (20 * attacker.breakeffect) }, element: "Imaginary", applier: "", event: "" },
    { id: "Wilt", name: "Wilt", src: "lick-enkindled-betrayal-skill_icon.webp", description: `Take Fire damage each turn and reduces defense by 20%`, duration: 3, effect: (attacker, unit) => { unit.stats.defreduction += 0.2 }, effectdmg: (attacker, unit) => { takeDamage(unit, dealDoTDamage(attacker, unit, 1)) }, revert: (attacker, unit) => { unit.stats.defreduction -= 0.2 }, applier: "", event: "DoT" },
    { id: "Ruin", name: "Ruin", src: "wallowentombed-ash-skill_icon.webp", description: `Take Fire damage each turn and reduces defense by 20%`, duration: 3, effect: (attacker, unit) => { unit.stats.defreduction += 0.2 }, effectdmg: (attacker, unit) => { takeDamage(unit, dealDoTDamage(attacker, unit, 1)) }, revert: (attacker, unit) => { unit.stats.defreduction -= 0.2 }, applier: "", event: "DoT" },
    { id: "Nihility's Command", name: "Nihility's Command", src: "internet-keyword-targeting-seo-target-icon--22.png", description: `Targeted for a massive attack and taking 10% increased damage`, duration: 10, baseChance: 1, effect: (attacker, unit) => { unit.stats.defreduction -= 0.1 }, revert: (attacker, unit) => { unit.stats.defreduction += 0.1 }, applier: "", event: "" },
    { id: "Cut!", name: "Cut!", src: "145065.png", description: `Mr Reca has slowed this unit by 10%`, duration: 1, revert: (attacker, unit) => { unit.stats.speed /= 0.9 }, applier: "", event: "" },
    { id: "Ready, Set, Action!", name: "Ready, Set, Action!", src: "mrrecawhite-removebg-preview.png", description: `Mr Reca has slowed this unit down by 25%`, duration: 2, revert: (attacker, unit, applier) => { unit.stats.speed *= 1.25 }, applier: "", event: "" },
    { id: "Wind Shear", name: "Wind Shear", src: "Icon_Wind_Shear.webp", description: `This unit is taking damage each turn and is targeted for a massive attack!`, duration: 3, effect: (attacker, unit) => { takeDamage(unit, Math.pow(attacker.level, 0.4)) }, applier: "", event: "" },
    { id: "Enraged Sting", name: "Enraged", src: "symbol-anger-emoji-computer-icons-angry-emoji-thumbnail-removebg-preview.png", description: `This unit is preparing to kamikaze itself!`, duration: 2 },
    { id: "Miasma", name: "Miasma", src: "istockphoto-1939875666-612x612-removebg-preview.png", description: `Take damage each turn and reduces defense by 20%`, duration: 3, effect: (attacker, unit) => { unit.stats.defreduction += 0.2 }, effectdmg: (attacker, unit) => { takeDamage(unit, Math.pow(attacker.level, 5)) }, revert: (attacker, unit) => { unit.stats.defreduction -= 0.2 }, applier: "" },
    { id: "Sudden Impact", name: "Sudden Impact", src: "istockphoto-1148609375-612x612-removebg-preview.png", description: `this unit has had their defenses reduced by 20%`, duration: 3, effect: (attacker, unit) => { unit.stats.defreduction += 0.2 }, revert: (attacker, unit) => { unit.stats.defreduction -= 0.2 }, applier: "" },

]
    ;
const buffList = [
    { id: "Rushing Waters", name: "Rushing Waters", src: "Ability_Singing_Among_Clouds.webp", description: `Baiheng has increased her speed by 25%`, duration: 1, revert: (attacker, unit) => { unit.stats.speed /= 1.25 }, applier: "", event: "" },
    { id: "Mending Waters", name: "Mending Waters", src: "Ability_Gourdful_of_Elixir.webp", sfx: "084373_heal-36672.mp3", description: `This unit will be healed at the start of their next turn`, duration: 3, effect: (attacker, unit, applier) => { unit.currentHP += Math.floor((0.08 * applier.stats.hp) + 50) }, applier: "", event: "healAlly" },
    { id: "Run It Back!", name: "Run It Back!", src: "pngtree-fast-forward-icon-image_1128381-removebg-preview.png", description: `Increases damage bonus by 75%`, duration: 3, effect: (attacker, unit, applier) => { unit.stats.damageBonus += 0.8 }, revert: (attacker, unit, applier) => { unit.stats.damageBonus -= 0.8 }, applier: "", event: "" },
    { id: "Ready, Set, Action!", name: "Ready, Set, Action!", src: "mrrecawhite-removebg-preview.png", description: `Mr Reca has sped this unit up by 33%`, duration: 2, revert: (attacker, unit, applier) => { unit.stats.speed /= 1.33 }, applier: "", event: "" },
    { id: "Swift as the Wind", name: "Swift as the Wind", src: "png-transparent-wind-blow-air-fantasy-swirl-wind-icon.png", description: `Increases Yanqing's speed by 25%`, duration: 3, revert: (attacker, unit, applier) => { unit.stats.speed /= 1.25 }, applier: "", event: "" },
    { id: "Destructive as Lightning", name: "Destructive as Lightning", src: "Ability_Stormborn-removebg-preview.png", description: `Yanqing is ignoring 25% of enemy defenses.`, duration: 1, revert: (attacker, unit, applier) => { unit.defignore /= 1.25 }, applier: "", event: "" },
    { id: "Antiviral Buffer", name: "Antiviral Buffer", src: "1705438.png", description: `Stephen has increased his defense by 25%`, duration: 1, revert: (attacker, unit) => { unit.stats.def /= 1.25 }, applier: "", event: "" },
    { id: "Shield.exe", name: "Shield.exe", src: "security-icon-antivirus-icon-protection-icon-web-security-icon-firewall-user-gratis-symbol-logo-png-clipart-removebg-preview.png", description: `This unit has increased their defense by 25%`, duration: 2, revert: (attacker, unit) => { unit.stats.def /= 1.25 }, applier: "", event: "" },
    { id: "Gales of Tomorrow", name: "Gales of Tomorrow", src: "pngtree-gale-icon-image_1190083-removebg-preview.png", description: `This unit has increased their Attack and Speed by 20%`, duration: 3, effect: (attacker, unit) => { const buff = unit.buffs.find(b => b.id === "Gales of Tomorrow"); if (buff) buff.duration++; }, revert: (attacker, unit, applier) => { unit.stats.atk /= 1.25, unit.stats.speed /= 1.25 }, applier: "", event: "" },
    { id: "Riding the West Wind", name: "Riding the West Wind", src: "Ability_If_You_re_Happy_and_You_Know_It-removebg-preview(1).png", description: `This unit has increased their damage dealt by 50%`, duration: 3, effect: (attacker, unit) => { const buff = unit.buffs.find(b => b.id === "Riding the West Wind"); if (buff) buff.duration++; }, revert: (attacker, unit, applier) => { unit.stats.damageBonus /= 1.5 }, applier: "", event: "" },
    { id: "Click To Restart", name: "Click To Restart", src: "istockphoto-1405026405-612x612-removebg-preview.png", description: `Stephen is ready to revive the next ally that goes down`, duration: 99 },
];

const bgmList = [
    { name: "Scarab King", src: "Aberrant Receptacle • Starcrusher Swarm King Boss Theme (Extended) Perfect Loop- HSR Version 1.6 OST [EjCeuPEq4ro].mp3" },
    { name: "Lygus", src: "Lygus Boss Theme (Extended) - Honkai_ Star Rail 3.5 OST.mp3" },
    { name: "Aquila", src: "(Extended) Proi Proi Hyacine Song - Aquila Boss Theme Phase 3Honkai Star Rail 3.3 OST.mp3" },
    { name: "Cocolia", src: "Wildfire [30 Minutes Perfect Loop] [apsyvq-DP7A].mp3" },
    { name: "Judge of Oblivion", src: "Unholy Blood Ichor Memosprite_ Judge of Oblivion Boss Theme (Extended) - Honkai_ Star Rail 3.6 OST.mp3" },
    { name: "Irontomb", src: "Irontomb Boss Theme [Full Version] - Honkai Star Rail 3.7.mp3" }
];

bgm.loop = true;
const elementList = [
    { name: "Fire", img: "fire.webp" },
    { name: "Physical", img: "Type_Physical.webp" },
    { name: "Lightning", img: "Type_Lightning.png" },
    { name: "Imaginary", img: "Type_Imaginary-removebg-preview.png" },
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
    document.getElementById("victoryPoints").style.display = "none";
    document.getElementById("victoryPoints").innerText = `Victory Points: ${victoryPoints}`;
    basicAtkButton.style.display = "none";
    skillButton.style.display = "none";
    ultimateButton.style.display = "none";
    skillpointscurrentdisplay.style.display = "none";
    spdivider.style.display = "none";
    skillpointmaxdisplay.style.display = "none";
    document.getElementById("basicatkbutton").disabled = true;
    document.getElementById("skillbutton").disabled = true;
    document.getElementById("ultimatebutton").disabled = true;
    combatOngoing = true;
    const characterSelect = document.getElementById("characterSelect");

    selectableCharacters.forEach((char, index) => {
        const charCard = document.createElement("div");
        charCard.classList.add("char-card");
        charCard.title = char.description;

        charCard.innerHTML = `
        <img class="char-img" src="${char.img}" data-index="${index}" alt="${char.name}" data-name="${char.name}">
        <img class="char-element" src="${char.element}" alt="${char.element}">
        <div class="char-name">${char.name}</div>
    `;

        characterSelect.appendChild(charCard);
    });

    document.querySelectorAll(".char-img").forEach(img => {
        img.addEventListener("click", () => {
            const charName = img.dataset.name;

            if (selectedCharacters.includes(charName)) {
                selectedCharacters = selectedCharacters.filter(name => name !== charName);
                updateSelectionBadges();
                return;
            }


            if (selectedCharacters.length >= 4) return;

            selectedCharacters.push(charName);
            updateSelectionBadges();
        });
    });
}

function updateSelectionBadges() {

    document.querySelectorAll(".select-number").forEach(el => el.remove());

    selectedCharacters.forEach((charName, order) => {
        const img = document.querySelector(`.char-img[data-name="${charName}"]`);
        if (!img) return;
        const parent = img.parentElement;

        const badge = document.createElement("div");
        badge.classList.add("select-number");
        badge.textContent = order + 1;

        parent.appendChild(badge);
    });
}

onStartUp();


class Unit {
    constructor({ name, img, level, affiliation, rank, resource, resourcemax, basehp, baseatk, basedef, speed, hpgrowth, atkgrowth, defgrowth }) {
        this.name = name;
        this.img = img;
        this.level = level;
        this.affiliation = affiliation;
        this.rank = rank;
        this.stats = {
            hp: basehp + level * hpgrowth,
            atk: baseatk + level * atkgrowth,
            def: basedef + level * defgrowth,
            speed: speed,
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
        this.buffs = [];
        this.debuffs = [];
        this.resource = resource;
        this.resourcemax = resourcemax;
        this.currentHP = this.stats.hp;
        this.isBroken = false;
        this.turnCount = 0;
        this.cooldown = 0;
        this.isStunned = false;
        this.shieldAmount = 0;
        this.hasExtraTurn = false;
        this.skillStacks = 0;

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
        this.resource = Math.ceil(resourcemax * 0.25);
        this.breakeffect = 1;
        this.stats.crrate = 0.05;
        this.stats.critDmg = 0.5;
        this.stats.resPen = 0;
        this.stats.damageBonus = 0;
        this.stats.defBonus = 0;
        this.energyRegen = 1;
    };
}

class Enemy extends Unit {
    constructor({ name, img, level, affiliation, rank, weaknesses = {}, hp, atk, def, speed, toughness, hpgrowth, atkgrowth, defgrowth }) {
        super({
            name,
            img,
            level,
            affiliation,
            rank,
            basehp: hp,
            baseatk: atk,
            basedef: def,
            speed: speed,
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
            img: "Character_Trailblazer_(F)_Destruction_Splash_Art.png",
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
            speed: 102,
            hpgrowth: 15,
            atkgrowth: 7.5,
            defgrowth: 6,
        });

        this.basic = {
            name: "Batter Up!",
            description: "Deal Physical damage to one designated enemy.",
            modifier: 1,
            sfx: new Audio("Minecraft Fall Damage (Crack) - Sound Effect (HD).mp3"),
            execute: (targets) => {
                const target = targets[0];
                const hppercent = (this.currentHP / this.stats.hp);
                this.basic.sfx.play();
                let dmg = dealDamageHP(this, target, this.basic.modifier);
                dmg = dmg * hppercent;
                takeDamage(target, dmg);
                if (target.weaknesses.some(w => w.weakness === this.element)) {
                    toughnessDamage(target, (10 * this.breakeffect))
                }
                energyGain(this, 10);
                if (sp < spmax) {
                    sp += 1;
                    document.getElementById("currentsp").innerText = sp;
                }
                document.getElementById("dmgtext").innerText = `${this.name} dealt ${Math.round(dmg)} damage to ${target.name}`;
                addTotalDamage(dmg);
                endBasic();
            }
        },

            this.skill = {
                name: "Home Run Hit",
                description: "Deal Physical damage to one designated enemy and adjacent targets.",
                modifier1: 2,
                modifier2: 1.3,
                sfx: new Audio("Minecraft Fall Damage (Crack) - Sound Effect (HD).mp3"),
                execute: (targets) => {
                    if (sp != 0) {
                        this.skill.sfx.play();
                        const main = targets[0];
                        const index = enemyList.indexOf(main);

                        const dmgMain = dealDamageHP(this, main, this.skill.modifier1);
                        takeDamage(main, dmgMain);
                        if (main.weaknesses.some(w => w.weakness === this.element)) {
                            toughnessDamage(main, (20 * this.breakeffect))
                        }

                        const left = enemyList[index - 1];
                        const right = enemyList[index + 1];
                        const leftdmg = left ? dealDamageHP(this, left, this.skill.modifier2) : 0;
                        const rightdmg = right ? dealDamageHP(this, right, this.skill.modifier2) : 0;
                        if (left) takeDamage(left, leftdmg);
                        if (left) { if (left.weaknesses.some(w => w.weakness === this.element)) toughnessDamage(left, (10 * this.breakeffect)) }
                        if (right) takeDamage(right, rightdmg);
                        if (right) if (right.weaknesses.some(w => w.weakness === this.element)) { toughnessDamage(right, (10 * this.breakeffect)) }
                        energyGain(this, 20);
                        addTotalDamage(dmgMain);
                        addTotalDamage(leftdmg);
                        addTotalDamage(rightdmg);
                        document.getElementById("dmgtext").innerText = `${this.name} dealt ${dmgMain} damage to ${main.name} and ${(Math.ceil(dmgMain / 2))} damage to others!`
                        endSkill();
                    }
                    else {
                        notification.innerText = "Not enough skill points!"
                    }
                },
            };

        this.ultimate = {
            name: "Ace Player",
            description: "Deal Physical damage to all enemy targets.",
            modifier: 3,
            sfx: new Audio("VO_JA_Stelle_Ultimate_-_Activate_Destruction_01.mp3"),
            execute: () => {
                if (this.resource >= this.resourcemax) {
                    flashUltimate(this);
                    enemyList.forEach(enemy => {
                        const dmg = dealDamageHP(this, enemy, this.ultimate.modifier);
                        if (enemy.weaknesses.some(w => w.weakness === this.element)) {
                            toughnessDamage(enemy, (20 * this.breakeffect))
                        }
                        takeDamage(enemy, dmg);
                        addTotalDamage(dmg);
                        document.getElementById("dmgtext").innerText = `${this.name} dealt ${dmg} damage to all enemies!`
                        document.getElementById("ultimatebutton").disabled = true;

                    });

                    checkDeath();
                    updateCharacterStats();
                    updateEnemyStats();
                    this.resource = 5;
                }
                else {
                    showNotification(notEnoughEnergy);
                    ultimateButton.style.disabled = true;
                }
            },
        };

        this.passive = {
            effect: () => {
                document.addEventListener("healAlly", () => {
                    energyGain(this, 5);
                    updateCharacterStats();
                })

                document.addEventListener("combatStart", () => {
                    this.currentHP -= Math.floor(this.stats.hp * 0.5);
                })
            }
        }
        this.passive.effect();
    }
}

class Constance extends Character {
    constructor(level) {
        super({
            name: "Constance",
            img: "Character_The_Dahlia_Splash_Art.webp",
            level: level,
            affiliation: "Annihilation Gang",
            star: "5*",
            path: "Nihility",
            element: "Fire",
            resource: 25,
            resourcemax: 180,
            basehp: 140,
            baseatk: 92,
            basedef: 82,
            speed: 96,
            hpgrowth: 12,
            atkgrowth: 7.5,
            defgrowth: 6.5
        });

        this.basic = {
            name: "Flickering Memory",
            description: "Deal Fire damage to one designated enemy.",
            modifier: 0.75,
            sfx: new Audio("mixkit-short-fire-whoosh-1345.wav"),
            execute: (targets) => {
                const target = targets[0];
                this.basic.sfx.play();
                const dmg = dealDamage(this, target, this.basic.modifier);
                target.currentHP -= dmg;
                if (target.weaknesses.some(w => w.weakness === this.element)) {
                    toughnessDamage(target, (10 * this.breakeffect))
                }
                energyGain(this, 10);
                if (sp < spmax) {
                    sp += 1;
                    document.getElementById("currentsp").innerText = sp;
                }
                document.getElementById("dmgtext").innerText = `${this.name} dealt ${dmg} damage to ${target.name}`;
                addTotalDamage(dmg);
                endBasic();
            }
        },

            this.skill = {
                name: "Wilting Roses",
                description: "Deal Fire damage to all enemies and apply 'Wilt'. If the target already has 'Wilt', allow all Damage-Over-Time effects to deal damage once. Gain more energy when hitting more targets, up to 3.",
                modifier: 1,
                sfx: new Audio("mixkit-fire-swoosh-burning-1328.wav"),
                execute: () => {
                    if (sp != 0) {
                        this.skill.sfx.play();
                        enemyList.forEach(enemy => {
                            const dmg = dealDamage(this, enemy, this.skill.modifier)
                            takeDamage(enemy, dmg);
                            if (enemy.weaknesses.some(w => w.weakness === this.element)) {
                                enemy.currenttoughness -= (20 * this.breakeffect);
                            }
                            if (enemy.debuffs.some(d => d.id === "Wilt")) {
                                procDoTs(enemy);
                            }
                            addTotalDamage(dmg);
                            applyDebuff(enemy, "Wilt", this);
                            document.getElementById("dmgtext").innerText = `${this.name} dealt ${dmg} to all enemies`;


                        })
                        energyGain(this, Math.min(50, (20 * enemyList.length)));
                        endSkill()
                    }

                }
            }

        this.ultimate = {
            name: "Darkflame Bloom",
            description: "Deal Fire damage all enemy targets and apply 'Wilt' to all targets, if they already have 'Wilt', apply 'Ruin'. If they already have 'Ruin', all damaging DoTs take effect twice. ",
            modifier: 1.5,
            sfx: new Audio("VO_JA_Evernight_Ultimate_-_Activate_01.ogg"),
            execute: () => {
                if (this.resource >= this.resourcemax) {
                    flashUltimate(this);
                    enemyList.forEach(enemy => {
                        const dmg = dealDamage(this, enemy, this.ultimate.modifier);
                        takeDamage(enemy, dmg);
                        addTotalDamage(dmg);
                        if (enemy.weaknesses.some(w => w.weakness === this.element)) {
                            toughnessDamage(enemy, (20 * this.breakeffect))
                        }
                        if (enemy.debuffs.some(d => d.id === "Ruin")) {
                            procDoTs(enemy);
                            procDoTs(enemy);
                        }
                        if (enemy.debuffs.some(d => d.id === "Wilt")) {
                            applyDebuff(enemy, "Ruin", this);
                        }

                        applyDebuff(enemy, "Wilt", this);
                        checkDeath();
                        updateCharacterStats();
                        updateEnemyStats();

                    });
                    sleep(100);
                    this.resource = 5;
                    document.getElementById("dmgtext").innerText = `${this.name} dealt ${total} damage to all enemies!`
                    document.getElementById("ultimatebutton").disabled = true;
                    endUltimate();
                }
                else {
                    showNotification(notEnoughEnergy);
                    ultimateButton.style.disabled = true;
                }
            },
        };

        this.passive = {
            effect:
                document.addEventListener("DoT", () => {
                    energyGain(this, 2);
                    updateCharacterStats();
                })
        }
    }

}

class Baiheng extends Character {
    constructor(level) {
        super({
            name: "Baiheng",
            img: "Baiheng.png",
            level: level,
            affiliation: "Xianzhou",
            star: "5*",
            path: "Abundance",
            element: "Ice",
            resource: 25,
            resourcemax: 110,
            basehp: 148,
            baseatk: 49,
            basedef: 85,
            baseSpeed: 100,
            speed: 100,
            hpgrowth: 15,
            atkgrowth: 5,
            defgrowth: 7
        });

        this.basic = {
            name: "Wave, Crash Against Stone",
            description: "Deal Ice damage to one designated enemy and grants Baiheng a speed boost for 1 turn.",
            modifier: 0.9,
            sfx: new Audio("mixkit-water-splash-1311.wav"),
            execute: (targets) => {
                const target = targets[0];
                this.basic.sfx.play();
                const dmg = dealDamage(this, target, this.basic.modifier);
                takeDamage(target, dmg);

                if (target.weaknesses.some(w => w.weakness === this.element)) {
                    toughnessDamage(target, (15 * this.breakeffect))
                }
                energyGain(this, 15);
                if (sp < spmax) {
                    sp++;
                    document.getElementById("currentsp").innerText = sp;
                }
                document.getElementById("dmgtext").innerText = `${this.name} dealt ${dmg} damage to ${target.name}!`;
                applyBuff(this, "Rushing Waters", this);
                this.stats.speed *= 1.25;
                showEffects();
                addTotalDamage(dmg);
                endBasic();
            }
        },

            this.skill = {
                name: "Mending of the Tides",
                description: "Heal all allies and apply a Healing-Over-Time effect, based on Baiheng's max HP",
                modifier: 0.35,
                sfx: new Audio("mixkit-video-game-magic-potion-2830.wav"),
                execute: () => {
                    if (sp != 0) {
                        this.skill.sfx.play();
                        const healAmount = ((this.skill.modifier * this.stats.hp)) + 105;
                        characterList.forEach(character => {
                            if (character.currentHP > 0) {
                                healUnit(character, healAmount);
                                applyBuff(character, "Mending Waters", this)
                            }
                            document.getElementById("dmgtext").innerText = `${this.name} healed all allies for ${Math.floor(healAmount)}!`;
                        })
                        addTotalDamage(Math.floor((this.skill.modifier * this.stats.hp) * characterList.length))
                        energyGain(this, 30);
                        characterList.filter(c => c.currentHP > 0).forEach(() => {
                            document.dispatchEvent(new CustomEvent("healAlly"));
                        });
                        showEffects();
                        updateCharacterStats();
                        endSkill();

                    }


                }
            }

        this.ultimate = {
            name: "Water, The Great Equalizer",
            description: "Averages out all allies' HP percentage, then heal for a large amount and apply Mending Waters. Cleanses 1 debuff from all allies. Can revive downed allies.",
            modifier: 0.7,
            sfx: new Audio("mixkit-jump-into-the-water-1180.wav"),
            execute: () => {
                if (this.resource >= this.resourcemax) {
                    flashUltimate(this);
                    let averageHP;
                    let totalHP = 0;
                    const healAmount = ((this.skill.modifier * this.stats.hp)) + 205;
                    characterList.forEach(character => {
                        totalHP += character.currentHP
                    });
                    averageHP = totalHP / characterList.filter(c => c.currentHP > 0).length;
                    characterList.forEach(character => {
                        character.currentHP = character.stats.hp * averageHP;
                        healUnit(character, healAmount);
                        applyBuff(character, "Mending Waters", this)
                        cleanseDebuffs(character, 1);
                        addTotalDamage(Math.floor((this.skill.modifier * this.stats.hp) * characterList.length))
                    });
                    document.getElementById("dmgtext").innerText = `${this.name} healed all allies for ${Math.floor(healAmount)}!`;
                    this.resource = 5;
                    characterList.filter(c => c.currentHP > 0).forEach(() => {
                        document.dispatchEvent(new CustomEvent("healAlly"));
                    });

                }
                else {
                    showNotification(notEnoughEnergy);
                    ultimateButton.style.disabled = true;
                }
            },
        };

        this.passive = {
            effect:
                document.addEventListener("healAlly", () => {
                    this.speed = Math.min(this.baseSpeed * 1.25, this.speed + 2)
                })
        }
    }
}

class StephenLloyd extends Character {
    constructor(level) {
        super({
            name: "Stephen Lloyd",
            img: "NPC_Stephen_Lloyd-removebg-preview.png",
            level: level,
            affiliation: "Herta Space Station",
            star: "5*",
            path: "Preservation",
            element: "Imaginary",
            resource: 25,
            resourcemax: 125,
            basehp: 148,
            baseatk: 49,
            basedef: 97,
            speed: 102,
            hpgrowth: 16,
            atkgrowth: 5,
            defgrowth: 9,
            reboot: false,
        });

        this.basic = {
            name: "Antiviral Buffer",
            description: "Deal Imaginary damage to one designated enemy and grants Stephen a defense boost for 2 turns.",
            modifier: 0.6,
            sfx: new Audio("mixkit-sci-fi-click-900.wav"),
            execute: (targets) => {
                const target = targets[0];
                this.basic.sfx.play();
                this.stats.def *= 1.25;
                const dmg = dealDamageDef(this, target, this.basic.modifier);
                takeDamage(target, dmg);
                if (target.weaknesses.some(w => w.weakness === this.element)) {
                    toughnessDamage(target, (15 * this.breakeffect))
                }
                energyGain(this, 15);
                if (sp < spmax) {
                    sp++;
                    document.getElementById("currentsp").innerText = sp;
                }
                document.getElementById("dmgtext").innerText = `${this.name} dealt ${dmg} damage to ${target.name}!`;
                applyBuff(this, "Antiviral Buffer", this);
                showEffects();
                addTotalDamage(dmg);
                endBasic();
            }
        },

            this.skill = {
                name: "Shield.exe",
                description: "Grants all allies a shield based on Stephen's defense and increases their defense for 2 turns.",
                modifier: 0.7,
                sfx: new Audio("mixkit-sci-fi-confirmation-914.wav"),
                execute: () => {
                    if (sp != 0) {
                        this.skill.sfx.play();
                        const shieldAmount = ((this.skill.modifier * this.stats.def)) + 105;
                        characterList.forEach(character => {
                            if (character.currentHP >= 0) {
                                shieldUnit(character, shieldAmount);
                                applyBuff(character, "Shield.exe", this)
                            }
                            document.getElementById("dmgtext").innerText = `${this.name} shielded all allies for ${Math.floor(shieldAmount)}!`;
                        })
                        addTotalDamage(Math.floor((this.skill.modifier * this.stats.hp) * characterList.length))
                        energyGain(this, 30);
                        characterList.filter(c => c.currentHP > 0).forEach(() => {
                            document.dispatchEvent(new CustomEvent("shieldAlly"));
                        });
                        showEffects();
                        updateCharacterStats();
                        endSkill();

                    }


                }
            }

        this.ultimate = {
            name: "Safeguard Manifest",
            description: "Grants all allies a massive shield and gives Stephen one stack of 'Reboot', allowing him to revive a fallen character.",
            modifier: 1,
            sfx: new Audio("mixkit-sci-fi-plasma-gun-power-up-1679.wav"),
            execute: () => {
                if (this.resource >= this.resourcemax) {
                    flashUltimate(this);
                    this.reboot = true;
                    applyBuff(this, "Click To Restart", this);
                    const shieldAmount = ((this.ultimate.modifier * this.stats.def)) + 105;
                    characterList.forEach(character => {
                        if (character.currentHP >= 0) {
                            shieldUnit(character, shieldAmount);
                        }
                        document.getElementById("dmgtext").innerText = `${this.name} shielded all allies for ${Math.floor(shieldAmount)}!`;
                    })
                    characterList.filter(c => c.currentHP > 0).forEach(() => {
                        document.dispatchEvent(new CustomEvent("shieldAlly"));
                    });
                    showEffects();
                    updateCharacterStats();
                    this.resource = 5;

                }
                else {
                    showNotification(notEnoughEnergy);
                    ultimateButton.style.disabled = true;
                }
            },
        };

        this.passive = {
            effect: () => {
                if (this.reboot === true) {
                    document.addEventListener("allyDowned", () => {

                        const downedCharIndex = characterList.findIndex(c => c.currentHP <= 0);
                        if (downedCharIndex === -1) return;

                        const downedChar = characterList[downedCharIndex];

                        downedChar.currentHP = Math.floor(0.3 * downedChar.stats.hp);

                        showNotification(`${downedChar.name} has been revived by ${this.name}'s Reboot!`);
                        new Audio("futuristic-gun-shot-sci-fi-217154.mp3").play();

                        const charImg = document.getElementById(`char${downedCharIndex + 1}`);
                        if (charImg) charImg.classList.remove("downed");
                        this.reboot = false;
                        updateCharacterStats();
                    })
                }

            }
        }
        this.passive.effect();
    }
}

class MrReca extends Character {
    constructor(level) {
        super({
            name: "Mr. Reca",
            img: "MrReca-removebg-preview.png",
            level: level,
            affiliation: "Penacony",
            star: "5*",
            path: "Harmony",
            element: "Quantum",
            resource: 25,
            resourcemax: 110,
            basehp: 170,
            baseatk: 87,
            basedef: 72,
            speed: 98,
            hpgrowth: 11,
            atkgrowth: 7,
            defgrowth: 8,
            damageStack: 0
        });

        this.basic = {
            name: "Cut!",
            description: "Deal Quantum damage to one enemy and reduce their speed by 10%.",
            modifier: 0.3,
            sfx: new Audio("Clapper-sound-effect.mp3"),
            execute: (targets) => {
                const target = targets[0];
                this.basic.sfx.play();
                const dmg = dealDamage(this, target, (this.basic.modifier));
                takeDamage(target, dmg + this.damageStack);
                if (target.weaknesses.some(w => w.weakness === this.element)) {
                    toughnessDamage(target, (15 * this.breakeffect))
                }
                energyGain(this, 10);
                if (sp < spmax) {
                    sp++;
                    document.getElementById("currentsp").innerText = sp;
                }
                document.getElementById("dmgtext").innerText = `${this.name} dealt ${dmg} damage to ${target.name}!`;
                applyDebuff(target, "Cut!", this);
                target.stats.speed *= 0.9;
                showEffects();
                addTotalDamage(dmg);
                this.damageStack = 0;
                endBasic();
            }
        },

            this.skill = {
                name: "We'll do it live!",
                description: "Allows the currently targetted ally to immediately take action and grants a massive damage boost! Can only be applied to one ally.",
                modifier: 0,
                sfx: new Audio("Fast Forward Sound Effect.mp3"),
                execute: async () => {
                    if (!allyTargetList[0]) {
                        showNotification("Target an ally first!");
                        return;
                    }
                    if (sp == 0) return;
                    let currentTurnIndex = turnOrder.indexOf(currentTurn);
                    let targetIndex = turnOrder.indexOf(allyTargetList[0]);
                    if (targetIndex > currentTurnIndex) {
                        turnOrder.splice(targetIndex, 1);
                    }

                    characterList.forEach(c => {
                        c.buffs = c.buffs.filter(b => b.id !== "Run It Back!");
                    });

                    this.skill.sfx.play();
                    energyGain(this, 30);

                    const target = allyTargetList[0];

                    document.getElementById("infotext").innerText =
                        `${this.name} advanced ${target.name}'s action!`;

                    await sleep(750);

                    currentTurn = target;


                    target.resource += 5;
                    if (target.resource >= target.resourcemax) {
                        target.resource = target.resourcemax;
                        ultimateButton.disabled = false;
                    }

                    sp--;
                    document.getElementById("currentsp").innerText = sp;

                    applyBuff(target, "Run It Back!", this);
                    setTurnIndicator();
                }
            }



        this.ultimate = {
            name: "Ready, Set, Action!",
            description: "Increases the speed of all allies by 33% and slows enemies down by 25% for 2 turns. ",
            modifier: 0,
            sfx: new Audio("VO_JA_Anaxa_Technique_01.ogg"),
            execute: () => {
                if (this.resource >= this.resourcemax) {
                    this.ultimate.sfx.play();
                    flashUltimate(this);
                    characterList.forEach(character => {
                        applyBuff(character, "Ready, Set, Action!", this)
                        character.stats.speed *= 1.33;
                    })

                    enemyList.forEach(enemy => {
                        enemy.stats.speed *= 0.75;
                        applyDebuff(enemy, "Ready, Set, Action!", this)
                    });
                    this.resource = 5;

                }
                else {
                    showNotification(notEnoughEnergy);
                    ultimateButton.style.disabled = true;
                }
            },
        };

        this.passive = {
            effect: () => {
                const charLevel = this.level;
                document.addEventListener("turnStart", () => { this.damageStack += 0.1 * charLevel; })
                    ;
            }
        };
        this.damageStack = 0;
        this.passive.effect()

    }
}

class Screwllum extends Character {
    constructor(level) {
        super({
            name: "Screwllum",
            img: "so-again-how-is-screwllum-still-not-playable-v0-roxuglb2y40g1.webp",
            level: level,
            affiliation: "Herta Space Station",
            star: "5*",
            path: "Erudition",
            element: "Imaginary",
            resource: 25,
            resourcemax: 150,
            basehp: 164,
            baseatk: 103,
            basedef: 62,
            speed: 101,
            hpgrowth: 13,
            atkgrowth: 9,
            defgrowth: 6,
        });

        this.basic = {
            name: "Cognizant Shock",
            description: "Deal Imaginary damage to one designated enemy and adjactent targets.",
            modifier: 1,
            sfx: new Audio("elemental-magic-spell-impact-outgoing-228342.mp3"),
            execute: (targets) => {
                const target = targets[0];
                const targetIndex = enemyList.indexOf(target);
                this.basic.sfx.play();
                const dmg = dealDamage(this, target, this.basic.modifier);
                let targetLeft = enemyList[targetIndex - 1];
                let targetRight = enemyList[targetIndex + 1];
                takeDamage(target, dmg);
                if (target.weaknesses.some(w => w.weakness === this.element)) {
                    toughnessDamage(target, (25 * this.breakeffect))
                }
                if (targetLeft) {
                    takeDamage(targetLeft, dmg);
                    if (targetLeft.weaknesses.some(w => w.weakness === this.element)) {
                        toughnessDamage(targetLeft, (15 * this.breakeffect))
                    }
                }
                if (targetRight) {
                    takeDamage(targetRight, dmg);
                    if (targetRight.weaknesses.some(w => w.weakness === this.element)) {
                        toughnessDamage(targetRight, (15 * this.breakeffect))

                    }
                }

                energyGain(this, 10);
                if (sp < spmax) {
                    sp += 1;
                    document.getElementById("currentsp").innerText = sp;
                }
                document.getElementById("dmgtext").innerText = `${this.name} dealt ${dmg} damage to ${target.name}`;
                addTotalDamage(dmg);
                if (targetLeft) addTotalDamage(dmg);
                if (targetRight) addTotalDamage(dmg);
                endBasic();
            }
        },

            this.skill = {
                name: "Planetary Devastation",
                description: "Deal Imaginary damage to a random enemy target 9 times",
                modifier: 0.8,
                sfx: new Audio("simple-zaps-48107.mp3"),
                execute: async (targets) => {
                    if (sp != 0) {
                        ;
                        for (let i = 0; i < 9; i++) {
                            let target = enemyList[Math.floor(Math.random() * enemyList.length)];
                            const dmg = dealDamage(this, target, this.skill.modifier);
                            takeDamage(target, dmg);
                            if (target.weaknesses.some(w => w.weakness === this.element)) {
                                toughnessDamage(target, (10 * this.breakeffect))
                            }
                            energyGain(this, 3);
                            addTotalDamage(dmg);
                            if ((i / 3) == 0) {
                                const sfxClone = this.skill.sfx.cloneNode();
                                sfxClone.play();
                            }
                            await sleep(200);
                            document.getElementById("dmgtext").innerText = `${this.name} dealt ${total} damage to random enemies!`
                        }

                        endSkill();
                    }
                    else {
                        notification.innerText = "Not enough skill points!"
                    }
                },
            };

        this.ultimate = {
            name: "Galactic Annihilation",
            description: "Deal Imaginary damage to all enemies 4 times.",
            modifier: 2,
            sfx: new Audio("VO_JA_Welt_Skill_01.ogg"),
            execute: async () => {
                if (this.resource >= this.resourcemax) {
                    flashUltimate(this);

                    for (let i = 0; i < 4; i++) {
                        const dmgList = enemyList.map(enemy => dealDamage(this, enemy, this.ultimate.modifier));
                        new Audio("Minecraft Fall Damage (Crack) - Sound Effect (HD).mp3").play();
                        for (let j = 0; j < enemyList.length; j++) {
                            const enemy = enemyList[j];
                            const dmg = dmgList[j];

                            takeDamage(enemy, dmg);
                            addTotalDamage(dmg);

                            if (enemy.weaknesses.some(w => w.weakness === this.element)) {
                                toughnessDamage(enemy, (7 * this.breakeffect));
                            }
                        }

                        updateEnemyStats(); 
                        await sleep(500);
                    }

                    document.getElementById("dmgtext").innerText =
                        `${this.name} dealt ${total} damage to all enemies!`;

                    document.getElementById("ultimatebutton").disabled = true;
                    checkDeath();
                    this.resource = 5;
                    updateCharacterStats();
                } else {
                    showNotification(notEnoughEnergy);
                    ultimateButton.style.disabled = true;
                }
            },
        };


        this.passive = {
            effect:
                document.addEventListener("damageTaken", () => {
                    if (characterList.includes(currentTurn)) {
                        energyGain(this, 2);
                        updateCharacterStats();
                    }
                })
        }
    }
}

class Yanqing extends Character {
    constructor(level) {
        super({
            name: "Yanqing",
            img: "7188611a0125132f22376df9638d6675_602835355632644652-removebg-preview.png",
            level: level,
            affiliation: "Xianzhou",
            star: "5*",
            path: "The Hunt",
            element: "Ice",
            resource: 25,
            resourcemax: 140,
            basehp: 164,
            baseatk: 110,
            basedef: 65,
            speed: 104,
            hpgrowth: 13,
            atkgrowth: 10,
            defgrowth: 7,
            skillStacks: 0,
        });

        this.basic = {
            name: "Swords, Heed Me",
            description: "Deal Ice damage to one designated enemy. Recovers 2 Skill Points.",
            modifier: 0.8,
            sfx: new Audio("lknhemis25-stab-sfx-5(1).mp3"),
            execute: (targets) => {
                const target = targets[0];
                this.basic.sfx.play();
                const dmg = dealDamage(this, target, this.basic.modifier);
                takeDamage(target, dmg);
                if (target.weaknesses.some(w => w.weakness === this.element)) {
                    toughnessDamage(target, (10 * this.breakeffect))
                }
                energyGain(this, 20);
                spmax = 5;
                if (sp < spmax) {
                    sp = Math.min(sp + 2, spmax);
                    document.getElementById("currentsp").innerText = sp;
                }
                document.getElementById("dmgtext").innerText = `${this.name} dealt ${dmg} damage to ${target.name}`;
                addTotalDamage(dmg);
                endBasic();
            }
        },

            this.skill = {
                name: "Masterful Swordsmanship",
                description: "Consumes all Skill Points to deal increasing Ice damage to one enemy.",
                modifier1: 0.75,
                modifier2: 1,
                modifier3: 1.5,
                modifier4: 2.5,
                sfx1: new Audio("ice-freezing-445024.mp3"),
                sfx2: new Audio("tcqmcnh6yn-ice-impact-sfx-4.mp3"),
                sfx3: new Audio("february-storm-63062.mp3"),
                sfx4: new Audio("hit-windy-thud-399086.mp3"),
                sfx5: new Audio("large-underwater-explosion-190270(2).mp3"),
                execute: async (targets) => {
                    showNotification("");
                    if (sp != 0) {
                        basicAtkButton.disabled = true;
                        skillButton.disabled = true;
                        const target = targets[0];
                        let dmg = 0;

                        if (this.skillStacks === 0 || this.skillStacks === 1) {
                            dmg = dealDamage(this, target, this.skill.modifier1);
                            energyGain(this, 10);
                            this.skill.sfx1.play();
                        } else if (this.skillStacks === 2 || this.skillStacks === 3) {
                            dmg = dealDamage(this, target, this.skill.modifier2);
                            energyGain(this, 10)
                            this.skill.sfx2.play();
                            if (this.skillStacks === 3) this.skill.sfx3.play();
                        } else if (this.skillStacks === 4) {
                            dmg = dealDamage(this, target, this.skill.modifier3);
                            energyGain(this, 15);
                            this.skill.sfx4.play();
                        } else if (this.skillStacks >= 5) {
                            dmg = dealDamage(this, target, this.skill.modifier4);
                            energyGain(this, 20);
                            this.skill.sfx5.play();
                        }
                        this.skillStacks += 1;
                        takeDamage(target, dmg);

                        if (target.weaknesses.some(w => w.weakness === this.element)) {
                            if (this.skillStacks === 0 || this.skillStacks === 1) {
                                toughnessDamage(target, (10 * this.breakeffect));
                            } else if (this.skillStacks === 2 || this.skillStacks === 3) {
                                toughnessDamage(target, (15 * this.breakeffect));
                            } else if (this.skillStacks === 4) {
                                toughnessDamage(target, (20 * this.breakeffect));
                            } else if (this.skillStacks >= 5) {
                                toughnessDamage(target, (25 * this.breakeffect));
                            }
                        }

                        energyGain(this, 10);
                        sp -= 1;
                        if (sp == 0) {
                            sp = 1,
                                endSkill(),
                                spmax = 5,
                                this.skillStacks = 0;
                            showNotification("Yanqing has run out of steam!");

                        }

                        document.getElementById("currentsp").innerText = sp;
                        document.getElementById("dmgtext").innerText = `${this.name} dealt ${dmg} damage to ${target.name}`;
                        addTotalDamage(dmg);
                        updateCharacterStats();
                        updateEnemyStats();
                        await sleep(500);
                        skillButton.disabled = false;
                        if (sp == 0) skillButton.disabled = true;

                    }

                },
            },
            this.ultimate = {
                name: "Prodigal Youth",
                description: "Increase Skill Point maximum by, and recover 3 Skill Points, and increases Yanqing's speed by 25% for 3 turns. Also allows him to ignore 25% of enemy defenses for 1 turn.",
                modifier: 0.5,
                sfx: new Audio("VO_JA_Jing_Yuan_Ultimate_-_Unleash_01.ogg"),
                execute: async () => {
                    if (this.resource >= this.resourcemax) {
                        this.resource = 5;
                        flashUltimate(this);
                        spmax = 8;
                        this.speed *= 1.25;
                        this.defignore *= 1.25;
                        applyBuff(this, "Swift as the Wind", this);
                        applyBuff(this, "Destructive as Lightning", this);
                        sp = Math.min(sp + 3, spmax);
                        this.resource = 5;
                        document.getElementById("currentsp").innerText = sp;
                        document.getElementsById("maxsp").innerText = spmax;
                        updateCharacterStats();
                        showEffects();
                        this.resource = 5;
                    } else {
                        showNotification(notEnoughEnergy);
                        ultimateButton.style.disabled = true;
                    }
                },
            };


        this.passive = {
            effect:
                document.addEventListener("basicAttackUsed", () => {
                    energyGain(this, 10);
                    updateCharacterStats();
                })
        }
    }
}

class Tribios extends Character {
    constructor(level) {
        super({
            name: "Tribios",
            img: "a800ca311eaac0c77272cb34ce7b40bd-removebg-preview.png",
            level: level,
            affiliation: "Amphoreus",
            star: "5*",
            path: "Harmony",
            element: "Wind",
            resource: 25,
            resourcemax: 120,
            basehp: 144,
            baseatk: 92,
            basedef: 68,
            speed: 105,
            hpgrowth: 14,
            atkgrowth: 6,
            defgrowth: 6.5,
        });

        this.basic = {
            name: "Gust of Time",
            description: "Deal Wind damage to one designated enemy.",
            modifier: 0.9,
            sfx: new Audio("mixkit-quick-air-woosh-2605.wav"),
            execute: (targets) => {
                const target = targets[0];
                this.basic.sfx.play();
                const dmg = dealDamage(this, target, this.basic.modifier);
                takeDamage(target, dmg);
                if (target.weaknesses.some(w => w.weakness === this.element)) {
                    toughnessDamage(target, (10 * this.breakeffect))
                }
                energyGain(this, 20);
                if (sp < spmax) {
                    sp += 1;
                    document.getElementById("currentsp").innerText = sp;
                }
                addTotalDamage(dmg);
                endBasic();
                document.dispatchEvent(new CustomEvent("tribiosBasic"));
            }
        },

            this.skill = {
                name: "Gales of Tomorrow",
                description: "Increases all allies' Attack and Speed for 3 turns",
                sfx: new Audio("wind-gust-386158.mp3"),
                execute: (targets) => {
                    if (sp != 0) {
                        this.skill.sfx.play();
                        characterList.forEach(character => {
                            if (character.buffs.some(b => b.id !== "Gales of Tomorrow")) {
                                character.stats.atk *= 1.25;
                                character.stats.speed *= 1.25;
                            }
                            applyBuff(character, "Gales of Tomorrow", this)
                        })
                        showEffects();
                        energyGain(this, 30);
                        endSkill();
                    }
                    else {
                        notification.innerText = "Not enough skill points!"
                    }
                },
            };

        this.ultimate = {
            name: "The West Wind",
            description: "Increases all allies' damage dealt by 50%.",
            modifier: 2,
            sfx: new Audio("VO_JA_Robin_Skill_01.ogg"),
            execute: () => {
                if (this.resource >= this.resourcemax) {
                    flashUltimate(this);
                    characterList.forEach(character => {
                        character.damageBonus *= 1.5;
                        applyBuff(character, "Riding the West Wind", this)
                    })
                    this.resource = 5;
                }
                else {
                    showNotification(notEnoughEnergy);
                    ultimateButton.style.disabled = true;
                }
            },
        };

        this.passive = {
            effect: () => {
                document.addEventListener("tribiosBasic", () => {
                    characterList.forEach(character => {
                        character.stats.atk *= 1.05;
                    });
                });
            }
        };
        this.passive2 = {
            effect: () => {
                document.addEventListener("turnStart", () => {
                    if (currentTurn === this) {
                        characterList.forEach(c => {
                            const buff = c.buffs.find(b => b.id === "Gales of Tomorrow");
                            if (buff) buff.duration--;
                            const buff2 = c.buffs.find(b => b.id === "Riding the West Wind");
                            if (buff2) buff2.duration--;
                        });
                        showEffects();
                    }
                });
            }
        };
        this.passive.effect();
        this.passive2.effect();

    }
}

class VoidRangerReaver extends Enemy {
    constructor(level) {
        super({
            name: "Voidranger: Reaver",
            img: "Voidranger_Reaver-removebg-preview.png",
            level: level,
            affiliation: "Antimatter Legion",
            rank: "Normal",
            weaknesses: {
                weakness1: "Physical",
                weakness2: "Ice",
                weakness3: "Wind",
            },
            hp: 120,
            atk: 12,
            def: 210,
            speed: 100,
            toughness: 30,
            hpgrowth: 140,
            atkgrowth: 4,
            defgrowth: 4
        });
    }

    async onTurn() {
        await sleep(1000);
        resolveBuffsandDebuffs(this);
        if (this.currentHP <= 0) {
            checkDeath();
            updateCharacterStats();
            updateEnemyStats()
            return;
        }
        if (this.isStunned == true) {
            document.getElementById("infotext").textContent = `${this.name} is stunned!`
            return;
        }
        if (this.isBroken == true) {
            brokenEnemy(this);
        }
        await sleep(750);
        const chooseAttack = Math.floor(Math.random() * 2);
        let { actualTarget } = enemyRandomTarget();
        await sleep(750);
        if (chooseAttack == 0) {
            // Hunting Blade
            document.getElementById("infotext").textContent = `${this.name} uses Hunting Blade on ${actualTarget.name}!`;
            new Audio("lknhemis25-stab-sfx-5.mp3").play();
            document.getElementById("dmgtext").innerText = ``
            await sleep(1000);
            let dmg = dealDamageEnemy(this, actualTarget, 2.5);
            actualTarget.currentHP -= dmg
            energyGain(actualTarget, 10);
            document.getElementById("dmgtext").innerText = `${this.name} dealt ${dmg} damage to ${actualTarget.name}!`
        } else {
            // Vortex Leap
            new Audio("mixkit-metal-hit-woosh-1485.wav").play();
            const { actualTarget, index } = enemyRandomTarget();
            let targetLeft = characterList[index - 1];
            let targetRight = characterList[index + 1];
            document.getElementById("dmgtext").innerText = ``
            document.getElementById("infotext").textContent = `${this.name} uses Vortex Leap, centered on ${actualTarget.name}!`;
            await sleep(1000);
            let dmg = dealDamageEnemy(this, actualTarget, 1.5);
            takeDamage(actualTarget, dmg);
            energyGain(actualTarget, 10);
            document.getElementById("dmgtext").innerText = `${this.name} dealt ${dmg} damage to multiple enemies!`
            if (targetLeft) {
                takeDamage(targetLeft, dmg);
                energyGain(targetLeft, 10)
            }
            if (targetRight) {
                takeDamage(targetRight, dmg);
                energyGain(targetRight, 10)
            }

        }
        checkDeath();
        updateCharacterStats();
        updateEnemyStats();
    }
}

class VoidRangerDistorter extends Enemy {
    constructor(level) {
        super({
            name: "Voidranger: Distorter",
            img: "Enemy_Voidranger_Distorter.webp",
            level: level,
            affiliation: "Antimatter Legion",
            rank: "Normal",
            weaknesses: {
                weakness1: "Fire",
                weakness2: "Imaginary",
                weakness3: "Wind",
            },
            hp: 150,
            atk: 15,
            def: 210,
            speed: 120,
            toughness: 25,
            hpgrowth: 110,
            atkgrowth: 4,
            defgrowth: 3
        });
    }

    async onTurn() {
        await sleep(1000);
        resolveBuffsandDebuffs(this);
        if (this.currentHP <= 0) {
            checkDeath();
            updateCharacterStats();
            updateEnemyStats()
            return;
        }
        if (this.isStunned == true) {
            document.getElementById("infotext").textContent = `${this.name} is stunned!`
            return;
        }
        if (this.isBroken == true) {
            brokenEnemy(this);
        }
        await sleep(750);
        let { actualTarget } = enemyRandomTarget();
        characterList.forEach(c => {
            if (c.debuffs.some(d => d.id === "Nihility's Command") && c.isAlive == true) {
                actualTarget = c
            }
        });
        await sleep(750);
        // Shadowless Void Strike
        if (actualTarget.debuffs.some(d => d.id == "Nihility's Command")) {
            document.getElementById("infotext").textContent = `${this.name} uses Shadowless Void Strike on ${actualTarget.name}!`;
            new Audio(" SPELL_MA_Artifact_Ebonbolt_Cast_02(1).ogg").play();
            document.getElementById("dmgtext").innerText = ``
            await sleep(1000);
            let dmg = dealDamageEnemy(this, actualTarget, 4);
            takeDamage(actualTarget, dmg);
            energyGain(actualTarget, 15);
            document.getElementById("dmgtext").innerText = `${this.name} dealt ${dmg} damage to ${actualTarget.name}!`
            actualTarget.debuffs.find(d => d.id === "Nihility's Command").duration = 0;
        }
        else {
            // Nihility's Command
            document.getElementById("dmgtext").innerText = ``
            new Audio("ShadowCast.ogg").play();
            document.getElementById("infotext").textContent = `${this.name} uses Nihility's Command on ${actualTarget.name}!`;
            applyDebuff(actualTarget, "Nihility's Command", this);

            await sleep(1000);

        }
        checkDeath();
        updateCharacterStats();
        updateEnemyStats();
    }
}

class VoidRangerTrampler extends Enemy {
    constructor(level) {
        super({
            name: "Voidranger: Trampler",
            img: "Enemy_Voidranger_Trampler-removebg-preview.png",
            level: level,
            affiliation: "Antimatter Legion",
            rank: "Elite",
            weaknesses: {
                weakness1: "Quantum",
                weakness2: "Ice",
                weakness3: "Imaginary",
            },
            hp: 220,
            atk: 18,
            def: 280,
            speed: 100,
            toughness: 80,
            hpgrowth: 180,
            atkgrowth: 5,
            defgrowth: 6,
            turnCount: 0,
        });
    }

    async onTurn() {
        await sleep(1000);
        resolveBuffsandDebuffs(this);
        if (this.currentHP <= 0) {
            checkDeath();
            updateCharacterStats();
            updateEnemyStats()
            return;
        }
        if (this.isStunned == true) {
            document.getElementById("infotext").textContent = `${this.name} is stunned!`
            return;
        }
        if (this.isBroken == true) {
            brokenEnemy(this);
        }
        await sleep(750);

        if (this.turnCount === 1) {
            // Windseeker Volley
            this.turnCount = 0;
            let unaffected = 0;
            document.getElementById("dmgtext").innerText = ``;
            document.getElementById("infotext").textContent = `${this.name} uses Windseeker Volley!`;
            new Audio("many-arrows-flying-by-306037.mp3").play();
            await sleep(2000);

            characterList.forEach(c => {
                if (c.debuffs.some(d => d.id === "Wind Shear")) {
                    let dmg = dealDamageEnemy(this, c, 2.25);
                    takeDamage(c, dmg);
                    energyGain(c, 20);
                    document.getElementById("dmgtext").innerText += `${this.name} dealt ${dmg} damage to ${c.name}!\n`;
                    cleanseDebuffs(c, "Wind Shear");
                } else {
                    unaffected++;
                }
            });

            if (unaffected === characterList.length) {
                document.getElementById("dmgtext").innerText = `${this.name}'s Windseeker Volley missed all targets!`;
            }
            await sleep(1000);

        } else {

            const anyWindShear = characterList.some(c => c.debuffs.some(d => d.id === "Wind Shear"));

            if (anyWindShear) {
                document.getElementById("infotext").textContent = `${this.name} is preparing to hit all allies afflicted by Wind Shear!`;
                this.turnCount = 1;
                new Audio("magic-strike-5856.mp3").play();
                await sleep(1000);
            } else {
                // Trample
                new Audio("big-robot-footstep-015-445103.mp3").play();
                let { actualTarget, index } = enemyRandomTarget();
                let targetLeft = characterList[index - 1];
                let targetRight = characterList[index + 1];

                document.getElementById("dmgtext").innerText = ``;
                document.getElementById("infotext").textContent = `${this.name} uses Trample, centered on ${actualTarget.name}!`;
                await sleep(1000);

                let dmg = Number(Math.round(dealDamageEnemy(this, actualTarget, 1.1)));

                takeDamage(actualTarget, dmg);
                energyGain(actualTarget, 10);
                applyDebuff(actualTarget, "Wind Shear", this);

                if (targetLeft) {
                    takeDamage(targetLeft, dmg * 0.6);
                    energyGain(targetLeft, 5);
                    applyDebuff(targetLeft, "Wind Shear", this);
                }
                if (targetRight) {
                    takeDamage(targetRight, dmg * 0.6);
                    energyGain(targetRight, 5);
                    applyDebuff(targetRight, "Wind Shear", this);
                }

                document.getElementById("dmgtext").innerText = `${this.name} dealt ${Math.round(dmg * 2.2)} total damage to multiple enemies!`;
            }
        }
        await sleep(2000);
        checkDeath();
        updateCharacterStats();
        updateEnemyStats();
    }
}

class LesserSting extends Enemy {
    constructor(level) {
        super({
            name: "Lesser Sting",
            img: "Enemy_Lesser_Sting-removebg-preview.png",
            level: level,
            affiliation: "The Swarm",
            rank: "Normal",
            weaknesses: {
                weakness1: "Wind",
                weakness2: "Fire",
                weakness3: "Quantum",
            },
            hp: 68,
            atk: 12,
            def: 200,
            speed: 97,
            toughness: 20,
            hpgrowth: 100,
            atkgrowth: 4,
            defgrowth: 5,
        });
    }

    async onTurn() {
        await sleep(1000);
        resolveBuffsandDebuffs(this);
        if (this.currentHP <= 0) {
            checkDeath();
            updateCharacterStats();
            updateEnemyStats()
            return;
        }
        if (this.isStunned == true) {
            document.getElementById("infotext").textContent = `${this.name} is stunned!`
            return;
        }
        if (this.isBroken == true) {
            brokenEnemy(this);
        }
        await sleep(750);
        // Shear Attack
        new Audio("flutter-from-whoosh-84523.mp3").play();
        let { actualTarget } = enemyRandomTarget();
        const dmg = dealDamageEnemy(this, actualTarget, 1);
        takeDamage(actualTarget, dmg);
        energyGain(actualTarget, 10);
        document.getElementById("infotext").textContent = `${this.name} attacks ${actualTarget.name} for ${dmg} damage!`;
        applyDebuff(actualTarget, "Wind Shear", this);
        checkDeath();
        updateCharacterStats();
        updateEnemyStats();
        await sleep(500);
    }
    async onDeath() {
        if (this.speed != 0) {
            this.speed = 0;
            console.log(`${this.name} explodes on death.`);
            new Audio("071758_skittering-bugsmp3-39918.mp3").play();
            await sleep(1200);
            new Audio("oddworld_bomb-94173.mp3").play();
            await sleep(1000);
            document.getElementById("infotext").textContent = `${this.name} explodes!`;
            if (this.currentHP <= 0) {
                characterList.forEach(c => {
                    takeDamage(c, this.level * 3 + 10);
                    energyGain(c, 5);
                    applyDebuff(c, "Sudden Impact", this);
                });
            }
        }
    }
}

class RenegadeSting extends Enemy {
    constructor(level) {
        super({
            name: "Renegade Sting",
            img: "Enemy_Gnaw_Sting-removebg-preview.png",
            level: level,
            affiliation: "The Swarm",
            rank: "Normal",
            weaknesses: {
                weakness1: "Fire",
                weakness2: "Physical",
                weakness3: "Imaginary",
            },
            hp: 50,
            atk: 12,
            def: 200,
            speed: 101,
            toughness: 40,
            hpgrowth: 130,
            atkgrowth: 4,
            defgrowth: 6,
            turnCount: 0,
        });
    }

    async onTurn() {
        await sleep(1000);
        resolveBuffsandDebuffs(this);
        if (this.currentHP <= 0) {
            checkDeath();
            updateCharacterStats();
            updateEnemyStats()
            return;
        }
        if (this.isStunned == true) {
            document.getElementById("infotext").textContent = `${this.name} is stunned!`
            return;
        }
        if (this.isBroken == true) {
            brokenEnemy(this);
            return;
        }
        await sleep(750);
        if (this.turnCount === 0) {
            document.getElementById("infotext").textContent =
                `${this.name} becomes Enraged!`;

            applyDebuff(this, "Enraged Sting", this);
            await sleep(1000);

            this.turnCount++;
        }

        else if (this.turnCount === 1) {
            new Audio("explosion-312361.mp3").play();
            let { actualTarget } = enemyRandomTarget();
            const dmg = dealDamageEnemy(this, actualTarget, 4);

            document.getElementById("infotext").textContent =
                `${this.name} kamikaze'd onto ${actualTarget.name}!`;

            await sleep(1000);

            takeDamage(actualTarget, dmg);
            energyGain(actualTarget, 20);

            this.currentHP = 0;
            console.log(`${this.name} has kamikazed.`);
        }
        checkDeath();
        updateCharacterStats();
        updateEnemyStats();
    }
}

class SwarmKing extends Enemy {
    constructor(level) {
        super({
            name: "Swarm King",
            img: "Scarakabaz.png",
            level: level,
            affiliation: "The Swarm",
            rank: "Boss",
            weaknesses: {
                weakness1: "Ice",
                weakness2: "Physical",
                weakness3: "Imaginary",
            },
            hp: 408,
            atk: 19,
            def: 275,
            speed: 100,
            toughness: 120,
            hpgrowth: 300,
            atkgrowth: 7,
            defgrowth: 5,
            turnCount: 0,
            cooldown: 0,
        });
    }

    async onTurn() {
        await sleep(1000);
        resolveBuffsandDebuffs(this);
        if (this.currentHP <= 0) {
            checkDeath();
            updateCharacterStats();
            updateEnemyStats()
            return;
        }
        if (this.isStunned == true) {
            document.getElementById("infotext").textContent = `${this.name} is stunned!`
            return;
        }
        if (this.isBroken == true) {
            brokenEnemy(this);
        }
        await sleep(750);
        // Spawn Minions
        if (this.cooldown == 0) {
            new Audio("mixkit-futuristic-sci-fi-insect-plague-sounds-322.wav").play();
            await (spawnMinions(this.level, 4, [RenegadeSting, LesserSting]));
            await sleep(800);
            this.cooldown = 2;
        }
        else {
            this.cooldown--;
        }
        // Actual Attack
        const randomAttack = Math.floor(Math.random() * 2);
        if (this.turnCount++ < 6) {
            if (randomAttack == 0) {
                new Audio("whack04-105536.mp3").play();
                let { actualTarget } = enemyRandomTarget();
                const dmg = dealDamageEnemy(this, actualTarget, 1);
                takeDamage(actualTarget, dmg);
                energyGain(actualTarget, 15);
                document.getElementById("infotext").textContent = `${this.name} attacks ${actualTarget.name} for ${dmg} damage!`;
                await sleep(1000);
                this.turnCount++;
            } else {
                new Audio("short-gas-leak-98286.mp3").play();
                document.getElementById("infotext").textContent = `${this.name} uses Miasma!`;
                characterList.forEach(c => {
                    const dmg = dealDamageEnemy(this, c, 0.8);
                    takeDamage(c, dmg);
                    energyGain(c, 10);
                    applyDebuff(c, "Miasma", this);
                });
                this.turnCount++;
            }
        } else {
            new Audio("sci-fi-charge-up-37395.mp3").play();
            document.getElementById("infotext").textContent = `${this.name} uses Swarm Disaster!`;
            await sleep(2000);
            new Audio("underwater-explosion-386175.mp3").play();
            characterList.forEach(c => {

                const dmg = dealDamageEnemy(this, c, 2);
                takeDamage(c, dmg);
                energyGain(c, 20);

            })
            this.turnCount = 0;
        };

        checkDeath();
        updateCharacterStats();
        updateEnemyStats();
    }
}

const characterClasses = {
    "Trailblazer": DestructionMC,
    "Constance": Constance,
    "Baiheng": Baiheng,
    "Mr. Reca": MrReca,
    "Screwllum": Screwllum,
    "Yanqing": Yanqing,
    "Tribios": Tribios,
    "Stephen": StephenLloyd,
}

let enemyDatabase = [VoidRangerReaver, VoidRangerDistorter, VoidRangerTrampler, LesserSting, RenegadeSting, SwarmKing];

let newEnemies = [VoidRangerTrampler, SwarmKing, RenegadeSting, LesserSting];

function generateEnemies(level, database) {
    enemyPoints = 0;
    enemyList.length = 0;
    let safety = 0;

    while (enemyPoints <= 5 && safety < 5) {

        const EnemyType = database[Math.floor(Math.random() * database.length)];
        const enemy = new EnemyType(level);

        switch (enemy.rank) {
            case "Normal":
                enemyPoints += 1;
                break;
            case "Elite":
                enemyPoints += 2;
                break;
            case "Boss":
                enemyPoints += 5;
                break;
        }
        if (enemyPoints >= 6) {
            enemyPoints -= enemy.rank === "Elite" ? 2 : 5;
            continue;
        } else {
            enemyList.push(enemy);
            safety++;
        }
        if (enemyPoints == 5) {
            break;
        }

    }

    setImages();
}

function generateEnemy(level, database) {

    const EnemyType = database[Math.floor(Math.random() * database.length)];
    const enemy = new EnemyType(level);

    enemyList.push(enemy);
    setImages();
}


function energyGain(target, amount) {
    target.resource = Math.min(target.resource + (amount * (target.energyRegen || 1)), target.resourcemax)
    updateCharacterStats();
}

function toughnessDamage(target, amount) {
    target.currenttoughness = Math.max((target.currenttoughness - amount), 0)
    updateEnemyStats();
}

function showEffects() {
    updateBuffsandDebuffs();
    enemyList.forEach((enemy, i) => {
        for (let j = 0; j < 5; j++) {
            const slot = document.getElementById(`enemy${i + 1}-debuff${j + 1}`);
            if (!slot) continue;

            if (enemy.debuffs[j]) {
                slot.src = enemy.debuffs[j].src;
                slot.title = `${enemy.debuffs[j].name}: ${enemy.debuffs[j].description} for ${enemy.debuffs[j].duration} turn(s)`;
                slot.style.display = 'inline-block';
                slot.style.outline = "rgba(0,0,0,0.3)"
                slot.style.height = "25px"
                slot.style.width = "25px"
            } else {
                slot.style.display = 'none';
            }
        }
    });

    characterList.forEach((char, i) => {
        for (let j = 0; j < 5; j++) {
            const buffSlot = document.getElementById(`char${i + 1}-buff${j + 1}`);
            if (buffSlot) {
                if (char.buffs[j]) {
                    buffSlot.src = char.buffs[j].src;
                    buffSlot.title = `${char.buffs[j].name}: ${char.buffs[j].description} for ${char.buffs[j].duration} turn(s)`;
                    buffSlot.style.display = 'inline-block';
                    buffSlot.style.backgroundColor = "rgba(0,0,0,0.3)"
                    buffSlot.style.height = "50px"
                    buffSlot.style.width = "50px"
                } else {
                    buffSlot.style.display = 'none';
                }
            }

            const debuffSlot = document.getElementById(`char${i + 1}-debuff${j + 1}`);
            if (debuffSlot) {
                if (char.debuffs[j]) {
                    debuffSlot.src = char.debuffs[j].src;
                    debuffSlot.title = `${char.debuffs[j].name}: ${char.debuffs[j].description} for ${char.debuffs[j].duration} turn(s)`;
                    debuffSlot.style.display = 'inline-block';
                    debuffSlot.style.backgroundColor = "rgba(0,0,0,0.3)"
                    debuffSlot.style.height = "50px"
                    debuffSlot.style.width = "50px"
                } else {
                    debuffSlot.style.display = 'none';
                }
            }
        }
    });
}

function procDoTs(unit) {
    unit.debuffs.forEach(debuff => {
        if (debuff.effectdmg) {
            debuff.effectdmg(debuff.applier, unit),
                document.dispatchEvent(new CustomEvent("damageTaken"))
        };
        if (debuff.event) document.dispatchEvent(new CustomEvent(debuff.event))

    })

    showNotification(DoTDamage);
    checkDeath();
    showEffects();
    updateCharacterStats();
    updateEnemyStats();

}


function resolveBuffsandDebuffs(unit) {

    unit.buffs.forEach(buff => {
        if (buff.effect) buff.effect(buff.applier, unit, buff.applier);
        buff.duration--;

        if (buff.duration <= 0 && buff.revert) buff.revert(buff.applier, unit);
        if (buff.sfx) new Audio(buff.sfx).play();
        if (buff.event) document.dispatchEvent(new CustomEvent(buff.event));

    });

    unit.buffs = unit.buffs.filter(b => b.duration > 0);

    unit.debuffs.forEach(debuff => {
        if (debuff.effectdmg) {
            debuff.effectdmg(debuff.applier, unit);
            if (debuff.effectdmg(debuff.applier, unit) != 0) showNotification(DoTDamage);
            checkDeath();
        }
        debuff.duration--;
        if (debuff.event) document.dispatchEvent(new CustomEvent(debuff.event));
        if (debuff.duration <= 0) {
            if (debuff.revert) debuff.revert(debuff.applier, unit);
        }
    });

    unit.debuffs = unit.debuffs.filter(d => d.duration > 0);

    showEffects();
}

function updateBuffsandDebuffs() {
    turnOrder.forEach(c => {
        c.debuffs = c.debuffs.filter(d => d.duration > 0);
    });

    turnOrder.forEach(c => {
        c.buffs = c.buffs.filter(d => d.duration > 0);
    });
}

function applyBreakDebuff(attacker, unit, element) {
    const debuffFind = debuffList.find(d => d.element === element);
    if (!debuffFind) return;

    const exists = unit.debuffs.some(d => d.id === debuffFind.id);
    if (exists) return;

    const debuff = { ...debuffFind };
    debuff.applier = attacker;
    unit.debuffs.push(debuff);
    showEffects();
}

function applyBuff(unit, buff, applier) {

    const buffFind = buffList.find(b => b.id === buff);

    const buffexists = unit.buffs.some(d => d.id === buffFind.id);
    if (buffexists) return;

    const newBuff = { ...buffFind };
    newBuff.applier = applier;
    unit.buffs.push(newBuff);
    showEffects();

}

function applyDebuff(unit, debuff, applier) {

    const debuffFind = debuffList.find(d => d.id === debuff);
    if (!debuffFind) return;

    const debuffexists = unit.debuffs.some(d => d.id === debuffFind.id);
    if (debuffexists) return;

    const newDebuff = { ...debuffFind };
    newDebuff.applier = applier;
    unit.debuffs.push(newDebuff);
    if (newDebuff.effect) newDebuff.effect(currentTurn, unit, applier);

    showEffects();

}

async function flashUltimate(character) {
    const flashImg = document.getElementById("ultimate-flash");
    flashImg.src = character.img;
    flashImg.classList.remove("hidden", "fade-out");
    flashImg.classList.add("active");

    character.ultimate.sfx.play();

    await new Promise(resolve => setTimeout(resolve, 1000));

    flashImg.classList.add("fade-out");
    await new Promise(resolve => setTimeout(resolve, 5000));

    flashImg.classList.remove("active", "fade-out");
    flashImg.classList.add("hidden");
}

function enemyRandomTarget() {
    let safety = 0;
    let aliveTarget = false;
    let randomTarget;
    let actualTarget;

    while (!aliveTarget && safety < 100) {
        randomTarget = Math.floor(Math.random() * characterList.length);
        actualTarget = characterList[randomTarget];
        if (actualTarget.currentHP > 0) aliveTarget = true;
        safety++;
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

            const enemyImages = document.querySelectorAll(".enemy-portrait");
            enemyImages.forEach(e => e.classList.remove('enemy-targeted'))

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

function targetAllies() {
    const allyImgs = document.querySelectorAll(".characterimage");
    allyImgs.forEach((img, index) => {
        img.addEventListener("click", () => {
            const ally = characterList[index];
            if (ally.currentHP == 0) return;

            const characterImages = document.querySelectorAll(".characterimage");
            characterImages.forEach(c => c.classList.remove('enemy-targeted'))

            selectedTarget = ally;
            img.classList.add('enemy-targeted');

            allyTargetList = [ally].filter(a => a);
            [-2, -1, 1, 2].forEach(offset => {
                const adj = characterList[index + offset];
                if (adj) allyTargetList.push(adj);
            });
        });
    });
}


async function brokenEnemy(enemy) {
    await sleep(1000);
    document.getElementById("infotext").textContent = `${enemy.name} recovers from being broken!`;
    enemy.isBroken = false;
    enemy.currenttoughness = enemy.maxtoughness;
    checkDeath();
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
        characterElement.style.display = "inline-block";
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
        const enemyStats = document.getElementById(`enemy${i + 1}-stats`);
        if (enemy && enemy.img) {
            enemyImage.src = enemy.img;
            enemyImage.style.display = "block";
            enemyImage.title = enemy.name;
            if (enemyStats) enemyStats.style.display = "block";
        } else {
            enemyImage.src = "";
            enemyImage.style.display = "none";
            if (enemyStats) enemyStats.style.display = "none";
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
            if (char.currentHP == 0) {
                charImage.classList.add("downed");
            }
            if (char.currentHP > 0) {
                charImage.classList.remove("downed");
            }
            if (charStats) charStats.style.display = "block";
            if (charElement) charElement.style.display = "block";
            charImage.title = `${char.name}: ${char.path}`;
        } else {
            charImage.src = "";
            charImage.style.display = "none";
            if (charStats) charStats.style.display = "none";
            if (charElement) charElement.style.display = "none";
        }
        updateEnemyWeaknessIcons();
        showEffects();
        setCharacterElementImages();
    }
}

function isPlaying(audio) {
    return !audio.paused && !audio.ended && audio.currentTime > 0;
}

async function start() {
    if (selectedCharacters.length != 4) {
        showNotification("Select a full team of 4 characters.");
        return
    }
    const characterSelect = document.getElementById("characterSelect");
    characterSelect.style.display = "none";
    combatOngoing = true;
    const enemyImgs = document.querySelectorAll(".enemy-portrait");
    enemyImgs.forEach(img => { img.classList.remove('enemy-targeted'); })
    difficultyLevel = Number(difficultyInput.value);
    document.getElementById("difficultyIndicatorText").textContent = "Level: ";
    document.getElementById("difficultyIndicatorNumber").style.display = "inline-block";
    document.getElementById("difficultyIndicatorNumber").textContent = difficultyLevel;
    if (difficultyLevel <= 0 || difficultyLevel > 100) {
        showNotification("Can't be lower than 1 or higher than 100");
        return;
    }
    if (characterList.length == 0) {
        createParty(difficultyLevel);
    }
    enemyList.length = 0;
    generateEnemies(difficultyLevel, enemyDatabase);
    setBackground();
    characterList.forEach((char, index) => {
        char.domId = `char${index + 1}`;
    });

    enemyList.forEach((enemy, index) => {
        enemy.domId = `enemy${index + 1}`;
    });
    if (!isPlaying(bgm)) {
        let randomIndex = Math.floor(Math.random() * bgmList.length);
        bgm.src = bgmList[randomIndex].src;
        bgm.play();
        volumePercent.textContent = Math.round(bgm.volume * 100) + "%";
    }
    startButton.style.display = "none";
    difficultyInput.style.display = "none";
    basicAtkButton.style.display = "inline-block";
    skillButton.style.display = "inline-block";
    ultimateButton.style.display = "inline-block";
    skillpointscurrentdisplay.style.display = "inline-block";
    spdivider.style.display = "inline-block";
    skillpointmaxdisplay.style.display = "inline-block";
    const elements = document.querySelectorAll(".character-stats");
    elements.forEach(el => {
        el.style.backgroundColor = "rgba(0,0,0,0.3)";
    });
    initializeTurnOrder(characterList, enemyList);
    checkTurnOrder();
    updateEnemyStats();
    updateCharacterStats();
    document.dispatchEvent(new CustomEvent("combatStart"));
    await sleep(1000);
    if (startButton.textContent == "Start") {
        window.alert("Welcome to Walmart Star Rail! Select your party, match character elements to enemy weaknesses to break their Toughness bar, spend Skill Points with Skills and build them with Basic Attacks to accrue energy to unleash devastating Ultimate attacks! For more information, you can always hover over things you don't fully understand!")
    } else if (startButton.textContent == "RETRY?") {
        characterList.length = 0;
        createParty(difficultyLevel);
        enemyList.forEach(e => {
            e.currentHP = e.totalHP
        })
    } else if (startButton.textContent == "NEXT CHALLENGE") {
        difficultyLevel++;
        document.getElementById("difficultyIndicatorNumber").textContent = difficultyLevel;
        characterList.length = 0;
        createParty(difficultyLevel);
        enemyList.length = 0;
        generateEnemies(difficultyLevel, enemyDatabase);

    }
};

function createParty(level) {
    const party = [];

    selectedCharacters.forEach(name => {
        const CharClass = characterClasses[name];
        if (CharClass) {
            party.push(new CharClass(level));
        }
    });
    characterList = party;
}


pauseMusicButton.onclick = () => {
    if (bgm.paused) {
        bgm.play();
    } else {
        bgm.pause();
    }
}

startButton.onclick = start;

bgm.volume = 0.3;
volumePercent.textContent = Math.round(bgm.volume * 100) + "%";

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
    volumePercent.textContent = Math.round(bgm.volume * 100) + "%";
}
basicAtkButton.onclick = () => {
    startBasic();
    currentTurn.basic.execute(targetList);
    document.dispatchEvent(new CustomEvent("basicAttackUsed"));
};
skillButton.onclick = () => {
    startSkill();
    currentTurn.skill.execute(targetList);
};

ultimateButton.onclick = () => {
    startUltimate();
    currentTurn.ultimate.execute(targetList);
    endUltimate();
};

async function spawnMinions(bossLevel, count, enemyTypes) {
    for (let i = 0; i < count; i++) {
        const EnemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
        const minion = new EnemyType(bossLevel);
        enemyList.push(minion);
        updateEnemyStats();
        await sleep(750);
    }

    const bossObj = enemyList.splice(0, 1)[0];

    const middleIndex = Math.floor(enemyList.length / 2);
    enemyList.splice(middleIndex, 0, bossObj);
    updateEnemyStats();
}
function checkEndCombat() {
    if (enemyList.length == 0) {
        document.getElementById("infotext").textContent = `VICTORY!`;
        document.getElementById("dmgtext").textContent = ``;
        startButton.style.display = "block";
        basicAtkButton.style.display = "none";
        skillButton.style.display = "none";
        ultimateButton.style.display = "none";
        skillpointscurrentdisplay.style.display = "none";
        spdivider.style.display = "none";
        skillpointmaxdisplay.style.display = "none";
        removeWeaknessDisplay();
        combatOngoing = false;
        enemyPoints = 0;
        startButton.textContent = "NEXT CHALLENGE";
        victoryPoints++;
        return;

    }
    let downedCharacters = 0;
    for (let i = 0; i < characterList.length; i++)
        if (characterList[i].currentHP === 0) {
            downedCharacters += 1;
        }
    if (downedCharacters == characterList.length) {
        document.getElementById("infotext").textContent = `DEFEAT!`;
        document.getElementById("dmgtext").textContent = ``;
        startButton.style.display = "block";
        startButton.textContent = "RETRY?";
        difficultyInput.style.display = "inline-block";
        basicAtkButton.style.display = "none";
        skillButton.style.display = "none";
        ultimateButton.style.display = "none";
        skillpointscurrentdisplay.style.display = "none";
        spdivider.style.display = "none";
        skillpointmaxdisplay.style.display = "none";
        removeWeaknessDisplay();
        combatOngoing = false;
        enemyPoints = 0;
    }

}

function checkEnemyBreaks() {
    enemyList.forEach(enemy => {
        if (enemy.currenttoughness <= 0 && !enemy.isBroken) {
            enemy.isBroken = true;
            applyBreakDebuff(currentTurn, enemy, currentTurn.element)
            enemy.currenttoughness = 0;
            const dmg = dealBreakDamage(currentTurn, enemy);
            enemy.currentHP -= dmg;
            addTotalDamage(dmg);
            document.getElementById("dmgtext").textContent = `${enemy.name} was broken!`;
        }
    });
}

function applyElementalBreakDebuff(attacker, enemy) {
    const debuff = debuffList.find(d => d.element === attacker.element);
    if (!debuff) return;

    if (Math.random() <= (debuff.baseChance - enemy.effectres)) {
        const appliedDebuff = { ...debuff, duration: debuff.duration };
        enemy.debuffs.push(appliedDebuff);
    }
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
    showEffects();
    checkDeath();
    checkEndCombat();
}


function updateCharacterStats() {
    characterList.forEach((character, i) => {
        if (character.currentHP < 0) {
            character.currentHP = 0,
                checkEndCombat();
        }
        if (character.currentHP > character.stats.hp) {
            character.currentHP = character.stats.hp
        }

        character.currentHP = Math.floor(character.currentHP);
        const statsDiv = document.getElementById(`char${i + 1}-stats`);
        if (statsDiv) {
            statsDiv.textContent = `${character.currentHP} / ${character.stats.hp} HP | ${character.resource} / ${character.resourcemax} Energy`;
            if (character.shieldAmount != 0) {
                statsDiv.textContent = `${character.currentHP} (Shield: ${Math.round(character.shieldAmount)}) / ${character.stats.hp} HP | ${character.resource} / ${character.resourcemax} Energy`;
            }
        }
    });
    checkDeath();
}

function addTotalDamage(dmg) {
    total += dmg;
    return total;
}

function showTotalDamage(amount) {
    if (amount > 0) {
        const damageText = document.getElementById("totaldamage");
        damageText.textContent = ("Total Damage", Math.round(amount));

        damageText.style.transition = 'none';
        damageText.style.opacity = 1;

        void damageText.offsetWidth;

        damageText.style.transition = 'opacity 1.2s ease-out';

        setTimeout(() => {
            damageText.style.opacity = 0;
        }, 500);
        setTimeout(() => total = 0, 500)
    }
}

function showNotification(text) {
    const notificationText = document.getElementById("notification");
    notificationText.textContent = (text);

    notificationText.style.transition = 'none';
    notificationText.style.opacity = 1;

    void notificationText.offsetWidth;

    notificationText.style.transition = 'opacity 0.8s ease-out';

    setTimeout(() => {
        notificationText.style.opacity = 0;
    }, 500);
}

function initializeTurnOrder(characterList, enemyList) {
    if (!combatOngoing) return;

    turnOrder = [...characterList, ...enemyList]
        .filter(unit => unit != null)
        .sort((a, b) => b.stats.speed - a.stats.speed);

    turnOrderCheck = 0
}

function endTurn() {

    document.getElementById("basicatkbutton").disabled = true;
    document.getElementById("skillbutton").disabled = true;
    document.getElementById("ultimatebutton").disabled = true;
    checkDeath();
    updateEnemyStats();
    updateCharacterStats();
    checkEndCombat();
    if (combatOngoing) {
        turnOrderCheck++;
        checkTurnOrder();
    }
}
async function checkTurnOrder() {
    if (!combatOngoing) return;

    if (turnOrderCheck >= turnOrder.length) {
        turnOrderCheck = 0;
        turnOrder = [];
        initializeTurnOrder(characterList, enemyList);
    }
    const currentUnit = turnOrder[turnOrderCheck];
    currentTurn = currentUnit;
    if (!currentUnit) return;

    characterList.forEach((char, i) => {
        const charImage = document.getElementById(`char${i + 1}`);
        if (charImage) charImage.classList.remove("active-turn");
    });

    enemyList.forEach((enemy, i) => {
        const charImage = document.getElementById(`enemy${i + 1}`);
        if (charImage) charImage.classList.remove("active-turn");
    });

    if (characterList.includes(currentTurn)) {
        const charIndex = characterList.indexOf(currentUnit);
        if (charIndex !== -1) {
            const currentCharImage = document.getElementById(`char${charIndex + 1}`);
            if (currentCharImage) currentCharImage.classList.add("active-turn");
        }
    } else {

        const enemyIndex = enemyList.indexOf(currentUnit);
        if (enemyIndex !== -1) {
            const currentCharImage = document.getElementById(`enemy${enemyIndex + 1}`);
            if (currentCharImage) currentCharImage.classList.add("active-turn");
        }
    }

    checkEndCombat();
    if (combatOngoing === false) {
        return;
    }

    document.getElementById("infotext").textContent = `It's ${currentUnit.name}'s turn!`;

    if (enemyList.includes(currentUnit)) {
        document.getElementById("basicatkbutton").disabled = true;
        document.getElementById("skillbutton").disabled = true;
        document.getElementById("ultimatebutton").disabled = true;
        await sleep(1000);
        await currentUnit.onTurn();
        await sleep(750);
        endTurn();

    } else if (characterList.includes(currentUnit)) {
        await sleep(1000);
        energyGain(currentTurn, 5);
        resolveBuffsandDebuffs(currentUnit);
        if (currentTurn.currentHP == 0) {
            document.getElementById("infotext").textContent = `${currentUnit.name} is downed!`
            endTurn();
        }
        targetEnemies();
        targetAllies();

        document.getElementById("basicatkbutton").disabled = false;
        document.getElementById("skillbutton").disabled = false;
        if (currentUnit.resource >= currentUnit.resourcemax) {
            document.getElementById("ultimatebutton").disabled = false;
        }
        setTooltipAbilities(currentUnit)
    }

    checkDeath();
    updateEnemyStats();
    updateCharacterStats();
    document.dispatchEvent(new CustomEvent("turnStart"))
}

function setTooltipAbilities(currentUnit) {

    document.getElementById("basicatkbutton").title = `${currentUnit.basic.name}: ${currentUnit.basic.description}`;
    document.getElementById("skillbutton").title = `${currentUnit.skill.name}: ${currentUnit.skill.description}`;
    document.getElementById("ultimatebutton").title = `${currentUnit.ultimate.name}: ${currentUnit.ultimate.description}`;
}

function setTurnIndicator() {
    characterList.forEach((char, i) => {
        const charImage = document.getElementById(`char${i + 1}`);
        if (charImage) charImage.classList.remove("active-turn");
    });

    const charIndex = characterList.indexOf(currentTurn);
    if (charIndex !== -1) {
        const currentCharImage = document.getElementById(`char${charIndex + 1}`);
        if (currentCharImage) currentCharImage.classList.add("active-turn");
    };
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
    sleep(200);
    checkUpdateEnd();
}

function startSkill() {
    defaultTarget();
    document.dispatchEvent(new CustomEvent("skillUsed"));
}

function endSkill() {
    if (sp != 0) {
        sp--;
        document.getElementById("currentsp").innerText = sp;
        sleep(200);
        checkUpdateEnd();
    } else {
        checkDeath()
        updateEnemyStats();
        updateCharacterStats();
    };
}

function startUltimate() {
    if (currentTurn.resource < currentTurn.resourcemax) {
        window.alert("Not enough energy!")
        return;
    }

}

function endUltimate() {
    checkEnemyBreaks();
    checkDeath()
    updateCharacterStats();
    updateEnemyStats();
    showTotalDamage(total);
    ultimateButton.disabled = true;
}

function checkUpdateEnd() {
    checkEnemyBreaks();
    checkDeath()
    updateEnemyStats();
    updateCharacterStats();
    showTotalDamage(total);
    endTurn();
}

function checkDeath() {
    if (currentTurn.currentHP <= 0) {
        if (combatOngoing) {
            turnOrderCheck++;
            checkTurnOrder();
        }
    }
    for (let i = enemyList.length - 1; i >= 0; i--) {
        if (!enemyList[i].isAlive) {
            enemyList.splice(i, 1);
        }
    }

    for (let i = turnOrder.length - 1; i >= 0; i--) {
        if (!turnOrder[i].isAlive) {
            turnOrder.splice(i, 1);
        }
    }

    for (let i = characterList.length - 1; i >= 0; i--) {
        if (characterList[i].currentHP <= 0) {
            characterList[i].buffs.length = 0;
            characterList[i].debuffs.length = 0;
            document.dispatchEvent(new CustomEvent("allyDowned"));
        }
    }

    setImages();
}

async function takeDamage(target, damage) {
    if (target.shieldAmount > 0) {
        if (target.shieldAmount >= damage) {
            target.shieldAmount -= damage;
            damage = 0;
            document.dispatchEvent(new CustomEvent("damageShielded"));
        } else {
            damage -= target.shieldAmount;
            target.shieldAmount = 0;
        }
    }
    target.currentHP -= damage;
    const img = document.getElementById(target.domId);
    if (img) {
        img.classList.add('hitmarker');
        setTimeout(() => img.classList.remove('hitmarker'), 200);
    }

    if (target.currentHP <= 0 && target.onDeath) {
        await target.onDeath();
    }

    document.dispatchEvent(new CustomEvent("damageTaken"));
    if (target.currentHP <= 0 && target.onDeath) {
        target.onDeath();
        await sleep(1500);
    }

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
    let defMultiplier = (attacker.level + 20) / ((target.level + 20) * Math.max(0, 1 + target.stats.defBonus - target.stats.defreduction - attacker.stats.defignore) + attacker.level + 20);
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
    let defMultiplier = (attacker.level + 20) / ((target.level + 20) * Math.max(0, 1 + target.stats.defBonus - target.stats.defreduction - attacker.stats.defignore) + attacker.level + 20);
    let resMultiplier = 1 - (target.stats.resi - attacker.stats.resPen);
    let damage = Math.floor(randomNum * (attackPower * (target.stats.vuln || 1) * defMultiplier * (1 + (attacker.stats.damageBonus || 0)) * (1 - (target.stats.damageMitigation || 0)) * resMultiplier));
    return damage;
}

function dealDamageEnemy(attacker, target, skillMultiplier) {
    let randomNum = Math.random() * (1.06 - 0.97) + 0.97;
    let attackPower = attacker.stats.atk * skillMultiplier;
    let defMultiplier = (attacker.level + 20) / ((target.level + 20) * Math.max(0, 1 + (target.stats?.defBonus) - target.stats?.defreduction - attacker.stats?.defignore) + attacker.level + 20);
    let damage = Math.floor(randomNum * (attackPower * (target.stats?.vuln || 1) * defMultiplier * (1 + (attacker.stats.damageBonus || 0)) * (1 - (target.stats?.damageMitigation || 0))));
    return Number(damage);
}

function dealDoTDamage(attacker, target, DoTMultiplier) {
    let randomNum = Math.random() * (1.06 - 0.97) + 0.97;
    let attackPower = attacker.stats.atk * DoTMultiplier;
    if (target.isBroken == false) {
        attackPower *= 0.9;
    }
    let defMultiplier = (attacker.level + 20) / ((target.level + 20) * Math.max(0, 1 + target.stats.defBonus - target.stats.defreduction - attacker.stats.defignore) + attacker.level + 20);
    let resMultiplier = 1 - (target.stats.resi - attacker.stats.resPen);
    let damage = Math.floor(randomNum * (attackPower * (target.stats.vuln || 1) * defMultiplier * (1 + (attacker.stats.damageBonus || 0)) * (1 - (target.stats.damageMitigation || 0)) * resMultiplier));
    showTotalDamage(damage);
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

function healUnit(unit, amount) {
    if (unit.currentHP == 0) {
        turnOrder.push(unit);
    }

    unit.currentHP = Math.min(unit.currentHP + amount, unit.stats.hp);

}

function shieldUnit(unit, amount) {
    if (unit.currentHP == 0) {
        return;
    }
    unit.shieldAmount = Math.min(unit.shieldAmount + amount, unit.stats.hp);
}

function cleanseDebuffs(unit, amount) {
    for (let i = 0; i < amount; i++) {
        if (unit.debuffs.length > 0) {
            unit.debuffs.shift();
            showEffects();
        }
    }
}
