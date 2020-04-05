import {Engine, Scene, FreeCamera, Vector3, ArcRotateCamera, HemisphericLight, Mesh, AssetsManager, PhysicsImpostor, AmmoJSPlugin, MeshBuilder, Ray, RayHelper, AbstractMesh} from '@babylonjs/core';
import {GridMaterial} from '@babylonjs/materials';

import "@babylonjs/core/Meshes/meshBuilder";
import "@babylonjs/loaders/glTF";


let canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
let engine = new Engine(canvas);
let scene = new Scene(engine);
let camera = new ArcRotateCamera('camera', degToRad(-90), 1, 12, Vector3.Zero(), scene);

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
    let car = t.loadedMeshes[0];
    let hoverEngines: AbstractMesh[] = [];
    
    t.loadedMeshes[0].rotation = new Vector3(0, 0, 0);

    newMeshes.forEach((m, i)=>{
        if(m.name.indexOf("Collider") != -1){
            m.isVisible = false
            physicsRoot.addChild(m)
        }

        if(m.name.includes('hoverEngine')) {
            hoverEngines.push(m);
        }

        m.isPickable = false;
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

    
    
    physicsRoot.physicsImpostor = new PhysicsImpostor(physicsRoot, PhysicsImpostor.NoImpostor, { mass: 10 }, scene);

    physicsRoot.position = new Vector3(0, 3, 0);

    function castRay(mesh: AbstractMesh){       
        var origin = mesh.getAbsolutePosition();
	
	    var forward = new Vector3(0,-1,0);		
	    forward = Vector3.TransformCoordinates(forward, mesh.getWorldMatrix());
	
	    var direction = forward.subtract(origin);
	    direction = Vector3.Normalize(direction);
	
	    var length = 5;
	
	    var ray = new Ray(origin, direction, length);

		let rayHelper = new RayHelper(ray);		
		// rayHelper.show(scene);		

        var hit = scene.pickWithRay(ray);

        if (hit && hit.pickedMesh){
		   pulse(mesh, hit.distance, length);
	    }
    }

    scene.registerBeforeRender(function () {
        for (let he of hoverEngines) {
            castRay(he);
        }
    });


    var forceDirection = new Vector3(0, 1, 0);
    var contactLocalRefPoint = Vector3.Zero();

    function pulse(mesh: AbstractMesh, distance: number, max: number) {
        let forceMagnitude = (1 - distance / max) * 35;
        if (forceMagnitude > 0 && physicsRoot.physicsImpostor){
            console.log(mesh.name, forceDirection.scale(forceMagnitude).y)
            physicsRoot.physicsImpostor.applyForce(forceDirection.scale(forceMagnitude), mesh.getAbsolutePosition());
        }
    }
    
}

assetsManager.load();

function degToRad(degree: number) {
    return degree / (180 / Math.PI);
}