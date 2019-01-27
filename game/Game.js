/**
 * Game main file
 */

// Debug configuration
var debug = {
    enable: true,
    contexts: {
        'gamepad': false,
        'PrepareBattleScene': false,
        'BattleScene': true
    }
};

// Init global variable
var game;

// Wait for page to be fully loaded
(function($) {$(document).ready(function() {

    /**
     * Game
     */
    class Game extends Phaser.Game {

        /**
         * Game constructor.
         */
        constructor (config) {
            super(config);

            // Pause system
            this.paused = false;
            this.stopPauseScreen = undefined;

        }

        /**
         * Allow to pause the game or to resume it
         */
        changePauseGameState() {
            var self = this;

            // Pause the game !
            if(!this.paused) {
                this.paused = true;
                $('#pause_screen').fadeIn();

                // Start to listen for unpause using browser api (not phaser) because the game is paused
                // and do not catch for keydown anymore
                setTimeout(function(){
                    self.stopPauseScreen = setInterval(function(){
                        for(var i = 0; i <= 1; i++) {
                            // If one of the gamepad press start we unpaused the game
                            if(navigator.getGamepads()[i].buttons[9].pressed) {
                                clearInterval(stopPauseScreen);
                                self.changePauseGameState();
                            }
                        }
                    }, 10);
                }, 1000);

            }
            // Resume the game
            else {
                $('#pause_screen').fadeOut(function(){
                    self.paused = false;
                });
            }
        }

    }

    // Init Phaser game
    game = new Game({
        type: Phaser.AUTO,
        width: $('#game').width(),
        height: $('#game').height(),
        parent: 'game',
        input: {
            gamepad: true
        },
        physics: {
            default: 'arcade',
            arcade: {
                //debug: true
            }
        },
        scene: [
            LoadingScene,
            PauseScene,
            StartScene,
            PrepareBattleScene,
            BattleScene,
            FinishedBattleScreen
        ]
    });
    game.scene.start('StartScene');

});})(jQuery);

