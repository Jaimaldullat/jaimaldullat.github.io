(function () {



    // Create a new system
    var canvas = document.getElementById('back-canvas'),
        can_w = parseInt(canvas.getAttribute('width')),
        can_h = parseInt(canvas.getAttribute('height')),
        ctx = canvas.getContext('2d');


    var ball = {
            x: 0,
            y: 0,
            vx: 0,
            vy: 0,
            r: 0,
            alpha: 1,
            phase: 0
        },
        ball_color = {
            r: 229,
            g: 27,
            b: 35
        },
        R = 3,
        balls = [],
        alpha_f = 0.03,
        alpha_phase = 0,

        // Line
        link_line_width = 0.8,
        dis_limit = 260,
        add_mouse_point = true,
        mouse_in = false,
        mouse_ball = {
            x: 0,
            y: 0,
            vx: 0,
            vy: 0,
            r: 0,
            type: 'mouse'
        };

    // Mouse effect
    canvas.addEventListener('mouseenter', function () {
        console.log('mouseenter');
        mouse_in = true;
        balls.push(mouse_ball);
    });
    canvas.addEventListener('mouseleave', function () {
        console.log('mouseleave');
        mouse_in = false;
        var new_balls = [];
        Array.prototype.forEach.call(balls, function (b) {
            if (!b.hasOwnProperty('type')) {
                new_balls.push(b);
            }
        });
        balls = new_balls.slice(0);
    });
    canvas.addEventListener('mousemove', function (e) {
        var e = e || window.event;
        mouse_ball.x = e.pageX;
        mouse_ball.y = e.pageY;
        // console.log(mouse_ball);
    });


    const drawBackground = () => {

// Canvas Background
        var TWO_PI = Math.PI * 2;
        var HALF_PI = Math.PI * 0.5;
        var THICKNESS = 12;
        var LENGTH = 10;
        var STEP = 0.1;
        var FPS = 1000 / 60;
    }

    const Particle = (x, y, mass) => {

        this.x = x || 0;
        this.y = y || 0;
        this.ox = this.x;
        this.oy = this.y;
        this.mass = mass || 1.0;
        this.massInv = 1.0 / this.mass;
        this.fixed = false;

        this.update = function (dt) {
            if (!this.fixed) {
                var fx = 0.0000;
                var fy = 0.0000;
                var tx = this.x,
                    ty = this.y;

                this.x += (this.x - this.ox) + fx * this.massInv * dt * dt;
                this.y += (this.y - this.oy) + fy * this.massInv * dt * dt;
                this.ox = tx;
                this.oy = ty;
            }
        };
    };


    const Spring = (p1, p2, restLength, strength) => {

        this.p1 = p1;
        this.p2 = p2;
        this.restLength = restLength || 10;
        this.strength = strength || 1.0;

        this.update = function (dt) {

            // Compute desired force
            var dx = p2.x - p1.x,
                dy = p2.y - p1.y,
                dd = Math.sqrt(dx * dx + dy * dy) + 0.0001,
                tf = (dd - this.restLength) / (dd * (p1.massInv + p2.massInv)) * this.strength,
                f;

            // Apply forces
            if (!p1.fixed) {
                f = tf * p1.massInv;
                p1.x += dx * f;
                p1.y += dy * f;
            }

            if (!p2.fixed) {
                f = -tf * p2.massInv;
                p2.x += dx * f;
                p2.y += dy * f;
            }
        }
    };


    const Sim = () => {

        this.particles = [];
        this.springs = [];

        this.tick = function (dt) {

            var i, n;

            for (i = 0, n = this.springs.length; i < n; ++i) {
                this.springs[i].update(dt);
            }

            for (i = 0, n = this.particles.length; i < n; ++i) {
                this.particles[i].update(dt);
            }
        }
    };

// Random speed
    const getRandomSpeed = (pos) => {
        var min = -1,
            max = 1;
        switch (pos) {
            case 'top':
                return [randomNumFrom(min, max), randomNumFrom(0.1, max)];
                break;
            case 'right':
                return [randomNumFrom(min, -0.1), randomNumFrom(min, max)];
                break;
            case 'bottom':
                return [randomNumFrom(min, max), randomNumFrom(min, -0.1)];
                break;
            case 'left':
                return [randomNumFrom(0.1, max), randomNumFrom(min, max)];
                break;
            default:
                return;
                break;
        }
    };

    const randomArrayItem = (arr) => {
        return arr[Math.floor(Math.random() * arr.length)];
    };

    const randomNumFrom = (min, max) => {
        return Math.random() * (max - min) + min;
    };

// Random Ball
    const getRandomBall = () => {
        var pos = randomArrayItem(['top', 'right', 'bottom', 'left']);
        switch (pos) {
            case 'top':
                return {
                    x: randomSidePos(can_w),
                    y: -R,
                    vx: getRandomSpeed('top')[0],
                    vy: getRandomSpeed('top')[1],
                    r: R,
                    alpha: 1,
                    phase: randomNumFrom(0, 10)
                }
                break;
            case 'right':
                return {
                    x: can_w + R,
                    y: randomSidePos(can_h),
                    vx: getRandomSpeed('right')[0],
                    vy: getRandomSpeed('right')[1],
                    r: R,
                    alpha: 1,
                    phase: randomNumFrom(0, 10)
                }
                break;
            case 'bottom':
                return {
                    x: randomSidePos(can_w),
                    y: can_h + R,
                    vx: getRandomSpeed('bottom')[0],
                    vy: getRandomSpeed('bottom')[1],
                    r: R,
                    alpha: 1,
                    phase: randomNumFrom(0, 10)
                }
                break;
            case 'left':
                return {
                    x: -R,
                    y: randomSidePos(can_h),
                    vx: getRandomSpeed('left')[0],
                    vy: getRandomSpeed('left')[1],
                    r: R,
                    alpha: 1,
                    phase: randomNumFrom(0, 10)
                }
                break;
        }
    }

    const randomSidePos = (length) => {
        return Math.ceil(Math.random() * length);
    }

// Draw Ball
    const renderBalls = () => {
        Array.prototype.forEach.call(balls, function (b) {
            if (!b.hasOwnProperty('type')) {
                ctx.fillStyle = 'rgba(' + ball_color.r + ',' + ball_color.g + ',' + ball_color.b + ',' + b.alpha + ')';
                ctx.beginPath();
                ctx.arc(b.x, b.y, R, 0, Math.PI * 2, true);
                ctx.closePath();
                ctx.fill();
            }
        });
    };

// Update balls
    const updateBalls = () => {
        var new_balls = [];
        Array.prototype.forEach.call(balls, function (b) {
            b.x += b.vx;
            b.y += b.vy;

            if (b.x > -(50) && b.x < (can_w + 50) && b.y > -(50) && b.y < (can_h + 50)) {
                new_balls.push(b);
            }

            // alpha change
            b.phase += alpha_f;
            b.alpha = Math.abs(Math.cos(b.phase));
            // console.log(b.alpha);
        });

        balls = new_balls.slice(0);
    };


// Draw lines
    const renderLines = () => {
        var fraction, alpha;
        for (var i = 0; i < balls.length; i++) {
            for (var j = i + 1; j < balls.length; j++) {

                fraction = getDisOf(balls[i], balls[j]) / dis_limit;

                if (fraction < 1) {
                    alpha = (1 - fraction).toString();

                    ctx.strokeStyle = 'rgba(150,150,150,' + alpha + ')';
                    ctx.lineWidth = link_line_width;

                    ctx.beginPath();
                    ctx.moveTo(balls[i].x, balls[i].y);
                    ctx.lineTo(balls[j].x, balls[j].y);
                    ctx.stroke();
                    ctx.closePath();
                }
            }
        }
    };


// calculate distance between two points
    const getDisOf = (b1, b2) => {
        var delta_x = Math.abs(b1.x - b2.x),
            delta_y = Math.abs(b1.y - b2.y);

        return Math.sqrt(delta_x * delta_x + delta_y * delta_y);
    }

// add balls if there a little balls
    const addBallIfy = () => {
        if (balls.length < 20) {
            balls.push(getRandomBall());
        }
    }

// Render
    const render = () => {
        ctx.clearRect(0, 0, can_w, can_h);

        renderBalls();

        renderLines();

        updateBalls();

        addBallIfy();

        window.requestAnimationFrame(render);
    };


// Init Balls
    const initBalls = (num) => {
        for (var i = 1; i <= num; i++) {
            balls.push({
                x: randomSidePos(can_w),
                y: randomSidePos(can_h),
                vx: getRandomSpeed('top')[0],
                vy: getRandomSpeed('top')[1],
                r: R,
                alpha: 1,
                phase: randomNumFrom(0, 10)
            });
        }
    }
// Init Canvas
    const initCanvas = () => {
        canvas.setAttribute('width', window.innerWidth);
        canvas.setAttribute('height', window.innerHeight);

        can_w = parseInt(canvas.getAttribute('width'));
        can_h = parseInt(canvas.getAttribute('height'));
    };


    window.addEventListener('resize', function (e) {
        initCanvas();
    });

    const goMovie = () => {
        initCanvas();
        initBalls(30);
        window.requestAnimationFrame(render);
    }
    goMovie();

})();


// Wrap each word in span
( function( $ ) {

    $.fn.spanLetters = function() {

        // Loop through each element on which this function has been called
        this.each( function() {

            // Make an array with each words of the string as a value
            var words = $( this ).text().trim().split( ' ' );

            // Loop through the words and wrap each one in a span
            for ( i = 0; i in words; i++ ) {
                var letters = [];
                for(let x = 0; x < words[i].length; x++)
                {
                    letters[x] =  '<span>' + words[i][x] + '</span>';
                }
                words[i] = '<span class="sl' + (i + 1) + ' span-word">' + letters.join('') + '</span>'
            };

            // Join our array of span-wrapped words back into a string
            var text = words.join( ' ' );

            // Replace the original string with the new string
            $( this ).html( text );
        })
    }


    jQuery('.container .intro h1.title').spanLetters();
}( jQuery ));