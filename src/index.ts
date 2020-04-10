import {Engine, Scene, StandardMaterial, ShadowGenerator, FreeCamera, Vector3, ArcRotateCamera, HemisphericLight, Mesh, AssetsManager, PhysicsImpostor, AmmoJSPlugin, MeshBuilder, Ray, RayHelper, AbstractMesh, PickingInfo, ActionManager, ExecuteCodeAction, FollowCamera, NullEngine, BoxBuilder, DirectionalLight, Texture, Vector2} from 'babylonjs';
import {GridMaterial} from 'babylonjs-materials';

import "babylonjs-loaders";
import { HoverCar } from './models/hover-car';


let canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
let engine = new Engine(canvas);
let scene = new Scene(engine);
let camera = new FollowCamera('camera',new Vector3(0, 10, -10), scene);

camera.radius = -15;
camera.heightOffset = 35;

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
let material = new StandardMaterial("grid", scene);
let texture = new Texture("assets/textures/ground.jpg", scene);
texture.uScale = 6;
texture.vScale = 6;
material.diffuseTexture = texture   
ground.material = material;

ground.physicsImpostor = new PhysicsImpostor(ground, PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.9, friction: 1 }, scene);
ground.receiveShadows = true;

 let obsticleBox = MeshBuilder.CreateBox('obstB1', {width: 10, height: 1, depth: 1}, scene);
 obsticleBox.physicsImpostor = new PhysicsImpostor(obsticleBox, PhysicsImpostor.BoxImpostor, {mass: 1, friction: 1}, scene);
 obsticleBox.position = new Vector3(0, 0.5, 2);

 let hoverCar = new HoverCar(scene);
 hoverCar.position = new Vector3(0,1,0);
 camera.lockedTarget = hoverCar.cameraAnchor;
 shadowGenerator.addShadowCaster(hoverCar.shadowCaster)
 
 hoverCar.initControls();

 hoverCar.enableHoverEngines();


 engine.runRenderLoop(() => {
    scene.render();
});


function degToRad(degree: number) {
    return degree / (180 / Math.PI);
}