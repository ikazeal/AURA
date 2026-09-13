export type CreationHistoryAsset={id:number;url:string;selected:boolean;rarity:string};
export type CreationHistoryRecord={id:string;createdAt:number;wallet:string;collection:string;prompt:string;style:string;targetAmount:number;previewCount:number;cover:string;status:"generated"|"minted";txHash?:string;assets?:CreationHistoryAsset[];symbol?:string;itemName?:string;description?:string;rarityModel?:string};

const STORAGE_KEY="aura-creation-history-v1";

export function readCreationHistory(){
  if(typeof window==="undefined")return [] as CreationHistoryRecord[];
  try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]") as CreationHistoryRecord[]}catch{return []}
}

export function saveCreationHistory(record:CreationHistoryRecord){
  const current=readCreationHistory().filter(item=>item.id!==record.id);
  localStorage.setItem(STORAGE_KEY,JSON.stringify([record,...current].slice(0,50)));
}

export function markCreationMinted(id:string,txHash:string,wallet:string){
  const current=readCreationHistory();
  const found=current.find(item=>item.id===id);
  if(!found)return;
  saveCreationHistory({...found,status:"minted",txHash,wallet});
}
