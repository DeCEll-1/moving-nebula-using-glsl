#ifdef GL_ES
precision mediump float;
#endif

#include "lygia/color/blend/colorDodge.glsl"

#iChannel0 "file://perlinNoise.png"

// cosine based palette, 4 vec3 params
vec3 palette(in float t)
{
    vec3 a = vec3(0.438, 0.298, 0.588);
    vec3 b = vec3(0.298, 0.188, -0.202);
    vec3 c = vec3(-3.703, -2.543, 3.477);
    vec3 d = vec3(1.435, 1.769, 2.087);

    return a + b * cos(6.283185 * (c * t + d));
}

void main(void) { // https://youtu.be/db-qfZBhBe4
    // Coords
    vec2 uv = gl_FragCoord.xy / iResolution.xy;
    vec4 col = vec4(1.);

    vec3 spaceBackgroundMain = vec3(1.);

    for (float i = -1.; i < 2.; i += 2.) {
        //#region highlight noise

        // offset noise texture for movement
        vec2 offsetedCoordinate = uv;

        offsetedCoordinate.x += cos(iTime / (32. * i));
        offsetedCoordinate.y += sin(iTime / (32. * i));

        vec4 highlightNoise = texture(iChannel0, offsetedCoordinate);

        // fine tune it
        highlightNoise.rgb = smoothstep(0.3, .75, highlightNoise.rgb) * .6;

        highlightNoise.rgb += fract(highlightNoise).rgb * -fract(highlightNoise + iTime / 8.).rgb / 4.;

        //#endregion

        //#region nebula color noise

        // get the noise (upside down so it doesnt look reused)
        vec4 colorNoise = texture(iChannel0, uv * (i / 2.));

        // fine tuning the noise
        colorNoise.rgb = smoothstep(0.35, .8, colorNoise.rgb);

        // color setting (should use palette)
        colorNoise.rgb *= palette(i);

        //#endregion

        vec3 nebula = blendColorDodge(colorNoise.rgb, highlightNoise.rgb);

        vec4 maskNoise = texture(iChannel0, (-uv / 10.) * i);

        maskNoise.rgb = smoothstep(0.25, 0.80, maskNoise).rgb;

        spaceBackgroundMain = mix(nebula, spaceBackgroundMain, .3).rgb;
    }

    col.rgb = spaceBackgroundMain.rgb;

    gl_FragColor = col;
}
