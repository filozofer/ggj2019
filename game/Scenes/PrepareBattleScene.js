
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
        this.playersReady = 0;
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

            // Retrieve pad
            let pad = this.input.gamepad.gamepads[k];
            console.gameLog('Pad connected (index: ' + pad.index + ')', 'gamepad');

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
        const currentPlayer = this.scene.players[this.playerId];
        // Player join on first input !
        if(this.playerId === undefined) {
            // Build new Player and assign pad (playerId = pad number)
            this.scene.playersCount += 1;
            let playerId = this.scene.playersCount;
            this.scene.players[playerId] = new Player(this.scene, this, playerId);
            this.playerId = playerId;
            this.scene.players[this.playerId].ready = false;
            console.gameLog('Player ' + this.playerId + ' has joined the game ! :)', 'PrepareBattleScene');

            // Pass player to inputs mapping UI
            $('#PrepareBattleScene .players .player' + this.playerId).removeClass('join').addClass('inputs_mapping');
        }
        // Pass Player to ready state if player press his start button after mapping defined
        else if(buttonCode === currentPlayer.inputsMapping['START'] && currentPlayer.ready === false) {
            currentPlayer.ready = true;
            this.scene.playersReady += 1;
            $('#PrepareBattleScene .players .player' + this.playerId).removeClass('inputs_mapping').addClass('ready');
        }
        // Quit ready state on any input different from the player start button
        else if(currentPlayer.ready === true && buttonCode !== currentPlayer.inputsMapping['START']) {
            currentPlayer.ready = false;
            this.scene.playersReady -= 1;
            $('#PrepareBattleScene .players .player' + this.playerId).removeClass('ready').addClass('inputs_mapping');
        }
        // Start the game if player press his start button when there are at least two players ready
        else if(currentPlayer.ready === true && buttonCode === currentPlayer.inputsMapping['START']) {
            if(this.scene.playersReady >= 1 && this.scene.playersReady === this.scene.playersCount) {
                console.gameLog('START GAME !', 'PrepareBattleScene');
                this.scene.unload();
                let battleScene = this.scene.scene.get('BattleScene');
                this.scene.players[2] = this.scene.players[1];
                battleScene.setInitialPlayers(this.scene.players);
                this.scene.scene.start('BattleScene');
            }
        }
        // For any other button press
        else {
            // If player press any button when mapping his ready
            if(currentPlayer.currentInputMappingSelected === null) {
                // Then reset his mapping to allow him to change it
                currentPlayer.resetInputMapping();
                $('#PrepareBattleScene .players .player' + this.playerId + ' .input').removeClass('ready');
                $('#PrepareBattleScene .player.inputs_mapping .mapping_not_complete').show(0);
                $('#PrepareBattleScene .player.inputs_mapping .mapping_ready').hide(0);
            }
            // Else define the button press as one of his mapping inputs and pass to next input to define
            else {
                // Do nothing if player has already use this button
                if(Object.values(currentPlayer.inputsMapping).indexOf(buttonCode) >= 0) {
                    return;
                }

                // Define the button press as one of his mapping inputs
                $('#PrepareBattleScene .players .player' + this.playerId + ' .input.' + currentPlayer.currentInputMappingSelected).addClass('ready');
                currentPlayer.inputsMapping[currentPlayer.currentInputMappingSelected] = buttonCode;
                currentPlayer.passToNextInputMapping();

                // Pass to ready state text ?
                if(currentPlayer.currentInputMappingSelected === null) {
                    $('#PrepareBattleScene .player.inputs_mapping .mapping_not_complete').hide(0);
                    $('#PrepareBattleScene .player.inputs_mapping .mapping_ready').show(0);
                }
            }
        }

        // Show START battle message or not when player are ready
        if(this.scene.playersReady >= 2) {
            $('#PrepareBattleScene .start_game_instruction:not(:visible):not(:animated)').slideDown(500);
            console.gameLog('Push START to begin the battle !', 'PrepareBattleScene');
        }
        else {
            $('#PrepareBattleScene .start_game_instruction:visible:not(:animated)').slideUp(0);
        }

    }

}