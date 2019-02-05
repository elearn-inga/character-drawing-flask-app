var canvas = document.getElementById("paint");
var ctx = canvas.getContext("2d");
var width = canvas.width;
var height = canvas.height;
var curX, curY, prevX, prevY;
var hold = false;
var max_lineWidth = 20;
var min_lineWidth = 1;
var min_movement = 5;
ctx.lineCap = "butt";
ctx.lineJoin = "miter";
ctx.miterLimit = 100;
var canvas_data = {"pencil": [], "eraser": []}
document.getElementById("line_width").innerHTML = max_lineWidth
document.getElementById("count").innerHTML = 0


function color(color_value){
    ctx.strokeStyle = color_value;
    ctx.fillStyle = color_value;
}

function add_pixel(){
    max_lineWidth += 1;
    document.getElementById("line_width").innerHTML = max_lineWidth
}

function reduce_pixel(){
    max_lineWidth = Math.max(1, max_lineWidth - 1)
    document.getElementById("line_width").innerHTML = max_lineWidth
}

function reset(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// pencil tool

function pencil(){

    canvas.onmousedown = function(e){
        curX = e.clientX - canvas.offsetLeft;
        curY = e.clientY - canvas.offsetTop;
        hold = true;
        prevX = curX;
        prevY = curY;
        window.setInterval(function(){
            if (Math.abs(prevX - curX) > min_movement || Math.abs(prevY - curY) > min_movement){
                ctx.beginPath();
                ctx.moveTo(prevX, prevY);

                scaler = Math.pow(Math.cos((Math.atan2((curX - prevX), (curY - prevY)) - Math.PI / 4)), 2);

                ctx.lineWidth = Math.max(min_lineWidth, max_lineWidth * scaler);
                ctx.lineTo(curX, curY);
                ctx.stroke();
                draw();
                ctx.closePath();
            }
        }, 1);
    };

    canvas.onmousemove = function(e){
        if(hold){
            curX = e.clientX - canvas.offsetLeft;
            curY = e.clientY - canvas.offsetTop;
        }
    };

    canvas.onmouseup = function(e){
        clearInterval()
        hold = false;
    };

    canvas.onmouseout = function(e){
        clearInterval()
        hold = false;
        ctx.putIm
    };

    function draw(){
        canvas_data.pencil.push({ "startx": prevX, "starty": prevY, "endx": curX, "endy": curY, "thick": ctx.lineWidth, "color": ctx.strokeStyle });
        prevX = curX;
        prevY = curY;
    }
}


// eraser tool

function eraser(){

    canvas.onmousedown = function(e){
        curX = e.clientX - canvas.offsetLeft;
        curY = e.clientY - canvas.offsetTop;
        hold = true;

        prevX = curX;
        prevY = curY;
        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
    };

    canvas.onmousemove = function(e){
        if(hold){
            curX = e.clientX - canvas.offsetLeft;
            curY = e.clientY - canvas.offsetTop;
            draw();
        }
    };

    canvas.onmouseup = function(e){
        hold = false;
    };

    canvas.onmouseout = function(e){
        hold = false;
    };

    function draw(){
        ctx.lineTo(curX, curY);
        ctx.strokeStyle = "#ffffff";
        ctx.stroke();
        canvas_data.pencil.push({ "startx": prevX, "starty": prevY, "endx": curX, "endy": curY, "thick": ctx.lineWidth, "color": ctx.strokeStyle });
    }
}

function save(){
    var filename = document.getElementById("fname").value;
    var data = JSON.stringify(canvas_data);
    var image = canvas.toDataURL();

    if (filename.length == 0){
        alert("You should have a character name.")
    } else {
        //$.post("https://tengwar-digit.herokuapp.com/",
        $.post("http://localhost:5000",
         { save_fname: filename, save_cdata: data, save_image: image, predict: false}, function(result){
            data = JSON.parse(result)
            document.getElementById("count").innerHTML  = data.result;
        });
        reset()
    }
}


function predict(){
    var filename = document.getElementById("fname").value;
    var data = JSON.stringify(canvas_data);
    var image = canvas.toDataURL();

    //$.post("https://tengwar-digit.herokuapp.com/",
    $.post("http://localhost:5000",
     { save_fname: filename, save_cdata: data, save_image: image, predict: true}, function(result){
        data = JSON.parse(result)
        table = document.getElementById("prediction_table");
        for(var i = 0; i < 12; i++){
            table.rows[0].cells[i].innerHTML = (data.proba_predicitons[i] * 100).toFixed(2) + "%";
        }
        console.log(data.class_prediction)
        document.getElementById("predicted_class").innerHTML  = data.class_prediction;
    });

}