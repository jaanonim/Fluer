import MapCreator from "./MapCreator";
import * as THREE from "three";
import {
    OrbitControls
} from "three/examples/jsm/controls/OrbitControls";
import Player from "./classes/Player";
import MapLand from "./classes/MapLand";
import FigureFactor from "./classes/FigureFactor";
import ModelsManager from "./ModelsManager";
import ArmyFigure from "./classes/figures/ArmyFigure";
import {HighLightType} from "./enums/HighLightType";
import Socket from "./Socket";


export default class GameManager {
    static _instance = null;

    static get instance() {
        if (GameManager._instance == null) {
            GameManager._instance = new GameManager();
        }
        return GameManager._instance;
    }

    constructor() {
        //TODO: Change to create player on start game
        this.player = new Player("Player", "blue");
        this.lastHighLight = null;
        this.selectedFigure = null;
        this.selectFigureIdInUI = null;
        this.selectFigureTypeInUI = null;
    }

    async initDisplay(displayElement) {
        await ModelsManager.loadModels();

        //Initialization Scene
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer();

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        displayElement.innerHTML = "";
        displayElement.appendChild(this.renderer.domElement);
        MapCreator.instance.createMap(this.scene);

        //light
        const light = new THREE.DirectionalLight(0xffffff, 4);
        light.rotateX(45 * Math.PI / 180);
        this.scene.add(light);

        //Helpers
        this.cameraConrols = new OrbitControls(this.camera, this.renderer.domElement);
        const gridHelper = new THREE.GridHelper(100, 100);
        this.scene.add(gridHelper);
        this.camera.position.y = 25;
        this.camera.position.z = 35;
        this.update();

        //Add Listener for resizing screen
        window.addEventListener("resize", this.onWindowResize.bind(this));
        displayElement.addEventListener("mousedown", this.mouseClickInteration.bind(this));
        displayElement.addEventListener("mousemove", this.highlighting.bind(this));
        new Socket("room");
    }

    update() {
        requestAnimationFrame(this.update.bind(this));
        this.cameraConrols.update();
        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    onSelectFigureInUI(newId, type) {
        this.selectFigureIdInUI = newId;
        this.selectFigureTypeInUI = type;
    }


    highlighting(event) {
        const raycaster = new THREE.Raycaster();
        const mouseVector = new THREE.Vector2();
        mouseVector.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouseVector.y = -(event.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouseVector, this.camera);
        const intersects = raycaster.intersectObjects(this.scene.children);
        if (this.lastHighLight !== null)
            this.lastHighLight.unHighLight();
        this.lastHighLight = null;
        if (intersects.length > 0) {
            let intersectLand = intersects.find(obj => obj.object instanceof MapLand);
            if (intersectLand !== undefined) {
                this.lastHighLight = intersectLand.object;
                this.lastHighLight.highLight();
            }
        }
    }

    mouseClickInteration(event) {
        if (event.button === 0) {
            const raycaster = new THREE.Raycaster();
            const mouseVector = new THREE.Vector2();
            mouseVector.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouseVector.y = -(event.clientY / window.innerHeight) * 2 + 1;
            raycaster.setFromCamera(mouseVector, this.camera);
            const intersects = raycaster.intersectObjects(this.scene.children);
            console.log(intersects.length);
            if (intersects.length > 0) {
                let intersectLand = intersects.find(obj => obj.object instanceof MapLand);
                if (intersectLand !== undefined) {
                    let land = intersectLand.object;
                    //TODO: change to create selected object
                    if (land.figure !== null) {
                        this.selectFigure(land);
                        return;
                    }
                    if (this.selectedFigure !== undefined && land.hightLightType !== HighLightType.NONE) {
                        this.makeAction(land)
                    } else {
                        this.placeFigureAction(land);
                    }
                }
            }
        }
    }

    placeFigureAction(land) {
        if (this.selectedFigure != null) {
            this.selectedFigure.unHighLightMovePosition();
            this.selectedFigure = null;
        }
        if (this.selectFigureIdInUI == null) return;
        let figure = this.placeFigure(this.selectFigureIdInUI, land.mapPositionX, land.mapPositionY, this.selectFigureTypeInUI, this.player.team);
        Socket.instance.placeFigure(figure);
    }

    placeFigure(figureID, x, y, figureType, who) {

        let figureFactory = new FigureFactor();
        let figure = figureFactory.createFigure(figureID, x, y, figureType, who);
        this.scene.add(figure);
        return figure;
    }


    makeAction(land) {
        let x = land.mapPositionX;
        let y = land.mapPositionY;
        if (this.selectedFigure.canMove(x, y)) {
            this.selectedFigure.unHighLightMovePosition();
            let oldX = this.selectedFigure.mapPositionX;
            let oldY = this.selectedFigure.mapPositionY;
            if (this.moveFigure(this.selectedFigure, x, y)) {
                Socket.instance.moveFigure(oldX, oldY, x, y);
            }

            this.selectedFigure = null;
        }
    }

    moveFigure(figure, x, y) {
        let oldX = figure.mapPositionX;
        let oldY = figure.mapPositionY;
        if (figure.move(x, y)) {
            let oldLand = MapCreator.instance.mapObjects[oldX][oldY];
            oldLand.figure = null;
            return true
        }
        return false
    }

    selectFigure(land) {
        let figure = land.figure;
        if (this.selectedFigure !== null) {
            if (this.selectedFigure instanceof ArmyFigure) {
                this.selectedFigure.unHighLightMovePosition();
            }
        }
        if (figure instanceof ArmyFigure) {
            if (figure === this.selectedFigure) {
                figure.unHighLightMovePosition();
                this.selectedFigure = null;
            } else {
                figure.highLightMovePosition();
                this.selectedFigure = figure;
            }
        }
    }


}
