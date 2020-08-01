import {Engine, Scene, StandardMaterial, ShadowGenerator, FreeCamera, Vector3, ArcRotateCamera, HemisphericLight, Mesh, AssetsManager, PhysicsImpostor, AmmoJSPlugin, MeshBuilder, Ray, RayHelper, AbstractMesh, PickingInfo, ActionManager, ExecuteCodeAction, FollowCamera, NullEngine, BoxBuilder, DirectionalLight, Texture, Vector2, LoadFileError} from 'babylonjs';
import {GridMaterial} from 'babylonjs-materials';

import "babylonjs-loaders";
import { HoverCar } from './models/hover-car';
import { AssetsLoader } from './models/assets-loader';

HoverCar.hoverHeight = 1;
AssetsLoader.rootUrl = 'assets/';

let canvas = document.getElementById('game-canvas') as HTMLCanvasElement;

let engine = new Engine(canvas);
let scene = new Scene(engine);
let camera = new ArcRotateCamera('camera', 90*Math.PI/180, 140*Math.PI/180, -90, Vector3.Zero(), scene);

camera.attachControl(canvas);

let gravityVector = new Vector3(0,-9.81, 0);
scene.enablePhysics(gravityVector, new AmmoJSPlugin());

let hlight = new HemisphericLight("light1", new Vector3(0.2, 0.1, 0.2), scene);
    hlight.intensity = 0.5
var light = new DirectionalLight("dir01", new Vector3(-1, -1, -1), scene);
    light.position = new Vector3(20, 40, 20);
    light.intensity = 0.5

var shadowGenerator = new ShadowGenerator(1024, light);

let ground = Mesh.CreateGround("ground1", 512, 512, 32, scene);
let material = new StandardMaterial("grid", scene);
let texture = new Texture("assets/textures/ground.jpg", scene);
texture.uScale = 12;
texture.vScale = 12;
material.diffuseTexture = texture
ground.material = material;

ground.physicsImpostor = new PhysicsImpostor(ground, PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.9, friction: 1 }, scene);
ground.receiveShadows = true;

 let obsticleBox = MeshBuilder.CreateBox('obstB1', {width: 10, height: 1, depth: 1}, scene);
 obsticleBox.checkCollisions = true;
 obsticleBox.receiveShadows = true;
 shadowGenerator.addShadowCaster(obsticleBox);
 obsticleBox.position = new Vector3(0, 0.5, 5);


 let assetsLoader = new AssetsLoader(scene);
 assetsLoader.addToLoading(HoverCar);



 assetsLoader.load().then(s => {
    let hoverCar = new HoverCar(scene);
    hoverCar.position = new Vector3(0,2,0);
    // camera.parent = hoverCar.body;
    // camera.target = hoverCar.cameraTarget;
    // camera.lockedTarget = hoverCar.cameraTarget;
    shadowGenerator.addShadowCaster(hoverCar.body)

    hoverCar.initControls();

    hoverCar.startHoverEngines();
 })


 engine.runRenderLoop(() => {
    scene.render();
});


