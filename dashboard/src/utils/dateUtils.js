// frontend/src/utils/dateUtils.js

export const getDaysSinceHarvest = (harvestDate) => {
    const today = new Date();
    const harvest = new Date(harvestDate);
    const diffTime = Math.abs(today - harvest);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays;
};

export const getFreshnessStatus = (daysSinceHarvest) => {
    if (daysSinceHarvest <= 3) {
        return { status: 'Very Fresh', color: 'text-green-600' };
    } else if (daysSinceHarvest <= 7) {
        return { status: 'Fresh', color: 'text-blue-600' };
    } else if (daysSinceHarvest <= 14) {
        return { status: 'Still Good', color: 'text-yellow-600' };
    } else {
        return { status: 'May be Perished', color: 'text-red-600' };
    }
};