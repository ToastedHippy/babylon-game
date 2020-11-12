
import {Level, LevelConstructor} from "./level";
import {Engine, Nullable} from "@babylonjs/core";

export class Game {
    public engine: Engine;
    public activeLevel: Nullable<Level> = null;

    constructor(canvas: HTMLCanvasElement) {
        this.engine = new Engine(canvas);
        this.engine.runRenderLoop(() => {
            if (this.activeLevel) {
                this.activeLevel.render();
            }
        })
    }

    activateLevel(Level: LevelConstructor) {
        this.activeLevel = new Level(this.engine);
    }
}
