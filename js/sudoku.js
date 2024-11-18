const size = 3;   // Can support up to 6
const size_row = size * size; // Size for one of the whole row/col
const size_square = 100;  // Size of the white squares
const size_border = 10;   // Size of the border surrounding it
const size_each = size_square + size_border;  // Size of white square and one side of border together

var symbols_grid;   // a grid to store symbols
var symbols_list = []; // List of symbols to display

function draw() {
  // grid variable would be structured as this:
  // symbols_grid[sx][sy][gx][gy]
  // sx and sy as a section, gx and gy as a position inside of one of the section
  symbols_grid = new Array(size);   // creating [sx]
  for (var sx = 0; sx < size; sx++) {
    symbols_grid[sx] = new Array(size); // creating [sy]
    for (var sy = 0; sy < size; sy++) {
      symbols_grid[sx][sy] = new Array(size);   // creating [gx]
      for (var gx = 0; gx < size; gx++) {
        symbols_grid[sx][sy][gx] = new Array(size); // creating [gy]
      }
    }
  }

  // Add in numbers
  if (size == 6)    // 6 is 36, need all 1-9, A-Z and 0 to be able to have enough of it
    symbols_list.push(0);

  if (size != 5) {  // if size is 5, just go with alphabet for A-Y
      const numbers_max = size_row < 9 ? size_row : 9;
      for (var i = 0; i < numbers_max; i++)
        symbols_list.push(i + 1);
  }

  // Add in alphabets
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const alphabet_max = size_row - symbols_list.length;
  for (var i = 0; i < alphabet_max; i++)
    symbols_list.push(alphabet[i]);


  const canvas = document.getElementById("sudoku");
  const ctx = canvas.getContext("2d");

  var size_whole = size_row * size_each + size_border;

  // Black background, for the black border
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, size_whole, size_whole);

  for (var sx = 0; sx < size; sx++) {
    for (var sy = 0; sy < size; sy++) {
      var x = sx * size;
      var y = sy * size;
      var size_section = size * size_each - size_border;   // size of the section, not counting the black border

      // Grey square, for the grey border
      ctx.fillStyle = "grey";
      ctx.fillRect(x * size_each + size_border, y * size_each + size_border, size_section, size_section);

      for (var gx = 0; gx < size; gx++) {
        for (var gy = 0; gy < size; gy++) {
          var x = sx * size + gx;
          var y = sy * size + gy;

          var symbol = symbols_grid[sx][sy][gx][gy];
          if (!symbol) {
              // Select a random symbol to use, if not already set from checkLoneValidSymbols
              var symbols_possible = getPossibleSymbols(sx, sy, gx, gy);
              symbol = getRandomItemInArray(symbols_possible);
              setSymbol(sx, sy, gx, gy, symbol);
          }

          // White squares
          ctx.fillStyle = "white";
          ctx.fillRect(x * size_each + size_border, y * size_each + size_border, size_square, size_square);

          // Text
          ctx.fillStyle = "black";
          ctx.font = size_square + "px sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(symbol, (x + 0.5) * size_each + (size_border * 0.5), (y + 0.5) * size_each + size_border);
        }
      }
    }
  }
}

function setSymbol(sx, sy, gx, gy, symbol) {
  symbols_grid[sx][sy][gx][gy] = symbol;

  // Since we set one, search though for any lone symbol
  checkLoneValidSymbols();
  checkSymbolsInLoneSpot(sx, sy, gx, gy);
}

function checkLoneValidSymbols() {
  // This is used to go though all spots and check if there only one available symbol to use
  for (var sx = 0; sx < size; sx++) {
    for (var sy = 0; sy < size; sy++) {
      for (var gx = 0; gx < size; gx++) {
        for (var gy = 0; gy < size; gy++) {
            if (symbols_grid[sx][sy][gx][gy])
                continue;   // already set

            var symbols_possible = getPossibleSymbols(sx, sy, gx, gy);
            if (symbols_possible.length == 1) {
                setSymbol(sx, sy, gx, gy, symbols_possible[0]);
                return;
            } else if (symbols_possible.length == 0) {
                throw new Error("No available symbol to select at [" + sx + "][" + sy + "][" + gx + "][" + gy + "]");
            }
        }
      }
    }
  }
}

function checkSymbolsInLoneSpot(sx1, sy1, gx1, gy1) {
    // Check if symbol is available in only one specific section/row/col

    // Used to store any lone spots found, "null" is set if its already set or there multiple spots available
    var loneSpots = {};

    // Check for whole section
    for (var gx2 = 0; gx2 < size; gx2++) {
        for (var gy2 = 0; gy2 < size; gy2++) {
            var symbol = symbols_grid[sx1][sy1][gx2][gy2];
            if (symbol) {
                // already set
                loneSpots[symbol] = null;
                continue;
            }

            var symbols_possible = getPossibleSymbols(sx1, sy1, gx2, gy2);
            for (var i = 0; i < symbols_possible.length; i++) {
                symbol = symbols_possible[i];
                if (symbol in loneSpots) {
                    loneSpots[symbol] = null;   // This symbol is available in multiple spots
                } else {
                    // This symbol is currently only available in this
                    loneSpots[symbol] = new Object();
                    loneSpots[symbol].gx = gx2;
                    loneSpots[symbol].gy = gy2;
                }
            }
        }
    }

    console.log(loneSpots);

    // After looking though all, check for any lone spots available for each symbol
    for (var i = 0; i < symbols_list.length; i++) {
        var symbol = symbols_list[i];
        if (loneSpots[symbol] !== null) {
            console.log(sx1, sy1, symbol);
            console.log(loneSpots[symbol].gx, loneSpots[symbol].gy);
            setSymbol(sx1, sy1, loneSpots[symbol].gx, loneSpots[symbol].gy, symbol);
            return;
        }
    }
}

function getPossibleSymbols(sx1, sy1, gx1, gy1) {
  // Figure out which symbols it could be used for this
  var symbols_possible = [...symbols_list]; // Clone an array

  for (var sx2 = 0; sx2 < size; sx2++) {
    for (var sy2 = 0; sy2 < size; sy2++) {
      for (var gx2 = 0; gx2 < size; gx2++) {
        for (var gy2 = 0; gy2 < size; gy2++) {

            // Symbols must be unique from eachother by section, row and col
            if (
                (sx1 == sx2 && sy1 == sy2)  // section
                || (sx1 == sx2 && gx1 == gx2)   // col
                || (sy1 == sy2 && gy1 == gy2)   // row
            ) {
                var symbol = symbols_grid[sx2][sy2][gx2][gy2];
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