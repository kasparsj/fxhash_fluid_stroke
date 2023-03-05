import * as THREE from 'three';
import * as FXRand from "fxhash_lib/random";
import {chooseComposition, options} from "fxhash_lib/core";

let comp, strokesPerLayer, debug;

function initShared() {
    comp = chooseComposition();
    strokesPerLayer = FXRand.int(options.minStrokes, options.maxStrokes);

    debug = new THREE.Group();
    debug.visible = options.showDebug;

    if (!options.hasOwnProperty('speedMult')) {
        options.speedMult = FXRand.num(0.1, 10);
    }
    if (!options.hasOwnProperty('snapBlending')) {
        //options.snapBlending = FXRand.choice([3, 5]);
        options.snapBlending = THREE.SubtractiveBlending;
        // options.snapBlending = THREE.CustomBlending;
    }
    if (!options.hasOwnProperty('maxChanges')) {
        options.maxChanges = FXRand.int(5, 9);
    }
}

export {comp, strokesPerLayer, debug, initShared}