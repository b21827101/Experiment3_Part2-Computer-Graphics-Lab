"use strict";

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var gl;
var type;
var normalize;
var stride;
var offset;
var program;

var speedSpiral=1; //default speed of spiral movement
var speedSpin = 1; //default speed of spin movement

var theta = 0.0; //use both of them for rotation,spin
var thetaLoc;

var changeDirectionForSpin = true; //if i do negative speed,change direction for spin movement
var changeDirectionForSpiral = true;//if i do negative speed,change direction for spiral movement

var changeScale = false;
var changeSpiral = false;//three of this is for starting scale or spiral or spin movement
var pressStartSpin= false;


var scaleUp = true;
var spiralFirst = true;

let currentLocation=[0,0];  //i use for uniform vector
let currentScale = [1.0, 1.0];
let scale;
let location1;  //for uniform location
let colorF;

var angle=0.0;
var xSpiral=0.0;  //all of them is using for doing spiral movement
var ySpiral=0.0;
var increment =0;

main();

function main() {
    const canvas = document.querySelector("#glcanvas"); //canvas element
    gl = canvas.getContext("webgl2");

    if(!gl) {
        alert("WebGL 2.0 is not available."); //if it fail,alert it
        return;
    }

    var buttonStartSpin = document.getElementById("StartSpin"); //if i click button,start the spin movement
    buttonStartSpin.addEventListener("click", function() {
        pressStartSpin = true;
    });
    var buttonStopSpin = document.getElementById("StopSpin"); // stop the spin
    buttonStopSpin.addEventListener("click", function() {
        pressStartSpin = false;
    });

    var buttonStartScale = document.getElementById("StartScale"); //scaling
    buttonStartScale.addEventListener("click", function() {
        changeScale = true;
    });
    var buttonStopScale = document.getElementById("StopScale"); //stop the scale
    buttonStopScale.addEventListener("click", function() {
        changeScale = false;
    });

    document.getElementById("SpinSpeed").onclick = function (){  //determine speed of spinning
        speedSpin = document.getElementById("SpinSpeed").value;  //get speed value
        if(speedSpin>0){
            changeDirectionForSpin= true;
            pressStartSpin = true;
        }
        else if(speedSpin<0){  //if it is negative,change direction
            changeDirectionForSpin= false;
            pressStartSpin = true;
        }
        else{  //if speed is zero,shape cannot move
            pressStartSpin = false;
        }
    }

    var startSpiral = document.getElementById("StartSpiral"); //if i click button,start the spiral
    startSpiral.addEventListener("click", function() {
        changeSpiral= true;
    });
    var stopSpiral = document.getElementById("StopSpiral"); //stop the spiral
    stopSpiral.addEventListener("click", function() {
        changeSpiral= false;

    });

    document.getElementById("SpiralSpeed").onclick = function (){  //determine speed of spinning
        speedSpiral = document.getElementById("SpiralSpeed").value;  //get speed value
        if(speedSpiral>0){
            changeDirectionForSpiral= true;
            changeSpiral= true;
        }
        else if(speedSpiral<0){
            changeDirectionForSpiral= false;  //if it is negative,change direction
            changeSpiral= true;
        }
        else{
            changeSpiral= false;  //if speed is zero,shape cannot move
        }
    }
    program = initShaderProgram(gl, vsSource, fsSource);
    gl.useProgram(program);//tell webgl use program when drawing it

    const posOfLeftEye = [];
    const posOfRightEye = [];
    const posOfYellowCircle = [];

    const eyeColor =[]; //color of eyes
    const skinColor =[]; //yellow

    const eyeRadius = 0.04; //for small circle
    const faceRadius =0.26; //for big circle

    const maskColor =[]; //color of mask

    const upperBezier=[-0.17, -0.03, 0.0, 0.10, 0.17, -0.03]; //upper curve of mask
    const bottomBezier =[-0.17, -0.16, 0.0, -0.29, 0.17,-0.16];//lower curve of mask

    const posOfUpperCurve = [];
    const posOfBottomCurve = [];

    const curveForfirstHandle = [];
    const curveForsecondHandle = [];
    const curveForthirdHandle= []; //handles of mask
    const curveForfourthHandle = [];

    //Position of white mask
    /*0. index : maskenin pozisyonları
    * 1. index: sol üst maske
    * 2.index : sağ üst maske
    * 3.index: sol alt maske
    * 4. index: sağ alt maske
    */

    const posOfMask = [[upperBezier[0], upperBezier[1],upperBezier[4], upperBezier[5],bottomBezier[4], bottomBezier[5],bottomBezier[0], bottomBezier[1]],
        [upperBezier[0]-0.090, upperBezier[1]+0.04, upperBezier[0], upperBezier[1], upperBezier[0], upperBezier[1]-0.03,upperBezier[0]-0.089, upperBezier[1]+0.01],
        [upperBezier[4], upperBezier[5],upperBezier[4]+0.090, upperBezier[1]+0.04, upperBezier[4]+0.089, upperBezier[1]+0.01,upperBezier[4], upperBezier[1]-0.03],
        [upperBezier[0]-0.042, -0.15, bottomBezier[0], bottomBezier[1]+0.03,bottomBezier[0], bottomBezier[1], bottomBezier[0]-0.026, bottomBezier[1]-0.01],
        [bottomBezier[4], bottomBezier[5]+0.03,bottomBezier[4]+0.042, -0.15, bottomBezier[4]+0.026, bottomBezier[5]-0.01, bottomBezier[4], bottomBezier[5]]
    ];

    //for curve handles of mask
    const curveOfHandleMask =[[posOfMask[1][0],posOfMask[1][1],-0.263,-0.01 ,posOfMask[1][6],posOfMask[1][7]],
        [posOfMask[2][2],posOfMask[2][3], 0.263,-0.01, posOfMask[2][4],posOfMask[2][5]],
        [posOfMask[3][0],posOfMask[3][1],-0.21,-0.16, posOfMask[3][6],posOfMask[3][7]],
        [posOfMask[4][2],posOfMask[4][3], 0.21, -0.16, posOfMask[4][4],posOfMask[4][5]]];


    type = gl.FLOAT;
    normalize = false;
    stride = 0;
    offset = 0;

    gl.viewport(0,0,canvas.width,canvas.height);

    gl.clearColor(1,1,1,1.0); //color the background white
    gl.clearDepth(1.0); // Clear everything
    gl.enable(gl.DEPTH_TEST); // Enable depth testing
    gl.depthFunc(gl.LEQUAL); // Near things obscure far things
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);// Clear the canvas before we start drawing on it.

    let aspectRatio = canvas.width/canvas.height;

    currentScale = [1.0, aspectRatio];

    thetaLoc = gl.getUniformLocation( program, "theta" );

    //console.log( bufferCircle.color[0]+" "+ bufferCircle.color[1]+" "+ bufferCircle.color[2]);

    drawScene(toCircle(gl, posOfYellowCircle, skinColor, 0, 0, faceRadius),0,101,);
    drawScene(toCircle(gl,posOfLeftEye,eyeColor,-0.1,0.1,eyeRadius),0,101);
    drawScene(toCircle(gl,posOfRightEye,eyeColor,0.1,0.1,eyeRadius),0,101);

    drawScene(toBezier(gl,posOfBottomCurve, bottomBezier, maskColor),0, posOfBottomCurve.length / 2);
    drawScene(toBezier(gl,posOfUpperCurve, upperBezier, maskColor),0, posOfUpperCurve.length / 2);

    drawScene(toSquare(gl, posOfMask[0],maskColor),0, 4); //middle of the mask

    //draw handles of the mask
    drawScene(toSquare(gl, posOfMask[1],maskColor),0, 4);//each of them is handle of mask
    drawScene(toBezier(gl,curveForfirstHandle,curveOfHandleMask[0],maskColor),0, curveForfirstHandle.length / 2);

    drawScene(toSquare(gl, posOfMask[2],maskColor),0, 4);
    drawScene(toBezier(gl,curveForsecondHandle,curveOfHandleMask[1],maskColor),0, curveForsecondHandle.length / 2);

    drawScene(toSquare(gl, posOfMask[3],maskColor),0, 4);
    drawScene(toBezier(gl,curveForthirdHandle,curveOfHandleMask[2],maskColor),0, curveForthirdHandle.length / 2);

    drawScene(toSquare(gl, posOfMask[4],maskColor),0, 4);
    drawScene(toBezier(gl,curveForfourthHandle,curveOfHandleMask[3],maskColor),0, curveForfourthHandle.length / 2);

}

function drawScene(buffer,offset, NumVertices) {

    scale =
        gl.getUniformLocation(program, "uScalingFactor");//current scale
    colorF =
        gl.getUniformLocation(program, "fColor"); //color
    location1 =
        gl.getUniformLocation(program, "u_translation"); //current translation

    gl.uniform2fv(scale, currentScale);
    gl.uniform4f(colorF, buffer.color[0], buffer.color[1], buffer.color[2], buffer.color[3]);
    gl.uniform2fv(location1,currentLocation);


    const aPosition = gl.getAttribLocation(program, "a_position");// Get the location of the shader variables

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer.position);
    gl.enableVertexAttribArray(aPosition); // Enable the assignment to aPosition variable
    gl.vertexAttribPointer(aPosition, 2, type, normalize, stride, offset); // Assign the buffer object to aPosition variable

    gl.drawArrays(gl.TRIANGLE_FAN, offset, NumVertices); //draw them

    window.requestAnimationFrame(function (currentTime) {

        if(pressStartSpin) { //if i click the start spin button
            theta += (changeDirectionForSpin ? (0.001* Math.abs(speedSpin)): (-0.001 *Math.abs(speedSpin)));
            //change rotate in counter clockwise if speed is negative
            gl.uniform1f(thetaLoc, theta);
        }

        if(changeScale){
            if(scaleUp){
                if(currentScale[0]>=1.5){ //if scaling is greater than 1.5,start shrink
                    scaleUp = false;
                }
                currentScale[0] += 0.001;
                currentScale[1] += 0.001;
            }else{
                if(currentScale[0]<=0.5){ ////if scaling is smaller than 0.5,start grow
                    scaleUp = true;
                }
                currentScale[0] -= 0.001;
                currentScale[1] -= 0.001;
            }
        }
        if(changeSpiral){ //if i click the start spiral button

            if(spiralFirst){ //for the first logarithmic spiral movement
                angle = -0.1 * increment;
                var radius = 0.007 * increment;
                xSpiral = (radius) * Math.cos(angle); //take cos value for x,take sin value for y
                ySpiral = (radius) * Math.sin(angle);
                increment += (0.01 * speedSpiral);  //in the first movement,increase the increment value for
                if(increment>=63 || increment<=0){ //if the shape reach at the end of the first spiral,pass second
                    spiralFirst = false;
                }
            }
            else{ //for the second logarithmic spiral movement
                angle = 0.1 * increment;
                var radius = 0.007 * increment;
                xSpiral = (radius) * Math.cos(angle);
                ySpiral = (radius) * Math.sin(angle);
                increment += (-0.01 * speedSpiral);
                if(increment<=0 || increment >= 63){//if the shape reach at the end of the second spiral,pass first
                    spiralFirst = true;
                }
            }
            currentLocation[0] = xSpiral ; //change x and y value of location of shape
            currentLocation[1] = ySpiral ;
        }
        drawScene(buffer, offset, NumVertices); // to draw the next frame
    });

}
