import {Engine, Scene, FreeCamera, Vector3, ArcRotateCamera, HemisphericLight, Mesh, AssetsManager, PhysicsImpostor, AmmoJSPlugin, MeshBuilder} from '@babylonjs/core';
import {GridMaterial} from '@babylonjs/materials';

import "@babylonjs/core/Meshes/meshBuilder";
import "@babylonjs/loaders/glTF";


let canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
let engine = new Engine(canvas);
let scene = new Scene(engine);
let camera = new ArcRotateCamera('camera', 0, 1, 12, Vector3.Zero(), scene);
let material = new GridMaterial("grid", scene);
let assetsManager = new AssetsManager(scene);

camera.attachControl(canvas);
let gravityVector = new Vector3(0,-9.81, 0);
scene.enablePhysics(gravityVector, new AmmoJSPlugin());

let hlight = new HemisphericLight("light1", new Vector3(0, 1, 0), scene);

let ground = Mesh.CreateGround("ground1", 50, 50, 2, scene);
ground.material = material;
ground.physicsImpostor = new PhysicsImpostor(ground, PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.9 }, scene);

engine.runRenderLoop(() => {
    scene.render();
});

// let sphere = MeshBuilder.CreateSphere("sphere", {diameterX: 1, diameterY: 1, diameterZ: 1}, scene);
// sphere.physicsImpostor = new PhysicsImpostor(sphere, PhysicsImpostor.SphereImpostor, {mass:1}, scene);
// sphere.position.y = 1;

let hovercarTask = assetsManager.addMeshTask('hoverCar task', '', 'assets/', 'hover-car.gltf');
hovercarTask.onSuccess =t => {
    console.log(t.loadedMeshes)
    let newMeshes = t.loadedMeshes;
    var physicsRoot = new Mesh("physicsRoot", scene);

    newMeshes.forEach((m, i)=>{
        if(m.name.indexOf("Collider") != -1){
            m.isVisible = false
            physicsRoot.addChild(m)
        }
    })

    // Add all root nodes within the loaded gltf to the physics root
    newMeshes.forEach((m, i)=>{
        if(m.parent == null){
            physicsRoot.addChild(m)
        }
    })

    // Make every collider into a physics impostor
    physicsRoot.getChildMeshes().forEach((m)=>{
        if(m.name.indexOf("Collider") != -1){
            m.scaling.x = Math.abs(m.scaling.x)
            m.scaling.y = Math.abs(m.scaling.y)
            m.scaling.z = Math.abs(m.scaling.z)
            m.physicsImpostor = new PhysicsImpostor(m, PhysicsImpostor.BoxImpostor, { mass: 0.1 }, scene);
        }
    })

    
    
    physicsRoot.physicsImpostor = new PhysicsImpostor(physicsRoot, PhysicsImpostor.NoImpostor, { mass: 30 }, scene);

    physicsRoot.position = new Vector3(0, 2 , 0);
    
}

assetsManager.load();

function degToRad(degree: number) {
    return degree / (180 / Math.PI);
}