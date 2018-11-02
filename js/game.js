/*
* CONSTANTS
* https://www.spriters-resource.com/arcade/ms6/sheet/46760/
* http://spite.github.io/
* */

var keysPressed = {}; // object waar alle input inkomt te staan
var gameCanvas;
var gameCTX;
var game;
var gameObjects = [];

/*
*
* Key activations
* */

$(document).ready(function(){
    /**
     *  Registreerd de key input
     */
    window.onkeydown = function (e){
        keysPressed[e.key] = true;
    };
    window.onkeyup = function (e){
        keysPressed[e.key] = false;
    };

    /**
     *  Bouwt een canvas
     */
    gameCanvas = document.getElementById("game");
    gameCTX = gameCanvas.getContext("2d");

    game = new Game();


    /**
     * Maakt spelers aan
     */
    var user1 = new User();
        user1.setPlayerNumber(1);
        user1.leftButton = "a";
        user1.downButton = "s";
        user1.rightButton = "d";
    game.addUser(user1);

    var user2 = new User();
        user2.setPlayerNumber(2);
        user2.leftButton = "ArrowLeft";
        user2.downButton = "ArrowDown";
        user2.rightButton = "ArrowRight";
    game.addUser(user2);

    /**
     * derde gebruiker
     */
    // var user3 = new User();
    // user3.setPlayerNumber(3);
    // user3.leftButton = "f";
    // user3.downButton = "g";
    // user3.rightButton = "h";
    // game.addUser(user3);




    game.draw(0);
});

class User{


    /**
     * Default waarden user
     */
    constructor() {
        this.score = 0;
        this.playerNumber = 1;
        this.hook = new Hook(this);

        this.element = document.createElement("h1");
        this.element.innerText = 0;


        this.leftButton = "a";
        this.downButton = "s";
        this.rightButton = "d";

        $("#players").append($(this.element));
    }

    setPlayerNumber(nr){
        this.playerNumber = nr;
        this.updateScore(0);
    }
    /**
     * Update een score voor  user
     */
    updateScore(score){
        this.score += score;
        $(this.element).text("Player "+this.playerNumber + ": " +this.score);

    }
}


/*
*
*   Maakt de game met alle attributen
*
*
* */

class Game{
    constructor(){
        this.oldTime = 0;
        this.totalPoints = 0;
        // this.totalPointsDiv = document.getElementById("total");


        /**
         *  Zet random objecten neer in de canvas
         */
        var go;
        for (let i = 0; i < 25; i++) {
            go = new GameObject();
                go.left = Math.floor(Math.random() * 1160);
                go.top = Math.floor(Math.random() * 660)+ 100;
                go.id = new Date().getTime()+i;
            gameObjects.push(go);
        }


        this.users = [];
    }

    addUser(user){
        this.users.push(user);
    }
    /*
        Tekent de lijn
        Verwijdert game objects
     */
    draw(time)
    {

        /**
         * Set total points voor de game, wanneer dit 0 berijkt is het game over
         */
        clear(); // Reset de canvas
        this.totalPoints = 0;
        for(var i=0;i<gameObjects.length; i++) {
            if(!gameObjects[i]) continue;
            var go = gameObjects[i];
            this.totalPoints += go.value;
            go.draw(time); // tekent een gameobject

        }

        // this.totalPointsDiv.innerHTML = this.totalPoints;

        /**
         * Check als de game gewonnen is
         */
        if(this.totalPoints === 0){
            var winner = this.users[0];
            for (let i = 0; i < this.users.length; i++) {
                if(winner.score < this.users[i].score){
                    winner = this.users[i];
                }
            }
            alert('Game over!\n Player ' + winner.playerNumber + " wins");
            return;
        }

        for (let i = 0; i < this.users.length; i++) {
            this.users[i].hook.handle(time-this.oldTime);
        }

        /*
        Loop voor animatie
         */
        this.oldTime = time;
        window.requestAnimationFrame(function(time){
            game.draw(time);
        });
    }

}

class GameObject{
    /*
        Bouwt een object
     */
    constructor(){
        this.left = 200;
        this.top = 600;
        this.width = Math.floor(Math.random() * 60) + 15;
        this.height = this.width;
        this.img = null;
        this.img = new Image();

        if(this.width < 25) {

            this.img.src = "media/img/diamond.png";
        }else if(this.width > 40){
            this.img.src = "media/img/rock.png";

        }else{
            this.img.src = "media/img/copper.png";
        }


        this.taken = false;
        this.value = 250 - ( this.width * 3 );
        this.id = 0;
    }

    draw(){

        gameCTX.drawImage(this.img, this.left, this.top, this.width, this.height);
    }
}

class Hook{

    /*
    * Default waarden voor de hook
    * */
    constructor(user)
    {
        this.maxLineLength = 800;
        this.length = 0;
        this.down = false;
        this.up = false;
        this.stepSize = 10;
        this.speed = this.maxLineLength / 2000; // anti lag berekening   : x aantal seconden 700/5000 * time
        this.tookObjects = [];
        this.hookPosition = 10;
        this.user = user;

        this.image = new Image();
        this.image.src = "media/img/rope.png";

        this.arrow = $("<div class=\"fa fa-caret-down hook-position\"></div>");
        $("#playerView").append(this.arrow);
    }

    /**
     * De tijd geeft mee hoe lang de hook er over doet om naar de bodem te komen, fps zie berekening speed
     */
    handle(time){
        this.stepSize = time * this.speed; // Hook speed
        /*
            controller voor de beweging van de hook
        * */

        if(keysPressed[this.user.rightButton]  && !keysPressed[this.user.downButton] && !this.up){
            this.hookPosition += this.stepSize


        }else if(keysPressed[this.user.leftButton] && !keysPressed[this.user.downButton] && !this.up)
        {
            if(this.hookPosition >5)
            {
                this.hookPosition -= this.stepSize;
            }
        }

        /*
          If statement jungle om de hook de jusite richtign op te laten gaan

       */
        if(keysPressed[this.user.downButton]){ // als de spatie is ingedrukt
            if(this.length > this.maxLineLength-this.stepSize) { // de line gaat terug als de max van 700 is berijkt anders gaat hij door
                this.length = this.maxLineLength;
                this.up = true;
                this.down = false;
            }else{
                this.down = true;
            }
        }else if(this.down){
            this.up = true;
            this.down = false;
        }
        //Lijn terug laten gaan naar boven
        if(this.up){
            this.length -= this.stepSize;

            for(var i=0;i<this.tookObjects.length; i++){
                if(!this.tookObjects[i]) continue;
                if(this.tookObjects[i].top > this.length){
                    this.tookObjects[i].top = this.length;
                }
            }


            /**
             * Verwijdert een blokje wanneer de lengte 0 is
             */
            if(this.length <= 0){
                this.up = false;
                this.length = 0;

                for(var i=0;i<this.tookObjects.length; i++){
                    if(!this.tookObjects[i]) continue;

                    this.user.updateScore(this.tookObjects[i].value);


                    for(var j=0;j<gameObjects.length; j++) {
                        if (!gameObjects[j]) continue;

                        if(gameObjects[j].id === this.tookObjects[i].id){
                            delete gameObjects[j];
                        }
                    }

                    delete this.tookObjects[i];
                }
            }

        }
        //Lijn naar beneden
        if(this.down){
            this.length += this.stepSize;
        }

        /*
        *                                                                                       DRAW THE HOOK IN THE CANVAS
        * */
        gameCTX.drawImage(this.image, this.hookPosition-10, 5, 20, this.length);
        // gameCTX.beginPath();
        // gameCTX.moveTo(this.hookPosition,5);
        // gameCTX.lineTo(this.hookPosition, this.length);
        // gameCTX.stroke();
        this.arrow.css({left: this.hookPosition-3+"px"});
        // this.arrow.left();

        /**
         * Checkt voor een overlapping met de hook
         */
        this.checkCollision(this.hookPosition, this.length); // CHECK IF ITS A COLLISION

    }

    /*
        Als een object geraakt wordt, neemt de haak hem mee
     */
    checkCollision(left, top){
        for(var i=0;i<gameObjects.length; i++){
            if(!gameObjects[i]) continue;
            var go = gameObjects[i];
            if( left > go.left && left < go.left + go.width &&
                top > go.top && top < go.top + go.height  &&
                !go.taken){

                this.tookObjects.push(go);

                gameObjects[i].taken = true;
            }
        }
    }
}

/*
      *                                                                                       CLEAN THE CANVAS
      * */
function clear(){
    gameCTX.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
}



