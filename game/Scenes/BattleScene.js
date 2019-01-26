
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
        };
        this.pauseUpdate = false;
        if(this.physics) { this.physics.resume() };

        // Assets
        this.background = undefined;

    }

    /**
     * Preload needed assets for Battle Scene
     */
    preload () {

        // Load Assets
        this.load.image('background', 'assets/images/BattleScene/background.jpg');
        this.load.image('border', 'assets/images/BattleScene/border.jpg');
        this.load.image('BH', 'assets/images/BattleScene/bernard_hermite_basic.png');
        this.load.image('BHNoShell', 'assets/images/BattleScene/bernard_hermite_without_shell_basic.png');
        this.load.image('shell', 'assets/images/BattleScene/bernard_hermite_shell.png');

    }

    /**
     * Create BattleScene (initialization of arena and players)
     */
    create () {

        // Reset everything
        this.init();
        this.players = [...this.initialPlayers];

        // Background and border
        this.background = this.add.image(0, 0, 'background');
        this.background.setDisplaySize(this.sys.canvas.width * 2, this.sys.canvas.height * 2); // WTF

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
            this.players[k] = new Player(this, this.players[k].pad, this.players[k].playerId);
            this.add.existing(this.players[k]);
            this.physics.add.existing(this.players[k]);
            this.players[k].invocate(this, 'BH', initialPositions[k].x, initialPositions[k].y, initialPositions[k].flipX);
            this.playersGroup.add(this.players[k]);
        }

        // Prepare groups for Shell
        this.shellsGroup = this.physics.add.group();

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
        this.tokenShellOverlap = this.time.now;
        this.physics.overlap(this.playersGroup,  this.shellsGroup, this.playersAndShellsCollide, null, this);

        // Players update
        for(let k in this.players) {
            if(this.players[k] === undefined){ continue };
            if(this.players[k].active) {
                this.players[k].update();
            }
        }

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
            player.justLaunchShellToken = this.tokenShellOverlap;
            return;
        }

        // Game over for this player !
        player.destroy();

        // Verify if game is over ?
        if(this.playersGroup.countActive() === 1) {

            // TODO Update score
            console.gameLog('Player ' + this.playersGroup.children.entries[0].playerId + ' WIN !', 'BattleScene');

            // Verify if game if over

            // Pause game and start next round in 2 seconds !
            this.time.delayedCall(2000, function(scene){
                scene.scene.restart();
            }, [this]);
            this.pauseUpdate = true;
            this.physics.pause();

        }

    }

}