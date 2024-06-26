import Dart from "./Dart.js";

class Player {
    constructor(name, baseScore) {
        this.name = name;
        this.baseScore = baseScore;
        this.darts = [];
        this.legs = 0;
    }

    score() {
        let score = this.baseScore;
        for(let dart of this.darts) {
            score -= dart.score();
        }
        return score;
    }

    average() {
        if(this.darts.length === 0) return 0;

        return Math.round((this.baseScore - this.score()) / this.darts.length);
    }

    possibleOuts() {
        return Player.calculateCombinations(this.score(), []);
    }

    addDart(dart) {
        this.darts.push(dart);
    }

    static findCheckoutCombinations(target, currentDarts = [], result = []) {
        if(target > 170) return [];


        // Base case: if target is zero and the last dart is a double or bullseye
        if (target === 0 && currentDarts.length > 0 &&
            (currentDarts[currentDarts.length - 1].modifier === 'd' ||
                (currentDarts[currentDarts.length - 1].number === 50))) {
            result.push([...currentDarts]);
            return result;
        }

        // Limit the depth of recursion to prevent too many darts
        if (currentDarts.length >= 3) {
            return result;
        }

        // Possible dart scores and modifiers
        const scores = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 25, 50];
        const modifiers = [null, 'd', 't']; // single, double, triple

        for (let score of scores) {
            for (let modifier of modifiers) {
                if (score > 20 && modifier !== null) continue;
                let dart = new Dart(score, modifier);
                let dartScore = dart.score();
                if (dartScore <= target) {
                    currentDarts.push(dart);
                    Player.findCheckoutCombinations(target - dartScore, currentDarts, result);
                    currentDarts.pop(); // Backtrack
                }
            }
        }

        return result;
    }

    static filterInefficientCombinations(combinations) {
        const seen = new Set();
        let newCombinations = combinations.filter(combo => {
            // Check if the combination is a duplicate
            const key = combo.map(dart => dart.name()).sort().join(',');
            if (seen.has(key)) return false;
            seen.add(key);

            // Check if the combination contains inefficient multiple triples
            let tripleCount = 0;
            for (let dart of combo) {
                if (dart.modifier === 't') {
                    tripleCount++;
                    if (tripleCount > 1) return false;
                }
            }

            return true;
        });


        let shortest = Math.min(...newCombinations.map((darts) => darts.length));
        return newCombinations.filter(combo => combo.length <= shortest);
    }

    static calculateCost(darts) {
        return darts.reduce((totalCost, dart) => {
            if (dart.modifier === 't') return totalCost + 4;
            if (dart.modifier === 'd') return totalCost + 3;
            if (dart.number === 50 || dart.number === 25) return totalCost + 5;
            return totalCost + 1; // Single
        }, 0);
    }

    static calculateCombinations(targetScore, currentDarts) {
        let result = [];

        // Try to find the combinations that sum up to the target score and end on a double or bullseye
        Player.findCheckoutCombinations(targetScore, currentDarts, result);

        // Filter out the combinations that don't end with a double or bullseye
        result = result.filter(darts => darts.length > 0 &&
            (darts[darts.length - 1].modifier === 'd' || darts[darts.length - 1].number === 50));

        // Filter out inefficient combinations
        result = Player.filterInefficientCombinations(result);

        // Sort combinations by cost
        result.sort((a, b) => Player.calculateCost(a) - Player.calculateCost(b));

        return result.splice(0, 5);
    }
}

export default Player;
