let addSheetButton=document.querySelector(".sheet-add-icon");
let sheetFolderCont=document.querySelector(".sheets-folder-cont");

addSheetButton.addEventListener("click", (e)=>{
    let sheet=document.createElement("div");
    sheet.setAttribute("class","sheet-folder");

    let allSheetFolders=document.querySelectorAll(".sheet-folder");
    sheet.setAttribute("id",allSheetFolders.length);

    sheet.innerHTML=`
        <div class="sheet-content"> Sheet ${allSheetFolders.length+1}</div>
    `;

    sheetFolderCont.appendChild(sheet);
    sheet.scrollIntoView();

    createSheetDB();
    createGraphComponentMatrix();
    handleSheetActiveness(sheet);
    handleSheetRemoval(sheet);
    sheet.click();
})

function handleSheetDB(sheetIdx){
    sheetDB=collectedSheetDB[sheetIdx];
    graphComponentMatrix=collectedGraphComponent[sheetIdx];
}

function handleSheetRemoval(sheet){
    sheet.addEventListener("mousedown",(e)=>{
        //2 represents right click
        if(e.button!==2)
            return;
        
        let allSheetFolders=document.querySelectorAll(".sheet-folder");
        if(allSheetFolders.length===1){
            alert("You need to have atleast one sheet");
            return;
        }

        let response=confirm("Your sheet will be removed permanently, Are you sure?");
        if(response===false){
            return;
        }
        
        let sheetIdx=Number(sheet.getAttribute("id"));
        collectedSheetDB.splice(sheetIdx,1);
        collectedGraphComponent.splice(sheetIdx,1);        
        sheet.remove();

        allSheetFolders=document.querySelectorAll(".sheet-folder");
        //Index shifted after removal
        for(let i=0;i<allSheetFolders.length;i++){
            allSheetFolders[i].setAttribute("id",i);
            let sheetContent=allSheetFolders[i].querySelector(".sheet-content");
            sheetContent.innerText=`Sheet ${i+1}`;
        }

        let firstSheet=document.querySelector(".sheet-folder");
        firstSheet.click();
    })
}

function changeUIAsPerSheet(sheet){
    for(let i=0;i<rows;i++){
        for(let j=0;j<cols;j++){
            let cell = document.querySelector(`.cell[rid="${i}"][cid="${j}"]`);
            cell.click();
        }
    }

    let firstCell=document.querySelector(".cell");
    firstCell.click();
    setBackgroundForSheet(sheet);
}

function setBackgroundForSheet(sheet){
    let allSheetFolder=document.querySelectorAll(".sheet-folder");

    for(let i=0;i<allSheetFolder.length;i++){
        allSheetFolder[i].style.backgroundColor="transparent";
    }

    sheet.style.backgroundColor="#ced6e0";
}

function handleSheetActiveness(sheet){
    sheet.addEventListener("click",(e)=>{
        let sheetIdx=Number(sheet.getAttribute("id"));
        handleSheetDB(sheetIdx);
        changeUIAsPerSheet(sheet);
    });
}


function createSheetDB(){
    let sheetDB=[];

    for(let i=0;i<rows;i++){
        let sheetRow=[];
        
        for(let j=0;j<cols;j++){
            let cellProp={
                bold: false,
                italic: false,
                underline: false,
                alignment: "left",
                fontFamily: "monospace",
                fontSize: "14",
                fontColor: "#000000",
                BGcolor: "transparent",
                value:"",
                formula:"",
                children: []
            }
            sheetRow.push(cellProp);
        }
        sheetDB.push(sheetRow);
    }
    collectedSheetDB.push(sheetDB);
}

function createGraphComponentMatrix(){
    let graphComponentMatrix=[];

    for(let i=0;i<rows;i++){
        let row=[];
        for(let j=0;j<cols;j++){
            row.push([]);
        }
        graphComponentMatrix.push(row);
    }
    collectedGraphComponent.push(graphComponentMatrix);
}

// For adding the first sheet and making it active
addSheetButton.click();