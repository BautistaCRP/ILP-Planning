import {ProcessorSettings} from '../models/ProcessorSettings';
import {FUType} from 'src/app/models/FunctionalUnit';
import {Instruction, InstType} from 'src/app/models/Instruction';
import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {Processor} from '../models/Processor';

@Injectable({
  providedIn: 'root'
})
export class GuiHandlerService {

  private _instructions: Array<Instruction> = new Array<Instruction>();

  private _instructionsSubjectQueue: BehaviorSubject<Instruction[]>
    = new BehaviorSubject<Instruction[]>(this._instructions);

  private _processorSettings: ProcessorSettings = new ProcessorSettings();

  private _processor: Processor;

  constructor() {
    this.initInstructions();
  }

  get instructions() {
    return this._instructionsSubjectQueue.asObservable();
  }

  addInstruction(inst: Instruction) {
    inst.setId(this._instructions.length + 1);
    this.updateInstructionCycle(inst);
    this._instructions.push(inst);
    this._instructionsSubjectQueue.next(this._instructions);
  }

  deleteInstruction(inst: Instruction) {
    const index = this._instructions.indexOf(inst);
    if (index !== -1) {
      this._instructions.splice(index, 1);
      this.recalculateID();
      this._instructionsSubjectQueue.next(this._instructions);
    }
  }

  private initInstructions() {
    this._instructions.push(new Instruction(1, InstType.LD, FUType.MEMORY, 1, 6));
    this._instructions.push(new Instruction(2, InstType.LD, FUType.MEMORY, 2, 6));
    this._instructions.push(new Instruction(3, InstType.ADD, FUType.ARITHMETIC, 3, 1, 2));
    this._instructions.push(new Instruction(4, InstType.LD, FUType.MEMORY, 4, 6));
    this._instructions.push(new Instruction(5, InstType.LD, FUType.MEMORY, 5, 6));
    this._instructions.push(new Instruction(6, InstType.DIV, FUType.ARITHMETIC, 6, 4, 5));
    this._instructions.push(new Instruction(7, InstType.ADD, FUType.ARITHMETIC, 7, 3, 6));
  }

  private recalculateID() {
    for (let i: number = 0; i < this._instructions.length; i++) {
      this._instructions[i].setId(i + 1);
    }
  }

  public get processorSettings(): ProcessorSettings {
    return this._processorSettings;
  }

  public set processorSettings(value: ProcessorSettings) {
    this._processorSettings = value;
    console.log('set processorSettings: ', this.processorSettings);
    this.updateAllInstructionsCycles();
  }

  private updateAllInstructionsCycles(){
    this._instructions.forEach((instruction) => {
      this.updateInstructionCycle(instruction);
    });
  }

  private updateInstructionCycle(instruction: Instruction){
    switch (instruction.getType()){
      case InstType.ADD:
        instruction.setCycles(this._processorSettings.latencyADD);
        break;

      case InstType.SUB:
        instruction.setCycles(this._processorSettings.latencySUB);
        break;

      case InstType.MUL:
        instruction.setCycles(this._processorSettings.latencyMUL);
        break;

      case InstType.DIV:
        instruction.setCycles(this._processorSettings.latencyDIV);
        break;

      case InstType.LD:
        instruction.setCycles(this._processorSettings.latencyLD);
        break;

      case InstType.ST:
        instruction.setCycles(this._processorSettings.latencyST);
        break;
    }
  }

  public executeILP() {
    this._processor = new Processor(this._instructions, this._processorSettings.degree);
    this._processor.addUF(this._processorSettings.numFUArithmetic,
                          this._processorSettings.numFUMemory,
                          this._processorSettings.numFUMultifunction);
  }

  public nextCycleSimulation(){
    this._processor.nextCycle();
  }

  public restartSimulation(){

  }

}
