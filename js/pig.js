// ============================================================
// PigFit - Pig
// ============================================================

export const WEIGHT_GAIN_PER_HOUR = 0.05;


// ============================================================
// Update Pig Weight
// ============================================================

export function updatePigWeight(data) {
    const now = Date.now();

    const elapsedMilliseconds =
        now - data.lastUpdatedAt;

    if (elapsedMilliseconds <= 0) {
        return;
    }

    const elapsedHours =
        elapsedMilliseconds /
        (1000 * 60 * 60);

    const gainedWeight =
        elapsedHours *
        WEIGHT_GAIN_PER_HOUR;

    data.weight += gainedWeight;

    data.lastUpdatedAt = now;
}


// ============================================================
// Pig Status
// ============================================================

export function getPigStatus(weight) {

    if (weight < 8) {
        return {
            label: "TOO SKINNY",
            meter: 10,
            sprite: "skinny",
            message:
                "我已經太瘦了啦！"
        };
    }


    if (weight < 10) {
        return {
            label: "FIT",
            meter: 25,
            sprite: "fit",
            message:
                "FIT！"
        };
    }


    if (weight < 12) {
        return {
            label: "HEALTHY",
            meter: 40,
            sprite: "healthy",
            message:
                "微肉最健康！"
        };
    }


    if (weight < 14) {
        return {
            label: "CHUBBY",
            meter: 60,
            sprite: "chubby",
            message:
                "我好像開始圓起來了……"
        };
    }


    if (weight < 17) {
        return {
            label: "FAT",
            meter: 80,
            sprite: "fat",
            message:
                "你們是不是最近偷懶了！"
        };
    }


    return {
        label: "MEGA PIG",
        meter: 100,
        sprite: "mega",
        message:
            "救命！快去運動！！！"
    };
}


// ============================================================
// Prevent Invalid Weight
// ============================================================

export function normalizePigWeight(data) {
    data.weight =
        Math.max(0, data.weight);
}