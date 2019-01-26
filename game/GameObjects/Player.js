
/**
 * Player
 */
class Player extends Phaser.Physics.Arcade.Sprite {

    /**
     * Player constructor.
     *
     * @param scene Current scene to interact with it
     * @param pad Gamepad linked to player
     * @param playerId Player ID
     */
    constructor (scene, pad, playerId) {

        // Call GameObject constructor
        super(scene);

        // Player Pad Input
        this.pad = pad;

        // Set player id
        this.setPlayerId(playerId);

        // Is Player have shell or not ?
        this.haveShell = true;
        this.justLaunchShell = false;

        // Is Player currently dashing ?
        this.isDashing = false;

        // When player have dash for the last time ?
        this.lastDashTimer = undefined;

        // Current speed
        this.speed = 5;

    }

    /**
     * Invocate player into battle !
     * @param texture
     * @param x
     * @param y
     */
    invocate (scene, texture, x, y, flipX){

        // Set basic configuration
        this.scene = scene;
        this.setTexture(texture);
        this.flipX = flipX;
        this.displayWidth = 120;
        this.displayHeight = 120;
        this.body.setSize(this.displayWidth, this.displayHeight);
        this.setPosition(x, y);
        this.setBounce(0.2, 0.2);
        this.setCollideWorldBounds(true);

    }

    /**
     * Launch the Battle mapping !
     */
    battleMapping (buttonCode, value) {
        switch (buttonCode) {

            // Launch shell
            case Phaser.Input.Gamepad.Configs.XBOX_360.RT:

                // Can only launch if user has shell
                if(!this.player.haveShell || (this.rightStick.x === 0 && this.rightStick.y === 0)) {
                    return;
                }

                // Change texture
                this.player.setTexture('BHNoShell');

                // Create shell
                let shell = new Shell(this.scene);
                this.scene.add.existing(shell);
                this.scene.physics.add.existing(shell);
                this.scene.shellsGroup.add(shell);
                shell.invocate(this.player, this.player.x, this.player.y, this.rightStick.x, this.rightStick.y);

                // No shell anymore !
                this.player.haveShell = false;
                this.player.justLaunchShell = true;

                break;

            // Start the game ! (need at least two players)
            case Phaser.Input.Gamepad.Configs.XBOX_360.START:
                console.gameLog('Player ' + this.player.playerId + ' ask for PAUSE !');
                break;

            // Do nothing for other key
            default:
                break;
        }
    }


    /**
     * Display player on scene creation
     */
    create() {
        // TODO
    }

    /**
     * Player update method (check for Inputs !)
     */
    update (tokenShellOverlap) {

        // Change the flag when shell get out of player after launching it
        if(this.justLaunchShellToken != this.scene.tokenShellOverlap) {
            this.justLaunchShell = false;
        }

        // Movement
        if(this.pad.left || this.pad.leftStick.x < 0) {
            this.x -= this.speed;
        }
        if(this.pad.up || this.pad.leftStick.y < 0) {
            this.y -= this.speed;
        }
        if(this.pad.right || this.pad.leftStick.x > 0) {
            this.x += this.speed;
        }
        if(this.pad.down || this.pad.leftStick.y > 0) {
            this.y += this.speed;
        }

        //

    }

    /**
     * Allow to change this player ID
     * @param playerId
     */
    setPlayerId(playerId) {

        // Player name
        this.name = 'Player' + playerId;

        // Player ID
        this.playerId = playerId;

    }

}