
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
     * @param color color of player
     */
    constructor (scene, pad, playerId, color) {

        // Call GameObject constructor
        super(scene);

        // Player Pad Input
        this.pad = pad;

        // Set player id & color
        this.setPlayerId(playerId);
        this.color = color;

        // Is Player have shell or not ?
        this.haveShell = true;
        this.justLaunchShell = false;

        // Is Player currently dashing ?
        this.isDashing = false;
        this.lastDashTimer = undefined;
        this.timeBeetweenDash = 1;

        // Current speed
        this.initialSpeed = 350;
        this.speed = this.initialSpeed;

        // Animations flag
        this.canMoveIntoDirections = { 'left' : true, 'up' : true, 'right' : true, 'down' : true };
        this.moveInProgress = false;

    }

    /**
     * Invocate player into battle !
     * @param texture
     * @param x
     * @param y
     */
    invocate (scene, x, y, flipX){

        // Set basic configuration
        this.scene = scene;
        this.setTexture('BHWithShellWalk_' + this.color);
        this.flipX = flipX;
        this.displayWidth = 100;
        this.displayHeight = 100;
        this.body.setSize(this.displayWidth, this.displayHeight);
        this.setPosition(x, y);
        this.setBounce(2);
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

                // Create shell
                let shell = new Shell(this.scene);
                this.scene.add.existing(shell);
                this.scene.physics.add.existing(shell);
                this.scene.shellsGroup.add(shell);
                shell.invocate(this.player, this.player.x, this.player.y);
                this.scene.physics.moveTo(shell, this.player.x + (this.rightStick.x * 100), this.player.y + (this.rightStick.y * 100), shell.speed);

                // Play sound
                this.scene.sound.add('shoot').setVolume(this.scene.config.sounds['shoot'].volume).setRate(this.scene.config.sounds['shoot'].rate).play();

                // No shell anymore !
                this.player.haveShell = false;
                this.player.justLaunchShell = true;
                this.scene.time.delayedCall(300, function(player){
                    player.justLaunchShell = false;
                }, [this.player]);

                break;

            // Dash !
            case Phaser.Input.Gamepad.Configs.XBOX_360.LT:

                // Limit dash system
                if(this.player.lastDashTimer !== undefined && (this.scene.time.now - this.player.lastDashTimer) < this.player.timeBeetweenDash * 1000) {
                    return;
                }

                // Dash into direction
                this.player.body.velocity.x += this.leftStick.x * this.player.speed * 6;
                this.player.body.velocity.y += this.leftStick.y * this.player.speed * 6;
                this.player.isDashing = true;
                this.player.canCatch = true;
                this.player.lastDashTimer = this.scene.time.now;

                // Play sound
                this.scene.sound.add('dash').setVolume(this.scene.config.sounds['dash'].volume).setRate(this.scene.config.sounds['dash'].rate).play();

                // Animation
                this.player.anims.play((this.player.haveShell) ? 'dashWithShell_' + this.player.color : 'dashWithoutShell_' + this.player.color, true);

                break;

            // Start the game ! (need at least two players)
            case Phaser.Input.Gamepad.Configs.XBOX_360.START:
                let scene = this.scene;
                console.gameLog('Player ' + this.player.playerId + ' ask for PAUSE !', 'BattleScene');

                if(!scene.pauseUpdate) {
                    scene.pauseUpdate = true;
                    scene.physics.pause();
                    $('#PauseScene').fadeIn(function () {
                        $('#PauseScene').css('display', 'flex');
                        $('#PauseScene').addClass('ready');
                    });
                }
                else  {
                    $('#PauseScene').fadeOut(1000, function () {
                        $('#PauseScene').removeClass('ready');
                        scene.pauseUpdate = false;
                        scene.physics.resume();
                    });
                }

                break;

            // Do nothing for other key
            default:
                break;
        }
    }

    /**
     * Player update method (check for Inputs !)
     */
    update () {

        // Prevent movement if Player already collide with Arena bounds (WHY I HAVE TO DO THIS FUCKING PHASER !!!)
        for(var k in this.canMoveIntoDirections) { this.canMoveIntoDirections[k] = true; }
        this.scene.physics.world.collide(this, this.scene.arenaBounds, function(player, bound){
            player.canMoveIntoDirections['up'] = (parseInt(player.body.top) > 30);
            player.canMoveIntoDirections['right'] = (parseInt(player.body.right) < player.scene.sys.canvas.width -30);
            player.canMoveIntoDirections['down'] = (parseInt(player.body.bottom) < player.scene.sys.canvas.height -30);
            player.canMoveIntoDirections['left'] = (parseInt(player.body.left) > 30);
        });


        // Movement
        let move = false;
        this.deccelerate();
        if(!this.isDashing) {
            if(this.pad.left || (this.pad.leftStick.x < 0 && Math.abs(this.pad.leftStick.x) > 0.5)) {
                if(this.canMoveIntoDirections['left']) { this.body.velocity.x -= this.speed; }
                this.flipX = true;
                move = true;
            }
            if(this.pad.up || (this.pad.leftStick.y < 0 && Math.abs(this.pad.leftStick.y) > 0.5)) {
                if(this.canMoveIntoDirections['up']) { this.body.velocity.y -= this.speed; }
                move = true;
            }
            if(this.pad.right || (this.pad.leftStick.x > 0 && Math.abs(this.pad.leftStick.x) > 0.5)) {
                if(this.canMoveIntoDirections['right']) { this.body.velocity.x += this.speed; }
                this.flipX = false;
                move = true;
            }
            if(this.pad.down || (this.pad.leftStick.y > 0 && Math.abs(this.pad.leftStick.y) > 0.5)) {
                if(this.canMoveIntoDirections['down']) { this.body.velocity.y += this.speed; }
                move = true;
            }

            // Move animation
            if(this.anims.currentAnim === null || !this.haveShell || this.anims.currentAnim.key !== 'catch') {
                this.anims.play((this.haveShell) ? 'walkWithShell_' + this.color: 'walkWithoutShell_' + this.color, true);
                if (!move) {
                    this.anims.stop();
                }
            }

        }

    }

    /**
     * Decelerrate the Player
     */
    deccelerate() {

        // Deccelerate on x
        let directionX = (this.body.velocity.x > 0) ? 1 : -1;
        this.body.velocity.x -= (this.speed * directionX);
        this.body.velocity.x = (this.body.velocity.x * directionX < 0) ? 0 : this.body.velocity.x;

        // Deccelerate on y
        let directionY = (this.body.velocity.y > 0) ? 1 : -1;
        this.body.velocity.y -= (this.speed * directionY);
        this.body.velocity.y = (this.body.velocity.y * directionY < 0) ? 0 : this.body.velocity.y;

        // End dashing ?
        if(this.isDashing && this.body.velocity.x === 0 && this.body.velocity.y === 0) {
            this.scene.time.delayedCall(50, function(player){
                player.isDashing = false;
            }, [this]);
            this.scene.time.delayedCall(1500, function(player){
                player.canCatch = false;
            }, [this]);
        }

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