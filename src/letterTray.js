import { Container, Sprite, Text, TextStyle } from "pixi.js";
import {
  onLetterClick,
  onLetterMove,
  onLetterRelease,
  resetInactivityTimer,
  startInactivityTimer,
} from "./eventHandlers";
import gsap from "gsap";

export default class LetterTray extends Container {
  constructor(
    letters,
    onLetterSelected,
    wordGrid,
    foundWords,
    updateSelectedLettersDisplay
  ) {
    super();
    this.letters = letters;
    this.onLetterSelected = onLetterSelected;
    this.wordGrid = wordGrid;
    this.foundWords = foundWords;
    this.updateSelectedLettersDisplay = updateSelectedLettersDisplay;
    this.selectedLetters = [];
    this.lettersSprites = [];
    this.init();
  }

  init() {
    const tray = Sprite.from("lettersBackground");
    tray.anchor.set(0.5);
    tray.x = 240;
    tray.y = 580;
    tray.alpha = 0.7;
    tray.scale.set(0.7);
    tray.eventMode = "passive";
    this.addChild(tray);

    this.shuffleButton = Sprite.from("shuffle");
    this.shuffleButton.anchor.set(0.5);
    this.shuffleButton.x = tray.x;
    this.shuffleButton.y = tray.y;
    this.shuffleButton.scale.set(0.1);
    this.shuffleButton.alpha = 0.7;
    this.shuffleButton.eventMode = "static";

    this.shuffleButton.on("pointerdown", () => {
      this.shuffleLetters(); // Shuffle letters when the button is pressed
      resetInactivityTimer(this.parent, null);
      this.parent.shouldCompleteAutomatically = false; // Disable automatic completion
      startInactivityTimer(this.parent);
    });

    this.addChild(this.shuffleButton);

    this.renderLetters();
  }

  renderLetters() {
    const trayRadius = 80;
    const angleStep = (2 * Math.PI) / this.letters.length;

    this.lettersSprites &&
      this.lettersSprites.forEach((letter) => this.removeChild(letter)); // Remove existing letter sprites
    this.lettersSprites = [];

    this.letters.forEach((letter, index) => {
      const angle = index * angleStep; // Calculate the angle for the current letter
      const letterText = new Text(
        letter,
        new TextStyle({ fontSize: 48, fill: 0xffa500, fontWeight: "bold" })
      );
      letterText.anchor.set(0.5);
      letterText.x = 240 + trayRadius * Math.cos(angle);
      letterText.y = 580 + trayRadius * Math.sin(angle);
      letterText.eventMode = "static";

      letterText.on("pointerdown", (event) => {
        this.shuffleButton.visible = false;
        onLetterClick(
          event,
          letterText,
          this.selectedLetters,
          this,
          this.parent
        ); // Handle letter click
        this.updateSelectedLettersDisplay(this.selectedLetters);

        resetInactivityTimer(this.parent, this.selectedLetters[0]);
        this.parent.shouldCompleteAutomatically = false;
      });

      letterText.on("pointermove", (event) => {
        onLetterMove(event, this.selectedLetters, this);
        this.updateSelectedLettersDisplay(this.selectedLetters);
      });

      letterText.on("pointerup", (event) => {
        onLetterRelease(
          this.selectedLetters,
          this,
          this.wordGrid,
          this.foundWords
        ); // Handle letter release
        this.updateSelectedLettersDisplay(this.selectedLetters);
        startInactivityTimer(this.parent);
      });

      letterText.on("pointerupoutside", (event) => {
        onLetterRelease(
          this.selectedLetters,
          this,
          this.wordGrid,
          this.foundWords
        ); // Handle letter release outside the letter
        this.updateSelectedLettersDisplay(this.selectedLetters);
        startInactivityTimer(this.parent);
      });
      this.addChild(letterText);
      this.lettersSprites.push(letterText); // Add the letter text to the letters sprites array
    });
  }

  // Shuffle the letters
  shuffleLetters() {
    const trayRadius = 80;
    const angleStep = (2 * Math.PI) / this.letters.length; // Calculate the angle step between letters
    const centerX = 240;
    const centerY = 580;

    let shuffledLetters = [...this.letters]; // Create a copy of the letters array

    // Ensure at least two letters are swapped
    while (true) {
      const newShuffledLetters = shuffledLetters
        .slice()
        .sort(() => Math.random() - 0.5);
      let hasChanged = false;

      // Check if at least two positions have changed
      for (let i = 0; i < shuffledLetters.length; i++) {
        if (shuffledLetters[i] !== newShuffledLetters[i]) {
          hasChanged = true;
          break;
        }
      }

      if (hasChanged) {
        shuffledLetters = newShuffledLetters;
        break;
      }
    }

    const newPositions = shuffledLetters.map((letter, index) => {
      const angle = index * angleStep;
      return {
        letter: letter,
        x: centerX + trayRadius * Math.cos(angle),
        y: centerY + trayRadius * Math.sin(angle),
      };
    });

    shuffledLetters.forEach((letter, index) => {
      const letterText = this.lettersSprites.find(
        (sprite) => sprite.text === letter
      ); // Find the letter sprite
      const { x, y } = newPositions[index];

      gsap.to(letterText, {
        x: x,
        y: y,
        duration: 0.3,
        onComplete: () => {
          if (index === shuffledLetters.length - 1) {
            // After animation completes, update the letter positions
            this.lettersSprites.forEach((sprite, i) => {
              sprite.x = newPositions[i].x;
              sprite.y = newPositions[i].y;
              sprite.text = newPositions[i].letter;
            });
          }
        },
      });
    });

    this.letters = shuffledLetters; // Update the letters array with the shuffled letters
  }
}
