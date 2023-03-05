import {compositions, options, palettes} from "fxhash_lib/core";
import * as dev from "fxhash_lib/dev";
import * as fluid from "fxhash_lib/fluid";

export const createGUI = (gui) => {
    gui.remember(options);
    const onChange = () => {
        debug.visible = options.showDebug;
        if (options.hasOwnProperty('snapOverlay')) {
            fluid.vars.snapOverlay.mesh.visible = options.snapOverlay;
        }
        if (options.hasOwnProperty('snapBlending')) {
            fluid.vars.snapOverlay.mesh.material.blending = options.snapBlending;
        }
        if (options.hasOwnProperty('snapOpacity')) {
            fluid.vars.snapOverlay.mesh.material.opacity = options.snapOpacity;
        }
    }

    const folder = gui.addFolder('Options');
    folder.add(options, 'minLayers', 1, 10, 1);
    folder.add(options, 'maxLayers', 1, 10, 1);
    if (options.hasOwnProperty('opacity')) {
        folder.add(options, 'opacity', 0, 1, 0.01);
    }
    folder.add(options, 'minStrokes', 1, 22, 1);
    folder.add(options, 'maxStrokes', 1, 22, 1);
    folder.add(options, 'strokesRel', ['same', 'mirror', 'mirrorX', 'mirrorY', 'mirrorRand', 'random']);
    folder.add(options, 'minSpeed', 0.001, 0.01, 0.001).listen();
    folder.add(options, 'maxSpeed', 0.01, 0.1, 0.001).listen();
    folder.add(options, 'minDt', 0.01, 0.4, 0.01);
    folder.add(options, 'maxDt', 0.01, 0.4, 0.01);
    if (options.hasOwnProperty('speedMult')) {
        folder.add(options, 'speedMult', 0.1, 10, 0.1).listen();
    }
    if (options.hasOwnProperty('maxIterations')) {
        folder.add(options, 'maxIterations', 1, 20, 1);
    }
    if (options.hasOwnProperty('onClick')) {
        folder.add(options, 'onClick', ['', 'change', 'reset', 'addnew']);
    }
    if (options.hasOwnProperty('onChange')) {
        folder.add(options, 'onChange', ['', 'update', 'reset']);
    }
    if (options.hasOwnProperty('maxChanges')) {
        folder.add(options, 'maxChanges', 0, 20, 1);
    }
    if (options.hasOwnProperty('snapBlending')) {
        folder.add(options, 'snapBlending', 1, 5, 1).onChange(onChange);
    }
    if (options.hasOwnProperty('snapOpacity')) {
        folder.add(options, 'snapOpacity', 0, 1.0, 0.01).onChange(onChange);
    }
    if (options.hasOwnProperty('snapOverlay')) {
        folder.add(options, 'snapOverlay').onChange(onChange);
    }
    if (options.hasOwnProperty('showDebug')) {
        folder.add(options, 'showDebug').onChange(onChange);
    }

    dev.createCheckBoxGui(compositions, 'Compositions');
    dev.createCheckBoxGui(palettes, 'Palettes');
}
