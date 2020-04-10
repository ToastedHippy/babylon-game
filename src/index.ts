import {Engine, Scene, StandardMaterial, ShadowGenerator, FreeCamera, Vector3, ArcRotateCamera, HemisphericLight, Mesh, AssetsManager, PhysicsImpostor, AmmoJSPlugin, MeshBuilder, Ray, RayHelper, AbstractMesh, PickingInfo, ActionManager, ExecuteCodeAction, FollowCamera, NullEngine, BoxBuilder, DirectionalLight} from 'babylonjs';
import {GridMaterial} from 'babylonjs-materials';

import "babylonjs-loaders";
import { HoverCar } from './models/hover-car';


let canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
let engine = new Engine(canvas);
let scene = new Scene(engine);
let camera = new FollowCamera('camera',new Vector3(0, 10, -10), scene);

camera.radius = -25;
camera.heightOffset = 15;
camera.rotationOffset = 0;
camera.cameraAcceleration = 0.01;	
camera.maxCameraSpeed = 10;
camera.attachControl(canvas);


let assetsManager = new AssetsManager(scene);

let gravityVector = new Vector3(0,-9.81, 0);
scene.enablePhysics(gravityVector, new AmmoJSPlugin());

let hlight = new HemisphericLight("light1", new Vector3(0.2, 0.1, 0.2), scene);
    hlight.intensity = 0.5
var light = new DirectionalLight("dir01", new Vector3(-1, -1, -1), scene);
    light.position = new Vector3(20, 40, 20);
    light.intensity = 0.5

var shadowGenerator = new ShadowGenerator(1024, light);

let ground = Mesh.CreateGround("ground1", 100, 100, 2, scene);
// let material = new StandardMaterial("grid", scene);
let material = new GridMaterial("grid", scene);
// material.diffuseColor = new BABYLON.Color3(0,1,0)   
ground.material = material;
ground.physicsImpostor = new PhysicsImpostor(ground, PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.9, friction: 1 }, scene);
ground.receiveShadows = true;

// Keyboard events
var inputMap: {[k: string]: boolean} = {};
scene.actionManager = new ActionManager(scene);
scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyDownTrigger, function (evt) {								
    inputMap[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
}));
scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyUpTrigger, function (evt) {								
    inputMap[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
}));

 let obsticleBox = MeshBuilder.CreateBox('obstB1', {width: 10, height: 1, depth: 1}, scene);
 obsticleBox.physicsImpostor = new PhysicsImpostor(obsticleBox, PhysicsImpostor.BoxImpostor, {mass: 1, friction: 1}, scene);
 obsticleBox.position = new Vector3(0, 0.5, 2);

 let hoverCar = new HoverCar(scene);
 hoverCar.position = new Vector3(0,1,0);
 camera.lockedTarget = hoverCar.body;
 console.log(hoverCar.body.position, hoverCar.body.getAbsolutePosition())
 hoverCar.initControls();

 hoverCar.enableHoverEngines();


 engine.runRenderLoop(() => {
    scene.render();
});


function degToRad(degree: number) {
    return degree / (180 / Math.PI);
}