/* Core game logic for Sweet Swipe */
const BOARD_SIZE = 8;
const CANDY_TYPES = ["red","blue","green","yellow","purple","orange"];
let board=[];
let score=0,moves=20;
const gameEl=document.getElementById('game');
const scoreEl=document.getElementById('score');
const movesEl=document.getElementById('moves');
const modal=document.getElementById('modal');
const playAgain=document.getElementById('play-again');
let cursor=0,selected=null;

function randomCandy(){return CANDY_TYPES[Math.floor(Math.random()*CANDY_TYPES.length)];}
function index(x,y){return y*BOARD_SIZE+x;}
function coords(i){return {x:i%BOARD_SIZE,y:Math.floor(i/BOARD_SIZE)};}
function emoji(type){return{red:"🍓",blue:"💎",green:"🍇",yellow:"🍋",purple:"🍫",orange:"🍬"}[type];}

function createCell(type){const d=document.createElement('div');d.className='candy '+type;d.textContent=emoji(type);return d;}
function setCandy(i,type){const cell=board[i];cell.type=type;cell.el.className='candy '+type;cell.el.textContent=emoji(type);} 

function init(){gameEl.innerHTML='';board=[];for(let y=0;y<BOARD_SIZE;y++){for(let x=0;x<BOARD_SIZE;x++){let t=randomCandy();let el=createCell(t);gameEl.appendChild(el);board.push({type:t,el});}}
score=0;moves=20;updateHUD();cursor=0;updateCursor();resolveMatches();}

function updateHUD(){scoreEl.textContent=score;movesEl.textContent=moves;}
function updateCursor(){board.forEach(c=>c.el.classList.remove('cursor','selected'));board[cursor].el.classList.add('cursor');if(selected!==null)board[selected].el.classList.add('selected');}

function swap(i1,i2){let t=board[i1].type;setCandy(i1,board[i2].type);setCandy(i2,t);} 

function findMatches(){let matches=[]; // horizontal
for(let y=0;y<BOARD_SIZE;y++){let run=[index(0,y)];for(let x=1;x<BOARD_SIZE;x++){let i=index(x,y);let prev=index(x-1,y);if(board[i].type===board[prev].type){run.push(i);}else{if(run.length>=3)matches.push([...run]);run=[i];}}if(run.length>=3)matches.push([...run]);}
// vertical
for(let x=0;x<BOARD_SIZE;x++){let run=[index(x,0)];for(let y=1;y<BOARD_SIZE;y++){let i=index(x,y);let prev=index(x,y-1);if(board[i].type===board[prev].type){run.push(i);}else{if(run.length>=3)matches.push([...run]);run=[i];}}if(run.length>=3)matches.push([...run]);}
return matches;}

async function clearMatches(matches){let cleared=0;for(let m of matches){for(let i of m){board[i].el.style.animation='fade-out 0.2s forwards';board[i].type=null;cleared++;}}await wait(200);for(let i=0;i<board.length;i++){if(board[i].type===null){setCandy(i,null);board[i].el.style.opacity='0';}}
score+=cleared*10;updateHUD();playPop();return cleared;}

async function applyGravity(){for(let x=0;x<BOARD_SIZE;x++){for(let y=BOARD_SIZE-1;y>=0;y--){let i=index(x,y);if(board[i].type===null){let yy=y-1;while(yy>=0&&board[index(x,yy)].type===null)yy--;if(yy>=0){setCandy(i,board[index(x,yy)].type);board[index(x,yy)].type=null;}else{setCandy(i,randomCandy());}}}}}

async function resolveMatches(){while(true){let m=findMatches();if(!m.length)break;await clearMatches(m);await applyGravity();}}

async function attemptSwap(i1,i2){if(moves<=0)return;swap(i1,i2);let m=findMatches();if(m.length){moves--;updateHUD();await resolveMatches();if(moves<=0)gameOver();}else{swap(i1,i2);}updateCursor();}

function gameOver(){modal.classList.remove('hidden');}
playAgain.addEventListener('click',()=>{modal.classList.add('hidden');init();});

function getCellIndexFromEvent(e){let idx=[...gameEl.children].indexOf(e.target.closest('.candy'));return idx;}
let startIndex=null,startX=0,startY=0;

gameEl.addEventListener('pointerdown',e=>{startIndex=getCellIndexFromEvent(e);startX=e.clientX;startY=e.clientY;});
gameEl.addEventListener('pointerup',e=>{if(startIndex===null)return;let dx=e.clientX-startX;let dy=e.clientY-startY;let abs=Math.abs;let dir; if(abs(dx)>abs(dy)){dir=dx>0?1:-1;dy=0;dx=dir;}else{dir=dy>0?BOARD_SIZE:-BOARD_SIZE;dx=0;dy=dir/BOARD_SIZE;}let target=startIndex+(dir); if(target>=0 && target<BOARD_SIZE*BOARD_SIZE && Math.abs((target%BOARD_SIZE)-(startIndex%BOARD_SIZE))<=1){attemptSwap(startIndex,target);}startIndex=null;});

window.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){if(cursor%BOARD_SIZE>0)cursor--;updateCursor();}else if(e.key==='ArrowRight'){if(cursor%BOARD_SIZE<BOARD_SIZE-1)cursor++;updateCursor();}else if(e.key==='ArrowUp'){if(cursor>=BOARD_SIZE)cursor-=BOARD_SIZE;updateCursor();}else if(e.key==='ArrowDown'){if(cursor<BOARD_SIZE*(BOARD_SIZE-1))cursor+=BOARD_SIZE;updateCursor();}else if(e.key===' '){if(selected===null){selected=cursor;}else{attemptSwap(selected,cursor);selected=null;}updateCursor();}});

function wait(ms){return new Promise(r=>setTimeout(r,ms));}

init();
