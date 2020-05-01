import { Scene, PhysicsImpostor, AbstractMesh, Mesh, MeshBuilder, Vector3, StandardMaterial, Ray, ActionManager, ExecuteCodeAction, AssetsManager, Nullable } from "babylonjs";
import { AssetsLoader, Assets } from "./assets-loader";
import { HoverEngine } from "./hover-engine";


@Assets({
    meshes: [{key: 'hoverCar', url: 'hover-car.gltf'}]
})
export class HoverCar {

    static set hoverHeight(value: number) {
        HoverEngine.hoverHeight = value;
    }

    static engineRotationSpeed = 0.03;
    static engineRotationLimit = 0.5;

    static jumpMagnitude: number = 1;
    static carMass: number = 1000;

    private _physicsRoot: AbstractMesh;
    private _scene: Scene;
    private _hoverEngineFR: HoverEngine;
    private _hoverEngineFL: HoverEngine;
    private _hoverEngineBR: HoverEngine;
    private _hoverEngineBL: HoverEngine;

    private get _hoverEngines() {
        return [this._hoverEngineFR, this._hoverEngineFL, this._hoverEngineBR, this._hoverEngineBL];
    }

    private _body: AbstractMesh;
    private _cameraTarget: AbstractMesh;
    private _inputMap: {[k: string]: boolean} = {};

    private _verticalStabilizationEnabled: boolean = false;

    get cameraTarget() {
        return this._cameraTarget;
    }

    get shadowCaster() {
        return this._body;
    }

    get position() {
        return this._physicsRoot.position;
    }

    set position(position: Vector3) {
        this._physicsRoot.position = position;
    }

    constructor(scene: Scene) {
        this._scene = scene;
        
        let meshes = AssetsLoader.loadedAssets(HoverCar).meshes;
        
        if (!meshes?.length) {
            throw new Error ('You must load hover car meshes first')
        }
        
        //materials
        let carBodyM = new StandardMaterial("matBox", this._scene);
        carBodyM.diffuseColor = new BABYLON.Color3(1.0, 0.1, 0.1);
        let frontHoverEngineM = new StandardMaterial("matBox", this._scene);
        frontHoverEngineM.diffuseColor = new BABYLON.Color3(0, 0, 1)

        this._physicsRoot = new Mesh('p_root', this._scene);
        this._cameraTarget = MeshBuilder.CreateBox("cameraAncor", {size:0.1}, this._scene);
        this._cameraTarget.isVisible = false;

        
        this._body = new Mesh('_body', this._scene);
        

        this._hoverEngineFR = new HoverEngine(new Mesh("fake_hoverEngineFR", this._scene), this._scene);
        this._hoverEngineFL = new HoverEngine(new Mesh("fake_hoverEngineFL", this._scene), this._scene);
        this._hoverEngineBR = new HoverEngine(new Mesh("fake_hoverEngineBR", this._scene), this._scene);
        this._hoverEngineBL = new HoverEngine(new Mesh("fake_hoverEngineBL", this._scene), this._scene);

        for (let mesh of meshes) {
            mesh.isPickable = false;
            let xLimit = 0.8;
            let zLimit = 0.9;

            switch (mesh.name) {    
                case '__root__':
                    mesh.rotation = new Vector3(0, 0, 0);
                    this._body.addChild(mesh);
                    this._body.addChild(this.cameraTarget);
                    this._physicsRoot.addChild(this._body);
                    break;
                case 'car':
                    mesh.material = carBodyM
                    break;
                case 'hoverEngineFR':
                    this._hoverEngineFR = new HoverEngine(mesh, this._scene, {rotationLimit: {x: [-xLimit, xLimit], z: [-zLimit, zLimit]}});
                    break;
                case 'hoverEngineFL':
                    this._hoverEngineFL = new HoverEngine(mesh, this._scene, {rotationLimit: {x: [-xLimit, xLimit], z: [-zLimit, zLimit]}});
                    break;
                case 'hoverEngineBR':
                    this._hoverEngineBR = new HoverEngine(mesh, this._scene, {rotationLimit: {x: [-xLimit, xLimit], z: [-zLimit, zLimit]}});
                    break;
                case 'hoverEngineBL':
                    this._hoverEngineBL = new HoverEngine(mesh, this._scene, {rotationLimit: {x: [-xLimit, xLimit], z: [-zLimit, zLimit]}});
                    break;
                case 'boxCollider': 
                    mesh.physicsImpostor = new PhysicsImpostor(
                        mesh,
                        PhysicsImpostor.BoxImpostor,
                        {mass: 0},
                        this._scene
                    )
                    mesh.isVisible = false;
                    this._physicsRoot.addChild(mesh);
                    break;
            }
        }

        this._physicsRoot.physicsImpostor = new PhysicsImpostor(
            this._physicsRoot,
            PhysicsImpostor.NoImpostor,
            { mass: HoverCar.carMass, friction: 10 },
            this._scene
        )

    }

    private activateAngularDrag() {
        this._scene.registerBeforeRender(() => {
            let v = this._physicsRoot.physicsImpostor?.getAngularVelocity();
        
            if (v) {
                this._physicsRoot.physicsImpostor?.setAngularVelocity(v.scale(0.9))
            }
        })
    }

    private activateDrag() {
        this._scene.registerBeforeRender(() => {
            let v = this._physicsRoot.physicsImpostor?.getLinearVelocity();
        
            if (v) {
                let length = v.length();
                let normDir = v.normalizeToNew();
                
                normDir.negateInPlace()
                let dragMagnitude = Math.pow(length, 2) * 10;
                
                this._physicsRoot.physicsImpostor?.applyForce(normDir.scale(dragMagnitude), this._body.getAbsolutePosition());
            }
        })
    }

    public startHoverEngines() {

        if (this._physicsRoot.physicsImpostor) {

            this.activateAngularDrag();
            this.activateDrag();

            
            for (let engine of this._hoverEngines) {
                if (engine) {
                    engine.start(this._physicsRoot.physicsImpostor);
                }
            }
            
            this._verticalStabilizationEnabled = true;

            this._scene.registerBeforeRender(() => {
        
                if (this._verticalStabilizationEnabled) {
                    this.stabilize();
                }
                
            });
        }
    }

    private stabilize() {
        let v = this._physicsRoot.physicsImpostor?.getLinearVelocity();
        let contactPoint = this._body.getAbsolutePosition();
    
        if (v) {
            let magnitude = Math.abs(v.y) * 6 * HoverCar.carMass;
            let force = new Vector3(0, -v.y, 0).scale(magnitude);

            this._physicsRoot.physicsImpostor?.applyForce(force, contactPoint);
        }
    }

    private move(direction: EMoveDirections) {

        let rotation = new Vector3(0, 0, 0);

        switch (direction) {
            case EMoveDirections.forward:
                rotation = new Vector3(-1*HoverCar.engineRotationSpeed,0,0);
                break;
            case EMoveDirections.backward:
                rotation = new Vector3(1*HoverCar.engineRotationSpeed,0,0);
                break;
            case EMoveDirections.right:
                rotation = new Vector3(0,0,-1*HoverCar.engineRotationSpeed);
                break;
            case EMoveDirections.left:
                rotation = new Vector3(0,0,1*HoverCar.engineRotationSpeed);
                break;
            default:
                break;
        }
        
        for(let engine of this._hoverEngines) {
            engine.rotate(rotation);
        }
        
    }

    private turn(direction: ETurnDirections) {
        let fRotation = new Vector3(0, 0, 0);
        let bRotation = new Vector3(0, 0, 0);



        switch(direction) {
            case ETurnDirections.right:
                fRotation = new Vector3(0, 0, 1*HoverCar.engineRotationSpeed)
                bRotation = new Vector3(0, 0, -1*HoverCar.engineRotationSpeed)
                break;
            case ETurnDirections.left:
                fRotation = new Vector3(0, 0, -1*HoverCar.engineRotationSpeed)
                bRotation = new Vector3(0, 0, 1*HoverCar.engineRotationSpeed)
                break;
            default:
                break;
        }

        this._hoverEngineFR?.rotate(fRotation)
        this._hoverEngineFL?.rotate(fRotation)

        this._hoverEngineBR?.rotate(bRotation)
        this._hoverEngineBL?.rotate(bRotation)
    }

    private jump() {
        this._verticalStabilizationEnabled = false;
        setTimeout(() => this._verticalStabilizationEnabled = true, 300);
        let magnitude = HoverCar.jumpMagnitude * HoverCar.carMass;
        this._physicsRoot.physicsImpostor?.applyImpulse(
            Vector3.Normalize(vecToLocal(Vector3.Up(), this._body).subtract(this._body.getAbsolutePosition())).scale(magnitude),
            this._body.getAbsolutePosition()
        )
    }

    public initControls() {
        this._scene.actionManager = new ActionManager(this._scene);
        
        this._scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyDownTrigger, (evt) => {								
            this._inputMap[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
        }));

        this._scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyUpTrigger, (evt) => {								
            this._inputMap[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
        }));

        this._scene.onBeforeRenderObservable.add(()=>{
    
            if(this._inputMap["w"]){
                this.move(EMoveDirections.forward);
            } 
            if(this._inputMap["a"]){
                this.turn(ETurnDirections.right);
            } 
            if(this._inputMap["s"]){
                this.move(EMoveDirections.backward);
            } 
            if(this._inputMap["d"]) {
                this.turn(ETurnDirections.left);
            }
            if(this._inputMap[" "]){
                this.jump();
            }
            if(this._inputMap["e"]) {
                this.move(EMoveDirections.right);
            }
            if(this._inputMap["q"]) {
                this.move(EMoveDirections.left);
            }
        })
    }

    
}


function vecToLocal(vec: Vector3, mesh: AbstractMesh) {
    return Vector3.TransformCoordinates(vec, mesh.getWorldMatrix());
}


enum EMoveDirections {
    forward,
    backward,
    right,
    left
}

enum ETurnDirections {
    right,
    left
}