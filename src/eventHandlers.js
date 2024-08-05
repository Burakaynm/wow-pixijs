import { Graphics, TextStyle, Text, Container, Sprite } from "pixi.js";
import EndGame from "./endGame";
import gsap from "gsap";
import { app } from "./index";

// Event handler for when a letter is clicked
export function onLetterClick(
  event,
  letterText,
  selectedLetters,
  letterContainer,
  game
) {
  game.shouldCompleteAutomatically = false; // Disable automatic completion
  startDrawingLine(selectedLetters, letterContainer); // Check for errors
  selectedLetters.length = 0;
  selectLetter(letterText, selectedLetters, letterContainer);
  letterContainer.dragging = true;

  if (!letterContainer.lineContainer) {
    letterContainer.lineContainer = new Graphics();
    letterContainer.addChildAt(letterContainer.lineContainer, 2);
  }

  resetInactivityTimer(letterContainer.parent, selectedLetters[0]);
}

// Event handler for when the pointer is moved over a letter
export function onLetterMove(event, selectedLetters, letterContainer) {
  if (!letterContainer.dragging) return; // Do nothing if not dragging

  const newPosition = event.data.getLocalPosition(letterContainer); // Get the new pointer position

  letterContainer.children.forEach((child) => {
    if (
      // child.containsPoint &&
      child.text &&
      child.containsPoint(newPosition) &&
      !selectedLetters.some((s) => s.letterText === child)
    ) {
      selectLetter(child, selectedLetters, letterContainer); // Select the letter if the pointer is over it and it's not already selected
    }
  });

  // Start drawing line
  if (selectedLetters.length > 1) {
    const previousLetter =
      selectedLetters[selectedLetters.length - 2].letterText;
    const currentLetter =
      selectedLetters[selectedLetters.length - 1].letterText;

    letterContainer.lineContainer.lineStyle(12, 0xffa500);
    letterContainer.lineContainer.moveTo(previousLetter.x, previousLetter.y);
    letterContainer.lineContainer.lineTo(currentLetter.x, currentLetter.y);
  }
}

// Event handler for when a letter is released
export function onLetterRelease(
  selectedLetters,
  letterContainer,
  wordGrid,
  foundWords
) {
  if (!letterContainer.dragging) return; // Do nothing if not dragging
  letterContainer.dragging = false;

  stopDrawingLine(letterContainer);
  checkWord(selectedLetters, wordGrid, foundWords); // Check if the selected letters form a valid word
  clearSelectedLetters(letterContainer, selectedLetters, null);
  selectedLetters.length = 0;
  letterContainer.shuffleButton.visible = true;
}

// Select a letter and highlight it
export function selectLetter(letterText, selectedLetters, letterContainer) {
  const graphics = new Graphics(); // Add background to selected
  graphics.beginFill(0xffa500, 1);
  graphics.drawCircle(letterText.x, letterText.y, 30, 30);
  graphics.endFill();
  letterContainer.addChild(graphics);

  // Make selected letter white
  letterText.style = new TextStyle({
    fontSize: 48,
    fill: 0xffffff,
    fontWeight: "bold",
  });
  letterContainer.addChild(letterText);

  selectedLetters.push({ letter: letterText.text, graphics, letterText });
}

// Clear the selected letters
export function clearSelectedLetters(
  letterContainer,
  selectedLetters,
  clickedLetter
) {
  selectedLetters.forEach(({ graphics, letterText }) => {
    letterContainer.removeChild(graphics); // Remove background from selected letter

    // Keep the style of selected letter
    clickedLetter && letterText._text === clickedLetter.letter
      ? null
      : resetLetterStyle(letterText);
  });

  selectedLetters.length = 0;

  if (letterContainer.lineContainer) {
    letterContainer.lineContainer.clear();
  }
}

// Reset the style of a letter to default
function resetLetterStyle(letterText) {
  letterText.style = new TextStyle({
    fontSize: 48,
    fill: 0xffa500,
    fontWeight: "bold",
  });
}

// Check if the selected letters form a valid word
export function checkWord(selectedLetters, wordGrid, foundWords) {
  const selectedWord = selectedLetters.map((item) => item.letter).join(""); // Combine selected letters into a word
  // Words and their positions
  const validWords = {
    GOLD: [
      [0, 0],
      [0, 1],
      [0, 2],
      [0, 3],
    ],
    GOD: [
      [0, 0],
      [1, 0],
      [2, 0],
    ],
    DOG: [
      [2, 0],
      [2, 1],
      [2, 2],
    ],
    LOG: [
      [0, 2],
      [1, 2],
      [2, 2],
    ],
  };

  if (validWords[selectedWord] && !foundWords.includes(selectedWord)) {
    wordGrid.updateGrid(selectedWord, validWords[selectedWord]);
    foundWords.push(selectedWord); // Add the word to the list of found words

    // Animate the letters moving to the grid
    selectedLetters.forEach(({ letterText }, index) => {
      const targetPosition = validWords[selectedWord][index];
      const targetX = 65 + targetPosition[1] * 90 + 40;
      const targetY = 80 + targetPosition[0] * 90 + 40;

      const clone = new Text(letterText.text, letterText.style); // Clone the letter text
      clone.anchor.set(0.5);
      clone.x = letterText.x;
      clone.y = letterText.y;
      clone.scale.set(0.6);
      letterText.parent.addChild(clone);

      gsap.to(clone, {
        x: targetX,
        y: targetY,
        duration: 1,
        onComplete: () => {
          letterText.parent.removeChild(clone);
        },
      });
    });

    if (foundWords.length === 4) {
      setTimeout(() => {
        onGameEnd(wordGrid.parent); // End the game if all words are found
      }, 1100);
    }
  }
}

// Reset the inactivity timer
export function resetInactivityTimer(game, clickedLetter) {
  if (game.inactivityTimer) {
    clearTimeout(game.inactivityTimer);
  }
  if (game.inactivityMessage) {
    game.removeChild(game.inactivityMessage);
    game.inactivityMessage = null;
  }
  if (game.handSprite) {
    game.removeChild(game.handSprite);
    game.handSprite = null;
  }

  game.shouldCompleteAutomatically = false;

  clearSelectedLetters(game.letterTray, game.selectedLetters, clickedLetter); // Clear for shuffle button
}

//Start the inactivity timer
export function startInactivityTimer(game) {
  if (game.inactivityTimer) {
    clearTimeout(game.inactivityTimer);
  }

  game.inactivityTimer = setTimeout(() => {
    showInactivityMessage(game);
    game.shouldCompleteAutomatically = true;
  }, 5000); // 5 seconds
}

// Show an inactivity message to the player
export function showInactivityMessage(game) {
  const remainingWords = ["GOLD", "GOD", "DOG", "LOG"].filter(
    (word) => !game.foundWords.includes(word)
  );
  const nextWord = remainingWords.length ? remainingWords[0] : "";
  if (nextWord) {
    // Create inactivity message background
    game.inactivityMessage = new Container();
    const background = new Graphics();
    background.beginFill(0x008000);
    background.drawRoundedRect(-150, -25, 300, 50, 10);
    background.endFill();
    game.inactivityMessage.addChild(background);

    const text = new Text(
      `Connect the letters ${nextWord}`,
      new TextStyle({ fontSize: 23, fill: 0xffffff, fontWeight: "bold" })
    );
    text.anchor.set(0.5);
    game.inactivityMessage.addChild(text);

    game.inactivityMessage.x = 240;
    game.inactivityMessage.y = 375;
    game.inactivityMessage.scale.set(0.8);
    game.addChild(game.inactivityMessage);

    game.handSprite = Sprite.from("hand");
    game.handSprite.anchor.set(0.5);
    game.handSprite.scale.set(0.25);
    game.addChild(game.handSprite);

    const positions = {};
    game.letterTray.children.forEach((child) => {
      if (child.text) {
        positions[child.text] = { x: child.x + 20, y: child.y + 20 }; // Save positions of letters +20
      }
    });

    const letterPositions = nextWord
      .split("")
      .map((letter) => positions[letter]);

    if (letterPositions.length > 0) {
      game.handSprite.x = letterPositions[0].x; // Set starter hand sprite position
      game.handSprite.y = letterPositions[0].y;
    }

    let timeline = gsap.timeline({ repeat: 2 });
    letterPositions.forEach((pos, index) => {
      if (index === 0) {
        timeline.to(game.handSprite, {
          x: pos.x,
          y: pos.y,
          duration: 0.5,
        });
      } else {
        timeline.to(game.handSprite, {
          x: pos.x,
          y: pos.y,
          duration: 1,
        });
      }
    });
    timeline.to(game.handSprite, { alpha: 0, duration: 0.5 });

    //At third animation make an autoplay
    let counter = 0;
    timeline.eventCallback("onRepeat", () => {
      if (timeline.repeat() === ++counter && game.shouldCompleteAutomatically) {
        game.shouldCompleteAutomatically = true;
        letterPositions.forEach((pos, index) => {
          setTimeout(() => {
            if (!game.shouldCompleteAutomatically) {
              return;
            }

            const letter = nextWord[index];
            const letterText = game.letterTray.children.find(
              (child) => child.text === letter
            );

            if (letterText) {
              selectLetter(letterText, game.selectedLetters, game.letterTray); // Select letter automatically

              game.updateSelectedLettersDisplay(game.selectedLetters);

              if (game.selectedLetters.length > 1) {
                const previousLetter =
                  game.selectedLetters[game.selectedLetters.length - 2]
                    .letterText;
                const currentLetter =
                  game.selectedLetters[game.selectedLetters.length - 1]
                    .letterText;

                if (!game.letterTray.lineContainer) {
                  game.letterTray.lineContainer = new Graphics();
                  game.letterTray.addChildAt(game.letterTray.lineContainer, 1);
                }
                game.letterTray.lineContainer.lineStyle(12, 0xffa500);
                game.letterTray.lineContainer.moveTo(
                  previousLetter.x,
                  previousLetter.y
                );
                game.letterTray.lineContainer.lineTo(
                  currentLetter.x,
                  currentLetter.y
                );
              }
            }
          }, index * 1000); // Delay between automatic letter selection
        });

        setTimeout(() => {
          checkWord(game.selectedLetters, game.wordGrid, game.foundWords); // Check if the selected letters form a valid word
          clearSelectedLetters(
            game.letterTray,
            game.selectedLetters,
            game.selectedLetters
          );

          if (!game.shouldCompleteAutomatically) return;

          game.letterTray.lineContainer.clear();
          game.selectedLetters.length = 0;
          game.letterTray.shuffleButton.visible = true;
          game.updateSelectedLettersDisplay();
          game.removeChild(game.inactivityMessage);

          const nextRemainingWords = ["GOLD", "GOD", "DOG", "LOG"].filter(
            (word) => !game.foundWords.includes(word)
          );
          const nextNextWord = nextRemainingWords.length
            ? nextRemainingWords[0]
            : "";
          if (nextNextWord) {
            setTimeout(() => {
              game.shouldCompleteAutomatically = true;
              showInactivityMessage(game);
            }, 5000); // Delay before showing next inactivity message
          }
        }, nextWord.length * 1000 + 500); // Delay for checking the word and clearing selections
      }
    });
  }
}

// Start drawing a line from the selected letter
export function startDrawingLine(selectedLetters, letterContainer) {
  document.addEventListener("pointermove", (event) =>
    onGlobalPointerMove(event, letterContainer, selectedLetters, app)
  ); // Add global pointer move event listener
}

// Handle global pointer move event
function onGlobalPointerMove(event, letterContainer, selectedLetters, app) {
  if (selectedLetters.length > 0) {
    const previousLetter =
      selectedLetters[selectedLetters.length - 1].letterText;

    const rect = app.view.getBoundingClientRect(); // Get the bounding rectangle of the game view
    const localMousePos = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    }; // Calculate the local mouse position

    if (!letterContainer.parent.tempLineContainer) {
      letterContainer.parent.tempLineContainer = new Graphics();
      letterContainer.parent.addChildAt(
        letterContainer.parent.tempLineContainer,
        4
      ); // Create a temporary line container and add it to the parent container
    }
    letterContainer.parent.tempLineContainer.clear();

    letterContainer.parent.tempLineContainer.lineStyle(12, 0xffa500);
    letterContainer.parent.tempLineContainer.moveTo(
      previousLetter.getGlobalPosition().x,
      previousLetter.getGlobalPosition().y
    );
    letterContainer.parent.tempLineContainer.lineTo(
      localMousePos.x,
      localMousePos.y
    );
  }

  if (letterContainer.selectedLetters.length == 4) {
    stopDrawingLine(letterContainer); // Stop drawing line if 4 letters are selected
  }
}

// Stop drawing the line when the pointer is released
export function stopDrawingLine(letterContainer) {
  if (letterContainer.parent.tempLineContainer) {
    letterContainer.parent.tempLineContainer.clear();
    letterContainer.parent.removeChild(
      letterContainer.parent.tempLineContainer
    );
    letterContainer.parent.tempLineContainer = null;
  }

  document.removeEventListener("pointermove", onGlobalPointerMove); // Remove the global pointer move event listener
}

// Handle the end of the game
export function onGameEnd(game) {
  game.removeChild(game.letterTray);
  game.removeChild(game.wordGrid);

  game.background.alpha = 0.3; // Dim the background

  const endPlayNowContainer = game.playNowContainer;
  if (endPlayNowContainer) {
    endPlayNowContainer.y -= 150;
  }

  game.endGameScene = new EndGame(); // Create the end game scene
  game.addChild(game.endGameScene);
}
