var GameOfLife = function(canvasContext, cellSizeInPixels, refreshInterval, abundanceFactor) {
  var context = canvasContext;
  var cellSize = cellSizeInPixels;
  var refreshInterval = refreshInterval;
  var abundanceFactor = abundanceFactor;
  var refreshTimer;
  var grid = [];

  var generateNewGrid = function() {
    var grid = [];
    for(var w = 0; w < (context.canvas.width/cellSize); w++) {
      grid[w] = [];
      for(var h = 0; h < (context.canvas.height/cellSize); h++) {
        var rand = Math.floor(Math.random() * 100);
        grid[w][h] = rand >= abundanceFactor ? 0 : 1;
      }
    }
    return grid;
  };

  var getCell = function(w, h) {
    var row = grid[w];
    if (typeof(row) === "undefined") return 0;

    var cell = grid[w][h];
    if (typeof(cell) !== "undefined") {
      return cell === 1 || cell === 2;
    }
    return 0;
  };

  var getNeighbours = function(w, h) {
    var numOfNeighbours = 0;
    for(var i = w - 1; i <= w + 1; i++) {
      for(var j = h - 1; j <= h + 1; j++) {
        if (i === w && j === h) continue;
        numOfNeighbours += getCell(i, j);
      }
    }
    return numOfNeighbours;
  };

  var simulateLife = function() {
    for (var w = 0; w < grid.length; w++) {
      for (var h = 0; h < grid[w].length; h++) {
        var neighbours = getNeighbours(w, h);
        var isAlive = grid[w][h] === 1;
        if (isAlive) {
          //1. Any live cell with fewer than two live neighbours dies, as if caused by underpopulation.
          if (neighbours < 2)
            grid[w][h] = 2; //Mark cell for "kill" so it will be held as alive when checking from neighbouring cells.
          //2. Any live cell with two or three live neighbours lives on to the next generation.
          else if (neighbours === 2 || neighbours === 3)
            continue;
          //3. Any live cell with more than three live neighbours dies, as if by overpopulation.
          else if (neighbours > 3)
            grid[w][h] = 2; //Mark cell for "kill" so it will be held as alive when checking from neighbouring cells.
        } else if (!isAlive && neighbours === 3) {
          grid[w][h] = 3; //Mark cell for "creation" so it will be held as non existent when checking from neighbouring cells.
        }
      }
    }
  };

  var draw = function() {
    for (var w = 0; w < grid.length; w++) {
      for (var h = 0; h < grid[w].length; h++) {
        //Update cells to their right status from temporary status
        if (grid[w][h] === 3)
          grid[w][h] = 1;
        else if (grid[w][h] === 2)
          grid[w][h] = 0;

        //Color
        if (grid[w][h] === 0)
          context.fillStyle = "#000000";
        else
          context.fillStyle = "#0cff45";
        context.fillRect(w * cellSize, h * cellSize, cellSize, cellSize)
      }
    }
  };

  this.start = function(recreateGrid) {
    context.canvas.width = window.innerWidth - 5;
    context.canvas.height = window.innerHeight - 5;
    if (!grid || recreateGrid)
      grid = generateNewGrid();

    refreshTimer = setInterval(function() {
      draw();
      simulateLife();
    }, refreshInterval);
  };

  this.stop = function() {
    if (refreshTimer)
      clearInterval(refreshTimer);
      refreshTimer = null;
  };

  this.restart = function(recreateGrid) {
    this.stop();
    this.start(recreateGrid);
  };

  this.changeScale = function(newScale) {
    if (cellSize !== newScale) {
      cellSize = newScale;
      this.restart(true);
    }
  };

  this.changeInterval = function(newInterval) {
    if (refreshInterval !== newInterval) {
      refreshInterval = newInterval;
      this.restart();
    }
  };

  this.changeAbundance = function(newAbundance) {
    if (abundanceFactor !== newAbundance) {
      abundanceFactor = newAbundance;
      this.restart(true);
    }
  };

  this.insertLife = function(editedPixels) {
    for (var i = 0; i < editedPixels.length; i++) {
    //  grid[editedPixels[i].x / cellSize][editedPixels[i].y / cellSize] = 1;
      grid[Math.floor(editedPixels[i].x / cellSize)][Math.floor(editedPixels[i].y / cellSize)] = 1
    }
    if (!refreshTimer)
      draw();
  }

  return this;
}

window.onload = function() {
  var canvas = document.getElementById("gameOfLife");
  var cellSizeSlider = document.getElementById("cellSizeInPixels");
  var cellSizeText = document.getElementById("cellSize");
  var stopStartButton = document.getElementById("stopStartButton");
  var refreshRate = document.getElementById("refreshRate");
  var abundance = document.getElementById("abundance");
  var context = canvas.getContext("2d");
  var gameOfLife = new GameOfLife(context, cellSizeSlider.value, refreshRate.value, abundance.value);

  cellSizeSlider.onchange = function(e) {
    cellSizeText.innerHTML = e ? e.target.value : this.value;
    gameOfLife.changeScale(cellSizeText.innerHTML);
  }

  refreshRate.onchange = function(e) {
    gameOfLife.changeInterval(e.target.value);
  }

  abundance.onchange = function(e) {
    gameOfLife.changeAbundance(e.target.value);
  }

  stopStartButton.onclick = function() {
    this.value = this.value === "Stop" ? "Start" : "Stop";
    if (this.value === "Stop")
      gameOfLife.restart();
    else
      gameOfLife.stop();
  }

  window.onresize = function() {
    gameOfLife.restart(true);
  };

  //Drawing
  var drawing = false;
  var editedPixels = [];
  var getMousePos = function(canvasDom, mouseEvent) {
    var rect = canvasDom.getBoundingClientRect();
    return {
      x: mouseEvent.clientX - rect.left,
      y: mouseEvent.clientY - rect.top
    };
  };
  canvas.addEventListener("mousedown", function (e) {
    drawing = true;
    editedPixels.push(getMousePos(canvas, e));
  }, false);

  canvas.addEventListener("mouseup", function (e) {
    drawing = false;
    gameOfLife.insertLife(editedPixels);
    editedPixels = [];
  }, false);

  canvas.addEventListener("mousemove", function (e) {
    if (drawing)
      editedPixels.push(getMousePos(canvas, e));
  }, false);

  //Initialization
  cellSizeSlider.onchange();
  gameOfLife.start(true);
}
