const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const startScreen = document.getElementById("startScreen");
const music = document.getElementById("music");

let WIDTH = window.innerWidth;
let HEIGHT = window.innerHeight;

canvas.width = WIDTH;
canvas.height = HEIGHT;




const WORDS = [
    "love you",
    "Love You",
    "LOVE YOU"
];

const COLORS = [
    "rgb(70, 130, 180)",
    "rgb(30, 144, 255)",
    "rgb(0, 191, 255)",
    "rgb(100, 149, 237)",
    "rgb(65, 105, 225)"
];

const CENTER_TEXT = " Love You ";

const FPS = 60;

let SCALE = 20;



function updateScale() {

    const baseWidth = 2000;
    const baseHeight = 1200;

    const scaleX = WIDTH / baseWidth;
    const scaleY = HEIGHT / baseHeight;

    SCALE = Math.min(scaleX, scaleY) * 20;
}




function heartXY(t) {

    const x =
        16 * Math.pow(Math.sin(t), 3);

    const y =
        13 * Math.cos(t)
        - 5 * Math.cos(2 * t)
        - 2 * Math.cos(3 * t)
        - Math.cos(4 * t);

    return {
        x: x,
        y: -y
    };
}




function toScreen(x, y) {

    return {
        x: x * SCALE + WIDTH / 2,
        y: y * SCALE + HEIGHT / 2
    };
}




function randomChoice(array) {
    return array[
        Math.floor(Math.random() * array.length)
    ];
}


function random(min, max) {
    return Math.random() * (max - min) + min;
}




class Particle {

    constructor(x, y, order, kind) {

        this.x = x;
        this.y = y;

        this.order = order;
        this.kind = kind;

        this.word = randomChoice(WORDS);
        this.color = randomChoice(COLORS);

        this.alpha = 0;

        this.flicker =
            random(0, Math.PI * 2);

        this.delay = 0;

        this.sizeMult =
            random(0.85, 1.15);

        this.fontSize =
            kind === "outline" ? 20 : 17;
    }
}



function buildOutlineParticles(nOutline) {

    const particles = [];
    const placed = [];

    const minGap = 30;

    for (let i = 0; i < nOutline; i++) {

        const t =
            (i / nOutline) * Math.PI * 2;

        const heart = heartXY(t);

        const position =
            toScreen(heart.x, heart.y);

        let tooClose = false;

        for (const point of placed) {

            const dx =
                position.x - point.x;

            const dy =
                position.y - point.y;

            const distance =
                Math.sqrt(dx * dx + dy * dy);

            if (distance < minGap) {

                tooClose = true;
                break;
            }
        }

        if (tooClose) {
            continue;
        }

        placed.push(position);

        particles.push(
            new Particle(
                position.x,
                position.y,
                i,
                "outline"
            )
        );
    }

    return particles;
}



function buildFillParticles(nFill) {

    const particles = [];
    const placed = [];

    const minGap = 46;

    let attempts = 0;

    const maxAttempts =
        nFill * 80;

    while (
        particles.length < nFill &&
        attempts < maxAttempts
    ) {

        attempts++;

        const t =
            random(0, Math.PI * 2);

        const r =
            random(0.0, 0.86);

        const heart =
            heartXY(t);

        const x =
            heart.x * r;

        const y =
            heart.y * r;

        const position =
            toScreen(x, y);

        let tooClose = false;

        for (const point of placed) {

            const dx =
                position.x - point.x;

            const dy =
                position.y - point.y;

            const distance =
                Math.sqrt(dx * dx + dy * dy);

            if (distance < minGap) {

                tooClose = true;
                break;
            }
        }

        if (tooClose) {
            continue;
        }

        placed.push(position);

        particles.push(
            new Particle(
                position.x,
                position.y,
                Math.floor(random(0, 321)),
                "fill"
            )
        );
    }

    return particles;
}




function drawGlowText(
    particle,
    alpha,
    time
) {

    if (alpha <= 0) {
        return;
    }

    const size =
        particle.fontSize *
        particle.sizeMult *
        (WIDTH / 2000);

    ctx.save();

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.font =
        `bold ${Math.max(8, size)}px Arial`;

    

    ctx.globalAlpha =
        (alpha / 255) * 0.12;

    ctx.shadowBlur = 25;
    ctx.shadowColor = particle.color;

    ctx.fillStyle = particle.color;

    ctx.fillText(
        particle.word,
        particle.x,
        particle.y
    );


    ctx.globalAlpha =
        (alpha / 255) * 0.30;

    ctx.shadowBlur = 12;

    ctx.fillText(
        particle.word,
        particle.x,
        particle.y
    );


    ctx.globalAlpha =
        alpha / 255;

    ctx.shadowBlur = 5;

    ctx.fillStyle = particle.color;

    ctx.fillText(
        particle.word,
        particle.x,
        particle.y
    );

    ctx.restore();
}



function drawCenterText(frame, startFrame) {

    if (frame <= startFrame) {
        return;
    }

    const progress =
        Math.min(
            1,
            (frame - startFrame) / 60
        );

    const centerAlpha =
        255 *
        (1 - Math.exp(-progress * 8));

    const pulse =
        1 +
        0.025 *
        Math.sin(frame * 0.05);

    const fontSize =
        Math.max(
            25,
            54 *
            (WIDTH / 2000) *
            pulse
        );

    ctx.save();

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.font =
        `bold ${fontSize}px Georgia`;

    

    ctx.globalAlpha =
        (centerAlpha / 255) * 0.2;

    ctx.shadowBlur = 35;
    ctx.shadowColor = "white";

    ctx.fillStyle =
        "rgb(255, 250, 245)";

    ctx.fillText(
        CENTER_TEXT,
        WIDTH / 2,
        HEIGHT / 2
    );

    

    ctx.globalAlpha =
        centerAlpha / 255;

    ctx.shadowBlur = 10;

    ctx.fillText(
        CENTER_TEXT,
        WIDTH / 2,
        HEIGHT / 2
    );

    ctx.restore();
}




let outline = [];
let fill = [];
let particles = [];

let fillStartFrame = 0;
let centerStartFrame = 0;

function createParticles() {

    outline =
        buildOutlineParticles(160);

    fill =
        buildFillParticles(130);

    const outlineSpan =
        outline.length > 0
            ? Math.max(
                ...outline.map(p => p.order)
              )
            : 0;

    const framesPerStep = 1.6;

    fillStartFrame =
        Math.floor(
            outlineSpan *
            framesPerStep
        ) + 30;

    for (const particle of fill) {

        particle.delay =
            fillStartFrame +
            particle.order;
    }

    for (const particle of outline) {

        particle.delay =
            Math.floor(
                particle.order *
                framesPerStep
            );
    }

    particles =
        outline.concat(fill);

    centerStartFrame =
        fillStartFrame + 200;
}




let frame = 0;
let animationRunning = false;
let animationId = null;

function animate() {

    if (!animationRunning) {
        return;
    }

    frame++;



    ctx.clearRect(
        0,
        0,
        WIDTH,
        HEIGHT
    );

    ctx.fillStyle = "black";

    ctx.fillRect(
        0,
        0,
        WIDTH,
        HEIGHT
    );

    

    for (const particle of particles) {

        // Fade in
        if (
            frame > particle.delay &&
            particle.alpha < 255
        ) {

            particle.alpha =
                Math.min(
                    255,
                    particle.alpha +
                    14 +
                    Math.floor(random(0, 5))
                );
        }

        let flicker = 1;

        if (particle.alpha >= 255) {

            flicker =
                0.75 +
                0.25 *
                Math.sin(
                    frame * 0.04 +
                    particle.flicker
                );
        }

        const alpha =
            particle.alpha *
            flicker;

        if (alpha <= 0) {
            continue;
        }

        drawGlowText(
            particle,
            alpha,
            frame
        );
    }

    
    drawCenterText(
        frame,
        centerStartFrame
    );

    animationId =
        requestAnimationFrame(animate);
}




function startAnimation() {

    if (animationRunning) {
        return;
    }

    animationRunning = true;

    frame = 0;

    createParticles();

    // Start music
    music.currentTime = 0;

    music.play().catch(() => {
        console.log(
            "Music needs user interaction."
        );
    });

    startScreen.classList.add("hidden");

    animate();
}




function replay() {

    if (animationId) {
        cancelAnimationFrame(animationId);
    }

    animationRunning = false;

    frame = 0;

    createParticles();

    animationRunning = true;

    music.currentTime = 0;

    music.play().catch(() => {});

    animate();
}




startScreen.addEventListener(
    "click",
    startAnimation
);

canvas.addEventListener(
    "click",
    () => {

        if (!animationRunning) {
            startAnimation();
        } else {
            replay();
        }
    }
);




window.addEventListener(
    "resize",
    () => {

        WIDTH =
            window.innerWidth;

        HEIGHT =
            window.innerHeight;

        canvas.width = WIDTH;
        canvas.height = HEIGHT;

        updateScale();

        if (animationRunning) {

            createParticles();
        }
    }
);




document.addEventListener(
    "keydown",
    (event) => {

        if (event.key === "Escape") {

            animationRunning = false;

            if (animationId) {

                cancelAnimationFrame(
                    animationId
                );
            }
        }
    }
);




updateScale();
createParticles();
