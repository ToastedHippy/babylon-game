import { Vector3, AbstractMesh } from "babylonjs";

export let Utils = {
    vecToLocal(vec: Vector3, mesh: AbstractMesh) {
        return Vector3.TransformCoordinates(vec, mesh.getWorldMatrix());
    },

    degToRad(degree: number) {
        return degree / (180 / Math.PI);
    }
}