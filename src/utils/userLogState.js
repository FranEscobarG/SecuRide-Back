let sharedData = {
    activeUserlId: null,
};

function getActiveUserId() {
    return sharedData.activeUserlId;
}

function setActiveUserId(travelId) {
    sharedData.activeUserlId = travelId;
}

// travelState.js
module.exports = {
    getActiveUserId,
    setActiveUserId,
};

