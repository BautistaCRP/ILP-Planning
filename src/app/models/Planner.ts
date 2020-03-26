import { Instruction, InstType } from './Instruction';
import { Graph } from './Graph';
import { GraphNode } from './GraphNode';
import { FunctionalUnit, FUType } from './FunctionalUnit';

export class Planner {

  private instructions: Array<Instruction>;
  private graph: Graph;
  private PS: Array<GraphNode>; // Planificated Set
  private instructionsSelected: Array<GraphNode>;

  constructor(instructions: Array<Instruction>) {
    this.instructions = instructions;
    this.buildDependencies();
    this.graph = new Graph();
    this.buildGraph();
    this.setETRootNodes();
  }


  public getInstructions(cycle: number, grado: number, fu: Array<FunctionalUnit>): Array<GraphNode> {
    this.buildPS(fu, cycle);
    this.updateInstructionsSelected(grado, fu);
    this.updateGraph(cycle);

    return this.instructionsSelected;
  }

  public getPS(): Array<GraphNode> {
    return this.PS;
  }

  public getSelectedInstructions(): Array<GraphNode> {
    return this.instructionsSelected;
  }

  public getGraph(): Graph {
    return this.graph;
  }

  public printDependencies(): void {
    // @ts-ignore
    for (const instruction: Instruction of this.instructions) {
      console.log('Instruction: ' + instruction.getId());
      console.log('Deps: ' + instruction.getDependencies());
      console.log('\n');
    }
  }

  private buildGraph() {
    for (let i = 0; i < this.instructions.length; i++) {
      const node: GraphNode = new GraphNode(this.instructions[i]);
      this.graph.addNode(this.instructions[i].getId(), node);
    }

    this.graph.buildDependencies();
    this.graph.initAllAcummLatencies();
    this.graph.buildCriticalPath();
    this.setETRootNodes();
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
                    currentInstruction.addDependency(otherInstruction.getId());
                  }
                }
                if (otherInstruction.getOP1() === currentInstruction.getDestination()
                  || currentInstruction.getDestination() === otherInstruction.getOP2()) {
                  currentInstruction.addDependency(otherInstruction.getId());
                }
                if (currentInstruction.getDestination() === otherInstruction.getDestination()) {
                  found = true;
                }
              } else {

                if (otherInstruction.getDestination() === currentInstruction.getDestination()
                  || currentInstruction.getDestination() === otherInstruction.getOP1()) {
                  currentInstruction.addDependency(otherInstruction.getId());
                }

              }
            }
          }
        }
      }
      found = false;
    }
  }

  private setETRootNodes() {
    let rootNodes: GraphNode[] = this.graph.getRootNodes();
    for (let i = 0; i < rootNodes.length; i++) {
      rootNodes[i].setET(0);
    }
  }

  private getFreeFU(inst: Instruction, fu: Array<FunctionalUnit>): number {
    for (let i = 0; i < fu.length; i++) {
      if (!fu[i].isBusy() && fu[i].getType() === inst.getFUType()) {
        return i;
      } else if ((!fu[i].isBusy() && fu[i].getType() === FUType.MULTIFUNCTION)) {
        return i;
      }
    }
    return -1;
  }

  private buildPS(fu: Array<FunctionalUnit>, cycle: number) {
    this.PS = this.graph.getNodesByET(cycle);

    //Elimino instrucciones que no pueden ser ejecutadas por falta de unidad funcional o dependecia
    let i: number = 0;
    while (i < this.PS.length) {
      if (this.getFreeFU(this.PS[i].getInstruction(), fu) == -1) {
        console.log("eliminar por falta de FU");
        this.PS.splice(i, 1);
      } else if (this.graph.hasDependencies(this.PS[i])) {
        console.log("eliminar por dep");
        this.PS.splice(i, 1);
      } else {
        i++;
      }
    }

    //Ordeno el conjunto de planificable segun nodos criticos
    this.PS.sort(function (a, b) {
      if (a.isCritical())
        return -1;
      else
        return 1;
    })

  }

  private updateInstructionsSelected(grado: number, fu: Array<FunctionalUnit>) {
    let instructions: Array<GraphNode> = new Array<GraphNode>();
    let ps: Array<GraphNode> = new Array<GraphNode>();

    this.PS.forEach((node) => {
      ps.push(node);
    });

    //Elijo del conjunto de planificable las n instrucciones. n = grado
    while (ps.length > grado) {
      ps.pop();
    }

    ps.forEach((node) => {
      instructions.push(node);
    });

    this.instructionsSelected = instructions;
  }

  private updateGraph(cycle: number) {

    //eliminación en el grafo los nodos elejidos
    this.instructionsSelected.forEach((node) => {
      node.getDependencies().forEach((nodeDep) => {
        console.log("node: " + node.getId());
        console.log("ET: " + (node.getInstLatency() + cycle));
        console.log("ET a: " + nodeDep.getId());
        this.graph.setETNode(nodeDep.getId(), node.getInstLatency() + cycle);
      });

      this.graph.deleteNode(node.getId());
    });
  }




}
