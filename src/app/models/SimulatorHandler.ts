import {Instruction} from "./Instruction";
import {ProcessorSettings} from "./ProcessorSettings";
import {Planner} from "./Planner";
import {Processor} from "./Processor";
import {GraphNode} from "./GraphNode";


export class SimulatorHandler {

  private processor: Processor;
  private planner: Planner;

  constructor(instrucciones: Array<Instruction>,processorSettings: ProcessorSettings) {
    this.planner = new Planner(instrucciones);

    this.processor = new Processor(instrucciones, processorSettings.degree,this.planner);
    this.processor.addUF(processorSettings.numFUArithmetic,
                         processorSettings.numFUMemory,
                         processorSettings.numFUMultifunction);
  }

  public nextCycle(){
    this.processor.nextCycle();
  }

  public getCycle(): number{
    return this.processor.getCycleCounter();
  }

  public getCP(): string{
    let CP: Array<GraphNode> = this.planner.getCP();
    let out: string = "";

    for (let i = 0; i < CP.length; i++) {
      if (i != (CP.length -1)){
        out += CP[i].getId()+",";
      } else{
        out += CP[i].getId();
      }
    }

    return out;
  }

  public getSelectedInstructions(): string{
    let selectedInstructions: Array<Instruction> = this.planner.getSelectedInstructions();
    let out: string = "";

    for (let i = 0; i < selectedInstructions.length; i++) {
      if (i != (selectedInstructions.length -1)){
        out += selectedInstructions[i].getId()+",";
      } else{
        out += selectedInstructions[i].getId();
      }
    }

    return out;
  }
}
