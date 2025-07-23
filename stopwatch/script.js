let time_total = 0.0;
let time_start = 0.0;
let time_counting = false;

document.addEventListener("DOMContentLoaded", function() {
    // Page finished loading, set the initial stopwatch text and laps
    updateText();
    displayLaps();

    requestAnimationFrame(frame);
});

function frame() {
    // this function runs every frame
    requestAnimationFrame(frame);

    if (time_counting)
        updateText();
}

function toggleStopwatch()
{
    if (!time_counting)
    {
        // Start stopwatch
        time_start = Date.now();
        time_counting = true;

        document.getElementById("stopwatch-toggle").classList.remove("stopwatch-green");
        document.getElementById("stopwatch-toggle").classList.add("stopwatch-red");
        document.getElementById("stopwatch-toggle").textContent = "Stop";
    }
    else
    {
        // Stop stopwatch
        time_total += Date.now() - time_start;
        time_counting = false;
        updateText();

        document.getElementById("stopwatch-toggle").classList.add("stopwatch-green");
        document.getElementById("stopwatch-toggle").classList.remove("stopwatch-red");
        document.getElementById("stopwatch-toggle").textContent = "Start";
    }
}

function addLap() {
    let list = localStorage.getItem("laps");
    if (!list)
        list = [];
    else
        list = JSON.parse(list);

    list.push({"time": getTotalTime(), "text": ""});
    localStorage.setItem("laps", JSON.stringify(list));

    displayLaps();
}

function clearLaps() {
    localStorage.removeItem("laps");
    displayLaps();
}

function displayLaps() {
    // Clear all childs to re-fill it in
    document.getElementById("stopwatch-laps").replaceChildren();

    let list = localStorage.getItem("laps");
    if (!list)
        return;

    list = JSON.parse(list);

    for (let i = 0; i < list.length; i++) {
        const info = list[i];

        const div = document.createElement("div");

        const text = document.createTextNode(getStringTime(info["time"]) + " - ");
        div.appendChild(text);

        const input = document.createElement("input");
        input.setAttribute("type", "text");
        input.setAttribute("value", info["text"]);
        input.oninput = textChanged;
        div.appendChild(input);

        document.getElementById("stopwatch-laps").appendChild(div);
    }
}

function textChanged() {
    // Get the position of the text that was changed
    const index = Array.prototype.indexOf.call(document.getElementById("stopwatch-laps").children, this.parentNode);

    // Update text value in storage
    const list = JSON.parse(localStorage.getItem("laps"));
    list[index]["text"] = this.value;
    localStorage.setItem("laps", JSON.stringify(list));
}

function reset() {
    time_total = 0.0;
    time_start = Date.now();

    updateText();
}

function updateText() {
    document.getElementById("stopwatch").textContent = getStringTime(getTotalTime());
}

function getTotalTime() {
    let total = time_total;
    if (time_counting)
        total +=  Date.now() - time_start;  // include time that has yet to be stopped

    return total;
}

function getStringTime(time) {
    // Calculate the numbers to display
    let hours, minutes, seconds, centiseconds;

    centiseconds = Math.floor(time / 10.0);   // time is stored in milliseconds, convert to centiseconds
    [ seconds, centiseconds ] = divideNumber(centiseconds, 100.0);
    [ minutes, seconds ] = divideNumber(seconds, 60.0);
    [ hours, minutes ] = divideNumber(minutes, 60.0);

    // Setup 'numbers' as an array to display in order, as string since we want to show a padding of 2 zeros
    let strings = [];
    let numbers = [ hours, minutes, seconds, centiseconds ];
    for (let i = 0; i < numbers.length; i++) {
        strings.push(String(numbers[i]).padStart(2, '0'));
    }

    // Join all of the strings together with a ":" seperator
    return strings.join(":");
}

function divideNumber(number, div)
{
    let whole = Math.floor(number / div);
    let remainder = number - (whole * div);
    return [ whole, remainder ];
}