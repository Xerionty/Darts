class Dart {
    constructor(number, modifier) {
        this.number = number;
        this.modifier = modifier;
    }

    score() {
        if(this.number > 20) return this.number;

        if(this.modifier === 'd') {
            return this.number * 2;
        } else if(this.modifier === 't') {
            return this.number * 3;
        }

        return this.number;
    }

    name() {
        if(this.number === 25) return 'BULL';
        if(this.number === 50) return 'BULLSEYE';
        if(!this.modifier) return this.number;
        return this.modifier.toUpperCase() + this.number;
    }
}

export default Dart;
