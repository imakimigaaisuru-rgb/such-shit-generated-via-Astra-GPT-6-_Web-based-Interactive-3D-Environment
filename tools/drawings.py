from pathlib import Path
import html, json, zipfile

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'dist/assets'
C='#263e40'; ACC='#994b3c'; LIGHT='#dedfd5'
def txt(x,y,s,size=16,anchor='start',color=C):
    return f'<text x="{x}" y="{y}" font-size="{size}" text-anchor="{anchor}" fill="{color}">{html.escape(str(s))}</text>'
def line(x,y,a,b,w=1.5,color=C,dash=''):
    return f'<line x1="{x}" y1="{y}" x2="{a}" y2="{b}" stroke="{color}" stroke-width="{w}" stroke-dasharray="{dash}"/>'
def rect(x,y,w,h,fill='none',stroke=C,sw=1.5):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"/>'
def dim(x,y,a,b,label):
    s=line(x,y,a,b,.8,ACC)
    if y==b:
        s+=line(x,y-6,x,y+6,1,ACC)+line(a,b-6,a,b+6,1,ACC)+txt((x+a)/2,y-9,label,14,'middle',ACC)
    else:
        s+=line(x-6,y,x+6,y,1,ACC)+line(a-6,b,a+6,b,1,ACC)+txt(x-12,(y+b)/2,label,14,'end',ACC)
    return s
def sheet(name,no,title,body):
    s='<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 1200 848"><rect width="1200" height="848" fill="#f5f3eb"/><g font-family="Noto Sans CJK TC,Microsoft JhengHei,sans-serif">'
    s+=txt(45,48,'彼岸 水霧居',25)+txt(45,74,'HIGAN WATER HOUSE / CONCEPT DESIGN',11)+txt(1155,47,no+'   '+title,21,'end')+line(45,94,1155,94)
    s+=body+line(45,790,1155,790)+txt(45,817,'REV.02 · 2026.09 · 單位 m · 依標註尺寸；示意非施工圖',13)+txt(1155,817,'未完成結構／地質／洪水及機電驗證',13,'end',ACC)+'</g></svg>'
    (OUT/(name+'.svg')).write_text(s)

# Plan coordinates are identical to the model: x [-4,4], z [-3,3].
S=70; X=lambda x:110+(x+4)*S; Y=lambda z:160+(z+3)*S
b=txt(110,133,'主屋外緣 8.00 × 6.00 m',15)
b+=rect(X(-4),Y(-3),8*S,6*S,'#ebe8dc',C,3)
# Openings cut the wall line; secondary lines indicate glazing.
for z,opens in [(3,[(-3.25,-1.1),(-.65,.65),(1.1,3.25)]),(-3,[(-2.8,-1.3),(.7,1.6)])]:
    for a,c in opens:
        b+=line(X(a),Y(z),X(c),Y(z),7,'#f5f3eb')
        if not (z==3 and a==-.65): b+=line(X(a),Y(z)-2,X(c),Y(z)-2,.7)+line(X(a),Y(z)+2,X(c),Y(z)+2,.7)
for x in [-4,4]:
    b+=line(X(x),Y(-.6),X(x),Y(1.6),7,'#f5f3eb')+line(X(x)-2,Y(-.6),X(x)-2,Y(1.6),.7)+line(X(x)+2,Y(-.6),X(x)+2,Y(1.6),.7)
for a,c in [(-4,-1.45),(-.45,.6),(1.5,2.75),(3.65,4)]: b+=rect(X(a),Y(0)-4,(c-a)*S,8,'#84908b',C,.6)
for x in [0,2.2]:b+=rect(X(x)-4,Y(-3),8,3*S,'#84908b',C,.6)
for x,z,w in [(-1.98,.09,1),(.05,.09,.9),(2.3,.09,.9),(-1.28,3.12,1.2)]:b+=rect(X(x-w/2),Y(z),w*S,4,'#8c694b',C,.6)
for x in [-3.9,-1.3,1.3,3.9]:
    for z in [-2.9,0,2.9]:b+=rect(X(x)-6,Y(z)-6,12,12,'#4e5c56')
# Furniture positions and sizes from scene.js.
b+=rect(X(-3.35),Y(-2.705),1.8*S,2.15*S,'#e0dbc9')+rect(X(-3.31),Y(-1.83),1.72*S,1.18*S,'#bcc0a7')
for x in [-3.17,-2.37]:b+=rect(X(x),Y(-2.45),.62*S,.36*S,'#f8f5e9')
b+=rect(X(-3.55),Y(.275),2.6*S,2.35*S,'#d4d8bc','none')+rect(X(-2.875),Y(1.125),1.25*S,.75*S,'#bca17e')
b+=rect(X(3.115),Y(.43),.73*S,1.9*S,'#bca17e')+rect(X(3.24),Y(.65),.48*S,.43*S,'#e5e9e2')
b+=rect(X(1.06),Y(-2.90),1.02*S,.96*S,'#d3e3de')+rect(X(.095),Y(-2.745),.65*S,.65*S,'#d9dfd3')+rect(X(1.48),Y(-1.155),.4*S,.65*S,'#d9dfd3')
b+=rect(X(2.98),Y(-2.89),.82*S,.56*S,'#bca17e')+rect(X(3.065),Y(-2.12),.65*S,.64*S,'#d9dfd3')
b+=txt(X(-2),Y(-.5),'臥室',19,'middle')+txt(X(-2),Y(-.2),'4.00 × 3.00 分區',11,'middle')+txt(X(1.1),Y(-1.45),'衛浴',17,'middle')+txt(X(1.1),Y(-1.12),'2.20 × 3.00',11,'middle')+txt(X(3.1),Y(-.85),'機電／收納',13,'middle')+txt(X(3.1),Y(-.52),'1.80 × 3.00',10,'middle')
b+=txt(X(.2),Y(1.45),'起居・餐廚',19,'middle')+txt(X(.2),Y(1.83),'8.00 × 3.00 分區',12,'middle')
b+=rect(X(-4),Y(3),8*S,1.4*S,'#e1d5bb',C,1)
for i in range(41):b+=line(X(-4+i*.2),Y(3),X(-4+i*.2),Y(4.4),.4,'#a29a84')
b+=txt(X(-2),Y(3.85),'前廊 1.40 m',16,'middle')
for i in range(5):b+=rect(X(-.75),Y(4.4+i*.3),1.5*S,.3*S,'none',C,.8)
b+=dim(X(-4),112,X(4),112,'8.00')+dim(80,Y(-3),80,Y(3),'6.00')+dim(715,Y(3),715,Y(4.4),'1.40')
for a,c,label in [(-4,0,'4.00'),(0,2.2,'2.20'),(2.2,4,'1.80')]:b+=dim(X(a),145,X(c),145,label)
b+=line(X(.2),Y(-3)-20,X(.2),Y(4.4)+20,1,ACC,'7 5')+txt(X(.2)+8,Y(-3)-24,'A',16,color=ACC)+txt(X(.2)+8,Y(4.4)+24,'A',16,color=ACC)
b+=txt(820,165,'平面閱讀',20)
notes=['N ↑（本案假設北向）','外牆厚度：0.16 m','內隔間厚度：0.12 m','入口開口：1.30 m','臥室門洞：1.00 m','衛浴／設備门洞：0.90 m','床：1.80 × 2.15 m','階梯：5 級 × 0.15 m','踏面深：0.30 m','主屋面積：48.0 m²','前廊面積：11.2 m²','標示為分區毛尺寸，','非扣除牆體後的淨尺寸。','門片示意為滑門開啟位置。']
for i,s in enumerate(notes):b+=txt(820,202+i*29,s,14)
sheet('plan','A-01','平面配置',b)

# Front and side elevations share floor/eave/ridge levels.
sx=58; fx=lambda x:320+x*sx; fy=lambda y:520-y*sx
b=txt(85,135,'南向正立面（朝水岸）',19)+line(60,fy(.3),615,fy(.3),1)
b+=rect(fx(-4),fy(1.05),8*sx,.75*sx,'#b8bcaf')+rect(fx(-4),fy(3.9),8*sx,2.85*sx,'#e6dfcb')
for x in [-3.9,-1.3,1.3,3.9]:b+=rect(fx(x)-4,fy(3.9),8,(3.9-.85)*sx,'#69513c')
b+=rect(fx(-4.75),fy(6.2),9.5*sx,(6.2-3.5)*sx,'#c2b194')
for y in [3.5,3.9,4.3,4.7,5.1,5.5,5.9,6.2]:b+=line(fx(-4.75),fy(y),fx(4.75),fy(y),.5,'#9f8a6c')
for a,c in [(-3.25,-1.1),(1.1,3.25)]:
    b+=rect(fx(a),fy(3.05),(c-a)*sx,1.45*sx,'#dae3da')
    for i in range(10):b+=line(fx(a+(c-a)*i/9),fy(1.6),fx(a+(c-a)*i/9),fy(3.05),.7)
b+=rect(fx(-.65),fy(3.2),1.3*sx,2.15*sx,'#a79980')
b+=rect(fx(-4.25),fy(3.3),8.5*sx,.11*sx,'#827053')
for x in [-3.9,-1.3,1.3,3.9]:b+=line(fx(x),fy(1.05),fx(x),fy(3.3),5,'#69513c')
for side in [(-4,-1),(1,4)]:b+=line(fx(side[0]),fy(2.15),fx(side[1]),fy(2.15),3)
for i in range(5):b+=rect(fx(-.75),fy(.45+i*.15),1.5*sx,.15*sx,'#bfc2b4')
b+=dim(fx(-4),552,fx(4),552,'8.00 主屋')+txt(84,603,'簷下柱、屋架、基礎對位；屋面外觀材料待防火與重量評估。',13)
xx=lambda z:830+z*43; yy=lambda y:520-y*43
b+=txt(720,135,'東向側立面',19)+line(680,yy(.3),1135,yy(.3),1)
b+=rect(xx(-3),yy(1.05),6*43,.75*43,'#b8bcaf')+rect(xx(-3),yy(3.9),6*43,2.85*43,'#e6dfcb')
b+=f'<polygon points="{xx(-3.8)},{yy(3.5)} {xx(0)},{yy(6.2)} {xx(3.8)},{yy(3.5)}" fill="#c2b194" stroke="{C}"/>'
b+=rect(xx(-.6),yy(3.1),2.2*43,1.45*43,'#d7e1d8')+line(xx(2.9),yy(3.73),xx(4.55),yy(3.21),5,'#827053')
b+=line(xx(4.2),yy(.3),xx(4.2),yy(3.3),5,'#69513c')+line(xx(3),yy(1.05),xx(4.4),yy(1.05),5)
for lev,label in [(.3,'+0.30 地坪'),(1.05,'+1.05 樓地板'),(3.9,'+3.90 簷口'),(6.2,'+6.20 屋脊')]:b+=line(1080,yy(lev),1130,yy(lev),.7,ACC)+txt(1140,yy(lev)-7,label,11,'end',ACC)
b+=dim(xx(-3),552,xx(3),552,'6.00')+txt(720,603,'標高為相對模型基準，非基地測量標高。',13)
for i,s in enumerate(['材料意向：深色木構／土色壁面／茅草造型屋頂／石材基座。','施工前須核定屋頂防火、屋面自重、牆體系統及所有接頭；本圖不給出施工配筋或結構合格結論。']):b+=txt(85,685+i*30,s,14)
sheet('elevations','A-02','建築立面',b)

sx=74; X=lambda z:370+z*sx; Y=lambda y:655-y*sx
b=txt(85,135,'A—A 概念剖面／承重路徑',19)
b+=line(65,Y(.3),865,Y(.3),1.5)+rect(X(-3),Y(.74),6*sx,.44*sx,'#aeb5aa')+rect(X(-3),Y(1.05),6*sx,.3*sx,'#d4c2a2')
for z in [-2.9,0,2.9]:b+=rect(X(z)-7,Y(3.9),14,(3.9-.85)*sx,'#72563c')
b+=line(X(-2.9),Y(3.77),X(2.9),Y(3.77),16,'#72563c')
for z in [-2.9,2.9]:b+=line(X(z),Y(3.9),X(0),Y(6.02),12,'#72563c')
b+=line(X(0),Y(3.9),X(0),Y(6.02),10,'#72563c')
for sign in [-1,1]:b+=f'<polygon points="{X(0)},{Y(6.2)} {X(sign*3.8)},{Y(3.5)} {X(sign*3.8)},{Y(3.25)} {X(0)},{Y(5.95)}" fill="#c2b194" stroke="{C}"/>'
b+=rect(X(-3),Y(3.9),.16*sx,2.85*sx,'#e6dfcb')+rect(X(2.84),Y(3.9),.16*sx,2.85*sx,'#e6dfcb')
b+=line(X(2.9),Y(3.73),X(4.55),Y(3.21),8,'#72563c')+rect(X(3),Y(1.05),1.4*sx,.09*sx,'#a7845d')+rect(X(4.13),Y(3.3),.14*sx,2.42*sx,'#72563c')+rect(X(4.02),Y(.92),.36*sx,.62*sx,'#aeb5aa')
for i in range(5):b+=rect(X(4.4+i*.3),Y(1.05-i*.15),.3*sx,(.75-i*.15)*sx,'#b5bbae')
for lev,label in [(1.05,'+1.05'),(3.9,'+3.90'),(6.2,'+6.20')]:b+=line(50,Y(lev),105,Y(lev),.7,ACC)+txt(50,Y(lev)-9,label,13,color=ACC)
b+=dim(X(-3),711,X(3),711,'6.00')+dim(X(3),711,X(4.4),711,'1.40')
b+=txt(900,178,'結構協調假設',19)
notes=['柱：180 × 180 mm','梁：180 × 300 mm','柱網：約 2.60 × 2.90 m','樓板梁與屋架已示意','前廊另設柱與基礎','壁面斜撐在側牆配置','','以上僅為建模斷面，','未經承載力與變形驗算。','','待工程師確認：','木材等級、接頭、錨定','地耐力、沉陷、耐震','風壓、雪載、耐火','防潮、排水、白蟻防治']
for i,s in enumerate(notes):b+=txt(900,213+i*29,s,13)
b+=txt(70,751,'荷重路徑：屋面 → 椽／屋架 → 梁 → 柱／抗側構件 → 基礎 → 地盤。',14)
sheet('section','A-03','剖面與結構',b)

S=22; X=lambda x:430+x*S; Y=lambda z:380+z*S
b=txt(80,137,'景觀與基地概念配置',19)+rect(X(-17),Y(-11),34*S,23*S,'#e1e4d7')
b+=rect(X(-17),Y(3.4),34*S,3.2*S,'#c1d9d7','none')+txt(X(11),Y(5.2),'溪流',14)
b+=rect(X(7.75),Y(-11),2.1*S,23*S,'#d1c7af','none')+txt(X(10.5),Y(-6),'陸路進出',13)
b+=rect(X(-4.3),Y(.625),14*S,1.65*S,'#d1c7af','none')
b+=rect(X(-1),Y(-7),8*S,6*S,'#d2bd98',C,2)+txt(X(3),Y(-4),'主屋 8 × 6',16,'middle')+rect(X(-1),Y(-1),8*S,1.4*S,'#e2d4b9')
b+=rect(X(-6.5),Y(2.9),1.6*S,4.2*S,'#b27463')+txt(X(-7.7),Y(5.2),'景觀橋',13,'end')
b+=dim(X(-7.4),Y(2.9),X(-7.4),Y(7.1),'4.20')+dim(X(6.7),Y(.4),X(6.7),Y(3.4),'3.00')
for z in [2.8,7.4]:
    for i in range(45):
        x=-16+i*.7
        if abs(x+5.7)>1.4:b+=f'<circle cx="{X(x)}" cy="{Y(z)}" r="2.7" fill="{ACC}"/>'
b+=txt(880,170,'基地假設',19)
notes=['配置示意 34 × 23 m','溪流寬約 3.20 m','橋台間距 4.20 m','橋面寬 1.60 m','橋欄高約 1.15 m','前廊至近岸約 3.00 m','','此退縮僅為構圖，','不代表符合法定退縮。','','須先取得：','基地界址與高程測量','洪水位、河川管制資料','地質與岸坡穩定評估','消防及日常通行條件']
for i,s in enumerate(notes):b+=txt(880,208+i*29,s,13)
b+=txt(80,728,'N ↑  假設方位；紅點表示曼珠沙華種植帶。房屋與橋梁基礎各自獨立。',13)
sheet('site','A-04','基地配置',b)

# Plain DXF R12 linework in metres. Door/window openings represented explicitly.
entities=[]
def dl(a,b,layer='WALL'):
    entities.extend(['0','LINE','8',layer,'10',str(a[0]),'20',str(a[1]),'30','0','11',str(b[0]),'21',str(b[1]),'31','0'])
def dr(x,z,w,d,layer='WALL'):
    for a,b in [((x,z),(x+w,z)),((x+w,z),(x+w,z+d)),((x+w,z+d),(x,z+d)),((x,z+d),(x,z))]:dl(a,b,layer)
# CAD Y coordinate is north-up, reverse model Z.
for z,segs in [(3,[(-4,-3.25),(-1.1,-.65),(.65,1.1),(3.25,4)]),(-3,[(-4,-2.8),(-1.3,.7),(1.6,4)])]:
    for a,c in segs:dl((a,-z),(c,-z))
for x in [-4,4]:
    for a,c in [(-3,-.6),(1.6,3)]:dl((x,-a),(x,-c))
for a,c in [(-4,-1.45),(-.45,.6),(1.5,2.75),(3.65,4)]:dl((a,0),(c,0),'PARTITION')
for x in [0,2.2]:dl((x,0),(x,3),'PARTITION')
dr(-4,-4.4,8,1.4,'PORCH');dr(-3.35,.555,1.8,2.15,'FURNITURE');dr(3.115,-2.33,.73,1.9,'FURNITURE')
for x in [-3.9,-1.3,1.3,3.9]:
    for z in [-2.9,0,2.9]:dr(x-.09,-z-.09,.18,.18,'COLUMN')
for i in range(5):dr(-.75,-4.7-i*.3,1.5,.3,'STAIR')
for a,c,z in [(-4,4,4),(-4,0,3.6),(0,2.2,3.6),(2.2,4,3.6)]:dl((a,z),(c,z),'DIMENSION')
for x,y,s in [(-4,4.2,'8.00 m'),(-4,3.7,'4.00 m'),(0,3.7,'2.20 m'),(2.2,3.7,'1.80 m'),(-3,1.8,'BEDROOM'),(.3,1.3,'BATH'),(2.4,1.3,'UTILITY'),(-1,-1.8,'LIVING / KITCHEN'),(-4,-6.7,'UNITS: METRES - CONCEPT ONLY - NOT FOR CONSTRUCTION')]:
    entities.extend(['0','TEXT','8','ANNOTATION','10',str(x),'20',str(y),'30','0','40','.18','1',s])
dxf=['0','SECTION','2','HEADER','9','$ACADVER','1','AC1009','0','ENDSEC','0','SECTION','2','ENTITIES']+entities+['0','ENDSEC','0','EOF']
(OUT/'plan.dxf').write_text('\n'.join(dxf)+'\n')
print('Generated 4 SVG drawings and metre-scale DXF.')
