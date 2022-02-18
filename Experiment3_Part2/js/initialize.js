/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
"use strict";

function _createBufferObject(gl, array){

    const buffer = gl.createBuffer(); // Create a buffer object

    if (!buffer) {
        out.displayError('Failed to create the buffer object for ' + model.name);
        return null;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer); //Make the buffer object the active buffer
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(array), gl.STATIC_DRAW);// Upload the data for this buffer object

    return buffer;
}

function toBezier(gl,positionsOfCurve,arrayCurve,colorOfCurve)
{
    colorOfCurve = [];
    colorOfCurve.push(0.835, 0.878, 0.917,  1.0);  //white color(color of mask)
    for (let t = 0.0; t <= 1.0; ) { //(1−t)^2∙A + 2t(1−t)∙B + t^2∙C .That is how quadratic works

        positionsOfCurve.push((1-t) * (1-t) * arrayCurve[0] + 2.0 * t * (1-t) * arrayCurve[2] + t * t * arrayCurve[4]); //x position of A,B,C
        positionsOfCurve.push((1-t) * (1-t) * arrayCurve[1] + 2.0 * t * (1-t) * arrayCurve[3] + t * t * arrayCurve[5]); //y position of A,B,C
        t+=0.1;

    }
    const posBuffer =_createBufferObject(gl,positionsOfCurve); //for positions
    return {
        position: posBuffer,
        color : colorOfCurve
    };

}
function toSquare(gl,positionsOfSquare,color){

    color = [];
    color.push(0.835, 0.878, 0.917,1.0); //color of mask

    const posBuffer =_createBufferObject(gl,positionsOfSquare); //for vertex
    return {
        position: posBuffer,
        color : color
    };
}

function toCircle(gl,positions,colors,centerX,centerY,radius) {

    colors = [];
    const totalPoints=100;  //draw circle using 100 vertices

    if(radius === 0.26){ //big circle
        colors.push(0.929, 0.843, 0.239,1.0); //yellow color
    }
    else{         //small circle
        colors.push(0.227, 0.168, 0.074,1);
    }

    for (let i = 0; i <= totalPoints; i++) {

        const angle= 2 * Math.PI * i / totalPoints;
        const x = centerX + radius * Math.cos(angle); // x coord
        const y = centerY + radius * Math.sin(angle); // y coord
        positions.push(x,y);
    }
    const posBuffer =_createBufferObject(gl,positions); //for vertex

    return {
        position: posBuffer,
        color : colors
    };
}

function loadShader(gl, type, source) {
    const shader = gl.createShader(type); //a new shader is created

    gl.shaderSource(shader, source); //send the source to the shader object
    gl.compileShader(shader); //compile the shader

    if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {  //If that's false, we know the shader failed to compile
        alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

function initShaderProgram(gl, vsSource, fsSource) { //initialize the shader program
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    const shaderProgram = gl.createProgram(); //Create shader program
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) { //If that's false,alert it
        alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
    }
    return shaderProgram;
}