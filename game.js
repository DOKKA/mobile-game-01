/* Core game logic for Sweet Swipe */
const BOARD_SIZE = 8;
const CANDY_TYPES = ["red","blue","green","yellow","purple","orange"];
let board=[];
let score=0,moves=20;
const gameEl=document.getElementById('game');
const scoreEl=document.getElementById('score');
const movesEl=document.getElementById('moves');
const highScoreEl=document.getElementById('high-score');
let highScore = parseInt(localStorage.getItem('highScore')) || 0;
const modal=document.getElementById('modal');
const modalText=document.getElementById('modal-text');
const playAgain=document.getElementById('play-again');
const helpButton=document.getElementById('how-to-button');
const helpModal=document.getElementById('help-modal');
const closeHelp=document.getElementById('close-help');
let cursor=0,selected=null;
let isProcessingMove=false;
let isGameOverState=false;

function randomCandy(){return CANDY_TYPES[Math.floor(Math.random()*CANDY_TYPES.length)];}
function index(x,y){return y*BOARD_SIZE+x;}
function coords(i){return {x:i%BOARD_SIZE,y:Math.floor(i/BOARD_SIZE)};}
function emoji(type){return{red:"🍓",blue:"💎",green:"🍇",yellow:"🍋",purple:"🍫",orange:"🍬"}[type];}

function createCell(type){const d=document.createElement('div');d.className='candy '+type;d.textContent=emoji(type);return d;}
function setCandy(i,type){const cell=board[i];cell.type=type;cell.el.className='candy '+type;cell.el.textContent=emoji(type);}

function calculateScore(matches){
  let points=0;
  matches.forEach(m=>{
    points+=m.length*10;
    if(m.length===4)points+=10;
    if(m.length>=5)points+=20;
  });
  return points;
}

function init(){
  gameEl.innerHTML='';
  board=[];
  isProcessingMove=false;
  isGameOverState=false;
  for(let y=0;y<BOARD_SIZE;y++){
    for(let x=0;x<BOARD_SIZE;x++){
      let t=randomCandy();
      let el=createCell(t);
      gameEl.appendChild(el);
      board.push({type:t,el});
    }
  }
  // ensure the initial board has no matches without scoring
  let m=findMatches();
  while(m.length){
    for(const group of m){
      for(const i of group){
        setCandy(i, randomCandy());
      }
    }
    m=findMatches();
  }
  highScore = parseInt(localStorage.getItem('highScore')) || highScore;
  score=0;
  moves=20;
  updateHUD();
  cursor=0;
  selected=null;
  updateCursor();
}

function updateHUD(){
  scoreEl.textContent=score;
  movesEl.textContent=moves;
  highScoreEl.textContent=highScore;
}
function updateCursor(){board.forEach(c=>c.el.classList.remove('cursor','selected'));board[cursor].el.classList.add('cursor');if(selected!==null)board[selected].el.classList.add('selected');}

function swap(i1,i2){let t=board[i1].type;setCandy(i1,board[i2].type);setCandy(i2,t);} 

function findMatches(){let matches=[]; // horizontal
for(let y=0;y<BOARD_SIZE;y++){let run=[index(0,y)];for(let x=1;x<BOARD_SIZE;x++){let i=index(x,y);let prev=index(x-1,y);if(board[i].type===board[prev].type){run.push(i);}else{if(run.length>=3)matches.push([...run]);run=[i];}}if(run.length>=3)matches.push([...run]);}
// vertical
for(let x=0;x<BOARD_SIZE;x++){let run=[index(x,0)];for(let y=1;y<BOARD_SIZE;y++){let i=index(x,y);let prev=index(x,y-1);if(board[i].type===board[prev].type){run.push(i);}else{if(run.length>=3)matches.push([...run]);run=[i];}}if(run.length>=3)matches.push([...run]);}
return matches;}

async function removeMatchedCandies(matches){
  const promises=[];
  const seen=new Set();
  for(const m of matches){
    for(const idx of m){
      if(board[idx].type===null||seen.has(idx))continue;
      seen.add(idx);
      const el=board[idx].el;
      el.style.animation='fade-out 0.3s forwards';
      promises.push(new Promise(res=>{
        el.addEventListener('animationend',()=>{
          el.style.animation='';
          setCandy(idx,null);
          el.style.opacity='0';
          res();
        },{once:true});
      }));
      board[idx].type=null;
    }
  }
  if(promises.length)await Promise.all(promises);
}

async function dropAndFillCandiesAnimated(){
  const cellH=gameEl.offsetHeight/BOARD_SIZE;
  if(!cellH){
    for(let i=0;i<board.length;i++)if(board[i].type===null){setCandy(i,randomCandy());board[i].el.style.opacity='1';}
    return;
  }
  let changed=true;
  while(changed){
    changed=false;
    let drops=[];
    for(let x=0;x<BOARD_SIZE;x++){
      for(let y=BOARD_SIZE-2;y>=0;y--){
        let from=index(x,y);let to=index(x,y+1);
        if(board[from].type!==null&&board[to].type===null){
          const t=board[from].type;
          const el=board[from].el;
          el.style.transition=`transform 0.15s ease-in`;
          el.style.transform=`translateY(${cellH}px)`;
          drops.push(new Promise(r=>{
            el.addEventListener('transitionend',()=>{
              el.style.transition='';
              el.style.transform='';
              setCandy(to,t);
              board[to].el.style.opacity='1';
              setCandy(from,null);
              board[from].el.style.opacity='0';
              r();
            },{once:true});
          }));
          board[to].type=t;
          board[from].type=null;
          changed=true;
        }
      }
    }
    if(drops.length){
      await Promise.all(drops);
      continue;
    }
    let fills=[];
    for(let x=0;x<BOARD_SIZE;x++){
      let top=index(x,0);
      if(board[top].type===null){
        const t=randomCandy();
        board[top].type=t;
        const el=board[top].el;
        setCandy(top,t);
        el.style.transform=`translateY(-${cellH}px)`;
        el.style.opacity='1';
        requestAnimationFrame(()=>{
          el.style.transition='transform 0.25s ease-out';
          el.style.transform='translateY(0)';
        });
        fills.push(new Promise(r=>{
          el.addEventListener('transitionend',()=>{
            el.style.transition='';
            el.style.transform='';
            r();
          },{once:true});
        }));
        changed=true;
      }
    }
    if(fills.length)await Promise.all(fills);
  }
}

async function processMatchesAndRefill(){
  let current=findMatches();
  while(current.length){
    score+=calculateScore(current);
    if(score>highScore){
      highScore=score;
      localStorage.setItem('highScore',highScore);
    }
    updateHUD();
    playPop();
    await removeMatchedCandies(current);
    await dropAndFillCandiesAnimated();
    current=findMatches();
  }
}

async function processSwap(i1,i2){
  if(isProcessingMove||moves<=0)return;
  isProcessingMove=true;
  swap(i1,i2);
  let m=findMatches();
  if(m.length){
    board[i1].el.classList.add('swap-success');
    board[i2].el.classList.add('swap-success');
    await wait(150);
    board[i1].el.classList.remove('swap-success');
    board[i2].el.classList.remove('swap-success');
    moves--;
    updateHUD();
    await processMatchesAndRefill();
    if(moves<=0&&!isGameOverState)gameOver();
  }else{
    swap(i1,i2);
  }
  isProcessingMove=false;
  updateCursor();
}

function gameOver(){
  isGameOverState=true;
  if(score>=highScore){
    modalText.textContent='New high score: '+score+'!';
  }else{
    modalText.textContent='Final score: '+score;
  }
  modal.classList.remove('hidden');
}
playAgain.addEventListener('click',()=>{modal.classList.add('hidden');init();});
helpButton.addEventListener('click',()=>{helpModal.classList.remove('hidden');});
closeHelp.addEventListener('click',()=>{helpModal.classList.add('hidden');});

function getCellIndexFromEvent(e){let idx=[...gameEl.children].indexOf(e.target.closest('.candy'));return idx;}
let startIndex=null,startX=0,startY=0;

gameEl.addEventListener('pointerdown',e=>{startIndex=getCellIndexFromEvent(e);startX=e.clientX;startY=e.clientY;});
gameEl.addEventListener('pointerup',e=>{if(startIndex===null)return;let dx=e.clientX-startX;let dy=e.clientY-startY;let abs=Math.abs;let dir; if(abs(dx)>abs(dy)){dir=dx>0?1:-1;dy=0;dx=dir;}else{dir=dy>0?BOARD_SIZE:-BOARD_SIZE;dx=0;dy=dir/BOARD_SIZE;}let target=startIndex+(dir); if(target>=0 && target<BOARD_SIZE*BOARD_SIZE && Math.abs((target%BOARD_SIZE)-(startIndex%BOARD_SIZE))<=1){processSwap(startIndex,target);}startIndex=null;});

window.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){if(cursor%BOARD_SIZE>0)cursor--;updateCursor();}else if(e.key==='ArrowRight'){if(cursor%BOARD_SIZE<BOARD_SIZE-1)cursor++;updateCursor();}else if(e.key==='ArrowUp'){if(cursor>=BOARD_SIZE)cursor-=BOARD_SIZE;updateCursor();}else if(e.key==='ArrowDown'){if(cursor<BOARD_SIZE*(BOARD_SIZE-1))cursor+=BOARD_SIZE;updateCursor();}else if(e.key===' '){if(selected===null){selected=cursor;}else{processSwap(selected,cursor);selected=null;}updateCursor();}});

function wait(ms){return new Promise(r=>setTimeout(r,ms));}

init();
