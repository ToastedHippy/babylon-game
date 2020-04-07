import {Engine, Scene, FreeCamera, Vector3, ArcRotateCamera, HemisphericLight, Mesh, AssetsManager, PhysicsImpostor, AmmoJSPlugin, MeshBuilder, Ray, RayHelper, AbstractMesh, PickingInfo, ActionManager, ExecuteCodeAction} from '@babylonjs/core';
import {GridMaterial} from '@babylonjs/materials';

import "@babylonjs/core/Meshes/meshBuilder";
import "@babylonjs/loaders/glTF";


let canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
let engine = new Engine(canvas);
let scene = new Scene(engine);
let camera = new ArcRotateCamera('camera', degToRad(-90), 1, 20, Vector3.Zero(), scene);

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

// Keyboard events
var inputMap: {[k: string]: boolean} = {};
scene.actionManager = new ActionManager(scene);
scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyDownTrigger, function (evt) {								
    inputMap[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
}));
scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyUpTrigger, function (evt) {								
    inputMap[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
}));

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

        if(m.name.includes('fakeHoverEngine')) {
            hoverEngines.push(m);
            m.isVisible = false;
            physicsRoot.addChild(m);
            m.physicsImpostor = new PhysicsImpostor(m, PhysicsImpostor.BoxImpostor, {mass: 0.1}, scene);
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
            m.physicsImpostor = new PhysicsImpostor(m, PhysicsImpostor.BoxImpostor, { mass: 0 }, scene);
        }
    })
    
    physicsRoot.physicsImpostor = new PhysicsImpostor(physicsRoot, PhysicsImpostor.NoImpostor, { mass: 100,  }, scene);
    physicsRoot.position = new Vector3(0, 2, 0);

    function castRay(mesh: AbstractMesh){       
        var origin = mesh.getAbsolutePosition();
	
	    var forward = new Vector3(0,-1,0);		
	    forward = Vector3.TransformCoordinates(forward, mesh.getWorldMatrix());
	
	    var direction = forward.subtract(origin);
	    direction = Vector3.Normalize(direction);
	
	    var length = 1;
	
	    var ray = new Ray(origin, direction, length);

		let rayHelper = new RayHelper(ray);		
		// rayHelper.show(scene);		

        var hit = scene.pickWithRay(ray);

        if (hit && hit.hit){
		   pulse(mesh, hit.distance, length);
	    }
    }

    scene.registerBeforeRender(function () {
        for (let he of hoverEngines) {
            castRay(he);
        }

        let t = physicsRoot.physicsImpostor?.getAngularVelocity();
        if (t) {
            physicsRoot.physicsImpostor?.setAngularVelocity(t.scale(0.05))
        }
            
    });


    var contactLocalRefPoint = Vector3.Zero();

    function pulse(mesh: AbstractMesh, distance: number, max: number) {
    

        var origin = mesh.getAbsolutePosition();
	
	    var forward = new Vector3(0,1,0);		
	    forward = Vector3.TransformCoordinates(forward, mesh.getWorldMatrix());
	
	    var direction = forward.subtract(origin);
	    direction = Vector3.Normalize(direction);

        let formula = 1 - distance / max;

        let forceMagnitude = formula * 900;
        let v = physicsRoot.physicsImpostor?.physicsBody ? physicsRoot.physicsImpostor?.getLinearVelocity() : null;
        
        physicsRoot.physicsImpostor?.applyForce(direction.scale(forceMagnitude), mesh.getAbsolutePosition());
        
        //fake drag
        if (v) {
            physicsRoot.physicsImpostor?.applyForce(v.scale(-1).scale(50), physicsRoot.getAbsolutePosition());
        }

        var physicsRootOrigin = physicsRoot.getAbsolutePosition();
        let impulseP = 0.02;
        scene.onBeforeRenderObservable.add(()=>{
            if(inputMap["w"] || inputMap["ArrowUp"]){
                
                physicsRoot.physicsImpostor?.applyImpulse(
                    Vector3.Normalize(Vector3.TransformCoordinates(Vector3.Forward(), physicsRoot.getWorldMatrix()).subtract(physicsRootOrigin)).scale(impulseP),
                    physicsRootOrigin
                )
            } 
            if(inputMap["a"] || inputMap["ArrowLeft"]){
                physicsRoot.physicsImpostor?.applyImpulse(
                    Vector3.Normalize(Vector3.TransformCoordinates(Vector3.Left(), physicsRoot.getWorldMatrix()).subtract(physicsRootOrigin)).scale(impulseP),
                    physicsRootOrigin
                )
            } 
            if(inputMap["s"] || inputMap["ArrowDown"]){
                physicsRoot.physicsImpostor?.applyImpulse(
                    Vector3.Normalize(Vector3.TransformCoordinates(Vector3.Backward(), physicsRoot.getWorldMatrix()).subtract(physicsRootOrigin)).scale(impulseP),
                    physicsRootOrigin
                )
            } 
            if(inputMap["d"] || inputMap["ArrowRight"]){
                physicsRoot.physicsImpostor?.applyImpulse(
                    Vector3.Normalize(Vector3.TransformCoordinates(Vector3.Right(), physicsRoot.getWorldMatrix()).subtract(physicsRootOrigin)).scale(impulseP),
                    physicsRootOrigin
                )
            }    
        })
        
    }
    
}

assetsManager.load();

function degToRad(degree: number) {
    return degree / (180 / Math.PI);
}