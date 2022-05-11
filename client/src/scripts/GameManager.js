import FigureFactor from "./classes/FigureFactor";
import Player from "./classes/Player";
import {PlayerTeams} from "./enums/PlayerTeams";
import FigureManager from "./FigureManager";
import MapCreator from "./MapCreator";
import createParticles from "./particles";
import Socket from "./Socket";
import {SceneInitializator} from "./managers/SceneInitializator";
import ModelsManager from "./ModelsManager";
import {UiHandlers} from "./managers/UiHandlers";
import {MouseKeyboardManager} from "./managers/MouseKeyboardManager";

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
        this.attackOption = false;
        this.turn = "";
        this.figuries = [];
        this.winTarget = 0;

        this.selectedFigure = null;
        this.selectFigureIdInUI = null;
        this.selectFigureTypeInUI = null;
    }

    async initDisplay(displayElement) {
        await ModelsManager.loadModels();
        this.sceneManager = await (new SceneInitializator(displayElement));
        this.mouseKeyboardManager = new MouseKeyboardManager(displayElement);
        this.update();

        new Socket("room");
    }

    async startGame() {
        MapCreator.instance.createMap(this.sceneManager.scene);
    }

    update() {
        this.sceneManager.update();
        requestAnimationFrame(this.update.bind(this));
    }

    setTurn(turn) {
        this.turn = turn;
        UiHandlers.instance.changeTurnText(this.turn);

    }

    endTurn() {
        this.setTurn(
            this.player.team === PlayerTeams.RED
                ? PlayerTeams.BLUE
                : PlayerTeams.RED
        );
        Socket.instance.endTurn();
        this.figuries.forEach((figure) => figure?.renew());
    }

    loadFigures(figures) {
        FigureManager.instance.figures = figures;
        UiHandlers.instance.setFiguresOnMenu({
            landArmy: FigureManager.instance.getLandArmy(),
            airArmy: FigureManager.instance.getAirArmy(),
            buildings: FigureManager.instance
                .getBuildings()
                ?.filter((building) => building.display),
        });
    }

    placeFigureAction(land) {
        if (this.selectedFigure != null) {
            this.selectedFigure.unHighLightMovePosition();
            this.selectedFigure = null;
        }
        if (this.selectFigureIdInUI == null) return;
        let figure = this.placeFigure(
            this.player.team,
            land.mapPositionX,
            land.mapPositionY,
            this.selectFigureIdInUI,
            this.selectFigureTypeInUI
        );
        Socket.instance.placeFigure(figure);
    }

    placeFigure(who, x, y, figureID, figureType) {
        let figureFactory = new FigureFactor();
        let figure = figureFactory.createFigure(
            who,
            x,
            y,
            figureID,
            figureType
        );
        this.figuries.push(figure);
        this.sceneManager.scene.add(figure);
        return figure;
    }

    removeFigure(x, y) {
        let figure = MapCreator.instance.mapObjects[x][y].figure;
        figure.onDestroy();
        this.sceneManager.scene.remove(figure);
        MapCreator.instance.mapObjects[x][y].figure = null;
    }
}

export const instance = GameManager.instance;
