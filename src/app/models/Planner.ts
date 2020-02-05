import {Instruction, InstType} from './Instruction';

export class Planner {

    private instructions: Array<Instruction>;

    constructor(instructions: Array<Instruction>) {
        this.instructions = instructions;
        this.buildDependencies();
    }


    public printDependencies(): void {
        // @ts-ignore
        for (const instruction: Instruction of this.instructions) {
            console.log('Instruction: ' + instruction.getId());
            console.log('Deps: ' + instruction.getDependencies());
            console.log('\n');
        }
    }


    private buildDependencies() {
        let found = false;
        for (let i = 0; i < this.instructions.length - 1; i++) {
            const currentInstruction: Instruction = this.instructions[i];

            {
                {
                    if (currentInstruction.getType() !== InstType.ST) {
                        for (let j = i + 1; j < this.instructions.length && !found; j++) {
                            const otherInstruction: Instruction = this.instructions[j];


                            if (otherInstruction.getType() !== InstType.ST) {
                                if (otherInstruction.getType() === InstType.LD) {

                                    if (otherInstruction.getOP1() === currentInstruction.getDestination()
                                        || currentInstruction.getDestination() === otherInstruction.getOP2()) {
                                        currentInstruction.addDependency(otherInstruction.getIdString());
                                    }
                                }
                                if (otherInstruction.getOP1() === currentInstruction.getDestination()
                                    || currentInstruction.getDestination() === otherInstruction.getOP2()) {
                                    currentInstruction.addDependency(otherInstruction.getIdString());
                                }
                                if (currentInstruction.getDestination() === otherInstruction.getDestination()) {
                                    found = true;
                                }
                            } else {

                                if (otherInstruction.getDestination() === currentInstruction.getDestination()
                                    || currentInstruction.getDestination() === otherInstruction.getOP1()) {
                                    currentInstruction.addDependency(otherInstruction.getIdString());
                                }

                            }
                        }
                    }
                }
            }
            found = false;
        }
    }

}
