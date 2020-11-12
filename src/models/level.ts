import {AmmoJSPlugin, Engine, Nullable, Scene, Vector3} from "@babylonjs/core";

export interface LevelConfig {
    usePhysics: boolean;
}

export interface LevelConstructor {
    new (engine: Engine): Level
}

export class Level {
    static gravityVector: Nullable<Vector3>;

    private _config: Nullable<LevelConfig> = null;

    public scene: Scene;

    constructor(engine: Engine) {
        this.scene = new Scene(engine);
    }

    protected configure(config: LevelConfig) {
        this._config = config;

        if (this._config.usePhysics) {
            this.enablePhysics();
        }
    }

    private enablePhysics() {
        if (Level.gravityVector) {
            this.scene.enablePhysics(Level.gravityVector, new AmmoJSPlugin());
        } else {
            throw new Error('set Level.gravityVector');
        }

    }

    public render() {
        this.scene.render();
    }


}
