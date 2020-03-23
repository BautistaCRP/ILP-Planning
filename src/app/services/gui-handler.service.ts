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

  private _simulationOn: boolean;
  private _simulationOnSubjectQueue: BehaviorSubject<boolean>
    = new BehaviorSubject<boolean>(this._simulationOn);


  private _isFinish: boolean;
  private _isFinishSubjectQueue: BehaviorSubject<boolean>
    = new BehaviorSubject<boolean>(this._isFinish);

  private _editingConfigs: boolean = true;
  private _editingConfigsSubjectQueue: BehaviorSubject<boolean>
    = new BehaviorSubject<boolean>(this._editingConfigs);

  private _executing: boolean = false;
  private _executingSubjectQueue: BehaviorSubject<boolean>
    = new BehaviorSubject<boolean>(this._executing);



  constructor() {
    this.initInstructions();
    this._simulationOn = false;
    this._isFinish = false;
    this._isFinishSubjectQueue.next(this._isFinish);
    this._simulationOnSubjectQueue.next(this._simulationOn);
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
    this.__processorSettingsSubjectQueue.next(this._processorSettings)
    console.log('set processorSettings: ', this.processorSettings);
    this.updateAllInstructionsCycles();
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

  public saveCPUConfiguration(processorSettings: ProcessorSettings) {
    this._editingConfigs = false;
    this._executing = true;
    this._editingConfigsSubjectQueue.next(this._editingConfigs);
    this._executingSubjectQueue.next(this._executing);
    this.processorSettings = processorSettings;
    this._simulationOn = false;
    this._simulationOnSubjectQueue.next(this._simulationOn);

  }

  public nextCycleSimulation() {
    this.drawDiagram(this._simulatorHandler.getGraph());

    if (!this._isFinish) {
      this._simulatorHandler.nextCycle();
      let cycle: number = this._simulatorHandler.getCycle();
      let ps: string = this._simulatorHandler.getPS();
      let selectedInstructions: string = this._simulatorHandler.getSelectedInstructions();
      this.addSimulationStep(new SimulationStep(cycle, ps, selectedInstructions));
    }

    if (this._simulatorHandler.getGraph().isEmpty()) {
      this._isFinish = true;
      this._isFinishSubjectQueue.next(this._isFinish);
    }
  }

  public executeILP() {
    if (this._simulationOn)
      this.restartSimulation();
    else {
      this._simulatorHandler = new SimulatorHandler(this._instructions, this._processorSettings);
      this._simulationOn = true;
      this._simulationOnSubjectQueue.next(this._simulationOn);
      this._simulationSteps = new Array<SimulationStep>();
      this._simulationStepsSubjectQueue.next(this._simulationSteps);
    }
  }

  public restartSimulation() {
    this._simulatorHandler = new SimulatorHandler(this._instructions, this._processorSettings);
    this._isFinish = false;
    this._isFinishSubjectQueue.next(this._isFinish);
    this.drawDiagram(this._simulatorHandler.getGraph());
    this._simulationOn = true;
    this._simulationOnSubjectQueue.next(this._simulationOn);
    this._simulationSteps = new Array<SimulationStep>();
    this._simulationStepsSubjectQueue.next(this._simulationSteps);

  }

  public get planificatedOrder(): string {
    let out: string = "";

    this._simulationSteps.forEach(row => {
      if (row.chosenSetString !== "")
        out = out.concat(row.chosenSetString).concat(",");
    });

    return out;
  }


  // ~~~~~~~~~~~~~~~~~~~~ obsevable getters ~~~~~~~~~~~~~~~~~~~~

  public get observableEditingConfigs(): Observable<boolean> {
    return this._editingConfigsSubjectQueue.asObservable();
  }

  public get observableExecuting(): Observable<boolean> {
    return this._executingSubjectQueue.asObservable();
  }

  public get observableSimulationOn(): Observable<boolean> {
    return this._simulationOnSubjectQueue.asObservable();
  }

  public get observableProcessorSettings(): Observable<ProcessorSettings> {
    return this.__processorSettingsSubjectQueue.asObservable();
  }

  public get observableSimulationSteps(): Observable<SimulationStep[]> {
    return this._simulationStepsSubjectQueue.asObservable();
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

  public get observableDiagram(): Observable<Diagram> {
    return this._diagramSubjectQueue.asObservable();
  }

  public get observableInstructions(): Observable<Instruction[]> {
    return this._instructionsSubjectQueue.asObservable();
  }

  public get observableIsFinish(): Observable<boolean> {
    return this._isFinishSubjectQueue.asObservable();
  }

  public set diagram(diagram: Diagram) {
    this._diagram = diagram;
    this._diagramSubjectQueue.next(this.diagram);
    this.initDiagram();
    if (this._simulationOn) {
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

        new go.Binding("location", "loc", go.Point.parse),
        $(go.Shape, "RoundedRectangle",  // use this kind of figure for the Shape
          // bind Shape.fill to Node.data.color
          { fill: $(go.Brush, "Linear", { 0: "rgb(254, 201, 0)", 1: "rgb(254, 162, 0)" }), stroke: "black" },
          new go.Binding("fill", "color"),
        ),

        $(go.TextBlock,
          { margin: 3, textAlign: "center" },  // some room around the text
          // bind TextBlock.text to Node.data.key
          new go.Binding("text", "text"))
      );


    this.nodeDataArray = []
    this.linkDataArray = [];

    this._diagram.model = new go.GraphLinksModel(this.nodeDataArray, this.linkDataArray);

  }


  public drawDiagram(graph: Graph): void {
    this.nodeDataArray = [];
    this.linkDataArray = [];

    let rootNodes: GraphNode[] = graph.getRootNodes();
    let nodes: GraphNode[] = graph.getAllNodes();
    nodes.forEach(node => {
      let text: string = "";
      if (node.getET() !== -1 && !rootNodes.includes(node))
        text = node.getInstruction().getIdString() + "\n ET: " + node.getET();
      else
        text = node.getInstruction().getIdString();

      if (node.isCritical())
        this.nodeDataArray.push(
          {
            key: node.getInstruction().getId(),
            text: text,
            color: "lightblue"
          });
      else
        this.nodeDataArray.push(
          {
            key: node.getInstruction().getId(),
            text: text,
            loc: "0 0"
          });

      let dependencies: GraphNode[] = node.getDependencies();
      dependencies.forEach(nodeDep => {

        this.linkDataArray.push(
          {
            from: node.getInstruction().getId(),
            to: nodeDep.getInstruction().getId(),
            text: "(" + node.getInstLatency() + "," + node.getAcummLatency() + ")"
          });

      });

    });

    this._diagram.model = new go.GraphLinksModel(this.nodeDataArray, this.linkDataArray);
    let layout = new go.LayeredDigraphLayout();
    this._diagram.layout = layout;
    layout.direction = 90;
    layout.layerSpacing = 40;
    layout.columnSpacing = 30;
    layout.initializeOption = go.LayeredDigraphLayout.InitDepthFirstOut
    layout.layeringOption = go.LayeredDigraphLayout.LayerLongestPathSink


    this._diagramSubjectQueue.next(this._diagram);
  }


}
