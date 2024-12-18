const work = document.getElementById("work");
const play = document.getElementById("play");
const close = document.getElementById("close");
const anim = document.getElementById("anim");
const circle1 = document.getElementById("circle1");
const circle2 = document.getElementById("circle2");
const start = document.getElementById("start");
const stop = document.getElementById("stop");
const reload = document.getElementById("reload");
const eventTable = document.getElementById("eventTable");

let timer;
let flag_x = false;
let flag_y = false;
let first = true;
const address = "http://localhost:8000"

function drawEventTable() {
    let serverEvents;
    const xhr = new XMLHttpRequest();
    xhr.open("GET", address + "/event", false);
    xhr.send(null);
    if (xhr.status === 200) {
        let x = xhr.response;
        x[0] = "{";
        x[x.length - 1] = "}"
        serverEvents = JSON.parse(x)
    } else {
        console.log(`Error: ${xhr.status}`)
    }

    console.log(typeof(serverEvents))
    eventTable.innerHTML = "<tr><td>LocalStorage</td><td>Server</td></tr>";
    for (let i = 1; i < Number(localStorage.getItem("i")); i++) {
        const s = JSON.parse(localStorage.getItem(i.toString(10)));
        eventTable.innerHTML += `<tr><td>${s.index},${s.time},${s.event}</td><td>${serverEvents[i-1]}</td></tr>`
    }
}

function setEvent(text) {
    if (localStorage.getItem("i") === undefined) {
        localStorage.setItem("i", "0");
    }

    const index = Number(localStorage.getItem("i")) + 1;


    const date = new Date();
    console.log(date)
    const s = {
        index: Number(index),
        time: date.toLocaleString(),
        event: text,
    };

    localStorage.setItem(index.toString(10), JSON.stringify(s));
    localStorage.setItem("i", index.toString(10));
    console.log(s);
    const xhr = new XMLHttpRequest();
    xhr.open("POST", address + "/event");
    xhr.setRequestHeader("Content-Type", "application/json; charset=UTF-8")
    xhr.send(JSON.stringify(s));
}

play.addEventListener("click", function () {
    setEvent("play pressed");
    work.style.display = "block";
    start.style.display = "block";
    stop.style.display = "none";
    reload.style.display = "none";
    if (first) {
        setRandomPositions();
        first = false;
    }
}, false);

close.addEventListener("click", function () {
    setEvent("close pressed");
    work.style.display = "none";
    if (timer !== undefined) {
        clearInterval(timer);
    }
    drawEventTable();
}, false)

start.addEventListener("click", function () {
    setEvent("start pressed");
    stop.style.display = "block";
    start.style.display = "none";
    reload.style.display = "none";
    timer = setInterval(() => {
        if (checkBorderCollisionX(10, 10)) { flag_x = !flag_x; setEvent("collided with wall on axis X") }
        if (checkBorderCollisionY(10, 20)) { flag_y = !flag_y; setEvent("collided with wall on axis Y") }
        move(10, 20, flag_x, flag_y);
        if (checkCollision()) {
            setEvent("rounds collided")
            clearInterval(timer);
            start.style.display = "none";
            stop.style.display = "none";
            reload.style.display = "block";
        }
    }, 100)
})

stop.addEventListener("click", function () {
    setEvent("stop pressed");
    clearInterval(timer);
    stop.style.display = "none";
    start.style.display = "block";
    reload.style.display = "none";
})

reload.addEventListener("click", function () {
    setEvent("reload pressed");
    setRandomPositions();
    start.style.display = "block";
    stop.style.display = "none";
    reload.style.display = "none";
})

function setRandomPositions() {
    const h = anim.offsetHeight;
    const w = anim.offsetWidth;

    const pos_circle1 = Math.floor(Math.random() * h);
    const pos_circle2 = Math.floor(Math.random() * w);

    circle1.style.top = pos_circle1 + "px";
    circle2.style.left = pos_circle2 + "px";
}

function move(step_x, step_y, flag_x, flag_y) {
    step_y = flag_y ? -step_y : step_y;
    step_x = flag_x ? -step_x : step_x;
    circle1.style.left = Number(circle1.style.left.replace("px", "")) + step_x + "px";
    setEvent("round1 moved")
    circle2.style.top = Number(circle2.style.top.replace("px", "")) + step_y + "px";
    setEvent("round2 moved")
}

function checkCollision() {
    const circle1_x = circle1.style.left.replace("px", "");
    const circle2_x = circle2.style.left.replace("px", "");
    const circle1_y = circle1.style.top.replace("px", "");
    const circle2_y = circle2.style.top.replace("px", "");
    const distance = Math.sqrt(Math.pow(circle1_x - circle2_x, 2) + Math.pow(circle1_y - circle2_y, 2));

    return distance < 20;
}

function checkBorderCollisionX(radius, step) {
    const circle1_x = Number(circle1.style.left.replace("px", ""));
    return circle1_x < 0 || circle1_x + 2 + radius > anim.offsetWidth;
}

function checkBorderCollisionY(radius, step) {
    const circle2_y = Number(circle2.style.top.replace("px", ""));
    return  circle2_y < 0 || circle2_y + 2 * radius > anim.offsetHeight;
}