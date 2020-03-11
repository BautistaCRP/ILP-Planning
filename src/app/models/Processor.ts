import { FunctionalUnit, FUType } from './FunctionalUnit';
import { Instruction, InstStatus } from './Instruction';
import { Planner } from "./Planner";
import { GraphNode } from "./GraphNode";

export class Processor {

  private fu: Array<FunctionalUnit>;
  private cycleCounter = 0;
  private listInstruction: Array<Instruction>;
  private planner: Planner;
  private degree: number;

  constructor(instrucciones: Array<Instruction>, degree: number, planner: Planner) {
    this.listInstruction = instrucciones.slice(0);
    this.fu = new Array<FunctionalUnit>();
    this.planner = planner;
    this.degree = degree;
  }

  public addFU(numArithmetic, numMemory, numMultifunction) {
    for (let i = 0; i < numMultifunction; i++) {
      this.fu.push(new FunctionalUnit(FUType.MULTIFUNCTION));
    }
    for (let i = 0; i < numArithmetic; i++) {
      this.fu.push(new FunctionalUnit(FUType.ARITHMETIC));
    }
    for (let i = 0; i < numMemory; i++) {
      this.fu.push(new FunctionalUnit(FUType.MEMORY));
    }
  }

  public getCycleCounter() {
    return this.cycleCounter;
  }

  public getFU() {
    return this.fu;
  }

  private removeInstructionFU() {
    for (let i = 0; i < this.fu.length; i++) {
      if (this.fu[i].getInstruction() !== null) {
        if (this.fu[i].getInstruction().getCycles() === 0) {
          this.fu[i].getInstruction().setStatus(InstStatus.DONE);
          this.fu[i].removeInstruction();
        }
      }
    }
  }

  private hasDependence(inst: Instruction) {
    for (let i = 0; i < this.fu.length; i++) {
      if (this.fu[i].getInstruction() !== null) {
        if (this.fu[i].getInstruction().existDependency(inst)) {
          return true;
        }
      }
    }
    return false;
  }

  private getFreeFU(inst: Instruction) {
    for (let i = 0; i < this.fu.length; i++) {
      if (!this.fu[i].isBusy() && this.fu[i].getType() === inst.getFUType()) {
        return i;
      } else if ((!this.fu[i].isBusy() && this.fu[i].getType() === FUType.MULTIFUNCTION)) {
        return i;
      }
    }
    return -1;
  }

  private updateFU() {
    for (let i = 0; i < this.fu.length; i++) {
      if (this.fu[i].isBusy()) {
        this.fu[i].updateTimer();
      }
    }
  }

  public nextCycle(): void {
    this.updateFU();

    let instructionsSelected: Array<GraphNode> = this.planner.getInstructions(this.cycleCounter, this.degree, this.fu);

    console.log("Ciclo " + this.cycleCounter + ":" + "  Seleccionadas:");
    instructionsSelected.forEach((instr) => {
      console.log(instr.getId());

      let posFU: number = this.getFreeFU(instr.getInstruction());
      this.fu[posFU].addInstruction(instr.getInstruction());
    });

    this.cycleCounter += 1;
  }


}
