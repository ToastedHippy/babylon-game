import {ReactiveEngine} from "./reactive-engine";
import {Mesh, MeshBuilder} from "@babylonjs/core";
import {Chassis} from "./chassis";
import {Hoverbot} from "./hoverbot";

export class HoverbotBuilder {

    private _buildOptions: any;

    constructor(buildOptions: any) {
        this._buildOptions = buildOptions
    }

    public build() {
        let reMesh = MeshBuilder.CreateBox('re1', {size: 1});
        reMesh.addChild(MeshBuilder.CreateBox('re1.1', {size: 0.5}));

        let reactiveEngines = [new ReactiveEngine(reMesh)];
        let chsssis = new Chassis(MeshBuilder.CreateBox('ch1', {depth: 3, width: 2, height: 1}));

        for(let e of reactiveEngines) {
            chsssis.attachHoverEngine(e);
        }

        let hoverbot = new Hoverbot(chsssis);

        return hoverbot;
    }

}
