// Elective Chemistry pages. Scope is 108課綱加深加廣選修 only.
(function(){
const A=chemA,Q=chemQ,C=chemC,P=chemP;
function add(page){CHEMISTRY_REFERENCE_PAGES[page.id]=page;const meta=CHEMISTRY_REFERENCE_TRACKS.elective.pages.find(x=>x.id===page.id);if(meta)meta.implemented=true}

add(P('elec-matter-energy','elective',1,'物質與能量','#6f5ca8',[],[
 C('gas-advanced',1,'氣體與分壓',28,154,452,455,'side',[
  Q(1,'理想氣體假設分子本身體積可忽略，且分子間除碰撞外沒有顯著 {{0}}。',A('作用力','分子間作用力')),
  Q(2,'真實氣體在較 {{0}} 壓、較高溫時通常更接近理想氣體。',A('低','低壓')),
  Q(3,'混合氣體的總壓等於各成分 {{0}} 之和。',A('分壓','partial pressure')),
  Q(4,'理想混合氣體中，成分 i 的分壓可寫成 Pᵢ = {{0}}Ptotal。',A('x_i','xi','莫耳分率','mole fraction'))
 ],['gas-particles','partial-pressure','ideal-real']),
 C('solution-advanced',2,'溶液、莫耳分率與氣體溶解',496,154,476,455,'side',[
  Q(5,'莫耳分率 xᵢ = 成分 i 的莫耳數 ÷ {{0}}。',A('總莫耳數','全部莫耳數')),
  Q(6,'在一定溫度、低濃度近似下，氣體在液體中的溶解度通常隨該氣體分壓 {{0}}。',A('增加','增大','上升')),
  Q(7,'固體溶解度對溫度的影響依物質而異，因此必須由 {{0}} 判讀，而不能一概而論。',A('溶解度曲線','圖表','溶解度圖')),
  Q(8,'飽和溶液與未溶固體共存時屬於一種 {{0}} 平衡。',A('動態','溶解','溶解－結晶'))
 ],['henry','solubility-curve','solution-beaker']),
 C('thermochemistry',3,'反應焓、生成熱與燃燒熱',28,630,944,352,'wide',[
  Q(9,'定壓下反應吸放熱常以焓變 ΔH 表示；放熱反應 ΔH {{0}} 0。',A('<','小於','＜')),
  Q(10,'標準莫耳生成熱定義為由元素的 {{0}} 態生成 1 mol 化合物的焓變。',A('標準','最穩定標準')),
  Q(11,'莫耳燃燒熱描述 1 mol 物質完全燃燒時的 {{0}}。',A('焓變','反應熱','熱量變化')),
  Q(12,'利用生成熱計算反應焓時，可用 ΣΔHf°(生成物) − {{0}}。',A('ΣΔHf°(反應物)','反應物生成熱總和'))
 ],['energy-exo-endo','formation-combustion']),
 C('hess-calorimetry',4,'赫斯定律、量熱與鍵能',28,1000,944,340,'wide',[
  Q(13,'赫斯定律成立的原因是焓屬於 {{0}} 函數，只與初末狀態有關。',A('狀態','state')),
  Q(14,'若反應式反向，對應的 ΔH 必須 {{0}}；若反應式乘 k，ΔH 也乘 k。',A('變號','改變正負號','乘以-1')),
  Q(15,'簡單量熱中常用 q = mcΔT；其中 c 為 {{0}}。',A('比熱','specific heat capacity','比熱容')),
  Q(16,'估算反應焓時，可用「斷鍵所需能量 − {{0}}」近似。',A('成鍵釋放能量','形成鍵釋放的能量','成鍵能量'))
 ],['hess-cycle','calorimeter','bond-energy-basic'])
 ],['gas-particles','partial-pressure','ideal-real','henry','solubility-curve','solution-beaker','energy-exo-endo','formation-combustion','hess-cycle','calorimeter','bond-energy-basic'],['PV=nRT','Pi=xiPtotal','ΔH','q=mcΔT','Hess law'],
 ['理想氣體','真實氣體','分壓定律','莫耳分率','氣體溶解與壓力','溶解平衡','反應焓','標準生成熱','莫耳燃燒熱','赫斯定律','量熱','鍵能估算']));

add(P('elec-structure-rate','elective',2,'物質構造與反應速率','#417fa4',[],[
 C('atomic-model',1,'能階、光譜與量子模型',28,154,452,455,'side',[
  Q(1,'波耳模型以離散的 {{0}} 解釋氫原子光譜。',A('能階','energy levels')),
  Q(2,'電子由高能階降到低能階時會 {{0}} 光子；反向躍遷則需吸收能量。',A('放出','放射','釋放')),
  Q(3,'氫原子光譜的波數可由 Rydberg 關係式描述，核心是兩能階的 {{0}} 差。',A('能量','能階能量')),
  Q(4,'現代原子模型以 {{0}} 描述找到電子的機率分布，而非固定圓形軌道。',A('軌域','orbital'))
 ],['atom-structure','bohr-spectrum']),
 C('quantum-config',2,'軌域、量子數與電子組態',496,154,476,455,'side',[
  Q(5,'四個量子數 n、l、mₗ、mₛ 分別描述主能階、軌域形狀、方向與電子 {{0}}。',A('自旋','spin')),
  Q(6,'s 軌域大致呈球形；p 軌域通常呈 {{0}} 形並有三種方向。',A('啞鈴','雙葉','dumbbell')),
  Q(7,'Pauli 不相容原理指出同一軌域最多容納 {{0}} 個自旋相反電子。',A('2','兩')),
  Q(8,'Hund 規則指出同能量軌域先讓電子分別 {{0}} 佔據，再成對。',A('單獨','單一','分開'))
 ],['orbital-shapes','quantum-table','orbital-filling']),
 C('periodic-bonding',3,'週期趨勢、分子形狀與作用力',28,630,944,352,'wide',[
  Q(9,'同週期由左至右，有效核電荷增加，原子半徑整體趨勢通常 {{0}}。',A('減小','變小','下降')),
  Q(10,'同週期由左至右，第一游離能與電負度整體趨勢通常 {{0}}。',A('增加','上升','變大')),
  Q(11,'VSEPR 以價層電子域間 {{0}} 最小化來預測分子形狀。',A('排斥','repulsion')),
  Q(12,'判斷分子極性除了鍵極性，還必須考慮分子 {{0}} 與偶極向量是否抵消。',A('形狀','幾何形狀','geometry')),
  Q(13,'分子間作用力由弱到強的常見比較包含 London 分散力、偶極－偶極與 {{0}}。',A('氫鍵','hydrogen bond','氫鍵作用'))
 ],['periodic-trends','vsepr','polarity','imf']),
 C('rate-advanced',4,'速率定律、級數與反應途徑',28,1000,944,340,'wide',[
  Q(14,'一般速率定律可寫為 rate = k[A]^m[B]^n，其中 m、n 通常要由 {{0}} 決定。',A('實驗','實驗數據')),
  Q(15,'總反應級數為各濃度指數的 {{0}}。',A('總和','和')),
  Q(16,'催化劑會改變反應 {{0}} 並降低活化能，但不改變反應物與生成物的能量差。',A('途徑','機構','pathway')),
  Q(17,'升高溫度會使具有 E ≥ Ea 的粒子比例 {{0}}，因此速率常增加。',A('增加','上升','變大')),
  Q(18,'酵素可視為生物催化劑；其專一性通常與活性部位的 {{0}} 有關。',A('結構','形狀','立體構形'))
 ],['rate-law','activation-advanced','collision-model'])
 ],['atom-structure','bohr-spectrum','orbital-shapes','quantum-table','orbital-filling','periodic-trends','vsepr','polarity','imf','rate-law','activation-advanced','collision-model'],['Rydberg relation','rate=k[A]^m[B]^n'],
 ['波耳模型','氫原子光譜','Rydberg關係','軌域','四個量子數','s/p/d軌域','Aufbau','Pauli','Hund','電子組態','價電子','週期趨勢','原子半徑','游離能','電負度','VSEPR','分子極性','分子間作用力','速率定律','反應級數','催化作用','酵素']));

add(P('elec-equilibrium-1','elective',3,'化學反應與平衡一','#4f9372',[],[
 C('dynamic-k',1,'動態平衡與平衡常數',28,154,452,455,'side',[
  Q(1,'達平衡時正、逆反應速率 {{0}}，但反應並未停止。',A('相等','相同')),
  Q(2,'對 aA+bB⇌cC+dD，Kc 可寫成生成物濃度冪次乘積除以 {{0}}。',A('反應物濃度冪次乘積','反應物項')),
  Q(3,'純固體與純液體的活度在常見平衡式中視為常數，因此通常 {{0}} K 表達式。',A('不寫入','省略','不列入')),
  Q(4,'平衡常數 K 在固定反應式下主要受 {{0}} 影響。',A('溫度','temperature'))
 ],['equilibrium-graph','kc-expression']),
 C('q-lechatelier',2,'反應商 Q 與平衡移動',496,154,476,455,'side',[
  Q(5,'若 Q<K，系統會朝 {{0}} 方向反應以增加 Q。',A('生成物','正反應','右')),
  Q(6,'若 Q>K，系統會朝 {{0}} 方向反應。',A('反應物','逆反應','左')),
  Q(7,'對有氣體莫耳數差的平衡，壓縮體積通常使平衡偏向氣體莫耳數較 {{0}} 的一側。',A('少','較少')),
  Q(8,'催化劑可使系統更快到達平衡，但不改變 K，也不改變 {{0}}。',A('平衡位置','平衡組成'))
 ],['q-vs-k','lechatelier-advanced']),
 C('solubility',3,'溶解平衡、Ksp 與沉澱',28,630,944,352,'wide',[
  Q(9,'難溶鹽 MX(s)⇌M⁺+X⁻ 的 Ksp 由平衡時離子濃度的 {{0}} 表示。',A('乘積','濃度乘積')),
  Q(10,'比較離子積 Qsp 與 Ksp：若 Qsp>{{0}}，常預期會形成沉澱。',A('Ksp','K_sp')),
  Q(11,'加入共同離子常使難溶鹽的溶解度 {{0}}，稱為同離子效應。',A('降低','下降','變小')),
  Q(12,'沉澱分離可利用不同鹽類的 {{0}} 差異選擇性析出離子。',A('溶解度','Ksp','溶度積'))
 ],['ksp','common-ion','solubility-curve']),
 C('acid-equilibrium',4,'水的自解離與酸鹼平衡',28,1000,944,340,'wide',[
  Q(13,'水自解離可寫成 H₂O⇌H⁺+OH⁻；25°C 時 Kw={{0}}。',A('[H+][OH-]','[H⁺][OH⁻]')),
  Q(14,'pH = {{0}}；pOH = −log[OH⁻]。',A('-log[H+]','−log[H⁺]','-log[H⁺]')),
  Q(15,'弱酸 HA 的 Ka 越大，代表在同條件下酸性通常越 {{0}}。',A('強','大')),
  Q(16,'共軛酸鹼對彼此只相差 {{0}}。',A('一個H+','一個H⁺','一個質子')),
  Q(17,'弱酸鹽的陰離子可能與水反應生成 OH⁻，此現象稱為鹽類 {{0}}。',A('水解','hydrolysis'))
 ],['water-autoion','ka-kb','salt-hydrolysis'])
 ],['equilibrium-graph','kc-expression','q-vs-k','lechatelier-advanced','ksp','common-ion','solubility-curve','water-autoion','ka-kb','salt-hydrolysis'],['Kc','Q','Ksp','Kw=[H⁺][OH⁻]','pH=−log[H⁺]','Ka','Kb'],
 ['動態平衡','平衡常數','Kc表達式','反應商Q','勒沙特列原理','壓力體積效應','溫度效應','催化劑與平衡','Ksp','離子積','沉澱判斷','同離子效應','水自解離','Kw','pH','pOH','Ka','Kb','共軛酸鹼對','鹽類水解']));

add(P('elec-equilibrium-2','elective',4,'化學反應與平衡二','#b06c45',[],[
 C('titration-buffer',1,'滴定、當量點與緩衝',28,154,452,455,'side',[
  Q(1,'酸鹼滴定的當量點是酸與鹼依反應係數恰好 {{0}} 的狀態。',A('完全反應','反應完全','等量反應')),
  Q(2,'當量點不一定 pH=7；弱酸－強鹼滴定的當量點通常 pH {{0}} 7。',A('大於','>','＞')),
  Q(3,'典型緩衝溶液由弱酸與其 {{0}}，或弱鹼與其共軛酸組成。',A('共軛鹼','conjugate base')),
  Q(4,'緩衝液加入少量 H⁺ 時，主要由其中的 {{0}} 消耗 H⁺。',A('共軛鹼','弱酸的共軛鹼'))
 ],['titration-setup','titration-curves','buffer-action']),
 C('indicator-commonion',2,'指示劑與共離子效應',496,154,476,455,'side',[
  Q(5,'酸鹼指示劑在特定 pH 範圍改變顏色，選擇指示劑時應讓其變色範圍接近滴定曲線的 {{0}} 區。',A('陡變','急遽變化','垂直')),
  Q(6,'在弱酸 HA / A⁻ 緩衝中加入 A⁻ 會抑制 HA 解離，屬於 {{0}} 效應。',A('同離子','共離子','common ion')),
  Q(7,'少量強酸加入緩衝液後，pH 改變較純水 {{0}}。',A('小','較小')),
  Q(8,'滴定曲線可用來判斷當量點附近 pH 變化與適合的 {{0}}。',A('指示劑','indicator'))
 ],['indicator-range','buffer-action','titration-curves']),
 C('galvanic',3,'原電池、標準電位與電池',28,630,944,352,'wide',[
  Q(9,'原電池陽極發生 {{0}}，陰極發生還原。',A('氧化','oxidation')),
  Q(10,'電子經外電路由 {{0}} 流向陰極。',A('陽極','anode')),
  Q(11,'鹽橋中的陰離子通常移向 {{0}} 槽，以維持電中性；陽離子移向陰極槽。',A('陽極','anode')),
  Q(12,'標準電池電位 E°cell = E°cathode − {{0}}。',A('E°anode','E°陽極','陽極還原電位')),
  Q(13,'在標準條件下，E°cell>0 通常表示以該方向寫出的氧化還原反應具有 {{0}} 趨勢。',A('自發','自發反應'))
 ],['galvanic-cell','saltbridge','cell-potential','battery']),
 C('electrolysis',4,'電解、電鍍與氧化還原滴定',28,1000,944,340,'wide',[
  Q(14,'電解槽需要外加電能驅動原本非自發的 {{0}} 反應。',A('氧化還原','redox')),
  Q(15,'不論原電池或電解槽，陽極都發生 {{0}}，陰極都發生還原。',A('氧化','oxidation')),
  Q(16,'電鍍時待鍍物通常接為 {{0}} 極，使金屬離子在其表面還原析出。',A('陰','陰極','cathode')),
  Q(17,'電鍍層金屬若作可溶性陽極，會在陽極發生 {{0}} 進入溶液。',A('氧化','溶解','氧化溶解')),
  Q(18,'氧化還原滴定藉已知濃度氧化劑或還原劑與待測物的 {{0}} 比定量分析。',A('電子轉移','反應莫耳','化學計量'))
 ],['electrolysis','electroplating','redox-titration'])
 ],['titration-setup','titration-curves','buffer-action','indicator-range','galvanic-cell','saltbridge','cell-potential','battery','electrolysis','electroplating','redox-titration'],['E°cell=E°cathode−E°anode'],
 ['酸鹼滴定','當量點','滴定曲線','指示劑','緩衝溶液','緩衝機制','同離子效應','原電池','陽極','陰極','電子流','鹽橋','標準還原電位','電池電位','自發性','常見電池','電解','電鍍','氧化還原滴定']));

add(P('elec-organic-tech','elective',5,'有機化學與應用科技','#8d648b',[],[
 C('functional',1,'官能基、命名與烴類',28,154,452,455,'side',[
  Q(1,'烷、烯、炔的主要差異在碳碳鍵分別以單鍵、雙鍵與 {{0}} 為特徵。',A('三鍵','碳碳三鍵')),
  Q(2,'鹵烷可寫作 R–X；醇可寫作 R–OH；醛的官能基常寫作 {{0}}。',A('-CHO','－CHO','CHO')),
  Q(3,'酮的羰基位於碳鏈中間；羧酸含 {{0}} 官能基。',A('-COOH','－COOH','羧基')),
  Q(4,'胺常含 –NH₂ 類官能基；醯胺常含 {{0}}。',A('-CONH2','－CONH₂','醯胺基'))
 ],['functional-map-advanced','hydrocarbon-series']),
 C('isomer-reaction',2,'異構物與常見反應路徑',496,154,476,455,'side',[
  Q(5,'具有相同分子式但原子連接方式不同的化合物稱為 {{0}} 異構物。',A('結構','結構異構','constitutional')),
  Q(6,'醇氧化可依結構生成醛、酮或進一步生成 {{0}}。',A('羧酸','carboxylic acid')),
  Q(7,'羧酸與醇在適當條件下可進行 {{0}} 反應生成酯和水。',A('酯化','esterification')),
  Q(8,'烯類的碳碳雙鍵可進行 {{0}} 反應，使兩個原子或基團加到雙鍵兩端。',A('加成','addition'))
 ],['isomer','organic-path']),
 C('polymer-material',3,'聚合物、合金與液晶',28,630,944,352,'wide',[
  Q(9,'由含雙鍵單體開鍵連成長鏈、且通常不產生小分子的聚合稱為 {{0}} 聚合。',A('加成','addition polymerization')),
  Q(10,'聚合過程若同時產生 H₂O、HCl 等小分子，常屬於 {{0}} 聚合。',A('縮合','condensation polymerization')),
  Q(11,'合金可藉不同原子取代或進入金屬晶格間隙，改變材料的 {{0}}。',A('性質','機械性質','材料性質')),
  Q(12,'液晶具有液體流動性與部分方向性有序，性質介於晶體與 {{0}} 之間。',A('液體','一般液體'))
 ],['polymer-types','alloy','liquid-crystal']),
 C('advanced-tech',4,'奈米、氫能與生物分子連結',28,1000,944,340,'wide',[
  Q(13,'奈米尺度材料因表面積／體積比高與量子效應，可能呈現不同於巨觀材料的 {{0}}。',A('性質','物理化學性質')),
  Q(14,'氫作為能源載體時，需要先由其他能源 {{0}}，因此不能把氫直接視為一次能源來源。',A('製取','製造','產生')),
  Q(15,'燃料電池可把燃料的化學能直接轉換成 {{0}} 能。',A('電','電能')),
  Q(16,'蛋白質主鏈含醯胺（胜肽）鍵；核酸由核苷酸單元組成，說明有機官能基會影響生物分子的 {{0}}。',A('結構與功能','結構','功能')),
  Q(17,'材料或化學科技的選擇應同時考慮性能、成本、供應、生命週期與 {{0}}。',A('環境影響','環境衝擊','永續性'))
 ],['nano-scale','hydrogen-tech','biomolecule-links'])
 ],['functional-map-advanced','hydrocarbon-series','isomer','organic-path','polymer-types','alloy','liquid-crystal','nano-scale','hydrogen-tech','biomolecule-links'],['valid structural formulas'],
 ['碳鍵結','結構式','官能基','烷類','烯類','炔類','芳香族','鹵烷','醇','酚','醚','醛','酮','羧酸','酯','胺','醯胺','命名原則','結構異構物','有機反應','加成反應','氧化反應','酯化','加成聚合','縮合聚合','合金','液晶','奈米材料','氫能','燃料電池','生物分子連結']));
})();
