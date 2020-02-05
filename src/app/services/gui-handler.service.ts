import { FUType } from 'src/app/models/FunctionalUnit';
import { Instruction, InstType } from 'src/app/models/Instruction';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GuiHandlerService {

  private instructions: Array<Instruction> = new Array<Instruction>();
  private instructionsSubjectQueue: BehaviorSubject<Instruction[]>
    = new BehaviorSubject<Instruction[]>(this.instructions);

  constructor() {
    this.initInstructions();
  }

  testByLog(msg: string) {
    console.log(msg);
  }


  getInstructions() {
    return this.instructionsSubjectQueue.asObservable();
  }

  addInstruction(inst: Instruction) {
    inst.setId(this.instructions.length + 1);
    this.instructions.push(inst);
    this.instructionsSubjectQueue.next(this.instructions);
  }

  deleteInstruction(inst: Instruction) {
    const index = this.instructions.indexOf(inst);
    if (index !== -1) {
      this.instructions.splice(index, 1);
      this.recalculateID();
      this.instructionsSubjectQueue.next(this.instructions);
    }
  }

  private initInstructions() {
    this.instructions.push(new Instruction(1, InstType.LD, FUType.MEMORY, 1, 6));
    this.instructions.push(new Instruction(2, InstType.LD, FUType.MEMORY, 2, 6));
    this.instructions.push(new Instruction(3, InstType.ADD, FUType.ARITHMETIC, 3, 1, 2));
    this.instructions.push(new Instruction(4, InstType.LD, FUType.MEMORY, 4, 6));
    this.instructions.push(new Instruction(5, InstType.LD, FUType.MEMORY, 5, 6));
    this.instructions.push(new Instruction(6, InstType.DIV, FUType.ARITHMETIC, 6, 4, 5));
    this.instructions.push(new Instruction(7, InstType.ADD, FUType.ARITHMETIC, 7, 3, 6));
  }

  private recalculateID() {
    for (let i: number = 0; i < this.instructions.length; i++) {
      this.instructions[i].setId(i + 1);
    }
  }

}
