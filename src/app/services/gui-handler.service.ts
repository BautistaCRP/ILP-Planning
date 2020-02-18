import { Instruction } from './../models/Instruction';
import { SimulationStep } from './../models/SimulationStep';
import { ProcessorSettings } from '../models/ProcessorSettings';
import { FUType } from 'src/app/models/FunctionalUnit';
import { Instruction, InstType } from 'src/app/models/Instruction';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Processor } from '../models/Processor';
import {SimulatorHandler} from "../models/SimulatorHandler";

@Injectable({
  providedIn: 'root'
})
export class GuiHandlerService {

  private _instructions: Array<Instruction> = new Array<Instruction>();

  private _instructionsSubjectQueue: BehaviorSubject<Instruction[]>
    = new BehaviorSubject<Instruction[]>(this._instructions);

  private _simulationSteps: Array<SimulationStep> = new Array<SimulationStep>();

  private _simulationStepsSubjectQueue: BehaviorSubject<Array<SimulationStep>>
    = new  BehaviorSubject<Array<SimulationStep>> (this._simulationSteps);


  private _processorSettings: ProcessorSettings = new ProcessorSettings();
  private __processorSettingsSubjectQueue: BehaviorSubject<ProcessorSettings>
    = new BehaviorSubject<ProcessorSettings> (this._processorSettings);

  private _simulatorHandler: SimulatorHandler;

  constructor() {
    this.initInstructions();
    this.initSteps();
  }

  get observableInstructions(): Observable<Instruction[]> {
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

  private addSimulationStep(step: SimulationStep){
    this._simulationSteps.push(step);
    this._simulationStepsSubjectQueue.next(this._simulationSteps);
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

  private initSteps(){
    this._simulationSteps.push(new SimulationStep(1,'I1,I2,I3','I5,I6'));
    this._simulationSteps.push(new SimulationStep(2,'I1,I2,I3','I5,I6'));
    this._simulationSteps.push(new SimulationStep(3,'I1,I2,I3','I5,I6'));
    this._simulationSteps.push(new SimulationStep(4,'I1,I2,I3','I5,I6'));
    this._simulationSteps.push(new SimulationStep(5,'I1,I2,I3','I5,I6'));
  }

  private recalculateID() {
    for (let i: number = 0; i < this._instructions.length; i++) {
      this._instructions[i].setId(i + 1);
    }
  }

  public get observableProcessorSettings(): Observable<ProcessorSettings> {
    return this.__processorSettingsSubjectQueue.asObservable();
  }

  public get processorSettings(): ProcessorSettings {
    return this._processorSettings;
  }

  public set processorSettings(value: ProcessorSettings) {
    this._processorSettings = value;
    this.__processorSettingsSubjectQueue.next(this._processorSettings)
    console.log('set processorSettings: ', this.processorSettings);
    this.updateAllInstructionsCycles();
  }

  public get observableSimulationSteps(): Observable<SimulationStep[]>{
    return this._simulationStepsSubjectQueue.asObservable();
  }

  private updateAllInstructionsCycles() {
    this._instructions.forEach((instruction) => {
      this.updateInstructionCycle(instruction);
    });
  }

  private updateInstructionCycle(instruction: Instruction) {
    switch (instruction.getType()) {
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
    this._simulatorHandler = new SimulatorHandler(this._instructions, this._processorSettings);
  }

  public nextCycleSimulation(){
    this._simulatorHandler.nextCycle();
    let cycle: number = this._simulatorHandler.getCycle();
    let cp: string = this._simulatorHandler.getCP();
    let selectedInstructions = this._simulatorHandler.getSelectedInstructions();
    this.addSimulationStep(new SimulationStep(cycle,cp,selectedInstructions));

  }

  public restartSimulation(){

  }

}
