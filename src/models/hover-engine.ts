import { AbstractMesh, Vector3, Nullable, PhysicsImpostor, Ray, Scene } from "babylonjs";
import { Utils } from "./utils";

export class HoverEngine {

    static hoverHeight: number = 2;

    private _scene: Scene;
    private _mesh: AbstractMesh;
    private _rotationLimit: Nullable<IRotationLimit>;
    private _rotation: Vector3; //temp. Figure out how to get local rotation
    public get rotation() {
        return this._rotation;
    }
    private _minTrustMultiplier = 10;
    private _maxTrustMultiplier = 20;
    private _thrustMultiplier: number;

    constructor(mesh: AbstractMesh, scene: Scene, props?: IHoverEngineProps) {
        this._scene = scene;
        this._mesh = mesh;
        this._rotationLimit = props?.rotationLimit ?? null;
        this._rotation = Vector3.Zero();
        this._thrustMultiplier = this._minTrustMultiplier;
    }

    private inRotationLimit(vec: Vector3) {
        if (!this._rotationLimit) {
            return true
        }

        return (this._rotationLimit.x ? vec.x >= this._rotationLimit.x[0] && vec.x <= this._rotationLimit.x[1] : true)
        && (this._rotationLimit.y ? vec.y >= this._rotationLimit.y[0] && vec.y <= this._rotationLimit.y[1] : true)
        && (this._rotationLimit.z ? vec.z >= this._rotationLimit.z[0] && vec.z <= this._rotationLimit.z[1] : true);
    }

    rotate(vec: Vector3) {
        let newRotation = this._rotation.add(vec);

        if(this.inRotationLimit(newRotation)) {
            this._rotation = newRotation;
            this._mesh.addRotation(vec.x, vec.y, vec.z);
        }
    }

    increaceThrustPowerToMax(value: number) {
        this._thrustMultiplier += value;

        if (this._thrustMultiplier > this._maxTrustMultiplier) {
            this._thrustMultiplier = this._maxTrustMultiplier;
        }
    }

    decreaceThrustPowerToMin(value: number) {
        this._thrustMultiplier -= value;

        if (this._thrustMultiplier < this._minTrustMultiplier) {
            this._thrustMultiplier = this._minTrustMultiplier;
        }
    }

    start(physicsImpostor: PhysicsImpostor) {
        this._scene.registerBeforeRender(() => {
            let ray = this.castRay();
            let pickingInfo = this._scene.pickWithRay(ray);
            
            if (pickingInfo 
                && pickingInfo.hit 
                && pickingInfo.pickedMesh?.name !== 'ray' // in case of showing rays
            ) {
                if (pickingInfo.distance < HoverEngine.hoverHeight) {
                    this.thrust(physicsImpostor, pickingInfo.distance);
                }
            }

        })
    }

    stop() {

    }

    thrust(physicsImpostor: PhysicsImpostor, distance: number) {
        let contactPoint = this._mesh.getAbsolutePosition();
        let direction = Vector3.Normalize(
            Utils.vecToLocal(Vector3.Up(), this._mesh).subtract(contactPoint)
        );
        let forceMagnitude = (1 - distance / HoverEngine.hoverHeight) * physicsImpostor.mass * this._thrustMultiplier;
        let force = direction.scale(forceMagnitude);

        physicsImpostor.applyForce(force, contactPoint);
        console.log(this._mesh.name, force)
    }

    private castRay() {
        let origin = this._mesh.getAbsolutePosition();
        let direction = Vector3.Normalize(
            Utils.vecToLocal(Vector3.Down(), this._mesh).subtract(origin),
        );
        let length = HoverEngine.hoverHeight * 1.5;

        return new Ray(origin, direction, length);
    }




}

interface IHoverEngineProps {
    rotationLimit?: IRotationLimit
}

interface IRotationLimit {x?: [number, number], y?: [number, number], z?: [number, number]}