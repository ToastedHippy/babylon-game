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
    static movingMultiplier = .4;
    static turningMultiplier = .25;

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
                    this._hoverEngineFR = new HoverEngine(mesh, this._scene);
                    break;
                case 'hoverEngineFL':
                    this._hoverEngineFL = new HoverEngine(mesh, this._scene);
                    break;
                case 'hoverEngineBR':
                    this._hoverEngineBR = new HoverEngine(mesh, this._scene);
                    break;
                case 'hoverEngineBL':
                    this._hoverEngineBL = new HoverEngine(mesh, this._scene);
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
        let contactPoint = this._body.getAbsolutePosition();
        let directionVec = Vector3.Zero();

        switch (direction) {
            case EMoveDirections.forward:
                directionVec = Vector3.Forward();
                break;
            case EMoveDirections.backward:
                directionVec = Vector3.Backward();
                break;
            case EMoveDirections.right:
                directionVec = Vector3.Right();
                break;
            case EMoveDirections.left:
                directionVec = Vector3.Left();
                break;
        }

        let force = vecToLocal(directionVec, this._body)
            .subtract(contactPoint)
            .scale(HoverCar.movingMultiplier * HoverCar.carMass)

        this._physicsRoot.physicsImpostor?.applyImpulse(force, contactPoint)
    }

    private turn(direction: ETurnDirections) {
        let frontEngine = direction === ETurnDirections.right ? this._hoverEngineFL : this._hoverEngineFR;
        let backEngine = direction === ETurnDirections.right ? this._hoverEngineBR : this._hoverEngineBL;

        let directionVec = direction === ETurnDirections.right ? Vector3.Right() : Vector3.Left();
        let magnitude = HoverCar.turningMultiplier * HoverCar.carMass;

        let force = Vector3.Normalize(
            vecToLocal(directionVec, this._body).subtract(this._body.getAbsolutePosition())
        ).scale(magnitude)

        this._physicsRoot.physicsImpostor?.applyImpulse(force, frontEngine.mesh.getAbsolutePosition())
        this._physicsRoot.physicsImpostor?.applyImpulse(force.negate(), backEngine.mesh.getAbsolutePosition())
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
                this.turn(ETurnDirections.left);
            } 
            if(this._inputMap["s"]){
                this.move(EMoveDirections.backward);
            } 
            if(this._inputMap["d"]) {
                this.turn(ETurnDirections.right);
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
