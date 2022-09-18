
/**
 * Shell
 */
class Shell extends Phaser.Physics.Arcade.Sprite {

    /**
     * Shell constructor.
     *
     * @param scene Current scene to interact with it
     */
    constructor (scene) {
        super(scene);
    }

    /**
     * Invocate Shell into battle !
     * @param player
     * @param x
     * @param y
     */
    invocate (player, x, y){

        // Set basic configuration
        this.player = player;
        this.setTexture('shell');
        this.displayWidth = 80;
        this.displayHeight = 80;
        this.speed = 1000;
        this.body.setSize(this.displayWidth, this.displayHeight);
        this.setPosition(x, y);
        this.setBounce(1.2);
        this.setCollideWorldBounds(true);
        this.body.setMaxVelocity(1000, 1000);

    }

    /**
     * Increase Shell speed.
     */
    increaseSpeed() {
        this.speed += 500;
        // Cannot find how to speed this thing on collision ><
    }

}