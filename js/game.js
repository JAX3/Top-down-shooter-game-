// config  <script src="class/Classes.js" type="text/javascript"></script>  
var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update,
        extend: {
            player: null,
            healthpoints: '10',
            reticle: null,
            moveKeys: null,
            playerBullets: null,
            enemyBullets: null,
            time: 0,
        }
    }
};
var game = new Phaser.Game(config);

function preload() {
    this.load.image('tileset', 'img/scifitiles-sheet.png');
    this.load.tilemapTiledJSON('tilemap', 'img/level.json');
    this.load.image('player', 'img/player_shoot.png');
    //this.load.spritesheet('enemy', 'img/enemy.png', { frameWidth: 24, frameHeight: 24 });
    this.load.image('target', 'img/cursor.png');

    this.load.image('bullet', 'img/bullet.png');
}




var Bullet = new Phaser.Class({

    Extends: Phaser.GameObjects.Image,

    initialize:

        // Bullet Constructor
        function Bullet(scene) {
            Phaser.GameObjects.Image.call(this, scene, 0, 0, 'bullet');
            this.speed = 1;
            this.born = 0;
            this.direction = 0;
            this.xSpeed = 0;
            this.ySpeed = 0;
            this.setSize(12, 12, true);
        },
    fire: function (shooter, target) {
        this.setPosition(shooter.x, shooter.y); // Initial position
        this.direction = Math.atan((target.x - this.x) / (target.y - this.y));

        // Calculate X and y velocity of bullet to moves it from shooter to target
        if (target.y >= this.y) {
            this.xSpeed = this.speed * Math.sin(this.direction);
            this.ySpeed = this.speed * Math.cos(this.direction);
        }
        else {
            this.xSpeed = -this.speed * Math.sin(this.direction);
            this.ySpeed = -this.speed * Math.cos(this.direction);
        }

        this.rotation = shooter.rotation; // angle bullet with shooters rotation
        this.born = 0; // Time since new bullet spawned
    },

    update: function (time, delta) {
        this.x += this.xSpeed * delta;
        this.y += this.ySpeed * delta;
        this.born += delta;
        if (this.born > 1800) {
            this.setActive(false);
            this.setVisible(false);
        }
    }

});

function create() {
    // Set world bounds
    this.physics.world.setBounds(0, 0, 1600, 1200);
    this.map = this.make.tilemap({ key: "tilemap" });
    var landscape = this.map.addTilesetImage("scifitiles-sheet", "tileset");
    this.map.createStaticLayer('ground', landscape, 0, 0);
    var destructLayer = this.map.createStaticLayer('walls', landscape, 0, 0);
    destructLayer.setCollisionByProperty({ collides: true });
    this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    // Add 2 groups for Bullet objects
    playerBullets = this.physics.add.group({ classType: Bullet, runChildUpdate: true });
    enemyBullets = this.physics.add.group({ classType: Bullet, runChildUpdate: true });
    createPlayer.call(this);
    this.cameras.main.startFollow(player, true, 0.5, 0.5);
    enemy = this.physics.add.sprite(300, 600, 'enemy');
    reticle = this.physics.add.sprite(800, 700, 'target');



    enemy.setOrigin('landscape', enemy.X, enemy.Y).setCollideWorldBounds(true);





    // Set sprite variables
    player.health = 3;
    enemy.health = 3;
    enemy.lastFired = 0;



    // Set camera properties

    cursors = this.input.keyboard.createCursorKeys();



    // Fires bullet from player on left click of mouse
    this.input.on('pointerdown', function (pointer, time, lastFired) {
        if (player.active === false)
            return;

        // Get bullet from bullets group
        var bullet = playerBullets.get().setActive(true).setVisible(true);

        if (bullet) {
            bullet.fire(player, reticle);
           // player.anims.play('shoot', true);
            this.physics.add.collider(enemy, bullet, enemyHitCallback);
        }
    }, this);

    // Fires bullet from player on left click of mouse
    this.input.on('pointerdown', function (pointer, time, lastFired) {
        if (player.active === false)
            return;

        // Get bullet from bullets group
        var bullet = playerBullets.get().setActive(true).setVisible(true);

        if (bullet) {
            bullet.fire(player, reticle);
            this.physics.add.collider(enemy, bullet, enemyHitCallback);
        }
    }, this);

    // Pointer lock will only work after mousedown
    game.canvas.addEventListener('mousedown', function () {
        game.input.mouse.requestPointerLock();
    });

    // Exit pointer lock when Q or escape (by default) is pressed.
    this.input.keyboard.on('keydown_Q', function (event) {
        if (game.input.mouse.locked)
            game.input.mouse.releasePointerLock();
    }, 0, this);

    // Move reticle upon locked pointer move
    this.input.on('pointermove', function (pointer) {
        if (this.input.mouse.locked) {
            reticle.x += pointer.movementX;
            reticle.y += pointer.movementY;
        }
    }, this);


}







function enemyHitCallback(enemyHit, bulletHit) {
    // Reduce health of enemy
    if (bulletHit.active === true && enemyHit.active === true) {
        enemyHit.health = enemyHit.health - 1;
        console.log("Enemy hp: ", enemyHit.health);

        // Kill enemy if health <= 0
        if (enemyHit.health <= 0) {
            enemyHit.setActive(false).setVisible(false);
        }

        // Destroy bullet
        bulletHit.setActive(false).setVisible(false);
    }
}
function playerHitCallback(playerHit, bulletHit) {
    var health = player.health;
    // Reduce health of player
    if (bulletHit.active === true && playerHit.active === true) {
        playerHit.health = playerHit.health - 1;
        // health.setText('Hp: ' = player.health - 1);

        // Kill hp sprites and kill player if health <= 0
        if (playerHit.health == 2) {
            // health.setText('Hp: ' = player.health - 1);
        }
        else if (playerHit.health == 1) {
            // health.setText('Hp: ' = player.health - 1);
        }
        else {

            // health.setText('Hp: ' = ' 0 ' );
        }

        // Destroy bullet
        bulletHit.setActive(false).setVisible(false);
    }

}
function enemyFire(enemy, player, time, gameObject) {
    if (enemy.active === false) {
        return;
    }

    if ((time - enemy.lastFired) > Math.random()) {
        enemy.lastFired = time;

        // Get bullet from bullets group
        var bullet = enemyBullets.get().setActive(true).setVisible(true);

        if (bullet) {
            bullet.fire(enemy, player);
            // Add collider between bullet and player

            gameObject.physics.add.collider(player, bullet, playerHitCallback);
        }
    }
}





function createPlayer(playerspawn) {
    player = this.physics.add.sprite(80.00, 980.00, 'players_idle', 4);
    player.setCollideWorldBounds(true);
    createPlayerAnimations.call(this);
}
function createPlayerAnimations() {
    this.anims.create({
        key: 'walk',
        frames: this.anims.generateFrameNumbers('player_walk'),
        frameRate: 15,
        repeat: -1
    });

    this.anims.create({
        key: 'idle',
        frames: this.anims.generateFrameNumbers('player_idle'),
        frameRate: 3,
        repeat: -1
    });


    this.anims.create({
        key: 'shoot',
        frames: this.anims.generateFrameNumbers('player', { frames: [2, 2] }),
        frameRate: 3,
        repeat: -1
    });

}



function update(time, delta) {

    const speed = 175;
    const prevVelocity = player.body.velocity.clone();
    player.body.setVelocity(0);
    //horizontal
    if (cursors.left.isDown) {
        player.body.setVelocityX(-speed);
        player.anims.play('walk', true);

    } else if (cursors.right.isDown) {
        player.body.setVelocityX(speed);
        player.anims.play('walk', true);
    }

    //vertical
    if (cursors.up.isDown) {
        player.body.setVelocityY(-speed);
        player.anims.play('walk', true);
    } else if (cursors.down.isDown) {
        player.body.setVelocityY(speed);
        player.anims.play('walk', true);
    }



    player.body.velocity.normalize().scale(speed);




    // Rotates player to face towards reticle
    player.rotation = Phaser.Math.Angle.Between(player.x, player.y, reticle.x, reticle.y);

    // Rotates enemy to face towards player
    enemy.rotation = Phaser.Math.Angle.Between(enemy.x, enemy.y, player.x, player.y);

    //Make reticle move with player
    reticle.body.velocity.x = player.body.velocity.x;
    reticle.body.velocity.y = player.body.velocity.y;



    // Make enemy fire
    enemyFire.call(this, enemy, player, time, this);
}

