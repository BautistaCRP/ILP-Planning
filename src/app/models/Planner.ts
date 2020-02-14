import {Instruction, InstType} from './Instruction';
import {Graph} from './Graph';
import {GraphNode} from './GraphNode';
import {FunctionalUnit, FUType} from './FunctionalUnit';

export class Planner {

    private instructions: Array<Instruction>;
    private graph: Graph;
    private CP: Array<GraphNode>;
    private selectedInstructions: Array<GraphNode>;

    constructor(instructions: Array<Instruction>) {
        this.instructions = instructions;
        this.buildDependencies();
        this.graph = new Graph();
        this.buildGraph();
        this.setETRootNodes();
    }

    private buildGraph(){
      for (let i = 0; i < this.instructions.length; i++) {
        const node: GraphNode = new GraphNode(this.instructions[i]);
        this.graph.addNode(this.instructions[i].getId(),node);
      }

      this.graph.buildDependencies();
      this.graph.setAllAcummLatency();
      this.graph.buildCriticalPath();
      this.setETRootNodes();
    }

    private setETRootNodes(){
      let rootNodes: GraphNode[] = this.graph.getRootNodes();
      for (let i = 0; i < rootNodes.length; i++) {
        rootNodes[i].setET(0);
      }
    }

    public printDependencies(): void {
        // @ts-ignore
        for (const instruction: Instruction of this.instructions) {
            console.log('Instruction: ' + instruction.getId());
            console.log('Deps: ' + instruction.getDependencies());
            console.log('\n');
        }
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

  private getUFFree(inst: Instruction, uf: Array<FunctionalUnit>) {
    for (let i = 0; i < uf.length; i++) {
      if (!uf[i].isBusy() && uf[i].getType() === inst.getFUType()) {
        return i;
      } else if ((!uf[i].isBusy() && uf[i].getType() === FUType.MULTIFUNCTION)) {
        return i;
      }
    }
    return -1;
  }

  private buildCP(uf: Array<FunctionalUnit>,cycle: number){
    this.CP = this.graph.getNodesByET(cycle);

    //Elimino instrucciones que no pueden ser ejecutadas por falta de unidad funcional o dependecia
    let i: number = 0;
    while (i < this.CP.length){
      if (this.getUFFree(this.CP[i].getInstruction(),uf) == -1){
        console.log("eliminar por falta de FU");
        this.CP.splice( i, 1 );
      } else if (this.graph.hasDependencies(this.CP[i])){
        console.log("eliminar por dep");
        this.CP.splice( i, 1 );
      } else{
        i++;
      }
    }

    //Ordeno eñ conjunto de planificable segun nodos criticos
    this.CP.sort(function (a, b) {
      if (a.isCritical())
        return -1;
      else
        return 1;
    })

  }

  private getInstructionsSelected(grado: number, uf: Array<FunctionalUnit>){
    let instructions: Array<GraphNode> = new Array<GraphNode>();
    let cp: Array<GraphNode> = new Array<GraphNode>();

    this.CP.forEach((node) => {
      cp.push(node);
    });

    //Elijo del conjunto de planificable las n instrucciones. n = grado
    while (cp.length > grado){
      cp.pop();
    }

    cp.forEach((node) => {
      instructions.push(node);
    });

    return instructions;
  }

  private updateGraph(cycle: number){

    //eliminación en el grafo los nodos elejidos
    this.selectedInstructions.forEach((node) => {
      node.getDependencies().forEach((nodeDep) => {
        console.log("node: "+node.getId());
        console.log("ET: "+ (node.getInstLatency()+cycle));
        console.log("ET a: "+ nodeDep.getId());
        this.graph.setETNode(nodeDep.getId(),node.getInstLatency()+cycle);
      });

      this.graph.deleteNode(node.getId());
    });
  }

  public getInstructions(cycle: number, grado: number, uf: Array<FunctionalUnit>) {
    this.buildCP(uf,cycle);
    this.selectedInstructions = this.getInstructionsSelected(grado,uf);
    this.updateGraph(cycle);

    return this.selectedInstructions;
  }

  public getCP(){
      return this.CP;
  }

  public getSelectedInstructions(){
      return this.selectedInstructions;
  }

}
