import { Container, Sprite, Text, TextStyle, Graphics } from "pixi.js";

export default class WordGrid extends Container {
  constructor() {
    super();
    this.matrix = [
      ["", "", "", ""],
      ["", "", "", ""],
      ["", "", "", ""],
    ]; // Initialize the word grid matrix
    this.hiddenCells = [
      [1, 1],
      [1, 3],
      [2, 3],
    ]; // Define hidden cells
    this.cells = [];
    this.init();
  }

  init() {
    const cellSize = 80;
    const padding = 10;
    const gridContainer = new Container();
    this.matrix.forEach((row, rowIndex) => {
      const cellRow = [];
      row.forEach((letter, colIndex) => {
        if (
          !this.hiddenCells.some(
            (cell) => cell[0] === rowIndex && cell[1] === colIndex
          )
        ) {
          const cell = new Graphics();
          cell.lineStyle(2, 0xffffff, 1);
          cell.beginFill(0xfff7db, 0.7);
          cell.drawRoundedRect(0, 0, cellSize, cellSize);
          cell.endFill();
          cell.x = colIndex * (cellSize + padding);
          cell.y = rowIndex * (cellSize + padding);
          gridContainer.addChild(cell);
          cellRow.push(cell);
        } else {
          cellRow.push(null); // Add null for hidden cells
        }
      });
      this.cells.push(cellRow); // Add the row to the cells array
    });
    gridContainer.x = 65;
    gridContainer.y = 80;
    this.addChild(gridContainer);
  }

  updateGrid(word, positions) {
    let canUpdate = true;

    positions.forEach((pos) => {
      if (pos.filled) {
        canUpdate = false; // If any position is already filled, cannot update
      }
    });

    if (!canUpdate) {
      return;
    }

    setTimeout(() => {
      positions.forEach((pos, index) => {
        const [row, col] = pos;
        const cell = this.cells[row][col];
        if (cell && !cell.filled) {
          const letterText = new Text(
            word[index],
            new TextStyle({ fontSize: 32, fill: 0xffffff, fontWeight: "bold" })
          ); // Create the letter text
          letterText.anchor.set(0.5);
          letterText.x = 65 + cell.x + cell.width / 2;
          letterText.y = 80 + cell.y + cell.height / 2;
          this.addChild(letterText);

          cell.lineStyle(2, 0xffffff, 1);
          cell.beginFill(0xffa500, 1);
          cell.drawRoundedRect(0, 0, cell.width, cell.height);
          cell.endFill();
          cell.filled = true; // Mark the cell as filled
        }
      });
    }, 900); // Wait for letters to arrive
  }
}
