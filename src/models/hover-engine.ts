import { AbstractMesh, Vector3, Nullable, PhysicsImpostor, Ray, Scene, Observable } from "babylonjs";
import { Utils } from "./utils";
import { HoverCar } from "./hover-car";
import {BehaviorSubject} from "rxjs"

export class HoverEngine {

    static hoverHeight = 2;
    static thrustMultiplier = 10;

    private _scene: Scene;
    private _mesh: AbstractMesh;

    get mesh() {
        return this._mesh;
    }

    constructor(mesh: AbstractMesh, scene: Scene) {
        this._scene = scene;
        this._mesh = mesh;
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
        let forceMagnitude = (1 - distance / HoverEngine.hoverHeight) * physicsImpostor.mass * HoverEngine.thrustMultiplier;
        let force = direction.scale(forceMagnitude);

        physicsImpostor.applyForce(force, contactPoint);
    }

    private castRay() {
        let origin = this._mesh.getAbsolutePosition();
        let direction = Vector3.Normalize(
            Utils.vecToLocal(Vector3.Down(), this._mesh).subtract(this._mesh.getAbsolutePosition()),
        );

        let length = HoverEngine.hoverHeight * 1.5;

        return new Ray(origin, direction, length);
    }

}
