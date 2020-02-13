import {Instruction, InstStatus} from '../models/Instruction';

export enum FUType {
  ARITHMETIC, MEMORY, MULTIFUNCTION
}

export class FunctionalUnit {

  private type: FUType;
  private busy: boolean;
  private countdown: number;
  private instruction: Instruction;

  constructor(type: FUType) {
    this.type = type;
    this.busy = false;
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
      this.busy = false;
      this.instruction.setStatus(InstStatus.DONE);
      this.instruction = null;
      // TODO Set the instruction status as done
    }
  }

  public isBusy(): boolean {
    return this.busy;
  }

  public isFinish(): boolean {
    return this.countdown === 0;
  }

  public reset() {
    this.instruction = null;
    this.countdown = 0;
    this.busy = false;
  }

  public getInstruction() {
    return this.instruction;
  }

  public removeInstruction() {
    this.instruction = null;
    this.busy = false;
  }

  public addInstruction(i: Instruction) {
    this.instruction = i;
    this.busy = true;
  }

}
