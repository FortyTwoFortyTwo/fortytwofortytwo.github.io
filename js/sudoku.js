const size = 3;   // Can support up to 6
const size_row = size * size; // Size for one of the whole row/col
const size_square = 100;  // Size of the white squares
const size_border = 10;   // Size of the border surrounding it
const size_each = size_square + size_border;  // Size of white square and one side of border together
const symbols_start = 40;   // number of symbols to display at the start;

let symbols_grid;   // a grid to store symbols
let symbols_shown;  // Same structure as symbols_grid, just a boolean on whenever if a symbol has been shown
let symbols_list = []; // List of symbols to display
let cxt;    // the canvas context to draw
let selectedSquare = null;    // coords on the selected square

let timer = null;
let timer_count = 0;
let incorrect_count = 0;

document.addEventListener("DOMContentLoaded", function() {
    timer = setInterval(function() {
        timer_count++;

        let minutes = Math.floor(timer_count / 60);
        let seconds = timer_count % 60;

        document.getElementById("sudoku-timer").textContent = minutes + ":" + String(seconds).padStart(2, "0");
    }, 1000);
});

function endTimer() {
    clearInterval(timer);

    document.getElementById("sudoku-timer").style.color = "dodgerblue";
    document.getElementById("sudoku-completed").style.opacity = 1;
    document.getElementById("sudoku-count").textContent = incorrect_count;
    document.getElementById("sudoku-count").style.color = incorrect_count ? "orangered" : "limegreen";
}

function draw() {
    // grid letiable would be structured as this:
    // symbols_grid[sx][sy][gx][gy]
    // sx and sy as a section, gx and gy as a position inside of one of the section
    symbols_grid = new Array(size);   // creating [sx]
    for (let sx = 0; sx < size; sx++) {
        symbols_grid[sx] = new Array(size); // creating [sy]
        for (let sy = 0; sy < size; sy++) {
            symbols_grid[sx][sy] = new Array(size);   // creating [gx]
            for (let gx = 0; gx < size; gx++) {
                symbols_grid[sx][sy][gx] = new Array(size); // creating [gy]
            }
        }
    }

    symbols_shown = structuredClone(symbols_grid);
    symbols_list = [];

    // Add in numbers
    if (size == 6)    // 6 is 36, need all 1-9, A-Z and 0 to be able to have enough of it
        symbols_list.push("0");

    if (size != 5) {  // if size is 5, just go with alphabet for A-Y
        const numbers_max = size_row < 9 ? size_row : 9;
        for (let i = 0; i < numbers_max; i++)
            symbols_list.push((i + 1).toString());
    }

    // Add in alphabets
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const alphabet_max = size_row - symbols_list.length;
    for (let i = 0; i < alphabet_max; i++)
        symbols_list.push(alphabet[i]);

    if (!rollSymbols()) {
        // if a problem happens where one square can't accept any number, start all over again
        draw();
        return;
    }

    const canvas = document.getElementById("sudoku");
    ctx = canvas.getContext("2d");

    let size_whole = size_row * size_each + size_border;

    // Set the size of the canvas that needs to be drawn
    canvas.setAttribute("width", size_whole);
    canvas.setAttribute("height", size_whole);

    // Black background, for the black border
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, size_whole, size_whole);

    let possible_spots = [];

    for (let sx = 0; sx < size; sx++) {
        for (let sy = 0; sy < size; sy++) {
            let x = sx * size;
            let y = sy * size;
            let size_section = size * size_each - size_border;   // size of the section, not counting the black border

            // Grey square, for the grey border
            ctx.fillStyle = "grey";
            ctx.fillRect(x * size_each + size_border, y * size_each + size_border, size_section, size_section);

            for (let gx = 0; gx < size; gx++) {
                for (let gy = 0; gy < size; gy++) {
                    // Draw a white square
                    drawSquare(sx, sy, gx, gy, "white");
                    possible_spots.push({
                        sx: sx,
                        sy: sy,
                        gx: gx,
                        gy: gy,
                    });
                }
            }
        }
    }

    // Select some random spots to start reveal, with the number in loop as the amount to start
    for (let i = 0; i < symbols_start; i++) {
        let spot = getRandomItemInArray(possible_spots);
        removeItemInArray(possible_spots, spot);
        drawText(spot.sx, spot.sy, spot.gx, spot.gy);
    }

    canvas.addEventListener('click', function(e) {
        // Clear the selected square back to white
        if (selectedSquare) {
            drawSquare(selectedSquare.sx, selectedSquare.sy, selectedSquare.gx, selectedSquare.gy, "white");
            selectedSquare = null;
        }

        // Take into account that canvas could be scaled up or down from screen size
        let bbox = canvas.getBoundingClientRect();
        let x = e.offsetX / bbox.width * canvas.getAttribute("width");
        let y = e.offsetY / bbox.height * canvas.getAttribute("height");

        x = Math.floor(x / size_each);
        y = Math.floor(y / size_each);

        let sx = Math.floor(x / size);
        let sy = Math.floor(y / size);
        let gx = x - (sx * size);
        let gy = y - (sy * size);

        // check if its out of bounds, if its the case then just ignore
        if (sx < 0 || sx >= size || sy < 0 || sy >= size)
            return;

        // Symbol already shown, prevent selecting it
        if (symbols_shown[sx][sy][gx][gy])
            return;

        // Set selectedSquare letiable so it can be set back to white later when done
        selectedSquare = {
            sx: sx,
            sy: sy,
            gx: gx,
            gy: gy,
        }

        drawSquare(selectedSquare.sx, selectedSquare.sy, selectedSquare.gx, selectedSquare.gy, "gold");
    }, false);

    document.addEventListener("keypress", onKeyPressed);
}

function drawSquare(sx, sy, gx, gy, color) {
    let x = sx * size + gx;
    let y = sy * size + gy;

    // draw a square at specific cords
    ctx.fillStyle = color;
    ctx.fillRect(x * size_each + size_border, y * size_each + size_border, size_square, size_square);
}

function drawText(sx, sy, gx, gy, color = "black") {
    let symbol = symbols_grid[sx][sy][gx][gy];
    let x = (sx * size) + gx;
    let y = (sy * size) + gy;

    symbols_shown[sx][sy][gx][gy] = true;

    // Text
    ctx.fillStyle = color;
    ctx.font = size_square + "px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(symbol, (x + 0.5) * size_each + (size_border * 0.5), (y + 0.5) * size_each + size_border);
}

function onKeyPressed(event) {
    if (selectedSquare == null)
        return; // we dont have a selected square to try this, ignore

    let key = event.key;

    if (symbols_list.indexOf(key) == -1)    // If the key pressed isnt in any of the possible symbols, ignore
        return;

    let color = "limegreen";
    if (symbols_grid[selectedSquare.sx][selectedSquare.sy][selectedSquare.gx][selectedSquare.gy] != key) {
        color = "orangered";
        incorrect_count++;
    }

    // Clear the square back to white before drawing the text
    drawSquare(selectedSquare.sx, selectedSquare.sy, selectedSquare.gx, selectedSquare.gy, "white");
    drawText(selectedSquare.sx, selectedSquare.sy, selectedSquare.gx, selectedSquare.gy, color);
    selectedSquare = null;

    // Has all of the squares been selected?
    for (let sx = 0; sx < size; sx++) {
        for (let sy = 0; sy < size; sy++) {
            for (let gx = 0; gx < size; gx++) {
                for (let gy = 0; gy < size; gy++) {
                    if (!symbols_shown[sx][sy][gx][gy])
                        return;
                }
            }
        }
    }

    // All has been shown, end the timer
    endTimer();
}

function rollSymbols() {
    // This function is to roll what symbols it should be for each squares

    for (let sx = 0; sx < size; sx++) {
        for (let sy = 0; sy < size; sy++) {
            for (let gx = 0; gx < size; gx++) {
                for (let gy = 0; gy < size; gy++) {
                    if (symbols_grid[sx][sy][gx][gy])
                        continue;   // already set

                    let symbols_possible = getPossibleSymbols(sx, sy, gx, gy);
                    let symbol = getRandomItemInArray(symbols_possible);
                    symbols_grid[sx][sy][gx][gy] = symbol;
                    if (!checkLoneValidSymbols())
                        return false;
                }
            }
        }
    }

    return true;
}

function checkLoneValidSymbols() {
  // This is used to go though all spots and check if there only one available symbol to use
    for (let sx = 0; sx < size; sx++) {
        for (let sy = 0; sy < size; sy++) {
            for (let gx = 0; gx < size; gx++) {
                for (let gy = 0; gy < size; gy++) {
                    if (symbols_grid[sx][sy][gx][gy])
                        continue;   // already set

                    let symbols_possible = getPossibleSymbols(sx, sy, gx, gy);
                    if (symbols_possible.length == 1) {
                        symbols_grid[sx][sy][gx][gy] = symbols_possible[0];

                        // Since we just added one, start again on searching for another lone symbol
                        return checkLoneValidSymbols();
                    } else if (symbols_possible.length == 0) {
                        //throw new Error("No available symbol to select at [" + sx + "][" + sy + "][" + gx + "][" + gy + "]");
                        return false;
                    }
                }
            }
        }
    }

    return true;
}

function getPossibleSymbols(sx1, sy1, gx1, gy1) {
    // Figure out which symbols it could be used for this
    let symbols_possible = [...symbols_list]; // Clone an array

    for (let sx2 = 0; sx2 < size; sx2++) {
        for (let sy2 = 0; sy2 < size; sy2++) {
            for (let gx2 = 0; gx2 < size; gx2++) {
                for (let gy2 = 0; gy2 < size; gy2++) {

                    // Symbols must be unique from eachother by section, row and col
                    if (
                        (sx1 == sx2 && sy1 == sy2)  // section
                        || (sx1 == sx2 && gx1 == gx2)   // col
                        || (sy1 == sy2 && gy1 == gy2)   // row
                    ) {
                        let symbol = symbols_grid[sx2][sy2][gx2][gy2];
                        removeItemInArray(symbols_possible, symbol);
                    }
                }
            }
        }
    }

    return symbols_possible;
}

function removeItemInArray(array, item) {
    const index = array.indexOf(item);
    if (index > -1) { // only splice array when item is found
        array.splice(index, 1); // 2nd parameter means remove one item only
    }
}

function getRandomItemInArray(array) {
    return array[Math.floor(Math.random() * array.length)];
}