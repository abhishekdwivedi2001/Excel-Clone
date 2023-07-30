for(let i=0;i<rows;i++){
    for(let j=0;j<cols;j++){
        let cell=document.querySelector(`.cell[rid="${i}"][cid="${j}"]`);        
        cell.addEventListener("blur",(e)=>{
            let address=addressBar.value;
            let [activeCell,cellProp]=getCellAndCellProp(address);
            let enteredData=activeCell.innerText;
            if(enteredData==cellProp.value)
                return;
            else{
                cellProp.value=enteredData;
                //If data is hard coded, remove formula, remove it from its parents and update children
                removeChildFromParent(cellProp.formula);
                cellProp.formula="";
                updateChildrenCells(address);
            }
        });
    }
}

let formulaBar=document.querySelector(".formula-bar");
 formulaBar.addEventListener("keydown",async (e)=>{
    let inputFormula=formulaBar.value;

    if(e.key=="Enter" && inputFormula){
        let address=addressBar.value;
        let [cell,cellProp]=getCellAndCellProp(address);
        
        if(inputFormula!=cellProp.formula){
            removeChildFromParent(cellProp.formula);
            removeChildFromGraphComponent(cellProp.formula,address);
        }

        addChildToGraphComponent(inputFormula,address);
        
        //Check if cycle is formed or not
        let cycleResponse=isGraphCyclic(graphComponentMatrix);

        if(cycleResponse){
            let response=confirm("Your formula is cyclic. Do you want to trace your path?");

            while(response===true){
                await isGraphCyclicTracePath(graphComponentMatrix,cycleResponse);
                response=confirm("Your formula is cyclic. Do you want to trace your path?");
            }

            removeChildFromGraphComponent(inputFormula,address);
            return;
        }

        let evaluatedValue=evaluateFormula(inputFormula);
        
        setCellUIAndCellProp(evaluatedValue,inputFormula,address);
        addChildToParent(inputFormula);
        updateChildrenCells(address);
    }
})

function addChildToGraphComponent(formula,childAddress){
    let [crid,ccid]=decodeRIDCIDFromAddress(childAddress);
    let encodedFormula=formula.split(" ");

    for(let i=0;i<encodedFormula.length;i++){
        let asciiValue=encodedFormula[i].charCodeAt(0);

        if(asciiValue>=65 && asciiValue<=90){
            let [prid,pcid]=decodeRIDCIDFromAddress(encodedFormula[i]);
            graphComponentMatrix[prid][pcid].push([crid,ccid]);
        }
    }
}

function removeChildFromGraphComponent(formula,childAddress){
    let [crid,ccid]=decodeRIDCIDFromAddress(childAddress);
    let encodedFormula=formula.split(" ");

    for(let i=0;i<encodedFormula[i].length;i++){
        let asciiValue=encodedFormula[i].charCodeAt(0);

        if(asciiValue>=65 && asciiValue<=90){
            let [prid,pcid]=decodeRIDCIDFromAddress(encodedFormula[i]);
            let childList=graphComponentMatrix[prid][pcid];

            for(let k=0;k<childList.length;k++){
                if(childList[k][0]==crid && childList[k][1]==ccid){
                    childList.splice(k,1);
                    break;
                }
            }
        }
    }
}

function updateChildrenCells(parentAddress){
    let [parentCell,parentCellProp]=getCellAndCellProp(parentAddress);
    let children=parentCellProp.children;

    for(let i=0;i<children.length;i++){
        let childAddress=children[i];
        let [childCell,childCellProp]=getCellAndCellProp(childAddress);
        let childFormula=childCellProp.formula;
        let evaluatedValue=evaluateFormula(childFormula);
        setCellUIAndCellProp(evaluatedValue,childFormula,childAddress);
        updateChildrenCells(childAddress);
    }
}

function addChildToParent(formula){
    let childAddress=addressBar.value;
    let encodedFormula=formula.split(" ");
    
    for(let i=0;i<encodedFormula.length;i++){
        let asciiValue=encodedFormula[i].charCodeAt(0);

        if(asciiValue>=65 && asciiValue<=90){
            let [parentCell,parentCellProp]=getCellAndCellProp(encodedFormula[i]);
            parentCellProp.children.push(childAddress);
        }
    }
}
function removeChildFromParent(formula){
    let childAddress=addressBar.value;
    let encodedFormula=formula.split(" ");
    
    for(let i=0;i<encodedFormula.length;i++){
        let asciiValue=encodedFormula[i].charCodeAt(0);

        if(asciiValue>=65 && asciiValue<=90){
            let [parentCell,parentCellProp]=getCellAndCellProp(encodedFormula[i]);
            let idx=parentCellProp.children.indexOf(childAddress);
            parentCellProp.children.splice(idx,1);
        }
    }
}

function evaluateFormula(formula){
    let encodedFormula=formula.split(" ");

    for(let i=0;i<encodedFormula.length;i++){
        let asciiValue=encodedFormula[i].charCodeAt(0);
        
        if(asciiValue>=65 && asciiValue<=90){
            let [cell,cellProp]=getCellAndCellProp(encodedFormula[i]);
            encodedFormula[i]=cellProp.value;
        }
    }
    let decodedFormula=encodedFormula.join(" ");
    return eval(decodedFormula);
}

function setCellUIAndCellProp(evaluatedValue,formula,address){
    let [cell,cellProp]=getCellAndCellProp(address);
    cell.innerText=evaluatedValue;
    cellProp.value=evaluatedValue;
    cellProp.formula=formula;
}