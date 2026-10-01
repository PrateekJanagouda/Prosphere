// GLSL for the Prosphere scenes. Everything is procedural: no textures,
// no file data — decorative visuals never touch user content.

// Ashima Arts 3D simplex noise (MIT).
export const noise = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);
  const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy));
  vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);
  vec3 l=1.0-g;
  vec3 i1=min(g.xyz,l.zxy);
  vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;
  vec3 x2=x0-i2+C.yyy;
  vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857;
  vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z);
  vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy;
  vec4 y=y_*ns.x+ns.yyyy;
  vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);
  vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;
  vec4 s1=floor(b1)*2.0+1.0;
  vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
  vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);
  vec3 p1=vec3(a0.zw,h.y);
  vec3 p2=vec3(a1.xy,h.z);
  vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
  m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
`;

// The sphere: a noise-displaced shell, dark at the core, bright at the rim
// (fresnel), with slow latitude scan-lines drifting through it.
export const orbVertex = /* glsl */ `
${noise}
uniform float uTime;
uniform float uAmp;
varying vec3 vNormal;
varying vec3 vView;
varying vec3 vPos;
varying float vNoise;
void main(){
  float n = snoise(normal * 1.4 + vec3(0.0, uTime * 0.16, uTime * 0.07));
  vNoise = n;
  vec3 p = position + normal * n * uAmp;
  vPos = p;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vView = normalize(-mv.xyz);
  vNormal = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * mv;
}
`;

export const orbFragment = /* glsl */ `
uniform float uTime;
uniform vec3 uDeep;
uniform vec3 uRim;
varying vec3 vNormal;
varying vec3 vView;
varying vec3 vPos;
varying float vNoise;
void main(){
  float fres = pow(1.0 - max(dot(normalize(vNormal), normalize(vView)), 0.0), 2.4);
  float f = fract(vPos.y * 6.0 + vNoise * 0.9 - uTime * 0.05);
  float band = smoothstep(0.93, 1.0, f) * (0.2 + fres);
  vec3 col = mix(uDeep, uRim, fres);
  col += uRim * band * 0.9;
  float alpha = clamp(0.12 + fres * 0.95 + band * 0.45, 0.0, 1.0);
  gl_FragColor = vec4(col, alpha);
}
`;

// A generic document card that dissolves along a noise front.
// uDissolve: -0.1 = whole card, 1.1 = gone. The front glows as it burns through.
export const docVertex = /* glsl */ `
varying vec2 vUv;
void main(){
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const docFragment = /* glsl */ `
${noise}
uniform float uDissolve;
uniform float uSeed;
uniform vec3 uAccent;
varying vec2 vUv;
void main(){
  vec2 uv = vUv;
  float n = snoise(vec3(uv * vec2(3.0, 4.0), uSeed)) * 0.5 + 0.5;
  n = mix(n, 1.0 - uv.y, 0.35);              // burn mostly top-down
  if (n < uDissolve) discard;

  vec3 paper = vec3(0.86, 0.90, 0.95);
  vec3 ink = vec3(0.45, 0.52, 0.63);
  vec3 col = paper;

  // header bar
  float head = step(0.14, uv.x) * step(uv.x, 0.52) * step(0.80, uv.y) * step(uv.y, 0.86);
  col = mix(col, uAccent * 0.75, head);

  // text lines
  float rows = (1.0 - uv.y) * 11.0;
  float row = floor(rows);
  float inRow = fract(rows);
  float lineLen = 0.86 - mod(row * 7.0, 3.0) * 0.11;
  float line = step(0.42, inRow) * step(inRow, 0.58)
             * step(0.14, uv.x) * step(uv.x, lineLen)
             * step(3.0, row) * step(row, 9.0);
  col = mix(col, ink, line);

  // hairline border
  float inside = step(0.03, uv.x) * step(uv.x, 0.97) * step(0.025, uv.y) * step(uv.y, 0.975);
  col = mix(uAccent * 0.55, col, inside);

  // glowing dissolve front
  float edge = 1.0 - smoothstep(0.0, 0.07, n - uDissolve);
  col = mix(col, uAccent * 1.6, edge * step(-0.05, uDissolve));

  gl_FragColor = vec4(col, 1.0);
}
`;
