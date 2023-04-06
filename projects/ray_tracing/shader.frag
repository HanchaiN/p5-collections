#define PI 3.1415926
#define PHI 1.61803398874989484820459
precision highp float;
uniform sampler2D tex;
uniform int frameCount;
uniform vec2 textureSize;
uniform float u_seed;

float rand(in vec2 xy, in float seed) {
    return fract(tan(distance(xy*PHI, xy)*seed)*xy.x);
}
float random(inout int state) {
    state += 1041;
    state *= 48271;
    state = int(mod(float(state), 2147483647.0));
    return float(state) / 2147483647.0;
}
float randomGaussian(inout int state) {
    float theta = 2.0 * PI * random(state);
    float rho = sqrt(-2.0 * log(random(state)));
    return rho * cos(theta);
}
vec3 random3D(inout int state) {
    return normalize(vec3(
        randomGaussian(state),
        randomGaussian(state),
        randomGaussian(state)
    ));
}

struct Material {
    vec3 diffuse_color;
    vec3 emittance_color;
};

float dot2(in vec3 v ) { return dot(v,v); }

struct Quad {
    vec3 vert1;
    vec3 vert2;
    vec3 vert3;
    vec3 vert4;
    Material mat;
};
float udQuad(in vec3 p, in Quad r )
{
    vec3 v21 = r.vert2 - r.vert1; vec3 p1 = p - r.vert1;
    vec3 v32 = r.vert3 - r.vert2; vec3 p2 = p - r.vert2;
    vec3 v43 = r.vert4 - r.vert3; vec3 p3 = p - r.vert3;
    vec3 v14 = r.vert1 - r.vert4; vec3 p4 = p - r.vert4;
    vec3 nor = cross( v21, v14 );

    return sqrt( (sign(dot(cross(v21,nor),p1)) + 
                  sign(dot(cross(v32,nor),p2)) + 
                  sign(dot(cross(v43,nor),p3)) + 
                  sign(dot(cross(v14,nor),p4))<3.0) 
                  ?
                  min( min( dot2(v21*clamp(dot(v21,p1)/dot2(v21),0.0,1.0)-p1), 
                            dot2(v32*clamp(dot(v32,p2)/dot2(v32),0.0,1.0)-p2) ), 
                       min( dot2(v43*clamp(dot(v43,p3)/dot2(v43),0.0,1.0)-p3),
                            dot2(v14*clamp(dot(v14,p4)/dot2(v14),0.0,1.0)-p4) ))
                  :
                  dot(nor,p1)*dot(nor,p1)/dot2(nor) );
}
vec3 normQuad(in vec3 p, in Quad r )
{
    vec3 v21 = r.vert2 - r.vert1; vec3 p1 = p - r.vert1;
    vec3 v32 = r.vert3 - r.vert2; vec3 p2 = p - r.vert2;
    vec3 v43 = r.vert4 - r.vert3; vec3 p3 = p - r.vert3;
    vec3 v14 = r.vert1 - r.vert4; vec3 p4 = p - r.vert4;
    vec3 nor = cross( v21, v14 );

    return -normalize(nor);
}

const Material W = Material(vec3(0.747, 0.740, 0.737), vec3(0.0));
const Material R = Material(vec3(0.058, 0.287, 0.642), vec3(0.0));
const Material G = Material(vec3(0.285, 0.160, 0.159), vec3(0.0));
const Material L = Material(vec3(0.78), vec3(8.0, 15.6, 18.4));
const int numQuad = 16;
Quad scene[16];
void setScene() {
    scene[0] = Quad(vec3(552.8, 0.0, 0.0), vec3(0.0, 0.0, 0.0), vec3(0.0, 0.0, 559.2), vec3(549.6, 0.0, 559.2), W);
    scene[1] = Quad(vec3(343.0, 548.8, 227.0), vec3(343.0, 548.8, 332.0), vec3(213.0, 548.8, 332.0), vec3(213.0, 548.8, 227.0), L);
    scene[2] = Quad(vec3(556.0, 548.8, 0.0), vec3(556.0, 548.8, 559.2), vec3(0.0, 548.8, 559.2), vec3(0.0, 548.8, 0.0), W);
    scene[3] = Quad(vec3(549.6, 0.0, 559.2), vec3(0.0, 0.0, 559.2), vec3(0.0, 548.8, 559.2), vec3(556.0, 548.8, 559.2), W);
    scene[4] = Quad(vec3(0.0, 0.0, 559.2), vec3(0.0, 0.0, 0.0), vec3(0.0, 548.8, 0.0), vec3(0.0, 548.8, 559.2), G);
    scene[5] = Quad(vec3(552.8, 0.0, 0.0), vec3(549.6, 0.0, 559.2), vec3(556.0, 548.8, 559.2), vec3(556.0, 548.8, 0.0), R);

    scene[6] = Quad(vec3(130.0, 165.0, 65.0), vec3(82.0, 165.0, 225.0), vec3(240.0, 165.0, 272.0), vec3(290.0, 165.0, 114.0), W);
    scene[7] = Quad(vec3(290.0, 0.0, 114.0), vec3(290.0, 165.0, 114.0), vec3(240.0, 165.0, 272.0), vec3(240.0, 0.0, 272.0), W);
    scene[8] = Quad(vec3(130.0, 0.0, 65.0), vec3(130.0, 165.0, 65.0), vec3(290.0, 165.0, 114.0), vec3(290.0, 0.0, 114.0), W);
    scene[9] = Quad(vec3(82.0, 0.0, 225.0), vec3(82.0, 165.0, 225.0), vec3(130.0, 165.0, 65.0), vec3(130.0, 0.0, 65.0), W);
    scene[10] = Quad(vec3(240.0, 0.0, 272.0), vec3(240.0, 165.0, 272.0), vec3(82.0, 165.0, 225.0), vec3(82.0, 0.0, 225.0), W);

    scene[11] = Quad(vec3(423.0, 330.0, 247.0), vec3(265.0, 330.0, 296.0), vec3(314.0, 330.0, 456.0), vec3(472.0, 330.0, 406.0), W);
    scene[12] = Quad(vec3(423.0, 0.0, 247.0), vec3(423.0, 330.0, 247.0), vec3(472.0, 330.0, 406.0), vec3(472.0, 0.0, 406.0), W);
    scene[13] = Quad(vec3(472.0, 0.0, 406.0), vec3(472.0, 330.0, 406.0), vec3(314.0, 330.0, 456.0), vec3(314.0, 0.0, 456.0), W);
    scene[14] = Quad(vec3(314.0, 0.0, 456.0), vec3(314.0, 330.0, 456.0), vec3(265.0, 330.0, 296.0), vec3(265.0, 0.0, 296.0), W);
    scene[15] = Quad(vec3(265.0, 0.0, 296.0), vec3(265.0, 330.0, 296.0), vec3(423.0, 330.0, 247.0), vec3(423.0, 0.0, 247.0), W);
}

Material matAt(in vec3 p) {
    float d = 1.0 / 0.0;
    Material mat;
    for (int i = 0; i < numQuad; i++) {
        Quad quad = scene[i];
        float d_ = udQuad(p, quad);
        if(d_ < d) {
            d = d_;
            mat = quad.mat;
        }
    }
    return mat;
}
float dist(in vec3 p) {
    float d = 1.0 / 0.0;
    for (int i = 0; i < numQuad; i++) {
        Quad quad = scene[i];
        float d_ = udQuad(p, quad);
        if(d_ < d) {
            d = d_;
        }
    }
    return d;
}
vec3 calcNormal(in vec3 p) {
    float d = 1.0 / 0.0;
    vec3 nor = vec3(0.0);
    for (int i = 0; i < numQuad; i++) {
        Quad quad = scene[i];
        float d_ = udQuad(p, quad);
        if(d_ < d) {
            d = d_;
            nor = normQuad(p, quad);
        }
    }
    return nor;
}

float intersect( in vec3 ro, in vec3 rd )
{
    const float maxd = 10000.0;
    const float mind = 0.001;
    const int maxstep = 100;
    float h = 0.0;
    float t = 0.0;
    for( int i=0; i<maxstep; i++ )
    {
        h = dist( ro + rd*t );
        if( h > 1.5 * mind ) break;
        t += min(abs(h) * 0.99, mind);
    }
    for( int i=0; i<maxstep; i++ )
    {
        h = dist( ro + rd*t );
        if( h<mind || t>maxd ) break;
        t += max(abs(h) * 0.99, abs(h) - mind / 2.0);
    }

    if( t>maxd ) t = -1.0;

    return t;
}

vec3 render(in vec3 p, in vec3 d, inout int state) {
    const int maxdepth = 10;
    vec3 col = vec3(0.0);
    vec3 mul = vec3(1.0);
    for(int i = 0; i < maxdepth; i++) {
        float t = intersect(p, d);
        if(t < -0.0) {
            break;
        }
        p = p + d * t;
        Material mat = matAt(p);
        vec3 norm = calcNormal(p);
        col += mat.emittance_color * mul * max(-dot(norm, d), 0.0);
        d = normalize(norm + random3D(state));
        mul *= mat.diffuse_color;
    }
    return col;
}

void main() {
    int seed = int(rand(gl_FragCoord.xy / textureSize, u_seed) * 2147483647.0);
    const vec3 camera_pos = vec3(278.0, 273.0, -800.0);
    const vec2 frame_size = vec2(0.025, 0.025);
    const float focal_length = 0.035;
    const int pass = 1;
    setScene();
    vec3 color = vec3(0.0);
    for(int i = 0; i < pass; i++) {
        vec3 c = render(
            camera_pos,
            normalize(vec3(
                (0.5 - (gl_FragCoord.xy + 0.25 * vec2(randomGaussian(seed), randomGaussian(seed))) / textureSize) * frame_size * vec2(1.0, -1.0),
                focal_length
            )),
            seed
        );
        color += c;
    }
    color /= float(pass);
    color += texture2D(tex, gl_FragCoord.xy / textureSize).xyz * float(frameCount);
    color /= float(frameCount) + 1.0;
    gl_FragColor = vec4(color.xyz, 1.0);
}