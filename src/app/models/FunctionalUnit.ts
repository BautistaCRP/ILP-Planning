import {Instruction} from '../models/Instruction';

export enum FUType {
    ARITHMETIC, MEMORY, MULTIFUNCTION
}
export class FunctionalUnit {

    private type: FUType;
    private available: boolean;
    private countdown: number;
    private instruction: Instruction;

    constructor(type: FUType) {
        this.type = type;
        this.available = true;
        this.countdown = 0;
        this.instruction = null;
    }

    public getType(): FUType {
        return this.type;
    }

    public setType(type: FUType) {
        this.type = type;
    }

    public updateTimer() {
        if (this.countdown < 0) {
            this.countdown--;
        }

        if (this.countdown === 0) {
            this.available = true;
            // TODO Set the instruction status as done
        }
    }

    public isAvailable(): boolean {
        return this.available;
    }

    public isFinish(): boolean {
        return this.countdown === 0;
    }

    public reset() {
        this.instruction = null;
        this.countdown = 0;
        this.available = true;
    }

}
