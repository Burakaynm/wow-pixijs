import { Container, Sprite, BaseTexture, Texture, Rectangle } from "pixi.js";

export default class EndGame extends Container {
  constructor() {
    super();
    this.frames = [];
    this.initEarthAnimation();
    this.initTitle();
  }

  initEarthAnimation() {
    const baseTexture = BaseTexture.from("earth");
    const frameWidth = baseTexture.width / 5; // Calculate frame width
    const frameHeight = baseTexture.height / 4; // Calculate frame height

    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 5; x++) {
        if (y == 3 && x == 4) {
          continue; // Skip the last frame
        }
        const frame = new Texture(
          baseTexture,
          new Rectangle(
            x * frameWidth,
            y * frameHeight,
            frameWidth,
            frameHeight
          )
        );
        this.frames.push(frame);
      }
    }

    this.earth = new Sprite(this.frames[0]);
    this.earth.anchor.set(0.5);
    this.earth.x = 240;
    this.earth.y = 400;
    this.earth.scale.set(1.1);
    this.addChild(this.earth);

    this.animateEarth();
  }

  // Animate the earth by cycling through frames
  animateEarth() {
    let frameIndex = 0;
    const updateFrame = () => {
      frameIndex = (frameIndex + 1) % this.frames.length;
      this.earth.texture = this.frames[frameIndex];
      setTimeout(updateFrame, 50);
    };
    updateFrame();
  }

  initTitle() {
    const title = Sprite.from("title");
    title.anchor.set(0.5);
    title.x = 240;
    title.y = 180;
    title.scale.set(0.7);
    this.addChild(title);
  }
}
