
/**
 * Shell
 */
class Shell extends Phaser.Physics.Arcade.Sprite {

    /**
     * Shell constructor.
     *
     * @param scene Current scene to interact with it
     * @param config Array of configuration for player
     */
    constructor (scene) {
        super(scene);
    }

    /**
     * Invocate player into battle !
     * @param texture
     * @param x
     * @param y
     */
    invocate (player, x, y, velocityX, velocityY){

        // Set basic configuration
        this.player = player;
        this.setTexture('shell');
        this.displayWidth = 100;
        this.displayHeight = 100;
        this.speed = 1000;
        this.body.setSize(this.displayWidth, this.displayHeight);
        this.setPosition(x, y);
        this.setBounce(1.2);
        this.setCollideWorldBounds(true);
        //this.setAngularAcceleration(20);
        //this.setVelocity(velocityX * this.speed, velocityY * this.speed);
        this.body.setMaxVelocity(1000, 1000);
        //debugger;

    }

    /**
     * Load Shell linked assets
     */
    preload() {
        // TODO
    }

    /**
     * Display shell on scene creation ?
     */
    create() {
        // TODO
    }

    /**
     * Shell update method rebound ?
     */
    update () {
        // TODO
    }

}