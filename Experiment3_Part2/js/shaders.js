
// Vertex shader program
const vsSource = `#version 300 es
    in vec2 a_position;  // position of the vertex in coordinate system
    uniform vec2 uScalingFactor;  //scaling vector 
    uniform vec4 vColor;
    out vec4 fColor;
    uniform float theta;
    uniform vec2 u_translation; //translation of the shape

    void main() {
        float s = sin( theta );
        float c = cos( theta );
       
        vec2 rotatedPosition = vec2(
            a_position.x *  c + a_position.y * -s + u_translation[0],
            a_position.y *  c + a_position.x * s + u_translation[1]
        );

     gl_Position = vec4((rotatedPosition)* uScalingFactor, 0.0, 1.0); //set to the transformed and rotated vertex's position
     fColor = vColor;
    }
`;

// Fragment shader program
const fsSource = `#version 300 es
    precision mediump float;
    uniform vec4 fColor;
    out vec4 fragColor;
    void main()
    {
        fragColor = fColor;
    }
`;
