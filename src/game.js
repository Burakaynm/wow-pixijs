import {
  Container,
  Sprite,
  Text,
  TextStyle,
  Graphics,
  Rectangle,
} from "pixi.js";
import WordGrid from "./wordGrid";
import LetterTray from "./letterTray";
import {
  onLetterClick,
  checkWord,
  onGameEnd,
  showInactivityMessage,
} from "./eventHandlers";
import gsap from "gsap";
import { GAME_WIDTH, GAME_HEIGHT } from "./index.js";

export default class Game extends Container {
  constructor() {
    super();
    this.letters = "G,O,D,L".split(",");
    this.selectedLetters = [];
    this.foundWords = [];
    this.wordGrid = new WordGrid();
    this.shouldCompleteAutomatically = true;
    this.addChild(this.wordGrid);

    this.letterTray = new LetterTray(
      this.letters,
      this.onLetterSelected.bind(this),
      this.wordGrid,
      this.foundWords,
      this.updateSelectedLettersDisplay.bind(this)
    );

    this.addChild(this.letterTray);
    this.init();
    this.inactivityMessage = null;
    this.inactivityTimer = null;
    this.startInactivityTimer();
    this.addBlockingLayer();
  }

  init() {
    this.background = Sprite.from("background");
    this.background.width = GAME_WIDTH;
    this.background.height = GAME_HEIGHT;
    this.addChildAt(this.background, 0);

    this.playNowContainer = new Container();
    this.playNowContainer.x = 240;
    this.playNowContainer.y = 750;

    const playNowBg = Sprite.from("playNowBg");
    playNowBg.anchor.set(0.5);
    playNowBg.scale.set(1.3);

    this.playNowContainer.addChild(playNowBg);

    const playNowText = new Text(
      "PLAY NOW!",
      new TextStyle({ fontSize: 36, fill: 0xffffff, fontWeight: "bold" })
    );
    playNowText.anchor.set(0.5);
    playNowText.scale.set(0.7);
    this.playNowContainer.addChild(playNowText);

    gsap.to(this.playNowContainer.scale, {
      x: 1.1,
      y: 1.1,
      duration: 0.5,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut",
    }); // Animate the "PLAY NOW" container to grow and shrink

    this.addChild(this.playNowContainer);

    this.selectedLettersDisplay = new Container();
    this.selectedLettersDisplay.x = 240;
    this.selectedLettersDisplay.y = 430;
    this.addChild(this.selectedLettersDisplay);
  }

  onLetterSelected(letterText) {
    onLetterClick(letterText, this.selectedLetters, this.letterTray, this);
    this.updateSelectedLettersDisplay(this.selectedLetters);
  }

  checkWord(selectedLetters) {
    checkWord(selectedLetters, this.wordGrid, this.foundWords);
    if (this.foundWords.length === 4) {
      onGameEnd(this);
    }
  }

  updateSelectedLettersDisplay(selectedLetters) {
    this.selectedLettersDisplay.removeChildren();

    if (!selectedLetters || selectedLetters.length === 0) {
      this.selectedLettersDisplay.visible = false; // Hide the display container if no letters are selected
      return;
    }

    this.selectedLettersDisplay.visible = true;
    const background = new Graphics();
    background.beginFill(0xffa500);
    const width = selectedLetters.length * 30 + 20;
    background.drawRoundedRect(-width / 2, -25, width, 50, 10);
    background.endFill();
    this.selectedLettersDisplay.addChild(background);

    const selectedText = selectedLetters.map((item) => item.letter).join("");
    const text = new Text(
      selectedText,
      new TextStyle({ fontSize: 36, fill: 0xffffff, fontWeight: "bold" })
    );
    text.anchor.set(0.5);
    this.selectedLettersDisplay.addChild(text);
  }

  startInactivityTimer() {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
    }

    this.inactivityTimer = setTimeout(() => {
      showInactivityMessage(this);
    }, 5000); // 5 saniye
  }

  addBlockingLayer() {
    const blockingLayer = new Graphics();
    blockingLayer.beginFill(0, 0); // Transparent fill
    blockingLayer.drawRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    blockingLayer.endFill();
    blockingLayer.eventMode = "passive";
    blockingLayer.hitArea = new Rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT);
    this.addChildAt(blockingLayer, 2); // Add the blocking layer to the game
  }
}
