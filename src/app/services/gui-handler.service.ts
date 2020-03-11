import { GraphNode } from './../models/GraphNode';
import { Graph } from './../models/Graph';
import { Diagram } from 'gojs';
import * as go from 'gojs';
import { SimulationStep } from './../models/SimulationStep';
import { ProcessorSettings } from '../models/ProcessorSettings';
import { FUType } from 'src/app/models/FunctionalUnit';
import { Instruction, InstType } from 'src/app/models/Instruction';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Processor } from '../models/Processor';
import { SimulatorHandler } from "../models/SimulatorHandler";

@Injectable({
  providedIn: 'root'
})
export class GuiHandlerService {

  private _instructions: Array<Instruction> = new Array<Instruction>();

  private _instructionsSubjectQueue: BehaviorSubject<Instruction[]>
    = new BehaviorSubject<Instruction[]>(this._instructions);

  private _simulationSteps: Array<SimulationStep> = new Array<SimulationStep>();

  private _simulationStepsSubjectQueue: BehaviorSubject<Array<SimulationStep>>
    = new BehaviorSubject<Array<SimulationStep>>(this._simulationSteps);


  private _processorSettings: ProcessorSettings = new ProcessorSettings();
  private __processorSettingsSubjectQueue: BehaviorSubject<ProcessorSettings>
    = new BehaviorSubject<ProcessorSettings>(this._processorSettings);

  private _simulatorHandler: SimulatorHandler;

  private simulationOn: boolean;


  constructor() {
    this.initInstructions();
    this.simulationOn = false;
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

  private addSimulationStep(step: SimulationStep) {
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

  public get observableSimulationSteps(): Observable<SimulationStep[]> {
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
    console.log("executeILP IN SERVICE");
    this._simulatorHandler = new SimulatorHandler(this._instructions, this._processorSettings);
    this.simulationOn = true;
  }

  public nextCycleSimulation() {
    this._simulatorHandler.nextCycle();
    let cycle: number = this._simulatorHandler.getCycle();
    let ps: string = this._simulatorHandler.getPS();
    let selectedInstructions: string = this._simulatorHandler.getSelectedInstructions();
    this.addSimulationStep(new SimulationStep(cycle, ps, selectedInstructions));
    this.drawDiagram(this._simulatorHandler.getGraph());
    
  }

  public restartSimulation() {

  }


  // ~~~~~~~~~~~~~~~~~~~~~~~~~ DIAGRAM ~~~~~~~~~~~~~~~~~~~~~~~~~
  
  private _diagram: Diagram;
  private _diagramSubjectQueue: BehaviorSubject<Diagram> =
    new BehaviorSubject<Diagram>(this._diagram);

  
  private nodeDataArray: Array<Object>;
  private linkDataArray: Array<Object>;

  public get diagram(): Diagram {
    return this._diagram;
  }

  get observableDiagram(): Observable<Diagram> {
    return this._diagramSubjectQueue.asObservable();
  }

  get observableInstructions(): Observable<Instruction[]> {
    return this._instructionsSubjectQueue.asObservable();
  }

  public set diagram(diagram: Diagram) {
    this._diagram = diagram;
    this._diagramSubjectQueue.next(this.diagram);
    this.initDiagram();
    if(this.simulationOn){
      this.drawDiagram(this._simulatorHandler.getGraph());
    }
  }

  private initDiagram() {

    let $ = go.GraphObject.make;
    this._diagram.linkTemplate =
      $(go.Link,  // the whole link panel
        $(go.Shape,  // the link shape
          { stroke: "black" }),
        $(go.Shape,  // the arrowhead
          { toArrow: "standard", stroke: null }),
        $(go.Panel, "Auto",
          $(go.Shape,  // the label background, which becomes transparent around the edges
            {
              fill: $(go.Brush, "Radial", { 0: "rgb(240, 240, 240)", 0.3: "rgb(240, 240, 240)", 1: "rgba(240, 240, 240, 0)" }),
              stroke: null
            }),
          $(go.TextBlock,  // the label text
            {
              textAlign: "center",
              font: "10pt helvetica, arial, sans-serif",
              stroke: "#555555",
              margin: 4
            },
            new go.Binding("text", "text"))
        )
      );

    this._diagram.nodeTemplate =
      $(go.Node, "Auto",  // the Shape automatically fits around the TextBlock

        $(go.Shape, "RoundedRectangle",  // use this kind of figure for the Shape
          // bind Shape.fill to Node.data.color
          { fill: $(go.Brush, "Linear", { 0: "rgb(254, 201, 0)", 1: "rgb(254, 162, 0)" }), stroke: "black" },
          new go.Binding("fill", "color")),

        $(go.TextBlock,
          { margin: 3 },  // some room around the text
          // bind TextBlock.text to Node.data.key
          new go.Binding("text", "text"))
      );

    this.nodeDataArray = []
    this.linkDataArray = [];

    this._diagram.model = new go.GraphLinksModel(this.nodeDataArray, this.linkDataArray);

  }


  public drawDiagram(graph: Graph): void{
    this.nodeDataArray = [];
    this.linkDataArray = [];

    let nodes: GraphNode[] = graph.getAllNodes();
    nodes.forEach(node => {
      this.nodeDataArray.push({key: node.getInstruction().getId(), text: node.getInstruction().getIdString()});
      let dependencies: GraphNode[] = node.getDependencies();
      dependencies.forEach(nodeDep => {

        this.linkDataArray.push(
          { from: node.getInstruction().getId(), 
            to: nodeDep.getInstruction().getId(), 
            text: "("+node.getInstLatency()+","+node.getAcummLatency()+")" });

      });

    });

    this._diagram.model = new go.GraphLinksModel(this.nodeDataArray, this.linkDataArray);
    this._diagramSubjectQueue.next(this._diagram);

    

  }


}
