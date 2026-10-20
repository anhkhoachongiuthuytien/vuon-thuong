/* A self-contained garden. All flowers are drawn once as petal sprites. */
(() => {
  'use strict';
  const canvas=document.querySelector('#garden');
  const ctx=canvas.getContext('2d');
  const roseButton=document.querySelector('#rose-touch');
  const actions=document.querySelector('#garden-actions');
  const letter=document.querySelector('#letter');
  const whisper=document.querySelector('#whisper');
  const status=document.querySelector('#status');
  const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
  const colors=[{h:338,s:62,l:57},{h:347,s:59,l:66},{h:18,s:67,l:69},{h:94,s:46,l:64},{h:194,s:64,l:64},{h:319,s:39,l:69}];
  const sprites=[];
  let width=0,height=0,dpr=1,flowers=[],drifters=[],hero,state='ready',started=0,raf=0,lastPaint=0,elapsed=0;
  let sequence=0,letterTimer=0,resizeTimer=0;
  const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
  const ease=n=>1-Math.pow(1-clamp(n),3);
  const lerp=(a,b,n)=>a+(b-a)*n;
  const hsl=(h,s,l,a=1)=>`hsla(${h},${s}%,${l}%,${a})`;
  function rng(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
  function petalSprite(color,seed){
    const random=rng(seed),size=420,c=document.createElement('canvas');c.width=c.height=size;
    const g=c.getContext('2d');g.translate(size/2,size/2);const R=181;
    // Overlapping curved petals, each with its own fold, rim and cast shadow.
    for(let ring=0;ring<13;ring++){
      const radius=R*Math.pow(.826,ring),n=ring<3?7:ring<7?6:5;
      const phase=ring*.63+(seed%5)*.15;
      for(let j=0;j<n;j++){
        const a=j*Math.PI*2/n+phase+(random()-.5)*.18;
        const r=radius*(.96+random()*.07),wide=.71+(random()-.5)*.09;
        g.save();g.rotate(a);g.translate((random()-.5)*radius*.03,0);
        const grad=g.createLinearGradient(-r*.22,-r,r*.12,r*.32);
        const bright=(ring<2?5:0)-Math.min(10,ring*.85);
        grad.addColorStop(0,hsl(color.h,color.s-8,Math.min(91,color.l+14+bright)));
        grad.addColorStop(.13,hsl(color.h,color.s-3,color.l+7+bright));
        grad.addColorStop(.50,hsl(color.h,color.s,color.l+bright-2));
        grad.addColorStop(.83,hsl(color.h+2,color.s+1,color.l-13-ring*.55));
        grad.addColorStop(1,hsl(color.h+5,color.s,color.l-24-ring*.4));
        g.beginPath();g.moveTo(-r*.46,r*.23);
        g.bezierCurveTo(-r*wide,-r*.13,-r*.61,-r*.82,-r*.17,-r*.96);
        g.bezierCurveTo(r*.05,-r*1.04,r*.39,-r*.96,r*.55,-r*.72);
        g.bezierCurveTo(r*.84,-r*.31,r*.51,r*.16,r*.12,r*.30);
        g.bezierCurveTo(-r*.05,r*.36,-r*.31,r*.36,-r*.46,r*.23);
        g.closePath();g.fillStyle=grad;
        g.shadowColor=hsl(color.h,46,25,.22);g.shadowBlur=Math.max(.8,r*.037);g.shadowOffsetY=r*.025;g.fill();
        g.shadowColor='transparent';g.strokeStyle=hsl(color.h-7,52,94,.36);g.lineWidth=Math.max(.45,r*.007);g.stroke();
        // A narrow luminous fold gives the petals their rolled paper edge.
        g.beginPath();g.moveTo(-r*.56,-r*.29);g.bezierCurveTo(-r*.48,-r*.88,-r*.06,-r*1.03,r*.28,-r*.9);
        g.strokeStyle=hsl(color.h-9,41,96,.26);g.lineWidth=Math.max(.4,r*.009);g.stroke();
        g.restore();
      }
    }
    g.beginPath();g.arc(0,0,3.8,0,Math.PI*2);g.fillStyle=hsl(color.h+8,color.s,35);g.fill();
    return c;
  }
  colors.forEach((c,i)=>{for(let variant=0;variant<2;variant++)sprites.push(petalSprite(c,17+i*23+variant*79));});
  function makeGarden(){
    const random=rng(20810),mobile=width<650;
    const count=mobile?54:Math.min(128,Math.round(width/12));
    flowers=[];
    for(let i=0;i<count;i++){
      const layer=i%4,layerT=layer/3;
      let x=(i/count+(random()-.5)*.075)*width;
      x=clamp(x,-width*.025,width*1.025);
      let y=height*lerp(.56,.94,layerT)+(random()-.5)*height*.17;
      // Leave the original blossom readable in the center of the new garden.
      if(Math.abs(x-width*.5)<width*.13&&y<height*.64)y=height*(.70+random()*.18);
      const r=(mobile?19:22)+layerT*(mobile?18:26)+random()*(mobile?10:15);
      const growDelay=.45+random()*3.1+layerT*1.5;
      flowers.push({x,y,r,baseX:x+(random()-.5)*45,baseY:height+55,phase:random()*Math.PI*2,speed:.45+random()*.45,
        curve:(random()-.5)*25,leafSide:random()>.5?1:-1,leaves:layer<2?2:3,
        delay:growDelay,duration:2+random()*1.7,sprite:Math.floor(random()*sprites.length),layer,seed:random(),bud:i%12===0});
    }
    flowers.sort((a,b)=>a.y-b.y);
    hero={x:width*.5,y:height*(mobile?.50:.52),r:Math.min(mobile?77:90,width*(mobile?.19:.075),height*.11),
      baseX:width*.5-18,baseY:height+30,phase:1.5,speed:.53,curve:10,leafSide:1,leaves:2,sprite:0,layer:2,seed:.4};
    drifters=Array.from({length:mobile?13:23},(_,i)=>({x:random()*width,y:random()*(height+80),size:3+random()*4.3,
      speed:10+random()*15,swing:12+random()*30,phase:random()*Math.PI*2,turn:.4+random()*.6,petal:i%3!==0}));
  }
  function resize(){
    width=window.innerWidth;height=document.querySelector('.experience').getBoundingClientRect().height;
    dpr=Math.min(window.devicePixelRatio||1,2);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);makeGarden();draw(performance.now());
  }
  function leaf(x,y,size,side,rotation,alpha){
    ctx.save();ctx.translate(x,y);ctx.rotate(rotation);ctx.scale(side,1);ctx.globalAlpha*=alpha;
    const grad=ctx.createLinearGradient(0,0,size,-size*.7);grad.addColorStop(0,'#28583b');grad.addColorStop(.5,'#438857');grad.addColorStop(1,'#73a469');
    ctx.beginPath();ctx.moveTo(0,0);ctx.bezierCurveTo(size*.20,-size*.62,size*.76,-size*.76,size,-size*.7);
    ctx.bezierCurveTo(size*.87,-size*.24,size*.50,size*.08,0,0);ctx.fillStyle=grad;ctx.fill();
    ctx.beginPath();ctx.moveTo(0,0);ctx.quadraticCurveTo(size*.50,-size*.39,size*.95,-size*.68);ctx.strokeStyle='#b0ca8e66';ctx.lineWidth=.55;ctx.stroke();ctx.restore();
  }
  function paintFlower(f,progress,time,isHero=false){
    if(progress<=0)return;
    const stemGrowth=ease(clamp(progress*1.16));
    const wind=motion.matches?0:Math.sin(time*.0006*f.speed+f.phase);
    const sway=wind*(isHero?3.5:3+f.layer*.6);
    const x=lerp(f.baseX,f.x+sway,stemGrowth),y=lerp(f.baseY,f.y,stemGrowth);
    const stemLength=f.baseY-y,open=ease(clamp((progress-.22)/.78));
    ctx.save();ctx.globalAlpha=clamp(progress*3);
    const stem=ctx.createLinearGradient(x,0,x+6,0);stem.addColorStop(0,'#2c6143');stem.addColorStop(1,'#71956a');
    ctx.beginPath();ctx.moveTo(f.baseX,f.baseY);ctx.bezierCurveTo(f.baseX+f.curve,f.baseY-stemLength*.36,x-f.curve*.65,y+stemLength*.35,x,y);
    ctx.strokeStyle=stem;ctx.lineWidth=isHero?1.8:1+f.r*.016;ctx.lineCap='round';ctx.stroke();
    for(let j=0;j<f.leaves;j++){
      const t=.24+j*.22;const ly=f.baseY-stemLength*t,lx=lerp(f.baseX,x,t)+Math.sin(t*3)*f.curve*.22;
      const side=j%2===0?f.leafSide:-f.leafSide;
      leaf(lx,ly,Math.min(isHero?42:29,f.r*.68)*clamp(progress*1.4),side,side*-.10,1);
    }
    // Sepals connect the bloom naturally to its stem.
    const headR=f.r*(f.bud?.46:1)*open;
    if(headR>.3){
      ctx.save();ctx.translate(x,y);ctx.rotate(sway*.005);
      ctx.fillStyle='#396e47';ctx.beginPath();ctx.moveTo(-headR*.20,headR*.48);ctx.quadraticCurveTo(-headR*.06,headR*.98,headR*.15,headR*.55);ctx.lineTo(headR*.32,headR*.40);ctx.closePath();ctx.fill();
      if(f.bud){ctx.scale(.63,1);ctx.drawImage(sprites[f.sprite],-headR,-headR,headR*2,headR*2);}
      else{ctx.drawImage(sprites[f.sprite],-headR*1.15,-headR*1.15,headR*2.3,headR*2.3);}
      ctx.restore();
    }
    ctx.restore();
  }
  function draw(now){
    if(!width||!height)return;
    ctx.clearRect(0,0,width,height);
    const t=state==='ready'?0:state==='growing'?elapsed:12;
    const rear=flowers.filter(f=>f.layer<2),front=flowers.filter(f=>f.layer>=2);
    for(const f of rear)paintFlower(f,clamp((t-f.delay)/f.duration),now);
    paintFlower(hero,1,now,true);
    for(const f of front)paintFlower(f,clamp((t-f.delay)/f.duration),now);
    paintDrifters(now);
  }
  function paintDrifters(now){
    if(motion.matches)return;
    const seconds=now*.001,visible=state==='ready'?4:drifters.length;
    for(let i=0;i<visible;i++){
      const p=drifters[i],y=(p.y+seconds*p.speed)%(height+85)-35;
      const x=(p.x+Math.sin(seconds*.42+p.phase)*p.swing+seconds*4)%(width+30)-15;
      const flutter=Math.cos(seconds*p.turn+p.phase);
      ctx.save();ctx.translate(x,y);ctx.rotate(Math.sin(seconds*.65+p.phase)*.8+.4);
      ctx.scale(.45+Math.abs(flutter)*.55,1);ctx.globalAlpha=.35+(i%4)*.09;
      if(p.petal){
        const g=ctx.createLinearGradient(-p.size,-p.size,p.size,p.size);
        g.addColorStop(0,'#efb7cb');g.addColorStop(.65,'#d783a6');g.addColorStop(1,'#bc668a');
        ctx.beginPath();ctx.moveTo(0,p.size*.9);
        ctx.bezierCurveTo(-p.size*1.2,p.size*.1,-p.size*.9,-p.size*.9,0,-p.size*.6);
        ctx.bezierCurveTo(p.size*.8,-p.size*.8,p.size*.9,p.size*.5,0,p.size*.9);
        ctx.fillStyle=g;ctx.fill();
        ctx.beginPath();ctx.moveTo(0,p.size*.7);ctx.quadraticCurveTo(p.size*.2,0,0,-p.size*.5);
        ctx.strokeStyle='#fff0e980';ctx.lineWidth=.55;ctx.stroke();
      }else{
        leaf(-p.size*.7,p.size*.5,p.size*1.7,1,-.25,1);
      }
      ctx.restore();
    }
  }
  function frame(now){
    raf=0;
    if(document.hidden)return;
    // 30fps is enough for slow botanical movement and keeps phones cool.
    if(now-lastPaint>32){if(state==='growing')elapsed=(now-started)/1000;draw(now);lastPaint=now;}
    if(!motion.matches||state==='growing')raf=requestAnimationFrame(frame);
  }
  function run(){if(!raf&&!document.hidden)raf=requestAnimationFrame(frame);}
  function setState(next){state=next;document.body.dataset.state=next;}
  function bloom(){
    const token=++sequence;clearTimeout(letterTimer);if(letter.open)letter.close();
    actions.hidden=true;roseButton.hidden=true;whisper.textContent='Từ một bông hoa, cả khu vườn đang thức giấc…';
    status.textContent='Khu vườn đang nở hoa. Một tấm thiệp đang chờ bạn.';
    setState('growing');elapsed=0;started=performance.now();run();
    const duration=motion.matches?80:8100;
    letterTimer=setTimeout(()=>{
      if(token!==sequence)return;setState('garden');elapsed=12;actions.hidden=false;
      status.textContent='Cả khu vườn đã nở. Bạn có thể đọc thiệp hoặc cho hoa nở lại.';
      draw(performance.now());
      if(motion.matches){document.querySelector('#read-letter').focus();}
      else openLetter();
    },duration);
  }
  function openLetter(){
    if(letter.open)return;
    letter.showModal();document.querySelector('#view-garden').focus({preventScroll:true});
    status.textContent='Tấm thiệp dành cho bạn đã mở.';
  }
  function closeLetter(){letter.close();document.querySelector('#read-letter').focus({preventScroll:true});}
  roseButton.addEventListener('click',()=>{if(state==='ready')bloom();});
  document.querySelector('#read-letter').addEventListener('click',openLetter);
  document.querySelector('#replay').addEventListener('click',bloom);
  document.querySelector('#close-letter').addEventListener('click',closeLetter);
  document.querySelector('#view-garden').addEventListener('click',closeLetter);
  letter.addEventListener('click',e=>{if(e.target===letter){const r=letter.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeLetter();}});
  letter.addEventListener('cancel',e=>{e.preventDefault();closeLetter();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){if(raf)cancelAnimationFrame(raf);raf=0;}else run();});
  window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(resize,100);});
  motion.addEventListener('change',()=>{if(motion.matches&&state==='growing'){clearTimeout(letterTimer);sequence++;setState('garden');actions.hidden=false;status.textContent='Khu vườn đã nở. Chọn Đọc lại thiệp để đọc lời chúc.';}draw(performance.now());run();});
  // A shared link may carry only a recipient and sender; never interpret HTML.
  const params=new URLSearchParams(location.search),to=params.get('to')?.trim().slice(0,50),from=params.get('from')?.trim().slice(0,50);
  if(to){document.querySelector('#salutation').textContent=`Gửi ${to} thương mến,`;document.querySelector('.dedication').textContent=`Dành ${to}, cả một vườn thương.`;}
  if(from){const signature=document.querySelector('#signature');signature.replaceChildren(document.createTextNode(`Thương mến, ${from}`));}
  resize();run();
})();
