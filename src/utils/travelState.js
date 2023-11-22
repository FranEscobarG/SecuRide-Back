let sharedData = {
    activeTravelId: null,
};

function getActiveTravelId() {
    return sharedData.activeTravelId;
}

function setActiveTravelId(travelId) {
    sharedData.activeTravelId = travelId;
}

// travelState.js
module.exports = {
    getActiveTravelId,
    setActiveTravelId,
};

