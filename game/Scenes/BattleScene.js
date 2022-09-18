
/**
 * BattleScene
 */
class BattleScene extends Phaser.Scene {

    /**
     * BattleScene constructor.
     */
    constructor () {
        super({ 'key' : 'BattleScene'});
        this.init();
        this.firstGame = true;
    }

    /**
     * Init needed on each round
     */
    init () {

        // Init Battle configuration
        this.initialPlayers = (this.initialPlayers) ? this.initialPlayers : undefined;
        this.players = [];
        this.playersGroup = undefined;
        this.shellsGroup = undefined;
        this.gamepadInitialized = false;
        this.config = {
            'initGameSpeed' : 1,
            'sounds': {
                'background': { 'volume' : 0.1, 'rate': 1},
                'bump': { 'volume' : 0.05, 'rate': 1},
                'catch': { 'volume' : 0.1, 'rate': 1},
                'dash': { 'volume' : 0.1, 'rate': 1},
                'die': { 'volume' : 0.1, 'rate': 1},
                'shoot': { 'volume' : 0.05, 'rate': 1},
                'smash': { 'volume' : 0.1, 'rate': 1},
            }
        };
        this.colors = ['blue', 'green', 'red', 'yellow'];
        this.gameSpeed = 1;
        this.pauseUpdate = false;
        if(this.physics) { this.physics.resume() }

        // Assets
        this.background = undefined;

    }

    /**
     * Preload needed assets for Battle Scene
     */
    preload () {

        // Load images
        this.load.image('background', 'assets/images/BattleScene/background.jpg');
        this.load.image('border', 'assets/images/BattleScene/border.jpg');
        this.load.image('BH', 'assets/images/BattleScene/bernard_hermite_basic.png');
        this.load.image('BHNoShell', 'assets/images/BattleScene/bernard_hermite_without_shell_basic.png');
        this.load.image('shell', 'assets/images/BattleScene/bernard_hermite_shell.png');

        // Load spritesheets
        for(let k in this.colors) {
            this.load.spritesheet('BHWithShellWalk_' + this.colors[k], 'assets/images/BattleScene/bernard_hermite_shell_walk_' + this.colors[k] + '.png', { frameWidth: 133, frameHeight: 116 });
            this.load.spritesheet('BHWithoutShellWalk_' + this.colors[k], 'assets/images/BattleScene/bernard_hermite_without_shell_walk_' + this.colors[k] + '.png', { frameWidth: 133, frameHeight: 116 });
            this.load.spritesheet('BHWithShellDash_' + this.colors[k], 'assets/images/BattleScene/bernard_hermite_shell_dash_' + this.colors[k] + '.png', { frameWidth: 133, frameHeight: 116 });
            this.load.spritesheet('BHWithoutShellDash_' + this.colors[k], 'assets/images/BattleScene/bernard_hermite_without_shell_dash_' + this.colors[k] + '.png', { frameWidth: 133, frameHeight: 116 });
            this.load.spritesheet('BHCatch_' + this.colors[k], 'assets/images/BattleScene/bernard_hermite_catch_' + this.colors[k] + '.png', { frameWidth: 133, frameHeight: 116 });
        }

        // Load Audio
        this.load.audio('background_music', 'assets/sound/background_music.wav');
        this.load.audio('bump', 'assets/sound/bump.wav');
        this.load.audio('catch', 'assets/sound/catch.wav');
        this.load.audio('dash', 'assets/sound/dash.wav');
        this.load.audio('die', 'assets/sound/die.wav');
        this.load.audio('shoot', 'assets/sound/shoot.wav');
        this.load.audio('smash', 'assets/sound/smash.wav');

    }

    /**
     * Build animations for Player
     */
    buildAnimations() {
        if(!this.firstGame) {
            return;
        }
        this.firstGame = false;
        for(let k in this.colors) {
            this.anims.create({ key: 'walkWithShell_' + this.colors[k], frames: this.anims.generateFrameNames('BHWithShellWalk_' + this.colors[k], { start: 0, end: 7 }), frameRate: 10, repeat: -1 });
            this.anims.create({ key: 'walkWithoutShell_' + this.colors[k], frames: this.anims.generateFrameNames('BHWithoutShellWalk_' + this.colors[k], { start: 0, end: 7 }), frameRate: 10, repeat: -1 });
            this.anims.create({ key: 'dashWithShell_' + this.colors[k], frames: this.anims.generateFrameNames('BHWithShellDash_' + this.colors[k], { start: 0, end: 7 }), frameRate: 30 });
            this.anims.create({ key: 'dashWithoutShell_' + this.colors[k], frames: this.anims.generateFrameNames('BHWithoutShellDash_' + this.colors[k], { start: 0, end: 7 }), frameRate: 30 });
            this.anims.create({ key: 'catch_' + this.colors[k], frames: this.anims.generateFrameNames('BHCatch_' + this.colors[k], { start: 0, end: 7 }), frameRate: 10 });
        }
    }

    /**
     * Create BattleScene (initialization of arena and players)
     */
    create () {

        // Reset everything
        this.init();
        this.players = [...this.initialPlayers];

        // Build animations
        this.buildAnimations();

        // Background and hidden borders
        this.background = this.add.image(this.sys.canvas.width / 2, this.sys.canvas.height / 2, 'background');
        this.background.setDisplaySize(this.sys.canvas.width, this.sys.canvas.height);
        this.arenaBounds = this.physics.add.group();
        this.arenaBounds.create(-470, 0, 'border').setOrigin(0).setDisplaySize(500, this.sys.canvas.height).setImmovable(true);
        this.arenaBounds.create(this.sys.canvas.width - 30, 0, 'border').setOrigin(0).setDisplaySize(500, this.sys.canvas.height).setImmovable(true);
        this.arenaBounds.create(0, -470, 'border').setOrigin(0).setDisplaySize(this.sys.canvas.width, 500).setImmovable(true);
        this.arenaBounds.create(0, this.sys.canvas.height - 30, 'border').setOrigin(0).setDisplaySize(this.sys.canvas.width, 500).setImmovable(true);
        this.arenaBounds.toggleVisible();

        // Display players
        var initialPositions = {
            1: { x: this.sys.canvas.width / 4, y: this.sys.canvas.height / 3, flipX: false},
            2: { x: this.sys.canvas.width / 4 * 3, y: this.sys.canvas.height / 3, flipX: true},
            3: { x: this.sys.canvas.width / 4, y: this.sys.canvas.height / 3 * 2, flipX: false},
            4: { x: this.sys.canvas.width / 4 * 3, y: this.sys.canvas.height / 3 * 2, flipX: true},
        };
        this.playersGroup = this.physics.add.group();
        for(let k in this.players) {
            if(this.players[k] === undefined){ continue };
            this.players[k] = new Player(this, this.players[k].pad, this.players[k].playerId, this.colors[this.players[k].playerId - 1], this.players[k].inputsMapping);
            this.add.existing(this.players[k]);
            this.physics.add.existing(this.players[k]);
            this.players[k].invocate(this, initialPositions[k].x, initialPositions[k].y, initialPositions[k].flipX);
            this.playersGroup.add(this.players[k]);
        }

        // Prepare groups for Shell
        this.shellsGroup = this.physics.add.group();

        // Background music
        this.backgroundMusic = this.sound.add('background_music');
        this.backgroundMusic.setVolume(this.config.sounds['background'].volume);
        this.backgroundMusic.setRate(this.config.sounds['background'].rate);
        this.backgroundMusic.setLoop(true);
        this.backgroundMusic.play();

        // Speed game loop
        /*this.speedGameLoop = this.time.addEvent({
            delay: 500,
            callback: onEvent,
            callbackScope: this,
            loop: true
        });*/

    }

    /**
     * Init Gamepads for battle
     * @param pad
     */
    initGamepads() {

        // Link gamepad to players
        let playerPad = undefined, scene = this;
        for(let k in this.players) {
            if(this.players[k] === undefined){ continue };
            playerPad = this.input.gamepad.gamepads.find(function(pad) { return pad && pad.index === scene.players[k].pad.index; });
            playerPad.scene = this;
            playerPad.player = this.players[k];
            playerPad.on('down', this.players[k].battleMapping);
            this.players[k].pad = playerPad;

        }

        // Gamepad are now ready !
        this.gamepadInitialized = true;

    }

    update() {

        // Pause system
        if(this.pauseUpdate) {
            return;
        }

        // Verify if gamepad are ready (why I can't do this in create ? >< )
        if(!this.gamepadInitialized && this.input.gamepad.total > 0) {
            this.initGamepads();
        }

        // Launch checker for shell and player collision
        this.physics.collide(this.playersGroup,  this.shellsGroup, this.playersAndShellsCollide, null, this);

        // Players update
        for(let k in this.players) {
            if(this.players[k] === undefined){ continue };
            if(this.players[k].active) {
                this.players[k].update();
            }
        }

        // Avoid to go out of the arena
        this.physics.world.collide(this.playersGroup, this.playersGroup, this.playersAndPlayersCollide, null, this);
        this.physics.world.collide(this.playersGroup, this.arenaBounds);
        this.physics.world.collide(this.shellsGroup, this.arenaBounds, function(shell, arena){
            this.sound.add('bump').setVolume(this.config.sounds['bump'].volume).setRate(this.config.sounds['bump'].rate).play();
            shell.increaseSpeed();
            return;
        }, null, this);
        this.physics.world.collide(this.shellsGroup, this.shellsGroup, function(shellA, shellB){
            this.sound.add('bump').setVolume(this.config.sounds['bump'].volume).setRate(this.config.sounds['bump'].rate).play();
            shellA.increaseSpeed();
            shellB.increaseSpeed();
            return;
        }, null, this);

    }

    /**
     * Set Initial Players define from the PrepareBattleScene
     */
    setInitialPlayers (initialPlayers) {
        this.initialPlayers = initialPlayers;
    }

    /**
     * Handle the collision beetween player and shell
     */
    playersAndShellsCollide(player, shell) {

        // Prevent from collide if this is the player shell which has just been launched
        if(shell.player.playerId === player.playerId && player.justLaunchShell) {
            return false;
        }

        // Catch shell ?
        if(player.canCatch && !player.haveShell) {
            shell.destroy();
            player.haveShell = true;
            player.anims.play('catch_' + player.color, true);
            this.sound.add('catch').setVolume(this.config.sounds['catch'].volume).setRate(this.config.sounds['catch'].rate).play();
            return false;
        }

        // Rebound on shell
        if(player.canCatch && player.haveShell) {
            this.sound.add('bump').setVolume(this.config.sounds['bump'].volume).setRate(this.config.sounds['bump'].rate).play();
            return;
        }

        // Game over for this player !
        player.destroy();
        if(!player.haveShell) {
            shell.destroy();
        }
        this.sound.add('smash').setVolume(this.config.sounds['smash'].volume).setRate(this.config.sounds['smash'].rate).play();

        // Verify if game is over
        this.verifyRoundOver();

    }

    /**
     * Check for finish round ?
     */
    verifyRoundOver() {

        // Verify if game is over ?
        if(this.playersGroup.countActive() === 1) {

            // TODO Update score
            console.gameLog('Player ' + this.playersGroup.children.entries[0].playerId + ' WIN !', 'BattleScene');

            // Pause game and start next round in 2 seconds !
            this.time.delayedCall(2000, function(scene){
                scene.scene.restart();
            }, [this]);
            this.pauseUpdate = true;
            this.physics.pause();

        }

    }

    /**
     * Collide beetween player
     * @param playerA
     * @param playerB
     */
    playersAndPlayersCollide(playerA, playerB) {

        // Player A kill Player B by dashing on him
        if(playerA.isDashing && playerA.haveShell && !playerB.haveShell) {
            playerB.destroy();
            playerA.haveShell = false;
            this.sound.add('smash').setVolume(this.config.sounds['smash'].volume).setRate(this.config.sounds['smash'].rate).play();
            this.verifyRoundOver();
        }

        // Player B kill Player A by dashing on him
        if(playerB.isDashing && playerB.haveShell && !playerA.haveShell) {
            playerA.destroy();
            playerA.haveShell = false;
            this.sound.add('smash').setVolume(this.config.sounds['smash'].volume).setRate(this.config.sounds['smash'].rate).play();
            this.verifyRoundOver();
        }

    }

}