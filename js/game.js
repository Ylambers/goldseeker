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
// var user;

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

    // user = new User();


    // window.requestAnimationFrame(function(time){
    //
    // });
});

class User{

    constructor() {
        this.score = 0;
        this.hook = new Hook(this);

        this.element = $("h1");
        this.element.innerText = 0;


        this.leftButton = "a";
        this.downButton = "s";
        this.rightButton = "d";

        $("#players").append(this.element);

        var img = $('img');
        img.src = "";
        $("#playerView").append(img);


        // document.getElementById("players").appendChild(this.element);
    }

    showScore(){
        return this.score;
    }

    updateScore(score){
        // console.log(this);
        this.score += score;
        this.element.text(this.score);

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
        this.totalPointsDiv = document.getElementById("total");

        var go;
        for (let i = 0; i < 30; i++) {
            go = new GameObject();
                go.left = Math.floor(Math.random() * 1160);
                go.top = Math.floor(Math.random() * 660)+ 100;
                go.id = new Date().getTime()+i;
            gameObjects.push(go);
        }

        var user1 = new User();
            user1.leftButton = "a";
            user1.downButton = "s";
            user1.rightButton = "d";

        var user2 = new User();
            user2.leftButton = "ArrowLeft";
            user2.downButton = "ArrowDown";
            user2.rightButton = "ArrowRight";

        this.users = [user1, user2];

        console.log(this.users);
    }

    /*
        Tekent de lijn
        Verwijdert game objects
     */
    draw(time)
    {
        clear(); // Reset de canvas
        this.totalPoints = 0;
        for(var i=0;i<gameObjects.length; i++) {
            if(!gameObjects[i]) continue;
            var go = gameObjects[i];
            this.totalPoints += go.value;
            go.draw(time); // tekent een gameobject
        }

        // console.log(this.oldTime);
        for (let i = 0; i < this.users.length; i++) {
            this.users[i].hook.handle(time-this.oldTime);
        }

        this.totalPointsDiv.innerHTML = this.totalPoints;
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
        this.width = Math.floor(Math.random() * 40) + 10;
        this.height = this.width;
        this.img = null;
        if(this.width < 20){
        }
        this.img = new Image();
        this.img.src = "media/img/copper.png";

        this.color = "#ff9832";
        this.taken = false;
        this.value = 150 - this.width - this.height;
        this.id = 0;
    }

    draw(){

        // gameCTX.fillStyle= this.color;
        // gameCTX.fillRect(this.left,this.top,this.width,this.height);
        gameCTX.drawImage(this.img, this.left, this.top, this.width, this.height);
    }
}

class Hook{

    /*
    *
    * */
    constructor(user)
    {
        this.maxLineLength = 800;
        this.length = 0;
        this.down = false;
        this.up = false;
        this.stepSize = 10;
        this.time = 0;
        this.speed = this.maxLineLength / 2000; // anti lag berekening   : x aantal seconden 700/5000 * time
        this.tookObjects = [];
        this.hookPosition = 10;
        this.user = user;
    }

    handle(time){
        this.stepSize = time * this.speed; // Hook speed
        /*
            controller voor de beweging van de hook
        * */

        if(keysPressed[this.user.rightButton]  && !keysPressed[this.user.downButton] && !this.up){
            this.hookPosition += this.stepSize;
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
                // this.tookObjects[i].left = this.hookPosition;
            }


            if(this.length <= 0){
                this.up = false;
                this.length = 0;

                for(var i=0;i<this.tookObjects.length; i++){
                    if(!this.tookObjects[i]) continue;

                    // this.tookObjects[i].top = this.length;
                    // this.tookObjects[i].left = this.hookPosition;
                    this.user.updateScore(this.tookObjects[i].value);


                    for(var j=0;j<gameObjects.length; j++) {
                        if (!gameObjects[j]) continue;

                        if(gameObjects[j].id === this.tookObjects[i].id){
                            delete gameObjects[j];
                            // gameObjects.splice(j,1);
                        }
                    }

                    // this.tookObjects.splice(i,1);
                    delete this.tookObjects[i];
                }
            }

        }
        //Lijn naar beneden
        if(this.down){
            this.length += this.stepSize;
        }
        // console.log(this.length);

        /*
        *                                                                                       DRAW THE HOOK IN THE CANVAS
        * */
        gameCTX.beginPath();
        gameCTX.moveTo(this.hookPosition,5);
        gameCTX.lineTo(this.hookPosition, this.length);
        gameCTX.stroke();


        this.checkCollision(this.hookPosition, this.length); // CHECK IF ITS A COLLISION

        // gameCTX.fillStyle = "";
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



                // console.log(user.showScore());
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



