import {ICameraInput, ArcRotateCamera, PointerEventTypes, PointerInfo, PointerTouch, Nullable, EventState, Observer} from "babylonjs";


export class PlayerCameraInput implements ICameraInput<ArcRotateCamera> {
    // @ts-ignore
    camera: ArcRotateCamera;

    getTypeName() {
        return 'PlayerCameraInput'
    };

    getClassName() {
        return 'PlayerCameraInputClass'
    };

    getSimpleName() {
        return 'playerMouse';
    };

    canvas: Nullable<HTMLElement> = null;

    private _pointerInput = (p: PointerInfo, s: EventState) => {
        let evt = <PointerEvent>p.event;

        if (p.type === PointerEventTypes.POINTERDOWN && !document.pointerLockElement) {

            try {
                if (this.canvas) {
                    this.canvas.requestPointerLock();
                }
            } catch (e) { }


        } else if (p.type === PointerEventTypes.POINTERMOVE && document.pointerLockElement === this.canvas) {
            this.camera.inertialAlphaOffset -= evt.movementX / 5000;
            // this.camera.inertialBetaOffset -= evt.movementY / 5000;
        }
    };

    private _observer: Nullable<Observer<PointerInfo>> = null;
    // private _onLostFocus: Nullable<(e: FocusEvent) => any>;
    private pointer: Nullable<PointerTouch> = null;
    private pointB: Nullable<PointerTouch> = null;


    attachControl (element: HTMLElement, noPreventDefault?: boolean) {

        this.canvas = this.camera.getEngine().getRenderingCanvas();

        this._observer = this.camera.getScene().onPointerObservable.add(
            this._pointerInput,
            PointerEventTypes.POINTERDOWN | PointerEventTypes.POINTERMOVE)
    };

    //detach control must deactivate your input and release all pointers, closures or event listeners
    detachControl(element: HTMLElement) {
        if (element && this._observer) {
            this.camera.getScene().onPointerObservable.remove(this._observer);
            this._observer = null;
        }

        if (this.canvas === document.pointerLockElement) {
            document.exitPointerLock();
        }

    } ;

    //this optional function will get called for each rendered frame, if you want to synchronize your input to rendering,
    //no need to use requestAnimationFrame. It's a good place for applying calculations if you have to
    checkInputs?: () => void;
}
