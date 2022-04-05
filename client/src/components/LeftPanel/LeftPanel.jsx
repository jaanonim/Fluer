import FiguresPlaceSection from "../FiguresPlaceSection";
import styles from "./LeftPanel.module.css";
import {useState} from "react";
import FigureManager from "../../scripts/FigureManager";
import {FigureTypes} from "../../scripts/enums/FigureTypes";

function LeftPanel() {
    const [selectedFigureId, setSelectedFigureId] = useState(null);
    const [selectedFigureType, setSelectedFigureType] = useState(null);
    let landArmy = FigureManager.landArmy;
    return (
        <div className={`${styles.ui} ${styles.placementPanel}`}>
            <FiguresPlaceSection name="Land Army"
                                 figures={landArmy}
                                 select={selectedFigureType === FigureTypes.ARMY ? selectedFigureId : -1}
                                 selecting={(newId) => {
                                     setSelectedFigureId(newId);
                                     setSelectedFigureType(FigureTypes.ARMY);
                                 }}/>
            {/*<FiguresPlaceSection/>*/}
        </div>
    );
}

export default LeftPanel;
