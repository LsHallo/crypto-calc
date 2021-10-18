const canvas = document.getElementById('background');
const gl = canvas.getContext('webgl2');

if(!gl) {
    // TODO: Fallback rendering
} else {
    Promise.all([loadShaderFile('/shaders/vertex.glsl'), loadShaderFile('/shaders/fragment.glsl'), loadImage('/img/atlas.png')]).then(([vertexShaderData, fragmentShaderData, imageAtlas]) => {
        const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderData);
        const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderData);

        const program = createProgram(gl, vertexShader, fragmentShader);

        let positionAttributeLocation = gl.getAttribLocation(program, "a_position");
        let texCoordAttributeLocation = gl.getAttribLocation(program, "a_texCoord");
        let positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

        // 2d points in px
        let positions = [
            0, 0,
            600, 100,
            0, 100,
            100, 300,
            800, 200,
            800, 300,
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
        let resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
        let imageLocation = gl.getUniformLocation(program, "u_image");

        // provide texture coordinates for the rectangle.
        let texCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            0.0,  0.0,
            1.0,  0.0,
            0.0,  1.0,
            0.0,  1.0,
            1.0,  0.0,
            1.0,  1.0]), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(texCoordAttributeLocation);
        let size = 2;          // 2 components per iteration
        let type = gl.FLOAT;   // the data is 32bit floats
        let normalize = false; // don't normalize the data
        let stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
        let offset = 0;        // start at the beginning of the buffer
        gl.vertexAttribPointer(texCoordAttributeLocation, size, type, normalize, stride, offset)

        // Create a texture.
        let texture = gl.createTexture();

        // make unit 0 the active texture unit
        // (i.e, the unit all other texture commands will affect.)
        gl.activeTexture(gl.TEXTURE0 + 0);

        // Bind texture to 'texture unit '0' 2D bind point
        gl.bindTexture(gl.TEXTURE_2D, texture);

        // Set the parameters so we don't need mips and so we're not filtering
        // and we don't repeat
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

        // Upload the image into the texture.
        let mipLevel = 0;               // the largest mip
        let internalFormat = gl.RGBA;   // format we want in the texture
        let srcFormat = gl.RGBA;        // format of data we are supplying
        let srcType = gl.UNSIGNED_BYTE  // type of data we are supplying
        gl.texImage2D(
            gl.TEXTURE_2D,
            mipLevel,
            internalFormat,
            srcFormat,
            srcType,
            imageAtlas
        );


        let vao = gl.createVertexArray();
        gl.bindVertexArray(vao);
        gl.enableVertexAttribArray(positionAttributeLocation);

        size = 2;          // 2 components per iteration
        type = gl.FLOAT;   // the data is 32bit floats
        normalize = false; // don't normalize the data
        stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
        offset = 0;        // start at the beginning of the buffer
        gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);

        resizeCanvas();
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        // Clear the canvas
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        // Tell it to use our program (pair of shaders)
        gl.useProgram(program);
        // Pass in the canvas resolution so we can convert from
        // pixels to clip space in the shader
        gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

        // Tell the shader to get the texture from texture unit 0
        gl.uniform1i(imageLocation, 0);

        // Bind the position buffer so gl.bufferData that will be called
        // in setRectangle puts data in the position buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

        // Set a rectangle the same size as the image.
        //setRectangle(gl, 0, 0, image.width, image.height);

        // Bind the attribute/buffer set we want.
        gl.bindVertexArray(vao);

        let primitiveType = gl.TRIANGLES;
        offset = 0;
        let count = 6;
        gl.drawArrays(primitiveType, offset, count);
    });

}

function loadImage(path) {
    return new Promise((res, rej) => {
        let image = new Image();
        image.src = path;
        image.onload = () => {
            res(image);
        }
        image.onerror = e => {
            rej(e);
        }
    });
}

function createShader(gl, type, source) {
    let shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    let success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
        return shader;
    }

    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}

function loadShaderFile(path) {
    return new Promise(res => {
        let xhr = new XMLHttpRequest();
        xhr.addEventListener("load", data => {
            console.log(`Loaded shader file '${path}'`);
            res(data.target.response);
        });
        xhr.open("GET", path);
        xhr.send();
    });
}

function createProgram(gl, vertexShader, fragmentShader) {
    let program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    let success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
        return program;
    }

    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
}

function resizeCanvas() {
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;

    const needResize = canvas.width !== displayWidth || canvas.height !== displayHeight;

    if(needResize) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
        console.log('Resize canvas!');
    }

    return needResize;
}
window.addEventListener('resize', () => {
    resizeCanvas();
})