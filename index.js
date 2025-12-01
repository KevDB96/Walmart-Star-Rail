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
let selectableCharacters = [];
const debuffList = [
    { id: "FireBreak", name: "Burn", src: "Icon_Burn.webp", description: `Take Fire damage each turn`, duration: 2, baseChance: 1.5, effect: (attacker, unit) => { unit.currentHP -= 50 * Math.pow(attacker.level, 0.95) }, element: "Fire", applier: "", event: "DoT" },
    { id: "PhysicalBreak", name: "Bleed", src: "Icon_Bleed.webp", description: `Take Physical damage each turn based on max HP`, duration: 2, baseChance: 1.5, effect: (attacker, unit) => { unit.currentHP -= Math.min((unit.stats.hp * 0.1), 50 * Math.pow(attacker.level, 0.95)) }, element: "Physical", applier: "", event: "DoT" },
    { id: "IceBreak", name: "Freeze", src: "Icon_Frozen.webp", description: `Take Ice damage each turn and stunned`, duration: 1, baseChance: 1.5, effectdmg: (attacker, unit) => { unit.isStunned = true; { unit.currentHP -= 50 * Math.pow(attacker.level, 0.95) } }, element: "Ice", applier: "", event: "" },
    { id: "LightningBreak", name: "Shock", src: "Icon_Shock.webp", description: `Take Lightning damage each turn`, duration: 2, baseChance: 1.5, effect: (attacker, unit) => { unit.currentHP -= 100 * Math.pow(attacker.level, 0.95) }, element: "Lightning", applier: "", event: "DoT" },
    { id: "WindBreak", name: "Shear", src: "Icon_Wind_Shear.webp", description: `Take Wind damage each turn`, duration: 2, stacks: 2, maxstacks: 5, baseChance: 1.5, effect: (attacker, unit) => { unit.currentHP -= stacks * 50 * Math.pow(attacker.level, 0.95); }, element: "Wind", applier: "", event: "DoT" },
    { id: "QuantumBreak", name: "Entangle", src: "Icon_Entanglement.webp", description: `Take Quantum damage each turn and slightly reduces speed`, duration: 2, stacks: 1, maxstacks: 5, baseChance: 1.5, effect: (attacker, unit) => { unit.currentHP -= stacks * 0.6 * 50 * Math.pow(attacker.level, 0.95); unit.speed -= (10 * attacker.breakeffect) }, revert: (attacker, unit) => { unit.speed += (20 * attacker.breakeffect) }, element: "Quantum", applier: "", event: "" },
    { id: "ImaginaryBreak", name: "Imprison", src: "Icon_Imprisonment.webp", description: `This unit has reduced speed`, duration: 2, baseChance: 1.5, effect: (attacker, unit) => { unit.speed *= 0.8 }, revert: (attacker, unit) => { unit.speed += (20 * attacker.breakeffect) }, element: "Imaginary", applier: "", event: "" },
    { id: "Wilt", name: "Wilt", src: "lick-enkindled-betrayal-skill_icon.webp", description: `Take Fire damage each turn and reduces defense by 20%`, duration: 3, baseChance: 2, effect: (attacker, unit) => { unit.stats.defreduction -= 0.2 }, effectdmg: (attacker, unit) => { unit.currentHP -= dealDoTDamage(attacker, unit, 1) }, revert: (attacker, unit) => { unit.stats.defreduction += 0.2 }, applier: "", event: "DoT" },
    { id: "Ruin", name: "Ruin", src: "wallowentombed-ash-skill_icon.webp", description: `Take Fire damage each turn and reduces defense by 20%`, duration: 3, baseChance: 2.5, effect: (attacker, unit) => { unit.stats.defreduction -= 0.2 }, effectdmg: (attacker, unit) => { unit.currentHP -= dealDoTDamage(attacker, unit, 1) }, revert: (attacker, unit) => { unit.stats.defreduction += 0.2 }, applier: "", event: "DoT" },
    { id: "Nihility's Command", name: "Nihility's Command", src: "internet-keyword-targeting-seo-target-icon--22.png", description: `Targeted for a massive attack and taking 10% increased damage`, duration: 10, baseChance: 1, effect: (attacker, unit) => { unit.stats.defreduction -= 0.1 }, revert: (attacker, unit) => { unit.stats.defreduction += 0.1 }, applier: "", event: "" },
    { id: "Cut!", name: "Cut!", src: "145065.png", description: `Mr Reca has slowed this unit by 10%`, duration: 1, revert: (attacker, unit) => { unit.stats.speed /= 0.9 }, applier: "", event: "" },
    { id: "Ready, Set, Action!", name: "Ready, Set, Action!", src: "mrrecawhite-removebg-preview.png", description: `Mr Reca has slowed this unit down by 25%`, duration: 2, revert: (attacker, unit, applier) => { unit.stats.speed *= 1.25 }, applier: "", event: "" },
]
    ;
const buffList = [
    { id: "Rushing Waters", name: "Rushing Waters", src: "Ability_Singing_Among_Clouds.webp", description: `Baiheng has increased her speed by 25%`, duration: 1, revert: (attacker, unit) => { unit.stats.speed /= 1.25 }, applier: "", event: "" },
    { id: "Mending Waters", name: "Mending Waters", src: "Ability_Gourdful_of_Elixir.webp", sfx: "084373_heal-36672.mp3", description: `This unit will be healed at the start of their next turn`, duration: 3, effect: (attacker, unit, applier) => { unit.currentHP += Math.floor((0.08 * applier.stats.hp) + 50) }, applier: "", event: "healAlly" },
    { id: "Run It Back!", name: "Run It Back!", src: "pngtree-fast-forward-icon-image_1128381-removebg-preview.png", description: `Increases damage bonus by 75%`, duration: 2, effect: (attacker, unit, applier) => { unit.stats.damageBonus += 0.8 }, revert: (attacker, unit, applier) => { unit.stats.damageBonus -= 0.8 }, applier: "", event: "" },
    { id: "Ready, Set, Action!", name: "Ready, Set, Action!", src: "mrrecawhite-removebg-preview.png", description: `Mr Reca has sped this unit up by 33%`, duration: 2, revert: (attacker, unit, applier) => { unit.stats.speed /= 1.33 }, applier: "", event: "" },
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

}
onStartUp();


class Unit {
    constructor({ name, img, level, affiliation, resource, resourcemax, basehp, baseatk, basedef, speed, hpgrowth, atkgrowth, defgrowth }) {
        this.name = name;
        this.img = img;
        this.level = level;
        this.affiliation = affiliation;
        this.stats = {
            hp: basehp + level * hpgrowth,
            atk: baseatk + level * atkgrowth,
            def: basedef + level * defgrowth,
            speed: speed,
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
        this.buffs = [];
        this.debuffs = [];
        this.resource = resource;
        this.resourcemax = resourcemax;
        this.currentHP = this.stats.hp;
        this.isBroken = false;
        this.turnCount = 0;
        this.isStunned = false;

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
    constructor({ name, img, level, affiliation, weaknesses = {}, hp, atk, def, speed, toughness, hpgrowth, atkgrowth, defgrowth }) {
        super({
            name,
            img,
            level,
            affiliation,
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
            modifier: 0.75,
            sfx: new Audio("Minecraft Fall Damage (Crack) - Sound Effect (HD).mp3"),
            execute: (targets) => {
                const target = targets[0];
                this.basic.sfx.play();
                const dmg = dealDamageHP(this, target, this.basic.modifier);
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
                name: "Home Run Hit",
                description: "Deal Physical damage to one designated enemy and adjacent targets.",
                modifier1: 1.3,
                modifier2: 0.9,
                sfx: new Audio("Minecraft Fall Damage (Crack) - Sound Effect (HD).mp3"),
                execute: (targets) => {
                    if (sp != 0) {
                        this.skill.sfx.play();
                        const main = targets[0];
                        const index = enemyList.indexOf(main);

                        const dmgMain = dealDamageHP(this, main, this.skill.modifier1);
                        main.currentHP -= dmgMain;
                        if (main.weaknesses.some(w => w.weakness === this.element)) {
                            toughnessDamage(main, (20 * this.breakeffect))
                        }

                        const left = enemyList[index - 1];
                        const right = enemyList[index + 1];
                        const leftdmg = left ? dealDamageHP(this, left, this.skill.modifier2) : 0;
                        const rightdmg = right ? dealDamageHP(this, right, this.skill.modifier2) : 0;
                        if (left) left.currentHP -= leftdmg;
                        if (left) { if (left.weaknesses.some(w => w.weakness === this.element)) toughnessDamage(left, (10 * this.breakeffect)) }
                        if (right) right.currentHP -= rightdmg;
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
            description: "Deal Physical damage all enemy targets.",
            modifier: 2,
            sfx: new Audio("VO_JA_Stelle_Ultimate_-_Activate_Destruction_01.mp3"),
            execute: () => {
                if (this.resource >= this.resourcemax) {
                    flashUltimate(this);
                    enemyList.forEach(enemy => {
                        const dmg = dealDamageHP(this, enemy, this.ultimate.modifier);
                        if (enemy.weaknesses.some(w => w.weakness === this.element)) {
                            toughnessDamage(enemy, (20 * this.breakeffect))
                        }
                        enemy.currentHP -= dmg;
                        this.resource = 5;
                        addTotalDamage(dmg);
                        document.getElementById("dmgtext").innerText = `${this.name} dealt ${dmg} damage to all enemies!`
                        document.getElementById("ultimatebutton").disabled = true;
                        checkDeath();
                        updateCharacterStats();
                        updateEnemyStats();
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
                    energyGain(this, 5);
                    updateCharacterStats();
                })
        }
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
            resourcemax: 200,
            basehp: 140,
            baseatk: 92,
            basedef: 82,
            speed: 96,
            hpgrowth: 12,
            atkgrowth: 7.5,
            defgrowth: 6.5,
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
                modifier: 0.75,
                sfx: new Audio("mixkit-fire-swoosh-burning-1328.wav"),
                execute: () => {
                    if (sp != 0) {
                        this.skill.sfx.play();
                        enemyList.forEach(enemy => {
                            const dmg = dealDamage(this, enemy, this.skill.modifier)
                            enemy.currentHP -= dmg;
                            if (enemy.weaknesses.some(w => w.weakness === this.element)) {
                                enemy.currenttoughness -= (20 * this.breakeffect);
                            }
                            if (enemy.debuffs.some(d => d.id === "Wilt")) {
                                procDoTs(enemy);
                            }
                            addTotalDamage(dmg * enemyList.length);
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
            modifier: 1.2,
            sfx: new Audio("VO_JA_Evernight_Ultimate_-_Activate_01.ogg"),
            execute: () => {
                if (this.resource >= this.resourcemax) {
                    flashUltimate(this);
                    enemyList.forEach(enemy => {
                        const dmg = dealDamage(this, enemy, this.ultimate.modifier);
                        enemy.currentHP -= dmg;
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
            baseSpeed: 101,
            speed: 101,
            hpgrowth: 15,
            atkgrowth: 5,
            defgrowth: 7,
        });

        this.basic = {
            name: "Wave, Crash Against Stone",
            description: "Deal Ice damage to one designated enemy and grants Baiheng a speed boost for 1 turn.",
            modifier: 0.45,
            sfx: new Audio("mixkit-water-splash-1311.wav"),
            execute: (targets) => {
                const target = targets[0];
                this.basic.sfx.play();
                const dmg = dealDamage(this, target, this.basic.modifier);
                target.currentHP -= dmg;
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
                            healUnit(character, healAmount);
                            applyBuff(character, "Mending Waters", this)
                            document.getElementById("dmgtext").innerText = `${this.name} healed all allies for ${Math.floor(healAmount)}!`;
                        })
                        addTotalDamage(Math.floor((this.skill.modifier * this.stats.hp) * characterList.length))
                        energyGain(this, 30);

                    }
                    showEffects();
                    updateCharacterStats();
                    endSkill();
                    document.dispatchEvent(new CustomEvent("healAlly"));
                }
            }

        this.ultimate = {
            name: "Water, The Great Equalizer",
            description: "Averages out all allies' HP percentage, then heal for a large amount and apply Mending Waters. ",
            modifier: 0.7,
            sfx: new Audio("mixkit-jump-into-the-water-1180.wav"),
            execute: () => {
                if (this.resource >= this.resourcemax) {
                    flashUltimate(this);
                    let averageHP;
                    const healAmount = ((this.skill.modifier * this.stats.hp)) + 205;
                    characterList.forEach(character => {
                        averageHP = character.currentHP / character.stats.hp
                    });
                    averageHP /= characterList.length;
                    characterList.forEach(character => {
                        character.currentHP = character.stats.hp * averageHP;
                        healUnit(character, healAmount);
                        applyBuff(character, "Mending Waters", this)
                    });
                    this.resource = 5;
                    document.dispatchEvent(new CustomEvent("healAlly"));

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
            resourcemax: 130,
            basehp: 170,
            baseatk: 87,
            basedef: 72,
            speed: 98,
            hpgrowth: 11,
            atkgrowth: 7,
            defgrowth: 8,
            damageStack: 0,
        });

        this.basic = {
            name: "Cut!",
            description: "Deal Quantum damage to one enemy and reduce their speed by 10%.",
            modifier: 0.25,
            sfx: new Audio("Clapper-sound-effect.mp3"),
            execute: (targets) => {
                const target = targets[0];
                this.basic.sfx.play();
                const dmg = dealDamage(this, target, (this.basic.modifier));
                target.currentHP -= dmg;
                target.currentHP -= this.damageStack;
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
                description: "Allows the currently targetted ally to immediately take action and grants a massive damage boost!",
                modifier: 0,
                sfx: new Audio("Fast Forward Sound Effect.mp3"),
                execute: async () => {
                    if (!allyTargetList[0]) {
                        showNotification("Target an ally first!");
                        return;
                    }
                    if (sp != 0) {
                        this.skill.sfx.play();
                        energyGain(this, 30);
                        ultimateButton.disabled = false;
                        document.getElementById("infotext").innerText = `${this.name} advanced ${allyTargetList[0].name}'s action!`
                        await sleep(750);
                        currentTurn = allyTargetList[0];
                        currentTurn.resource += 5;
                        document.getElementById("infotext").innerText = `It's ${currentTurn.name}'s turn!`
                        sp--;
                        document.getElementById("currentsp").innerText = sp;
                        applyBuff(currentTurn, "Run It Back!", this)
                        setTurnIndicator();

                        let targetIndex = turnOrder.findIndex(t => t === currentTurn);
                        if (targetIndex !== -1) turnOrder.splice(targetIndex, 1);


                        let casterIndex = turnOrder.findIndex(t => t === this);
                        if (casterIndex !== -1) turnOrder.splice(casterIndex, 1);

                        turnOrder.splice(turnOrderCheck, 0, currentTurn);
                    }
                    showEffects();
                    updateCharacterStats();
                    setTooltipAbilities(allyTargetList[0]);
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

class VoidRangerReaver extends Enemy {
    constructor(level) {
        super({
            name: "Voidranger: Reaver",
            img: "Voidranger_Reaver-removebg-preview.png",
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
            hpgrowth: 200,
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
            actualTarget.currentHP -= dmg
            energyGain(actualTarget, 10);
            document.getElementById("dmgtext").innerText = `${this.name} dealt ${dmg} damage to multiple enemies!`
            if (targetLeft) {
                targetLeft.currentHP -= dmg;
                energyGain(targetLeft, 10)
            }
            if (targetRight) {
                targetRight.currentHP -= dmg;
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
            weaknesses: {
                weakness1: "Fire",
                weakness2: "Imaginary",
                weakness3: "Wind",
            },
            hp: 100,
            atk: 15,
            def: 210,
            speed: 120,
            toughness: 20,
            hpgrowth: 150,
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
            let dmg = dealDamageEnemy(this, actualTarget, 5);
            actualTarget.currentHP -= dmg
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

let enemyDatabase = [VoidRangerReaver, VoidRangerDistorter];

function generateEnemies(num, level) {
    const selectedEnemies = [];
    for (let i = 0; i < num; i++) {
        const EnemyType = enemyDatabase[Math.floor(Math.random() * enemyDatabase.length)];
        selectedEnemies.push(new EnemyType(level));
    }
    enemyList.push(...selectedEnemies)

}

function energyGain(target, amount) {
    target.resource = Math.min(target.resource + (amount * (target.energyRegen || 1)), target.resourcemax)
}

function toughnessDamage(target, amount) {
    target.currenttoughness = Math.max((target.currenttoughness - amount), 0)
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
        if (debuff.effectdmg) debuff.effectdmg(debuff.applier, unit);
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
    combatOngoing = true;
    const enemyImgs = document.querySelectorAll(".enemy-portrait");
    enemyImgs.forEach(img => { img.classList.remove('enemy-targeted'); })
    difficultyLevel = Number(difficultyInput.value);
    document.getElementById("difficultyIndicatorText").textContent = "Difficulty Level: ";
    document.getElementById("difficultyIndicatorNumber").style.display = "inline-block";
    document.getElementById("difficultyIndicatorNumber").textContent = difficultyLevel;
    if (difficultyLevel <= 0 || difficultyLevel > 1000) {
        showNotification("Can't be lower than 1 or higher than 1000");
        return;
    }
    characterList.length = 0;
    if (characterList.length == 0) {
        createParty(difficultyLevel);
    }
    enemyList.length = 0;
    generateEnemies(5, difficultyLevel);
    setBackground();
    if (!isPlaying(bgm)) {
        let randomIndex = Math.floor(Math.random() * bgmList.length);
        bgm.src = bgmList[randomIndex].src;
        bgm.play();
        volumePercent.textContent = Math.round(bgm.volume * 100) + "%";
    }
    setImages();
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
    await sleep(1000);
    window.alert("Welcome to Walmart Star Rail! Select your party, match character elements to enemy weaknesses to break their Toughness bar, spend Skill Points with Skills and build them with Basic Attacks to accrue energy to unleash devastating Ultimate attacks! For more information, you can always hover over things you don't fully understand!")


};

function createParty(level) {
    char1 = new DestructionMC(level);
    char2 = new Constance(level);
    char3 = new Baiheng(level);
    char4 = new MrReca(level);
    characterList.push(char1);
    characterList.push(char2);
    characterList.push(char3);
    characterList.push(char4);
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
        difficultyInput.style.display = "block";
        basicAtkButton.disabled = true;
        skillButton.disabled = true;
        ultimateButton.disabled = true;
        combatOngoing = false;
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
        await sleep(1000);
        await currentUnit.onTurn();
        await sleep(750);
        endTurn();
        document.getElementById("basicatkbutton").disabled = true;
        document.getElementById("skillbutton").disabled = true;
        document.getElementById("ultimatebutton").disabled = true;
    } else if (characterList.includes(currentUnit)) {
        await sleep(1000);
        energyGain(currentTurn, 5);
        resolveBuffsandDebuffs(currentUnit);
        if (currentTurn.currentHP == 0) {
            document.getElementById("infotext").textContent = `${currentUnit.name} is downed!`
            sleep(500);
            endTurn();
        }
        targetEnemies();
        targetAllies();
        await sleep(1000);

        document.getElementById("basicatkbutton").disabled = false;
        document.getElementById("skillbutton").disabled = false;
        if (currentUnit.resource >= currentUnit.resourcemax) {
            document.getElementById("ultimatebutton").disabled = false;
        }
        setTooltipAbilities(currentUnit)
    }

    await sleep(100);

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
    if (sp == 0) {
        showNotification(notEnoughSP)
    }
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
        }
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
    return damage;
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

    unit.currentHP += amount;

    characterList.forEach((char, i) => {
        const currentCharImage = document.getElementById(`char${i + 1}`);
        if (currentCharImage) currentCharImage.classList.remove("downed");
    });
}

