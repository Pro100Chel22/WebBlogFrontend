export { SUBSCRIBER, ADMINISTRATOR, GAR_ADDRESS_LEVEL_ENUM }

const SUBSCRIBER = 'Subscriber';
const ADMINISTRATOR = 'Administrator';

const GAR_ADDRESS_LEVEL_ENUM = {
    Region: "Субъект РФ",
    AdministrativeArea: "Административный район",
    MunicipalArea: "Муниципальный район", 
    RuralUrbanSettlement: "Сельское/городское поселение",
    City: "Город",
    Locality: "Населенный пункт",
    ElementOfPlanningStructure: "Элемент планировочной структуры",
    ElementOfRoadNetwork: "Элемент улично-дорожной сети",
    Land: "Земельный участок",
    Building: "Здание (сооружение)",
    Room: "Помещение",
    RoomInRooms: "Помещения в пределах помещения",
    AutonomousRegionLevel: "Уровень автономного округа (устаревшее)",
    IntracityLevel: "Уровень внутригородской территории (устаревшее)",
    AdditionalTerritoriesLevel: "Уровень дополнительных территорий (устаревшее)",
    LevelOfObjectsInAdditionalTerritories: "Уровень объектов на дополнительных территориях (устаревшее)",
    CarPlace: "Машино-место"
}