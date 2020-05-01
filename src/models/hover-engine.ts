import { AbstractMesh, Vector3, Nullable, PhysicsImpostor, Ray, Scene, Observable } from "babylonjs";
import { Utils } from "./utils";
import { HoverCar } from "./hover-car";
import {BehaviorSubject} from "rxjs"

export class HoverEngine {

    static hoverHeight = 2;
    static thrustMultiplier = 50;

    private _scene: Scene;
    private _mesh: AbstractMesh;
    private _rotationLimit: Nullable<IRotationLimit>;
    private _rotation$: BehaviorSubject<Vector3>; //temp. Figure out how to get local rotation

    public get rotation$() {
        return this._rotation$;
    }
    private _thrustMultiplier: number;

    public get rotation() {
        return this._rotation$.value;
    }

    constructor(mesh: AbstractMesh, scene: Scene, props?: IHoverEngineProps) {
        this._scene = scene;
        this._mesh = mesh;
        this._rotationLimit = props?.rotationLimit ?? null;
        this._rotation$ = new BehaviorSubject(Vector3.Zero());
        this._thrustMultiplier = 1;
    }

    private inRotationLimit(vec: Vector3) {
        if (!this._rotationLimit) {
            return true
        }

        return (this._rotationLimit.x ? vec.x >= this._rotationLimit.x[0] && vec.x <= this._rotationLimit.x[1] : true)
        && (this._rotationLimit.y ? vec.y >= this._rotationLimit.y[0] && vec.y <= this._rotationLimit.y[1] : true)
        && (this._rotationLimit.z ? vec.z >= this._rotationLimit.z[0] && vec.z <= this._rotationLimit.z[1] : true);
    }

    setThrustMultiplier(value: number) {
        if (value > 0) {
            this._thrustMultiplier = value;
        }
    }

    rotate(vec: Vector3) {
        let newRotation = this.rotation.add(vec);

        if(this.inRotationLimit(newRotation)) {
            this._mesh.addRotation(vec.x, vec.y, vec.z);
            this._rotation$.next(newRotation);
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
        let forceMagnitude = (1 - distance / HoverEngine.hoverHeight) * physicsImpostor.mass * HoverEngine.thrustMultiplier * this._thrustMultiplier;
        let force = direction.scale(forceMagnitude);
        console.log(this._mesh.name, force)

        physicsImpostor.applyForce(force, contactPoint);
    }

    private castRay() {
        let origin = this._mesh.getAbsolutePosition();
        let direction = Vector3.Normalize(
            Utils.vecToLocal(Vector3.Down(), (this._mesh.parent?.parent as AbstractMesh)).subtract((this._mesh.parent?.parent as AbstractMesh).getAbsolutePosition()),
        );

        let length = HoverEngine.hoverHeight * 1.5;

        return new Ray(origin, direction, length);
    }




}

interface IHoverEngineProps {
    rotationLimit?: IRotationLimit
}

interface IRotationLimit {x?: [number, number], y?: [number, number], z?: [number, number]}