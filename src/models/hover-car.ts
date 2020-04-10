import { Scene, PhysicsImpostor, AbstractMesh, Mesh, MeshBuilder, Vector3, StandardMaterial, Ray, ActionManager, ExecuteCodeAction } from "babylonjs";



export class HoverCar {

    static hoverHeight: number = 2;
    static thrustMagnitude: number = 0.2;
    static torqueMagnitude: number = 0.07;
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
        
        
        //materials
        let carBodyM = new StandardMaterial("matBox", this._scene);
        carBodyM.diffuseColor = new BABYLON.Color3(1.0, 0.1, 0.1);
        let frontHoverEngineM = new StandardMaterial("matBox", this._scene);
        frontHoverEngineM.diffuseColor = new BABYLON.Color3(0, 0, 1)

        // meshes

        this._physicsRoot = new Mesh('p_root', this._scene);
        this._body = new Mesh('body_root', this._scene);
        
        let carBody = MeshBuilder.CreateBox("body", {width: 1, height: 0.5, depth: 2}, this._scene);
        carBody.material = carBodyM;
        
        this._hoverEngineFR = MeshBuilder.CreateBox("hoverEngineFR", {size:0.25}, this._scene);
        this._hoverEngineFL = MeshBuilder.CreateBox("hoverEngineFL", {size:0.25}, this._scene);
        this._hoverEngineBR = MeshBuilder.CreateBox("hoverEngineBR", {size:0.25}, this._scene);
        this._hoverEngineBL = MeshBuilder.CreateBox("hoverEngineBL", {size:0.25}, this._scene);
        this._cameraAnchor = MeshBuilder.CreateBox("cameraAncor", {size:0.1}, this._scene);
        // this._cameraAnchor.position.y = 3;
        this._cameraAnchor.isVisible = false;
        
        
        let collider = MeshBuilder.CreateBox("collider", {width: 1, height: 0.5, depth: 2}, this._scene);
        collider.physicsImpostor = new PhysicsImpostor(
            collider,
            PhysicsImpostor.BoxImpostor,
            {mass: 0},
            this._scene
        )
        collider.isVisible = false;

        
        this._hoverEngineFR.material = frontHoverEngineM;
        this._hoverEngineFL.material = frontHoverEngineM;

        //hierarchy
        this._physicsRoot.addChild(collider);
        this._physicsRoot.addChild(this._body);

        this._body.addChild(carBody);
        this._body.addChild(this._hoverEngineFR);
        this._body.addChild(this._hoverEngineFL);
        this._body.addChild(this._hoverEngineBR);
        this._body.addChild(this._hoverEngineBL);
        this._body.addChild(this.cameraAnchor);
        
        this._body.isPickable = false;
        this._body.getChildMeshes().forEach(m => m.isPickable = false);

        this._hoverEngineFR.position = new Vector3(0.5, 0, 1);
        this._hoverEngineFL.position = new Vector3(-0.5, 0, 1);
        this._hoverEngineBR.position = new Vector3(0.5, 0, -1);
        this._hoverEngineBL.position = new Vector3(-0.5, 0, -1);



        this._physicsRoot.physicsImpostor = new PhysicsImpostor(
            this._physicsRoot,
            PhysicsImpostor.NoImpostor,
            { mass: HoverCar.carMass, friction: 1 },
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
            let magnitude = Math.abs(v.y) * 0.8 * HoverCar.carMass;
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

        this._physicsRoot.applyImpulse(force, contactPoint)
    }

    private torque(clockWise: boolean) {
        let hoverEngineF = clockWise ? this._hoverEngineFL : this._hoverEngineFR;
        let hoverEngineB = clockWise ? this._hoverEngineBR : this._hoverEngineBL; 
        let fDirection = clockWise ? Vector3.Right() : Vector3.Left();
        let bDirection = fDirection.negate();
        let magnitude = HoverCar.torqueMagnitude * HoverCar.carMass;

        let fForce = Vector3.Normalize(
            vecToLocal(fDirection, hoverEngineF).subtract(this._body.getAbsolutePosition())
        ).scale(magnitude)

        let bForce = Vector3.Normalize(
            vecToLocal(bDirection, hoverEngineB).subtract(this._body.getAbsolutePosition())
        ).scale(magnitude)

        this._physicsRoot.physicsImpostor?.applyImpulse(fForce, hoverEngineF.getAbsolutePosition())
        this._physicsRoot.physicsImpostor?.applyImpulse(bForce, hoverEngineB.getAbsolutePosition())
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
    
            if(this._inputMap["w"] || this._inputMap["ArrowUp"]){
                this.thrust(Vector3.Forward());
            } 
            if((this._inputMap["a"] || this._inputMap["ArrowLeft"])){
                this.torque(false)
            } 
            if(this._inputMap["s"] || this._inputMap["ArrowDown"]){
                this.thrust(Vector3.Backward());
            } 
            if((this._inputMap["d"] || this._inputMap["ArrowRight"])){
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
