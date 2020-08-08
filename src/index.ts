import {
    AmmoJSPlugin,
    DirectionalLight,
    Engine,
    HemisphericLight,
    Mesh,
    MeshBuilder,
    PhysicsImpostor,
    Scene,
    ShadowGenerator,
    StandardMaterial,
    Texture,
    Vector3
} from 'babylonjs';

import "babylonjs-loaders";
import {HoverCar} from './models/hover-car';
import {AssetsLoader} from './models/assets-loader';
import {PlayerCamera} from "./models/player-camera";

HoverCar.hoverHeight = 1;
AssetsLoader.rootUrl = 'assets/';

let canvas = document.getElementById('game-canvas') as HTMLCanvasElement;

let engine = new Engine(canvas);
let scene = new Scene(engine);
// let camera = new ArcRotateCamera('camera', 90*Math.PI/180, 140*Math.PI/180, -90, Vector3.Zero(), scene);
//
// camera.attachControl(canvas);

let gravityVector = new Vector3(0, -9.81, 0);
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

ground.physicsImpostor = new PhysicsImpostor(ground, PhysicsImpostor.BoxImpostor, {
    mass: 0,
    restitution: 0.9,
    friction: 1
}, scene);
ground.receiveShadows = true;

let obsticleBox = MeshBuilder.CreateBox('obstB1', {width: 10, height: 0.5, depth: 1}, scene);
obsticleBox.checkCollisions = true;
obsticleBox.receiveShadows = true;
shadowGenerator.addShadowCaster(obsticleBox);
obsticleBox.position = new Vector3(0, 0.25, 5);


let assetsLoader = new AssetsLoader(scene);
assetsLoader.addToLoading(HoverCar);


assetsLoader.load().then(s => {
    let hoverCar = new HoverCar(scene);

    hoverCar.startHoverEngines();
    hoverCar.initControls();
    hoverCar.position = new Vector3(10, 2, 0);

    let camera = new PlayerCamera(hoverCar.root, scene);
    camera.attachControl(canvas);

    shadowGenerator.addShadowCaster(hoverCar.body)


    engine.runRenderLoop(() => {
        scene.render();
    });
})


