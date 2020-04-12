import { AssetsManager, Scene, AbstractMesh, PhotoDome } from "babylonjs";

export class AssetsLoader {
    private static _typeAssetsDefinitions: TypeAssetDefinitions = {};
    private static _typeLoadedAssets: TypeLoadedAssets = {};
    
    static loadedAssets(cls: Constructor<any>) {
        return this._typeLoadedAssets[cls.name];
    }

    static rootUrl: string = '';

    static defineAssets(cls: Constructor<any>, defs: AssetsDefinition) {
        this._typeAssetsDefinitions[cls.name] = defs;
    }

    private _scene: Scene;
    private _assetsManager: AssetsManager;

    constructor(scene: Scene) {
        this._scene = scene;
        this._assetsManager = new AssetsManager(this._scene);
    }

    addToLoading(cls: Constructor<any>) {
        
        let assetsDefs = AssetsLoader._typeAssetsDefinitions[cls.name];

        if (assetsDefs.meshes) {
            for (let [index, meshDef] of assetsDefs.meshes.entries()) {
                let task = this._assetsManager
                    .addMeshTask(`${cls.name}_mesh_${index}`, '', AssetsLoader.rootUrl, meshDef.url);
                    
                task.onSuccess = t => {
                                        
                    if (!AssetsLoader._typeLoadedAssets[cls.name]) {
                        AssetsLoader._typeLoadedAssets[cls.name] = {};
                    }

                    AssetsLoader._typeLoadedAssets[cls.name].meshes = t.loadedMeshes;
                };
            }
        }
    }

    async load(): Promise<Scene> {
        this._assetsManager.load();
        return new Promise((resolve) => {
            this._assetsManager.onTasksDoneObservable.add(() => {
                resolve(this._scene);
            })
        })
    }

}

export function Assets(resDefs: AssetsDefinition) {
    return function (target: Constructor<any>) {
        AssetsLoader.defineAssets(target, resDefs);
    };
}

type Constructor<T> = {new (...args: any) : T}

interface AssetsDefinition {
    meshes?: [{key: string; url: string}]
}
interface LoadedAssets {
    meshes?: AbstractMesh[] 
}

interface TypeAssetDefinitions {
    [k: string]: AssetsDefinition
}
interface TypeLoadedAssets {
    [k: string]: LoadedAssets
}

