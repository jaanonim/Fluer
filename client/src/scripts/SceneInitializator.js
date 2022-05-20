import Stats from "stats-js";
import * as THREE from "three";
import Camera from "./classes/Camera";

export class SceneInitializator {
    constructor(displayElement) {
        return new Promise(async (resolve) => {
            await this.initDisplay(displayElement);
            resolve(this);
        });
    }

    async initDisplay(displayElement) {
        //Initialization Scene
        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        displayElement.innerHTML = "";
        displayElement.appendChild(this.renderer.domElement);
        this.renderer.domElement.addEventListener(
            'webglcontextlost',
            (event) => {
                event.preventDefault();
                setTimeout(() => {
                    console.log("RESTORE");
                    this.renderer.forceContextRestore();
                }, 100);
            },
            false
        );

        //Light
        const light = new THREE.DirectionalLight(0xffffff, 3, 100);
        light.position.set(10, 20, 10);
        light.castShadow = true;
        this.scene.add(light);

        const light2 = new THREE.DirectionalLight(0xffffff, 1, 100);
        light2.position.set(-10, -20, -10);
        this.scene.add(light2);

        //Camera
        this.camera = new Camera(displayElement, 75);

        //Inits
        this.initHelpers();
        this.initShadows(light);
    }

    initHelpers() {
        //Stats
        this.stats = new Stats();
        this.stats.showPanel(0);
        document.body.appendChild(this.stats.dom);
    }

    initShadows(light) {
        const shadowSize = 100;
        light.shadow.camera.left = -shadowSize;
        light.shadow.camera.right = shadowSize;
        light.shadow.camera.top = shadowSize;
        light.shadow.camera.bottom = -shadowSize;
        light.shadow.blurSamples = 1;
        light.shadow.mapSize.width = 1024 * 64;
        light.shadow.mapSize.height = 1024 * 64;
        light.shadow.camera.near = 0.5;
        light.shadow.camera.far = 100;
    }

    update(delta) {
        this.stats.begin();
        this.scene.children.forEach((child) => {
            if (child.update !== undefined) child.update(delta);
        });
        this.camera.update(delta, this.scene);
        this.stats.end();
    }
}
