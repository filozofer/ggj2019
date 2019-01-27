
/**
 * PrepareBattleScene
 */
class PrepareBattleScene extends Phaser.Scene {

    /**
     * PrepareBattleScene constructor.
     */
    constructor () {
        super({ 'key' : 'PrepareBattleScene'});

        // Init Scene variables
        this.playersCount = 0;
        this.players = [];
        this.gamepadInitialized = false;

    }

    /**
     * Preload needed assets
     */
    preload () {



    }

    /**
     * Create PrepareBattleScene
     */
    create () {
        var scene = this;

        // Show PrepareBattleScene UI (not in Phaser to save time !)
        $('#PrepareBattleScene').show(0);

        // Listen for gamepad connexion
        this.input.gamepad.once('connected', this.initGamepads);
        if(this.input.gamepad.total > 0) { this.initGamepads(); }

    }

    /**
     * Init a gamepad
     * @param pad
     */
    initGamepads() {

        if(!this.input || !this.input.gamepad) {
            return;
        }

        // Gamepad are now ready !
        this.gamepadInitialized = true;

        // Init each gamepads
        for(var k in this.input.gamepad.gamepads) {
            let pad = this.input.gamepad.gamepads[k];

            // Only map inputs for X360 Controller
            if(pad.id !== 'Xbox 360 Controller (XInput STANDARD GAMEPAD)') {
                return;
            }
            console.gameLog('360 Controller connected (index: ' + pad.index + ')', 'gamepad');

            // Set mapping for pad
            pad.scene = this;
            pad.on('down', this.handlePlayerInputs);
        }

    }

    /**
     * Update PrepareBattleScene
     */
    update () {

        // Verify if gamepad are ready (why I can't do this in create ? >< )
        if(!this.gamepadInitialized && this.input.gamepad.total > 0) {
            this.initGamepads();
        }

    }

    /**
     * Call this to unload the scene
     */
    unload() {

        // Hide PrepareBattleScene UI
        $('#PrepareBattleScene').fadeOut(500);

    }

    /**
     * Mapping for controllers on PrepareBattleScene
     * @param buttonCode
     * @param value
     */
    handlePlayerInputs (buttonCode, value) {
        switch (buttonCode) {

            // Validate player is ready
            case Phaser.Input.Gamepad.Configs.XBOX_360.START:

                // Player join !
                if(this.playerId === undefined) {

                    // Assign pad
                    this.scene.playersCount += 1;
                    let playerId = this.scene.playersCount;
                    this.scene.players[playerId] = new Player(this.scene, this, playerId);
                    this.playerId = playerId;
                    console.gameLog('Player ' + this.playerId + ' has joined the game ! :)', 'PrepareBattleScene');

                }
                else {

                    // Start the game ! (need at least two players)
                    if(this.scene.playersCount >= 2) {
                        console.gameLog('START GAME !', 'PrepareBattleScene');
                        this.scene.unload();
                        let battleScene = this.scene.scene.get('BattleScene');
                        battleScene.setInitialPlayers(this.scene.players);
                        this.scene.scene.start('BattleScene');
                    }

                }

                // Update UI
                console.gameLog('Current number of players: ' + this.scene.playersCount, 'PrepareBattleScene');
                $('#PrepareBattleScene .players .player').removeClass('ready');
                for(let k in this.scene.players) {
                    $('#PrepareBattleScene .players .player' + this.scene.players[k].playerId).addClass('ready');
                }

                // Show START battle message or not
                if(this.scene.playersCount >= 2) {
                    $('#PrepareBattleScene .start_game_instruction').slideDown(500);
                    console.gameLog('Push START to begin the battle !', 'PrepareBattleScene');
                }
                else {
                    $('#PrepareBattleScene .start_game_instruction').slideUp(0);
                }

                break;

            // Do nothing for other key
            default:
                break;
        }
    }

}