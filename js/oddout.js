/*
Some ideas on what could be added to it:

- Color
- Shape
- Rotation
- Multiple shapes in one
- Number of sizes
- Number, Letters, Shapes

*/

var colors = [
    "#bf0000",  // Red
    "#965106",  // Brown
    "#ff8d00",  // Orange
    "#e0ce00",  // Yellow
    "#32d600",  // Light Green
    "#0d7300",  // Dark Green
    "#4ca88d",  // Cyan
    "#00c4f5",  // Light Blue
    "#0021a6",  // Dark Blue
    "#911cff",  // Purple
    "#f24be7",  // Pink
];

var polygons = [
    "0% 0%, 30% 0%, 30% 35%, 70% 35%, 70% 0%, 100% 0%, 100% 100%, 70% 100%, 70% 65%, 30% 65%, 30% 100%, 0% 100%", // H
    "0% 0%, 30% 0%, 30% 70%, 100% 70%, 100% 100%, 0% 100%", // L
    "0% 0%, 100% 0%, 100% 30%, 65% 30%, 65% 100%, 35% 100%, 35% 30%, 0% 30%", // T
    "30% 0%, 70% 0%, 70% 30%, 100% 30%, 100% 70%, 70% 70%, 70% 100%, 30% 100%, 30% 70%, 0% 70%, 0% 30%, 30% 30%", // +
    "50% 6.7%, 100% 93.3%, 0% 93.3%",  // Triangle
    "10% 10%, 90% 10%, 90% 90%, 10% 90%",   // Square
    "50% 0%, 100% 50%, 50% 100%, 0% 50%",   // Diamond
    "0% 50%, 25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%", // Hexagon
    "30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%", // Octagon
];

const OPTIONS_DATA = {
    "colors": colors,
    "polygons": polygons,
}

const TIME_TRANSITION = 800;
var OPTIONS_COUNT;
var oddout_id = null;
var timer;

/* START */

function start(element) {
    if (element.getAttribute("status") != "start")
        return;

    OPTIONS_COUNT = 4;
    startChallenge();
}

function startChallenge() {
    // Clear any options left over
    var options = document.querySelectorAll("#display > div");
    for (var i = 0; i < options.length; i++)
        options[i].remove();

    document.querySelector("#display").setAttribute("status", "pending");
    document.querySelector("#timer").setAttribute("status", "ongoing");
    displayTimer(10);

    var main = document.querySelector('#display');

    var options = [];
    var oddout_data = {};

    for (var key in OPTIONS_DATA) {
        shuffle(OPTIONS_DATA[key]);
        options.push(key);
    }

    shuffle(options);
    var oddone = options[0];
    var display_data = {};
    var display_indexs = {};

    for (var key in OPTIONS_DATA) {
        display_indexs[key] = 0;

        if (key == oddone) {
            display_data[key] = createOptionsList(OPTIONS_DATA[key], createOddOutList());
            oddout_data[key] = display_data[key][OPTIONS_COUNT - 1];
        } else {
            display_data[key] = createOptionsList(OPTIONS_DATA[key], createNormalList());
        }
    }

    var results = [];
    var elements = [];

    for (var max = OPTIONS_COUNT; max > 0; max--) {
        // Reset indexs
        for (var key in display_indexs)
            display_indexs[key] = -1;

        do {
            // Increase indexs for next attempt

            var id = [];
            var unique = false;
            for (var key in display_indexs) {
                if (!unique) {
                    display_indexs[key]++;
                    if (!unique && display_indexs[key] >= max)
                        display_indexs[key] = 0;    // reset and go to next in dict to increase
                    else
                        unique = true;
                }

                if (display_indexs[key] == -1)  // First attempt
                    display_indexs[key] = 0;

                id.push(display_data[key][display_indexs[key]]);
            }

            id = id.join("-");
            if (unique && results.includes(id))   // prevent exact same from being created, unless we tried every attempts
                continue;

            results.push(id);

            var data = {};
            for (var key in display_data)
                data[key] = popArray(display_data[key], display_indexs[key]);

            var oddout = true;
            for (var key in oddout_data) {
                if (data[key] == oddout_data[key])
                    continue;

                oddout = false;
                break;
            }

            var element = createElement(data);
            elements.push(element);

            if (oddout)
                oddout_id = element.getAttribute("id");

            break;
        }
        while (max);    // Infinite loop until break
    }

    shuffle(elements);

    // Figure out how many rows to create
    var rows_count = Math.floor(Math.sqrt(OPTIONS_COUNT));
    do
    {
        if (OPTIONS_COUNT / rows_count == Math.round(OPTIONS_COUNT / rows_count));
            break;

        rows_count--;
    }
    while (rows_count > 0);

    if (rows_count == 0)
        rows_count = Math.floor(Math.sqrt(OPTIONS_COUNT));

    var max_col = Math.ceil(OPTIONS_COUNT / rows_count);
    var row = null;
    var rows = [];

    for (var i = 0; i < elements.length; i++) {
        // Math is weird here, for a 10-options we want to have 3-4-3 rows
        var next_break = rows.length / rows_count * OPTIONS_COUNT;
        if (next_break - Math.floor(next_break) < 0.5)
            next_break = Math.floor(next_break);
        else
            next_break = Math.ceil(next_break);

        if ((i + 1) > next_break) {
            addSpacer(row, max_col);

            row = document.createElement("div");
            row.classList.add("option-row", "flex-center");
            row.style.aspectRatio = max_col + " / 1";
            rows.push(row);
            main.append(row);
        }

        row.append(elements[i]);
    }

    addSpacer(row, max_col);
};

/* FUNCTIONS FOR CHALLENGE */

function addSpacer(row, max_col) {
    if (!row || row.childElementCount >= max_col)
        return;

    var spacer = document.createElement("div");
    spacer.classList.add("spacer");
    row.append(spacer);

     spacer = document.createElement("div");
    spacer.classList.add("spacer");
    row.prepend(spacer);
}

function createOddOutList() {
    var list = [];
    list.push(1);  // THE odd one out
    var remaining = OPTIONS_COUNT - 1;

    // Fill the rest with more numbers, don't give out any other 1s
    while (remaining > 0) {
        var count = null;
        if (remaining >= 6) {
            count = getRandomInt(2, 4);
        } else if (remaining >= 5 || (remaining >= 4 && getRandomInt(0, 1))) {
            count = 2;
        } else {
            count = remaining;
        }

        list.push(count);
        remaining -= count;
    }

    return list;
}

function createNormalList() {

    var one_count = 0;

    var list = [];
    var remaining = OPTIONS_COUNT;

    while (remaining > 0) {
        var count = null;
        if (OPTIONS_COUNT <= 5)
            count = getRandomInt(1, Math.ceil(OPTIONS_COUNT / 2));  // Don't want all options to have same result
        else if (remaining >= 4)
            count = getRandomInt(1, 4);
        else
            count = getRandomInt(1, remaining);

        // Prevent the odd one out from being force created in the future
        if (remaining - count == 1 && one_count == 0 && count > 1)
            count--;

        // Give a room to let one able to be created again
        if (remaining > 1 && remaining - count == 0 && one_count == 1)
            count--;

        if (count == 1)    // If were to have 1, must have another 1 later to not be the odd one out
            one_count++;

        list.push(count);
        remaining -= count;
    }

    return list;
}

function createOptionsList(options, counts) {
    // Sort numbers from largest to smallest, to early start on preventing exact same shapes
    counts.sort();
    counts.reverse();

    var list = [];

    for (var i = 0; i < counts.length; i++)
        for (var count = 0; count < counts[i]; count++)
            list.push(options[i]);

    return list;
}

var next_id = 0;

function createElement(data) {
    var inner = document.createElement("div");
    inner.style.backgroundColor = data["colors"];
    inner.style.clipPath = "polygon(" + data["polygons"] + ")";

    inner.animate([
        { width: "0%", height: "0%" },
        { width: "100%", height: "100%" },
    ], {
        duration: TIME_TRANSITION,
        iterations: 1,
        easing: "cubic-bezier(0, 0, 0.1, 1)",  // similar to ease-out
    });

    var element = document.createElement("div");
    element.classList.add("option", "selectable", "flex-center");
    element.setAttribute("onclick", "onSelected(this)");
    element.append(inner);

    element.setAttribute("id", next_id);
    next_id++;

    return element;
}

/* CALLBACKS */

function displayTimer(time) {
    document.querySelector("#timer > h1").textContent = time;

    if (time <= 0) {
        onSelected(null);   // act like its selected, just to end the game
    } else {
        timer = setTimeout(displayTimer, 1000, time - 1);

        if (time <= 3) {
            var elements = [document.querySelector("#display"), document.querySelector("#timer")];
            for (var i = 0; i < elements.length; i++) {
                elements[i].style.setProperty("--background-pending-light", "#e6671e");
                elements[i].style.setProperty("--background-pending-dark", "#e6491e");
            }

            setTimeout(clearTimerStyle, 500);
        }
    }
}

function clearTimerStyle() {
    var elements = [document.querySelector("#display"), document.querySelector("#timer")];
    for (var i = 0; i < elements.length; i++) {
        elements[i].style.removeProperty("--background-pending-light");
        elements[i].style.removeProperty("--background-pending-dark");
    }
}

function onSelected(element) {
    if (element && !element.classList.contains("selectable"))
        return;

    clearInterval(timer);

    var elements = document.querySelectorAll(".selectable");
    for (var i = 0; i < elements.length; i++) {
        elements[i].classList.remove("selectable");

        if (elements[i].getAttribute("id") == oddout_id)
            elements[i].classList.add("correct");
        else
            elements[i].classList.add("incorrect");
    }

    if (element && element.getAttribute("id") == oddout_id) {
        document.querySelector("#display").setAttribute("status", "correct");
        document.querySelector("#timer").setAttribute("status", "good");
        setTimeout(endChallenge, 500);
    } else {
        document.querySelector("#display").setAttribute("status", "incorrect");
        document.querySelector("#timer").setAttribute("status", "end");
        setTimeout(allowRestart, 3000);
    }
}

function endChallenge() {
    var inners = document.querySelectorAll(".option > div");
    for (var i = 0; i < inners.length; i++) {
        inners[i].style.width = "0%";
        inners[i].style.height = "0%";
        inners[i].animate([
            { width: "100%", height: "100%" },
            { width: "0%", height: "0%" },
        ], {
            duration: TIME_TRANSITION,
            iterations: 1,
            easing: "cubic-bezier(0.9, 0, 1, 1)",  // similar to ease-out
        });
    }

    OPTIONS_COUNT++;
    setTimeout(startChallenge, TIME_TRANSITION + 100);
}

function allowRestart() {
    document.querySelector("#timer").setAttribute("status", "start");
    document.querySelector("#timer > h1").textContent = "Retry";
}

/* HELPERS */

function shuffle(array) {
    let currentIndex = array.length;

    // While there remain elements to shuffle...
    while (currentIndex != 0) {

        // Pick a remaining element...
        let randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
};

function popArray(array, index) {
    var value = array[index];
    array.splice(index, 1);
    return value;
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
};
