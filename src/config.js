import * as FXRand from "fxhash_lib/random";

const name = 'fluid';

export const devMode = true;

export const settings = {
    name,
    cam: 'orthographic',
};

export const options = {
    minLayers: 2,
    maxLayers: 2,
    opacity: 1.0,
    minStrokes: 1,
    maxStrokes: 2, // iOS can do max 22
    maxIterations: 10,
    minSpeed: 0.001,
    maxSpeed: 0.01,
    minDt: 0.1,
    maxDt: 0.25,
    // speedMult: 1,
    strokesRel: 'mirrorRand',
    onClick: 'change',
    onChange: 'update',
    snapOverlay: false,
    snapBlending: 3,
    snapOpacity: 3,
    maxChanges: 0,
    showDebug: false,
};

export const compositions = {
    pnoise: false,
    snoise: true,
    'random': false,
    center: false,
    mouse: false,
    box: false,
};

export const palettes = {
    'Black&White': false,
    'Mono': false,
    'Analogous': false,
    'Complementary': false,
    'randomColor': true,
};

export const layerOptions = [];

export const lightOptions = {
    ambLight: true,
    ambColor: 0x404040,
    ambIntensity: 0.1,
    camLight: true,
    camLightColor: 0xFFFFFF,
    camLightIntensity: 0.5,
    sunLight: true,
    sunLightColor: 0xFFFFFF,
    sunLightIntensity: 0.7,
    sunElevation: 45,
    sunAzimuth: 90,
    hemiLight: true,
    hemiSkyColor: 0x3284ff,
    hemiGroundColor: 0xffffff,
    hemiIntensity: 0.6,
};

export const effectOptions = {
    enabled: false,
    gammaCorrection: false,
    bloom: 0,
    //hBlur: 1 / window.innerWidth / 2,
    //vBlur: 1 / window.innerHeight / 2,
    film: false,
    noiseType: 'glsl-film-grain',
    noiseIntensity: 0.35,
    scanlinesIntensity: 0.25,
    scanlinesCount: 0,
    grayscale: true,
    dotScreen: false,
    dotScale: 0,
    //rgbShift: 0,
    sepia: 0,
    fxaa: false,
    //bleach: 0,
    //colorify: false,
    //pixelate: false,
};

export const chooseComposition = () => {
    const includedComps = Object.keys(compositions).filter((comp) => {
        return compositions[comp] === true;
    });
    const composition = FXRand.choice(includedComps);
    settings.saveName = name + '_' + composition;
    return composition;
}

export const choosePalette = () => {
    const includedPalettes = Object.keys(palettes).filter((palette) => {
        return palettes[palette] === true;
    });
    return FXRand.choice(includedPalettes);
}