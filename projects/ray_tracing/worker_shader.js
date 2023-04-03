let gl, renderer, postprocessor, texture_framebuffer,
    color = {
        white: { r: 1, g: 1, b: 1 },
        bright: { r: 1, g: 1, b: 1 },
    }, iter = 0;
self.addEventListener("message", async function (e) {
    if (e.data?.color) color = e.data.color;
    if (e.data?.canvas) {
        const VERTEX_SHADER = await fetch(import.meta.resolve("./shader.vert")).then(r => r.text());
        const FRAGMENT_SHADER_RENDERER = await fetch(import.meta.resolve("./shader.frag")).then(r => r.text());
        const FRAGMENT_SHADER_POSTPROCESSOR = await fetch(import.meta.resolve("./postprocessing.frag")).then(r => r.text());

        gl = e.data.canvas.getContext("webgl");

        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

        const vertexShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertexShader, VERTEX_SHADER);
        gl.compileShader(vertexShader);
        if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
            console.log(gl.getShaderInfoLog(vertexShader));
        }

        const fragmentShader_renderer = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShader_renderer, FRAGMENT_SHADER_RENDERER);
        gl.compileShader(fragmentShader_renderer);
        if (!gl.getShaderParameter(fragmentShader_renderer, gl.COMPILE_STATUS)) {
            console.log(gl.getShaderInfoLog(fragmentShader_renderer));
        }
        renderer = gl.createProgram();
        gl.attachShader(renderer, vertexShader);
        gl.attachShader(renderer, fragmentShader_renderer);
        gl.linkProgram(renderer);

        const fragmentShader_postprocessor = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShader_postprocessor, FRAGMENT_SHADER_POSTPROCESSOR);
        gl.compileShader(fragmentShader_postprocessor);
        if (!gl.getShaderParameter(fragmentShader_postprocessor, gl.COMPILE_STATUS)) {
            console.log(gl.getShaderInfoLog(fragmentShader_postprocessor));
        }
        postprocessor = gl.createProgram();
        gl.attachShader(postprocessor, vertexShader);
        gl.attachShader(postprocessor, fragmentShader_postprocessor);
        gl.linkProgram(postprocessor);

        const VERTICES = new Float32Array([-1, -1, -1, 1, 1, 1, -1, -1, 1, 1, 1, -1]);

        const vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, VERTICES, gl.STATIC_DRAW);

        const positionLocation = gl.getAttribLocation(renderer, "position");
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(positionLocation);
        texture_framebuffer = [];
        for (let i = 0; i < 2; i++) {
            let texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.canvas.width, gl.canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(new Array(gl.canvas.width * gl.canvas.height * 4).map((_, i) => i % 4 === 3 ? 255 : 0)));
            let framebuffer = gl.createFramebuffer();
            gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
            texture_framebuffer.push({ texture, framebuffer });
        }
        iter = 0;
        this.postMessage({ canvas: true });
    }
    if (e.data?.render) {
        gl.clearColor(1.0, 1.0, 1.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(renderer);
        gl.bindTexture(gl.TEXTURE_2D, texture_framebuffer[iter % 2].texture);
        gl.bindFramebuffer(gl.FRAMEBUFFER, texture_framebuffer[(iter + 1) % 2].framebuffer);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        const uFrameCount = gl.getUniformLocation(renderer, "frameCount");
        gl.uniform1i(uFrameCount, iter);
        gl.drawArrays(gl.TRIANGLES, 0, 6);

        gl.useProgram(postprocessor);
        gl.bindTexture(gl.TEXTURE_2D, texture_framebuffer[(iter + 1) % 2].texture);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        const uWhite = gl.getUniformLocation(postprocessor, "white");
        const uBright = gl.getUniformLocation(postprocessor, "bright");
        gl.uniform3f(uWhite, color.white.r, color.white.g, color.white.b);
        gl.uniform3f(uBright, color.bright.r, color.bright.g, color.bright.b);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        iter++;
        this.postMessage({ render: true });
    }
});