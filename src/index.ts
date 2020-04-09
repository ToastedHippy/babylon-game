import {Engine, Scene, StandardMaterial, ShadowGenerator, FreeCamera, Vector3, ArcRotateCamera, HemisphericLight, Mesh, AssetsManager, PhysicsImpostor, AmmoJSPlugin, MeshBuilder, Ray, RayHelper, AbstractMesh, PickingInfo, ActionManager, ExecuteCodeAction, FollowCamera, NullEngine, BoxBuilder, DirectionalLight} from 'babylonjs';
import {GridMaterial} from 'babylonjs-materials';

import "babylonjs-loaders";


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

// let sphere = MeshBuilder.CreateSphere("sphere", {diameterX: 1, diameterY: 1, diameterZ: 1}, scene);
// sphere.physicsImpostor = new PhysicsImpostor(sphere, PhysicsImpostor.SphereImpostor, {mass:1}, scene);
// sphere.position.y = 1;

var box = MeshBuilder.CreateBox("Collider", {width: 1, height: 0.5, depth: 2}, scene);
var box1 = MeshBuilder.CreateBox("fakeHoverEngineFR", {size:0.25}, scene);
var box2 = MeshBuilder.CreateBox("fakeHoverEngineBR", {size:0.25}, scene);
var box3 = MeshBuilder.CreateBox("fakeHoverEngineBL", {size:0.25}, scene);
var box4 = MeshBuilder.CreateBox("fakeHoverEngineFL", {size:0.25}, scene);
var box5 = MeshBuilder.CreateBox("fakeHoverEngineCameraTarget", {size:0.25}, scene);

let root = new Mesh('', scene);
shadowGenerator.addShadowCaster(box);


root.addChild(box);
root.addChild(box1);
root.addChild(box2);
root.addChild(box3);
root.addChild(box4);
root.addChild(box5);

box1.position = new Vector3(0.5, 0, 1);
box2.position = new Vector3(0.5, 0, -1)
box3.position = new Vector3(-0.5, 0, -1);
box4.position = new Vector3(-0.5, 0, 1);



var matBox = new StandardMaterial("matBox", scene);
matBox.diffuseColor = new BABYLON.Color3(1.0, 0.1, 0.1);

box.material = matBox

var matBox1 = new StandardMaterial("matBox", scene);
 matBox1.diffuseColor = new BABYLON.Color3(0, 0, 1)
 box1.material = matBox1;
 box4.material = matBox1;

 let needStabilize = true;

 let obsticleBox = MeshBuilder.CreateBox('obstB1', {width: 10, height: 1, depth: 1}, scene);
 obsticleBox.physicsImpostor = new PhysicsImpostor(obsticleBox, PhysicsImpostor.BoxImpostor, {mass: 1, friction: 1}, scene);
 obsticleBox.position = new Vector3(0, 0.5, 2);


 engine.runRenderLoop(() => {
    scene.render();
});

// let hovercarTask = assetsManager.addMeshTask('hoverCar task', '', 'assets/', 'hover-car.gltf');
// hovercarTask.onSuccess =t => {
    // console.log(t.loadedMeshes)
    // let newMeshes = t.loadedMeshes;
    // var physicsRoot = new Mesh("physicsRoot", scene);
    var physicsRoot = root;
    // let car = t.loadedMeshes[0];
    let hoverEngines: AbstractMesh[] = [box1, box2, box3, box4];
    let frHover: AbstractMesh | null = box1;
    let flHover: AbstractMesh | null = box4;
    let brHover: AbstractMesh | null = box2;
    let blHover: AbstractMesh | null = box3;

    camera.lockedTarget = box5;

    // t.loadedMeshes[0].rotation = new Vector3(0, 0, 0);

    // newMeshes.forEach((m, i)=>{
    //     if(m.name.indexOf("Collider") != -1){
    //         m.isVisible = false
    //         physicsRoot.addChild(m)
    //     }

    //     if(m.name.includes('fakeHoverEngine')) {
    //         hoverEngines.push(m);
    //         if (m.name.includes('FR'))
    //             frHover = m;
    //         else if (m.name.includes('FL'))
    //             flHover = m;
    //         else if (m.name.includes('BL'))
    //             blHover = m;
    //         else if (m.name.includes('BR'))
    //             brHover = m;
    //         // m.isVisible = false;
    //         // physicsRoot.addChild(m);
    //         // m.physicsImpostor = new PhysicsImpostor(m, PhysicsImpostor.BoxImpostor, {mass: 0.1}, scene);
    //     }

    //     m.isPickable = false;
    // })

    // Add all root nodes within the loaded gltf to the physics root
    // newMeshes.forEach((m, i)=>{
    //     if(m.parent == null){
    //         m.position = Vector3.Zero();
    //         physicsRoot.addChild(m)
    //     }
    // })

    // Make every collider into a physics impostor
    physicsRoot.getChildMeshes().forEach((m)=>{
        m.isPickable = false;
        if(m.name.indexOf("Collider") != -1){
            m.scaling.x = Math.abs(m.scaling.x)
            m.scaling.y = Math.abs(m.scaling.y)
            m.scaling.z = Math.abs(m.scaling.z)
            m.physicsImpostor = new PhysicsImpostor(m, PhysicsImpostor.BoxImpostor, { mass: 0 }, scene);
        }
    })
    
    physicsRoot.physicsImpostor = new PhysicsImpostor(physicsRoot, PhysicsImpostor.NoImpostor, { mass: 100, friction: 1 }, scene);
    physicsRoot.position = new Vector3(0, 2, 0);

    function castRay(mesh: AbstractMesh){
        var origin = mesh.getAbsolutePosition();

	    var forward = new Vector3(0,-1,0);
	    forward = Vector3.TransformCoordinates(forward, mesh.getWorldMatrix());

	    var direction = forward.subtract(origin);
	    direction = Vector3.Normalize(direction);

	    var length = 7;

	    var ray = new Ray(origin, direction, length);

		let rayHelper = new RayHelper(ray);
		// rayHelper.show(scene);

        var hit = scene.pickWithRay(ray);

        if (hit && hit.hit && hit.pickedMesh && hit.pickedMesh.name !== 'ray'){
            // console.log(hit.pickedMesh)

           if (hit.distance < 2) {
               pulse(mesh, hit.distance, 2);
               needStabilize = true;
           }


           if (needStabilize) {
            stabilize(mesh, physicsRoot, box)
           }

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

        //fake drag
        let v = physicsRoot.physicsImpostor?.physicsBody ? physicsRoot.physicsImpostor?.getLinearVelocity() : null;
        if (v) {
            // console.log('pos', physicsRoot.getAbsolutePosition())
            let length = v.length();
            let normDir = v.normalizeToNew();
            
            normDir.negateInPlace()
            let dragMagnitude = Math.pow(length, 2) * 10;
            
            physicsRoot.physicsImpostor?.applyForce(normDir.scale(dragMagnitude), box.getAbsolutePosition());
            // var ray = new Ray(box.getAbsolutePosition(), normDir.scale(dragMagnitude), 20);

            // let rayHelper = new RayHelper(ray);
            // rayHelper.show(scene);

            // setTimeout(() => rayHelper.dispose(), 500)
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

        physicsRoot.physicsImpostor?.applyForce(direction.scale(forceMagnitude), mesh.getAbsolutePosition());

    }

    scene.onBeforeRenderObservable.add(()=>{
        var physicsRootOrigin = physicsRoot.getAbsolutePosition();
        let touque = 40;
        let f = 30

        if(inputMap["w"] || inputMap["ArrowUp"]){
            
            physicsRoot.physicsImpostor?.applyImpulse(
                Vector3.Normalize(Vector3.TransformCoordinates(Vector3.Forward(), box.getWorldMatrix()).subtract(box.getAbsolutePosition())).scale(f),
                box.getAbsolutePosition()
            )
        } 
        if((inputMap["a"] || inputMap["ArrowLeft"]) && frHover && blHover && physicsRoot){

            let fdirection = Vector3.Normalize(vecToLocal(Vector3.Left(), frHover).subtract(physicsRoot.getAbsolutePosition()));
            let bdirection = Vector3.Normalize(vecToLocal(Vector3.Right(), blHover).subtract(physicsRoot.getAbsolutePosition()));
            
            physicsRoot.physicsImpostor?.applyImpulse(
                fdirection.scale(touque),
                frHover.getAbsolutePosition()
            );
            physicsRoot.physicsImpostor?.applyImpulse(
                bdirection.scale(touque),
                blHover.getAbsolutePosition()
            )
        } 
        if(inputMap["s"] || inputMap["ArrowDown"]){
            physicsRoot.physicsImpostor?.applyImpulse(
                Vector3.Normalize(Vector3.TransformCoordinates(Vector3.Backward(), box.getWorldMatrix()).subtract(box.getAbsolutePosition())).scale(f),
                box.getAbsolutePosition()
            )
        } 
        if((inputMap["d"] || inputMap["ArrowRight"]) && flHover && brHover){
            let fdirection = Vector3.Normalize(vecToLocal(Vector3.Right(), flHover).subtract(physicsRootOrigin));
            let bdirection = Vector3.Normalize(vecToLocal(Vector3.Left(), brHover).subtract(physicsRootOrigin));
    
            physicsRoot.physicsImpostor?.applyImpulse(
                fdirection.scale(touque),
                flHover.getAbsolutePosition()
            );
            physicsRoot.physicsImpostor?.applyImpulse(
                bdirection.scale(touque),
                brHover.getAbsolutePosition()
            )
        }
        
        if(inputMap[" "]){
            needStabilize = false;
            physicsRoot.physicsImpostor?.applyImpulse(
                Vector3.Normalize(
                    Vector3.TransformCoordinates(Vector3.Up(), physicsRoot.getWorldMatrix()).subtract(physicsRootOrigin)).scale(50),
                physicsRootOrigin
            )
        }
    })
    
// }

assetsManager.load();

function degToRad(degree: number) {
    return degree / (180 / Math.PI);
}

function vecToLocal(vector: Vector3, mesh: AbstractMesh){
    var m = mesh.getWorldMatrix();
    var v = Vector3.TransformCoordinates(vector, m);
    return v;		 
}

function stabilize(he: AbstractMesh, phRoot: AbstractMesh, box: AbstractMesh) {
    
    let v = phRoot.physicsImpostor?.physicsBody ? phRoot.physicsImpostor?.getLinearVelocity() : null;

    if (v) {
        // console.log('pos', physicsRoot.getAbsolutePosition())
        let length = v.y;
        
        let dragMagnitude = new Vector3(0, -v.y, 0).scale(Math.abs(length) * 80);
        
        phRoot.physicsImpostor?.applyForce(dragMagnitude, box.getAbsolutePosition());
        // var ray = new Ray(box.getAbsolutePosition(), normDir.scale(dragMagnitude), 20);

        // let rayHelper = new RayHelper(ray);		
        // rayHelper.show(scene);

        // setTimeout(() => rayHelper.dispose(), 500)
    }
    
}
