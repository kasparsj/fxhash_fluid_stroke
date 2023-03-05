import * as THREE from 'three';
import * as FXRand from 'fxhash_lib/random.js'
import * as core from "fxhash_lib/core";
import {cam, renderer, scene, settings, options, features, compositions, palettes} from "fxhash_lib/core";
import * as dev from "fxhash_lib/dev";
import * as effects from "fxhash_lib/effects";
//import * as lights from "fxhash_lib/lights";
import * as css2D from "fxhash_lib/css2D";
import {devMode, effectOptions, lightOptions} from "./config"
import * as fluid from "fxhash_lib/fluid";
import * as mats from "fxhash_lib/materials";
import {MaterialFBO} from "fxhash_lib/postprocessing/MaterialFBO";
import {FluidPass} from "fxhash_lib/postprocessing/FluidPass";
import {comp, debug, strokesPerLayer, initShared} from "./shared";

let materialFBO;

setup();

function setup() {
  if (devMode) {
    dev.initGui(settings.name);

    //dev.initSettings(settings);

    const folder = fluid.createGUI(dev.gui);
    folder.add(options, 'minStrokes', 1, 22, 1);
    folder.add(options, 'maxStrokes', 1, 22, 1);
    folder.add(options, 'strokesRel', ['same', 'mirror', 'mirrorX', 'mirrorY', 'mirrorRand', 'random']);
    folder.add(options, 'minSpeed', 0.001, 0.01, 0.001).listen();
    folder.add(options, 'maxSpeed', 0.01, 0.1, 0.001).listen();
    if (options.hasOwnProperty('speedMult')) {
      folder.add(options, 'speedMult', 0.1, 10, 0.1).listen();
    }
    if (options.hasOwnProperty('maxIterations')) {
      folder.add(options, 'maxIterations', 1, 20, 1);
    }

    dev.createCheckBoxGui(compositions, 'Compositions');
    dev.createCheckBoxGui(palettes, 'Palettes');
  }

  initShared();
  fluid.init();

  const initSettings = Object.assign({}, settings, {
    alpha: true,
  });
  core.init(initSettings);
  // lights.init(lightOptions);
  css2D.init();

  if (devMode) {
    dev.initHelpers();
    //dev.initLighting(lightOptions);
    dev.createEffectsGui(effectOptions);
    dev.hideGuiSaveRow();
  }

  cam.position.z = 1024;
  core.lookAt(new THREE.Vector3(0, 0, 0));

  window.addEventListener('fluid.createLayer', onCreateLayer)
  window.addEventListener('fluid.initLayerOptions', onInitLayerOptions)
  window.addEventListener('fluid.applyLayerOptions', onApplyLayerOptions)
  window.addEventListener('fluid.resetLayer', onResetLayer)

  createScene();

  effects.init(Object.assign({
    colorifyColor: new THREE.Color(0xFFD700),
  }, effectOptions));
  core.animate();

  addEventListeners();

  fxpreview();
}

function createScene() {
  switch (comp) {
    case 'box':
      scene.background = fluid.colors[0];
      createBoxComp();
      break;
    case 'random':
    case 'center':
    case 'mouse':
    default:
      createDefaultComp();
      // if (!options.snapOverlay && palette !== 'Black&White') {
      //   scene.background = fluid.colors[0];
      // }
      fluid.createSnapOverlay();
      if (options.maxChanges > 0) {
        fluid.scheduleChange();
      }
      break;
  }
  scene.add(debug);
}

function createDefaultComp() {
  // const mat = new THREE.MeshLambertMaterial({color: fluid.colors[0], blending: THREE.CustomBlending});
  // // const mat = new THREE.MeshBasicMaterial({color: fluid.colors[0], blending: THREE.CustomBlending});
  // const box = new THREE.Mesh(new THREE.BoxGeometry(500, 500, 500), mat);
  // box.rotation.set(90, 0, 180);
  // scene.add(box);

  for (let i=0; i<features.layers; i++) {
    fluid.createLayer();
  }
}

function createBoxComp() {
  core.initControls(cam);

  fluid.createLayer();

  const mat = mats.fluidViewUV({
    blending: fluid.layerOptions[0].blendModeView,
  });

  const box = new THREE.Mesh(new THREE.BoxGeometry(500, 500, 500), mat);
  scene.add(box);
  const edges = core.createEdges(box);
  scene.add(edges);

  materialFBO = new MaterialFBO({
    type: THREE.HalfFloatType,
  }, box.material);

  const fluidPass = new FluidPass(mats.fluidPass({
    blending: fluid.layerOptions[0].blendModePass,
    transparent: true,
  }), Object.assign({
    numStrokes: strokesPerLayer,
  }, Object.assign({
    maxIterations: options.maxIterations,
  }, fluid.layerOptions[0])));

  for (let i=0; i<strokesPerLayer; i++) {
    const stroke = createStroke(0, i);
    fluidPass.initStroke(i, stroke);
  }

  materialFBO.composer.addPass(fluidPass);
}

function onCreateLayer(event) {
  const {layer, i} = event.detail;
  if (comp !== 'box') {
    scene.add(layer.mesh);
  }
  createStrokes(i);
  if (devMode) {
    fluid.createLayerGUI(dev.gui, i);
  }
}

function onInitLayerOptions(event) {
  const {options} = event.detail;
  options.numStrokes = strokesPerLayer;
}

function onApplyLayerOptions(event) {
  const {layer} = event.detail;
  layer.fluidPass.material.defines.MAX_ITERATIONS = options.maxIterations + '.0';
}

function onResetLayer(event) {
  const {layer} = event.detail;
  for (let j=0; j<layer.options.numStrokes; j++) {
    layer.fluidPass.uniforms.uSpeed.value[j] = FXRand.num(options.minSpeed, options.maxSpeed) * options.speedMult;
  }
}

function createStrokes(i) {
  const layer = fluid.layers[i];
  const numStrokes = layer.options.numStrokes;
  for (let j=0; j<numStrokes; j++) {
    const stroke = createStroke(i, j);
    if (stroke.isMouse) {
      layer.initMouseStroke(j, renderer.domElement);
    }
    else {
      layer.fluidPass.initStroke(j, stroke);
    }
  }
}

function createStroke(i, j) {
  let stroke;
  if (i === 0 || options.strokesRel === 'random') {
    // first layer all strokes are random
    const speed = FXRand.num(options.minSpeed, options.maxSpeed) * options.speedMult;
    const pos = new THREE.Vector2(FXRand.num(), FXRand.num());
    const target = new THREE.Vector2(FXRand.num(), FXRand.num());
    switch (comp) {
      case 'random':
        stroke = {
          speed,
          isDown: FXRand.bool(),
          pos,
          target
        };
        break;
      case 'center':
        stroke = {
          isDown: true,
        };
        break;
      default:
      case 'mouse':
        stroke = {
          isMouse: true,
        }
        break;
    }
  }
  else {
    let sr = options.strokesRel;
    if (sr === 'mirrorRand') {
      sr = FXRand.choice(['mirror', 'mirrorX', 'mirrorY']);
    }
    switch (sr) {
      case 'same':
        stroke = fluid.layers[0].fluidPass.getStroke(j);
        break;
      case 'mirror':
      case 'mirrorX':
      case 'mirrorY':
      default:
        stroke = FluidPass[sr || 'mirror'](fluid.layers[0].fluidPass.getStroke(j));
        break;
    }
  }
  if (stroke.pos) {
    debug.add(core.createCross(core.toScreen(stroke.pos)));
  }
  return stroke;
}

function draw(event) {
  core.update();
  dev.update();
  if (comp === 'box') {
    materialFBO.render();
  }
  else {
    fluid.updateLayers();
  }
  core.render();
}

function onKeyDown(event) {
  if (devMode) {
    dev.keyDown(event, settings, lightOptions, effectOptions);
  }
}

function onDblClick(event) {
  if (devMode && !dev.isGui(event.target)) {
    document.location.reload();
  }
}

function addEventListeners() {
  window.addEventListener('core.render', draw);
  renderer.domElement.addEventListener('click', fluid.onClick);
  document.addEventListener("keydown", onKeyDown, false);
  window.addEventListener("resize", fluid.onResize);
  if (devMode) {
    window.addEventListener("dblclick", onDblClick);
  }
}