/*
* CONSTANTS
*
* */

var keysPressed = {};
var gameCanvas;
var gameCTX;
var game;
var gameObjects = [];
/*
*
* Key activations
* */

$(document).ready(function(){
    window.onkeydown = function (e){
        keysPressed[e.key] = true;
    };
    window.onkeyup = function (e){
        keysPressed[e.key] = false;
    };

    gameCanvas = document.getElementById("game");
    gameCTX = gameCanvas.getContext("2d");

    game = new Game();

    game.draw(0);

    // window.requestAnimationFrame(function(time){
    //
    // });



});


/*
*
*   Maakt de game met alle attributen
*
*
* */

class Game{
    constructor(){
        this.hook = new Hook();
        this.oldTime = 0;

        var go = new GameObject();

        go.left = 195;
        go.top = 600;
        go.width = 10;
        go.height = 10;

        gameObjects.push(go);
    }

    /*
        Tekent de lijn
        Verwijdert game objects
     */
    draw(time)
    {
        clear(); // Reset de canvas

        for(var i=0;i<gameObjects.length; i++) {
            var go = gameObjects[i];
            if(go.top < 10){
                // Destroy object
                for(var i=0;i<this.hook.tookObjects.length; i++) {
                    //set score counter
                    if(this.hook.tookObjects[i] === go){
                        delete this.hook.tookObjects[i];
                    }
                }
                delete gameObjects[i];

            }
            go.draw(time); // tekent een gameobject
        }

        // console.log(this.oldTime);
        this.hook.handle(time-this.oldTime);

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
        this.left = 195;
        this.top = 600;
        this.width = 10;
        this.height = 10;
        this.color = "#0000FF";
    }

    draw(time){

        gameCTX.fillStyle= this.color;
        gameCTX.fillRect(this.left,this.top,this.width,this.height);
    }
}

class Hook{

    /*
    *
    * */
    constructor()
    {
        this.maxLineLength = 700;
        this.length = 0;
        this.down = false;
        this.up = false;
        this.stepSize = 10;
        this.time = 0;
        this.speed = this.maxLineLength / 2000; // anti lag berekening   : x aantal seconden 700/5000 * time
        this.tookObjects = [];
    }

    handle(time){
        this.stepSize = time * this.speed; // Hook speed

        /*
            If statement jungle om de hook de jusite richtign op te laten gaan

         */
        if(keysPressed[' ']){ // als de spatie is ingedrukt
            if(this.length > this.maxLineLength-this.stepSize) { // de line gaat terug als de max van 700 is berijkt anders gaat hij door
                this.length = 700;
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
                this.tookObjects[i].top = this.length;
            }


            if(this.length <= 0){
                this.up = false;
                this.length = 0;
            }
        }
        //Lijn naar beneden
        if(this.down){
            this.length += this.stepSize;
        }
        console.log(this.length);

        /*
        *                                                                                       DRAW THE HOOK IN THE CANVAS
        * */
        gameCTX.beginPath();
        gameCTX.moveTo(100,5);
        gameCTX.lineTo(100, this.length);
        gameCTX.stroke();
        this.checkCollision(200, this.length); // CHECK IF ITS A COLLISION


        // gameCTX.fillStyle = "";

    }

    /*
        Als een object geraakt wordt, neemt de haak hem mee
     */
    checkCollision(left, top){
        for(var i=0;i<gameObjects.length; i++){
            var go = gameObjects[i];
            if( left > go.left && left < go.left + go.width &&
                top > go.top && top < go.top + go.height ){
                // go.color = "#FF0000";
                this.tookObjects.push(go);
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