
/**
 * StartScene
 */
class StartScene extends Phaser.Scene {

    /**
     * StartScene constructor.
     */
    constructor () {
        super({ 'key' : 'StartScene'});

    }

    /**
     * Preload needed assets
     */
    preload () {
    }

    /**
     * Create StartScene
     */
    create () {
        var scene = this;

        // Show StartScene UI (not in Phaser to save time !)
        $('#StartScene').show(0);

        // Listen for gamepad connexion
        this.input.gamepad.once('connected', this.initGamepads);
        if(this.input.gamepad.total > 0) { this.initGamepads(); }

    }

    /**
     * Init a gamepad
     * @param pad
     */
    initGamepads() {

        // Init each gamepads
        for(var k in this.gamepads) {
            let pad = this.gamepads[k];

            // Only map inputs for X360 Controller
            if(pad.id !== 'Xbox 360 Controller (XInput STANDARD GAMEPAD)') {
                continue;
            }
            console.gameLog('360 Controller connected (index: ' + pad.index + ')', 'gamepad');

            // Set mapping for pad
            pad.scene = this.scene;
            pad.on('down', this.scene.handlePlayerInputs);
        }

    }

    /**
     * Update StartScene
     */
    update () {

    }

    /**
     * Call this to unload the scene
     */
    unload() {

        // Hide StartScene UI
        $('#StartScene').fadeOut(500);

    }

    /**
     * Mapping for controllers on StartScene
     * @param buttonCode
     * @param value
     */
    handlePlayerInputs (buttonCode, value) {
        switch (buttonCode) {

            // Start the game !
            case Phaser.Input.Gamepad.Configs.XBOX_360.START:
                this.scene.unload();
                this.scene.scene.start('PrepareBattleScene');
                break;

            // Do nothing for other key
            default:
                break;
        }
    }

}