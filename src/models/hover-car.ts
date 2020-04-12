import { Scene, PhysicsImpostor, AbstractMesh, Mesh, MeshBuilder, Vector3, StandardMaterial, Ray, ActionManager, ExecuteCodeAction, AssetsManager, Nullable } from "babylonjs";
import { AssetsLoader, Assets } from "./assets-loader";


@Assets({
    meshes: [{key: 'hoverCar', 'url': 'hover-car.gltf'}]
})
export class HoverCar {

    static hoverHeight: number = 2;
    static thrustMagnitude: number = 0.2;
    static torqueMagnitude: number = 0.2;
    static jumpMagnitude: number = 1;
    static carMass: number = 1000;

    private _physicsRoot: AbstractMesh;
    private _scene: Scene;
    private _hoverEngineFR: AbstractMesh;
    private _hoverEngineFL: AbstractMesh;
    private _hoverEngineBR: AbstractMesh;
    private _hoverEngineBL: AbstractMesh;
    private _body: AbstractMesh;
    private _cameraAnchor: AbstractMesh;
    private _inputMap: {[k: string]: boolean} = {};

    private _stabilizationEnabled: boolean = false;

    get cameraAnchor() {
        return this._cameraAnchor;
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
        this._cameraAnchor = MeshBuilder.CreateBox("cameraAncor", {size:0.1}, this._scene);
        this._cameraAnchor.isVisible = false;

        this._body = new Mesh('fake_body', this._scene);
        this._hoverEngineFR = new Mesh("fake_hoverEngineFR", this._scene);
        this._hoverEngineFL = new Mesh("fake_hoverEngineFL", this._scene);
        this._hoverEngineBR = new Mesh("fake_hoverEngineBR", this._scene);
        this._hoverEngineBL = new Mesh("fake_hoverEngineBL", this._scene);

        for (let mesh of meshes) {
            mesh.isPickable = false;

            switch (mesh.name) {    
                case '__root__':
                    mesh.rotation = new Vector3(0, 0, 0);
                    this._body.addChild(mesh);
                    this._body.addChild(this.cameraAnchor);
                    this._physicsRoot.addChild(this._body);
                    break;
                case 'car':
                    mesh.material = carBodyM
                    break;
                case 'hoverEngineFR':
                    this._hoverEngineFR = mesh;
                    break;
                case 'hoverEngineFL':
                    this._hoverEngineFL = mesh;
                    break;
                case 'hoverEngineBR':
                    this._hoverEngineBR = mesh;
                    break;
                case 'hoverEngineBL':
                    this._hoverEngineBL = mesh;
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

    public enableHoverEngines() {

        this.activateAngularDrag();
        this.activateDrag();

        let engines = [
            this._hoverEngineFR,
            this._hoverEngineFL,
            this._hoverEngineBR,
            this._hoverEngineBL
        ];

        this._stabilizationEnabled = true;

        this._scene.registerBeforeRender(() => {
            for (let engine of engines) {
                let ray = this.castRayFromEngine(engine);
                let pickingInfo = this._scene.pickWithRay(ray);
                
                if (pickingInfo 
                    && pickingInfo.hit 
                    && pickingInfo.pickedMesh?.name !== 'ray' // in case of showing rays
                ) {
                    if (pickingInfo.distance < HoverCar.hoverHeight) {
                        this.push(engine, pickingInfo.distance);
                    }
    
                    if (this._stabilizationEnabled) {
                        this.stabilize();
                    }
                }
    
            }
        })

        // this.activateAngularDrag();
    }

    private castRayFromEngine(engine: AbstractMesh) {
        let origin = engine.getAbsolutePosition();
        let direction = Vector3.Normalize(
            vecToLocal(Vector3.Down(), engine).subtract(origin),
        );
        let length = HoverCar.hoverHeight * 1.5;

        return new Ray(origin, direction, length);
    }

    private push(hoverEngine: AbstractMesh, distance: number) {
        let contactPoint = hoverEngine.getAbsolutePosition();
        let direction = Vector3.Normalize(
            vecToLocal(Vector3.Up(), hoverEngine).subtract(contactPoint)
        );
        let forceMagnitude = (1 - distance / HoverCar.hoverHeight) * HoverCar.carMass * 10;
        let force = direction.scale(forceMagnitude);

        this._physicsRoot.physicsImpostor?.applyForce(force, contactPoint);
    }

    private stabilize() {
        let v = this._physicsRoot.physicsImpostor?.getLinearVelocity();
        let contactPoint = this._body.getAbsolutePosition();
    
        if (v) {
            let magnitude = Math.abs(v.y) * 0.5 * HoverCar.carMass;
            let force = new Vector3(0, -v.y, 0).scale(magnitude);

            this._physicsRoot.physicsImpostor?.applyForce(force, contactPoint);
        }
    }

    private thrust(direction: Vector3) {
        let contactPoint = this._body.getAbsolutePosition();
        
        direction.normalize();
        let force = vecToLocal(direction, this._body)
            .subtract(contactPoint)
            .scale(HoverCar.thrustMagnitude * HoverCar.carMass)

        this._physicsRoot.physicsImpostor?.applyImpulse(force, contactPoint)
    }

    private torque(clockWise: boolean) {
        let hoverEngineF = clockWise ? this._hoverEngineFL : this._hoverEngineFR;
        let hoverEngineB = clockWise ? this._hoverEngineBR : this._hoverEngineBL; 
        let direction = clockWise ? Vector3.Right() : Vector3.Left();
        let magnitude = HoverCar.torqueMagnitude * HoverCar.carMass;

        let force = Vector3.Normalize(
            vecToLocal(direction, this._body).subtract(this._body.getAbsolutePosition())
        ).scale(magnitude)

        this._physicsRoot.physicsImpostor?.applyImpulse(force, hoverEngineF.getAbsolutePosition())
        this._physicsRoot.physicsImpostor?.applyImpulse(force.negate(), hoverEngineB.getAbsolutePosition())
    }

    private jump() {
        this._stabilizationEnabled = false;
        setTimeout(() => this._stabilizationEnabled = true, 300);
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
                this.thrust(Vector3.Forward());
            } 
            if(this._inputMap["a"]){
                this.torque(false)
            } 
            if(this._inputMap["s"]){
                this.thrust(Vector3.Backward());
            } 
            if(this._inputMap["d"]) {
                this.torque(true);
            }
            if(this._inputMap[" "]){
                this.jump();
            }
        })
    }

    
}


function vecToLocal(vec: Vector3, mesh: AbstractMesh) {
    return Vector3.TransformCoordinates(vec, mesh.getWorldMatrix());
}
