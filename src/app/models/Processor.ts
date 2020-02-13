import {FunctionalUnit, FUType} from './FunctionalUnit';
import {Instruction, InstStatus} from './Instruction';
import {Planner} from "./Planner";

export class Processor {

  private uf: Array<FunctionalUnit>;
  private cycleCounter = 0;
  private listInstruction: Array<Instruction>;
  private planner: Planner;
  private grado;

  constructor(instrucciones: Array<Instruction>,grado: number) {
    this.listInstruction = instrucciones.slice(0);
    // this.setDependenciasRAW();
    this.uf = new Array<FunctionalUnit>();
    this.planner = new Planner(this.listInstruction);
    this.grado = grado;
  }

  public addUF(numArithmetic, numMemory, numMultifunction) {
    for (let i = 0; i < numMultifunction; i++) {
      this.uf.push(new FunctionalUnit(FUType.MULTIFUNCTION));
    }
    for (let i = 0; i < numArithmetic; i++) {
      this.uf.push(new FunctionalUnit(FUType.ARITHMETIC));
    }
    for (let i = 0; i < numMemory; i++) {
      this.uf.push(new FunctionalUnit(FUType.MEMORY));
    }
  }

  public getCycleCounter() {
    return this.cycleCounter;
  }

  public getUF() {
    return this.uf;
  }

  private removeInstructionUF() {
    for (let i = 0; i < this.uf.length; i++) {
      if (this.uf[i].getInstruction() !== null) {
        if (this.uf[i].getInstruction().getCycles() === 0) {
          this.uf[i].getInstruction().setStatus(InstStatus.DONE);
          this.uf[i].removeInstruction();
        }
      }
    }
  }

  private hasDependence(inst: Instruction) {
    for (let i = 0; i < this.uf.length; i++) {
      if (this.uf[i].getInstruction() !== null) {
        if (this.uf[i].getInstruction().existDependency(inst)) {
          return true;
        }
      }
    }
    return false;
  }

  private getUFFree(inst: Instruction) {
    for (let i = 0; i < this.uf.length; i++) {
      if (!this.uf[i].isBusy() && this.uf[i].getType() === inst.getFUType()) {
        return i;
      } else if ((!this.uf[i].isBusy() && this.uf[i].getType() === FUType.MULTIFUNCTION)) {
        return i;
      }
    }
    return -1;
  }

  private updateUf(){
    for (let i = 0; i < this.uf.length; i++) {
      if (this.uf[i].isBusy()){
        this.uf[i].updateTimer();
      }
    }
  }

  public nextCycle(){
    this.updateUf();

    let instructionsSelected: Array<Instruction> = this.planner.getInstructions(this.cycleCounter,this.grado,this.uf);

    console.log("Ciclo "+this.cycleCounter+":"+"  Seleccionadas:");
    instructionsSelected.forEach((instr) => {
      console.log(instr.getId());

      let posUF: number = this.getUFFree(instr);
      this.uf[posUF].addInstruction(instr);
    });

    this.cycleCounter += 1;
  }


}
